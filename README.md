# Challenge deCampoaCampo — API de productos

API REST para gestionar productos, hecha con NestJS + Prisma + MySQL. Cada producto expone su precio en pesos y el equivalente en dólares calculado a partir de una cotización configurable.

Incluye además un frontend mínimo en PHP para operar el CRUD desde el navegador.

## Cómo levantar el proyecto

Por ahora el arranque es en dos partes (el compose completo con la api adentro está en camino):

```bash
# 1. base de datos
docker compose up -d db

# 2. api
cd api
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

La api queda en `http://localhost:3000` y la documentación interactiva en `http://localhost:3000/docs`.

Para el frontend hace falta PHP 8 con curl habilitado:

```bash
cd frontend/public
API_URL=http://localhost:3000 php -S localhost:8080
```

## Configuración

Todo sale de variables de entorno (ver `api/.env.example`):

| Variable | Qué es |
|----------|--------|
| `DATABASE_URL` | conexión a mysql |
| `PRECIO_USD` | cotización del dólar en pesos. Con `PRECIO_USD=1400`, un producto de $35.000 se muestra como USD 25 |
| `PORT` | puerto de la api (3000 por defecto) |

Si falta `DATABASE_URL` o `PRECIO_USD` no es un número válido, la aplicación no arranca: preferí cortar en el boot antes que servir precios rotos.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/productos?page=1&limit=10` | listado paginado |
| GET | `/productos/:id` | detalle |
| POST | `/productos` | alta |
| PUT | `/productos/:id` | modificación |
| DELETE | `/productos/:id` | baja |
| GET | `/salud` | estado de la app y la base |

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

**Una sola conexión a la base.** `PrismaService` es un provider global de Nest: los providers son singleton por defecto, así que toda la app comparte el mismo pool.

**Validación en dos capas.** Los DTOs con class-validator rechazan cualquier body inválido o con campos de más (whitelist estricta). El entorno se valida con zod al arrancar, fail-fast.

**Errores uniformes.** Un filtro global convierte cualquier excepción en JSON con el mismo formato. Los errores no controlados devuelven un 500 genérico y el detalle queda solo en los logs.

### Sobre el frontend

El frontend no era requisito del challenge; se incluye como demo minimalista de consumo de la API. Se eligió PHP nativo (sin framework) en un servicio separado: demuestra el consumo de la API REST desde otro runtime, alineado con los conocimientos de PHP valorados en la posición, manteniendo el backend 100% en el stack requerido (Node + NestJS).

Es server-side rendering puro: PHP consume la api con cURL y devuelve HTML. Sin dependencias, sin Composer, escapando toda salida con `htmlspecialchars`. El único JavaScript es el `confirm()` antes de borrar.

## Pendiente

- Compose completo (api + frontend containerizados, hoy solo la base corre en docker)
- Tests unitarios del service
- Eventos de dominio con RabbitMQ
