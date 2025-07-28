import os
import json
import requests
import paho.mqtt.client as mqtt

# ⚙️ Configurações
MQTT_BROKER = os.getenv("MQTT_BROKER", "mqtt")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = "sensors/data"

API_URL = os.getenv("API_URL", "http://localhost:3000")
API_TOKEN = os.getenv("API_TOKEN", "abc123supersecreto")

# 📡 Conexão ao broker
def on_connect(client, userdata, flags, rc, properties=None):
    print("✅ Ligado ao broker MQTT")
    client.subscribe(MQTT_TOPIC)
    print(f"📡 Subscrito ao tópico: {MQTT_TOPIC}")

# 📩 Mensagem recebida
def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        print(f"📥 MQTT recebido em {msg.topic}: {payload}")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_TOKEN}"
        }

        response = requests.post(f"{API_URL}/api/sensor_readings", json=payload, headers=headers)
        if response.status_code == 201:
            print("✅ Enviado para Rails com sucesso.")
        else:
            print(f"⚠️ Erro ao enviar leitura: {response.status_code} - {response.text}")

    except Exception as e:
        print("❌ Erro ao processar mensagem:", e)

# 🚀 Inicialização principal
def main():
    print("🚀 Sensor Gateway a iniciar...")
    client = mqtt.Client(protocol=mqtt.MQTTv5)
    client.on_connect = on_connect
    client.on_message = on_message

    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_forever()
    except Exception as e:
        print("❌ Erro ao conectar ao broker MQTT:", e)

if __name__ == "__main__":
    main()
