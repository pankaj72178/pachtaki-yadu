# 🎯 Quick Start Guide

## ✅ Everything is Ready!

Your Pachtaki Yadu portal now has a **fully functional backend** and **working form submission**.

---

## 🚀 Running the Project

### Terminal Command:

```bash
npm start
```

This will:

- ✅ Start the Express server on port 3000
- ✅ Enable the API for form submissions
- ✅ Create/use `complaints.json` for data storage
- ✅ Display the success banner below

**Expected Output:**

```
╔════════════════════════════════════════════╗
║     Pachtaki Yadu Citizen Portal Server    ║
╠════════════════════════════════════════════╣
║  🟢 Server running on: http://localhost:3000  ║
║  📨 API available at: /api                 ║
║  💾 Data stored in: complaints.json        ║
╚════════════════════════════════════════════╝
```

---

## 🌐 Open the Website

Once the server is running:

1. **Check Server Status**: Open `status.html` in your browser
   - Shows green ✓ if backend is online
   - Shows red ✗ if backend is offline

2. **Main Portal**: Open `index.html` in your browser
   - Fill the Citizen Feedback Form
   - Submit your complaint
   - See success message
   - Data saved automatically

---

## 📝 Test the Form

**Try this data:**

- **Name**: Pankaj Kumar
- **Ward**: Ward 1
- **Issue**: The road near the market needs repair

Then click "SUBMIT REPORT"

**You should see:**

- Button shows "⏳ SUBMITTING..."
- Green success message appears
- Form clears automatically
- Data saved to `complaints.json`

---

## 📂 File Structure

```
/Users/panka/Pachtaki Yadu project/
├── index.html                (Main website) ⭐
├── status.html               (Backend status checker)
├── server.js                 (Express backend) ⭐
├── package.json              (Dependencies)
├── complaints.json           (Data storage - auto-created)
├── image_1.jpg              (Profile image)
├── README.md                (Documentation)
├── SETUP_SUMMARY.md         (What's new)
├── QUICK_START.md           (This file)
└── node_modules/            (Dependencies)
```

---

## 🔧 Configuration

### Change Port (if 3000 is busy):

Edit `server.js`, line 5:

```javascript
const PORT = 3000; // Change to 3001, 3002, etc.
```

### View Submitted Complaints:

Open `complaints.json` - shows all submissions with timestamps

### Add New Wards:

Edit `index.html`, search for "Ward 5" and add more options

---

## 🆘 Troubleshooting

| Problem                  | Solution                                |
| ------------------------ | --------------------------------------- |
| Form won't submit        | Make sure `npm start` is running        |
| "Connection error"       | Check port 3000, try `lsof -i :3000`    |
| "npm: command not found" | Install Node.js from nodejs.org         |
| "Cannot find module"     | Run `npm install` in the project folder |

---

## 🧪 Testing the API

### Using Browser Console:

```javascript
// Test server health
fetch("http://localhost:3000/api/health")
  .then((r) => r.json())
  .then((d) => console.log(d));

// Get all complaints
fetch("http://localhost:3000/api/complaints")
  .then((r) => r.json())
  .then((d) => console.log(d));

// Submit a complaint
fetch("http://localhost:3000/api/complaints", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fullName: "Test User",
    wardNumber: "Ward 1",
    issue: "Test issue",
  }),
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### Using curl:

```bash
# Check health
curl http://localhost:3000/api/health

# Get complaints
curl http://localhost:3000/api/complaints

# Submit complaint
curl -X POST http://localhost:3000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","wardNumber":"Ward 1","issue":"Test"}'
```

---

## 📊 What Happens When Form is Submitted

1. **Frontend**: Collects form data
2. **Validation**: Checks all fields filled
3. **API Call**: Sends POST to `/api/complaints`
4. **Backend**: Validates and processes
5. **Storage**: Saves to `complaints.json`
6. **Response**: Returns success/error
7. **UI**: Shows message and clears form

---

## 💾 Data Example

When a complaint is submitted, it looks like:

```json
{
  "id": 1715209600000,
  "fullName": "Pankaj Kumar",
  "wardNumber": "Ward 1",
  "issue": "The road near the market needs repair",
  "status": "Pending",
  "createdAt": "2026-05-08T10:30:45.123Z",
  "updatedAt": "2026-05-08T10:30:45.123Z"
}
```

---

## 🔒 Security Notes (For Production)

- Add input sanitization (use `express-validator`)
- Add authentication (use `JWT` or `OAuth`)
- Use HTTPS instead of HTTP
- Add rate limiting (use `express-rate-limit`)
- Use environment variables for secrets
- Switch to proper database (MongoDB/PostgreSQL)
- Add CORS restrictions to allowed domains

---

## 🎓 Learning Resources

- **Express.js**: https://expressjs.com/
- **CORS**: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
- **Tailwind CSS**: https://tailwindcss.com/
- **REST API**: https://restfulapi.net/

---

## 📞 Support

**If something doesn't work:**

1. Check the browser console (F12) for errors
2. Check the terminal where `npm start` is running
3. Verify port 3000 is not in use
4. Try restarting with `npm start`

---

## ✨ Features Summary

✅ Modern responsive design  
✅ Real-time form validation  
✅ Express.js backend  
✅ Data persistence  
✅ Success/error notifications  
✅ CORS enabled  
✅ Health check endpoint  
✅ Complaint tracking

---

**You're all set! 🚀 Start with `npm start`**
