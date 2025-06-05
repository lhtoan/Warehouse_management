import './Product.css';
import { useState, useEffect } from 'react';
import { fetchProducts } from '../../services/productService';

export default function Product() {
  const [productData, setProductData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
  
        // Duyệt từng sản phẩm và biến thể
        const mapped = data.flatMap((item) => {
          return item.bien_the.map(variant => {
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

      <div className="actions">
        <button className='btn btn-add' onClick={() => setShowPopup(true)}>
          <i className="uil uil-plus-circle"></i> Thêm sản phẩm
        </button>
      </div>

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
                <img src={`http://localhost:3000/images/${sp.hinhAnh}`} alt={sp.tenSanPham} width="80" />
              </td>
              <td>
                <button className="btn btn-edit">Sửa</button>
                <button className="btn btn-delete">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPopup && (
        <div className="popup-overlay">
          {/* Form thêm sản phẩm sẽ đặt ở đây nếu bạn đã có */}
        </div>
      )}
    </div>
  );
}
