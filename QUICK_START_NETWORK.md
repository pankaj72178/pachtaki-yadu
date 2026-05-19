# 🚀 QUICK START - NETWORK ACCESS

## 🖥️ On Your Mac (Server)

### Option 1: Using the Startup Script
```bash
cd "/Users/panka/Pachtaki Yadu project"
./start-server.sh
```

### Option 2: Using npm
```bash
cd "/Users/panka/Pachtaki Yadu project"
npm start
```

**Result:** You'll see your IP address in the output!

```
╔════════════════════════════════════════════════════════════╗
║     PACHTAKI YADU - DIGITAL VILLAGE PORTAL STARTUP       ║
║          Network Configuration Enabled ✓                  ║
╚════════════════════════════════════════════════════════════╝

🖥️  Computer Name: MacBook-Air-2
🌐 Local IP Address: 192.168.1.100

📱 Network Access URLs:
   🔗 Local:   http://localhost:3000
   🔗 Network: http://192.168.1.100:3000

⏳ Starting server...
```

---

## 📱 On Another Device (Phone/Tablet/Laptop)

### Requirements:
- ✅ Same WiFi network as Mac
- ✅ Web browser (Chrome, Safari, Firefox, etc.)

### Steps:
1. Open browser
2. Type in address bar: **`http://192.168.1.100:3000`**
   - Replace `192.168.1.100` with your actual IP from server output
3. Press Enter
4. ✅ Portal loads!

---

## 📊 Network Access Examples

### Example 1: Office Desktop
```
Mac Server IP: 192.168.1.100
Desktop URL:  http://192.168.1.100:3000
Status:       ✅ WORKING
```

### Example 2: Smartphone
```
Mac Server IP: 192.168.1.100
Phone URL:    http://192.168.1.100:3000
Status:       ✅ WORKING (Mobile Version)
```

### Example 3: Tablet in Meeting
```
Mac Server IP: 192.168.1.100
Tablet URL:   http://192.168.1.100:3000
Status:       ✅ WORKING (Full Features)
```

---

## 🔍 Finding Your Mac's IP Address

If server output is not visible, find IP manually:

### Method 1: Terminal
```bash
ifconfig | grep "inet " | grep -v "127.0.0.1"
```

Look for: `inet 192.168.x.x` or `inet 10.0.0.x`

### Method 2: System Preferences
1. Apple Menu → System Preferences
2. Network
3. View your IP address

### Method 3: Router
1. Open router admin page (usually 192.168.1.1)
2. Find connected devices
3. Look for "MacBook" or your computer name

---

## 🧪 Test Server Connection

### From Terminal (Mac):
```bash
curl http://localhost:3000/api/health
```

### From Browser on Another Device:
```
http://192.168.1.100:3000/api/health
```

Should return:
```json
{"status": "Server is running!", "timestamp": "..."}
```

---

## ⚠️ Common Issues & Fixes

### "Cannot reach server"
```
✅ Check server is running (npm start)
✅ Both devices on same WiFi
✅ Try using different IP (check router)
✅ Restart Mac and try again
```

### "Connection refused"
```
✅ Wait 5 seconds after starting
✅ Check port 3000 is not blocked
✅ Restart router/WiFi
```

### "Page loads but API fails"
```
✅ Make sure API URL uses correct IP
✅ Check browser console (F12) for errors
✅ Try accessing: http://IP:3000/api/health
```

### "Only works on localhost"
```
✅ Update app.js with correct IP
✅ Clear browser cache (Ctrl+Shift+Delete)
✅ Use incognito mode to test
```

---

## 🔧 Advanced: Change Port

By default, port is 3000. To change:

```bash
PORT=8080 npm start
```

Then access via: `http://192.168.1.100:8080`

---

## 📱 Mobile Browser Optimization

The portal works on:
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Firefox (all devices)
- ✅ Samsung Internet
- ✅ Any modern browser

---

## 🔒 Security & Privacy

**On Local WiFi:**
- ✅ Safe for local village network
- ✅ Anyone on WiFi can access
- ⚠️ Not encrypted

**For Secure Remote Access:**
- Use VPN connection
- Use HTTPS (requires certificate)
- Deploy to cloud with authentication

---

## 💾 Data & File Locations

All data stored locally:
```
/Users/panka/Pachtaki Yadu project/data/
├── complaints.json
├── notices.json
├── services.json
├── events.json
├── budget.json
├── suggestions.json
├── jobs.json
└── agriculture.json
```

---

## 📞 Support Information

**Server Console Shows:**
- ✅ All connected devices
- ✅ API requests
- ✅ Errors (if any)
- ✅ Performance info

**Check Logs:**
Keep terminal open while testing to see real-time logs

---

**Start Now:**
```bash
./start-server.sh
```

**Then Access:**
```
http://192.168.1.100:3000
```

---

*Last Updated: May 2026 | Pachtaki Yadu Portal*
