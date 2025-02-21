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
    dotNetRef: null,
    isCropping: false,
    currentShapeColor: "#000000",
    currentStrokeWidth: 2,
    currentZoom: 1,

    // Inicjalizacja fabric.js – obraz zostaje wczytany i skalowany do rozmiaru kontenera
    initialize: function (canvasId, imagePath, dotNetRef) {
        this.dotNetRef = dotNetRef;
        this.canvas = new fabric.Canvas(canvasId);
        this.canvas.isDrawingMode = false;
        this.canvas.backgroundColor = 'white';

        fabric.Image.fromURL(imagePath, (img) => {
            const container = document.getElementById("canvasContainer");
            const containerWidth = container ? container.clientWidth : img.width;
            const maxContainerHeight = window.innerHeight * 0.8;
            const scaleFactor = Math.min(containerWidth / img.width, maxContainerHeight / img.height);
            const newWidth = img.width * scaleFactor;
            const newHeight = img.height * scaleFactor;
            this.canvas.setWidth(newWidth);
            this.canvas.setHeight(newHeight);
            img.scale(scaleFactor);
            img.set({ selectable: false });
            this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
        });

        // Reagowanie na zdarzenia zaznaczenia – informujemy C# o statusie
        this.canvas.on("selection:created", () => {
            if (this.dotNetRef) {
                this.dotNetRef.invokeMethodAsync("UpdateStatus", this.canvas.isDrawingMode, true);
            }
        });
        this.canvas.on("selection:updated", () => {
            if (this.dotNetRef) {
                this.dotNetRef.invokeMethodAsync("UpdateStatus", this.canvas.isDrawingMode, true);
            }
        });
        this.canvas.on("selection:cleared", () => {
            if (this.dotNetRef) {
                this.dotNetRef.invokeMethodAsync("UpdateStatus", this.canvas.isDrawingMode, false);
            }
        });
    },

    // Włączenie trybu rysowania (free drawing)
    enableDrawingMode: function () {
        if (this.canvas) {
            this.canvas.isDrawingMode = true;
            if (this.dotNetRef) {
                this.dotNetRef.invokeMethodAsync("UpdateStatus", this.canvas.isDrawingMode, !!this.canvas.getActiveObject());
            }
        }
    },

    // Wyłączenie trybu rysowania
    disableDrawingMode: function () {
        if (this.canvas) {
            this.canvas.isDrawingMode = false;
            if (this.dotNetRef) {
                this.dotNetRef.invokeMethodAsync("UpdateStatus", this.canvas.isDrawingMode, !!this.canvas.getActiveObject());
            }
        }
    },

    // Ustawienia pędzla oraz kolor kształtów
    setDrawingOptions: function (color, width) {
        if (this.canvas && this.canvas.freeDrawingBrush) {
            this.canvas.freeDrawingBrush.color = color;
            this.canvas.freeDrawingBrush.width = parseInt(width, 10);
        }
        this.currentShapeColor = color;
        this.currentStrokeWidth = parseInt(width, 10);
    },

    // Dodawanie własnego tekstu
    addCustomText: function (text) {
        if (this.canvas) {
            const centerX = this.canvas.getWidth() / 2;
            const centerY = this.canvas.getHeight() / 2;
            const textObj = new fabric.Textbox(text, {
                left: centerX,
                top: centerY,
                fill: this.currentShapeColor,
                fontSize: 20,
                originX: 'center',
                originY: 'center'
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
                stroke: this.currentShapeColor,
                strokeWidth: this.currentStrokeWidth,
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
                stroke: this.currentShapeColor,
                strokeWidth: this.currentStrokeWidth
            });
            this.canvas.add(circle);
        }
    },

    // Dodawanie linii
    drawLine: function () {
        if (this.canvas) {
            const line = new fabric.Line([50, 50, 200, 200], {
                stroke: this.currentShapeColor,
                strokeWidth: this.currentStrokeWidth
            });
            this.canvas.add(line);
        }
    },

    // Dodawanie strzałki
    drawArrow: function () {
        if (this.canvas) {
            const x1 = 50, y1 = 50, x2 = 200, y2 = 200;
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const headlen = 15;
            const arrowHeadPoints = [
                { x: x2, y: y2 },
                { x: x2 - headlen * Math.cos(angle - Math.PI / 6), y: y2 - headlen * Math.sin(angle - Math.PI / 6) },
                { x: x2 - headlen * Math.cos(angle + Math.PI / 6), y: y2 - headlen * Math.sin(angle + Math.PI / 6) }
            ];
            const line = new fabric.Line([x1, y1, x2, y2], {
                stroke: this.currentShapeColor,
                strokeWidth: this.currentStrokeWidth,
                originX: 'center',
                originY: 'center'
            });
            const arrowHead = new fabric.Polygon(arrowHeadPoints, {
                fill: this.currentShapeColor,
                stroke: this.currentShapeColor,
                strokeWidth: this.currentStrokeWidth,
                originX: 'center',
                originY: 'center'
            });
            const arrowGroup = new fabric.Group([line, arrowHead], { left: 50, top: 50 });
            this.canvas.add(arrowGroup);
        }
    },

    // Przycinanie obrazu
    cropImage: function () {
        if (!this.isCropping) {
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
            const cropRect = this.canvas.getObjects().find(obj => obj.name === "cropRect");
            if (!cropRect) {
                this.isCropping = false;
                alert("Nie znaleziono ramki przycinania.");
                return "";
            }
            this.canvas.remove(cropRect);
            this.isCropping = false;
            const cropLeft = cropRect.left;
            const cropTop = cropRect.top;
            const cropWidth = cropRect.width * cropRect.scaleX;
            const cropHeight = cropRect.height * cropRect.scaleY;

            const croppedDataUrl = this.canvas.toDataURL({
                format: 'png',
                left: cropLeft,
                top: cropTop,
                width: cropWidth,
                height: cropHeight
            });

            fabric.Image.fromURL(croppedDataUrl, (img) => {
                const container = document.getElementById("canvasContainer");
                const containerWidth = container ? container.clientWidth : img.width;
                const maxContainerHeight = window.innerHeight * 0.8;
                const scaleFactor = Math.min(containerWidth / img.width, maxContainerHeight / img.height);
                const newWidth = img.width * scaleFactor;
                const newHeight = img.height * scaleFactor;
                this.canvas.setWidth(newWidth);
                this.canvas.setHeight(newHeight);
                img.scale(scaleFactor);
                img.set({ selectable: false });
                this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
                // Usunięcie wszystkich dodatkowych obiektów
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

    // Pobranie aktualnego obrazu z canvasu
    getEditedImage: function () {
        if (this.canvas) {
            return this.canvas.toDataURL({ format: 'png' });
        }
        return null;
    },

    // Usuwanie wszystkich obiektów z canvasu (pomijając tło)
    clearCanvas: function () {
        if (this.canvas) {
            this.canvas.getObjects().forEach((obj) => {
                if (obj !== this.canvas.backgroundImage) {
                    this.canvas.remove(obj);
                }
            });
            this.canvas.renderAll();
        }
    },

    // Usuwanie zaznaczonego obiektu
    removeSelectedObject: function () {
        if (this.canvas) {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject) {
                this.canvas.remove(activeObject);
                this.canvas.renderAll();
            } else {
                alert("Nie wybrano obiektu do usunięcia.");
            }
        }
    },

    // Zoom in – powiększenie obrazu
    zoomIn: function () {
        if (this.canvas) {
            this.currentZoom = (this.currentZoom || 1) * 1.1;
            this.canvas.setZoom(this.currentZoom);
        }
    },

    // Zoom out – zmniejszenie obrazu
    zoomOut: function () {
        if (this.canvas) {
            this.currentZoom = (this.currentZoom || 1) / 1.1;
            this.canvas.setZoom(this.currentZoom);
        }
    }
};


