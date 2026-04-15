FROM node:22-alpine as build

# Enable Corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app/

COPY package.json /app/

RUN pnpm install

COPY . .

FROM node:22-alpine as dev

# Enable Corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app/

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app .

USER node

CMD pnpm run dev