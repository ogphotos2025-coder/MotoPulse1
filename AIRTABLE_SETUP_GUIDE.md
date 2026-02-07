# MotoPulse - Airtable Backend Setup Guide

## Overview
This guide helps you set up the Airtable database for MotoPulse, which will store ride data and integrate with Make.com for automated SMS alerts.

## Airtable Base Structure

### Table: Live_Rides

Create a table with the following fields:

| Field Name | Field Type | Description |
|------------|------------|-------------|
| Rider_ID | Autonumber | Unique identifier for each ride |
| Rider_Name | Single line text | Name of the rider |
| Status | Single select | Options: "Cruising", "Mechanical Help", "Home Safe" |
| Planned_Route_URL | URL | Google Maps or GPX link |
| Return_Time | Date | Hard return deadline (with time) |
| Contact_Phone | Phone number | Emergency contact number |
| Bike_Details | Single line text | Bike description (optional) |
| Is_Active | Checkbox | TRUE if ride is ongoing |
| Start_Time | Date | When the ride started |
| End_Time | Date | When the ride ended (if completed) |
| Latitude | Number | Last known latitude |
| Longitude | Number | Last known longitude |
| Alert_Sent | Checkbox | TRUE if emergency SMS was sent |

### Setting Up Single Select Options

For the **Status** field, configure these options:
- 🟢 Cruising (Green)
- 🟡 Mechanical Help (Yellow)  
- 🏠 Home Safe (Blue)

## Connecting Your Web App to Airtable

### Option 1: Airtable API (Recommended for Production)

1. **Get your API Key:**
   - Go to https://airtable.com/account
   - Generate a personal access token
   - Store it securely (never commit to GitHub)

2. **Get your Base ID:**
   - Open your base
   - Click "Help" → "API documentation"
   - Find your base ID (starts with "app")

3. **Update the web app:**

Create a new file called `airtable-config.js`:

```javascript
// airtable-config.js
const AIRTABLE_CONFIG = {
    apiKey: 'YOUR_PERSONAL_ACCESS_TOKEN',
    baseId: 'YOUR_BASE_ID',
    tableName: 'Live_Rides'
};

// Add to app.js
async function saveRideToAirtable(ride) {
    const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fields: {
                'Rider_Name': ride.riderName,
                'Status': ride.status === 'cruising' ? 'Cruising' : 'Mechanical Help',
                'Planned_Route_URL': ride.routeUrl,
                'Return_Time': ride.returnTime,
                'Contact_Phone': ride.emergencyContact,
                'Bike_Details': ride.bikeDetails,
                'Is_Active': true,
                'Start_Time': ride.startTime,
                'Latitude': ride.latitude || 0,
                'Longitude': ride.longitude || 0
            }
        })
    });
    
    return await response.json();
}

async function updateRideStatus(recordId, status) {
    const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}/${recordId}`;
    
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fields: {
                'Status': status,
                'Is_Active': status !== 'Home Safe',
                'End_Time': status === 'Home Safe' ? new Date().toISOString() : null
            }
        })
    });
    
    return await response.json();
}

async function fetchActiveRides() {
    const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}?filterByFormula={Is_Active}=1`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`
        }
    });
    
    const data = await response.json();
    return data.records;
}
```

### Option 2: Use Softr or Glide (No-Code)

Both Softr and Glide have native Airtable integrations:

**Softr:**
1. Connect your Airtable base
2. Use the "Form" block for Flight Plan intake
3. Use the "Map" block for Battle Map view
4. Map the fields directly

**Glide:**
1. Start a new app from Airtable
2. Create a form screen for ride submission
3. Create a map component filtered by `Is_Active = true`
4. Add inline lists for ride history

## Testing Your Setup

### Test Data Template

Add these sample records to test:

| Rider_Name | Status | Return_Time | Contact_Phone | Is_Active |
|------------|--------|-------------|---------------|-----------|
| Alex Demo | Cruising | [2 hours from now] | +1-555-0001 | ✓ |
| Jordan Test | Mechanical Help | [1 hour from now] | +1-555-0002 | ✓ |

### Verification Checklist

- [ ] Can create new rides through the form
- [ ] Rides appear in Airtable within 5 seconds
- [ ] Status toggle updates the Airtable record
- [ ] "End Ride" marks Is_Active as FALSE
- [ ] Active rides appear on Battle Map
- [ ] Emergency contact phone numbers are formatted correctly

## Security Best Practices

1. **Never expose your API key in client-side code**
   - Use environment variables
   - Implement a backend proxy (e.g., Netlify Functions, Vercel Serverless)

2. **Use Airtable's built-in sharing:**
   - For read-only Battle Map, share a filtered view
   - Keep write access restricted

3. **Validate phone numbers:**
   - Ensure correct format for SMS delivery
   - Use international format: +1-555-123-4567

## Next Steps

After setting up Airtable:
1. Continue to `MAKE_AUTOMATION_GUIDE.md` for the Guardian automation
2. Set up Twilio for SMS alerts
3. Deploy your web app to a hosting platform

## Troubleshooting

**Problem:** "Unauthorized" errors
- Solution: Verify your API key and base ID are correct

**Problem:** Fields not saving
- Solution: Check that field names match exactly (case-sensitive)

**Problem:** Can't see active rides on map
- Solution: Verify `Is_Active` is set to TRUE (checked)

## Support Resources

- Airtable API Docs: https://airtable.com/developers/web/api/introduction
- Airtable Community: https://community.airtable.com
- MotoPulse GitHub Issues: [Your repo URL]
