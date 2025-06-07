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

// Tạo sản phẩm
export async function createProduct(formData) {
  // formData là object FormData, chứa fields và file hinh_anh
  const response = await fetch(`${API_URL}/products/add`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Lỗi khi tạo sản phẩm');
  }
  const data = await response.json();
  return data; // { san_pham_id }
}

// Tạo từng biến thể 1 request
export async function createVariant(productId, variantFormData) {
  // variantFormData là FormData chứa mau_sac, size, gia_ban, so_luong, lo_hang_id, hinh_anh(file)
  const response = await fetch(`${API_URL}/products/${productId}/variant`, {
    method: 'POST',
    body: variantFormData,
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Lỗi khi tạo biến thể');
  }
  const data = await response.json();
  return data;
}

// // Ví dụ dùng chung
// async function uploadProductAndVariants(productInfo, variants) {
//   // productInfo: { ma_san_pham, ten_san_pham, hinh_anh (File) }
//   // variants: mảng [{ mau_sac, size, gia_ban, so_luong, lo_hang_id, hinh_anh (File) }, ...]

//   try {
//     // 1. Tạo form data cho product
//     const productForm = new FormData();
//     productForm.append('ma_san_pham', productInfo.ma_san_pham);
//     productForm.append('ten_san_pham', productInfo.ten_san_pham);
//     productForm.append('hinh_anh', productInfo.hinh_anh);

//     const productRes = await createProduct(productForm);
//     const productId = productRes.san_pham_id;

//     // 2. Tạo từng biến thể
//     for (const variant of variants) {
//       const variantForm = new FormData();
//       variantForm.append('mau_sac', variant.mau_sac);
//       variantForm.append('size', variant.size);
//       variantForm.append('gia_ban', variant.gia_ban);
//       variantForm.append('so_luong', variant.so_luong);
//       variantForm.append('lo_hang_id', variant.lo_hang_id);
//       variantForm.append('hinh_anh', variant.hinh_anh); // file ảnh biến thể

//       await createVariant(productId, variantForm);
//     }

//     console.log('Tạo sản phẩm và biến thể thành công');
//   } catch (error) {
//     console.error('Lỗi khi upload sản phẩm và biến thể:', error.message);
//   }
// }