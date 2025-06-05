const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        sp.id AS san_pham_id,
        sp.ma_san_pham,
        sp.ten_san_pham,
        bt.id AS bien_the_id,
        bt.hinh_anh AS hinh_anh_bien_the,
        tt.ten_thuoc_tinh,
        gt1.gia_tri,
        btlh.gia_ban,
        btlh.so_luong,
        lh.ngay_nhap
      FROM san_pham sp
      JOIN bien_the_san_pham bt ON bt.san_pham_id = sp.id
      JOIN gia_tri_bien_the gtv ON gtv.bien_the_id = bt.id
      JOIN gia_tri_thuoc_tinh gt1 ON gt1.id = gtv.gia_tri_thuoc_tinh_id
      JOIN thuoc_tinh tt ON tt.id = gt1.thuoc_tinh_id
      JOIN bien_the_lo_hang btlh ON btlh.bien_the_id = bt.id
      JOIN lo_hang lh ON lh.id = btlh.lo_hang_id
      ORDER BY sp.id, bt.id, tt.ten_thuoc_tinh;

    `);

    // Gom nhóm sản phẩm
    const productsMap = new Map();

    for (const row of rows) {
      const {
        san_pham_id,
        ma_san_pham,
        ten_san_pham,
        hinh_anh_san_pham,
        bien_the_id,
        hinh_anh_bien_the,
        ten_thuoc_tinh,
        gia_tri,
        gia_ban,
        so_luong,
        ngay_nhap
      } = row;

      if (!productsMap.has(san_pham_id)) {
        productsMap.set(san_pham_id, {
          ma_san_pham,
          ten_san_pham,
          hinh_anh: hinh_anh_san_pham,
          bien_the: []
        });
      }

      const product = productsMap.get(san_pham_id);

      let variant = product.bien_the.find(bt => bt.bien_the_id === bien_the_id);
      if (!variant) {
        variant = {
          bien_the_id,
          hinh_anh: hinh_anh_bien_the,
          thuoc_tinh: {},
          gia_ban,
          so_luong,
          ngay_nhap
        };
        product.bien_the.push(variant);
      }

      variant.thuoc_tinh[ten_thuoc_tinh] = gia_tri;
    }

    const result = Array.from(productsMap.values());

    res.json(result);
  } catch (error) {
    console.error('Lỗi truy xuất sản phẩm:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// POST /products
exports.createProduct = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { ma_san_pham, ten_san_pham } = req.body;

    // Kiểm tra mã sản phẩm đã tồn tại chưa
    const [existing] = await connection.execute(
      'SELECT ma_san_pham FROM san_pham WHERE ma_san_pham = ?',
      [ma_san_pham]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Mã sản phẩm đã tồn tại' });
    }

    // Chèn sản phẩm mới (chỉ 2 cột)
    const [result] = await connection.execute(
      'INSERT INTO san_pham (ma_san_pham, ten_san_pham) VALUES (?, ?)',
      [ma_san_pham, ten_san_pham]
    );

    res.status(201).json({
      message: 'Tạo sản phẩm thành công',
      san_pham_id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server khi tạo sản phẩm' });
  } finally {
    connection.release();
  }
};


// POST /products/:id/variant
exports.addVariant = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id: san_pham_id } = req.params;
    const { mau_sac, size, gia_ban, so_luong, lo_hang_id } = req.body;
    const hinh_anh = req.file ? req.file.filename : null;

    await connection.beginTransaction();

    // Kiểm tra sản phẩm có tồn tại không
    const [sanPhamRows] = await connection.execute(
      'SELECT id FROM san_pham WHERE id = ?',
      [san_pham_id]
    );
    if (sanPhamRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Sản phẩm không tồn tại' });
    }

    // Kiểm tra lô hàng
    const [loHangRows] = await connection.execute(
      'SELECT id FROM lo_hang WHERE id = ?',
      [lo_hang_id]
    );
    if (loHangRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: `Lô hàng ID ${lo_hang_id} không tồn tại` });
    }

    // Tạo biến thể
    const [resultBienThe] = await connection.execute(
      'INSERT INTO bien_the_san_pham (san_pham_id, hinh_anh) VALUES (?, ?)',
      [san_pham_id, hinh_anh]
    );
    const bien_the_id = resultBienThe.insertId;

    // Lấy thuộc tính
    const [thuocTinhRows] = await connection.execute(
      "SELECT id, ten_thuoc_tinh FROM thuoc_tinh WHERE ten_thuoc_tinh IN ('Size', 'Màu')"
    );
    const sizeTT = thuocTinhRows.find(tt => tt.ten_thuoc_tinh === 'Size');
    const mauTT = thuocTinhRows.find(tt => tt.ten_thuoc_tinh === 'Màu');

    const [[sizeGT]] = await connection.execute(
      'SELECT id FROM gia_tri_thuoc_tinh WHERE thuoc_tinh_id = ? AND gia_tri = ?',
      [sizeTT.id, size]
    );
    const [[mauGT]] = await connection.execute(
      'SELECT id FROM gia_tri_thuoc_tinh WHERE thuoc_tinh_id = ? AND gia_tri = ?',
      [mauTT.id, mau_sac]
    );

    if (!sizeGT || !mauGT) {
      await connection.rollback();
      return res.status(400).json({ error: 'Giá trị thuộc tính không hợp lệ' });
    }

    // Gắn thuộc tính
    await connection.execute(
      'INSERT INTO gia_tri_bien_the (bien_the_id, gia_tri_thuoc_tinh_id) VALUES (?, ?), (?, ?)',
      [bien_the_id, sizeGT.id, bien_the_id, mauGT.id]
    );

    // Gắn lô hàng
    await connection.execute(
      'INSERT INTO bien_the_lo_hang (bien_the_id, lo_hang_id, gia_ban, so_luong) VALUES (?, ?, ?, ?)',
      [bien_the_id, lo_hang_id, gia_ban, so_luong]
    );

    await connection.commit();
    res.status(201).json({ message: 'Thêm biến thể thành công', bien_the_id });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi thêm biến thể' });
  } finally {
    connection.release();
  }
};

