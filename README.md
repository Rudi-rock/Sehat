# Sehat# 🏥 Sehat — Digital Health Identity for Rural India

> *"In rural India, patients don't carry medical records — they carry paper scraps. Sehat converts a simple QR code into a lifelong, portable health identity."*

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![License](https://img.shields.io/badge/License-MIT-green)
![Impact](https://img.shields.io/badge/Impact-Rural%20Healthcare-blue)

---

## 🌍 The Problem

Over **650,000 villages** in India have limited or no internet connectivity. Rural patients:

- Carry paper prescriptions that get lost or damaged
- Have no organized medical history
- Face misdiagnosis in emergencies due to missing records
- Cannot access digital health systems that require internet

Every year, **thousands of preventable deaths** occur because doctors didn't have the right information in time.

---

## 💡 Our Solution

**Sehat** is an offline-first, QR-based digital health identity system built specifically for rural India.

Every patient gets a **unique QR health card**. Doctors scan it. Critical information appears instantly — even without internet.

---

## ⚡ Dual Access Mode (Core Innovation)

### 🚨 Emergency Mode — No Authentication Required
Instantly shows:
- Blood group
- Known allergies
- Emergency contact
- Critical medical conditions

### 🔒 Private Mode — OTP Protected
Full access to:
- Prescriptions & medications
- Lab reports
- Complete treatment history
- Doctor visit logs

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React / Next.js, PWA, React Native |
| Backend | FastAPI, JWT, RBAC |
| Database | PostgreSQL, Redis |
| Security | AES-256 Encryption, TLS 1.3, Biometrics |
| Integration | NDHM / ABHA Compatible |

---

## ✨ Key Features

- 📶 **Offline-First Design** — Works without internet in remote villages
- 👩‍⚕️ **ASHA Worker Integration** — Healthcare workers register patients offline
- 🔐 **Patient Consent System** — OTP-based access for full medical records
- 📋 **Audit Logs** — Patients can see who accessed their data and when
- 🏛️ **Government Compatible** — Integrates with NDHM / ABHA health systems
- 🌐 **Low Literacy UI** — Icon-based interface for non-literate users

---

## 🗺️ Roadmap

| Phase | Codename | Goal |
|---|---|---|
| Phase 1 | **DART** | MVP — Emergency QR system |
| Phase 2 | **POLLYWOG** | Pilot — Offline village deployment |
| Phase 3 | **DEMODOG** | Security — Consent & audit logs |
| Phase 4 | **DEMOGORGON** | Scale — National government integration |

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/Sehat.git

# Navigate to project
cd Sehat

# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 📁 Project Structure

```
Sehat/
├── README.md
├── docs/
│   ├── problem.md
│   ├── architecture.md
│   └── roadmap.md
├── frontend/
├── backend/
└── pitch/
    └── Sehat.pptx
```

---

## 🎯 Impact Vision

Sehat aims to provide a **reliable digital health backbone** for rural communities — ensuring every Indian, regardless of location or literacy, has access to their own medical identity.

> Target: **10 million rural patients** onboarded in 3 years.

---

## 🤝 Contributing

We welcome contributors who care about rural healthcare and technology.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Built by Rudra

*Sehat is built with the belief that quality healthcare information should reach every Indian — not just those in cities.*

---

⭐ **Star this repo if you believe rural healthcare deserves better technology.**
