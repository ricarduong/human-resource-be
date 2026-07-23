# Đề xuất giải pháp import Google Sheet vào backend

## 1. Mục đích tài liệu

Tài liệu này tổng hợp các phương án khả thi để import dữ liệu từ Google Sheet private vào backend, đồng thời đưa ra đánh giá và đề xuất hướng triển khai phù hợp nhất cho hệ thống hiện tại.

Mục tiêu của tài liệu:

- Giúp team phát triển có chung góc nhìn về bài toán và các phương án xử lý.
- Làm cơ sở để trao đổi kỹ thuật, chia việc triển khai và ước lượng.
- Có thể dùng để báo cáo với cấp trên về hướng đi đề xuất, lý do lựa chọn và các bước chuẩn bị.

## 2. Bối cảnh bài toán

Backend hiện tại đang import dữ liệu từ file Excel bằng `exceljs`, sau đó thực hiện parse, validate, mapping và insert vào database.

Nguồn dữ liệu mới đã chuyển sang Google Sheet trong Google Workspace enterprise, với các đặc điểm chính:

- File Google Sheet không thể public ra ngoài.
- Workbook có nhiều sheet, nhiều formula và structure tương đối phức tạp.
- Đầu ra cuối cùng vẫn cần tiếp tục tồn tại ở Google Sheet.
- Hệ thống cần ưu tiên đọc đúng giá trị mà người dùng đang thấy trên Google Sheets.
- Về lâu dài có thể cần import nhiều Google Sheet trong cùng một folder.

Điểm mấu chốt là `exceljs` không phải là engine để hiểu và tính công thức của Google Sheets. Nếu cố giữ mô hình xử lý như Excel trong khi nguồn gốc là Google Sheets, rủi ro lệch dữ liệu là đáng kể.

## 3. Tiêu chí đánh giá giải pháp

Ba nhóm tiêu chí chính để đánh giá:

- Độ chính xác dữ liệu: có đọc đúng giá trị đã được Google Sheets tính hay không.
- Mức độ tận dụng backend hiện tại: có giữ lại được logic parse, validate, transform và insert đang có hay không.
- Khả năng vận hành lâu dài: có mở rộng được cho nhiều file, nhiều sheet, retry, logging và báo cáo kết quả theo từng file hay không.

## 4. Ba giải pháp khả thi

## Giải pháp 1. Export Google Sheet sang XLSX rồi tái sử dụng pipeline `exceljs`

### Mô tả

Backend truy cập file Google Sheet private, export file sang định dạng `.xlsx`, sau đó đưa file export này vào pipeline import Excel hiện tại để tận dụng lại logic sẵn có.

### Ưu điểm

- Thay đổi backend ít nhất trong giai đoạn đầu.
- Tận dụng được gần như toàn bộ pipeline import Excel hiện tại.
- Phù hợp để làm POC nhanh và đo mức độ lệch dữ liệu thực tế.
- Thời gian triển khai ngắn hơn so với các hướng tích hợp trực tiếp với Google APIs.

### Nhược điểm

- Formula của Google Sheets và Excel không tương thích hoàn toàn.
- Dữ liệu sau khi export có thể bị lệch so với giá trị người dùng thấy trên Google Sheets.
- Các thành phần như format, merged cell, validation rule, tab structure có thể không giữ được chính xác.
- Không phù hợp nếu đầu vào và đầu ra đều cần bám chặt Google Sheets.
- Về lâu dài dễ phát sinh lỗi khó kiểm soát khi template sheet phức tạp hơn.

### Đánh giá mức phù hợp

Giải pháp này phù hợp để kiểm chứng nhanh, nhưng chỉ nên xem là hướng tạm thời. Nếu hệ thống cần tính đúng dữ liệu theo Google Sheets và tiếp tục vận hành xoay quanh Google Sheets, đây không phải hướng kiến trúc tối ưu.

## Giải pháp 2. Dùng user OAuth, Google Drive API và Google Sheets API để đọc trực tiếp

### Mô tả

Người dùng cấp quyền cho ứng dụng thông qua Google OAuth bằng chính tài khoản Google Workspace đang có quyền trên folder hoặc file cần import. Backend sau đó sử dụng token của user để:

