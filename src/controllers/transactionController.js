const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all transactions
exports.getTransactions = async (req, res) => {
    try {
        const pengeluaran = await prisma.pengeluaran.findMany({
            include: {
                user: true,
            },
        });

        // Group pengeluaran by idUser
        const groupedpengeluaran = pengeluaran.reduce((acc, curr) => {
            if (!acc[curr.idUser]) {
                acc[curr.idUser] = {
                    user: curr.user,
                    pengeluaran: []
                };
            }
            acc[curr.idUser].pengeluaran.push({
                idTransaksipengeluaran: curr.idTransaksipengeluaran,
                jumlah: curr.jumlah,
                deskripsi: curr.deskripsi,
                tanggal: curr.tanggal,
                kategori: curr.kategori,
                sumber: curr.sumber
            });
            return acc;
        }, {});

        // Convert the grouped object to an array
        const result = Object.values(groupedpengeluaran);

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a transaction
exports.createTransaction = async (req, res) => {
    const { idUser, jumlah, deskripsi ,kategori, sumber } = req.body;

    try {
        const pengeluaran = await prisma.pengeluaran.create({
            data: { 
                idUser, 
                jumlah, 
                deskripsi, 
                tanggal: new Date(), 
                kategori, 
                sumber 
            },
        });
        res.status(201).json(pengeluaran);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body; // Object containing key-value pairs to be updated

    try {
        const pengeluaran = await prisma.pengeluaran.update({
            where: { idTransaksiPengeluaran: id },
            data: {
                ...updateData, // Spread the provided update data
                tanggal: updateData.tanggal ? new Date(updateData.tanggal) : undefined // Update timestamp if provided
            },
        });
        res.json(pengeluaran);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
    try {
        await prisma.pengeluaran.delete({
            where: { idTransaksiPengeluaran: req.params.id },
        });
        res.json({ message: 'Pengeluaran removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
