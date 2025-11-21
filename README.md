# PruebaDICRI
Prueba técnica para el desarrollo de una aplicación de software que permita a la DICRI gestionar el registro de la evidencia dentro de la institución.

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



