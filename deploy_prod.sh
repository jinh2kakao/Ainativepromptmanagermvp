#!/bin/bash
set -e

# Note: This script assumes you are already logged in to GHCR or have permissions.
# Usage: ./deploy_prod.sh [GH_TOKEN] [GH_USERNAME]

GH_TOKEN=$1
GH_USERNAME=${2:-jinh2kakao}

IMAGE_NAME="ghcr.io/jinh2kakao/ainativepromptmanagermvp/backend:latest"

# Lowercase conversion just in case (though bash variable here is already set)
IMAGE_NAME=$(echo "$IMAGE_NAME" | tr '[:upper:]' '[:lower:]')

echo "1. Login to GHCR (if token provided)"
if [ -n "$GH_TOKEN" ]; then
  echo $GH_TOKEN | docker login ghcr.io -u $GH_USERNAME --password-stdin
else
  echo "No token provided, skipping login (assuming already logged in)..."
fi

echo "2. Pull latest image"
docker pull $IMAGE_NAME

echo "3. Stop and Remove old container"
docker stop backend || true
docker rm backend || true

echo "4. Start new container"
docker run -d -p 8000:8000 --env-file .env --name backend --restart unless-stopped \
  -v /home/ec2-user/credentials.json:/app/credentials.json \
  -v /home/ec2-user/token.json:/app/token.json \
  $IMAGE_NAME

echo "5. Check status"
sleep 5
docker ps
docker logs backend --tail 30
