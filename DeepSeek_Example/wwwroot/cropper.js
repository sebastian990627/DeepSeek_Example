let cropper;

window.cropper = {
    // Inicjalizacja Cropper.js
    initialize: (imageId) => {
        const image = document.querySelector(imageId);
        if (image) {
            console.log("Inicjalizacja Croppera dla obrazu:", imageId);
            cropper = new Cropper(image, {
                aspectRatio: 0,         // Dowolny stosunek proporcji
                viewMode: 1,            // Minimalne ograniczenia, widoczny cały obraz
                autoCropArea: 0.8,      // Domyślnie 80% obrazu przycięte
                movable: true,          // Możliwość przesuwania obrazu
                zoomable: true,         // Możliwość zoomu
                rotatable: true,        // Obrót
                cropBoxResizable: true, // Zmiana rozmiaru pola przycinania
            });
        } else {
            console.error("Nie znaleziono obrazu:", imageId);
        }
    },

    // Pobranie przyciętego obrazu w formacie Base64
    getCroppedImage: () => {
        if (cropper) {
            const canvas = cropper.getCroppedCanvas();
            if (canvas) {
                console.log("Obraz przycięty.");
                return canvas.toDataURL("image/png");
            } else {
                console.error("Nie udało się przyciąć obrazu.");
            }
        }
        return null;
    },

    // Resetowanie Croppera
    resetCropper: () => {
        if (cropper) {
            cropper.reset();
            console.log("Cropper zresetowany.");
        }
    },

    // Niszczenie Croppera
    destroyCropper: () => {
        if (cropper) {
            cropper.destroy();
            cropper = null;
            console.log("Cropper zniszczony.");
        }
    }
};
