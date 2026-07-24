# Challenge deCampoaCampo - API de productos

API REST de productos con NestJS + Prisma + MySQL. Cada producto devuelve su precio en pesos y el equivalente en dólares según la cotización configurada en `PRECIO_USD`. Incluye un frontend chico en PHP para usar el CRUD desde el navegador.

**Demo en Azure:** frontend en https://frontend.calmsmoke-688eecf8.westus2.azurecontainerapps.io y api en https://api.calmsmoke-688eecf8.westus2.azurecontainerapps.io (Swagger en `/docs`). Nota: escala a cero cuando está inactiva, el primer request puede tardar unos 30 segundos.

## Cómo levantarlo

Con Docker Desktop instalado (los comandos andan igual en PowerShell, CMD o Git Bash):

```bash
git clone https://github.com/jonathansansok/campo-a-campo-ch.git
cd campo-a-campo-ch
docker compose up --build
```

Levanta mysql, rabbitmq, la api (aplica las migraciones sola al arrancar) y el frontend. No hay que configurar nada, el compose ya trae valores de desarrollo. La api queda en `http://localhost:3000` (Swagger en `/docs`), el frontend en `http://localhost:8080` y el management de RabbitMQ en `http://localhost:15672` (guest/guest).

Para cambiar la cotización: `PRECIO_USD=1250 docker compose up --build` (en PowerShell: `$env:PRECIO_USD="1250"; docker compose up --build`).

Si se prefiere correr la api sin contenedores: levantar solo la base con `docker compose up -d db`, y dentro de `api/` copiar `.env.example` a `.env`, `npm install`, `npx prisma migrate dev` y `npm run start:dev`. El frontend con PHP 8 local se sirve desde `frontend/public` con `API_URL=http://localhost:3000 php -S localhost:8080` (en PowerShell: `$env:API_URL="http://localhost:3000"; php -S localhost:8080`).

## Requisitos del challenge

Lo pedido por el enunciado y cómo quedó cubierto:

- API en Node.js con NestJS
- Base MySQL con la tabla productos según la estructura pedida (id autoincremental, nombre, descripción, precio decimal, created_at y updated_at con sus defaults)
- Variable de entorno PRECIO_USD: el precio en dólares se calcula en cada respuesta, nunca se guarda en la base
- CRUD completo sobre /productos (listado, detalle, alta, modificación y baja) con respuestas en JSON
- Manejo de errores y excepciones con formato uniforme
- Validaciones básicas y protección contra inyección SQL mediante queries parametrizadas
- Separación de responsabilidades con MVC y singleton para la conexión a la base
- Contenedor para la api, contenedor para MySQL y docker-compose.yml que orquesta todo
- Este README con instalación, configuración y cómo probar la API

## Extras y deseables de la vacante

Cosas que sumé por ser bonus del challenge o deseables de la posición:

- Prisma como ORM, con migraciones versionadas en el repo
- Validaciones con DTOs y documentación Swagger en /docs
- Tests unitarios y e2e con Jest
- Paginación en el listado de productos
- Archivo .env de ejemplo y healthcheck en /salud
- ESLint y Prettier
- RabbitMQ: eventos de alta, modificación y baja (deseable de mensajería)
- Frontend en PHP nativo consumiendo la api (deseable de PHP)
- CI con GitHub Actions: lint, tests, build e imágenes docker en cada push (deseable de CI/CD)
- Despliegue en la nube con Azure Container Apps (deseable de cloud)

## Configuración

Todo sale de variables de entorno (ver `api/.env.example`): `DATABASE_URL` es la conexión a mysql, `PRECIO_USD` la cotización del dólar en pesos, `PORT` el puerto de la api (3000 por defecto) y `RABBITMQ_URL` la conexión al broker, que es opcional: sin ella la mensajería queda deshabilitada. Si falta `DATABASE_URL` o `PRECIO_USD` no es un número válido, la app no arranca: preferí cortar en el boot antes que servir precios rotos.

## Decisiones

La primera decisión fue qué hacer con el precio en dólares. No se guarda en la base porque es un dato derivado: persistirlo lo dejaría obsoleto con cada cambio de cotización, así que se calcula al responder dividiendo el precio en pesos por la cotización. Para la plata usé decimal y no float, que trae errores de redondeo. La tabla respeta la letra del enunciado, con los timestamps y sus defaults resueltos en la base; esa migración la escribí a mano porque la autogenerada dropeaba y recreaba columnas.

En la organización seguí MVC clásico: controller, service y capa de datos, cada uno con su responsabilidad. Prisma me da queries parametrizadas, con lo que la inyección SQL queda cubierta, y migraciones versionadas. La conexión a la base es una sola: el servicio de Prisma es un singleton global y toda la aplicación comparte el mismo pool.

Para los casos que salen del camino feliz razoné en dos capas: los DTOs rechazan bodies inválidos o con campos de más, y el entorno se valida al arrancar; si algo esencial falta o está mal, la app corta en el boot en vez de fallar después en producción. Los errores salen siempre en JSON con el mismo formato gracias a un filtro global, y los no controlados devuelven un 500 genérico con el detalle solo en los logs.

Sobre el alcance, sumé cosas por fuera del enunciado cuidando que no compliquen la entrega. RabbitMQ quedó como integración no crítica: cada operación del CRUD publica un evento y un consumer lo loguea, pero la api no depende del broker; si está caído, el CRUD sigue funcionando y el evento se pierde con un warning. Para entrega garantizada iría un outbox pattern, que acá sería sobre-ingeniería. El frontend no era requisito del challenge; se incluye como demo minimalista de consumo de la API. Se eligió PHP nativo (sin framework) en un servicio separado: demuestra el consumo de la API REST desde otro runtime, alineado con los conocimientos de PHP valorados en la posición, manteniendo el backend 100% en el stack requerido (Node + NestJS).

## Endpoints

El CRUD sobre `/productos`: `GET /productos?page=1&limit=10` lista paginado, `GET /productos/:id` detalle, `POST /productos` alta, `PUT /productos/:id` modificación y `DELETE /productos/:id` baja. Aparte hay un `GET /salud` con el estado de la app y de la base.

```bash
curl -X POST http://localhost:3000/productos \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Alambre de campo", "precio": 35000}'
```

La respuesta incluye `precio_usd` calculado. El resto se puede probar desde Swagger en `/docs`.

## Tests

Los unitarios (con prisma mockeado) cubren el cálculo de `precio_usd`, la paginación, los casos de error del CRUD y la validación de entorno; se corren con `npm test` dentro de `api/`. El e2e ejercita el CRUD completo por HTTP contra una base mysql de prueba (`productos_test`), separada de la de desarrollo: con la base levantada (`docker compose up -d db`), en `api/` hay que apuntar `DATABASE_URL` a `mysql://root:root@localhost:3306/productos_test`, aplicar las migraciones con `npx prisma migrate deploy` y correr `npm run test:e2e`.

El pipeline de GitHub Actions corre lint, unitarios, build, el e2e contra un mysql propio del job y la construcción de ambas imágenes docker en cada push.
