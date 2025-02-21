//window.fabricEditor = {
//    canvas: null,

//    // Inicjalizacja canvas z fabric.js oraz ustawienie obrazu jako tła
//    initialize: function (canvasId, imagePath) {
//        this.canvas = new fabric.Canvas(canvasId);
//        // Domyślnie wyłączony tryb rysowania
//        this.canvas.isDrawingMode = false;

//        // Ładowanie obrazu jako tło
//        fabric.Image.fromURL(imagePath, (img) => {
//            // Skalowanie obrazu do szerokości canvasu
//            const canvasWidth = this.canvas.getWidth();
//            const scale = canvasWidth / img.width;
//            img.set({ selectable: false });
//            img.scale(scale);
//            this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
//        });
//    },

//    // Włączenie trybu rysowania (free drawing)
//    enableDrawingMode: function () {
//        if (this.canvas) {
//            this.canvas.isDrawingMode = true;
//        }
//    },

//    // Wyłączenie trybu rysowania
//    disableDrawingMode: function () {
//        if (this.canvas) {
//            this.canvas.isDrawingMode = false;
//        }
//    },

//    // Dodanie tekstu do canvasu
//    addText: function (text) {
//        if (this.canvas) {
//            const textObj = new fabric.Textbox(text, {
//                left: 50,
//                top: 50,
//                fill: '#000',
//                fontSize: 20
//            });
//            this.canvas.add(textObj);
//        }
//    },

//    // Pobranie obrazu (canvas z wszystkimi zmianami) w formacie Base64
//    getEditedImage: function () {
//        if (this.canvas) {
//            return this.canvas.toDataURL({ format: 'png' });
//        }
//        return null;
//    },

//    // Usunięcie wszystkich obiektów dodanych do canvasu, zachowując tło
//    clearCanvas: function () {
//        if (this.canvas) {
//            this.canvas.getObjects().forEach((obj) => {
//                if (obj !== this.canvas.backgroundImage) {
//                    this.canvas.remove(obj);
//                }
//            });
//            this.canvas.renderAll();
//        }
//    }
//};


window.fabricEditor = {
    canvas: null,
    isCropping: false,

    // Inicjalizacja fabric.js – ustawiamy canvas na rozmiary obrazu
    initialize: function (canvasId, imagePath) {
        this.canvas = new fabric.Canvas(canvasId);
        this.canvas.isDrawingMode = false;
        // Opcjonalnie ustaw tło, jeśli chcesz inny kolor – domyślnie przez obraz
        this.canvas.backgroundColor = 'white';

        fabric.Image.fromURL(imagePath, (img) => {
            // Ustawiamy canvas na oryginalny rozmiar obrazu
            this.canvas.setWidth(img.width);
            this.canvas.setHeight(img.height);
            img.set({ selectable: false });
            this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
        });
    },

    // Tryb rysowania
    enableDrawingMode: function () {
        if (this.canvas) {
            this.canvas.isDrawingMode = true;
        }
    },

    disableDrawingMode: function () {
        if (this.canvas) {
            this.canvas.isDrawingMode = false;
        }
    },

    // Ustawienia pędzla do rysowania
    setDrawingOptions: function (color, width) {
        if (this.canvas && this.canvas.freeDrawingBrush) {
            this.canvas.freeDrawingBrush.color = color;
            this.canvas.freeDrawingBrush.width = parseInt(width, 10);
        }
    },

    // Dodawanie własnego tekstu – można dodać wiele obiektów
    addCustomText: function (text) {
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

    // Dodawanie prostokąta
    drawRectangle: function () {
        if (this.canvas) {
            const rect = new fabric.Rect({
                left: 150,
                top: 150,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 2,
                width: 100,
                height: 80
            });
            this.canvas.add(rect);
        }
    },

    // Dodawanie okręgu
    drawCircle: function () {
        if (this.canvas) {
            const circle = new fabric.Circle({
                left: 200,
                top: 200,
                radius: 50,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 2
            });
            this.canvas.add(circle);
        }
    },

    // Dodawanie linii
    drawLine: function () {
        if (this.canvas) {
            const line = new fabric.Line([50, 50, 200, 200], {
                stroke: 'black',
                strokeWidth: 2
            });
            this.canvas.add(line);
        }
    },

    // Przycinanie – działanie dwukrokowe z użyciem wbudowanych opcji
    cropImage: function () {
        if (!this.isCropping) {
            // Pierwszy krok: aktywujemy tryb przycinania – dodajemy edytowalny obiekt
            this.isCropping = true;
            const cropRect = new fabric.Rect({
                left: 100,
                top: 100,
                width: 200,
                height: 200,
                fill: 'rgba(0,0,0,0.3)',
                stroke: '#fff',
                strokeWidth: 2,
                selectable: true,
                hasBorders: true,
                hasControls: true,
                name: "cropRect"
            });
            this.canvas.add(cropRect);
            this.canvas.setActiveObject(cropRect);
            alert("Dostosuj ramkę przycinania, a następnie kliknij 'Przytnij obraz' ponownie.");
            return null;
        } else {
            // Drugi krok: pobieramy wymiary ramki i wykonujemy przycięcie
            const cropRect = this.canvas.getObjects().find(obj => obj.name === "cropRect");
            if (cropRect) {
                this.canvas.remove(cropRect);
                this.isCropping = false;
                const cropLeft = cropRect.left;
                const cropTop = cropRect.top;
                const cropWidth = cropRect.width * cropRect.scaleX;
                const cropHeight = cropRect.height * cropRect.scaleY;

                // Używamy fabric do wygenerowania przyciętego obrazu
                const croppedDataUrl = this.canvas.toDataURL({
                    format: 'png',
                    left: cropLeft,
                    top: cropTop,
                    width: cropWidth,
                    height: cropHeight
                });
                return croppedDataUrl;
            } else {
                this.isCropping = false;
                alert("Nie znaleziono obszaru przycinania.");
                return null;
            }
        }
    },

    // Pobranie obrazu z canvasu (całość łącznie z obiektami)
    getEditedImage: function () {
        if (this.canvas) {
            return this.canvas.toDataURL({ format: 'png' });
        }
        return null;
    },

    // Czyszczenie obiektów (pomijając tło)
    clearCanvas: function () {
        if (this.canvas) {
            // Usuwamy wszystkie obiekty poza tłem
            this.canvas.getObjects().forEach((obj) => {
                if (obj !== this.canvas.backgroundImage) {
                    this.canvas.remove(obj);
                }
            });
            this.canvas.renderAll();
        }
    }
};
