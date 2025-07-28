# wifi_panel/Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . /app

# Instalações necessárias para Wi-Fi + dbus-python + Flask
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libdbus-1-dev \
    libglib2.0-dev \
    build-essential \
    pkg-config \
    libffi-dev \
    libssl-dev \
    dbus \
    iputils-ping \
    && apt-get clean && rm -rf /var/lib/apt/lists/*


RUN pip install --no-cache-dir -r requirements.txt

# Corre Flask + Watchdog ao mesmo tempo
CMD ["sh", "-c", "python app.py & python watchdog.py"]
