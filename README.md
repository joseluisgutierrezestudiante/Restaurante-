# Fogón Artesano — Restaurante de Autor

Sitio web del restaurante **Fogón Artesano** (Bucaramanga). Proyecto estático en HTML, CSS y JavaScript vanilla, con animaciones GSAP.

## Características

- 🎨 Diseño editorial con modo **día / noche** persistente
- 🍽️ **Menú interactivo** por categorías con filtros de alérgenos (vegano, sin gluten, sin lactosa, keto) y modo lectura de alérgenos
- 🪑 **Plano interactivo de mesas** para elegir zona y mesa en la reserva
- 📅 Formulario de **reservas** con validación, ocasión especial y método de pago
- 🖼️ Galería con lightbox y cursor personalizado
- 🎵 Reproductor de ambiente sonoro
- 📱 Diseño responsive y accesible (teclado, reduced-motion)

## Estructura

```
├── index.html      # Página principal
├── styles.css      # Estilos (tema día/noche, componentes)
├── script.js       # Lógica: menú, reservas, tema, animaciones
└── favicon.svg     # Icono del sitio
```

## Cómo verlo

No requiere build. Abre `index.html` en el navegador, o sirve la carpeta:

```bash
npx serve .
```

## Tecnologías

- HTML5 / CSS3 / JavaScript (ES5+)
- [GSAP](https://gsap.com/) + ScrollTrigger (animaciones)
- Google Fonts: Cinzel, Cormorant Garamond, Instrument Serif, Plus Jakarta Sans

---

© Fogón Artesano — Alta cocina de autor.
