const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateToken = require("../middlewares/auth");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/:userId/export-pdf',authenticateToken,transactionController.exportToPDF);
router.get('/total/:type/:idUser',authenticateToken ,transactionController.getTotalTransactions);
router.get('/:type/:idUser', (req, res, next) => {
    const { type, idUser } = req.params;

    if (type === 'pengeluaran' || type === 'pemasukan') {
        next();
    } else {
        res.status(400).json({ message: 'Invalid transaction type' });
    }
}, authenticateToken,transactionController.getAllTransactionsByUser);

router.post('/:type', (req, res, next) => {
    const { type } = req.params;

    if (type === 'pengeluaran' || type === 'pemasukan') {
        next();
    } else {
        res.status(400).json({ message: 'Invalid transaction type' });
    }
}, upload.single('lampiran'),authenticateToken, transactionController.createTransaction);

router.put('/:type/:id', (req, res, next) => {
    const { type } = req.params;

    if (type === 'pengeluaran' || type === 'pemasukan') {
        next();
    } else {
        res.status(400).json({ message: 'Invalid transaction type' });
    }
}, authenticateToken,transactionController.updateTransaction);

router.delete('/:type/:id', (req, res, next) => {
    const { type } = req.params;

    if (type === 'pengeluaran' || type === 'pemasukan') {
        next();
    } else {
        res.status(400).json({ message: 'Invalid transaction type' });
    }
}, authenticateToken,transactionController.deleteTransaction);



module.exports = router;