- Liệt kê file trong folder bằng Google Drive API.
- Lọc các file Google Spreadsheet.
- Đọc giá trị đã được Google tính sẵn bằng Google Sheets API.
- Map dữ liệu về input structure nội bộ và tái sử dụng logic validate, transform, insert của backend hiện tại.

### Ưu điểm

- Đọc đúng nhất theo engine của Google Sheets.
- Phù hợp với file có nhiều formula, nhiều sheet và structure phức tạp.
- Phù hợp với yêu cầu đầu ra tiếp tục là Google Sheet.
- Có thể mở rộng sang import nhiều file trong một folder.
- Giữ được phần business logic phía sau nếu tách riêng lớp reader và mapper.
- Là hướng kỹ thuật rõ ràng, nhất quán và bền vững hơn cho dài hạn.

### Nhược điểm

- Cần bổ sung lớp tích hợp Google OAuth, Drive API và Sheets API.
- Cần thêm logic parse link, đọc sheet, mapping dữ liệu và xử lý batch.
- Phải làm việc với refresh token, quota, rate limit và chính sách retry.
- Có thể cần IT Admin hỗ trợ allowlist OAuth app hoặc mở policy trong Google Workspace.

### Đánh giá mức phù hợp

Đây là giải pháp cân bằng tốt nhất giữa độ chính xác dữ liệu, khả năng vận hành lâu dài và mức độ tận dụng backend hiện có. Phần thay đổi mới chủ yếu nằm ở lớp input reader và điều phối import, trong khi business logic hiện tại vẫn có thể được tái sử dụng.

## Giải pháp 3. Dùng Apps Script hoặc integration service nội bộ trong Google Workspace

### Mô tả

Thay vì để backend chính truy cập trực tiếp Google APIs, xây dựng một lớp trung gian trong môi trường Google Workspace, ví dụ Apps Script web app hoặc service nội bộ. Lớp này chịu trách nhiệm đọc hoặc ghi Google Sheets rồi trả về JSON hoặc dữ liệu chuẩn hóa cho backend.

### Ưu điểm

- Giảm mức độ phụ thuộc trực tiếp giữa backend chính và Google APIs.
- Phù hợp khi enterprise policy không muốn backend giữ quyền Google trực tiếp.
- Có thể gom logic đọc, chuẩn hóa và ghi ngược Google Sheets về một lớp chuyên trách.
- Thuận lợi hơn về governance trong các môi trường có kiểm soát bảo mật chặt.

### Nhược điểm

- Tăng thêm một thành phần hệ thống cần triển khai, vận hành và giám sát.
- Debug và theo dõi lỗi có thể phức tạp hơn do luồng xử lý qua thêm một lớp trung gian.
- Cần thống nhất rõ contract giữa backend và lớp tích hợp.
- Nếu không thiết kế cẩn thận, có thể phát sinh độ trễ và chi phí vận hành bổ sung.

### Đánh giá mức phù hợp

Đây là giải pháp khả thi khi chính sách Google Workspace hoặc bảo mật nội bộ không cho backend gọi trực tiếp Google APIs. Tuy nhiên, xét về tổng thể kỹ thuật, đây nên là phương án thay thế khi giải pháp 2 bị chặn bởi hạ tầng hoặc policy.

## 5. So sánh tổng hợp

| Tiêu chí | Giải pháp 1: Export XLSX | Giải pháp 2: Drive API + Sheets API | Giải pháp 3: Apps Script / service trung gian |
| --- | --- | --- | --- |
| Độ chính xác dữ liệu theo Google Sheets | Trung bình | Cao | Cao |
| Mức độ sửa backend ban đầu | Thấp | Trung bình | Trung bình đến cao |
| Tận dụng pipeline hiện tại | Cao | Trung bình đến cao | Trung bình |
| Khả năng mở rộng nhiều file trong folder | Trung bình | Cao | Cao |
| Phù hợp dài hạn | Thấp | Cao | Trung bình đến cao |
| Phụ thuộc policy Google Workspace | Trung bình | Cao | Cao nhưng dễ kiểm soát hơn nếu đi nội bộ |

## 6. Giải pháp được đề xuất

