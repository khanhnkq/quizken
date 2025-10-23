export type ShopFavorite = {
  title: string;
  href: string;
  image?: string;
  note?: string;
};

/**
 * Cấu hình danh sách sản phẩm Shopee yêu thích để hiển thị dạng card
 * - title: Tên sản phẩm hiển thị trên card
 * - href: Link Shopee tới sản phẩm
 * - image (tuỳ chọn): Ảnh minh họa (URL ảnh), có thể để trống
 * - note (tuỳ chọn): Ghi chú ngắn
 * - price (tuỳ chọn): Giá tham khảo (chuỗi), ví dụ "299.000đ"
 *
 * Ví dụ thêm sản phẩm:
 * {
 *   title: "Chuột không dây",
 *   href: "https://shopee.vn/...",
 *   image: "https://...",
 *   note: "Dùng khi làm web này",
 *   price: "299.000đ"
 * }
 */
export const shopFavorites: ShopFavorite[] = [
  {
    title: "Chuột không dây",
    href: "https://s.shopee.vn/6psJM9UzIO",
    image:
      "https://product.hstatic.net/200000420363/product/r1_8747f811-5ede-47a6-8b88-4b992277d196_f8b1eeef02df44a1ae59fc10b58231a7_master.jpg",
    note: "Dùng khi làm web này",
  },
];
