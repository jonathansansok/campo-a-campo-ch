<?php

/** @var ClienteApi $api */

// solo por POST: un GET no tiene que poder borrar nada
$id = $_POST['id'] ?? '';
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !ctype_digit($id)) {
    header('Location: index.php');
    exit;
}

try {
    $api->delete("/productos/$id");
    header('Location: index.php?ok=' . urlencode('Producto eliminado'));
} catch (RuntimeException $problema) {
    header('Location: index.php?ok=' . urlencode('No se pudo eliminar: ' . $problema->getMessage()));
}
exit;
