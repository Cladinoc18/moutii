# MOUTII — By Daniela Mejía (E-Commerce Boutique)

Plataforma de comercio electrónico independiente para la marca de ropa **MOUTII — By Daniela Mejía**, desarrollada con arquitectura desacoplada: **Backend en NestJS + MongoDB** y **Frontend en Angular 21 (TypeScript)** con una estética visual de alta costura basada en los tonos **café, negro y beige**.

---

## 🎨 Identidad de Marca y Paleta de Colores

Inspirada directamente en el logo oficial:
- **Negro / Carbón:** `#161413` (Símbolo del ojo, tipografía de alta jerarquía, botones de acción).
- **Moca / Latte Suave:** `#A97B6D` (Tono de la tipografía "MOUTII By Daniela Mejia", badges de descuento, detalles sutiles).
- **Café Espresso & Chocolate:** `#4A3528` y `#38261A` (Tarjetas de colección, bordes contrastantes, hover states).
- **Beige / Lino / Crema:** `#FAF8F5` y `#F3EFEA` (Fondos cálidos y naturales que evocan la textura del lino orgánico).

---

## 🚀 Estructura del Proyecto

```text
mouti/
├── backend/            # API REST en NestJS con Mongoose y MongoDB
│   ├── src/
│   │   ├── auth/       # JWT Auth, Roles (admin / customer), Guardias
│   │   ├── users/      # Esquema de usuarios con contraseñas encriptadas
│   │   ├── products/   # CRUD de prendas, categorías, tallas y descuentos
│   │   ├── store-config/ # Editor de textos, banners y promociones
│   │   ├── orders/     # Gestión y estados de pedidos
│   │   ├── uploads/    # Carga de imágenes locales con Multer
│   │   └── seeds/      # Sembrado automático de admin y catálogo demo
│   └── uploads/        # Directorio de imágenes de prendas y banners
│
└── frontend/           # SPA en Angular 21 (Standalone Components)
    ├── public/         # Logo oficial y recursos estáticos
    └── src/
        ├── app/
        │   ├── core/   # Servicios (Auth, Products, Cart, Orders, Config)
        │   ├── shared/ # Navbar, Footer, CartDrawer, ProductCard, AnnouncementBar
        │   └── pages/  # Home, Catálogo, Detalle de Prenda, Checkout, Login, Admin
        └── styles.scss # Sistema de diseño en tonos Café, Negro y Beige
```

---

## 🔑 Credenciales de Acceso

### Administrador (Acceso al panel `/admin`):
- **Email:** `admin@mouti.com`
- **Contraseña:** `Admin123!`
- *(Nota: En la pantalla de Login `/login` existe un botón de "Usar Admin" que rellena estas credenciales con 1 clic).*

### Cliente o Invitado:
- Puede navegar libremente sin registrarse, filtrar prendas por categoría y descuentos, añadir productos al carrito y realizar pedidos contra entrega o transferencia bancaria.
- Opcionalmente puede registrarse desde la pestaña "Crear Cuenta".

---

## ⚙️ Instrucciones de Ejecución

### 1. Requisitos Previos
- Node.js v18+ (recomendado v22)
- MongoDB activo en el puerto local predeterminado (`mongodb://localhost:27017/mouti`)

### 2. Iniciar el Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
- API disponible en: `http://localhost:3000/api`
- Archivos e imágenes estáticas en: `http://localhost:3000/uploads/`

### 3. Iniciar el Frontend (Angular)
```bash
cd frontend
npm install
npm start
```
- Tienda web disponible en: `http://localhost:4200/`

---

## ✨ Características Principales

1. **Gestión Total para el Administrador (`/admin`):**
   - **Catálogo:** Crear, editar y eliminar prendas, modificar precios, calcular descuentos automáticos (% OFF) y subir imágenes.
   - **Personalización Visual:** Modificar el texto de la barra de anuncios, el título y subtítulo del Hero, la foto de portada, la cita de Daniela Mejía y los banners de ofertas sin tocar código.
   - **Pedidos:** Ver las órdenes de los clientes y actualizar su estado (`Pendiente`, `En Preparación`, `Enviado`, `Entregado`).

2. **Experiencia del Cliente / Invitado:**
   - Exploración visual por colecciones ("Vestidos", "Chaquetas & Blazers", "Pantalones", etc.).
   - Filtros dinámicos por descuentos y ordenamiento por precio o novedades.
   - Detalle de prenda con selector de tallas (XS, S, M, L, XL), colores e imágenes ampliables.
   - Bolsa de compras deslizable (Cart Drawer) con persistencia en `localStorage` y soporte para códigos de descuento (ej: `MOUTII15`).
   - Proceso de Checkout con cálculo automático de totales y confirmación con código de orden (`MOU-YYYYMM-XXXX`).
