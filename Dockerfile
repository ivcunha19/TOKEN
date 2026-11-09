# syntax=docker/dockerfile:1
# Imagem única do TOKEN: o build do React é empacotado dentro do jar do Spring Boot
# (mesma origem → a sessão por cookie funciona sem CORS).

# ---------- Etapa 1: front-end (React + Vite + Tailwind) ----------
FROM node:22-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# ---------- Etapa 2: back-end (Maven + JDK 21) ----------
FROM maven:3.9.9-eclipse-temurin-21 AS backend
WORKDIR /build
COPY token/pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -B -q dependency:go-offline
COPY token/src ./src
COPY --from=frontend /frontend/dist ./src/main/resources/static
RUN --mount=type=cache,target=/root/.m2 mvn -B -q package -DskipTests

# ---------- Etapa 3: imagem final só com o JRE ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend /build/target/token-1.0.0.jar app.jar
# O banco H2 é gravado em /app/data (montado como volume no docker-compose)
RUN mkdir -p /app/data
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
