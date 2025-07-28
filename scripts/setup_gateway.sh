#!/bin/bash
echo "🔧 A preparar o ambiente IoT Gateway..."

sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker

cd ~/gateway_iot_cliente
docker compose up -d --build

echo "✅ Sistema iniciado! A aceder a http://localhost:3000"
