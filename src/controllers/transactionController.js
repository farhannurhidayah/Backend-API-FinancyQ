const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();




// Fungsi untuk mendapatkan tabel berdasarkan tipe
const getTableByType = (type) => {
    if (type === 'pengeluaran') {
        return prisma.pengeluaran;
    } else if (type === 'pemasukan') {
        return prisma.pemasukan;
    }
    return null;
};

exports.getTransactions = async (req, res) => {
    const { type } = req.params;
    const table = getTableByType(type);
    
    if (!table) {
        return res.status(400).json({ message: 'Transaksi gagal'  });
    }

    try {
        const transactions = await table.findMany({
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
                id: curr.id,
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




// Create a transaction
exports.createTransaction = async (req, res) => {
    const { idUser, jumlah, deskripsi ,kategori, sumber } = req.body;
    const { type } = req.params;
    const table = getTableByType(type);

    try {
        const Transaksi = await table.create({
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

// Update a transaction
exports.updateTransaction = async (req, res) => {
    const { id, type } = req.params;
    const updateData = req.body;
    const table = getTableByType(type);

    try {
        // Validasi bahwa data yang diterima tidak kosong
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No data provided for update" });
        }

        // Jika data tanggal disertakan, ubah menjadi objek Date
        if (updateData.tanggal) {
            updateData.tanggal = new Date(updateData.tanggal);
        }

        const pengeluaran = await table.update({
            where: { idTransaksiPengeluaran: id },
            data: updateData, // Gunakan langsung updateData tanpa spread operator
        });

        res.json(pengeluaran);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
    const { id, type } = req.params;
    const table = getTableByType(type);
    try {
        // Memeriksa apakah pengeluaran dengan idTransaksiPengeluaran yang diberikan ada
        const pengeluaran = await table.findUnique({
            where: { idTransaksiPengeluaran: id },
        });

        if (!pengeluaran) {
            return res.status(404).json({ message: 'Pengeluaran not found' });
        }

        // Menghapus pengeluaran
        await prisma.pengeluaran.delete({
            where: { idTransaksiPengeluaran: id },
        });

        res.json({ message: 'Pengeluaran removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



