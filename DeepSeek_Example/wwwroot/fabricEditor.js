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
        this.canvas.backgroundColor = 'white';

        // Ładowanie obrazu jako tła i ustawianie rozmiarów canvasu na rozmiary obrazu
        fabric.Image.fromURL(imagePath, (img) => {
            this.canvas.setWidth(img.width);
            this.canvas.setHeight(img.height);
            img.set({ selectable: false });
            this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
        });
    },

    // Włączenie trybu rysowania
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

    // Ustawienia pędzla (kolor i grubość) dla trybu rysowania
    setDrawingOptions: function (color, width) {
        if (this.canvas && this.canvas.freeDrawingBrush) {
            this.canvas.freeDrawingBrush.color = color;
            this.canvas.freeDrawingBrush.width = parseInt(width, 10);
        }
    },

    // Dodawanie własnego tekstu – można dodawać wiele obiektów
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

    // Przycinanie obrazu – tryb dwustopniowy:
    // Pierwsze kliknięcie: dodanie edytowalnej ramki przycinania.
    // Drugie kliknięcie: przycięcie obrazu, zastąpienie tła przyciętym obrazem oraz skalowanie do kontenera.
    cropImage: function () {
        if (!this.isCropping) {
            // Aktywacja trybu przycinania – dodajemy edytowalny obiekt (ramkę)
            this.isCropping = true;
            const cropRect = new fabric.Rect({
                left: 50,
                top: 50,
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
            alert("Dostosuj ramkę przycinania, a następnie kliknij ponownie 'Przytnij obraz'.");
            return "";
        } else {
            // Drugi krok – wykonujemy przycięcie
            const cropRect = this.canvas.getObjects().find(obj => obj.name === "cropRect");
            if (!cropRect) {
                this.isCropping = false;
                alert("Nie znaleziono ramki przycinania.");
                return "";
            }
            // Usuwamy ramkę przycinania
            this.canvas.remove(cropRect);
            this.isCropping = false;
            const cropLeft = cropRect.left;
            const cropTop = cropRect.top;
            const cropWidth = cropRect.width * cropRect.scaleX;
            const cropHeight = cropRect.height * cropRect.scaleY;

            // Pobieramy dane przyciętego obrazu
            const croppedDataUrl = this.canvas.toDataURL({
                format: 'png',
                left: cropLeft,
                top: cropTop,
                width: cropWidth,
                height: cropHeight
            });

            // Wczytujemy przycięty obraz jako nowe tło canvasu i skalujemy go do kontenera
            fabric.Image.fromURL(croppedDataUrl, (img) => {
                // Pobieramy kontener, w którym znajduje się canvas
                const container = document.getElementById("canvasContainer");
                if (container) {
                    const containerWidth = container.clientWidth;
                    const scaleFactor = containerWidth / img.width;
                    const newWidth = img.width * scaleFactor;
                    const newHeight = img.height * scaleFactor;
                    // Ustawiamy nowe wymiary canvasu
                    this.canvas.setWidth(newWidth);
                    this.canvas.setHeight(newHeight);
                    // Skalujemy obraz
                    img.scale(scaleFactor);
                }
                img.set({ selectable: false });
                this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
                // Usuwamy wszystkie inne obiekty z canvasu (jeśli istnieją)
                this.canvas.getObjects().forEach((obj) => {
                    if (obj !== this.canvas.backgroundImage) {
                        this.canvas.remove(obj);
                    }
                });
                this.canvas.renderAll();
            });
            return "done";
        }
    },

    // Pobieranie obrazu z canvasu (całość wraz z obiektami)
    getEditedImage: function () {
        if (this.canvas) {
            return this.canvas.toDataURL({ format: 'png' });
        }
        return null;
    },

    // Usuwanie wszystkich obiektów (pomijając tło)
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
