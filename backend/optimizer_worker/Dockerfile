FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
# We assume the build context is the Root or Backend directory.
# Based on project structure, we will expect build from 'backend/' root.
COPY optimizer_worker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend directory content to /app
# This ensures 'database.py' and 'models.py' (siblings) are available
COPY . .

# Set PYTHONPATH to include the /app directory so that 'import database' works from subdir logic
# Or we can run from /app
ENV PYTHONPATH=/app

# Environment variables (To be overridden at runtime)
ENV PYTHONUNBUFFERED=1

# Restart policy is handled by Docker orchestration (Docker Compose or k8s), not Dockerfile.
# But we ensure the script runs forever.
CMD ["python", "optimizer_worker/main.py"]
