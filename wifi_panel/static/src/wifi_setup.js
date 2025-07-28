// wifi_setup.js

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  // Simulação das redes Wi-Fi
  const networks = [
    { ssid: 'Casa_Principal', signal: 85, secured: true },
    { ssid: 'WiFi_Fazenda', signal: 70, secured: true },
    { ssid: 'Rede_Agricola', signal: 60, secured: true },
    { ssid: 'IoT_Network', signal: 45, secured: false },
  ];

  let selectedNetwork = null;
  let password = "";
  let isConnecting = false;
  let isScanning = false;

  // Função para desenhar a UI
  function render() {
    root.innerHTML = ""; // limpa

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

    // Título
    const title = document.createElement("h1");
    title.textContent = "Configuração de Rede Wi-Fi";
    title.style.fontSize = "2.5rem";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "1rem";
    container.appendChild(title);

    // Descrição
    const desc = document.createElement("p");
    desc.textContent = "Conecte o gateway à sua rede Wi-Fi doméstica";
    desc.style.marginBottom = "2rem";
    container.appendChild(desc);

    // Lista redes
    const listContainer = document.createElement("div");
    listContainer.style.width = "320px";
    listContainer.style.maxHeight = "200px";
    listContainer.style.overflowY = "auto";
    listContainer.style.background = "rgba(255,255,255,0.2)";
    listContainer.style.borderRadius = "8px";
    listContainer.style.padding = "0.5rem";
    container.appendChild(listContainer);

    networks.forEach(net => {
      const netEl = document.createElement("div");
      netEl.style.padding = "0.5rem";
      netEl.style.borderRadius = "6px";
      netEl.style.marginBottom = "0.3rem";
      netEl.style.cursor = "pointer";
      netEl.style.display = "flex";
      netEl.style.justifyContent = "space-between";
      netEl.style.alignItems = "center";
      netEl.style.background = (selectedNetwork === net.ssid) ? "rgba(255,255,255,0.4)" : "transparent";

      netEl.addEventListener("click", () => {
        selectedNetwork = net.ssid;
        render();
      });

      const nameSpan = document.createElement("span");
      nameSpan.textContent = net.ssid + (net.secured ? " 🔒" : "");
      netEl.appendChild(nameSpan);

      const signalSpan = document.createElement("span");
      signalSpan.textContent = net.signal + "%";
      netEl.appendChild(signalSpan);

      listContainer.appendChild(netEl);
    });

    // Campo senha
    if (selectedNetwork && networks.find(n => n.ssid === selectedNetwork)?.secured) {
      const passLabel = document.createElement("label");
      passLabel.textContent = "Senha da Rede:";
      passLabel.style.marginTop = "1rem";
      passLabel.style.display = "block";
      container.appendChild(passLabel);

      const passInput = document.createElement("input");
      passInput.type = "password";
      passInput.placeholder = "Digite a senha do Wi-Fi";
      passInput.style.padding = "0.5rem";
      passInput.style.borderRadius = "6px";
      passInput.style.border = "none";
      passInput.style.width = "320px";
      passInput.style.marginBottom = "1rem";
      passInput.value = password;
      passInput.oninput = (e) => {
        password = e.target.value;
      };
      container.appendChild(passInput);
    }

    // Botão conectar
    const btn = document.createElement("button");
    btn.textContent = isConnecting ? "Conectando..." : "Conectar Gateway";
    btn.disabled = isConnecting || !selectedNetwork || (networks.find(n => n.ssid === selectedNetwork)?.secured && !password);
    btn.style.background = "#15803d";
    btn.style.color = "#fff";
    btn.style.padding = "0.75rem 1.5rem";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.cursor = btn.disabled ? "not-allowed" : "pointer";
    btn.style.fontWeight = "bold";
    btn.onclick = async () => {
      if (btn.disabled) return;
      isConnecting = true;
      render();
      await new Promise(r => setTimeout(r, 3000)); // simula conexão
      alert(`Conectado com sucesso à rede ${selectedNetwork}`);
      isConnecting = false;
      render();
      // Aqui podes chamar callback para avançar no fluxo real do app
    };
    container.appendChild(btn);

    root.appendChild(container);
  }

  render();
});
