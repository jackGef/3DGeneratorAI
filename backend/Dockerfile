FROM node:20-alpine
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Install deps (works with or without package-lock.json)
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Runtime
EXPOSE 8081
CMD ["node", "dist/index.js"]
