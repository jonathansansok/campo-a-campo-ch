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

Levanta mysql, rabbitmq, la api (aplica las migraciones sola al arrancar) y el frontend. No hay que configurar nada, el compose ya trae valores de desarrollo.

- API: `http://localhost:3000` (Swagger en `/docs`)
- Frontend: `http://localhost:8080`
- Management de RabbitMQ: `http://localhost:15672` (guest/guest)

Para cambiar la cotización: `PRECIO_USD=1250 docker compose up --build` (en PowerShell: `$env:PRECIO_USD="1250"; docker compose up --build`).

### Sin contenedores (opcional)

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

(en PowerShell: `$env:API_URL="http://localhost:3000"; php -S localhost:8080`)

## Configuración

Todo sale de variables de entorno (ver `api/.env.example`):

- `DATABASE_URL`: conexión a mysql
- `PRECIO_USD`: cotización del dólar en pesos. Con 1400, un producto de $35.000 se muestra como USD 25
- `PORT`: puerto de la api (3000 por defecto)
- `RABBITMQ_URL`: conexión al broker (opcional, sin ella la mensajería queda deshabilitada)

Si falta `DATABASE_URL` o `PRECIO_USD` no es un número válido, la app no arranca: preferí cortar en el boot antes que servir precios rotos.

## Endpoints

El CRUD sobre `/productos`: `GET /productos?page=1&limit=10` lista paginado, `GET /productos/:id` detalle, `POST /productos` alta, `PUT /productos/:id` modificación y `DELETE /productos/:id` baja. Aparte hay un `GET /salud` con el estado de la app y de la base.

```bash
curl -X POST http://localhost:3000/productos \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Alambre de campo", "precio": 35000}'
```

La respuesta incluye `precio_usd` calculado. El resto se puede probar desde Swagger en `/docs`.

## Decisiones

- El precio en dólares no se guarda, se calcula al responder (`precio / PRECIO_USD`). Es un dato derivado: guardarlo lo dejaría obsoleto con cada cambio de cotización. Interpreté `PRECIO_USD` como la cotización del dólar en pesos, por eso se divide.
- Prisma como capa de datos: queries parametrizadas (inyección SQL cubierta), migraciones versionadas en el repo. `precio` es `DECIMAL(10,2)`, nunca float para plata.
- La tabla respeta la letra del enunciado: `nombre VARCHAR(255)`, `descripcion TEXT`, `created_at`/`updated_at` como `TIMESTAMP` con sus defaults en la base, `ON UPDATE CURRENT_TIMESTAMP` incluido. Esa migración está escrita a mano porque la autogenerada dropeaba y recreaba columnas.
- Una sola conexión a la base: `PrismaService` es un provider global de Nest (singleton), toda la app comparte el mismo pool. La estructura general es MVC: controller, service, capa de datos.
- Validación en dos capas: los DTOs con class-validator rechazan bodies inválidos o con campos de más, y el entorno se valida con zod al arrancar.
- Errores siempre en JSON con el mismo formato, vía un filtro global. Los no controlados devuelven un 500 genérico y el detalle queda solo en los logs.
- RabbitMQ como integración no crítica: cada alta, modificación o baja publica un evento (`producto.creado`, etc.) y un consumer en la misma app lo loguea. La api no depende del broker: si rabbit está caído el CRUD sigue funcionando y el evento se pierde con un warning. Para entrega garantizada iría un outbox pattern, que acá sería sobre-ingeniería.

El frontend no era parte del challenge, lo sumé como demo de consumo de la api desde otro runtime. PHP nativo sin framework, server-side puro con cURL, toda salida escapada con `htmlspecialchars`.

## Tests

Unitarios (con prisma mockeado): cálculo de `precio_usd`, paginación, casos de error del CRUD y validación de entorno.

```bash
cd api
npm test
```

E2e: el CRUD completo por HTTP contra una base mysql de prueba (`productos_test`), separada de la de desarrollo.

```bash
docker compose up -d db
cd api
export DATABASE_URL="mysql://root:root@localhost:3306/productos_test"
npx prisma migrate deploy
npm run test:e2e
```

(en PowerShell: `$env:DATABASE_URL="mysql://root:root@localhost:3306/productos_test"`)

El pipeline de GitHub Actions corre lint, unitarios, build, el e2e contra un mysql propio del job y la construcción de ambas imágenes docker en cada push.

## Qué haría con más tiempo

- Outbox pattern si los eventos necesitaran entrega garantizada
- Traer la cotización de una API pública (dolarapi.com o el BNA) con caché, dejando `PRECIO_USD` de fallback. El challenge pide la variable de entorno, así que quedó como única fuente
- Índice en `nombre` si el listado creciera y hubiera búsqueda
