FROM node:20-alpine
WORKDIR /app

# Copy lockfile if present; otherwise just package.json
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY tsconfig.json vite.config.ts ./
COPY index.html ./
COPY src ./src

EXPOSE 5173
ENV VITE_API_BASE=${VITE_API_BASE}
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
