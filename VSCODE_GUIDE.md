# AeroWings VS Code Setup & Execution Guide

This guide ensures the AeroWings project runs smoothly when opened in Visual Studio Code.

---

## 1. Quick Start in VS Code

1. Open the project folder in VS Code:
   ```bash
   code .
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Run the Full Application** (Frontend + Backend + OTP APIs + AI Concierge):
   ```bash
   npm run dev
   ```
   - Opens at **http://localhost:3000**
   - The React frontend and Express backend run together seamlessly.

---

## 2. Running the Standalone OTP Backend Script

If you only want to run the **Node.js + Express OTP Backend** independently:

```bash
node otp-backend.js
# or
npm run otp
```

- Server runs at: **http://localhost:5001**
- Supports both **MongoDB** (with 5-minute TTL automatic deletion index) and an **automatic in-memory TTL cache** if MongoDB is not running locally.
- Dispatches SMS via **Mock SMS Service** (or Twilio if configured).

---

## 3. Testing the OTP Endpoints

### Endpoint 1: Generate & Send OTP (5-minute TTL + SMS Dispatch)
```bash
curl -X POST http://localhost:5001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Secure 6-digit OTP generated and sent to mobile phone via SMS API.",
  "phoneNumber": "9876543210",
  "expiresInSeconds": 300,
  "expiresAt": "2026-09-10T15:26:29.884Z",
  "smsDelivery": {
    "status": "delivered",
    "messageId": "mock_sms_4776a2a81a06",
    "provider": "AeroWings Mock SMS Gateway"
  },
  "testPreviewCode": "802920"
}
```

### Endpoint 2: Verify OTP Before Flight Booking
```bash
curl -X POST http://localhost:5001/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210", "otp": "802920"}'
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "message": "OTP verified successfully! You may now proceed with your flight booking.",
  "bookingClearanceToken": "aw_clearance_94230c165aa52cbf669b2630cb8497ca",
  "canProceedToBooking": true,
  "verifiedAt": "2026-09-10T15:21:30.290Z"
}
```

---

## 4. 1-Click Debugging in VS Code

Pre-configured launch configurations are included in `.vscode/launch.json`:

1. Open the **Run and Debug** panel in VS Code (`Ctrl+Shift+D` or `Cmd+Shift+D`).
2. Select either:
   - **1. Launch AeroWings Full App (npm run dev)**
   - **2. Run Standalone OTP Backend (node otp-backend.js)**
   - **3. Debug Server with TSX (server.ts)**
3. Press **F5** or click the green **Play** button.

---

## 5. Environment Configuration (.env)

Optional environment variables (defined in `.env.example`):
```env
# Port configuration
PORT=3000
OTP_PORT=5001

# Optional MongoDB connection (uses in-memory 5-minute TTL cache if not provided)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=aerowings_db

# Optional SMS Gateway (uses high-fidelity mock SMS provider by default)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```
