import os
import time
import subprocess

DESTINO = "8.8.8.8"
INTERVALO = 10
FALHAS_LIMITE = 5
falhas = 0

def tem_internet():
    try:
        subprocess.check_output(["ping", "-c", "1", DESTINO], stderr=subprocess.DEVNULL)
        return True
    except subprocess.CalledProcessError:
        return False

print("🔍 Watchdog iniciado. A monitorizar ligação à internet...")

while True:
    if tem_internet():
        falhas = 0
        print("✅ Internet OK")
    else:
        falhas += 1
        print(f"⚠️ Sem internet ({falhas}/{FALHAS_LIMITE})")

        if falhas >= FALHAS_LIMITE:
            print("🔁 Ligação perdida. Reiniciando gateway...")
            os.system("reboot")
            break

    time.sleep(INTERVALO)
