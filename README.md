# CodeDesign Marketplace

> A cloud-native microservices marketplace platform for Code & Design services.

[![Docker](https://img.shields.io/badge/Docker-required-blue?logo=docker)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-microservices-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-MIT-brightgreen)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [System Requirements](#system-requirements)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the System](#running-the-system)
- [Accessing the Platform](#accessing-the-platform)
- [Seeding Sample Data](#seeding-sample-data)
- [Serving the Frontend](#serving-the-frontend)
- [Port Reference](#port-reference)
- [Troubleshooting](#troubleshooting)

---

## Overview

CodeDesign Marketplace is a production-ready microservices platform connecting freelancers and clients for code and design projects. The architecture comprises nine independently deployable FastAPI services, orchestrated via Docker Compose, fronted by an Nginx reverse proxy, and exposed publicly through Ngrok tunneling.

---

## System Requirements

| Dependency | Notes |
|---|---|
| Windows 10 / 11 | PowerShell required |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Must be running before starting the system |
| Git | For cloning the repository |
| Ngrok | Place `ngrok.exe` in the project root, or install via Chocolatey |

**Optional** (only needed for standalone service execution or manual seeding):

- Python 3.11+
- Node.js (for serving the static frontend without Docker)

---

## Project Structure

```
.
├── docker-compose.local.yml        # Docker Compose — local environment
├── docker-compose.yml              # Docker Compose — full reference config
├── ngrok.exe                       # Ngrok binary (place here if not installed globally)
├── nginx/
│   └── nginx.conf                  # Reverse proxy + static frontend serving
├── services/                       # FastAPI microservices
│   ├── auth_service/               # Port 8001 — Authentication & authorization
│   ├── user_service/               # Port 8002 — User profiles & management
│   ├── project_service/            # Port 8003 — Project listings & contracts
│   ├── search_service/             # Port 8004 — Search & discovery
│   ├── payments_service/           # Port 8005 — Payments & billing
│   ├── messaging_service/          # Port 8006 — Real-time messaging
│   ├── notifications_service/      # Port 8007 — Push notifications
│   ├── admin_service/              # Port 8008 — Admin dashboard APIs
│   └── analytics_service/          # Port 8009 — Analytics & reporting
├── frontend/
│   └── public/                     # Static web client (HTML / CSS / JS)
│       ├── index.html
│       ├── css/
│       └── js/
└── scripts/                        # PowerShell automation scripts
    ├── start-all.ps1               # Start the full stack
    ├── stop-all.ps1                # Stop the full stack
    ├── check-status.ps1            # Health check all services
    ├── start-ngrok.ps1             # Start Ngrok tunnel
    ├── setup-ngrok.ps1             # Initial Ngrok configuration
    └── seed_data.ps1               # Populate sample data
```

---

## Getting Started

### 1. Clone the Repository

```powershell
git clone <repository-url>
cd <project-directory>
```

Alternatively, extract the project archive to a local directory (e.g., `D:\codedesign`) and open it in your IDE.

### 2. Configure Ngrok

Ensure `ngrok.exe` is present in the project root. To perform an initial setup:

```powershell
.\scripts\setup-ngrok.ps1
```

> **Note:** Environment variables are pre-configured in `docker-compose.local.yml` with sensible defaults and require no changes for a standard local setup.

---

## Running the System

### Recommended — One Command Startup

```powershell
.\scripts\start-all.ps1
```

This script performs the following actions automatically:

1. Starts all Docker containers (databases, Redis, RabbitMQ, MinIO, microservices, Nginx)
2. Opens an Ngrok tunnel on port 80 and prints the public URL

### Check System Status

```powershell
.\scripts\check-status.ps1
```

### Stop the System

```powershell
.\scripts\stop-all.ps1
```

---

### Manual Startup (Advanced)

**Step 1 — Start Docker containers:**

```powershell
docker-compose -f docker-compose.local.yml up -d
```

**Step 2 — Open a public tunnel via Ngrok:**

```powershell
.\scripts\start-ngrok.ps1
# or
.\ngrok.exe http 80
```

**Step 3 — Verify container status:**

```powershell
docker-compose -f docker-compose.local.yml ps
```

**Step 4 — View live logs (optional):**

```powershell
docker-compose -f docker-compose.local.yml logs -f
```

> For additional startup options, see [`START_SERVER.md`](START_SERVER.md) and [`QUICK_START.md`](QUICK_START.md).

---

## Accessing the Platform

| Interface | URL |
|---|---|
| **Frontend** (Nginx) | `http://localhost` |
| **Public URL** (Ngrok) | Displayed in the Ngrok terminal window |
| Auth API Docs | `http://localhost:8001/docs` |
| Users API Docs | `http://localhost:8002/docs` |
| Projects API Docs | `http://localhost:8003/docs` |
| Search API Docs | `http://localhost:8004/docs` |
| Payments API Docs | `http://localhost:8005/docs` |
| Messaging API Docs | `http://localhost:8006/docs` |
| Notifications API Docs | `http://localhost:8007/docs` |
| Admin API Docs | `http://localhost:8008/docs` |
| Analytics API Docs | `http://localhost:8009/docs` |

---

## Seeding Sample Data

After the containers are running, populate the database with sample data:

```powershell
.\scripts\seed_data.ps1
```

**Default credentials after seeding:**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@codedesign.com` | `admin123` |
| Freelancer | `freelancer1@codedesign.com` | `freelancer123` |
| Client | `client1@codedesign.com` | `client123` |

---

## Serving the Frontend

### Option 1 — Docker / Nginx (Recommended)

The `frontend/public` directory is automatically mounted into the Nginx container and served at `http://localhost` when the system starts. No additional steps required.

### Option 2 — Standalone Static Server (No Backend)

If you only need to preview the frontend UI without running backend services:

**Using Node.js:**

```powershell
cd frontend/public
npx serve -l 8080 .
```

**Using Python:**

```powershell
cd frontend/public
python -m http.server 8080
```

Open `http://localhost:8080` in your browser.

> **Warning:** API-dependent features will not function without the full Docker stack running. Most pages require the backend APIs proxied through Nginx at `http://localhost`.

---

## Port Reference

| Service | Port |
|---|---|
| Nginx (Frontend + Reverse Proxy) | `80` |
| Auth Service | `8001` |
| User Service | `8002` |
| Project Service | `8003` |
| Search Service | `8004` |
| Payments Service | `8005` |
| Messaging Service | `8006` |
| Notifications Service | `8007` |
| Admin Service | `8008` |
| Analytics Service | `8009` |

---

## Troubleshooting

| Symptom | Resolution |
|---|---|
| **Docker containers fail to start** | Open Docker Desktop and wait for it to reach a running state before executing scripts. |
| **Port 80 already in use** | Stop any service occupying port 80, or update the port mapping in `docker-compose.local.yml` and `nginx/nginx.conf`. |
| **Ngrok not found** | Place `ngrok.exe` in the project root, or install via Chocolatey: `choco install ngrok`. |
| **API calls failing** | Confirm all containers are healthy with `.\scripts\check-status.ps1` and review logs with `docker-compose -f docker-compose.local.yml logs -f`. |

---

## Quick Reference

```powershell
# Start everything
.\scripts\start-all.ps1

# Stop everything
.\scripts\stop-all.ps1

# Check health
.\scripts\check-status.ps1
```

---

*For questions or contributions, please open an issue or submit a pull request.*