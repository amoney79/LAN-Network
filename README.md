# LAN Connect - High Performance Network Portal

A modern, responsive multi-page LAN Connect portal showcasing its key functionalities with complete integration architecture for captive portal, payment processing, and access control.

## 🏗️ Architecture Overview

### **Portal Layer (Frontend)**

The user-facing web application that provides service information, authentication, and account management.

#### **Landing Page** (`index.html`)
- Hero section with network status indicator
- Real-time uptime and latency statistics (99.9% uptime, <5ms latency, 100% packet delivery)
- Feature grid showcasing 6 key capabilities
- Customer testimonials with ratings
- Location/contact information
- Comprehensive footer with newsletter signup

#### **Pricing Page** (`pricing.html`)
- Tiered plans (Hourly, Daily, Monthly)
- Interactive billing toggle (hourly/daily vs monthly)
- Technical specifications comparison table
- FAQ accordion section
- Plan selection and upgrade options

#### **Login Page** (`login.html`)
- Email/password authentication
- Social login integration (Google, Facebook)
- Password recovery flow
- "Remember me" functionality
- Network security indicators

#### **Dashboard** (`dashboard.html`)
- Real-time connection status
- Data usage analytics with visual charts
- Billing history and payment management
- Network health indicators (download/upload speeds)
- Quick actions (Add Data, Pay Bill, Manage Devices, Report Issue)
- Device management interface

#### **Support Page** (`support.html`)
- Searchable knowledge base
- Category-based FAQ navigation
- Common troubleshooting guides
- Support ticket submission
- 24/7 contact options

---

### **Integration Layer (Backend)**

The technical infrastructure that connects the portal to network hardware and payment systems.

#### **1. Authentication Gateway (Captive Portal)**
When a device connects to the Wi-Fi network:
- Router redirects to portal login page
- User authenticates via email/password or social login
- Session token generated and stored
- MAC address whitelisted for network access

**Implementation Requirements:**
- Router with captive portal support (e.g., MikroTik, pfSense, UniFi)
- RADIUS server for authentication
- Session management database
- MAC address tracking system

#### **2. Payment System Integration**
Multiple payment options integrated into the pricing page:

**M-Pesa STK Push:**
- User selects plan and clicks "Pay"
- STK Push prompt sent to mobile device
- Real-time payment confirmation
- Automatic access activation upon success

**Card Payments:**
- Stripe/PayPal integration
- Secure tokenization
- PCI compliance
- Recurring billing for monthly plans

**Implementation Requirements:**
- M-Pesa Daraja API integration
- Payment gateway SDK (Stripe/PayPal)
- Webhook handlers for payment confirmation
- Transaction logging and reconciliation

#### **3. Access Control System**
Once payment/authentication succeeds:
- Router API receives activation command
- User's MAC address added to allowed list
- Bandwidth allocation based on plan tier
- QoS rules applied (priority for Pro/Monthly users)
- Session timer started (for hourly/daily plans)
- Auto-disconnect when time expires

**Implementation Requirements:**
- Router API integration (MikroTik API, UniFi Controller API)
- Bandwidth management system
- Session monitoring service
- Auto-renewal notifications
- Grace period handling

---

## 🎨 Design System

### **Colors**
- **Primary**: `#135bec` (Electric Blue)
- **Primary Hover**: `#0e4bce`
- **Background Light**: `#f6f6f8`
- **Background Dark**: `#101622`
- **Card Dark**: `#1a2333`
- **Border Dark**: `#324467`

### **Typography**
- **Display Font**: Space Grotesk (headings, bold text)
- **Body Font**: Noto Sans (paragraphs, UI text)
- **Icons**: Material Symbols Outlined

### **Design Principles**
- Mobile-first responsive design
- Dark mode by default with light mode support
- Semantic HTML5 structure
- ARIA accessibility labels
- Optimized performance (lazy loading, CDN assets)

---

## 📦 Technology Stack

### **Frontend**
- HTML5 (semantic markup)
- Tailwind CSS 3.x (via CDN)
- Vanilla JavaScript (no framework dependencies)
- Google Fonts (Space Grotesk, Noto Sans)
- Material Symbols Icons

