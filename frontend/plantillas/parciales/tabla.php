<?php if (empty($listado['datos'])): ?>
    <p class="vacio">Todavía no hay productos cargados.</p>
<?php else: ?>
    <div class="tabla-envoltorio">
        <table>
            <thead>
            <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th class="numero">Precio (AR)</th>
                <th class="numero">Precio (USD)</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            <?php foreach ($listado['datos'] as $item): ?>
                <tr>
                    <td><?= (int) $item['id'] ?></td>
                    <td><?= htmlspecialchars($item['nombre']) ?></td>
                    <td><?= htmlspecialchars($item['descripcion'] ?? '') ?></td>
                    <td class="numero"><?= number_format($item['precio'], 2, ',', '.') ?></td>
                    <td class="numero"><?= number_format($item['precio_usd'], 2, ',', '.') ?></td>
                    <td class="acciones">
                        <a href="index.php?accion=editar&id=<?= (int) $item['id'] ?>">Editar</a>
                        <form method="post" action="index.php?accion=eliminar"
                              onsubmit="return confirm('¿Eliminar este producto?')">
                            <input type="hidden" name="id" value="<?= (int) $item['id'] ?>">
                            <button type="submit" class="enlace-peligro">Eliminar</button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
<?php endif; ?>
