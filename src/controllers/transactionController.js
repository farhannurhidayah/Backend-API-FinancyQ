// Fungsi untuk mendapatkan tabel berdasarkan tipe
const getTableByType = (type) => {
  if (type === "pengeluaran") {
    return { table: prisma.pengeluaran, idField: "idTransaksiPengeluaran" };
  } else if (type === "pemasukan") {
    return { table: prisma.pemasukan, idField: "idTransaksiPemasukan" };
  }
  return null;
};

exports.getTransactions = async (req, res) => {
  const { type } = req.params;
  const table = getTableByType(type);

  if (!table) {
    return res.status(400).json({ message: "Transaksi gagal" });
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
          transactions: [],
        };
      }
      acc[curr.idUser].transactions.push({
        id: curr.id,
        jumlah: curr.jumlah,
        deskripsi: curr.deskripsi,
        tanggal: curr.tanggal,
        kategori: curr.kategori,
        sumber: curr.sumber,
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
