# API de productos

Backend del challenge. Las instrucciones completas de instalación y las decisiones de diseño están en el [README principal](../README.md).

Comandos útiles durante el desarrollo:

```bash
npm run start:dev    # levanta la api con recarga
npm run lint
npm run test
npx prisma migrate dev   # nueva migración a partir del schema
npx prisma studio        # explorar la base
```

La api necesita el mysql de docker corriendo (`docker compose up db` desde la raíz) y un `.env` copiado de `.env.example`.
