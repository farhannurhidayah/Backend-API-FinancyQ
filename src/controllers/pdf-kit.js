
// Import
const PDFDocument = require("pdfkit");

class PDFDocumentWithTables extends PDFDocument {
    constructor(options) {
        super(options);
    }

    table(table, arg0, arg1, arg2) {
        let startX = this.page.margins.left, startY = this.y;
        let options = {};

        if ((typeof arg0 === "number") && (typeof arg1 === "number")) {
            startX = arg0;
            startY = arg1;

            if (typeof arg2 === "object")
                options = arg2;
        } else if (typeof arg0 === "object") {
            options = arg0;
        }

        const columnCount = table.headers.length;
        const columnSpacing = options.columnSpacing || 15;
        const rowSpacing = options.rowSpacing || 5;
        const usableWidth = options.width || (this.page.width - this.page.margins.left - this.page.margins.right);

        const prepareHeader = options.prepareHeader || (() => { });
        const prepareRow = options.prepareRow || (() => { });
        const computeRowHeight = (row) => {
            let result = 0;

            row.forEach((cell) => {
                const cellHeight = this.heightOfString(cell, {
                    width: columnWidth,
                    align: "left"
                });
                result = Math.max(result, cellHeight);
            });

            return result + rowSpacing;
        };

        const columnContainerWidth = usableWidth / columnCount;
        const columnWidth = columnContainerWidth - columnSpacing;
        const maxY = this.page.height - this.page.margins.bottom;

        let rowBottomY = 0;

        this.on("pageAdded", () => {
            startY = this.page.margins.top;
            rowBottomY = 0;
        });

        // Mengizinkan pengguna mengganti gaya header
        prepareHeader();

        // Periksa apakah ada cukup ruang untuk header dan baris pertama
        if (startY + 3 * computeRowHeight(table.headers) > maxY)
            this.addPage();

        // Cetak semua header
        table.headers.forEach((header, i) => {
            this.font("Times-Roman").fontSize(10).text(header, startX + i * columnContainerWidth, startY, {
                width: columnWidth,
                align: "left"
            });
        });

        // Segarkan koordinat y di bagian bawah baris header
        rowBottomY = Math.max(startY + computeRowHeight(table.headers), rowBottomY);

        // Garis pemisah antara header dan baris
        this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
            .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
            .lineWidth(2)
            .stroke();

        table.rows.forEach((row, i) => {
            const rowHeight = computeRowHeight(row);

         // Beralih ke halaman berikutnya jika kita tidak dapat melangkah lebih jauh karena ruang sudah habis.
        // Demi keamanan, pertimbangkan margin 3 baris, bukan hanya satu
            if (startY + 3 * rowHeight < maxY)
                startY = rowBottomY + rowSpacing;
            else
                this.addPage();

        // Izinkan pengguna mengganti gaya baris
            prepareRow(row, i);

         // Cetak semua sel pada baris saat ini
            row.forEach((cell, i) => {
                this.text(cell, startX + i * columnContainerWidth, startY, {
                    width: columnWidth,
                    align: "left"
                });
            });

            // Segarkan koordinat y di bagian bawah baris ini
            rowBottomY = Math.max(startY + rowHeight, rowBottomY);

            
            // Garis pemisah antar baris
            this.moveTo(startX, rowBottomY - rowSpacing * 0.3)
                .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.3)
                .lineWidth(1)
                .opacity(0.7)
                .stroke()
                .opacity(1); //Reset opacity setelah menggambar garis
        });

        this.x = startX;
        this.moveDown();

        return this;
    }
}

module.exports = PDFDocumentWithTables;