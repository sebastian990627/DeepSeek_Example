window.fabricEditor = {
    canvas: null,

    // Inicjalizacja canvas z fabric.js oraz ustawienie obrazu jako tła
    initialize: function (canvasId, imagePath) {
        this.canvas = new fabric.Canvas(canvasId);
        // Domyślnie wyłączony tryb rysowania
        this.canvas.isDrawingMode = false;

        // Ładowanie obrazu jako tło
        fabric.Image.fromURL(imagePath, (img) => {
            // Skalowanie obrazu do szerokości canvasu
            const canvasWidth = this.canvas.getWidth();
            const scale = canvasWidth / img.width;
            img.set({ selectable: false });
            img.scale(scale);
            this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
        });
    },

    // Włączenie trybu rysowania (free drawing)
    enableDrawingMode: function () {
        if (this.canvas) {
            this.canvas.isDrawingMode = true;
        }
    },

    // Wyłączenie trybu rysowania
    disableDrawingMode: function () {
        if (this.canvas) {
            this.canvas.isDrawingMode = false;
        }
    },

    // Dodanie tekstu do canvasu
    addText: function (text) {
        if (this.canvas) {
            const textObj = new fabric.Textbox(text, {
                left: 50,
                top: 50,
                fill: '#000',
                fontSize: 20
            });
            this.canvas.add(textObj);
        }
    },

    // Pobranie obrazu (canvas z wszystkimi zmianami) w formacie Base64
    getEditedImage: function () {
        if (this.canvas) {
            return this.canvas.toDataURL({ format: 'png' });
        }
        return null;
    },

    // Usunięcie wszystkich obiektów dodanych do canvasu, zachowując tło
    clearCanvas: function () {
        if (this.canvas) {
            this.canvas.getObjects().forEach((obj) => {
                if (obj !== this.canvas.backgroundImage) {
                    this.canvas.remove(obj);
                }
            });
            this.canvas.renderAll();
        }
    }
};
