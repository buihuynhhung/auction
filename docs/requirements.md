# Requirements: Web App Dau Gia Noi Bo

## 1. Muc Tieu

Xay dung web app noi bo cho cong ty de dang ban dau gia cac thiet bi da qua su dung nhu laptop, may in, may scan va cac tai san IT khac. He thong cho phep admin dang thiet bi, tao phien dau gia, nhan vien dat gia, va tu dong chot nguoi thang khi phien dau gia ket thuc.

Muc tieu cua ban MVP la tao duoc mot quy trinh dau gia ro rang, minh bach, de dung va co du lieu lich su de doi chieu khi can.

## 2. Pham Vi MVP

MVP tap trung vao cac chuc nang cot loi:

- Dang nhap nguoi dung.
- Phan quyen admin va nhan vien.
- Admin quan ly thiet bi dau gia.
- Admin tao va quan ly phien dau gia.
- Nhan vien xem danh sach phien dau gia dang mo.
- Nhan vien xem chi tiet thiet bi.
- Nhan vien dat gia.
- He thong ghi nhan lich su dat gia.
- He thong tu dong xac dinh nguoi thang khi het thoi gian.
- Admin xem ket qua phien dau gia.

Nhung tinh nang chua can co trong MVP:

- Thanh toan online.
- Tich hop ke toan.
- Dau gia an danh nang cao.
- Ung dung mobile rieng.
- Workflow phe duyet nhieu cap.
- Tich hop SSO Google Workspace hoac Microsoft 365.

## 3. Vai Tro Nguoi Dung

### 3.1. Admin

Admin la nguoi quan ly tai san va phien dau gia. Admin co the:

- Dang nhap vao he thong.
- Tao, sua, an/hien thiet bi.
- Them thong tin thiet bi: ten, loai, mo ta, tinh trang, serial, ma tai san, hinh anh.
- Tao phien dau gia cho thiet bi.
- Cau hinh gia khoi diem, buoc gia toi thieu, thoi gian bat dau, thoi gian ket thuc.
- Xem lich su dat gia cua tung phien.
- Huy phien dau gia neu can.
- Xem nguoi thang sau khi phien ket thuc.
- Xac nhan ket qua sau dau gia.

### 3.2. Nhan Vien

Nhan vien la nguoi tham gia dau gia. Nhan vien co the:

- Dang nhap vao he thong.
- Xem danh sach thiet bi dang dau gia.
- Loc hoac tim kiem thiet bi theo ten, loai, trang thai.
- Xem chi tiet thiet bi va phien dau gia.
- Dat gia neu phien dau gia dang mo.
- Xem gia hien tai va gia toi thieu co the dat tiep theo.
- Xem lich su nhung lan minh da dat gia.
- Xem ket qua phien dau gia sau khi ket thuc.

## 4. Tinh Nang MVP

### 4.1. Dang Nhap Va Phan Quyen

He thong can co dang nhap co ban bang email va mat khau.

Yeu cau:

- Moi nguoi dung co email duy nhat.
- Moi nguoi dung co role: `ADMIN` hoac `EMPLOYEE`.
- Route admin chi cho phep role `ADMIN` truy cap.
- Nhan vien khong duoc truy cap trang quan tri.

### 4.2. Quan Ly Thiet Bi

Admin co the tao va cap nhat thiet bi.

Thong tin thiet bi:

- Ten thiet bi.
- Loai thiet bi: laptop, may in, may scan, man hinh, phu kien, khac.
- Ma tai san noi bo.
- Serial number neu co.
- Model neu co.
- Mo ta.
- Tinh trang: tot, kha, trung binh, hong mot phan, khac.
- Ghi chu ve loi hoac phu kien di kem.
- Hinh anh thiet bi.
- Trang thai: draft, available, archived.

### 4.3. Quan Ly Phien Dau Gia

Admin co the tao phien dau gia gan voi mot thiet bi.

Thong tin phien dau gia:

- Thiet bi duoc dau gia.
- Gia khoi diem.
- Buoc gia toi thieu.
- Thoi gian bat dau.
- Thoi gian ket thuc.
- Trang thai: draft, scheduled, active, closed, cancelled.
- Nguoi thang sau khi ket thuc neu co.

Yeu cau:

- Mot thiet bi khong duoc co nhieu hon mot phien dau gia dang `active` hoac `scheduled`.
- Phien dau gia chi cho phep dat gia trong khoang thoi gian tu `startAt` den `endAt`.
- Admin co the huy phien truoc khi ket thuc.

