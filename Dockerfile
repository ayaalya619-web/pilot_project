FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN DATABASE_URL="postgresql://mock:mock@localhost:5432/mock?schema=public" PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x npx prisma generate

COPY . .

FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app ./

RUN mkdir -p /app/uploads /app/node_modules/prisma/engines && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["npx", "tsx", "src/app.ts"]
