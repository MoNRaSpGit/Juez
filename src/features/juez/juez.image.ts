const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.82;

// Redimensiona y comprime la foto en el navegador antes de subirla, para no
// guardar en el server fotos de celular de varios MB (una 4K/12MP baja a
// ~1024px de lado mas largo, formato JPEG). El objetivo es conservar buena
// calidad visual en un avatar/carnet sin saturar la base de datos.
export function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("No se pudo procesar la imagen."));
      image.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };

      image.src = typeof reader.result === "string" ? reader.result : "";
    };

    reader.readAsDataURL(file);
  });
}
