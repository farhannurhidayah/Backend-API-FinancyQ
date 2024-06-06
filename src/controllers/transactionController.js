const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');

// Fungsi untuk mendapatkan tabel berdasarkan tipe
const getTableByType = (type) => {
    if (type === 'pengeluaran') {
        return { table: prisma.pengeluaran, idField: 'idTransaksiPengeluaran' };
    } else if (type === 'pemasukan') {
        return { table: prisma.pemasukan, idField: 'idTransaksiPemasukan' };
    }
    return null;
};

exports.getTransactions = async (req, res) => {
    const { type } = req.params;
    const tableInfo = getTableByType(type);
    
    if (!tableInfo) {
        return res.status(400).json({ message: 'Transaksi gagal' });
    }

    try {
        const transactions = await tableInfo.table.findMany({
            include: {
                user: true,
            },
        });

        // Group transactions by idUser
        const groupedTransactions = transactions.reduce((acc, curr) => {
            if (!acc[curr.idUser]) {
                acc[curr.idUser] = {
                    user: curr.user,
                    transactions: []
                };
            }
            acc[curr.idUser].transactions.push({
                idTransaksi: curr[tableInfo.idField],
                jumlah: curr.jumlah,
                deskripsi: curr.deskripsi,
                tanggal: curr.tanggal,
                kategori: curr.kategori,
                sumber: curr.sumber
            });
            return acc;
        }, {});

        // Convert the grouped object to an array
        const result = Object.values(groupedTransactions);

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createTransaction = async (req, res) => {
    const { idUser, jumlah, deskripsi, kategori, sumber } = req.body;
    const { type } = req.params;
    const tableInfo = getTableByType(type);

    if (!tableInfo) {
        return res.status(400).json({ message: 'Invalid transaction type' });
    }

    try {
        const Transaksi = await tableInfo.table.create({
            data: {
                idUser,
                jumlah,
                deskripsi,
                tanggal: new Date(),
                kategori,
                sumber
            },
        });
        res.status(201).json(Transaksi);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateTransaction = async (req, res) => {
    const { id, type } = req.params;
    const updateData = req.body;
    const tableInfo = getTableByType(type);

    if (!tableInfo) {
        return res.status(400).json({ message: 'Invalid transaction type' });
    }

    try {
        // Validasi bahwa data yang diterima tidak kosong
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No data provided for update' });
        }

        // Jika data tanggal disertakan, ubah menjadi objek Date
        if (updateData.tanggal) {
            updateData.tanggal = new Date(updateData.tanggal);
        }

        const Transaksi = await tableInfo.table.update({
            where: { [tableInfo.idField]: id },
            data: updateData,
        });

        res.json(Transaksi);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteTransaction = async (req, res) => {
    const { id, type } = req.params;
    const tableInfo = getTableByType(type);

    if (!tableInfo) {
        return res.status(400).json({ message: 'Invalid transaction type' });
    }

    try {
        // Memeriksa apakah transaksi dengan id yang diberikan ada
        const transaction = await tableInfo.table.findUnique({
            where: { [tableInfo.idField]: id },
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Menghapus transaksi
        await tableInfo.table.delete({
            where: { [tableInfo.idField]: id },
        });

        res.json({ message: 'Transaction removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Fungsi untuk mengekspor data transaksi ke PDF
exports.exportToPDF = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch data with user information included and filtered by userId
        const pengeluaran = await prisma.pengeluaran.findMany({
            where: {
                userId: id
            },
            include: {
                user: true,
            },
        });

        const pemasukan = await prisma.pemasukan.findMany({
            where: {
                userId: id
            },
            include: {
                user: true,
            },
        });

        const PDFDocument = require("./pdf-kit");
        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            res.setHeader('Content-Disposition', 'attachment; filename=transaksi.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            res.end(pdfData);
        });

        // Add the header
        doc
            .fillColor('#444444')
            .fontSize(20)
            .text('FinancyQ', 110, 57)
            .fontSize(10)
            .text('FinancyQ Tech', 200, 65, { align: 'right' })
            .text('Bandung, Indonesia', 200, 80, { align: 'right' })
            .moveDown();

        // Create the table for Pengeluaran
        const pengeluaranTable = {
            headers: ['Tanggal', 'Deskripsi', 'Jumlah', 'Kategori', 'Sumber'],
            rows: []
        };

        let totalPengeluaran = 0;
        pengeluaran.forEach((transaction) => {
            pengeluaranTable.rows.push([
                transaction.tanggal,
                transaction.deskripsi,
                transaction.jumlah,
                transaction.kategori,
                transaction.sumber,
                // `${transaction.user.username}`
            ]);
            totalPengeluaran += transaction.jumlah;
        });

        // Draw the Pengeluaran table
        doc.moveDown().text('Pengeluaran', 70, 100, { underline: true }).moveDown();
        doc.table(pengeluaranTable, { width: 500 });

        // Add total pengeluaran
        doc.moveDown().text(`Total Pengeluaran: ${totalPengeluaran}`, { align: 'right' });

        // Create the table for Pemasukan
        const pemasukanTable = {
            headers: ['Tanggal', 'Deskripsi', 'Jumlah', 'Kategori', 'Sumber'],
            rows: []
        };

        let totalPemasukan = 0;
        pemasukan.forEach((transaction) => {
            pemasukanTable.rows.push([
                transaction.tanggal,
                transaction.deskripsi,
                transaction.jumlah,
                transaction.kategori,
                transaction.sumber,
                // `${transaction.user.username}`
            ]);
            totalPemasukan += transaction.jumlah;
        });

        // Draw the Pemasukan table
        doc.moveDown(6).text('Pemasukan', { underline: true }).moveDown();
        doc.table(pemasukanTable, { width: 500 });

        // Add total pemasukan
        doc.moveDown().text(`Total Pemasukan: ${totalPemasukan}`, { align: 'right' });

        doc.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};