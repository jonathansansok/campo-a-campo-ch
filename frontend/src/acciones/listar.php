<?php

/** @var ClienteApi $api */

$pagina = isset($_GET['page']) && ctype_digit($_GET['page']) ? (int) $_GET['page'] : 1;

$error = null;
$listado = ['datos' => [], 'total' => 0, 'pagina' => 1, 'totalPaginas' => 0];
try {
    $listado = $api->get("/productos?page=$pagina&limit=10");
} catch (RuntimeException $problema) {
    $error = $problema->getMessage();
}

$titulo = 'Productos';
$mensajeOk = $_GET['ok'] ?? null;

ob_start();
require __DIR__ . '/../../plantillas/parciales/tabla.php';
require __DIR__ . '/../../plantillas/parciales/paginador.php';
$contenido = ob_get_clean();

require __DIR__ . '/../../plantillas/base.php';
