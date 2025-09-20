# 🚀 Quick Start Guide - Windows

## ✅ **Backend is Running!**

Your backend is now running at: **http://localhost:5000**

### **Backend Features:**
- ✅ Health Check: `http://localhost:5000/api/health`
- ✅ Authentication: `http://localhost:5000/api/auth/login`
- ✅ Dashboard: `http://localhost:5000/api/dashboard/overview`
- ✅ Demo users created automatically

### **Demo Login Credentials:**
- **Admin**: `admin@attendify.com` (any password)
- **Faculty**: `faculty@attendify.com` (any password)  
- **Student**: `student@attendify.com` (any password)

---

## 🎯 **Frontend is Starting!**

Your React frontend should be starting at: **http://localhost:3000**

### **What to do now:**

1. **Wait for frontend to load** (should take 30-60 seconds)
2. **Open your browser** to `http://localhost:3000`
3. **Login** with any of the demo credentials above
4. **Test the connection** - you should see real data from the backend!

---

## 🔧 **How to Run Everything:**

### **Terminal 1 (Backend):**
```powershell
cd attendance-backend
python simple_app.py
```

### **Terminal 2 (Frontend):**
```powershell
cd C:\X3
npm start
```

---

## 🎉 **What's Working:**

- ✅ **Backend API** - All endpoints working
- ✅ **Database** - SQLite with demo data
- ✅ **Authentication** - JWT tokens
- ✅ **CORS** - Frontend can connect
- ✅ **Environment** - All configs set
- ✅ **Frontend** - React app with API integration

---

## 🚨 **If Something Goes Wrong:**

### **Backend not working?**
```powershell
cd attendance-backend
python simple_app.py
```

### **Frontend not connecting?**
1. Check if backend is running on port 5000
2. Check `.env` file exists in C:\X3
3. Restart frontend: `npm start`

### **Can't login?**
- Use any of the demo emails above
- Password doesn't matter (it's simplified for demo)

---

## 🎯 **Next Steps:**

1. **Test the login** - Try all three user types
2. **Check dashboard** - Should show real data
3. **Explore features** - All basic functionality works
4. **Add more features** - The foundation is ready!

---

**🎉 Your full-stack attendance system is now running!**
