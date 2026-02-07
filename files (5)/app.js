// MotoPulse App - Main JavaScript

// Configuration
const SMS_SERVER_URL = 'http://localhost:3000'; // URL for the SMS backend server

// State Management
const AppState = {
    currentRide: null,
    rideHistory: [],
    activeRiders: [],
    stats: {
        totalRides: 0,
        safeReturns: 0,
        helpedRiders: 0
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initializeNavigation();
    initializeFlightPlanForm();
    initializeActiveRidePanel();
    initializeBattleMap();
    renderStats();
    renderHistory();
    
    // Simulate some active riders for demo
    if (AppState.activeRiders.length === 0) {
        generateDemoRiders();
    }
});

// Local Storage Functions
function loadFromStorage() {
    const stored = localStorage.getItem('motopulse_data');
    if (stored) {
        const data = JSON.parse(stored);
        AppState.currentRide = data.currentRide || null;
        AppState.rideHistory = data.rideHistory || [];
        AppState.stats = data.stats || { totalRides: 0, safeReturns: 0, helpedRiders: 0 };
        AppState.activeRiders = data.activeRiders || [];
    }
}

function saveToStorage() {
    localStorage.setItem('motopulse_data', JSON.stringify(AppState));
}

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show corresponding view
            const viewName = link.getAttribute('data-view');
            showView(viewName);
        });
    });
}

function showView(viewName) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));
    
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Refresh data for specific views
    if (viewName === 'battle-map') {
        renderActiveRiders();
    } else if (viewName === 'my-rides') {
        renderStats();
        renderHistory();
    }
}

// Flight Plan Form
function initializeFlightPlanForm() {
    const form = document.getElementById('rider-route-form');
    const panel = document.getElementById('active-ride-panel');
    
    // Check if there's an active ride
    if (AppState.currentRide) {
        form.style.display = 'none';
        panel.style.display = 'block';
        updateActiveRidePanel();
        startCountdown();
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        startRide();
    });
}

function startRide() {
    const riderName = document.getElementById('rider-name').value;
    const routeUrl = document.getElementById('route-url').value;
    const returnTime = document.getElementById('return-time').value;
    const emergencyContact = document.getElementById('emergency-contact').value;
    const bikeDetails = document.getElementById('bike-details').value;
    const status = document.querySelector('input[name="status"]:checked').value;
    
    // Create ride object
    const ride = {
        id: Date.now(),
        riderName,
        routeUrl,
        returnTime,
        emergencyContact,
        bikeDetails,
        status,
        startTime: new Date().toISOString(),
        isActive: true
    };
    
    AppState.currentRide = ride;
    AppState.stats.totalRides++;
    
    // Add to active riders list
    AppState.activeRiders.push({
        ...ride,
        latitude: 34.0522 + (Math.random() - 0.5) * 0.1, // Demo coordinates
        longitude: -118.2437 + (Math.random() - 0.5) * 0.1
    });
    
    saveToStorage();
    
    // Update UI
    document.getElementById('rider-route-form').style.display = 'none';
    document.getElementById('active-ride-panel').style.display = 'block';
    updateActiveRidePanel();
    startCountdown();
    
    showToast('Flight plan filed! Ride safe! 🏍️', 'success');
}

function updateActiveRidePanel() {
    const ride = AppState.currentRide;
    if (!ride) return;
    
    const returnDate = new Date(ride.returnTime);
    document.getElementById('active-return-time').textContent = 
        returnDate.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit' 
        });
    
    document.getElementById('active-route-link').href = ride.routeUrl;
    
    const statusBadge = document.getElementById('current-status');
    statusBadge.className = `ride-status ${ride.status === 'cruising' ? 'green' : 'yellow'}`;
    statusBadge.innerHTML = `<span class="status-dot"></span> ${
        ride.status === 'cruising' ? 'Cruising' : 'Mechanical Help'
    }`;
}

