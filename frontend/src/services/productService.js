const API_URL = 'http://localhost:3000';
export async function fetchProducts() {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error('Lỗi khi lấy dữ liệu sản phẩm');
    }
    const data = await response.json();
    return data;
  }
  