### **Backend (Recommended)**
- **API Server**: Node.js + Express or Python + FastAPI
- **Database**: PostgreSQL or MongoDB
- **Authentication**: JWT tokens, OAuth 2.0
- **Payment**: M-Pesa Daraja API, Stripe SDK
- **Router Control**: MikroTik API, UniFi Controller API
- **Session Store**: Redis
- **Hosting**: VPS (DigitalOcean, AWS, Linode)

---

## 🚀 Getting Started

### **Frontend Only (Current State)**
1. Clone the repository:
   ```bash
   git clone https://github.com/amoney79/LAN-Network.git
   cd LAN-Network
   ```

2. Open `index.html` in your browser:
   ```bash
   start index.html  # Windows
   open index.html   # macOS
   xdg-open index.html  # Linux
   ```

3. No build process required - all dependencies via CDN!

### **Full Stack Setup (Coming Soon)**
1. Set up backend API server
2. Configure database and Redis
3. Integrate M-Pesa and payment gateway
4. Connect to router API
5. Deploy frontend to static hosting
6. Configure captive portal redirect

---

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (single column, hamburger menu)
- **Tablet**: 768px - 1024px (2-column grid)
- **Desktop**: > 1024px (3-column grid, full navigation)

---

## 🔐 Security Features

- HTTPS enforcement
- CSRF protection
- XSS prevention
- SQL injection protection
- Rate limiting on API endpoints
- Secure session management
- PCI DSS compliance for payments
- GDPR-compliant data handling

---

## 📊 Key Features

### **User Experience**
- ✅ Zero-configuration frontend
- ✅ Fast loading (CDN-based)
- ✅ SEO optimized
- ✅ ARIA accessible
- ✅ Progressive enhancement

### **Business Features**
- 💰 Multiple payment methods
- 📊 Usage analytics
- 🔔 Auto-renewal notifications
- 📧 Email receipts
- 🎫 Support ticketing

### **Technical Features**
- 🔒 Captive portal integration
- ⚡ Real-time session management
- 📡 Bandwidth control
- 🎯 QoS prioritization
- 📈 Network monitoring

---

## 🗂️ Project Structure

```
LAN-Network/
├── index.html          # Landing page
├── pricing.html        # Pricing & plans
├── login.html          # Authentication
├── dashboard.html      # User dashboard (coming soon)
├── support.html        # Support center (coming soon)
├── README.md           # This file
├── assets/             # Images, icons (future)
└── api/                # Backend API (future)
    ├── auth/           # Authentication endpoints
    ├── payment/        # Payment processing
    ├── router/         # Router control
    └── user/           # User management
```

---

## 🛣️ Roadmap

### **Phase 1: Frontend (✅ Complete)**
- [x] Landing page
- [x] Pricing page
- [x] Login page
- [x] README documentation

### **Phase 2: Additional Pages (🚧 In Progress)**
- [ ] Dashboard page
- [ ] Support page
- [ ] User profile page
- [ ] Payment confirmation page

### **Phase 3: Backend Integration (📋 Planned)**
- [ ] API server setup
- [ ] Database schema
- [ ] Authentication system
- [ ] M-Pesa integration
- [ ] Router API integration

### **Phase 4: Deployment (📋 Planned)**
- [ ] Frontend hosting (Netlify/Vercel)
- [ ] Backend hosting (VPS)
- [ ] Domain and SSL
- [ ] Captive portal configuration

---

## 📄 License

All rights reserved © 2024 LAN Connect Inc.

---

## 🤝 Support & Contact

- **Email**: support@lanconnect.com
- **Phone**: +254 XXX XXX XXX
- **Location**: 1024 Gigabit Ave, Tech City, TC 9900
- **Hours**: 24/7 Network Operations, Staffed 9AM - 10PM

---

## 🙏 Acknowledgments

- Design inspiration: Modern SaaS platforms
- Icons: Google Material Symbols
- Fonts: Google Fonts
- Framework: Tailwind CSS

---

**Built with ❤️ for high-performance networking**