### 4.4. Danh Sach Dau Gia Cho Nhan Vien

Nhan vien co the xem danh sach phien dau gia.

Moi item hien thi:

- Anh dai dien.
- Ten thiet bi.
- Loai thiet bi.
- Gia khoi diem.
- Gia hien tai.
- Gia toi thieu co the dat tiep theo.
- Thoi gian con lai.
- Trang thai phien dau gia.

### 4.5. Chi Tiet Phien Dau Gia

Trang chi tiet can hien thi:

- Tat ca thong tin thiet bi.
- Hinh anh thiet bi.
- Gia khoi diem.
- Gia hien tai.
- Buoc gia toi thieu.
- Thoi gian bat dau va ket thuc.
- Lich su dat gia.
- Form dat gia neu phien dang mo.
- Ket qua neu phien da ket thuc.

### 4.6. Dat Gia

Nhan vien co the dat gia cho phien dau gia dang mo.

Quy tac:

- Chi nhan vien da dang nhap moi duoc dat gia.
- Khong cho dat gia neu phien chua bat dau.
- Khong cho dat gia neu phien da ket thuc.
- Khong cho dat gia neu phien bi huy.
- Gia dat dau tien phai lon hon hoac bang gia khoi diem.
- Gia dat tiep theo phai lon hon hoac bang gia hien tai cong buoc gia toi thieu.
- Moi lan dat gia phai duoc luu vao lich su.
- Neu co nhieu nguoi dat cung luc, he thong phai dam bao chi bid hop le cao nhat tai thoi diem ghi nhan duoc chap nhan.

### 4.7. Ket Thuc Phien Dau Gia

Khi het thoi gian:

- He thong khoa phien dau gia.
- Trang thai phien doi thanh `closed`.
- He thong tim bid cao nhat.
- Neu co bid, gan `winnerId` la nguoi dat bid cao nhat.
- Neu khong co bid, phien ket thuc khong co nguoi thang.

Trong MVP, viec chot phien co the duoc xu ly khi:

- Co nguoi truy cap trang phien dau gia.
- Admin mo trang quan tri.
- Hoac mot script/cron chay dinh ky.

### 4.8. Ket Qua Va Lich Su

Admin can xem duoc:

- Tat ca bid cua mot phien.
- Nguoi thang.
- Gia thang.
- Thoi diem ket thuc.

Nhan vien can xem duoc:

- Cac phien minh da tham gia.
- Bid cua minh.
- Ket qua thang/thua sau khi ket thuc.

## 5. Database Entities

### 5.1. User

Luu thong tin nguoi dung.

