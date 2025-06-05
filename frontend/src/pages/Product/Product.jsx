import './Product.css';
import { useState, useEffect } from 'react';
import { fetchProducts } from '../../services/productService';
import { useNavigate } from 'react-router-dom';

export default function Product() {
  const [productData, setProductData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  // Load dữ liệu sản phẩm khi component được render
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();

        // Biến đổi dữ liệu sản phẩm và biến thể thành định dạng phẳng
        const mapped = data.flatMap((item) => {
          return item.bien_the.map((variant) => {
            const { Màu: mauSac = '', Size: size = '' } = variant.thuoc_tinh || {};

            return {
              maSanPham: item.ma_san_pham,
              tenSanPham: item.ten_san_pham,
              hinhAnh: variant.hinh_anh || item.hinh_anh,
              mauSac,
              size,
              giaBan: Number(variant.gia_ban),
              soLuong: variant.so_luong || 0,
              loHang: new Date(variant.ngay_nhap).toLocaleDateString('vi-VN'),
            };
          });
        });

        setProductData(mapped);
      } catch (error) {
        console.error('Lỗi:', error);
      }
    }

    loadProducts();
  }, []);

  return (
    <div className='product-page'>
      <h1>QUẢN LÝ SẢN PHẨM</h1>

      {/* Nút Thêm sản phẩm */}
      <div className="actions">
        <button className='btn btn-add' onClick={() => navigate('/products/add')}>
          <i className="uil uil-plus-circle"></i> Thêm sản phẩm
        </button>
      </div>

      {/* Bảng hiển thị sản phẩm */}
      <table className="product-table">
        <thead>
          <tr>
            <th>Mã SP</th>
            <th>Lô hàng</th>
            <th>Tên SP</th>
            <th>Màu sắc</th>
            <th>Size</th>
            <th>Giá bán</th>
            <th>Số lượng</th>
            <th>Hình ảnh</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {productData.map((sp, i) => (
            <tr key={`${sp.maSanPham}-${i}`}>
              <td>{sp.maSanPham}</td>
              <td>{sp.loHang}</td>
              <td>{sp.tenSanPham}</td>
              <td>{sp.mauSac}</td>
              <td>{sp.size}</td>
              <td>{sp.giaBan.toLocaleString()} đ</td>
              <td>{sp.soLuong}</td>
              <td>
                <img
                  src={`http://localhost:3000/images/${sp.hinhAnh}`}
                  alt={sp.tenSanPham}
                  width="80"
                />
              </td>
              <td>
                <button className="btn btn-edit">Sửa</button>
                <button className="btn btn-delete">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Popup thêm sản phẩm */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Thêm sản phẩm</h2>
            <form className="product-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Mã sản phẩm</label>
                <input type="text" name="maSanPham" required />
              </div>
              <div className="form-group">
                <label>Tên sản phẩm</label>
                <input type="text" name="tenSanPham" required />
              </div>
              <div className="form-group">
                <label>Giá bán</label>
                <input type="number" name="giaBan" min="0" required />
              </div>
              <div className="form-group">
                <label>Số lượng</label>
                <input type="number" name="soLuong" min="0" required />
              </div>
              <div className="form-group">
                <label>Màu sắc</label>
                <input type="text" name="mauSac" />
              </div>
              <div className="form-group">
                <label>Size</label>
                <input type="text" name="size" />
              </div>
              <div className="form-group">
                <label>Hình ảnh (tên file)</label>
                <input type="text" name="hinhAnh" placeholder="vd: ao1.jpg" />
              </div>
              <div className="form-group">
                <label>Ngày nhập</label>
                <input type="date" name="ngayNhap" required />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-save">Lưu</button>
                <button type="button" className="btn btn-cancel" onClick={() => setShowPopup(false)}>
                  Hủy
                </button>
              </div>
            </form>

            <button className="btn btn-close" onClick={() => setShowPopup(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