Giải pháp tối ưu và khả thi nhất để triển khai là **Giải pháp 2: user OAuth kết hợp Google Drive API và Google Sheets API**.

### Lý do lựa chọn

- Đây là hướng đọc dữ liệu đúng nhất theo giá trị thực tế mà người dùng đang thấy trên Google Sheets.
- Phù hợp với bối cảnh file có nhiều formula và structure phức tạp.
- Không bắt backend phải giả lập hoặc chuyển đổi engine tính toán từ Google Sheets sang Excel.
- Có thể giữ lại phần lớn business logic hiện tại nếu thiết kế thêm các lớp adapter hoặc reader phù hợp.
- Phù hợp với nhu cầu mở rộng sang import theo folder, import batch và báo cáo kết quả theo từng file.
- Đây là hướng triển khai bền vững hơn so với việc phụ thuộc vào export sang Excel.

### Kết luận quản trị

Nếu mục tiêu là làm POC cực nhanh, giải pháp 1 có thể dùng để đo rủi ro. Tuy nhiên, nếu mục tiêu là đưa vào vận hành thực tế với độ tin cậy cao, giải pháp 2 là hướng nên đầu tư triển khai chính thức.

Giải pháp 3 nên được giữ như phương án dự phòng trong trường hợp enterprise policy không cho backend truy cập Google trực tiếp.

## 7. Các bước chuẩn bị trước khi làm

### Chuẩn bị về nghiệp vụ và dữ liệu

- Chốt rõ template Google Sheet nào là chuẩn để import.
- Liệt kê các sheet, range, cột bắt buộc và quy tắc mapping vào DTO nội bộ.
- Xác định file nào là bắt buộc đồng nhất template và file nào được phép sai khác.
- Chốt rõ kỳ vọng import theo từng file, theo từng sheet hay theo cả folder.

### Chuẩn bị về Google Workspace và OAuth

- Tạo hoặc xác nhận Google Cloud project dùng cho tích hợp.
- Cấu hình OAuth client cho backend.
- Cấu hình redirect URI phù hợp với môi trường phát triển và production.
- Xin quyền `drive.readonly` và `spreadsheets.readonly`.
- Bật `offline access` nếu cần lưu refresh token để dùng lại.
- Làm việc với IT Admin để xác nhận app có được allowlist hoặc trusted trong domain hay không.

### Chuẩn bị về backend

- Xác định nơi lưu access token và refresh token an toàn.
- Thống nhất cách parse `folderId` và `spreadsheetId` từ link người dùng nhập.
- Chuẩn hóa contract đầu vào cho luồng import từ Google Sheets.
- Xác định cách trả kết quả import theo từng file: thành công, thất bại, lý do lỗi.
- Chốt chiến lược logging, `requestId`, retry và idempotency.

### Chuẩn bị về vận hành

- Kiểm tra quota và rate limit của Drive API và Sheets API.
- Xác định giới hạn số file mỗi batch import.
- Chuẩn bị kịch bản theo dõi lỗi theo từng file và theo từng request import.
- Chốt cách rollout: POC, pilot với dữ liệu thật, rồi mới mở rộng production.

## 8. Các bước triển khai đề xuất

### Giai đoạn 1. POC kỹ thuật

- Xây dựng luồng OAuth để user cấp quyền Google Workspace cho ứng dụng.
- Cho phép nhập link folder hoặc link file Google Drive.
- Gọi Drive API để liệt kê file Google Spreadsheet trong folder.
- Gọi Sheets API để đọc dữ liệu đã được tính sẵn từ một số sheet mẫu.
- Mapping thử dữ liệu sang input structure của backend và so sánh với kết quả import hiện tại.

Mục tiêu của giai đoạn này là xác nhận 3 điểm:

- Đọc được file private bằng đúng account người dùng đã cấp quyền.
- Giá trị đọc được khớp với dữ liệu người dùng nhìn thấy trên Google Sheets.
- Có thể tái sử dụng logic validate và insert hiện tại với mức thay đổi chấp nhận được.

### Giai đoạn 2. Hoàn thiện lớp tích hợp

