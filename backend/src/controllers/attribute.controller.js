const db = require('../config/db');

const getSizeValues = async (req, res) => {
  const sql = `
    SELECT gt.id AS gia_tri_id, gt.gia_tri
    FROM thuoc_tinh tt
    JOIN gia_tri_thuoc_tinh gt ON tt.id = gt.thuoc_tinh_id
    WHERE tt.ten_thuoc_tinh = 'Size'
    ORDER BY gt.id;
  `;

  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error("Lỗi MySQL:", err);
    res.status(500).json({ message: 'Lỗi truy vấn', error: err });
  }
};

const getColorValues = async (req, res) => {
  const sql = `
    SELECT gt.id AS gia_tri_id, gt.gia_tri
    FROM thuoc_tinh tt
    JOIN gia_tri_thuoc_tinh gt ON tt.id = gt.thuoc_tinh_id
    WHERE tt.ten_thuoc_tinh = 'Màu'
    ORDER BY gt.id;
  `;

  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error("Lỗi MySQL:", err);
    res.status(500).json({ message: 'Lỗi truy vấn', error: err });
  }
};



module.exports = {
  getSizeValues,
  getColorValues
};
