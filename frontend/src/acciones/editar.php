<?php

/** @var ClienteApi $api */

$id = $_GET['id'] ?? '';
if (!ctype_digit($id)) {
    header('Location: index.php');
    exit;
}

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $producto = [
        'nombre'      => trim($_POST['nombre'] ?? ''),
        'descripcion' => trim($_POST['descripcion'] ?? ''),
        'precio'      => $_POST['precio'] ?? '',
    ];
    try {
        $datos = [
            'nombre' => $producto['nombre'],
            'precio' => (float) $producto['precio'],
        ];
        if ($producto['descripcion'] !== '') {
            $datos['descripcion'] = $producto['descripcion'];
        }
        $api->put("/productos/$id", $datos);
        header('Location: index.php?ok=' . urlencode('Producto actualizado'));
        exit;
    } catch (RuntimeException $problema) {
        $error = $problema->getMessage();
    }
} else {
    try {
        $producto = $api->get("/productos/$id");
    } catch (RuntimeException $problema) {
        header('Location: index.php');
        exit;
    }
}

$titulo = "Editar producto #$id";
$destino = "index.php?accion=editar&id=$id";

ob_start();
require __DIR__ . '/../../plantillas/parciales/formulario.php';
$contenido = ob_get_clean();

require __DIR__ . '/../../plantillas/base.php';
