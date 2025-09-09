<?php
$conn = new mysqli("localhost", "root", "", "cidadao");
if ($conn->connect_error) {
    die("Erro: " . $conn->connect_error);
}

$res = $conn->query("SELECT * FROM ocorrencias ORDER BY criado_em DESC");
$dados = [];

while ($row = $res->fetch_assoc()) {
    $dados[] = $row;
}

echo json_encode($dados);
$conn->close();
