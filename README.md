# Challenge deCampoaCampo — API de productos

API REST para gestionar productos, hecha con NestJS + Prisma + MySQL. Cada producto expone su precio en pesos y el equivalente en dólares calculado a partir de una cotización configurable.

Incluye además un frontend mínimo en PHP para operar el CRUD desde el navegador.

**Demo desplegada en Azure:** el frontend está en https://frontend.calmsmoke-688eecf8.westus2.azurecontainerapps.io y la API en https://api.calmsmoke-688eecf8.westus2.azurecontainerapps.io (Swagger en `/docs`). Ojo: escala a cero cuando está inactiva, el primer request puede tardar unos 30 segundos.

## Arranque rápido

```bash
git clone https://github.com/jonathansansok/campo-a-campo-ch.git
cd campo-a-campo-ch
docker compose up --build
```

No hace falta configurar nada: el compose ya trae las variables con valores para desarrollo. Si querés otra cotización del dólar, `PRECIO_USD=1250 docker compose up --build` y listo.

## Cómo levantar el proyecto

Con Docker Desktop instalado:

```bash
docker compose up --build
```

Eso levanta los cuatro servicios: mysql, rabbitmq, la api (aplica las migraciones sola al arrancar) y el frontend.

- API: `http://localhost:3000` — Swagger en `http://localhost:3000/docs`
- Frontend: `http://localhost:8080`
- Management de RabbitMQ: `http://localhost:15672` (guest/guest)

La cotización se puede cambiar sin tocar nada más: `PRECIO_USD=1250 docker compose up --build`.

### Desarrollo local sin contenedores (opcional)

```bash
docker compose up -d db     # solo la base
cd api
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

Y el frontend con PHP 8 local:

```bash
cd frontend/public
API_URL=http://localhost:3000 php -S localhost:8080
```

## Configuración

Todo sale de variables de entorno (ver `api/.env.example`). `DATABASE_URL` es la conexión a mysql y `PORT` el puerto de la api (3000 por defecto). La más interesante es `PRECIO_USD`, la cotización del dólar en pesos: con `PRECIO_USD=1400`, un producto de $35.000 se muestra como USD 25. La comparten la api, que hace el cálculo, y el frontend, que la muestra en el formulario de alta.

Si falta `DATABASE_URL` o `PRECIO_USD` no es un número válido, la aplicación no arranca: preferí cortar en el boot antes que servir precios rotos.

## Endpoints

El CRUD clásico sobre `/productos`: `GET /productos?page=1&limit=10` devuelve el listado paginado, `GET /productos/:id` el detalle, `POST /productos` da de alta, `PUT /productos/:id` modifica y `DELETE /productos/:id` borra. Aparte hay un `GET /salud` que responde el estado de la app y de la base.

Ejemplo rápido:

```bash
curl -X POST http://localhost:3000/productos \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Alambre de campo", "precio": 35000}'
```

La respuesta incluye `precio_usd` calculado. El resto de los endpoints se puede probar desde Swagger en `/docs`.

## Decisiones de diseño

**El precio en dólares no se persiste.** Se calcula al momento de responder (`precio / PRECIO_USD`). Guardarlo sería duplicar un dato derivado que queda obsoleto con cada cambio de cotización. Aclaración sobre la semántica, porque el enunciado da lugar a dudas: interpreté `PRECIO_USD` como la cotización del dólar en pesos, por eso se divide.

**Prisma como capa de datos.** Queries parametrizadas (SQL injection cubierto de fábrica), migraciones versionadas en el repo y el modelo de la tabla `productos` definido en código. El precio es `DECIMAL(10,2)` — nunca float para dinero.

**La tabla respeta la letra del enunciado.** Columnas `nombre VARCHAR(255)`, `descripcion TEXT`, `created_at` y `updated_at` como `TIMESTAMP` con sus defaults en la base (`ON UPDATE CURRENT_TIMESTAMP` incluido). En el código los campos siguen en camelCase (`creadoEn`, `actualizadoEn`) mapeados con `@map`: la base cumple el contrato pedido y el código mantiene su convención. La migración que renombra las columnas está escrita a mano porque la autogenerada dropeaba y recreaba (perdía datos) y prisma no emite el `ON UPDATE`.

**Una sola conexión a la base.** `PrismaService` es un provider global de Nest: los providers son singleton por defecto, así que toda la app comparte el mismo pool.

**Validación en dos capas.** Los DTOs con class-validator rechazan cualquier body inválido o con campos de más (whitelist estricta). El entorno se valida con zod al arrancar, fail-fast.

**Errores uniformes.** Un filtro global convierte cualquier excepción en JSON con el mismo formato. Los errores no controlados devuelven un 500 genérico y el detalle queda solo en los logs.

**Mensajería como integración no crítica.** Cada alta, modificación o baja publica un evento (`producto.creado`, `producto.actualizado`, `producto.eliminado`) en RabbitMQ, y un consumer en la misma app los escucha y los loguea — es el punto donde se colgaría un downstream real (auditoría, sincronización de catálogo). La decisión importante: la api **no depende del broker**. Si RabbitMQ está caído, el CRUD sigue funcionando y el evento se pierde con un warning en el log. Un CRUD no tiene por qué fallar porque la mensajería esté abajo; si el negocio exigiera entrega garantizada, iría por outbox pattern, que acá sería sobre-ingeniería.

### Sobre el frontend

El frontend no era requisito del challenge; se incluye como demo minimalista de consumo de la API. Se eligió PHP nativo (sin framework) en un servicio separado: demuestra el consumo de la API REST desde otro runtime, alineado con los conocimientos de PHP valorados en la posición, manteniendo el backend 100% en el stack requerido (Node + NestJS).

Es server-side rendering puro: PHP consume la api con cURL y devuelve HTML. Sin dependencias, sin Composer, escapando toda salida con `htmlspecialchars`. El único JavaScript es el `confirm()` antes de borrar.

## Tests

```bash
cd api
npm test
```

Cubren el cálculo de `precio_usd` (incluido el redondeo), la paginación y los casos de error del CRUD, con prisma mockeado. La validación de entorno tiene su propia suite. Además hay un pipeline de GitHub Actions que corre lint, tests, build y la construcción de ambas imágenes docker en cada push.

## Qué haría con más tiempo

- Outbox pattern si los eventos necesitaran entrega garantizada (hoy, con el broker caído, se pierden con un warning)
- Traer la cotización de una API pública (dolarapi.com o el BNA) con caché y TTL, dejando `PRECIO_USD` como fallback si el servicio no responde. El challenge pide la variable de entorno, así que quedó como única fuente
- Índice en `nombre` si el listado creciera y hubiera búsqueda
- Un e2e completo del CRUD contra una base efímera
