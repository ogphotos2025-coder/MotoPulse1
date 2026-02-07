# MotoPulse - Make.com "Guardian" Automation Guide

## Overview
This guide walks you through setting up the automated SMS alert system that notifies emergency contacts when a rider fails to check in by their return time.

## Prerequisites

- Airtable base set up (see AIRTABLE_SETUP_GUIDE.md)
- Twilio account with phone number
- Make.com account (free tier works)

## Part 1: Twilio Setup

### 1. Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free trial account
3. Verify your phone number

### 2. Get Your Credentials
1. From the Twilio Console dashboard:
   - **Account SID**: Copy this value
   - **Auth Token**: Click to reveal and copy
2. Get a phone number:
   - Navigate to Phone Numbers → Manage → Buy a number
   - Choose a number with SMS capability
   - Save the number (format: +1-555-123-4567)

### 3. Verify Trial Numbers
If using a trial account:
- Go to Phone Numbers → Manage → Verified Caller IDs
- Add the emergency contact numbers you'll be testing with
- Each number must verify via SMS before receiving alerts

## Part 2: Make.com Scenario Setup

### Scenario Name: "MotoPulse Guardian - Overdue Ride Checker"

### Module 1: Schedule Trigger

**Module:** Schedule → Every X minutes
- **Interval:** 15 minutes
- **Start immediately:** Yes

### Module 2: Airtable - Search Records

**Connection:** Connect your Airtable account

**Settings:**
- **Base:** [Your MotoPulse base]
- **Table:** Live_Rides
- **Formula:** 
```
AND(
  {Is_Active} = 1,
  IS_BEFORE({Return_Time}, NOW()),
  {Alert_Sent} = 0
)
```
- **Max records:** 100

**What this does:** Finds all active rides where:
- The ride is still active (Is_Active = TRUE)
- The return time has passed (Return_Time < NOW)
- An alert hasn't been sent yet (Alert_Sent = FALSE)

### Module 3: Iterator

**Module:** Flow Control → Iterator
- **Array:** Output from Module 2 (Airtable records)

**What this does:** Processes each overdue ride individually

### Module 4: Twilio - Send SMS

**Connection:** Connect your Twilio account using Account SID and Auth Token

**Settings:**
- **From:** [Your Twilio phone number]
- **To:** `{{2.fields.Contact_Phone}}`
- **Message:** 
```
🚨 MotoPulse Alert

Rider {{2.fields.Rider_Name}} has missed their check-in time.

Return Time: {{formatDate(2.fields.Return_Time; "MMM DD, YYYY h:mm A")}}
Current Status: {{2.fields.Status}}

Planned Route:
{{2.fields.Planned_Route_URL}}

Last Known Location:
https://www.google.com/maps?q={{2.fields.Latitude}},{{2.fields.Longitude}}

Please attempt to contact the rider immediately.

- MotoPulse Safety System
```

### Module 5: Airtable - Update Record

**Connection:** Same Airtable connection

**Settings:**
- **Base:** [Your MotoPulse base]
- **Table:** Live_Rides
- **Record ID:** `{{2.id}}`
- **Fields to Update:**
  - **Alert_Sent:** TRUE (checkbox)

**What this does:** Marks the record as "alert sent" so duplicate alerts aren't sent

### Optional Module 6: Webhook (for logging)

**Module:** Webhooks → Custom webhook response

**Settings:**
- **Status:** 200
- **Body:** 
```json
{
  "alert_sent": true,
  "rider": "{{2.fields.Rider_Name}}",
  "timestamp": "{{now}}"
}
```

## Part 3: Testing Your Automation

### Test Scenario 1: Overdue Ride

1. **Create a test ride in Airtable:**
   - Rider_Name: "Test Rider"
   - Status: "Cruising"
   - Return_Time: [Set to 5 minutes ago]
   - Contact_Phone: [Your verified phone number]
   - Is_Active: TRUE (checked)
   - Alert_Sent: FALSE (unchecked)

2. **Manually run the scenario:**
   - In Make.com, click "Run once"
   - Wait for execution

3. **Verify:**
   - Check your phone for the SMS
   - Verify Alert_Sent is now TRUE in Airtable

### Test Scenario 2: Multiple Overdue Rides

1. Create 2-3 test rides with different return times (all past)
2. Run the scenario
3. Verify each emergency contact receives their respective SMS

### Test Scenario 3: Already Alerted (No Duplicate)

1. Use the same test ride from Test 1 (Alert_Sent = TRUE)
2. Run the scenario again
3. Verify NO SMS is sent (because Alert_Sent = TRUE)

## Part 4: Production Deployment

### Activate the Scenario
1. In Make.com, toggle the scenario to "ON"
2. The automation will now run every 15 minutes automatically