- Tạo `GoogleAuthService` để xử lý OAuth, token và refresh token.
- Tạo `GoogleDriveFolderReader` để đọc danh sách spreadsheet trong folder.
- Tạo `GoogleSheetReader` để đọc dữ liệu theo sheet và range cần thiết.
- Tạo `GoogleSheetImportMapper` để chuẩn hóa dữ liệu thành DTO nội bộ.
- Tạo `BatchImportCoordinator` để điều phối import nhiều file và gom kết quả.

### Giai đoạn 3. Tích hợp với pipeline import hiện tại

- Tái sử dụng các logic validate, transform và insert đang có ở service hiện tại.
- Bổ sung xử lý lỗi theo từng file thay vì fail toàn bộ batch ngay từ đầu.
- Gắn logging, `requestId` và thông tin file để trace dễ hơn.
- Bổ sung báo cáo kết quả import theo từng file và tổng hợp toàn batch.

### Giai đoạn 4. Kiểm thử và rollout

- Kiểm thử với file ít sheet, file nhiều sheet và file có formula phức tạp.
- Kiểm thử trường hợp folder chứa file sai template.
- Kiểm thử quota, retry và import lại cùng một batch.
- Pilot với một nhóm người dùng nhỏ trước khi mở rộng.

## 9. Rủi ro chính và hướng kiểm soát

| Rủi ro | Mức ảnh hưởng | Khả năng xảy ra | Hướng kiểm soát |
| --- | --- | --- | --- |
| Ứng dụng bị chặn bởi policy Google Workspace hoặc chưa được allowlist | Cao | Trung bình đến cao | Làm việc sớm với IT Admin, xác nhận policy, scope và danh sách app trusted trước khi triển khai sâu |
| Các file trong cùng folder không đồng nhất template | Cao | Cao | Định nghĩa template chuẩn, validate sớm theo từng file, trả lỗi rõ ràng và tách file lỗi khỏi file hợp lệ |
| Quota hoặc rate limit của Drive API và Sheets API ảnh hưởng đến batch import | Trung bình đến cao | Trung bình | Giới hạn số file mỗi batch, phân trang, retry có kiểm soát, logging theo request và theo file |
| Lưu trữ access token và refresh token không đủ an toàn | Cao | Trung bình | Lưu token ở khu vực bảo mật, mã hóa nếu cần, giới hạn truy cập và kiểm soát vòng đời token |
| Mapping dữ liệu từ Google Sheets sang DTO nội bộ không bao phủ hết biến thể template | Cao | Trung bình | Chốt rõ template mẫu, xây mapper theo cấu hình hoặc quy tắc rõ ràng, kiểm thử với nhiều file đại diện |
| Một file lỗi làm ảnh hưởng toàn bộ batch import | Trung bình | Trung bình | Thiết kế cơ chế xử lý theo từng file, không gom cả batch thành một transaction lớn |
| Effort tích hợp tăng do phụ thuộc review bảo mật hoặc phê duyệt nội bộ | Trung bình | Trung bình đến cao | Tách riêng phần phụ thuộc tổ chức ra khỏi effort kỹ thuật, theo dõi bằng checkpoint phê duyệt |

## 10. Ước lượng effort triển khai

Ước lượng dưới đây dành cho phạm vi triển khai backend cho Giải pháp 2, với giả định:

- Có sẵn backend hiện tại để tái sử dụng logic validate, transform và insert.
- Chưa tính effort thay đổi lớn ở frontend nếu cần thêm UI phức tạp cho Google OAuth.
- Chưa tính thời gian chờ IT Admin phê duyệt policy hoặc allowlist ứng dụng.
- Đội triển khai chính gồm 1 backend developer, có hỗ trợ review từ 1 tech lead hoặc senior khi cần.

