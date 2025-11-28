# 🚀 StockMaster - Quick Start Guide

Complete step-by-step guide to run the StockMaster Inventory Management System.

---

## 📋 Prerequisites

Before starting, ensure you have these installed:

### 1. **Python 3.10+**
- Download from: https://www.python.org/downloads/
- During installation, check "Add Python to PATH"
- Verify: Open terminal/command prompt and run:
  ```bash
  python --version
  ```
  Should show: `Python 3.10.x` or higher

### 2. **Node.js 18+ and npm**
- Download from: https://nodejs.org/
- This installs both Node.js and npm
- Verify: Run in terminal:
  ```bash
  node --version
  npm --version
  ```
  Should show versions 18+ and 9+ respectively

### 3. **MongoDB**
- **Windows**: Download from https://www.mongodb.com/try/download/community
  - Run the installer
  - Choose "Complete" installation
  - Install as Windows Service (recommended)
  
- **macOS**: 
  ```bash
  brew tap mongodb/brew
  brew install mongodb-community
  ```

- **Linux**: Follow guide at https://docs.mongodb.com/manual/installation/

- **Verify MongoDB is running**:
  ```bash
  # Windows (if installed as service, it auto-starts)
  # Or manually: net start MongoDB
  
  # macOS/Linux
  mongod --version
  ```

### 4. **Git** (Optional but recommended)
- Download from: https://git-scm.com/downloads

---

## 🎯 Step-by-Step Setup

### **STEP 1: Open Project Directory**

Open your terminal/command prompt and navigate to the project:

```bash
cd "D:\StockMaster project"
```

---

### **STEP 2: Setup MongoDB**

#### **Windows:**
1. MongoDB should be running as a Windows Service
2. If not, start it:
   ```bash
   net start MongoDB
   ```
3. MongoDB runs on `localhost:27017` by default

#### **macOS/Linux:**
1. Start MongoDB:
   ```bash
   brew services start mongodb-community
   # OR
   mongod --config /usr/local/etc/mongod.conf
   ```

#### **Verify MongoDB:**
Open a new terminal and run:
```bash
mongosh
```
If it connects, you'll see: `test>`. Type `exit` to quit.

---

### **STEP 3: Setup Django Backend**

#### **3.1 Navigate to Backend Directory**
```bash
cd backend
```

#### **3.2 Create Virtual Environment**
```bash
# Windows
python -m venv venv

# macOS/Linux
python3 -m venv venv
```

#### **3.3 Activate Virtual Environment**

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

✅ **You should see `(venv)` at the start of your terminal prompt**

#### **3.4 Install Python Dependencies**
```bash
pip install -r requirements.txt
```

This will install:
- Django
- Django REST Framework
- MongoDB drivers
- JWT authentication
- And other dependencies

⏱️ **This may take 2-5 minutes**

#### **3.5 Create Environment File**

Create a file named `.env` in the `backend` folder:

**Windows:**
```cmd
type nul > .env
```

**macOS/Linux:**
```bash
touch .env
```

**Edit `.env` file** (use Notepad, VS Code, or any text editor) and add:
```env
SECRET_KEY=django-insecure-change-this-in-production-12345
DEBUG=True
DB_NAME=stockmaster
MONGODB_URI=mongodb://localhost:27017/
JWT_SECRET_KEY=your-jwt-secret-key-here-12345
```

💡 **Tip**: Generate a random secret key at: https://djecrety.ir/

#### **3.6 Run Django Migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

#### **3.7 Create Superuser (Admin Account)**
```bash
python manage.py createsuperuser
```

You'll be prompted to enter:
- Email address: `admin@stockmaster.com`
- Username: `admin`
- Password: (choose a strong password)
- Password (again): (repeat the password)

#### **3.8 Start Django Server**

**Keep this terminal open!**

```bash
python manage.py runserver
```

✅ **You should see:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

🎉 **Backend is now running at http://localhost:8000**

---

### **STEP 4: Setup Next.js Frontend**

#### **4.1 Open a NEW Terminal Window**

**Important**: Keep the Django server running in the first terminal!

#### **4.2 Navigate to Frontend Directory**
```bash
cd "D:\StockMaster project\frontend"
```

#### **4.3 Install Node Dependencies**
```bash
npm install
```

⏱️ **This may take 3-5 minutes** (downloads all packages)

#### **4.4 Create Environment File**

Create `.env.local` in the `frontend` folder:

**Windows:**
```cmd
type nul > .env.local
```

**macOS/Linux:**
```bash
touch .env.local
```

**Edit `.env.local`** and add:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

#### **4.5 Start Next.js Development Server**

```bash
npm run dev
```

✅ **You should see:**
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

🎉 **Frontend is now running at http://localhost:3000**

---

### **STEP 5: (Optional) Setup Flask Service**

Only if you want to use reporting features.

#### **5.1 Open a NEW Terminal Window**

#### **5.2 Navigate to Flask Service Directory**
```bash
cd "D:\StockMaster project\flask-service"
```

#### **5.3 Create Virtual Environment**
```bash
python -m venv venv
```

#### **5.4 Activate Virtual Environment**

