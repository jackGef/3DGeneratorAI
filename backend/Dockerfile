FROM node:20-alpine
WORKDIR /app

# Install deps (works with or without package-lock.json)
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Runtime
EXPOSE 8080
CMD ["node", "dist/index.js"]
