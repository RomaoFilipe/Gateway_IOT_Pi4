from flask import Flask, render_template, request, redirect
import subprocess
import time
import os
import requests

app = Flask(__name__)

WIFI_CONFIG_PATH = "/etc/wpa_supplicant/wpa_supplicant.conf"
LOG_FILE = "gateway.log"


# 🔧 Utilitários
def registar_log(msg):
    timestamp = time.strftime("[%Y-%m-%d %H:%M:%S]")
    with open(LOG_FILE, "a") as f:
        f.write(f"{timestamp} {msg}\n")


def limpar_logs_antigos(max_linhas=500):
    try:
        with open(LOG_FILE, "r") as f:
            linhas = f.readlines()
        if len(linhas) > max_linhas:
            with open(LOG_FILE, "w") as f:
                f.writelines(linhas[-max_linhas:])
    except:
        pass


def tem_internet():
    try:
        subprocess.check_output(["ping", "-c", "1", "8.8.8.8"])
        return True
    except subprocess.CalledProcessError:
        return False


@app.route('/api/sensor_data', methods=['POST'])
def receber_dados_sensor():
    data = request.json
    print("📥 Dados recebidos do Pico:", data)
    registar_log(f"📥 Dados do Pico: {data}")

    try:
        res = requests.post("http://13.48.48.4:3000/api/sensors", json=data)
        registar_log(f"📡 Enviado para site: {res.status_code}")
    except Exception as e:
        registar_log(f"❌ Erro ao enviar para o site: {e}")

    return {"status": "ok"}, 200


@app.route("/")
def index():
    return render_template("wifi.html")

@app.route("/api/ip")
def get_ip():
    try:
        ip = subprocess.check_output("hostname -I", shell=True).decode().split()[0]
    except:
        ip = "192.168.X.X"
    return {"ip": ip}



import socket

@app.route("/loading")
def loading():
    ip = socket.gethostbyname(socket.gethostname())

    # fallback: tenta obter IP real se estiver a devolver "127.0.1.1"
    if ip.startswith("127."):
        try:
            ip = subprocess.check_output("hostname -I", shell=True).decode().split()[0]
        except:
            ip = "192.168.X.X"

    return render_template("loading.html", ip=ip)



@app.route("/logs")
def get_logs():
    try:
        with open(LOG_FILE, "r") as f:
            lines = f.readlines()[-50:]
        return {"logs": lines}
    except Exception as e:
        return {"logs": [f"Erro ao ler logs: {e}"]}


@app.route("/scan_wifi")
def scan_wifi():
    try:
        scan_output = subprocess.check_output(["iwlist", "wlan0", "scan"]).decode("utf-8")

        networks = []
        cells = scan_output.split("Cell ")
        for cell in cells[1:]:
            lines = cell.split("\n")
            ssid = None
            quality = None
            for line in lines:
                line = line.strip()
                if line.startswith("ESSID:"):
                    ssid = line.split(":")[1].strip('"')
                if line.startswith("Quality="):
                    quality = line.split(" ")[0].split("=")[1]
            if ssid and ssid.strip():
                networks.append({"ssid": ssid, "quality": quality})

        registar_log("📡 Scan Wi-Fi executado com sucesso.")
        return {"networks": networks}
    except Exception as e:
        registar_log(f"❌ Erro no scan Wi-Fi: {e}")
        return {"error": str(e)}, 500


@app.route("/connect", methods=["POST"])
def connect():
    ssid = request.form.get("ssid")
    password = request.form.get("password")

    if not ssid:
        registar_log("❌ SSID não fornecido.")
        return "SSID em falta", 400

    try:
        registar_log(f"🛠️ A ligar à rede: {ssid}")

        config = f'''country=PT
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={{
    ssid="{ssid}"
    {'psk="'+password+'"' if password else ''}
}}
'''

        with open(WIFI_CONFIG_PATH, 'w') as f:
            f.write(config)

        if os.path.exists(WIFI_CONFIG_PATH):
            os.chmod(WIFI_CONFIG_PATH, 0o600)

        subprocess.call(['wpa_cli', '-i', 'wlan0', 'reconfigure'])
        time.sleep(5)

        if tem_internet():
            registar_log("✅ Ligado à internet com sucesso.")
            subprocess.call(['systemctl', 'stop', 'hostapd'])
            subprocess.call(['systemctl', 'stop', 'dnsmasq'])
            registar_log("📴 Access Point desativado.")
        else:
            registar_log("⚠️ Ligado à rede, mas sem acesso à internet.")

        limpar_logs_antigos()
        return redirect('/loading')
    except Exception as e:
        registar_log(f"❌ Erro ao configurar rede: {e}")
        return f"Erro ao guardar rede: {e}", 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
