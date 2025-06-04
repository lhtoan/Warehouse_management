import { useState, useEffect } from 'react';
import { fetchAttributes } from '../../services/productService';

export default function ProductAddPopup({ onClose, onCreated }) {
  // Thông tin sản phẩm
  const [maSanPham, setMaSanPham] = useState('');
  const [tenSanPham, setTenSanPham] = useState('');
  const [hinhAnhFile, setHinhAnhFile] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);

  // Biến thể
  const [attributes, setAttributes] = useState({ Size: [], Màu: [] });
  const [bienTheList, setBienTheList] = useState([
    { mau_sac: '', size: '', gia_ban: '', so_luong: '', ngay_nhap: '' }
  ]);

  // Lấy dữ liệu thuộc tính khi mount
  useEffect(() => {
    async function loadAttributes() {
      try {
        const data = await fetchAttributes();
        setAttributes(data);
      } catch (e) {
        alert('Lỗi lấy thuộc tính: ' + e.message);
      }
    }
    loadAttributes();
  }, []);

  // Preview ảnh khi chọn file
  function handleFileChange(e) {
    const file = e.target.files[0];
    setHinhAnhFile(file);
    if (file) {
      setPreviewImg(URL.createObjectURL(file));
    } else {
      setPreviewImg(null);
    }
  }

  // Thêm biến thể mới
  function addVariant() {
    setBienTheList([...bienTheList, { mau_sac: '', size: '', gia_ban: '', so_luong: '', ngay_nhap: '' }]);
  }

  // Xóa biến thể
  function removeVariant(index) {
    const newList = bienTheList.filter((_, i) => i !== index);
    setBienTheList(newList);
  }

  // Cập nhật biến thể
  function updateVariant(index, field, value) {
    const newList = [...bienTheList];
    newList[index][field] = value;
    setBienTheList(newList);
  }

  // Gửi form
  async function handleSubmit(e) {
    e.preventDefault();

    if (!maSanPham || !tenSanPham) {
      alert('Vui lòng nhập mã và tên sản phẩm');
      return;
    }

    // Kiểm tra biến thể đủ thông tin
    for (const vt of bienTheList) {
      if (!vt.mau_sac || !vt.size || !vt.gia_ban || !vt.so_luong || !vt.ngay_nhap) {
        alert('Vui lòng nhập đầy đủ thông tin biến thể');
        return;
      }
    }

    const formData = new FormData();
    formData.append('ma_san_pham', maSanPham);
    formData.append('ten_san_pham', tenSanPham);
    if (hinhAnhFile) formData.append('file', hinhAnhFile);

    // bien_the_list gửi dưới dạng JSON string
    formData.append('bien_the_list', JSON.stringify(bienTheList));

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        alert('Lỗi tạo sản phẩm: ' + (errData.error || res.statusText));
        return;
      }
      alert('Tạo sản phẩm thành công');
      onCreated(); // refresh danh sách
      onClose();
    } catch (error) {
      alert('Lỗi kết nối server: ' + error.message);
    }
  }

  return (
    <div className="popup">
      <form className="popup-form" onSubmit={handleSubmit}>

        {/* Bên trái: Thông tin sản phẩm */}
        <div className="form-left">
          <h3>Thông tin sản phẩm</h3>
          <label>
            Mã sản phẩm:
            <input value={maSanPham} onChange={e => setMaSanPham(e.target.value)} required />
          </label>
          <label>
            Tên sản phẩm:
            <input value={tenSanPham} onChange={e => setTenSanPham(e.target.value)} required />
          </label>
          <label>
            Hình ảnh:
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
          {previewImg && (
            <img src={previewImg} alt="preview" style={{ maxWidth: 200, marginTop: 10 }} />
          )}
        </div>

        {/* Bên phải: Biến thể */}
        <div className="form-right">
          <h3>Biến thể sản phẩm</h3>

          {bienTheList.map((vt, idx) => (
            <div key={idx} className="variant-item">
              <label>
                Màu sắc:
                <select
                  value={vt.mau_sac}
                  onChange={e => updateVariant(idx, 'mau_sac', e.target.value)}
                  required
                >
                  <option value="">-- Chọn màu --</option>
                  {attributes.Màu.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </label>

              <label>
                Size:
                <select
                  value={vt.size}
                  onChange={e => updateVariant(idx, 'size', e.target.value)}
                  required
                >
                  <option value="">-- Chọn size --</option>
                  {attributes.Size.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </label>

              <label>
                Giá bán:
                <input
                  type="number"
                  min="0"
                  value={vt.gia_ban}
                  onChange={e => updateVariant(idx, 'gia_ban', e.target.value)}
                  required
                />
              </label>

              <label>
                Số lượng:
                <input
                  type="number"
                  min="0"
                  value={vt.so_luong}
                  onChange={e => updateVariant(idx, 'so_luong', e.target.value)}
                  required
                />
              </label>

              <label>
                Ngày nhập:
                <input
                  type="date"
                  value={vt.ngay_nhap}
                  onChange={e => updateVariant(idx, 'ngay_nhap', e.target.value)}
                  required
                />
              </label>

              {bienTheList.length > 1 && (
                <button type="button" onClick={() => removeVariant(idx)} className="btn-remove-variant">
                  Xóa biến thể
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addVariant} className="btn-add-variant">
            + Thêm biến thể
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-submit">Lưu sản phẩm</button>
          <button type="button" className="btn btn-cancel" onClick={onClose}>Hủy</button>
        </div>
      </form>
    </div>
  );
}