| Hạng mục | Nội dung chính | Effort ước lượng |
| --- | --- | --- |
| Chuẩn bị và làm rõ yêu cầu | Xác nhận template sheet, contract dữ liệu, luồng OAuth, phạm vi import theo file hoặc folder | 1 đến 2 ngày công |
| POC kỹ thuật | OAuth flow, đọc thử folder hoặc file, đọc values từ Sheets API, mapping thử với dữ liệu mẫu | 3 đến 5 ngày công |
| Xây lớp tích hợp Google | `GoogleAuthService`, `GoogleDriveFolderReader`, `GoogleSheetReader`, xử lý token và parse link | 4 đến 6 ngày công |
| Mapping và tích hợp với pipeline hiện tại | Chuẩn hóa dữ liệu vào DTO, tái sử dụng validate và insert, xử lý lỗi theo file | 4 đến 6 ngày công |
| Logging, retry, báo cáo kết quả | Bổ sung `requestId`, import result theo file, retry chiến lược và idempotency cơ bản | 2 đến 4 ngày công |
| Kiểm thử và pilot | Test với file mẫu, file sai template, file nhiều sheet, kiểm thử batch import | 3 đến 5 ngày công |

### Tổng effort tham chiếu

- Effort kỹ thuật backend dự kiến: khoảng 17 đến 28 ngày công.
- Nếu có sẵn flow OAuth nền tảng hoặc module dùng chung cho Google integration, effort có thể giảm.
- Nếu template sheet thay đổi nhiều giữa các file hoặc cần ghi ngược lại Google Sheet ngay trong phase đầu, effort sẽ tăng.

## 11. Timeline triển khai đề xuất

Timeline dưới đây là mốc tham chiếu để lập kế hoạch thực hiện. Thời gian thực tế phụ thuộc trực tiếp vào việc được phê duyệt OAuth app và độ ổn định của template Google Sheet.

### Phương án timeline 4 đến 5 tuần

| Tuần | Mục tiêu | Kết quả đầu ra |
| --- | --- | --- |
| Tuần 1 | Chuẩn bị và POC | Chốt phạm vi, xác nhận quyền Google Workspace, đọc thử được file hoặc folder mẫu |
| Tuần 2 | Hoàn thiện lớp tích hợp Google | Có OAuth flow, đọc được danh sách spreadsheet và lấy được dữ liệu từ Sheets API |
| Tuần 3 | Mapping và nối với pipeline import hiện tại | Dữ liệu từ Google Sheets đi qua được validate, transform và insert theo luồng nội bộ |
| Tuần 4 | Hoàn thiện vận hành và kiểm thử | Có logging, retry cơ bản, import result theo file, test với các case chính |
| Tuần 5 | Pilot và đánh giá rollout | Chạy thử với user hoặc folder thực tế, thống kê lỗi, quyết định mở rộng production |

### Mốc quyết định quan trọng

- Cuối Tuần 1: quyết định có tiếp tục Giải pháp 2 hay không dựa trên kết quả POC.
- Cuối Tuần 3: quyết định độ sẵn sàng cho pilot dựa trên khả năng tái sử dụng pipeline hiện tại.
- Cuối Tuần 5: quyết định rollout chính thức hoặc cần thêm phase hardening.

## 12. Đề xuất hành động tiếp theo

Thứ tự ưu tiên đề xuất:

1. Xác nhận với IT Admin về OAuth app, scope và policy trong Google Workspace.
2. Chọn 1 folder mẫu và 2 đến 3 file Google Sheet đại diện để làm POC.
3. Thực hiện POC theo Giải pháp 2 để kiểm chứng dữ liệu và effort tích hợp.
4. Nếu POC đạt yêu cầu, triển khai chính thức lớp tích hợp Google Sheets vào backend.
5. Chỉ chuyển sang Giải pháp 3 nếu bị chặn bởi policy hoặc yêu cầu kiến trúc bảo mật nội bộ.

## 13. Tóm tắt kết luận

Ba giải pháp khả thi gồm:

- Export Google Sheet sang XLSX rồi tái sử dụng pipeline `exceljs`.
- Đọc trực tiếp bằng user OAuth, Google Drive API và Google Sheets API.
- Dùng Apps Script hoặc integration service nội bộ làm lớp trung gian.

Trong ba phương án, giải pháp tối ưu và khả thi nhất để triển khai thực tế là **đọc trực tiếp bằng user OAuth kết hợp Drive API và Sheets API**. Hướng này đáp ứng tốt nhất về độ chính xác dữ liệu, khả năng mở rộng và tính bền vững lâu dài, đồng thời vẫn cho phép giữ lại phần lớn business logic hiện tại của backend.
