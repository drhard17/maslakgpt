#Build stage
FROM node:alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

#Production stage
FROM node:alpine AS production
WORKDIR /app
COPY package*.json .
# COPY .env ./
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
CMD ["node", "dist/bot.js"]