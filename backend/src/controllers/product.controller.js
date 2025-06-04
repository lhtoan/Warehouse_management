const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        sp.ma_san_pham AS ma_san_pham,
        sp.ten_san_pham AS ten_san_pham,
        sp.hinh_anh,
        GROUP_CONCAT(DISTINCT CONCAT(tt.ten_thuoc_tinh, ': ', gt1.gia_tri) ORDER BY tt.ten_thuoc_tinh SEPARATOR ', ') AS bien_the,
        btlh.gia_ban,
        lh.ngay_nhap,
        btlh.so_luong
      FROM san_pham sp
      JOIN bien_the_san_pham bt ON bt.san_pham_id = sp.id
      JOIN gia_tri_bien_the gtv ON gtv.bien_the_id = bt.id
      JOIN gia_tri_thuoc_tinh gt1 ON gt1.id = gtv.gia_tri_thuoc_tinh_id
      JOIN thuoc_tinh tt ON tt.id = gt1.thuoc_tinh_id
      JOIN bien_the_lo_hang btlh ON btlh.bien_the_id = bt.id
      JOIN lo_hang lh ON lh.id = btlh.lo_hang_id
      GROUP BY sp.id, bt.id, btlh.gia_ban, lh.ngay_nhap, btlh.so_luong
    `);

    const formatted = rows.map(row => ({
      ma_san_pham: row.ma_san_pham,
      ten_san_pham: row.ten_san_pham,
      hinh_anh: row.hinh_anh,
      bien_the: row.bien_the,
      gia_ban: row.gia_ban,
      ngay_nhap: row.ngay_nhap,
      so_luong: row.so_luong
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Lỗi truy xuất sản phẩm:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

exports.createProduct = async (req, res) => {
  const connection = await db.getConnection(); // Lấy connection, nếu dùng pool
  try {
    await connection.beginTransaction();

    const {
      ma_san_pham,
      ten_san_pham,
      hinh_anh,
      bien_the_list
    } = req.body;

    // 1. Kiểm tra sản phẩm đã tồn tại chưa
    const [existing] = await connection.execute(
      'SELECT ma_san_pham FROM san_pham WHERE ma_san_pham = ?',
      [ma_san_pham]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Mã sản phẩm đã tồn tại' });
    }

    // 2. Thêm sản phẩm chính
    const [resultSanPham] = await connection.execute(
      'INSERT INTO san_pham (ma_san_pham, ten_san_pham, hinh_anh) VALUES (?, ?, ?)',
      [ma_san_pham, ten_san_pham, hinh_anh]
    );
    const san_pham_id = resultSanPham.insertId;

    // 3. Xử lý biến thể
    // Tạo biến thể, gán thuộc tính size và màu sắc
    for (const bien_the of bien_the_list) {
      const { mau_sac, size, gia_ban, so_luong, ngay_nhap } = bien_the;

      // Thêm biến thể sản phẩm
      const [resultBienThe] = await connection.execute(
        'INSERT INTO bien_the_san_pham (san_pham_id) VALUES (?)',
        [san_pham_id]
      );
      const bien_the_id = resultBienThe.insertId;

      // Lấy id thuoc_tinh cho 'Size' và 'Màu'
      const [thuocTinhRows] = await connection.execute(
        "SELECT id, ten_thuoc_tinh FROM thuoc_tinh WHERE ten_thuoc_tinh IN ('Size', 'Màu')"
      );

      const sizeThuocTinh = thuocTinhRows.find(tt => tt.ten_thuoc_tinh === 'Size');
      const mauThuocTinh = thuocTinhRows.find(tt => tt.ten_thuoc_tinh === 'Màu');

      if (!sizeThuocTinh || !mauThuocTinh) {
        await connection.rollback();
        return res.status(500).json({ error: 'Thiếu thuộc tính Size hoặc Màu trong DB' });
      }

      // Lấy id giá trị thuộc tính size
      const [[sizeGiaTri]] = await connection.execute(
        'SELECT id FROM gia_tri_thuoc_tinh WHERE thuoc_tinh_id = ? AND gia_tri = ?',
        [sizeThuocTinh.id, size]
      );
      if (!sizeGiaTri) {
        await connection.rollback();
        return res.status(400).json({ error: `Giá trị Size "${size}" không tồn tại` });
      }

      // Lấy id giá trị thuộc tính màu sắc
      const [[mauGiaTri]] = await connection.execute(
        'SELECT id FROM gia_tri_thuoc_tinh WHERE thuoc_tinh_id = ? AND gia_tri = ?',
        [mauThuocTinh.id, mau_sac]
      );
      if (!mauGiaTri) {
        await connection.rollback();
        return res.status(400).json({ error: `Giá trị Màu "${mau_sac}" không tồn tại` });
      }

      // Gán giá trị thuộc tính cho biến thể
      await connection.execute(
        'INSERT INTO gia_tri_bien_the (bien_the_id, gia_tri_thuoc_tinh_id) VALUES (?, ?), (?, ?)',
        [bien_the_id, sizeGiaTri.id, bien_the_id, mauGiaTri.id]
      );

      // 4. Tạo lô hàng cho biến thể đó
      const [resultLoHang] = await connection.execute(
        'INSERT INTO lo_hang (ma_lo, ngay_nhap) VALUES (?, ?)',
        [`LO_${Date.now()}_${Math.floor(Math.random()*1000)}`, ngay_nhap]
      );
      const lo_hang_id = resultLoHang.insertId;

      // 5. Thêm giá bán và số lượng biến thể trong lô hàng
      await connection.execute(
        'INSERT INTO bien_the_lo_hang (bien_the_id, lo_hang_id, gia_ban, so_luong) VALUES (?, ?, ?, ?)',
        [bien_the_id, lo_hang_id, gia_ban, so_luong]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Tạo sản phẩm thành công' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Lỗi server khi tạo sản phẩm' });
  } finally {
    connection.release();
  }
};


