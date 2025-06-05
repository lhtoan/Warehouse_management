const API_URL = 'http://localhost:3000';

export async function fetchProducts() {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) {
    throw new Error('Lỗi khi lấy dữ liệu sản phẩm');
  }
  const data = await response.json();
  return data;
}

export async function fetchColors() {
  const response = await fetch(`${API_URL}/attributes/color`);
  if (!response.ok) {
    throw new Error('Lỗi khi lấy dữ liệu màu sắc');
  }
  const data = await response.json();
  return data;
}

export async function fetchSizes() {
  const response = await fetch(`${API_URL}/attributes/size`);
  if (!response.ok) {
    throw new Error('Lỗi khi lấy dữ liệu size');
  }
  const data = await response.json();
  return data;
}

export async function fetchBatches() {
  const response = await fetch(`${API_URL}/batches`);
  if (!response.ok) {
    throw new Error('Lỗi khi lấy danh sách lô hàng');
  }
  const data = await response.json();
  return data;
}

