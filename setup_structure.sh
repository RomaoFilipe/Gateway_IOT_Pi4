#!/bin/bash

# Criação das pastas principais
mkdir -p mosquitto/config
mkdir -p mosquitto/data
mkdir -p sensor_gateway
mkdir -p wifi_panel/templates
mkdir -p wifi_panel/static
mkdir -p src/components
mkdir -p src/assets

# Criar ficheiro docker-compose.yml
cat <<EOF > docker-compose.yml
version: '3.9'

services:
  mqtt:
    image: eclipse-mosquitto:2.0
    ports:
      - "1883:1883"
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - ./mosquitto/data:/mosquitto/data
    restart: always

  sensor_gateway:
    build: ./sensor_gateway
    environment:
      API_URL: "http://13.48.48.4:3000"
      API_TOKEN: "abc123supersecreto"
      MQTT_BROKER: mqtt
      MQTT_PORT: 1883
    depends_on:
      - mqtt
    restart: always

  wifi_panel:
    build: ./wifi_panel
    ports:
      - "5000:5000"
    restart: always

  frontend:
    build: ./src
    ports:
      - "3000:3000"
    restart: always
EOF

# Criar Dockerfile base para sensor_gateway
cat <<EOF > sensor_gateway/Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "sensor_gateway.py"]
EOF

# Criar requirements.txt básico para sensor_gateway
cat <<EOF > sensor_gateway/requirements.txt
paho-mqtt
requests
EOF

# Criar Dockerfile básico para wifi_panel
cat <<EOF > wifi_panel/Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . /app

RUN pip install --no-cache-dir flask

CMD ["python", "app.py"]
EOF

# Criar ficheiro básico app.py para wifi_panel
cat <<EOF > wifi_panel/app.py
from flask import Flask, render_template, request, redirect
import os
import subprocess
import time

app = Flask(__name__)

WIFI_CONFIG_PATH = "/etc/wpa_supplicant/wpa_supplicant.conf"

@app.route("/")
def index():
    return render_template("wifi.html")

@app.route("/connect", methods=["POST"])
def connect():
    ssid = request.form.get("ssid")
    password = request.form.get("password")
    if not ssid:
        return "SSID em falta", 400

    try:
        with open(WIFI_CONFIG_PATH, "w") as f:
            f.write(f'''country=PT
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={{
    ssid="{ssid}"
    psk="{password}"
}}''')

        subprocess.call(["sudo", "wpa_cli", "-i", "wlan0", "reconfigure"])
        time.sleep(5)

        return redirect("/")
    except Exception as e:
        return f"Erro ao guardar rede: {e}", 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
EOF

# Criar ficheiros html básicos em wifi_panel/templates

mkdir -p wifi_panel/templates

cat <<EOF > wifi_panel/templates/wifi.html
<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8" />
<title>Configuração Wi-Fi</title>
</head>
<body>
<h1>Configuração Wi-Fi</h1>
<form method="POST" action="/connect">
    <label for="ssid">SSID:</label><br />
    <input type="text" id="ssid" name="ssid" required /><br />
    <label for="password">Password:</label><br />
    <input type="password" id="password" name="password" /><br /><br />
    <button type="submit">Conectar</button>
</form>
</body>
</html>
EOF

# Criar Dockerfile básico para frontend (React)

cat <<EOF > src/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]
EOF

# Criar ficheiros package.json básicos para frontend
cat <<EOF > src/package.json
{
  "name": "iot-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start"
  }
}
EOF

echo "Estrutura criada com sucesso!"
