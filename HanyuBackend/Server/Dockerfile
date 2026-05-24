# 1. Giai đoạn Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

# 2. Giai đoạn Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
COPY --from=build /app/publish .

# 3. Lệnh chạy (Đảm bảo tên .dll khớp với tên file của bạn)
ENTRYPOINT ["dotnet", "Server.dll"]