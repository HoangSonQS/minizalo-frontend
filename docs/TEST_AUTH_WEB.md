# Hướng dẫn test Đăng ký / Đăng nhập trên Web

## 1. Chuẩn bị

### Backend (MiniZalo API)

**Cách 1 – Docker Compose (khuyến nghị):**

1. Vào thư mục `minizalo-backend`.
2. Có file **`.env`** (copy từ `.env.example` nếu chưa có):
   ```bash
   cp .env.example .env
   ```
3. Chạy toàn bộ stack (PostgreSQL, DynamoDB, MinIO, Redis, Backend):
   ```bash
   docker-compose up -d --build
   ```
   Hoặc chạy nền trước (xem log): `docker-compose up --build`.
4. Backend sẽ lên ở **http://localhost:8080**.

**Cách 2 – Chạy trực tiếp:**

- Trong `minizalo-backend`: `./mvnw spring-boot:run` hoặc chạy từ IDE (cần PostgreSQL, DynamoDB, MinIO, Redis đã chạy và cấu hình đúng).

### Frontend (.env)

- Trong thư mục `minizalo-frontend`, tạo hoặc sửa file **`.env`**:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

- Nếu backend chạy trên máy khác, thay `localhost` bằng IP (ví dụ: `http://192.168.1.9:8080/api`).

---

## 2. Chạy Web

Trong thư mục `minizalo-frontend`:

```bash
npm run web
```

- Mở trình duyệt tại: **http://localhost:8081** (hoặc URL mà terminal in ra).

---

## 3. Test Đăng ký

1. Trên màn hình chính (MiniZalo, 2 nút), bấm **ĐĂNG KÝ**.
2. Điền form:
   - **Tên**: bất kỳ (vd: `Test User`)
   - **Số điện thoại**: 10–11 chữ số (vd: `0901234567`)
   - **Email**: hợp lệ (vd: `test@example.com`)
   - **Mật khẩu**: tối thiểu 6 ký tự
   - **Nhập lại mật khẩu**: trùng mật khẩu
3. Bấm **Đăng ký**.
4. **Kỳ vọng**: thông báo thành công và chuyển về màn **Đăng nhập** (form đăng nhập).

---

## 4. Test Đăng nhập

1. Từ màn chính bấm **ĐĂNG NHẬP**, hoặc sau khi đăng ký xong sẽ ở form đăng nhập.
2. Điền:
   - **Số điện thoại hoặc email**: dùng SĐT hoặc email vừa đăng ký (vd: `0901234567` hoặc `test@example.com`)
   - **Mật khẩu**: mật khẩu đã đăng ký
3. Bấm **Đăng nhập**.
4. **Kỳ vọng**: đăng nhập thành công và chuyển sang màn **Tabs** (MiniZalo - Tabs Screen).

---

## 5. Lưu ý khi test

- **CORS**: Backend đã cấu hình cho `http://localhost:8081`. Nếu dùng port/domain khác, cần thêm origin đó vào CORS ở backend.
- **Lỗi mạng**: Kiểm tra backend đang chạy và `.env` đúng `EXPO_PUBLIC_API_URL`.
- **Validation**: SĐT 10–11 số, email hợp lệ, mật khẩu ≥ 6 ký tự, nhập lại mật khẩu khớp; nếu sai sẽ có thông báo lỗi trên form.