function startCountdown() {
    // Clear any existing countdown
    if (window.countdownInterval) {
        clearInterval(window.countdownInterval);
    }
    
    window.countdownInterval = setInterval(() => {
        if (!AppState.currentRide) {
            clearInterval(window.countdownInterval);
            return;
        }
        
        const now = new Date().getTime();
        const returnTime = new Date(AppState.currentRide.returnTime).getTime();
        const distance = returnTime - now;
        
        if (distance < 0) {
            document.getElementById('countdown').textContent = 'OVERDUE';
            document.getElementById('countdown').style.color = 'var(--danger)';
            
            // In production, this would trigger the Guardian automation
            if (!AppState.currentRide.alertSent) {
                showToast('⚠️ Return time passed! Emergency contact would be notified.', 'warning');
                sendEmergencySMS(AppState.currentRide); // Trigger SMS
                AppState.currentRide.alertSent = true;
                saveToStorage();
            }
            return;
        }
        
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('countdown').textContent = 
            `${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

// Function to send emergency SMS
async function sendEmergencySMS(ride) {
    if (!ride || !ride.emergencyContact) {
        console.error('Cannot send SMS: Missing ride or emergency contact details.');
        return;
    }

    const message = `URGENT: MotoPulse Alert! ${ride.riderName} (Bike: ${ride.bikeDetails || 'N/A'}) is OVERDUE for return at ${new Date(ride.returnTime).toLocaleTimeString()}. Last known status: ${ride.status}. Please check on them. Route: ${ride.routeUrl}`;

    try {
        const response = await fetch(`${SMS_SERVER_URL}/send-sms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to: ride.emergencyContact, message: message }),
        });

        const result = await response.json();
        if (result.success) {
            console.log('Emergency SMS sent successfully!');
            showToast('Emergency SMS sent to contact!', 'success');
        } else {
            console.error('Failed to send emergency SMS:', result.message);
            showToast(`Failed to send emergency SMS: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error sending emergency SMS:', error);
        showToast('Error sending emergency SMS. Check server.', 'error');
    }
}

// Active Ride Panel Controls
function initializeActiveRidePanel() {
    const toggleStatusBtn = document.getElementById('toggle-status-btn');
    const endRideBtn = document.getElementById('end-ride-btn');
    
    if (toggleStatusBtn) {
        toggleStatusBtn.addEventListener('click', toggleRideStatus);
    }
    
    if (endRideBtn) {
        endRideBtn.addEventListener('click', endRide);
    }
}

function toggleRideStatus() {
    if (!AppState.currentRide) return;
    
    AppState.currentRide.status = 
        AppState.currentRide.status === 'cruising' ? 'mechanical' : 'cruising';
    
    // Update in active riders list
    const riderIndex = AppState.activeRiders.findIndex(r => r.id === AppState.currentRide.id);
    if (riderIndex !== -1) {
        AppState.activeRiders[riderIndex].status = AppState.currentRide.status;
    }
    
    saveToStorage();
    updateActiveRidePanel();
    
    const message = AppState.currentRide.status === 'mechanical' 
        ? '🟡 Status changed to Mechanical Help' 
        : '🟢 Status changed to Cruising';
    showToast(message, 'success');
}

function endRide() {
    if (!AppState.currentRide) return;
    
    if (!confirm('End your ride and mark yourself as home safe?')) {
        return;
    }
    
    // Stop countdown
    if (window.countdownInterval) {
        clearInterval(window.countdownInterval);
    }
    
    // Add to history
    AppState.rideHistory.unshift({
        ...AppState.currentRide,
        endTime: new Date().toISOString(),
        completedSafely: true
    });
    
    // Remove from active riders
    AppState.activeRiders = AppState.activeRiders.filter(
        r => r.id !== AppState.currentRide.id
    );
    
    AppState.stats.safeReturns++;
    AppState.currentRide = null;
    
    saveToStorage();
    
    // Reset UI
    document.getElementById('rider-route-form').style.display = 'block';
    document.getElementById('active-ride-panel').style.display = 'none';
    document.getElementById('rider-route-form').reset();
    
    showToast('✅ Ride ended safely! Welcome home!', 'success');
}

// Battle Map
let map;
let markers = [];

function initializeBattleMap() {
    // Initialize the map
    const mapElement = document.getElementById('map');
    if (mapElement) {
        map = new google.maps.Map(mapElement, {
            zoom: 12,
            center: { lat: 34.0522, lng: -118.2437 }, // LA area default
            styles: [
                {
                    "featureType": "all",
                    "elementType": "labels.text.fill",
                    "stylers": [{ "color": "#616161" }] // Dark gray text
                },
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{ "color": "#E0E0E0" }] // Light gray water
                },
                {
                    "featureType": "landscape",
                    "elementType": "geometry",
                    "stylers": [{ "color": "#F5F5F5" }] // Very light gray landscape
                },
                {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [{ "color": "#FFFFFF" }] // White roads
                }
            ]
        });
    }

    // Auto-refresh the map every 10 seconds
    setInterval(renderActiveRiders, 10000);

    renderActiveRiders();
}

function renderActiveRiders() {
    const ridersGrid = document.getElementById('riders-grid');
    if (!ridersGrid) return;

    // Simulate rider movement for demo purposes
    AppState.activeRiders.forEach(rider => {
        rider.latitude += (Math.random() - 0.5) * 0.005;
        rider.longitude += (Math.random() - 0.5) * 0.005;
    });
    
    ridersGrid.innerHTML = '';
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    if (AppState.activeRiders.length === 0) {
        return;
    }
    
    // Add markers to map
    let bounds = new google.maps.LatLngBounds();
    
    AppState.activeRiders.forEach(rider => {
        const card = createRiderCard(rider);
        ridersGrid.appendChild(card);
        
        // Add marker to map
        const markerColor = rider.status === 'cruising' ? '00D084' : 'FFC107';
        const marker = new google.maps.Marker({
            position: { lat: rider.latitude, lng: rider.longitude },
            map: map,
            title: rider.riderName,
            icon: `http://maps.google.com/mapfiles/ms/icons/${markerColor === '00D084' ? 'green' : 'yellow'}-dot.png`,
            animation: google.maps.Animation.DROP
        });
        
        // Info window for marker
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="color: #000; padding: 8px;">
                    <strong>${rider.riderName}</strong><br>
                    Status: ${rider.status === 'cruising' ? '🟢 Cruising' : '🟡 Mechanical Help'}<br>
                    Bike: ${rider.bikeDetails || 'Not specified'}<br>
                    ETA: ${new Date(rider.returnTime).toLocaleTimeString()}
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        markers.push(marker);
        bounds.extend(marker.getPosition());
    });
    
    // Fit map to show all markers
    if (AppState.activeRiders.length > 0) {
        map.fitBounds(bounds);
    }
}

