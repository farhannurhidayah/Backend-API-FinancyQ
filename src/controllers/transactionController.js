require("dotenv").config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('./pdf-kit');
const moment = require('moment');
require('moment/locale/id');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucketName = process.env.BUCKET_NAME; // Ganti dengan nama bucket GCS Anda
process.env.GOOGLE_APPLICATION_CREDENTIALS;


// Fungsi untuk mendapatkan tabel berdasarkan tipe
const getTableByType = (type) => {
    if (type === 'pengeluaran') {
        return { table: prisma.pengeluaran, idField: 'idTransaksiPengeluaran' };
    } else if (type === 'pemasukan') {
        return { table: prisma.pemasukan, idField: 'idTransaksiPemasukan' };
    }
    return null;
};

const uploadImageToGCS = async (file) => {
    const { buffer, originalname } = file;
    const destination = `pengeluaran-images/${originalname}`;

    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(destination);
    const blobStream = blob.createWriteStream();

    return new Promise((resolve, reject) => {
        blobStream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
            resolve(publicUrl);
        }).on('error', (err) => {
            reject(err);
        }).end(buffer);
    });
};



exports.getAllTransactionsByUser = async (req, res) => {
    const { type, idUser } = req.params;
    const tableInfo = getTableByType(type);

    if (!tableInfo) {
        return res.status(400).json({ error: true, message: 'Invalid transaction type' });
    }

    try {
        const transactions = await tableInfo.table.findMany({
            where: { idUser },
            include: {
                user: true,
            },
        });

        // Map transactions to desired format
        const formattedTransactions = transactions.map(curr => {
            const transactionData = {
                idTransaksi: curr[tableInfo.idField],
                jumlah: curr.jumlah,
                deskripsi: curr.deskripsi,
                tanggal: curr.tanggal,
                kategori: curr.kategori,
                sumber: curr.sumber,
            };
            if (type === 'pengeluaran') {
                transactionData.lampiran = curr.lampiran;
            }
            return transactionData;
        });

        // Return the formatted transactions
        res.json({
            error: false,
            message: "Message Success",
            transactions: formattedTransactions
        });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};

exports.getTransactionById = async (req, res) => {
    const { idTransaksi, type } = req.params;
    const tableInfo = getTableByType(type);

    if (!tableInfo) {
        return res.status(400).json({ error: true, message: 'Invalid transaction type' });
    }

    try {
        // Cari ID transaksi dalam tabel laporan
        const laporanData = await prisma.laporan.findUnique({
            where: {
                OR: [
                    { idTransaksiPengeluaran: parseInt(idTransaksi) },
                    { idTransaksiPemasukan: parseInt(idTransaksi) }
                ]
            }
        });

        if (!laporanData) {
            return res.status(404).json({ error: true, message: 'Transaction not found in report' });
        }

        // Ambil data transaksi dari tabel yang sesuai, kecuali idTransaksi dan idUser
        const transactionData = await tableInfo.table.findUnique({
            where: {
                [tableInfo.idField]: parseInt(idTransaksi)
            },
            select: {
                jumlah: true,
                deskripsi: true,
                tanggal: true,
                kategori: true,
                sumber: true,
                lampiran: true // Sesuaikan dengan kolom-kolom yang ingin ditampilkan
            },
        });

        if (!transactionData) {
            return res.status(404).json({ error: true, message: 'Transaction data not found' });
        }

        res.json({ error: false, message: 'Success', data: transactionData });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};


exports.createTransaction = async (req, res) => {
    const { idUser, jumlah, deskripsi, kategori, sumber } = req.body;
    const { type } = req.params;
    const tableInfo = getTableByType(type);

    if (!tableInfo) {
        return res.status(400).json({ message: 'Jenis transaksi tidak valid' });
    }

    try {
        let lampiranUrl = null;

        if (type === 'pengeluaran' && req.file) {
            lampiranUrl = await uploadImageToGCS(req.file);
        }

        const currentDate = new Date().toISOString();  // Gunakan format ISO
        console.log('Current Date:', currentDate);

        const transactionData = {
            idUser,
            jumlah: parseFloat(jumlah),
            deskripsi,
            tanggal: currentDate,  // Gunakan currentDate
            kategori,
            sumber,
            ...(type === 'pengeluaran' && { lampiran: lampiranUrl }) // Sertakan lampiran jika tipe pengeluaran
        };

        console.log('Transaction Data:', transactionData);

        const Transaksi = await tableInfo.table.create({ data: transactionData });

        console.log('Transaction Created:', Transaksi);

        // Membuat laporan
        const laporanData = {
            idUser,
            keterangan: deskripsi,
            tanggal: currentDate,  // Gunakan currentDate
            ...(type === 'pengeluaran' ? { idTransaksiPengeluaran: Transaksi.idTransaksiPengeluaran } : { idTransaksiPemasukan: Transaksi.idTransaksiPemasukan })
        };

        console.log('Laporan Data:', laporanData);

        await prisma.laporan.create({ data: laporanData });

        res.status(201).json(Transaksi);
    } catch (err) {
        console.error('Error:', err.message);
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

exports.exportToPDF = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Atur lokal moment ke bahasa Indonesia
        moment.locale('id');

        // Ambil data pemasukan berdasarkan user ID
        const pemasukan = await prisma.pemasukan.findMany({
            where: {
                idUser: (userId)
            },
            include: {
                user: true,
            },
        });

        // Ambil data pengeluaran berdasarkan user ID
        const pengeluaran = await prisma.pengeluaran.findMany({
            where: {
                idUser: (userId)
            },
            include: {
                user: true,
            },
        });

        // Buat dokumen PDF
        const doc = new PDFDocument();

        // Set up buffers untuk menangkap konten PDF
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            res.end(pdfData);
        });

        // Tambahkan header
        doc
            .fillColor('#444444')
            .fontSize(20)
            .text('Transaction Report FinancyQ', 110, 57)
            .fontSize(10)
            .text('FinancyQ', 200, 65, { align: 'right' })
            .text('Bandung, Jawa Barat', 200, 80, { align: 'right' })
            .moveDown();

        // Buat tabel untuk Pemasukan
        doc
            .fontSize(15)
            .text('Pemasukan', 50, 100);

        const pemasukanTable = {
            headers: ['Tanggal', 'Deskripsi', 'Jumlah', 'Kategori', 'Sumber'],
            rows: []
        };

        let totalPemasukan = 0;
        pemasukan.forEach((transaction) => {
            pemasukanTable.rows.push([
                moment(transaction.tanggal).format('DD MMMM YYYY, HH:mm'), // Format tanggal
                transaction.deskripsi,
                transaction.jumlah,
                transaction.kategori,
                transaction.sumber,
            ]);
            totalPemasukan += transaction.jumlah;
        });

        pemasukanTable.rows.push([
            '', 'Total Pemasukan', totalPemasukan, '', ''
        ]);

        // Gambar tabel Pemasukan
        doc.moveDown(1).table(pemasukanTable, 50, 125, { width: 500 });

        // Simpan posisi awal tabel pengeluaran
        const pengeluaranYPosition = doc.y + 25;

        // Buat tabel untuk Pengeluaran
        doc.fontSize(15).text('Pengeluaran', 50, pengeluaranYPosition);

        const pengeluaranTable = {
            headers: ['Tanggal', 'Deskripsi', 'Jumlah', 'Kategori', 'Sumber', 'Lampiran'],
            rows: []
        };

       
        let totalPengeluaran = 0;
        pengeluaran.forEach((transaction) => {
            let lampiran = '-';
            if (transaction.lampiran) {
                lampiran = transaction.lampiran;
            }
            pengeluaranTable.rows.push([
                moment(transaction.tanggal).format('DD MMMM YYYY, HH:mm'), // Format tanggal
                transaction.deskripsi,
                transaction.jumlah,
                transaction.kategori,
                transaction.sumber,
                lampiran
            ]);
            totalPengeluaran += transaction.jumlah;
        });

        pengeluaranTable.rows.push([
            '', 'Total Pengeluaran', totalPengeluaran, '', ''
        ]);

        // Gambar tabel Pengeluaran
        doc.moveDown().table(pengeluaranTable, 50, doc.y + 30, { width: 530 });

        // Finalisasi PDF dan akhiri stream
        doc.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTotalTransactions = async (req, res) => {
    const { type, idUser } = req.params;
    const tableInfo = getTableByType(type);

    if (!tableInfo) {
        return res.status(400).json({ message: 'Invalid transaction type' });
    }

    try {
        const transactions = await tableInfo.table.findMany({
            where: { idUser },
        });

        const total = transactions.reduce((acc, transaction) => acc + transaction.jumlah, 0);

        res.json({
            error: false,
            message: 'Success',
            data: {
                type,
                idUser,
                total,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