Fields de xuat:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`: `ADMIN`, `EMPLOYEE`
- `department`
- `isActive`
- `createdAt`
- `updatedAt`

### 5.2. Item

Luu thong tin thiet bi.

Fields de xuat:

- `id`
- `name`
- `category`
- `assetCode`
- `serialNumber`
- `model`
- `description`
- `condition`
- `includedAccessories`
- `knownIssues`
- `status`: `DRAFT`, `AVAILABLE`, `ARCHIVED`
- `createdById`
- `createdAt`
- `updatedAt`

### 5.3. ItemImage

Luu hinh anh cua thiet bi.

Fields de xuat:

- `id`
- `itemId`
- `url`
- `altText`
- `sortOrder`
- `createdAt`

### 5.4. Auction

Luu phien dau gia.

Fields de xuat:

- `id`
- `itemId`
- `startingPrice`
- `minIncrement`
- `startAt`
- `endAt`
- `status`: `DRAFT`, `SCHEDULED`, `ACTIVE`, `CLOSED`, `CANCELLED`
- `winnerId`
- `closedAt`
- `createdById`
- `createdAt`
- `updatedAt`

### 5.5. Bid

Luu lich su dat gia.

Fields de xuat:

- `id`
- `auctionId`
- `userId`
- `amount`
- `createdAt`

Index/constraint de xuat:

- Index theo `auctionId`.
- Index theo `userId`.
- Index theo `auctionId, amount`.
- Khong cho amount nho hon hoac bang 0.

### 5.6. AuditLog

MVP co the chua can giao dien rieng, nhung nen co neu muon minh bach.

Fields de xuat:

- `id`
- `actorId`
- `action`
- `entityType`
- `entityId`
- `metadata`
- `createdAt`

## 6. Business Rules

### 6.1. Quy Tac Thiet Bi

- Thiet bi phai co ten va loai.
- Mot thiet bi chi nen co mot ma tai san duy nhat neu cong ty co quan ly asset code.
- Thiet bi da archived khong duoc tao phien dau gia moi.
- Thiet bi da co phien active/scheduled khong duoc tao them phien active/scheduled khac.

### 6.2. Quy Tac Phien Dau Gia

- `startAt` phai nho hon `endAt`.
- `startingPrice` phai lon hon hoac bang 0.
- `minIncrement` phai lon hon 0.
- Chi phien `ACTIVE` moi cho phep dat gia.
- Phien `CLOSED` hoac `CANCELLED` khong duoc sua cac thong tin anh huong ket qua, tru khi admin co quyen dac biet va hanh dong duoc ghi audit log.

### 6.3. Quy Tac Dat Gia

- User phai active moi duoc dat gia.
- Admin khong nen tham gia dat gia trong MVP de tranh xung dot loi ich.
- Bid phai duoc xu ly bang transaction de tranh loi khi nhieu nguoi dat cung luc.
- Bid sau khong duoc thap hon bid hop le cao nhat hien tai cong `minIncrement`.
- Neu hai bid co cung amount, bid nao duoc ghi nhan truoc se dung truoc.

### 6.4. Quy Tac Ket Qua

- Nguoi thang la user co bid hop le cao nhat khi phien ket thuc.
- Neu co nhieu bid bang nhau, bid som nhat thang.
- Neu khong co bid, phien ket thuc voi ket qua khong co nguoi thang.
- Ket qua sau khi dong phien can duoc luu lai de truy vet.

## 7. Man Hinh Can Co

### 7.1. Man Hinh Chung

- Dang nhap.
- Trang chu sau dang nhap.
- Trang loi khong co quyen truy cap.

### 7.2. Man Hinh Nhan Vien

- Danh sach phien dau gia.
- Chi tiet phien dau gia.
- Form dat gia.
- Lich su dau gia cua toi.
- Ket qua cac phien da tham gia.

### 7.3. Man Hinh Admin

- Dashboard tong quan.
- Quan ly thiet bi.
- Tao/sua thiet bi.
- Quan ly phien dau gia.
- Tao/sua/huy phien dau gia.
- Chi tiet phien dau gia va danh sach bid.
- Trang ket qua dau gia.

## 8. Yeu Cau Giao Dien

- Giao dien ro rang, de dung voi nhan vien khong chuyen ky thuat.
- Danh sach dau gia phai uu tien hien thi gia hien tai va thoi gian con lai.
- Trang dat gia phai hien thi ro gia toi thieu co the dat tiep theo.
- Nut dat gia can co buoc xac nhan de tranh nhap nham.
- Trang admin can gon, de thao tac nhanh.
- Trang thai phien dau gia can co mau sac de phan biet: sap dien ra, dang mo, da dong, da huy.

## 9. Yeu Cau Bao Mat Va Minh Bach

- Mat khau phai duoc hash, khong luu plain text.
- Tat ca route quan tri phai kiem tra role.
- Khong cho user sua/xoa bid da dat.
- Cac hanh dong quan trong nen ghi audit log.
- He thong can validate input ca o frontend va backend.
- Loi validation phai hien thi ro rang cho nguoi dung.

## 10. Tieu Chi Hoan Thanh MVP

MVP duoc xem la hoan thanh khi:

- Admin tao duoc thiet bi.
- Admin tao duoc phien dau gia.
- Nhan vien xem duoc danh sach phien dau gia.
- Nhan vien dat gia thanh cong theo dung quy tac.
- He thong tu choi bid khong hop le.
- Het gio, phien dau gia dong lai va xac dinh dung nguoi thang.
- Admin xem duoc ket qua va lich su bid.
- Nhan vien xem duoc lich su tham gia cua minh.
- Co seed data de test nhanh.
- Co test cho logic dat gia va chot phien.

## 11. Cac Buoc Phat Trien Tiep Theo

Sau MVP co the bo sung:

- Dang nhap bang Google Workspace hoac Microsoft 365.
- Email thong bao khi bi vuot gia hoac khi thang dau gia.
- Upload anh truc tiep len cloud storage.
- Xuat ket qua ra Excel.
- Quan ly thanh toan va ban giao.
- Dau gia an danh.
- Gia han tu dong neu co bid vao phut cuoi.
- Dashboard thong ke tong tien thu duoc.
- Workflow phe duyet ket qua dau gia.
