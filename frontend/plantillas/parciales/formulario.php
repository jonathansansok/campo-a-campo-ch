<form method="post" action="<?= htmlspecialchars($destino) ?>" class="formulario">
    <label>
        Nombre
        <input type="text" name="nombre" maxlength="100" required
               value="<?= htmlspecialchars($producto['nombre'] ?? '') ?>">
    </label>

    <label>
        Descripción <span class="opcional">(opcional)</span>
        <textarea name="descripcion" maxlength="500" rows="3"><?= htmlspecialchars($producto['descripcion'] ?? '') ?></textarea>
    </label>

    <label>
        Precio en pesos
        <input type="number" name="precio" step="0.01" min="0.01" required
               value="<?= htmlspecialchars((string) ($producto['precio'] ?? '')) ?>">
    </label>

    <div class="formulario-acciones">
        <button type="submit" class="boton">Guardar</button>
        <a href="index.php">Cancelar</a>
    </div>
</form>
