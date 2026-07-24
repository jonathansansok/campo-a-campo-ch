<?php

require __DIR__ . '/../src/ClienteApi.php';

$accionesValidas = ['listar', 'crear', 'editar', 'eliminar'];

$accion = $_GET['accion'] ?? 'listar';
if (!in_array($accion, $accionesValidas, true)) {
    http_response_code(404);
    $accion = 'listar';
}

$api = new ClienteApi();
$cotizacion = (float) (getenv('PRECIO_USD') ?: 1400);

require __DIR__ . '/../src/acciones/' . $accion . '.php';
