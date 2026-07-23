# etapa de compilacion
FROM node:20-alpine AS constructor
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# etapa final: solo lo necesario para correr
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# el motor de prisma necesita openssl, alpine no lo trae
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=constructor /app/dist ./dist

RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp && chown -R nodeapp:nodeapp /app
USER nodeapp

EXPOSE 3000

# aplica las migraciones pendientes antes de levantar la api
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
