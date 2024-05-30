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
    const {  jumlah, deskripsi, tanggal, kategori, sumber } = req.body;

    try {
        const pengeluaran = await prisma.pengeluaran.update({
            where: { idTransaksipengeluaran: req.params.id },
            data: { 
                
                jumlah, 
                deskripsi, 
                tanggal: new Date(tanggal), 
                kategori, 
                sumber 
            },
        });
        res.json(pengeluaran);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  console.log(req.params.id)
};
