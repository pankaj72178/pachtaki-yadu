# Pachtaki Yadu - Digital Citizen Portal

Website Link:- https://pachtaki-yadu-new.vercel.app/

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

### 3. Open the Website

Open `index.html` in your browser, or serve it with:

```bash
npx http-server .
```

Then visit `http://localhost:8080`

---

## 📋 What's Working Now

✅ **Frontend**

- Modern responsive design with Tailwind CSS
- Hero section with profile image
- Statistics cards
- Regional profile information
- Development timeline with filtering
- Fully functional citizen feedback form

✅ **Backend**

- Express.js server running on port 3000
- Citizen complaint submission API
- Data persistence (complaints.json)
- CORS enabled for cross-origin requests
- Health check endpoint
- Complaint tracking and status retrieval

✅ **API Endpoints**

- `GET /api/health` - Server health check
- `POST /api/complaints` - Submit a new complaint
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/:id` - Get specific complaint

---

## 📝 Form Features

The citizen feedback form now:

- ✅ Validates all fields
- ✅ Sends data to the backend
- ✅ Shows success/error messages
- ✅ Clears form on successful submission
- ✅ Displays real-time feedback to users
- ✅ Stores data in `complaints.json`

---

## 📁 File Structure

```
.
├── index.html           # Frontend website
├── server.js            # Express backend
├── package.json         # Dependencies
├── complaints.json      # Data storage (auto-created)
├── image_1.jpg         # Profile image
└── README.md           # This file
```

---

## 🛠️ Troubleshooting

**"Connection error" message?**

- Make sure the backend is running: `npm start`
- Check that port 3000 is not blocked

**"Module not found" error?**

- Run: `npm install`

**Port 3000 already in use?**

- Edit `server.js` and change `const PORT = 3000;` to another port (e.g., 3001)

---

## 📊 Data Storage

All citizen complaints are saved to `complaints.json` with:

- Unique ID
- Full name
- Ward number
- Issue description
- Status (Pending, In Review, Resolved)
- Creation and update timestamps

---

## 🎨 Customization

- **Colors**: Edit Tailwind config in `index.html`
- **Port**: Change `PORT` variable in `server.js`
- **Data path**: Modify `dataFile` path in `server.js`

---

## 🔒 Security Note

For production deployment:

- Add input sanitization
- Implement authentication
- Use a proper database (MongoDB, PostgreSQL)
- Add rate limiting
- Use HTTPS

---

**Made with ❤️ for Pachtaki Yadu Gram Panchayat**
