# TaskManager Frontend

Aplicación web para gestión de tareas con autenticación JWT.

## Descripción

Este frontend permite registrarse, iniciar sesión y administrar tareas (crear, editar, listar y eliminar).
Está construido con React + TypeScript sobre Vite y consume una API REST.

## Stack tecnológico

- React 18
- TypeScript
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- React Hot Toast

## Funcionalidades principales

- Registro e inicio de sesión de usuarios
- Rutas protegidas para usuarios autenticados
- CRUD de tareas
- Manejo de estados de carga y errores
- Persistencia de token JWT en `localStorage`
- Interceptor de Axios para adjuntar token y manejar respuestas `401`

## Requisitos previos

- Node.js 18 o superior
- npm (o yarn)

## Instalación y ejecución

1. Instala las dependencias:

```bash
npm install
```

2. Inicia el entorno de desarrollo:

```bash
npm run dev
```

Por configuración actual de Vite, la app se sirve en `http://localhost:3000`.

## Scripts disponibles

- `npm run dev`: inicia el servidor de desarrollo
- `npm run build`: compila TypeScript y genera la build de producción en `dist/`
- `npm run preview`: levanta una vista previa de la build

## Configuración de API

Actualmente la URL base de la API está definida de forma fija en `src/services/api.ts`:

```ts
const API_BASE_URL = 'http://localhost:5027/api';
```

Si tu backend corre en otra URL o puerto, actualiza ese valor antes de ejecutar la app.

## Estructura del proyecto

```text
src/
├── components/     # Componentes reutilizables
├── contexts/       # Contextos globales (AuthContext)
├── pages/          # Pantallas principales
├── services/       # Cliente HTTP y llamadas a API
├── types/          # Tipos TypeScript
├── App.tsx         # Rutas y composición principal
├── main.tsx        # Punto de entrada
└── index.css       # Estilos globales
```

## Autenticación

- Al hacer login, el token JWT se guarda en `localStorage`.
- Cada request agrega el token automáticamente vía interceptor de Axios.
- Ante un `401`, se limpia el token y el usuario es redirigido a `/login`.
