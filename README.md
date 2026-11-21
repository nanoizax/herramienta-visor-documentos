# Visor de Documentos

Abre PDF, Word e imágenes sin instalar nada. El archivo no sale de tu dispositivo.

Herramienta gratuita y de código abierto de [SonhoLab](https://sonholab.com). Corre **100 % en el navegador**: los archivos no se suben a ningún servidor.

> Licencia: **MIT** · Autor: Leandro Manuel Perez Montañana · Idiomas de la interfaz: español, inglés, francés, portugués (BR), alemán, hindi, indonesio y ruso.

## Qué hace

Cuando alguien te manda un contrato en PDF o un informe en Word y no tienes Office instalado, abrirlo se vuelve un problema. Este visor muestra PDF, documentos de Word e imágenes directamente en el navegador: eliges el archivo, lo ves y listo. No se sube a ningún servidor ni queda guardado en ninguna parte.

**Cuándo te sirve:**

- Te llega un contrato en PDF y tienes que leerlo desde una computadora prestada, sin lector instalado ni permiso para instalarlo.
- Un estudiante recibe el trabajo en .docx y solo quiere revisar cómo quedó el formato antes de entregarlo.
- Una secretaria abre facturas y comprobantes que llegan por WhatsApp para confirmar el monto sin reenviarlos a nadie.

## Cómo se usa

1. **Elige el archivo.** Arrastra el PDF, el .docx o la imagen al recuadro, o haz clic para buscarlo en tu equipo. Se abre sin subirse a ningún lado.
2. **Mira el documento.** El PDF se dibuja página por página y el documento de Word se muestra con su formato. Solo tienes que desplazarte para recorrerlo.
3. **Cambia de archivo.** Cuando termines, elige otro documento para verlo. Nada queda guardado en la página: al cerrar la pestaña el archivo desaparece de la memoria.

## Qué necesita para funcionar

### Para instalarla y compilarla

- [Node.js](https://nodejs.org) 18 o superior (probado con Node 22) y npm.
- Conexión a internet **solo** durante `npm install`. Una vez compilada, la herramienta no pide nada a internet.

### Complementos específicos de esta herramienta

- **PDF.js** (lector de PDF de Mozilla): viene como dependencia de npm; su *worker* se empaqueta solo con Vite.

### En el navegador de quien la usa

- Web Workers y Canvas (cualquier navegador actual).

## Instalación

```bash
git clone https://github.com/nanoizax/herramienta-visor-documentos.git
cd herramienta-visor-documentos
npm install
npm run dev         # servidor de desarrollo en http://localhost:5173
```

Para publicarla:

```bash
npm run build       # genera la carpeta dist/
npm run preview     # probar la versión compilada
```

Esta herramienta **no tiene servidor propio**: todo ocurre en el navegador de quien la usa. Basta con publicar la carpeta `dist/` en cualquier hosting estático (GitHub Pages, Netlify, Cloudflare Pages, Nginx, Apache...).

## Cómo está organizado

```
src/pages/tools/   La página de la herramienta (interfaz y lógica de pantalla)
src/lib/tools/     La lógica de la herramienta, separada de la interfaz
src/components/    Piezas compartidas (zona de arrastre de archivos, botón)
src/locales/       Textos en 8 idiomas (esta herramienta solamente)
src/i18n.ts        Configuración de idiomas
```

## Cómo meterla en tu propia plataforma

1. **Como página aparte:** publica `dist/` en una ruta de tu sitio, por ejemplo `/herramientas/visor-documentos/`. Si la sirves en una subcarpeta, define `base` en `vite.config.ts`.
2. **Dentro de tu aplicación React:** copia `src/pages/tools/*Page.tsx`, `src/lib/tools/` y `src/components/` a tu proyecto, instala las mismas dependencias de `package.json` y renderiza la página donde quieras.
3. **Con tu diseño:** el marco de la página (título, ayuda, preguntas frecuentes) está en `src/components/tools/ToolPageLayout.tsx` y es intencionalmente simple. Cámbialo por tu cabecera, tu pie y tus estilos; solo necesita pintar `children`.
4. **Con tu analítica:** `src/lib/hitCounter.ts` no hace nada. Si quieres medir el uso, conéctalo ahí a tu propia herramienta.

## Privacidad

Todo el procesamiento ocurre en el navegador. Esta copia no incluye analítica, cookies, contadores ni llamadas a ningún servidor propio. Los archivos del usuario no salen de su equipo.

## Preguntas frecuentes

**¿Qué pasa con los archivos que abro aquí?**  
Se quedan en tu dispositivo. El visor trabaja dentro del navegador, así que el documento nunca viaja a un servidor nuestro ni al de nadie más. Cuando cierras la pestaña, desaparece; no guardamos copias ni llevamos registro de lo que abriste.

**¿Es gratis? ¿Hay límite de archivos?**  
Es gratis y no hay límite: puedes abrir los documentos que quieras, uno tras otro, sin crear cuenta ni dejar un correo. Tampoco hay cola de espera, porque el trabajo lo hace tu propio equipo y no un servidor compartido.

**¿Qué formatos puedo abrir y cuántas páginas muestra?**  
Abre PDF, documentos de Word en .docx e imágenes comunes como JPG y PNG. De un PDF largo muestra hasta 40 páginas, suficiente para revisar la mayoría de contratos e informes; si necesitas ver más, conviene abrirlo en un lector de escritorio.

**¿Necesito instalar algo o crear una cuenta?**  
No. Funciona con el navegador que ya tienes, en computadora o en celular, y no pide registro ni descarga ningún programa. Tampoco pone marca de agua sobre lo que ves, porque no modifica el archivo: solo lo muestra.

**¿Por qué una página no se ve o aparece en blanco?**  
Pasa cuando la página tiene un tamaño fuera de lo común, por ejemplo un plano muy grande: el navegador no logra dibujarla y la salta. El resto del documento se sigue viendo bien. Si el archivo entero no abre, puede estar dañado o protegido con contraseña.

## Licencia

Este proyecto se publica bajo la licencia **MIT**. El texto completo está en [LICENSE](LICENSE).

Las dependencias tienen sus propias licencias, listadas en [THIRD-PARTY.md](THIRD-PARTY.md).

## Más herramientas gratuitas

Esta es una de las herramientas gratuitas de SonhoLab. Encuentra el resto, cada una con su repositorio, en https://sonholab.com/es/herramientas.

---

Hecho por Leandro Manuel Perez Montañana.
