<?php
// Conexão com banco
$conn = new mysqli("localhost", "root", "", "cidadao");
if ($conn->connect_error) {
    die("Erro: " . $conn->connect_error);
}

// Dados recebidos
$titulo = $_POST['titulo'];
$descricao = $_POST['descricao'];
$localizacao = $_POST['localizacao'];
$imagemPath = null;

// Upload da imagem (se enviada)
if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] == 0) {
    $pasta = "uploads/";
    if (!is_dir($pasta)) {
        mkdir($pasta, 0777, true);
    }
    $nomeArquivo = time() . "_" . basename($_FILES["imagem"]["name"]);
    $caminho = $pasta . $nomeArquivo;
    if (move_uploaded_file($_FILES["imagem"]["tmp_name"], $caminho)) {
        $imagemPath = $caminho;
    }
}

// Geocoding simples (Nominatim)
$lat = null;
$lon = null;
if (!empty($localizacao)) {
    $url = "https://nominatim.openstreetmap.org/search?format=json&q=" . urlencode($localizacao);
    $opts = [
        "http" => [
            "header" => "User-Agent: CidadaoConscienteApp\r\n"
        ]
    ];
    $context = stream_context_create($opts);
    $res = file_get_contents($url, false, $context);
    $dados = json_decode($res, true);

    if (!empty($dados)) {
        $lat = $dados[0]['lat'];
        $lon = $dados[0]['lon'];
    }
}

// Salvar no banco
$stmt = $conn->prepare("INSERT INTO ocorrencias (titulo, descricao, imagem, localizacao, lat, lon) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssdd", $titulo, $descricao, $imagemPath, $localizacao, $lat, $lon);
$stmt->execute();

$stmt->close();
$conn->close();

echo "OK";
