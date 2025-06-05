import React, { useState, useEffect } from 'react';
import './ProductAddForm.css';
import { fetchColors, fetchSizes, fetchBatches } from '../../services/productService';

export default function ProductForm() {
  const [productInfo, setProductInfo] = useState({
    ma_san_pham: '',
    ten_san_pham: '',
  });

  const [variants, setVariants] = useState([
    { mauSac: '', size: '', giaBan: '', soLuong: '', batchId: '', hinhAnh: '' },
  ]);

  const [showVariantForm, setShowVariantForm] = useState(false);

  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [colorsData, sizesData, batchesData] = await Promise.all([
          fetchColors(),
          fetchSizes(),
          fetchBatches(),
        ]);
        setColors(colorsData);
        setSizes(sizesData);
        setBatches(batchesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (productInfo.ma_san_pham && productInfo.ten_san_pham) {
      setShowVariantForm(true);
    } else {
      alert('Vui lòng nhập đầy đủ Mã SP và Tên SP.');
    }
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { mauSac: '', size: '', giaBan: '', soLuong: '', batchId: '', hinhAnh: '' },
    ]);
  };

  const handleVariantChange = (index, field, value, file = null) => {
    const updated = [...variants];
    if (field === 'hinhAnh' && file) {
      updated[index][field] = file;
      updated[index].preview = URL.createObjectURL(file);
    } else {
      updated[index][field] = value;
    }
    setVariants(updated);
  };

  const handleSubmitAll = (e) => {
    e.preventDefault();

    const bien_the = variants.map((v) => ({
      thuoc_tinh: {
        Màu: v.mauSac,
        Size: v.size,
      },
      gia_ban: Number(v.giaBan),
      so_luong: Number(v.soLuong),
      lo_hang_id: v.batchId,
      hinh_anh: v.hinhAnh,
    }));

    const payload = {
      ...productInfo,
      bien_the,
    };

    console.log('📦 Gửi dữ liệu:', payload);
    alert('Tạo sản phẩm kèm biến thể thành công!');

    setProductInfo({ ma_san_pham: '', ten_san_pham: '' });
    setVariants([{ mauSac: '', size: '', giaBan: '', soLuong: '', batchId: '', hinhAnh: '' }]);
    setShowVariantForm(false);
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <form className="product-form" onSubmit={handleSubmitAll}>
      {!showVariantForm && (
        <div className="product-basic">
          <h2>Thông tin sản phẩm</h2>
          <label>
            Mã sản phẩm:
            <input
              type="text"
              value={productInfo.ma_san_pham}
              onChange={(e) =>
                setProductInfo({ ...productInfo, ma_san_pham: e.target.value })
              }
              required
            />
          </label>
          <label>
            Tên sản phẩm:
            <input
              type="text"
              value={productInfo.ten_san_pham}
              onChange={(e) =>
                setProductInfo({ ...productInfo, ten_san_pham: e.target.value })
              }
              required
            />
          </label>
          <button onClick={handleCreateProduct} className="btn btn-primary">
            Tạo sản phẩm
          </button>
        </div>
      )}

      {showVariantForm && (
        <div className="variant-section">
          <h2>Biến thể sản phẩm</h2>
          {variants.map((v, index) => (
            <div key={index} className="variant-group">
              <h4>Biến thể {index + 1}</h4>

              <label>
                Màu sắc:
                <select
                  value={v.mauSac}
                  onChange={(e) => handleVariantChange(index, 'mauSac', e.target.value)}
                  required
                >
                  <option value="">-- Chọn màu sắc --</option>
                  {colors.map((color) => (
                    <option key={color.gia_tri_id} value={color.gia_tri}>
                      {color.gia_tri}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Size:
                <select
                  value={v.size}
                  onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                  required
                >
                  <option value="">-- Chọn size --</option>
                  {sizes.map((size) => (
                    <option key={size.gia_tri_id} value={size.gia_tri}>
                      {size.gia_tri}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Giá bán:
                <input
                  type="number"
                  value={v.giaBan}
                  onChange={(e) => handleVariantChange(index, 'giaBan', e.target.value)}
                  required
                />
              </label>

              <label>
                Số lượng:
                <input
                  type="number"
                  value={v.soLuong}
                  onChange={(e) => handleVariantChange(index, 'soLuong', e.target.value)}
                  required
                />
              </label>

              <label>
                Lô hàng:
                <select
                  value={v.batchId}
                  onChange={(e) => handleVariantChange(index, 'batchId', e.target.value)}
                  required
                >
                  <option value="">-- Chọn lô hàng --</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.ma_lo} - {formatDate(batch.ngay_nhap)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Hình ảnh:
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    handleVariantChange(index, 'hinhAnh', '', file);
                  }}
                  required
                />
              </label>

              {v.preview && (
                <img
                  src={v.preview}
                  alt={`Preview biến thể ${index + 1}`}
                  style={{ width: '100px', height: 'auto', marginTop: '10px' }}
                />
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddVariant}
            className="btn btn-secondary"
          >
            + Thêm biến thể
          </button>
          <button type="submit" className="btn btn-success">
            Hoàn tất
          </button>
        </div>
      )}
    </form>
  );
}
