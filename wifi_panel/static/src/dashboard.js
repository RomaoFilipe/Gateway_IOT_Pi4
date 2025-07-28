document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  let logs = [];
  let sensorData = {
    temperature: 25.4,
    humidity: 68,
    soilMoisture: 45,
    lightIntensity: 780,
    windSpeed: 12.3
  };
  let mqttStatus = "connected";
  let gatewayIP = "";

  function getStatusColor(status) {
    switch (status) {
      case "success": return "green";
      case "warning": return "orange";
      case "error": return "red";
      default: return "gray";
    }
  }

  function createLogElement(log) {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.padding = "0.25rem 0.5rem";
    div.style.borderBottom = "1px solid #ddd";
    div.style.color = getStatusColor(log.status);
    div.textContent = `[${log.timestamp}] ${log.message}`;
    return div;
  }

  function render() {
    root.innerHTML = "";

    const container = document.createElement("div");
    container.style.padding = "1rem";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.color = "#333";

    const header = document.createElement("h1");
    header.textContent = "Dashboard Gateway IoT Agrícola";
    header.style.fontSize = "2rem";
    header.style.marginBottom = "1rem";
    container.appendChild(header);

    // IP do Gateway
    const ipInfo = document.createElement("div");
    ipInfo.textContent = "🌐 IP do Gateway: http://" + gatewayIP + ":5000";
    ipInfo.style.fontSize = "0.9rem";
    ipInfo.style.color = "#555";
    ipInfo.style.marginBottom = "1.5rem";
    container.appendChild(ipInfo);

    // MQTT status
    const mqttStatusDiv = document.createElement("div");
    mqttStatusDiv.textContent = "Status MQTT: " + (mqttStatus === "connected" ? "Conectado" : "Desconectado");
    mqttStatusDiv.style.color = mqttStatus === "connected" ? "green" : "red";
    mqttStatusDiv.style.marginBottom = "1rem";
    container.appendChild(mqttStatusDiv);

    // Sensor Data
    const sensorDataDiv = document.createElement("div");
    sensorDataDiv.style.marginBottom = "1rem";
    sensorDataDiv.innerHTML = `
      <strong>Temperatura:</strong> ${sensorData.temperature.toFixed(1)}°C<br>
      <strong>Humidade do Ar:</strong> ${sensorData.humidity}%<br>
      <strong>Humidade do Solo:</strong> ${sensorData.soilMoisture}%<br>
      <strong>Luminosidade:</strong> ${sensorData.lightIntensity} lux<br>
      <strong>Velocidade do Vento:</strong> ${sensorData.windSpeed.toFixed(1)} km/h<br>
    `;
    container.appendChild(sensorDataDiv);

    // Logs
    const logsHeader = document.createElement("h2");
    logsHeader.textContent = "Logs Recentes";
    logsHeader.style.marginBottom = "0.5rem";
    container.appendChild(logsHeader);

    const logsContainer = document.createElement("div");
    logsContainer.style.height = "300px";
    logsContainer.style.overflowY = "auto";
    logsContainer.style.border = "1px solid #ccc";
    logsContainer.style.padding = "0.5rem";
    logsContainer.style.background = "#f9f9f9";

    logs.forEach(log => {
      logsContainer.appendChild(createLogElement(log));
    });

    container.appendChild(logsContainer);

    root.appendChild(container);
  }

  function simulate() {
    const types = ["mqtt", "sensor", "system"];
    const statuses = ["success", "warning", "error"];
    const messages = {
      mqtt: [
        "Mensagem MQTT recebida: sensor/temperature",
        "Publicação MQTT: gateway/status",
        "Conexão MQTT estabelecida",
        "Tópico subscrito: sensors/data"
      ],
      sensor: [
        "Leitura de temperatura: 25.4°C",
        "Umidade do solo: 45%",
        "Sensor de luz: 780 lux",
        "Velocidade do vento: 12.3 km/h"
      ],
      system: [
        "Gateway online",
        "Backup de dados realizado",
        "Atualização de firmware disponível",
        "Monitoramento ativo"
      ]
    };

    const type = types[Math.floor(Math.random() * types.length)];
    const status = Math.random() > 0.8 ? statuses[Math.floor(Math.random() * statuses.length)] : "success";

    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message: messages[type][Math.floor(Math.random() * messages[type].length)],
      status
    };

    logs.unshift(newLog);
    if (logs.length > 20) logs.pop();

    sensorData.temperature += (Math.random() - 0.5) * 0.5;
    sensorData.humidity = Math.min(100, Math.max(0, sensorData.humidity + (Math.random() - 0.5) * 2));
    sensorData.soilMoisture = Math.min(100, Math.max(0, sensorData.soilMoisture + (Math.random() - 0.5) * 2));
    sensorData.lightIntensity = Math.max(0, sensorData.lightIntensity + (Math.random() - 0.5) * 20);
    sensorData.windSpeed = Math.max(0, sensorData.windSpeed + (Math.random() - 0.5) * 1);

    if (Math.random() > 0.95) {
      mqttStatus = mqttStatus === "connected" ? "disconnected" : "connected";
    }

    render();
  }

  // Obter o IP antes de renderizar
  fetch('/api/ip')
    .then(res => res.json())
    .then(data => {
      gatewayIP = data.ip;
      render(); // só renderiza depois de ter IP
      setInterval(simulate, 2000);
    });
});
