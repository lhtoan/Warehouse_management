const db = require('../config/db');

exports.getAllBatches = async (req, res) => {
  const sql = `SELECT id, ma_lo, ngay_nhap FROM lo_hang ORDER BY ngay_nhap DESC`;

  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi truy vấn', error: err });
  }
};
