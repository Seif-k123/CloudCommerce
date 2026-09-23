# ☁️ CloudCommerce

> **Production-inspired Cloud-Native E-Commerce Platform demonstrating modern CI/CD, GitOps, Kubernetes, security, and automated application delivery.**

CloudCommerce is a cloud-native e-commerce platform built to demonstrate a realistic **DevOps workflow from source code to a running Kubernetes workload**.

The project combines automated testing, SonarQube analysis, Docker image management with Nexus, Helm-based Kubernetes deployment, and ArgoCD GitOps synchronization.

---

## 🏗️ Architecture

CloudCommerce follows a CI → Registry → GitOps → Kubernetes delivery flow:

```text
Developer
    │
    ▼
  GitHub
    │
    ▼
GitHub Actions
    │
    ├── Tests
    ├── SonarQube Analysis
    ├── Docker Build
    ├── Push Image → Nexus
    └── Update Helm Image Tag
              │
              ▼
       GitHub Repository
              │
              ▼
           ArgoCD
              │
              ▼
      Kubernetes / Minikube
              │
       ┌──────┴──────┐
       ▼             ▼
   Frontend        Backend
                      │
                      ▼
                  PostgreSQL
```

### 📐 Architecture Diagram

> **Image location in the repository:** `docs/images/cloudcommerce-architecture.png`

<p align="center">
  <img src="docs/images/cloudcommerce-architecture.png" alt="CloudCommerce Architecture Diagram" width="100%">
</p>

---

## 🚀 Key Features

- 🔄 Automated CI/CD with GitHub Actions
- 🧪 Automated backend testing with Jest
- 🔍 SonarQube code quality and security analysis
- 🐳 Docker containerization
- 📦 Private Docker registry with Nexus Repository
- ☸️ Kubernetes orchestration
- 📦 Helm-based Kubernetes deployments
- 🌿 GitOps with ArgoCD
- 📈 Horizontal Pod Autoscaling
- 🔐 Kubernetes RBAC and NetworkPolicies
- 🛡️ Non-root container execution
- ❤️ Startup, liveness, and readiness probes
- 🔁 RollingUpdate deployments
- 🔎 Git SHA-based image versioning
- ⚡ Path-based pipeline optimization

---

# 🔄 CI/CD Pipeline

Every backend change pushed to `main` can follow this automated flow:

```text
Code Push
    ↓
Backend Tests
    ↓
SonarQube Analysis
    ↓
Docker Build
    ↓
Push Image to Nexus
    ↓
Update Helm Image Tag
    ↓
Git Commit
    ↓
ArgoCD Auto Sync
    ↓
Kubernetes Rollout
```

Docker images are tagged using the **Git commit SHA**, creating a traceable relationship between source code, container image, and deployment.

```text
Git Commit
    ↕
Docker Image
    ↕
Helm Release
    ↕
Kubernetes Workload
```

---

# 🌿 GitOps with ArgoCD

ArgoCD continuously reconciles the Kubernetes cluster with the desired state stored in Git.

```text
GitHub Repository
       │
       │ Desired State
       ▼
     ArgoCD
       │
       │ Auto Sync
       ▼
 Kubernetes Cluster
```

GitHub Actions does **not** directly deploy the application using `kubectl`.

Instead:

> **Git is the source of truth.**

This keeps CI and CD responsibilities separated.

### 📸 ArgoCD Dashboard

> **Image location in the repository:** `docs/images/argocd-dashboard.png`

<p align="center">
  <img src="docs/images/argocd-dashboard.png" alt="CloudCommerce ArgoCD Dashboard" width="90%">
</p>

---

# 🛠️ Technology Stack

| Category | Technology |
|---|---|
| Backend | Node.js 22 / Express |
| Frontend | HTML / Nginx |
| Database | PostgreSQL |
| Containers | Docker |
| Registry | Nexus Repository |
| Orchestration | Kubernetes |
| Packaging | Helm |
| GitOps | ArgoCD |
| CI | GitHub Actions |
| Code Quality | SonarQube |
| Ingress | NGINX Ingress Controller |
| Autoscaling | Kubernetes HPA |
| Security | RBAC / NetworkPolicies |
| Configuration | ConfigMaps / Secrets |
| Health Management | Startup / Liveness / Readiness Probes |

---

# ☸️ Kubernetes Architecture

CloudCommerce runs in the `ecommerce` namespace.

```text
                    NGINX Ingress
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
         Frontend                Backend
          Service                Service
              │                     │
              ▼                     ▼
       Frontend Pods          Backend Pods
                                    │
                                    ▼
                               PostgreSQL
```

## Backend

