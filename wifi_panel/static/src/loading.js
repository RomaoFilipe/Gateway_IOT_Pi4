document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  const steps = [
    "Inicializando Gateway IoT...",
    "Verificando sensores...",
    "Conectando ao MQTT...",
    "Carregando interface..."
  ];

  let progress = 0;
  let currentStep = 0;
  let gatewayIP = "";

  // Container do loading
  const container = document.createElement("div");
  container.style.minHeight = "100vh";
  container.style.background = "linear-gradient(to bottom, #4ade80, #16a34a)";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.padding = "2rem";
  container.style.color = "#fff";
  container.style.fontFamily = "Arial, sans-serif";
  root.appendChild(container);

  // Logo
  const logo = document.createElement("img");
  logo.src = "assets/iot-logo.png";
  logo.style.width = "96px";
  logo.style.height = "96px";
  logo.style.marginBottom = "2rem";
  logo.style.animation = "pulseGlow 2s infinite";
  container.appendChild(logo);

  // Título
  const title = document.createElement("h1");
  title.textContent = "Gateway IoT Agrícola";
  title.style.fontSize = "2.5rem";
  title.style.fontWeight = "bold";
  title.style.marginBottom = "1rem";
  container.appendChild(title);

  // Subtítulo
  const subtitle = document.createElement("p");
  subtitle.textContent = "Sistema Profissional de Monitoramento";
  subtitle.style.fontSize = "1.25rem";
  subtitle.style.opacity = "0.9";
  subtitle.style.marginBottom = "1.5rem";
  container.appendChild(subtitle);

  // ⬇️ Aqui mostramos o IP quando chegar
  const ipInfo = document.createElement("p");
  ipInfo.style.fontSize = "0.9rem";
  ipInfo.style.opacity = "0.85";
  ipInfo.style.marginBottom = "2rem";
  container.appendChild(ipInfo);

  // Caixa de progresso
  const progressBox = document.createElement("div");
  progressBox.style.width = "320px";
  progressBox.style.background = "rgba(255, 255, 255, 0.15)";
  progressBox.style.borderRadius = "0.5rem";
  progressBox.style.padding = "1rem";
  container.appendChild(progressBox);

  const stepText = document.createElement("p");
  stepText.textContent = steps[currentStep];
  stepText.style.marginBottom = "0.5rem";
  stepText.style.fontSize = "0.9rem";
  progressBox.appendChild(stepText);

  const progressBarBackground = document.createElement("div");
  progressBarBackground.style.width = "100%";
  progressBarBackground.style.height = "8px";
  progressBarBackground.style.background = "rgba(255,255,255,0.3)";
  progressBarBackground.style.borderRadius = "4px";
  progressBox.appendChild(progressBarBackground);

  const progressBar = document.createElement("div");
  progressBar.style.height = "8px";
  progressBar.style.width = "0%";
  progressBar.style.background = "linear-gradient(90deg, #22c55e, #16a34a)";
  progressBar.style.borderRadius = "4px";
  progressBar.style.transition = "width 0.3s ease-out";
  progressBarBackground.appendChild(progressBar);

  const percentText = document.createElement("p");
  percentText.textContent = "0%";
  percentText.style.fontSize = "0.75rem";
  percentText.style.textAlign = "right";
  percentText.style.marginTop = "0.25rem";
  progressBox.appendChild(percentText);

  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulseGlow {
      0%, 100% { filter: drop-shadow(0 0 5px #22c55e); }
      50% { filter: drop-shadow(0 0 15px #16a34a); }
    }
  `;
  document.head.appendChild(style);

  function updateLoading() {
    progress += 2;
    if (progress > 100) progress = 100;
    progressBar.style.width = progress + "%";
    percentText.textContent = progress + "%";

    if (progress >= 100) {
      clearInterval(progressInterval);
      setTimeout(() => {
        window.location.href = `http://${gatewayIP}:5000`; // redireciona
      }, 1000);
    }

    if (progress % 20 === 0) {
      currentStep = (currentStep + 1) % steps.length;
      stepText.textContent = steps[currentStep];
    }
  }

  const progressInterval = setInterval(updateLoading, 80);

  // Obter o IP via backend Flask
  fetch('/api/ip')
    .then(res => res.json())
    .then(data => {
      gatewayIP = data.ip;
      ipInfo.textContent = `🌐 IP do Gateway: http://${gatewayIP}:5000`;
    })
    .catch(() => {
      ipInfo.textContent = `🌐 IP do Gateway: desconhecido`;
    });
});
