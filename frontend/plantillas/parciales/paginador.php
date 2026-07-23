<?php if (($listado['totalPaginas'] ?? 0) > 1): ?>
    <nav class="paginador">
        <?php for ($n = 1; $n <= $listado['totalPaginas']; $n++): ?>
            <?php if ($n === (int) $listado['pagina']): ?>
                <span class="pagina-actual"><?= $n ?></span>
            <?php else: ?>
                <a href="index.php?page=<?= $n ?>"><?= $n ?></a>
            <?php endif; ?>
        <?php endfor; ?>
    </nav>
<?php endif; ?>
