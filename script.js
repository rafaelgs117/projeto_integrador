// Coordenadas de Palhoça, SC
const palhocaLat = -27.6203;
const palhocaLon = -48.6587;

// Inicializa mapa
const map = L.map('mapa').setView([palhocaLat, palhocaLon], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Função para carregar ocorrências do banco
async function carregarOcorrencias() {
  const res = await fetch("listar.php");
  const dados = await res.json();

  const lista = document.getElementById("ocorrencias");
  lista.innerHTML = "<h2>Ocorrências recentes</h2>";

  dados.forEach(item => {
    // Card
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.titulo}</h3>
      <p>${item.descricao}</p>
      ${item.imagem ? `<img src="${item.imagem}" alt="Foto da ocorrência">` : ""}
      <p><strong>Local:</strong> ${item.localizacao}</p>
    `;
    lista.appendChild(card);

    // Marcador no mapa com popup
    if(item.lat && item.lon){
      const conteudo = `
        <b>${item.titulo}</b><br>
        ${item.descricao}<br>
        ${item.imagem ? `<img src="${item.imagem}" style="width:100%; height:auto; border-radius:5px;">` : ""}
      `;
      L.marker([item.lat, item.lon]).addTo(map).bindPopup(conteudo);
    }
  });
}

// Geocoding (Nominatim)
async function buscarCoordenadas(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco + ", Palhoça, SC")}`;
  
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'CidadaoConscienteApp' }});
    const data = await response.json();

    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } else {
      alert("Não foi possível localizar o endereço.");
      return null;
    }
  } catch (error) {
    console.error(error);
    alert("Erro ao buscar coordenadas.");
    return null;
  }
}

// Envio do formulário
document.getElementById("formOcorrencia").addEventListener("submit", async function(e) {
  e.preventDefault();

  const formData = new FormData(this);
  await fetch("salvar.php", { method: "POST", body: formData });

  this.reset();
  carregarOcorrencias();
});

// Clique no mapa para adicionar marcador temporário
map.on('click', function(e) {
  const { lat, lng } = e.latlng;
  const marcador = L.marker([lat, lng]).addTo(map);
  marcador.bindPopup(`<b>Nova ocorrência</b><br>Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`).openPopup();
});

// Carrega ocorrências ao abrir a página
carregarOcorrencias();
