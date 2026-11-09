# syntax=docker/dockerfile:1

# ---------- Etapa 1: build com Maven + JDK 21 ----------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -B -q dependency:go-offline
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -q package -DskipTests

# ---------- Etapa 2: imagem final só com o JRE ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/token-1.0.0.jar app.jar
# O banco H2 é gravado em /app/data (montado como volume no docker-compose)
RUN mkdir -p /app/data
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
