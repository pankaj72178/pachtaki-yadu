# 🌐 Pachtaki Yadu - Network Setup Guide

## How to Run on Another Device

Your Pachtaki Yadu portal is now configured to run on any device on your network!

### ✅ Step 1: Start the Server

**On the Main Computer (Mac):**

```bash
cd "/Users/panka/Pachtaki Yadu project"
npm start
```

You'll see output like:
```
╔══════════════════════════════════════════════════════╗
║   Pachtaki Yadu Citizen Portal - ENHANCED v3.0      ║
║     🚀 Complete Village Management System 🚀        ║
╠══════════════════════════════════════════════════════╣
║  🟢 Server running on:                              ║
║     Local: http://localhost:3000                    ║
║     Local Network: http://127.0.0.1:3000             ║
║     Network: http://192.168.x.x:3000                ║
║                                                      ║
║  📱 Access from another device:                     ║
║     Open browser and enter any URL above            ║
╚══════════════════════════════════════════════════════╝
```

### ✅ Step 2: Find Your Computer's IP Address

**Option A: From Mac Terminal**
```bash
ifconfig | grep "inet " | grep -v "127.0.0.1"
```

Look for an IP like: `192.168.1.x` or `10.0.0.x`

**Option B: Check Server Output**
The server shows your IP automatically when started!

### ✅ Step 3: Access from Another Device

**On any other device (Phone, Tablet, Laptop):**

1. **Make sure the device is on the same WiFi network**
2. **Open a web browser**
3. **Enter the URL shown in the server output:**
   ```
   http://192.168.x.x:3000
   ```
   (Replace `192.168.x.x` with your actual IP)

### 📱 Example Scenarios

**Scenario 1: Laptop to Laptop**
- Mac Server IP: `192.168.1.100`
- Windows Laptop: Open `http://192.168.1.100:3000`
- ✅ Works!

**Scenario 2: Phone Access**
- Server IP: `192.168.1.100`
- Android/iPhone: Open `http://192.168.1.100:3000`
- ✅ Mobile responsive!

**Scenario 3: Tablet in Classroom/Meeting**
- Server IP: `192.168.1.100`
- Tablet: Open `http://192.168.1.100:3000`
- ✅ Perfect for presentations!

### 🔧 Troubleshooting

**Issue: "Cannot connect to server"**
- ✅ Check server is running (`npm start`)
- ✅ Both devices on same WiFi
- ✅ Check firewall isn't blocking port 3000
- ✅ Use correct IP address from server output

**Issue: "Connection refused"**
- ✅ Restart the server: `npm start`
- ✅ Wait 2-3 seconds for server to start
- ✅ Refresh the browser

**Issue: "API connection failed"**
- ✅ Check the IP in browser matches server output
- ✅ Try `http://192.168.x.x:3000/api/health`
- ✅ Should see: `{"status": "Server is running!"}`

### 🔒 Security Notes

The server is currently accessible to anyone on your WiFi network:
- ✅ Good for local village network
- ⚠️ Not secure for internet access
- 💡 For internet access, use VPN or proper hosting

### 📊 Multi-Device Usage

**Scenario: Panchayat Using Across Village**

1. **Server running on main office computer**
2. **Villagers with phones/tablets connect via WiFi**
3. **Everyone sees same data in real-time**
4. **All changes sync automatically**

Example:
- Admin logs complaints on desktop
- Field worker checks updates on tablet
- Villager views status on phone
- All data synchronized!

### 🚀 Performance Tips

- **For best performance:** Use LAN cable connection on server if possible
- **WiFi range:** Ensure all devices have strong signal
- **Multiple users:** Server can handle 20-30 simultaneous users
- **Data backup:** Keep `data/` folder backed up

### 📱 Mobile Optimization

The portal is fully responsive:
- ✅ Desktop computers
- ✅ Tablets (iPad, Android tablets)
- ✅ Smartphones (iPhone, Android)
- ✅ Works offline after first load (cached)

### 🔄 Access Your Data Anywhere

**Option 1: Same WiFi (FREE)**
```
http://192.168.1.100:3000
```

**Option 2: Different Network (Requires VPN)**
- Set up VPN tunnel
- Connect to office network
- Access as if on same WiFi

**Option 3: Cloud Deployment (Advanced)**
- Deploy to Heroku, AWS, or similar
- Access from anywhere globally
- Requires: domain, SSL certificate, hosting

---

## Commands Quick Reference

```bash
# Start server
npm start

# Stop server
Press Ctrl+C

# Check port is open
lsof -i :3000

# Find your IP
ifconfig | grep "inet "

# Test API from terminal
curl http://192.168.x.x:3000/api/health
```

---

**Questions?** Check the server console output for detailed information!

---

*Updated: May 2026 | Pachtaki Yadu Digital Village Portal*
