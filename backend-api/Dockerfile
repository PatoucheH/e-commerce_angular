# Base runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5000

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copier seulement le csproj pour optimiser le restore
COPY ["backend-api.csproj", "./"]
RUN dotnet restore "backend-api.csproj"

# Copier le reste du projet
COPY . .

# Build
RUN dotnet build "backend-api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "backend-api.csproj" -c Release -o /app/publish

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "backend-api.dll", "--urls", "http://0.0.0.0:5000"]
