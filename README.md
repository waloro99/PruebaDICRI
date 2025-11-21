# PruebaDICRI
Prueba técnica para el desarrollo de una aplicación de software que permita a la DICRI gestionar el registro de la evidencia dentro de la institución.

# Proyecto DICRI – Despliegue con Docker

La aplicación se compone de tres servicios que se levantan con **Docker Compose**:

- `db` → SQL Server 2022 (imagen oficial de Microsoft).
- `api` → Backend Node.js + Express.
- `frontend` → Frontend React.

La base de datos se crea y se llena con los scripts de la carpeta **`BD_DICRI_Prueba`**.

---

## 1. Requisitos previos

En cualquier máquina donde se quiera levantar el proyecto se necesita:

1. **Docker Desktop** instalado y funcionando.  
   - En Windows se recomienda usar **WSL2** (opción recomendada al instalar Docker Desktop).
2. **Git** (para clonar el repositorio).
3. (Opcional, pero recomendado) **SQL Server Management Studio (SSMS)** para ejecutar los scripts de la base de datos.

---

## 2. Clonar el repositorio

bash
  - git clone <URL_DEL_REPO>
  - cd "<RUTA_DEL_REPO>/Proyecto DICRI/PruebaDICRI"

Todos los comandos de docker compose se ejecutan dentro de la carpeta PruebaDICRI, donde está el docker-compose.yml.

## 3. Levantar los contenedores con Docker

  - docker compose up -d --build
  - docker compose ps

## 4. Crear y poblar la base de datos

bash
  - docker cp BD_DICRI_Prueba dicri-db:/tmp/BD_DICRI_Prueba
  - docker exec -it dicri-db /bin/bash
  - cd /tmp/BD_DICRI_Prueba
    ls
  - /opt/mssql-tools18/bin/sqlcmd -S 127.0.0.1,1433 -U sa -P 'StrongPassword123!' -C \
    -d master -i "1. Script DataBase DICRI_Prueba.sql"

  - /opt/mssql-tools18/bin/sqlcmd -S 127.0.0.1,1433 -U sa -P 'StrongPassword123!' -C \
    -d DICRI_Prueba -i "2. Script DB Seed Data.sql"

  - for f in sps_*.sql; do
      echo "Ejecutando $f"
      /opt/mssql-tools18/bin/sqlcmd -S 127.0.0.1,1433 -U sa -P 'StrongPassword123!' -C -d DICRI_Prueba -i "$f"
    done

  - exit


## 5. Pruebas rápidas
  - http://localhost
  - http://localhost:3000/api/health



## DIAGRAMA ER

https://dbdiagram.io/d/691ebfd3228c5bbc1aae0f8b

# DICRI - Backend (Node.js + Express + SQL Server)

Este proyecto es el backend del sistema de gestión de expedientes e indicios para DICRI.  
Expone una API REST construida con **Node.js**, **Express** y **SQL Server**, pensada para ser consumida por el frontend y contenerizada con Docker.

---

## 1. Requisitos previos

Antes de ejecutar el backend, se debe contar con:

- **Node.js** (versión LTS recomendada)
- **npm** (incluido con Node.js)
- **SQL Server** (instancia local o accesible en red)
- **Base de datos `DICRI_Prueba`** creada a partir del script proporcionado
- **Postman** para probar endpoints

---

## 2. Instalación

Clonar el repositorio y ubicarse en la carpeta del backend.  
Ejemplo:

**bash**
  - git clone <URL_DEL_REPOSITORIO>
  - cd dicri-backend
  - npm install
  - npm run dev
  - npm test

## Pruebas unitarias del backend

El backend incluye un conjunto mínimo de pruebas unitarias implementadas con **Jest**, enfocadas en los componentes más críticos del MVP: autenticación, autorización y creación de expedientes.

### Configuración

Jest se instala como dependencia de desarrollo y se configura en el archivo `jest.config.js` en la raíz del proyecto.  
Los archivos de prueba se encuentran en:

**src/__tests__/**
  - auth.middleware.test.js
  - auth.controller.test.js
  - caseFile.controller.test.js



