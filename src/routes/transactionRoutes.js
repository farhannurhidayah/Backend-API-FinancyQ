const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateToken = require("../middlewares/auth");

router.get('/:type', (req, res, next) => {
    const { type } = req.params;

    if (type === 'pengeluaran' || type === 'pemasukan') {
        next();
    } else {
        res.status(400).json({ message: 'Invalid transaction type' });
    }
}, authenticateToken,transactionController.getTransactions);

router.post('/:type', (req, res, next) => {
    const { type } = req.params;

    if (type === 'pengeluaran' || type === 'pemasukan') {
        next();
    } else {
        res.status(400).json({ message: 'Invalid transaction type' });
    }
}, transactionController.createTransaction);

router.put('/:type/:id', (req, res, next) => {
    const { type } = req.params;

    if (type === 'pengeluaran' || type === 'pemasukan') {
        next();
    } else {
        res.status(400).json({ message: 'Invalid transaction type' });
    }
}, transactionController.updateTransaction);

router.delete('/:type/:id', (req, res, next) => {
    const { type } = req.params;

    if (type === 'pengeluaran' || type === 'pemasukan') {
        next();
    } else {
        res.status(400).json({ message: 'Invalid transaction type' });
    }
}, transactionController.deleteTransaction);

router.get('/:userId/export-pdf',authenticateToken,transactionController.exportToPDF);

module.exports = router;