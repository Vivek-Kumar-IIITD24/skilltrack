# ----------------------------------
# Stage 1: Build the Application
# ----------------------------------
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# ----------------------------------
# Stage 2: Run the Application
# ----------------------------------
FROM eclipse-temurin:17-jre
WORKDIR /app
# Copy the built JAR file from the previous stage
COPY --from=build /app/target/skilltrack-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080 (standard for Spring Boot)
EXPOSE 8080

# Command to start the app
ENTRYPOINT ["java", "-jar", "app.jar"]