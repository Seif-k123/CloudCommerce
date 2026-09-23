# ☁️ CloudCommerce

> **Production-inspired Cloud-Native E-Commerce Platform built with Kubernetes, Helm, GitHub Actions, Nexus, SonarQube, and ArgoCD.**

CloudCommerce is a cloud-native e-commerce application designed to demonstrate a complete **DevOps and GitOps workflow** — from source code and automated testing to containerization, image management, continuous delivery, and Kubernetes deployment.

The project focuses on building a realistic deployment platform rather than simply running an application inside Kubernetes.

---

## 🏗️ Architecture

CloudCommerce follows a complete CI/CD and GitOps deployment lifecycle:

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
    ├── Push Image to Nexus
    └── Update Helm Image Tag
              │
              ▼
        GitHub Repository
              │
              ▼
           ArgoCD
              │
              ▼
        Kubernetes
              │
        ┌─────┴─────┐
        ▼           ▼
    Frontend      Backend
                    │
                    ▼
                PostgreSQL
```

### 📐 CloudCommerce Architecture Diagram

<img width="1531" height="1829" alt="CloudCommerce Architecture" src="https://github.com/user-attachments/assets/a9fed05d-b707-461d-93a8-a77e8af07c33" />

---

# 🚀 Key Features

### 🔄 Complete CI/CD Pipeline

CloudCommerce implements an automated pipeline using GitHub Actions:

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
Kubernetes Deployment
```

The Docker image is tagged using the **Git commit SHA**, providing immutable and traceable image versions.

---

### 🌿 GitOps with ArgoCD

ArgoCD is responsible for continuously synchronizing the Kubernetes environment with the Git repository.

The deployment process follows:

```text
Git Repository
      │
      │ Desired State
      ▼
    ArgoCD
      │
      │ Auto Sync
      ▼
 Kubernetes Cluster
```

GitHub Actions does **not** directly deploy to Kubernetes using `kubectl`.

Instead:

> **Git is the source of truth.**

This provides a clean separation between CI and CD.

### 📸 ArgoCD Dashboard

<p align="center">
  <img src="docs/images/argocd-dashboard.png" alt="CloudCommerce ArgoCD Dashboard" width="90%">
</p>

---

# 🛠️ Technology Stack

| Category           | Technology                            |
| ------------------ | ------------------------------------- |
| Application        | Node.js / Express                     |
| Frontend           | HTML / Nginx                          |
| Backend            | Node.js 22                            |
| Database           | PostgreSQL                            |
| Containers         | Docker                                |
| Container Registry | Nexus Repository                      |
| Orchestration      | Kubernetes                            |
| Packaging          | Helm                                  |
| GitOps             | ArgoCD                                |
| CI                 | GitHub Actions                        |
| Code Quality       | SonarQube                             |
| Ingress            | NGINX Ingress Controller              |
| Autoscaling        | Kubernetes HPA                        |
| Security           | RBAC + NetworkPolicies                |
| Configuration      | ConfigMaps + Kubernetes Secrets       |
| Health Management  | Startup / Liveness / Readiness Probes |

---

# ☸️ Kubernetes Architecture

CloudCommerce runs inside the `ecommerce` namespace.

### Application Components

```text
                    Ingress
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
        Frontend              Backend
        Service               Service
             │                   │
             ▼                   ▼
        Frontend Pods        Backend Pods
                                 │
                                 ▼
                            PostgreSQL
```

### Backend

* Node.js 22
* Express
* 2 configured replicas
* HPA enabled
* Service exposed internally on port `5000`
* Startup probe
* Liveness probe
* Readiness probe
* Resource requests and limits
* Dedicated ServiceAccount
* Node selector
* NetworkPolicy restrictions
* RollingUpdate strategy

### Frontend

* Nginx
* 3 replicas
* ClusterIP Service
* Kubernetes Ingress routing

### PostgreSQL

* Internal database service
* Backend-only access through NetworkPolicy
* Service exposed internally on port `5432`

---

# 📈 Autoscaling

The backend uses Kubernetes **Horizontal Pod Autoscaler (HPA)**.

```text
Minimum replicas: 3
Maximum replicas: 10
CPU target:       70%
```

Conceptually:

```text
              CPU Usage
                  │
                  ▼
             ┌─────────┐
             │   HPA   │
             └────┬────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
   Scale Up              Scale Down
```

This allows the backend workload to automatically adapt to changing CPU utilization.

---

# 🔐 Security

Security is implemented at multiple layers.

### Network Security

The cluster uses Kubernetes **NetworkPolicies** following a default-deny approach.

Traffic is explicitly allowed between:

```text
Ingress / Frontend
        │
        ▼
     Backend
        │
        ▼
    PostgreSQL
```

DNS traffic required by workloads is also explicitly allowed.

### RBAC

The backend uses a dedicated Kubernetes ServiceAccount:

```text
backend-sa
```

with limited permissions instead of using unrestricted access.

The ServiceAccount is allowed to access Pods with:

```text
get
list
watch
```

### Container Security

The backend container runs as the non-root `node` user.

### Resource Controls

The backend defines CPU and memory requests and limits to provide predictable resource allocation.

```text
Requests:
CPU:    100m
Memory: 128Mi

Limits:
CPU:    500m
Memory: 512Mi
```

### Secrets

Sensitive credentials are kept outside Git and injected into Kubernetes through Secrets.

The Nexus registry credentials are also kept outside the repository.

> Plaintext credentials are never committed to Git.

---

# 🧪 CI Pipeline

Pull Requests run the quality stage before changes are merged.

```text
Pull Request
     │
     ▼
Install Dependencies
     │
     ▼
Run Tests
     │
     ▼
SonarQube Analysis
```

