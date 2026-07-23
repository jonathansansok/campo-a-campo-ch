<?php

/** @var ClienteApi $api */

$error = null;
$producto = ['nombre' => '', 'descripcion' => '', 'precio' => ''];

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
        $api->post('/productos', $datos);
        header('Location: index.php?ok=' . urlencode('Producto creado'));
        exit;
    } catch (RuntimeException $problema) {
        $error = $problema->getMessage();
    }
}

$titulo = 'Nuevo producto';
$destino = 'index.php?accion=crear';

ob_start();
require __DIR__ . '/../../plantillas/parciales/formulario.php';
$contenido = ob_get_clean();

require __DIR__ . '/../../plantillas/base.php';