### Monitoring
- **Operations used:** Track in Make.com dashboard
- **Free tier limit:** 1,000 operations/month
- **Each check uses:** ~3-5 operations per overdue ride

### Cost Estimation
- **Make.com Free:** 1,000 operations/month (enough for ~200 alerts)
- **Twilio SMS:** $0.0075 per message (US)
- **Monthly cost for 50 alerts:** ~$0.38

## SMS Message Template Variations

### Standard Alert
```
🚨 MotoPulse Alert
Rider {{Rider_Name}} missed check-in.
Return: {{Return_Time}}
Route: {{Route_URL}}
Location: {{Maps_Link}}
```

### Mechanical Help Status
```
🟡 MotoPulse Alert
Rider {{Rider_Name}} needs MECHANICAL HELP and missed check-in.
This may be a breakdown situation.
Route: {{Route_URL}}
Location: {{Maps_Link}}
```

### Severe Overdue (>2 hours)
```
🚨🚨 URGENT MotoPulse Alert
Rider {{Rider_Name}} is {{Hours_Overdue}} hours overdue.
Last Status: {{Status}}
Route: {{Route_URL}}
Location: {{Maps_Link}}
Consider contacting authorities.
```

## Advanced Features

### Feature 1: Escalating Alerts

Add a second scenario that runs 30 minutes after the first alert:

**Module 1: Airtable Search**
- Formula: `AND({Is_Active}=1, {Alert_Sent}=1, IS_BEFORE({Return_Time}, DATEADD(NOW(), -30, 'minutes')))`

**Module 2: Send Escalation SMS**
- Message: "FOLLOW-UP: Still no check-in from {{Rider_Name}}..."

### Feature 2: Status-Based Routing

Add a Router module after the Iterator:

- **Route 1:** Status = "Mechanical Help" → Send urgent message
- **Route 2:** Status = "Cruising" → Send standard message

### Feature 3: Geo-Coordinates Update

Before sending SMS, add:

**Module:** HTTP → Make a request
- **URL:** `https://www.google.com/maps/search/?api=1&query={{Latitude}},{{Longitude}}`
- Validates the coordinates are retrievable

## Troubleshooting

### Problem: No SMS received
**Check:**
- Twilio phone number is active
- Emergency contact is verified (if on trial)
- Twilio account has credits
- Phone number format is correct: +1-555-123-4567

### Problem: Duplicate alerts sent
**Check:**
- Alert_Sent field is being updated correctly
- Formula includes `{Alert_Sent} = 0`
- Update Record module is after Send SMS

### Problem: Wrong time zone
**Fix:**
- Airtable uses UTC by default
- In SMS message, use formatDate with timezone:
```
{{formatDate(2.fields.Return_Time; "MMM DD h:mm A"; "America/Los_Angeles")}}
```

### Problem: "Record not found" error
**Check:**
- The Record ID being passed is `{{2.id}}` (the iterator output)
- The base and table names match exactly

## Make.com Scenario JSON Template

Save this as a starting template:

```json
{
  "name": "MotoPulse Guardian",
  "flow": [
    {
      "id": 1,
      "module": "util:Schedule",
      "interval": 15
    },
    {
      "id": 2,
      "module": "airtable:ActionSearchRecords",
      "parameters": {
        "formula": "AND({Is_Active}=1,IS_BEFORE({Return_Time},NOW()),{Alert_Sent}=0)"
      }
    },
    {
      "id": 3,
      "module": "builtin:BasicIterator",
      "mapper": {
        "array": "{{2.records}}"
      }
    },
    {
      "id": 4,
      "module": "twilio:ActionSendSMS",
      "mapper": {
        "to": "{{3.fields.Contact_Phone}}",
        "body": "Alert message here..."
      }
    },
    {
      "id": 5,
      "module": "airtable:ActionUpdateRecord",
      "mapper": {
        "recordId": "{{3.id}}",
        "Alert_Sent": true
      }
    }
  ]
}
```

## Security & Privacy

1. **Data retention:** Consider auto-deleting old inactive rides
2. **Emergency contacts:** Remind users to keep contacts updated
3. **SMS opt-in:** Ensure emergency contacts consent to receiving alerts
4. **HIPAA/Privacy:** Don't store sensitive medical info in Airtable

## Next Steps

1. ✅ Test with real rides
2. ✅ Set up monitoring alerts for Make.com failures
3. ✅ Document emergency procedures for your team
4. ✅ Create a "How to respond to alerts" guide for emergency contacts

## Support

- Make.com Documentation: https://www.make.com/en/help
- Twilio Docs: https://www.twilio.com/docs/sms
- Community Forum: [Your forum link]
