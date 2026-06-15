# Enquiry System Backend

A role-based enquiry management system built with Node.js, Express, and MongoDB.

## 🏗️ Project Structure

```
enquiry-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controller/
│   ├── authcontroller.js      # Auth (signup, login, verify, reset)
│   ├── adminController.js     # Create admin/HR accounts
│   ├── admissionController.js # Admission CRUD
│   ├── enquiryController.js   # Enquiry CRUD
│   ├── registrationController.js  # Registration CRUD
│   ├── dashboardController.js # Dashboard data + dynamic update/delete
│   └── nodemailer.js          # Email transporter
├── middlewares/
│   └── authMiddleware.js      # JWT auth + role guard
├── Models/
│   ├── User.js
│   ├── admissionModule.js
│   ├── enquiryModule.js
│   └── registrationModule.js
├── routes/
│   ├── authRouter.js
│   ├── adminRoute.js
│   ├── admissionRouter.js
│   ├── enquiryRouter.js
│   ├── registrationRouter.js
│   └── dashboardRoute.js
├── server.js                  # App entry point
├── createSuperAdmin.js        # One-time super admin setup script
├── .env.example               # Environment variables template
└── package.json
```

## 👥 Roles & Permissions

| Role        | Create | Read (own) | Read (all) | Update | Delete |
|-------------|--------|------------|------------|--------|--------|
| user        | ✅     | ✅         | ❌         | own    | ❌     |
| HR          | ✅     | ✅         | ✅         | own    | ❌     |
| admin       | ✅     | ✅         | ✅         | ✅     | ✅     |
| super-admin | ✅     | ✅         | ✅         | ✅     | ✅     |

## 🚀 Local Setup

1. Clone the repo and install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

3. Create the super admin (run once):
```bash
npm run create-super-admin
```

4. Start development server:
```bash
npm run dev
```

## ☁️ Deploy to Render

1. Push your code to GitHub (make sure `.env` is in `.gitignore`)

2. Go to [render.com](https://render.com) → **New** → **Web Service**

3. Connect your GitHub repository

4. Set these values:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

5. Add all environment variables from `.env.example` in the **Environment** tab on Render

6. Click **Deploy**

7. After deploy, run the super admin script once via Render Shell:
```bash
npm run create-super-admin
```

## 📧 Gmail Setup (for email sending)

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → **App Passwords**
3. Generate an app password for "Mail"
4. Use that 16-character password as `EMAIL_PASS` in your `.env`

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| GET | `/auth/verify/:token` | Verify email |
| POST | `/auth/login` | Login |
| POST | `/auth/forgot-password` | Send reset link |
| POST | `/auth/reset-password` | Reset password (body: token, password) |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/admin/create` | super-admin | Create admin or HR account |

### Admission
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/admission/admission_create` | any logged-in | Create admission |
| GET | `/admission/all` | admin/HR | Get all admissions |
| PUT | `/admission/update_admission/:id` | logged-in | Update admission |
| DELETE | `/admission/delete_admission/:id` | admin | Delete admission |
| GET | `/admission/search/:mobile` | logged-in | Search by mobile |

### Enquiry
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/enquiry/Create_enquiry` | any logged-in | Create enquiry |
| GET | `/enquiry/all` | admin/HR | Get all enquiries |
| PUT | `/enquiry/update_enquiry/:id` | logged-in | Update enquiry |
| DELETE | `/enquiry/delete_enquiry/:id` | admin | Delete enquiry |

### Registration
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/registration/register` | any logged-in | Create registration |
| GET | `/registration/get_user/:id` | logged-in | Get by ID |
| GET | `/registration/search/:mobile` | logged-in | Search by mobile |
| GET | `/registration/getall_registrations` | admin/HR | Get all |
| PUT | `/registration/update_user/:id` | logged-in | Update |
| DELETE | `/registration/delete_user/:id` | admin | Delete |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/mydata` | any logged-in | Own records |
| GET | `/dashboard/hrdata` | HR | All records (HR view) |
| GET | `/dashboard/all` | admin | All records |
| GET | `/dashboard/checkNotification` | admin | Check 50-admission milestones |
| PUT | `/dashboard/:module/:id` | logged-in | Dynamic update |
| DELETE | `/dashboard/:module/:id` | admin | Dynamic delete |
