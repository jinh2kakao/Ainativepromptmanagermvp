#!/bin/bash

# Create transfer directory
mkdir -p transfer_files

# Copy Backend .env
if [ -f "backend/.env" ]; then
    cp backend/.env transfer_files/backend.env
    echo "Copied backend/.env to transfer_files/backend.env"
else
    echo "Warning: backend/.env not found"
fi

# Copy Frontend .env.local
if [ -f "frontend/.env.local" ]; then
    cp frontend/.env.local transfer_files/frontend.env.local
    echo "Copied frontend/.env.local to transfer_files/frontend.env.local"
else
    echo "Warning: frontend/.env.local not found"
fi

# Copy Keys if they exist
if [ -f "ainative-key.pem" ]; then
    cp ainative-key.pem transfer_files/
    echo "Copied ainative-key.pem"
fi

if [ -f "cloudflare_origin.crt" ]; then
    cp cloudflare_origin.crt transfer_files/
    echo "Copied cloudflare_origin.crt"
fi

if [ -f "cloudflare_origin.key" ]; then
    cp cloudflare_origin.key transfer_files/
    echo "Copied cloudflare_origin.key"
fi

echo "File preparation complete. Please zip the 'transfer_files' directory and transfer it to your Windows machine."
echo "On Windows, rename 'backend.env' to '.env' and place it in the 'backend' folder."
echo "Rename 'frontend.env.local' to '.env.local' and place it in the 'frontend' folder."