- Node.js 22
- Express
- Kubernetes Service on port `5000`
- HPA: 3–10 replicas
- Startup probe
- Liveness probe
- Readiness probe
- CPU and memory requests/limits
- Dedicated ServiceAccount
- RBAC permissions
- NetworkPolicy restrictions
- RollingUpdate strategy
- Non-root container execution

## Frontend

- Nginx
- 3 replicas
- ClusterIP Service
- Exposed through NGINX Ingress

## PostgreSQL

- Internal database service
- Port `5432`
- Backend-only access through NetworkPolicy

---

# 📈 Horizontal Pod Autoscaling

The backend uses Kubernetes **Horizontal Pod Autoscaler (HPA)**.

| Setting | Value |
|---|---:|
| Minimum replicas | 3 |
| Maximum replicas | 10 |
| CPU target | 70% |

```text
             CPU Utilization
                    │
                    ▼
                 ┌─────┐
                 │ HPA │
                 └──┬──┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
       Scale Up            Scale Down
```

The HPA allows the backend workload to adapt automatically to CPU utilization.

---

# 🔐 Security

Security is implemented across multiple layers.

## Network Security

NetworkPolicies use a **default-deny** approach.

Allowed application flow:

```text
Ingress / Frontend
        │
        ▼
     Backend
        │
        ▼
    PostgreSQL
```

DNS traffic required by workloads is explicitly allowed.

## RBAC

The backend uses a dedicated ServiceAccount:

```text
backend-sa
```

with limited Pod permissions:

```text
get
list
watch
```

## Container Security

The backend container runs as the non-root `node` user.

## Resource Controls

```text
Requests:
CPU:    100m
Memory: 128Mi

Limits:
CPU:    500m
Memory: 512Mi
```

## Secrets

Sensitive credentials are kept outside Git and injected through Kubernetes Secrets.

> **No plaintext credentials are committed to the repository.**

---

# 🧪 Testing & Code Quality

The backend uses Jest for automated tests.

The CI pipeline runs tests before the Docker image is built.

```text
Install Dependencies
        ↓
    Run Tests
        ↓
  SonarQube Scan
        ↓
   Docker Build
```

SonarQube is used for automated code-quality and security analysis.

Coverage reporting is integrated through the Jest LCOV report.

---

# 🐳 Docker & Nexus

The backend is packaged as a Docker image and pushed to a private Nexus Docker registry.

```text
Nexus Docker Registry
107.21.92.37:8082
```

Image format:

```text
ecommerce-backend:<git-sha>
```

Example:

```text
ecommerce-backend:<commit-sha>
```

Using Git SHA tags provides immutable, traceable application versions.

> **Note:** The current lab environment uses an HTTP/insecure Nexus registry configuration. A production deployment should use HTTPS/TLS.

---

# 🔍 SonarQube

SonarQube is integrated into GitHub Actions to analyze the backend before container delivery.

The analysis covers:

- Code quality
- Reliability
- Security
- Security hotspots
- Test coverage

The SonarQube stage runs before the Docker image is built.

---

# 📦 Helm

Kubernetes resources are packaged using a Helm chart:

```text
helm/
└── ecommerce/
    ├── Chart.yaml
    ├── values.yaml
    └── templates/
```

The chart manages:

- Deployments
- Services
- ConfigMaps
- HPA
- Ingress
- ServiceAccount
- RBAC
- NetworkPolicies

The backend image tag is automatically updated by the CI pipeline.

---

# 🔁 Automated Image Promotion

A backend change creates a complete delivery chain:

```text
Git Commit
    │
    ▼
GitHub Actions
    │
    ├── Tests
    └── SonarQube
    │
    ▼
Docker Build
    │
    ▼
Nexus Registry
    │
    ▼
Update Helm values.yaml
    │
    ▼
Git Commit
    │
    ▼
ArgoCD
    │
    ▼
Kubernetes
```

This provides end-to-end traceability from source code to the running workload.

---

# 🧠 Smart Pipeline Behavior

The workflow uses path-based change detection.

### Documentation / CI-only change

```text
README.md
docs/
.github/workflows/
       │
       ▼
Tests + SonarQube
       │
       ▼
      STOP
```

### Backend change

```text
app/backend/**
       │
       ▼
Tests + SonarQube
       │
       ▼
Docker Build
       │
       ▼
Nexus
       │
       ▼
Helm Update
       │
       ▼
ArgoCD
       │
       ▼
Kubernetes
```

A manual `workflow_dispatch` trigger is also available for a full pipeline execution.

---

# 🔁 Rolling Updates

The backend Deployment uses Kubernetes **RollingUpdate**:

```yaml
maxUnavailable: 0
maxSurge: 1
```

Deployment flow:

```text
Old Pods
   │
   ▼
Create New Pod
   │
   ▼
Health Checks
   │
   ▼
New Pod Ready
   │
   ▼
Traffic moves to new version
```