**Windows:**
```cmd
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

#### **5.5 Install Dependencies**
```bash
pip install -r requirements.txt
```

#### **5.6 Create Environment File**

Create `.env` in `flask-service` folder:
```env
MONGODB_URI=mongodb://localhost:27017/
DB_NAME=stockmaster
FLASK_ENV=development
FLASK_PORT=5000
```

#### **5.7 Start Flask Service**
```bash
python app.py
```

✅ **Flask service runs at http://localhost:5000**

---

## 🎉 Access the Application

### **Open Your Browser**

Navigate to: **http://localhost:3000**

### **First-Time Login**

You have two options:

#### **Option 1: Use Admin Account**
- Email: `admin@stockmaster.com` (or what you created)
- Password: (the password you set)

#### **Option 2: Create New Account**
1. Click "Create your account"
2. Fill in the registration form
3. Click "Create account"
4. You'll be automatically logged in

---

## 📝 Initial Setup Steps

### **1. Create Warehouses**

1. Go to **Settings** (left sidebar)
2. Click **"Add Warehouse"**
3. Fill in:
   - Name: `Main Warehouse`
   - Code: `WH-001`
   - Address: (optional)
4. Click **"Create"**

### **2. Create Categories**

1. Go to **Products** → **Categories** (or use Django admin)
2. Create categories like:
   - Electronics
   - Furniture
   - Raw Materials
   - etc.

### **3. Create Products**

1. Go to **Products** → **Add Product**
2. Fill in:
   - Name: `Steel Rods`
   - SKU: `STEEL-001`
   - Category: Select a category
   - Unit of Measure: `kg`
   - Reorder Level: `10`
   - Initial Stock: `100` (optional)
3. Click **"Create"**

---

## 🧪 Test the System

### **Test Receipt Flow:**

1. Go to **Receipts** → **New Receipt**
2. Select warehouse: `Main Warehouse`
3. Supplier: `ABC Suppliers`
4. Add products and quantities
5. Set status to **"Ready"**
6. Click **"Validate"**
7. ✅ Stock should increase automatically

### **Test Transfer Flow:**

1. Create a second warehouse: `Production Floor`
2. Go to **Transfers** → **New Transfer**
3. From: `Main Warehouse`
4. To: `Production Floor`
5. Add products and quantities
6. Set status to **"Ready"**
7. Click **"Validate"**
8. ✅ Stock should move between warehouses

### **Test Delivery Flow:**

1. Go to **Deliveries** → **New Delivery**
2. Select warehouse
3. Customer: `XYZ Company`
4. Add products and quantities
5. Set status to **"Ready"**
6. Click **"Validate"**
7. ✅ Stock should decrease automatically

---

## 🛑 Stopping the Servers

### **To Stop:**

1. **Django Server**: Press `Ctrl+C` in the Django terminal
2. **Next.js Server**: Press `Ctrl+C` in the Next.js terminal
3. **Flask Service** (if running): Press `Ctrl+C` in the Flask terminal

### **To Deactivate Virtual Environments:**

```bash
deactivate
```

---

## 🔧 Troubleshooting

### **Issue: MongoDB Connection Error**

**Solution:**
- Ensure MongoDB is running
- Check if port 27017 is accessible
- Verify MongoDB URI in `.env` files

### **Issue: Port Already in Use**

**Django (port 8000):**
```bash
python manage.py runserver 8001
```

**Next.js (port 3000):**
```bash
npm run dev -- -p 3001
```

Then update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

### **Issue: Module Not Found**

**Backend:**
```bash
# Ensure virtual environment is activated
pip install -r requirements.txt
```

**Frontend:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### **Issue: CORS Errors**

- Ensure Django server is running
- Check `CORS_ALLOWED_ORIGINS` in `backend/stockmaster/settings.py`
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### **Issue: Authentication Not Working**

- Clear browser localStorage
- Check if JWT tokens are being saved
- Verify API URL in frontend `.env.local`

---

## 📊 Running All Services Summary

You need **3 terminal windows** running simultaneously:

### **Terminal 1: Django Backend**
```bash
cd backend
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # macOS/Linux
python manage.py runserver
```
✅ Running on: http://localhost:8000

### **Terminal 2: Next.js Frontend**
```bash
cd frontend
npm run dev
```
✅ Running on: http://localhost:3000

### **Terminal 3: Flask Service (Optional)**
```bash
cd flask-service
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # macOS/Linux
python app.py
```
✅ Running on: http://localhost:5000

---

## 🎯 Quick Commands Reference

### **Backend:**
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

### **Frontend:**
```bash
cd frontend
npm run dev
```

### **Flask:**
```bash
cd flask-service
venv\Scripts\activate
python app.py
```

---

## ✅ Checklist

Before running, ensure:
- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] MongoDB installed and running
- [ ] Backend `.env` file created
- [ ] Frontend `.env.local` file created
- [ ] Django migrations run
- [ ] Superuser created
- [ ] All dependencies installed

---

## 🎉 You're All Set!

Open **http://localhost:3000** in your browser and start managing your inventory!

For detailed API documentation, check the **README.md** file.

---

**Need Help?** Check the troubleshooting section above or review the error messages in your terminal for specific guidance.