function createRiderCard(rider) {
    const card = document.createElement('div');
    card.className = 'rider-card';
    
    const statusColor = rider.status === 'cruising' ? 'green' : 'yellow';
    const statusText = rider.status === 'cruising' ? 'Cruising' : 'Needs Mechanical Help';
    
    card.innerHTML = `
        <div class="rider-card-header">
            <h4 class="rider-name">${rider.riderName}</h4>
            <span class="status-badge ${statusColor}">
                <span class="status-dot"></span>
                ${rider.status === 'cruising' ? '🟢' : '🟡'}
            </span>
        </div>
        <div class="rider-card-body">
            <p><strong>Bike:</strong> ${rider.bikeDetails || 'Not specified'}</p>
            <p><strong>ETA:</strong> ${new Date(rider.returnTime).toLocaleTimeString()}</p>
            <p><strong>Started:</strong> ${new Date(rider.startTime).toLocaleTimeString()}</p>
        </div>
        <div class="rider-card-actions">
            <button class="btn-secondary btn-small" onclick="viewRiderRoute('${rider.routeUrl}')">
                View Route
            </button>
            ${rider.status === 'mechanical' ? `
                <button class="btn-primary btn-small" onclick="offerHelp('${rider.riderName}', ${rider.latitude}, ${rider.longitude})">
                    Offer Help
                </button>
            ` : ''}
        </div>
    `;
    
    return card;
}

function viewRiderRoute(url) {
    window.open(url, '_blank');
}

function offerHelp(riderName, lat, lng) {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    
    if (confirm(`Navigate to help ${riderName}?`)) {
        AppState.stats.helpedRiders++;
        saveToStorage();
        window.open(mapsUrl, '_blank');
        showToast(`🦸 Hero mode activated! Navigate to ${riderName}`, 'success');
    }
}

// Generate Demo Riders
function generateDemoRiders() {
    const demoNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Riley'];
    const demoBikes = [
        'Black Kawasaki Ninja',
        'Red Ducati Monster',
        'Blue Yamaha R6',
        'Silver BMW S1000RR',
        'Green Suzuki GSX-R'
    ];
    
    for (let i = 0; i < 3; i++) {
        const returnTime = new Date();
        returnTime.setHours(returnTime.getHours() + Math.floor(Math.random() * 3) + 1);
        
        AppState.activeRiders.push({
            id: Date.now() + i,
            riderName: demoNames[i],
            routeUrl: 'https://maps.google.com',
            returnTime: returnTime.toISOString(),
            emergencyContact: '+1 (555) 000-0000',
            bikeDetails: demoBikes[i],
            status: i === 1 ? 'mechanical' : 'cruising',
            startTime: new Date().toISOString(),
            isActive: true,
            latitude: 34.0522 + (Math.random() - 0.5) * 0.2,
            longitude: -118.2437 + (Math.random() - 0.5) * 0.2
        });
    }
    
    saveToStorage();
}

// Stats & History
function renderStats() {
    document.getElementById('total-rides').textContent = AppState.stats.totalRides;
    document.getElementById('safe-returns').textContent = AppState.stats.safeReturns;
    document.getElementById('helped-riders').textContent = AppState.stats.helpedRiders;
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    if (AppState.rideHistory.length === 0) {
        historyList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--gray-300);">
                <p style="font-size: 1.2rem; margin-bottom: 1rem;">No ride history yet</p>
                <p>Your completed rides will appear here</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = '';
    
    AppState.rideHistory.forEach(ride => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const startDate = new Date(ride.startTime);
        const endDate = new Date(ride.endTime);
        
        item.innerHTML = `
            <div>
                <div class="history-date">
                    ${startDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                    })}
                </div>
                <div class="history-route">
                    ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}
                </div>
                <div style="margin-top: 0.5rem; color: var(--gray-300); font-size: 0.9rem;">
                    ${ride.bikeDetails || 'Bike not specified'}
                </div>
            </div>
            <div>
                <a href="${ride.routeUrl}" target="_blank" class="info-link">View Route</a>
            </div>
        `;
        
        historyList.appendChild(item);
    });
}

// Toast Notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `<div class="toast-message">${message}</div>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 4000);
}

// Utility Functions
function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Export for external use
window.MotoPulse = {
    viewRiderRoute,
    offerHelp,
    showToast
};
