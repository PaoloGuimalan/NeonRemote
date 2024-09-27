FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn

COPY . .

ENV VITE_NEON_AI_API=https://remote-api.neonsystems.net
ENV VITE_JWT_SECRET=neonaiserver12345678

RUN yarn build

FROM node:22-alpine

RUN yarn global add serve

WORKDIR /app

COPY --from=build /app/dist ./dist

EXPOSE 3006

CMD ["serve", "-s", "dist", "-l", "3006"]