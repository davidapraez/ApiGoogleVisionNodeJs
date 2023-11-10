Image Analysis API with Google Vision
Descripción
Esta API, desarrollada en Node.js, permite analizar imágenes utilizando la API de Google Vision. Ofrece una funcionalidad para procesar tanto imágenes subidas directamente como imágenes accesibles a través de URLs. La API se encarga de interpretar y procesar las solicitudes de análisis de imágenes, devolviendo información detallada sobre las mismas, como detección de etiquetas, texto, rostros, logos, y más.

Características

- Análisis de Imágenes Cargadas: Los usuarios pueden cargar imágenes directamente para su análisis.
- Análisis de Imágenes por URL: La API también puede procesar imágenes a través de URLs.
- Diversas Funciones de Detección: Utiliza múltiples características de la API de Google Vision, incluyendo detección de etiquetas, texto, y rostros.
- Manejo Seguro de Archivos: Implementa una gestión de archivos temporal segura y eficiente.
  Tecnologías Utilizadas
- Node.js
- Express
- Google Cloud Vision API
- Formidable para el manejo de formularios y carga de archivos
- CORS para manejar Cross-Origin Resource Sharing
- Dotenv para la gestión de variables de entorno
- Morgan para el registro de solicitudes HTTP
  Configuración y Uso
  Requisitos Previos
- Node.js instalado en tu sistema.
- Credenciales de Google Cloud Vision API configuradas y almacenadas en un archivo .json.

Instalación

1. Clona el repositorio en tu máquina local.
2. Instala las dependencias necesarias ejecutando npm install en la raíz del proyecto.

3. Configura tus variables de entorno en un archivo .env en la raíz del proyecto.
   PORT=3000
   GOOGLE_CREDENTIALS_PATH=./path/to/your/google-credentials.json
   Inicia la API con npm start.

4. Inicia la API con npm start.

Uso
Envía solicitudes POST a /analizeImage con una imagen o URL para analizar. La API devolverá un conjunto de datos detallados basados en el análisis de la imagen.
