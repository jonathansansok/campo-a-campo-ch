<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= htmlspecialchars($titulo) ?> | deCampoaCampo.com</title>
    <link rel="stylesheet" href="estilos.css">
</head>
<body>
<header class="cabecera">
    <div class="cabecera-interna">
        <span class="marca">deCampoaCampo.com</span>
        <nav>
            <a href="index.php">Productos</a>
            <a href="index.php?accion=crear" class="boton">Nuevo producto</a>
        </nav>
    </div>
</header>

<main class="contenido">
    <h1><?= htmlspecialchars($titulo) ?></h1>

    <?php if (!empty($mensajeOk)): ?>
        <p class="aviso aviso-ok"><?= htmlspecialchars($mensajeOk) ?></p>
    <?php endif; ?>

    <?php if (!empty($error)): ?>
        <p class="aviso aviso-error"><?= htmlspecialchars($error) ?></p>
    <?php endif; ?>

    <?= $contenido ?>
</main>

<footer class="pie">
    <small>Demo de consumo de la API de productos</small>
</footer>
</body>
</html>
