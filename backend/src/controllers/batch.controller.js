const db = require('../config/db');

exports.getAllBatches = async (req, res) => {
  const sql = `SELECT id, ma_lo, ngay_nhap FROM lo_hang ORDER BY id ASC`;

  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi truy vấn', error: err });
  }
};

exports.createBatch = async (req, res) => {
  const { ma_lo, ngay_nhap } = req.body;

  if (!ma_lo || !ngay_nhap) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mã lô và ngày nhập' });
  }

  const sql = `INSERT INTO lo_hang (ma_lo, ngay_nhap) VALUES (?, ?)`;

  try {
    const [result] = await db.query(sql, [ma_lo, ngay_nhap]);
    res.status(201).json({ message: 'Thêm lô hàng thành công', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi thêm lô hàng', error: err });
  }
};