This allows application versions to be updated without intentionally taking all backend replicas offline.

---

# 🌐 Ingress Routing

NGINX Ingress Controller manages application routing.

Host:

```text
ecommerce.local
```

Routes:

```text
/api/*  → backend:5000
/*      → frontend:80
```

Traffic flow:

```text
User
 │
 ▼
NGINX Ingress
 │
 ├── / ──────► Frontend
 │
 └── /api ───► Backend
                    │
                    ▼
                PostgreSQL
```

---

# 🔌 Application Endpoints

The backend exposes health and application endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/liveness` | Liveness check |
| GET | `/readiness` | Readiness check |
| GET | `/health` | Application health |
| GET | `/api/products` | Product API |

---

# 📁 Project Structure

```text
CloudCommerce/
│
├── app/
│   ├── backend/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── package-lock.json
│   │
│   └── frontend/
│       ├── Dockerfile
│       ├── index.html
│       └── nginx.conf
│
├── helm/
│   └── ecommerce/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│
├── k8s/
│   └── ...
│
├── docs/
│   └── images/
│       ├── cloudcommerce-architecture.png
│       └── argocd-dashboard.png
│
├── .github/
│   └── workflows/
│       └── cloudcommerce-ci-cd.yml
│
├── sonar-project.properties
│
└── README.md
```

---

# 🧰 Local Development

## Prerequisites

- Docker
- Kubernetes
- kubectl
- Helm
- Git
- Node.js 22
- Minikube

## Start Minikube

```bash
minikube start --driver=docker
```

## Create Namespace

```bash
kubectl create namespace ecommerce
```

## Deploy with Helm

```bash
helm install ecommerce ./helm/ecommerce -n ecommerce
```

## Check Workloads

```bash
kubectl get pods -n ecommerce
kubectl get svc -n ecommerce
kubectl get hpa -n ecommerce
kubectl get ingress -n ecommerce
```

---

# 🔄 GitOps Deployment

The ArgoCD Application monitors:

```text
GitHub Repository
      ↓
helm/ecommerce
      ↓
ArgoCD
      ↓
ecommerce namespace
```

The deployment model is:

```text
Git = Desired State
Kubernetes = Current State
ArgoCD = Reconciliation Engine
```

Application:

```text
Name:       cloudcommerce
Source:     helm/ecommerce
Branch:     main
Namespace:  ecommerce
Sync:       Automatic
```

---

# 🧪 Verification

Useful Kubernetes commands:

```bash
kubectl get pods -n ecommerce
```

```bash
kubectl get deployments -n ecommerce
```

```bash
kubectl get hpa -n ecommerce
```

```bash
kubectl get ingress -n ecommerce
```

Check backend rollout:

```bash
kubectl rollout status deployment/backend -n ecommerce
```

Check the deployed image:

```bash
kubectl get deployment backend -n ecommerce \
  -o jsonpath='{.spec.template.spec.containers[0].image}{"\\n"}'
```

Check ArgoCD:

```bash
argocd app get cloudcommerce
```

---

# 🗺️ Future Improvements

The current implementation focuses on **CI/CD, GitOps, Kubernetes security, and automated application delivery**.

Planned extensions:

- 📊 Prometheus + Grafana — monitoring and dashboards
- 📝 Loki + Promtail — centralized logging
- 🚨 Alertmanager — alerting
- 🔒 cert-manager + Let's Encrypt — TLS automation
- 🛡️ Kyverno — Kubernetes policy enforcement
- 💾 Velero — backup and disaster recovery
- 🔐 Vault — advanced secrets management
- 📨 RabbitMQ — message-based communication

These are planned extensions and are **not part of the currently deployed architecture**.

---

# 🎯 Project Goals

CloudCommerce was built to demonstrate practical experience with:

- Containerization
- Kubernetes orchestration
- Helm
- CI/CD automation
- GitOps
- Private container registries
- SonarQube
- Kubernetes RBAC
- Network segmentation
- Health checks
- Horizontal autoscaling
- Rolling deployments
- Deployment automation
- Git-based release traceability

The project is intentionally designed around a realistic DevOps workflow:

```text
Code
 ↓
Test
 ↓
Analyze
 ↓
Build
 ↓
Push
 ↓
Update Git
 ↓
GitOps
 ↓
Deploy
```

---

# 👨‍💻 Author

**Seif Khaled**

DevOps / Cloud Engineering

GitHub: **Seif-k123**

---

## ⭐ CloudCommerce

> **Code → Test → Analyze → Build → Push → GitOps → Deploy**

A practical Cloud-Native DevOps project demonstrating how modern development and operations workflows can work together.