For changes pushed to `main`, backend changes continue through the full image delivery pipeline.

The workflow also uses path-based change detection to avoid unnecessary Docker builds when backend code has not changed.

---

# 🐳 Docker & Nexus

The backend is packaged as a Docker image.

Images are pushed to a private Nexus Docker registry.

```text
107.21.92.37:8082
```

Image naming follows:

```text
ecommerce-backend:<git-sha>
```

Example:

```text
ecommerce-backend:a5d3a8a7c02cae47cf60e95f0f5dd366fb5c26d3
```

Using Git SHA tags provides traceability between:

```text
Git Commit
     ↕
Docker Image
     ↕
Kubernetes Deployment
```

Nexus is hosted separately from the Kubernetes cluster.

---

# 🔍 SonarQube

SonarQube is integrated into the CI pipeline to perform automated code-quality and security analysis.

The pipeline checks the backend before the Docker image is built.

```text
Code
 ↓
Tests
 ↓
SonarQube
 ↓
Docker Build
```

This makes code quality analysis part of the automated delivery workflow.

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

Helm manages the application's Kubernetes configuration including:

* Deployments
* Services
* ConfigMaps
* HPA
* Ingress
* ServiceAccount
* RBAC
* NetworkPolicies

The backend image tag is automatically updated by the CI pipeline.

---

# 🔁 Automated Image Promotion

Every backend change pushed to `main` follows this flow:

```text
Git Commit
    │
    ▼
GitHub Actions
    │
    ├── Test
    ├── SonarQube
    │
    ▼
Docker Build
    │
    ▼
Nexus
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

This creates a traceable deployment chain from source code to running workload.

---

# 🧠 Smart Pipeline Behavior

The pipeline avoids unnecessary Docker builds.

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
```

A manual `workflow_dispatch` trigger is also available when a full pipeline execution is required.

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

# 🔌 Application Endpoints

The backend exposes health and application endpoints used by Kubernetes and application testing:

```text
GET /liveness
GET /readiness
GET /health
GET /api/products
```

### Kubernetes Probes

```text
Startup Probe
     ↓
/liveness

Liveness Probe
     ↓
/liveness

Readiness Probe
     ↓
/readiness
```

---

# 🔄 Rolling Updates

The backend Deployment uses a Kubernetes **RollingUpdate** strategy.

```text
maxUnavailable: 0
maxSurge:       1
```

Conceptually:

```text
Old Backend Pods
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

This allows new application versions to be deployed without intentionally taking all backend replicas offline.

---

# 🌐 Ingress Routing

NGINX Ingress Controller manages external application routing.

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
 ├──── / ──────► Frontend
 │
 └──── /api ───► Backend
                       │
                       ▼
                   PostgreSQL
```

---

# 🧰 Local Development

## Prerequisites

* Docker
* Kubernetes
* kubectl
* Helm
* Git
* Node.js 22

For local Kubernetes development, the project can be deployed using Minikube.

---

## Deploy with Helm

Create the namespace:

```bash
kubectl create namespace ecommerce
```

Install the chart:

```bash
helm install ecommerce ./helm/ecommerce \
  -n ecommerce
```

Check the workloads:

```bash
kubectl get pods -n ecommerce
```

Check services:

```bash
kubectl get svc -n ecommerce
```

Check HPA:

```bash
kubectl get hpa -n ecommerce
```

---

# 🔄 GitOps Deployment

ArgoCD is configured to monitor:

```text
GitHub Repository
      ↓
helm/ecommerce
```

The desired state is stored in Git, while ArgoCD continuously reconciles the Kubernetes cluster with that state.

```text
Git = Desired State
Kubernetes = Current State
ArgoCD = Reconciliation Engine
```

The ArgoCD Application uses:

```text
Application: cloudcommerce
Source:      helm/ecommerce
Branch:      main
Namespace:   ecommerce
Sync:        Automatic
```

---

# 🧪 Verification

Useful commands:

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
  -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
```

Check ArgoCD application:

```bash
argocd app get cloudcommerce
```

---

# 🗺️ Future Improvements

The current version focuses on **CI/CD, GitOps, Kubernetes security, and automated application delivery**.

Planned extensions include:

```text
Prometheus
    ↓
Grafana
    ↓
Metrics & Dashboards

Loki + Promtail
    ↓
Centralized Logging

Alertmanager
    ↓
Alerting

cert-manager
    ↓
TLS / Let's Encrypt

Kyverno
    ↓
Kubernetes Policy Enforcement

Velero
    ↓
Backup & Disaster Recovery

Vault
    ↓
Advanced Secrets Management

RabbitMQ
    ↓
Message-Based Communication
```

These components are planned extensions and are **not part of the currently deployed architecture**.

---

# 🎯 Project Goals

CloudCommerce was built to demonstrate practical experience with:

* Containerization
* Kubernetes orchestration
* Helm-based deployments
* CI/CD automation
* GitOps
* Private container registries
* Code quality and security scanning
* Kubernetes RBAC
* Network segmentation
* Health checks
* Horizontal autoscaling
* Rolling deployments
* Deployment automation
* Git-based release traceability

The project is intentionally designed around a **realistic DevOps workflow**, where every deployment can be traced from a Git commit to the running Kubernetes workload.

---

# 👨‍💻 Author

**Seif Khaled**


DevOps / Cloud Engineering

GitHub: **Seif-k123**

---

## ⭐ CloudCommerce

> **Code → Test → Analyze → Build → Push → GitOps → Deploy**

A practical Cloud-Native DevOps project built to demonstrate how modern development and operations workflows can work together.

