# Production Deployment & Infrastructure Guide
**Project:** AI Learning Companion  
**Target Environments:** Local Docker, Cloud Containers (AWS ECS / GCP Cloud Run / Kubernetes)

---

## 1. Overview & Architecture

AI Learning Companion is packaged as containerized microservices ready for zero-downtime deployment:
- **Frontend Service:** High-performance Alpine Nginx container serving pre-compiled static assets and reverse-proxying API traffic.
- **Backend Service:** Asynchronous Python 3.13 FastAPI application served via Uvicorn.
- **Database Service:** PostgreSQL 16 with `pgvector` extension for relational data and high-dimensional vector search.
- **Persistent Storage:** Volume-mounted block storage for user-uploaded educational PDFs.

---

## 2. Docker Compose Deployment (Recommended)

### 2.1 One-Step Deployment
1. Ensure Docker and Docker Compose are installed and running.
2. Clone the repository and configure your `.env` file:
   ```bash
   cp .env.example .env
   ```
   *(Optional)* Add your Google Gemini or OpenAI API key in `.env` if external cloud LLM inference is desired:
   ```env
   LLM_API_KEY="your-gemini-or-openai-api-key"
   ```
   *(If left blank, the application will run seamlessly on the deterministic pedagogical simulation engine).*

3. Build and launch all services:
   ```bash
   docker-compose up -d --build
   ```

4. Verify running containers:
   ```bash
   docker-compose ps
   ```

### 2.2 Endpoint Access
- **Web User Interface:** `http://localhost:3000`
- **FastAPI REST API:** `http://localhost:8000`
- **Interactive OpenAPI Documentation:** `http://localhost:8000/docs`
- **Database Engine:** `localhost:5432`

---

## 3. Cloud Production Deployment

### 3.1 Container Registry Publishing
Build and push images to your cloud registry (e.g. Amazon ECR, Google Artifact Registry, Docker Hub):

```bash
# Tag and push backend
docker build -t your-org/learning-companion-backend:v1.0.0 ./backend
docker push your-org/learning-companion-backend:v1.0.0

# Tag and push frontend
docker build -t your-org/learning-companion-frontend:v1.0.0 ./frontend
docker push your-org/learning-companion-frontend:v1.0.0
```

### 3.2 Kubernetes Deployment Manifest Example
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: learning-companion-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-org/learning-companion-backend:v1.0.0
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        livenessProbe:
          httpGet:
            path: /api/system/status
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/system/status
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## 4. Database Setup & PostgreSQL pgvector

When deploying with a managed PostgreSQL instance (e.g. AWS RDS, GCP Cloud SQL, Supabase):

1. **Enable pgvector extension:**
   Connect to your database as superuser and execute:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Run Schema Initialization:**
   The backend automatically initializes tables on startup via SQLAlchemy ORM:
   ```python
   # Initialized in backend/app/main.py:
   Base.metadata.create_all(bind=engine)
   ```

---

## 5. Reverse Proxy & SSL (HTTPS) Configuration

For standalone virtual machines (e.g., Ubuntu on AWS EC2 or DigitalOcean), configure Nginx with automated Let's Encrypt certificates:

```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
```

Configure `/etc/nginx/sites-available/learning-companion`:
```nginx
server {
    server_name learningcompanion.yourdomain.edu;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 30M;
    }
}
```

Enable SSL:
```bash
sudo ln -s /etc/nginx/sites-available/learning-companion /etc/nginx/sites-enabled/
sudo certbot --nginx -d learningcompanion.yourdomain.edu
```

---

## 6. Backup & Recovery Operations

### 6.1 Database Backup
```bash
# Automated daily cron backup
pg_dump -U postgres -h localhost -d ai_learning_companion -Fc > /backups/db_$(date +%Y%m%d_%H%M%S).dump
```

### 6.2 Uploaded Documents Backup
Ensure the `/app/uploads` volume is synchronized to durable cloud object storage (e.g., Amazon S3 or Google Cloud Storage):
```bash
aws s3 sync ./backend/uploads s3://your-learning-companion-backups/uploads/
```
