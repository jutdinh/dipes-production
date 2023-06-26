const responseMessages = {
    "0x4501000": {
        "type": "Informations",
        "description": "Thành công"
    },
    "0x4501001": {
        "type": "Error",
        "description": "Bạn không có quyền truy cập api này"
    },
    "0x4501002": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501003": {
        "type": "Informations",
        "description": "Thành công"
    },
    "0x4501004": {
        "type": "Error",
        "description": "Không tìm thấy người dùng"
    },
    "0x4501005": {
        "type": "Error",
        "description": "Không có quyền truy cập API"
    },
    "0x4501006": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501007": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501008": {
        "type": "Error",
        "description": "Tài khoản đã tồn tại"
    },
    "0x4501009": {
        "type": "Error",
        "description": "Không có quyền truy cập API"
    },
    "0x4501010": {
        "type": "Error",
        "description": "Một vài trường dữ liệu bị bỏ trống hoặc không đúng quy cách"
    },
    "0x4501011": {
        "type": "Informations",
        "description": "Tạo tài khoản thành công"
    },
    "0x4501012": {
        "type": "Error",
        "description": "Không tìm thấy thuộc tính account trong req.body hoặc account mang giá trị undefined"
    },
    "0x4501013": {
        "type": "Error",
        "description": "Người dùng không tồn tại hoặc đã bị xóa"
    },
    "0x4501014": {
        "type": "Error",
        "description": "Bạn không thể xóa người dùng có quyền hạn lớn hơn hoặc bằng mình"
    },
    "0x4501015": {
        "type": "Informations",
        "description": "Xóa người dùng thành công"
    },
    "0x4501016": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501017": {
        "type": "Informations",
        "description": "Cập nhật thông tin người dùng thành công"
    },
    "0x4501018": {
        "type": "Error",
        "description": "Bạn không thể cập nhật một quyền mới lớn hơn hoặc bằng bản thân"
    },
    "0x4501019": {
        "type": "Error",
        "description": "Bạn không thể cập nhật người dùng có quyền lớn hơn mình"
    },
    "0x4501020": {
        "type": "Error",
        "description": "Bạn không có quyền truy cập api này"
    },
    "0x4501021": {
        "type": "Error",
        "description": "Tài khoản của bạn đã bị xóa"
    },
    "0x4501022": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501023": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501024": {
        "type": "Informations",
        "description": "Cập nhật thông tin người dùng thành công"
    },
    "0x4501025": {
        "type": "Error",
        "description": "Không thể cập nhật thông tin người dùng khác bằng API này"
    },
    "0x4501026": {
        "type": "Error",
        "description": "Tài khoản bị xóa hoặc không tồn tại"
    },
    "0x4501027": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501028": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501029": {
        "type": "Informations",
        "description": "Cập nhật ảnh đại diện thành công"
    },
    "0x4501030": {
        "type": "Error",
        "description": "Tệp lỗi"
    },
    "0x4501031": {
        "type": "Error",
        "description": "Không có quyền thực hiện thao tác này"
    },
    "0x4501032": {
        "type": "Error",
        "description": "Tài khoản không tồn tại hoặc bị xóa"
    },
    "0x4501033": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501034": {
        "type": "Error",
        "description": "Bạn không có quyền truy cập api này"
    },
    "0x4501035": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501036": {
        "type": "Informations",
        "description": "Cập nhật ảnh đại diện thành công"
    },
    "0x4501037": {
        "type": "Error",
        "description": "Người dùng không tồn tại hoặc đã bị xóa"
    },
    "0x4501038": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501039": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501040": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501041": {
        "type": "Informations",
        "description": "-"
    },
    "0x4501042": {
        "type": "Informations",
        "description": "Không tìm thấy dự án nào cả"
    },
    "0x4501043": {
        "type": "Error",
        "description": "Bạn không có quyền truy cập api này"
    },
    "0x4501044": {
        "type": "Error",
        "description": "Tài khoản của bạn đã bị xóa"
    },
    "0x4501045": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501046": {
        "type": "Informations",
        "description": "-"
    },
    "0x4501047": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501048": {
        "type": "Informations",
        "description": "-"
    },
    "0x4501049": {
        "type": "Error",
        "description": "Không tìm thấy dự án"
    },
    "0x4501050": {
        "type": "Error",
        "description": "Mã dự án không hợp lệ"
    },
    "0x4501051": {
        "type": "Error",
        "description": "Bạn không có quyền truy cập api này"
    },
    "0x4501052": {
        "type": "Error",
        "description": "Tài khoản của bạn đã bị xóa"
    },
    "0x4501053": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501054": {
        "type": "Informations",
        "description": "Tạo dự án thành công"
    },
    "0x4501055": {
        "type": "Informations",
        "description": "Tạo dự án vào thêm người quản lý thành công"
    },
    "0x4501056": {
        "type": "Error",
        "description": "Người dùng được chỉ định không có quyền làm quản lý dự án"
    },
    "0x4501057": {
        "type": "Error",
        "description": "Người quản lý dự án không tồn tại"
    },
    "0x4501058": {
        "type": "Error",
        "description": "Tài khoản của bạn đã bị xóa"
    },
    "0x4501059": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501060": {
        "type": "Error",
        "description": "Bạn không có quyền truy cập api này"
    },
    "0x4501061": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501062": {
        "type": "Informations",
        "description": "Thêm thành công"
    },
    "0x4501063": {
        "type": "Warning",
        "description": "Một vài người dùng không được thêm vào dự án vì họ không tồn tại, không khả dụng hoặc đã có mặt trong dự án từ trước"
    },
    "0x4501064": {
        "type": "Error",
        "description": "Không ai được thêm vào dự án vì họ không tồn tại, không khả dụng hoặc đã có mặt trong dự án từ trước"
    },
    "0x4501065": {
        "type": "Error",
        "description": "Bạn không có quyền thực hiện thao tác này"
    },
    "0x4501066": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501067": {
        "type": "Error",
        "description": "Mã dự án không hợp lệ"
    },
    "0x4501068": {
        "type": "Error",
        "description": "Tài khoản của bạn đã bị xóa"
    },
    "0x4501069": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501070": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501071": {
        "type": "Informations",
        "description": "Cập nhật dự án thành công"
    },
    "0x4501072": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501073": {
        "type": "Error",
        "description": "Mã dự án không hợp lệ"
    },
    "0x4501074": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501075": {
        "type": "Error",
        "description": "Tài khoản của bạn đã bị xóa"
    },
    "0x4501076": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501077": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501078": {
        "type": "Error",
        "description": "Bạn không có quyền truy cập api này"
    },
    "0x4501079": {
        "type": "Informations",
        "description": "Xóa dự án thành công"
    },
    "0x4501080": {
        "type": "Warning",
        "description": "Dự án không tồn tại"
    },
    "0x4501081": {
        "type": "Error",
        "description": "Mã dự án không hợp lệ"
    },
    "0x4501082": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501083": {
        "type": "Error",
        "description": "Tài khoản của bạn đã bị xóa"
    },
    "0x4501084": {
        "type": "Error",
        "description": "Bạn không có quyền truy cập api này"
    },
    "0x4501085": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501086": {
        "type": "Informations",
        "description": "Thay đổi người quản lý thành công"
    },
    "0x4501087": {
        "type": "Error",
        "description": "Người quản lý mới được chỉ định không tồn tại hoặc đã bị xóa"
    },
    "0x4501088": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501089": {
        "type": "Error",
        "description": "Mã dự án không hợp lệ"
    },
    "0x4501090": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501091": {
        "type": "Error",
        "description": "Tài khoản của bạn đã bị xóa"
    },
    "0x4501092": {
        "type": "Error",
        "description": "Bạn không có quyền truy cập api này"
    },
    "0x4501093": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501094": {
        "type": "Informations",
        "description": "Thay đổi thành công"
    },
    "0x4501095": {
        "type": "Error",
        "description": "Quyền mới phải nhỏ hơn quyền của người thực hiện thao tác"
    },
    "0x4501096": {
        "type": "Error",
        "description": "Không thể thay đổi quyền của người có quyền lớn hơn người thực hiện"
    },
    "0x4501097": {
        "type": "Error",
        "description": "Tài khoản chỉ định không thuộc dự án"
    },
    "0x4501098": {
        "type": "Error",
        "description": "Tài khoản chỉ định không tồn tại hoặc bị xóa"
    },
    "0x4501099": {
        "type": "Error",
        "description": "Không có quyền thực hiện thao tác này"
    },
    "0x4501100": {
        "type": "Error",
        "description": "Bạn không tồn tại trong dự án hoặc không có quyền"
    },
    "0x4501101": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501102": {
        "type": "Error",
        "description": "Mã dự án không hợp lệ"
    },
    "0x4501103": {
        "type": "Error",
        "description": "Bạn không thể thay đổi quyền của chính mình"
    },
    "0x4501104": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501105": {
        "type": "Error",
        "description": "Tài khoản của bạn đã bị xóa"
    },
    "0x4501106": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501107": {
        "type": "Informations",
        "description": "Xóa thành công"
    },
    "0x4501108": {
        "type": "Error",
        "description": "Bạn không thể xóa người dùng có quyền hạn lớn hơn hoặc bằng mình"
    },
    "0x4501109": {
        "type": "Error",
        "description": "Bạn không có quyền thực hiện thao tác này"
    },
    "0x4501110": {
        "type": "Error",
        "description": "Bạn không tồn tại trong dự án hoặc không có quyền"
    },
    "0x4501111": {
        "type": "Error",
        "description": "Mã dự án không hợp lệ"
    },
    "0x4501112": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501113": {
        "type": "Error",
        "description": "Tài khoản của bạn đã bị xóa"
    },
    "0x4501114": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501115": {
        "type": "Informations",
        "description": "Gọi dữ liệu thành công"
    },
    "0x4501116": {
        "type": "Error",
        "description": "Bạn không tồn tại trong dự án hoặc không có quyền"
    },
    "0x4501117": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501118": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501119": {
        "type": "Informations",
        "description": "Tạo yêu cầu thành công"
    },
    "0x4501120": {
        "type": "Informations",
        "description": "Tạo yêu cầu thành công nhưng không có ai được thêm vào yêu cầu vì họ không thuộc dự án hoặc không còn khả dụng nữa"
    },
    "0x4501121": {
        "type": "Informations",
        "description": "Tạo yêu cầu thành cồng nhưng một vài thành viên không được thêm vào vì họ không thuộc dự án hoặc không còn khả dụng nữa"
    },
    "0x4501122": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501123": {
        "type": "Error",
        "description": "Bạn không tồn tại trong dự án hoặc không có quyền"
    },
    "0x4501124": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501125": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501126": {
        "type": "Informations",
        "description": "Cập nhật trạng thái yêu cầu thành công"
    },
    "0x4501127": {
        "type": "Error",
        "description": "Trạng thái không hợp lệ"
    },
    "0x4501128": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501129": {
        "type": "Error",
        "description": "Yêu cầu không tồn tại"
    },
    "0x4501130": {
        "type": "Error",
        "description": "Bạn không tồn tại trong dự án hoặc không có quyền"
    },
    "0x4501131": {
        "type": "Error",
        "description": "Không tìm thấy dự án hoặc mã dự án không hợp lệ"
    },
    "0x4501132": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501133": {
        "type": "Informations",
        "description": "Cập nhật thông tin yêu cầu thành công"
    },
    "0x4501134": {
        "type": "Error",
        "description": "Độ ưu tiên không hợp lệ"
    },
    "0x4501135": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501136": {
        "type": "Error",
        "description": "Yêu cầu không tồn tại"
    },
    "0x4501137": {
        "type": "Error",
        "description": "Bạn không tồn tại trong dự án hoặc không có quyền"
    },
    "0x4501138": {
        "type": "Error",
        "description": "Không tìm thấy dự án hoặc mã dự án không hợp lệ"
    },
    "0x4501139": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501140": {
        "type": "Informations",
        "description": "Thêm thành viên thành công"
    },
    "0x4501141": {
        "type": "Informations",
        "description": "Một vài thành viên không được thêm vào vì không có quyền hoặc không khả dụng"
    },
    "0x4501142": {
        "type": "Error",
        "description": "Không một ai được thêm vào yêu cầu vì không có quyền hoặc không khả dụng"
    },
    "0x4501143": {
        "type": "Error",
        "description": "Yêu cầu không tồn tại"
    },
    "0x4501144": {
        "type": "Error",
        "description": "Bạn không tồn tại trong dự án hoặc không có quyền"
    },
    "0x4501145": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501146": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501147": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501148": {
        "type": "Informations",
        "description": "Xóa thành công"
    },
    "0x4501149": {
        "type": "Warning",
        "description": "Người dùng này không phải là thành viên của yêu cầu"
    },
    "0x4501150": {
        "type": "Error",
        "description": "Yêu cầu không tồn tại"
    },
    "0x4501151": {
        "type": "Error",
        "description": "Bạn không tồn tại trong dự án hoặc không có quyền"
    },
    "0x4501152": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501153": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501154": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501155": {
        "type": "Informations",
        "description": "Cập nhật thành công"
    },
    "0x4501156": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501157": {
        "type": "Error",
        "description": "Yêu cầu không tồn tại"
    },
    "0x4501158": {
        "type": "Error",
        "description": "Bạn không tồn tại trong dự án hoặc không có quyền"
    },
    "0x4501159": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501160": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501161": {
        "type": "Informations",
        "description": "Xóa yêu cầu thành công"
    },
    "0x4501162": {
        "type": "Error",
        "description": "Bạn không có quyền thực hiện thao tác này"
    },
    "0x4501163": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501164": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501165": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501166": {
        "type": "Informations",
        "description": "Thành công"
    },
    "0x4501167": {
        "type": "Error",
        "description": "Không tìm thấy dự án"
    },
    "0x4501168": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501169": {
        "type": "Error",
        "description": "Tài khoản của bạn đã bị xóa"
    },
    "0x4501170": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501171": {
        "type": "Informations",
        "description": "Thành công"
    },
    "0x4501172": {
        "type": "Error",
        "description": "Bạn không tồn tại trong dự án hoặc không có quyền"
    },
    "0x4501173": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501174": {
        "type": "Error",
        "description": "Tài khoản của bạn đã bị xóa"
    },
    "0x4501175": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501176": {
        "type": "Informations",
        "description": "Cập nhật thông tin phiên bản thành công"
    },
    "0x4501177": {
        "type": "Error",
        "description": "Phiên bản không tồn tại"
    },
    "0x4501178": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501179": {
        "type": "Error",
        "description": "Bạn không có quyền truy cập api này"
    },
    "0x4501180": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501181": {
        "type": "Error",
        "description": "Tài khoản của bạn đã bị xóa"
    },
    "0x4501182": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501183": {
        "type": "Informations",
        "description": "Thành công"
    },
    "0x4501184": {
        "type": "Error",
        "description": "Không có quyền thực hiện thao tác này"
    },
    "0x4501185": {
        "type": "Error",
        "description": "Bạn không tồn tại trong dự án hoặc không có quyền"
    },
    "0x4501186": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501187": {
        "type": "Error",
        "description": "Phiên bản không tồn tại"
    },
    "0x4501188": {
        "type": "Error",
        "description": "Bảng không tồn tại"
    },
    "0x4501189": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501190": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501191": {
        "type": "Informations",
        "description": "Tạo bảng thành công"
    },
    "0x4501192": {
        "type": "Error",
        "description": "Không có quyền thực hiện thao tác này"
    },
    "0x4501193": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501194": {
        "type": "Error",
        "description": "Phiên bản không tồn tại"
    },
    "0x4501195": {
        "type": "Error",
        "description": "Tham số không hợp lệ hoặc sai quy cách"
    },
    "0x4501196": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501197": {
        "type": "Informations",
        "description": "Lấy dữ liệu thành công"
    },
    "0x4501198": {
        "type": "Error",
        "description": "Bạn không có quyền truy cập api này"
    },
    "0x4501199": {
        "type": "Error",
        "description": "Dự án không tồn tại"
    },
    "0x4501200": {
        "type": "Error",
        "description": "Phiên bản không tồn tại"
    },
    "0x4501201": {
        "type": "Error",
        "description": "Token không hợp lệ"
    },
    "0x4501202": {
        "type": "Informations",
        "description": "Cập nhật bảng thành công"
    },
    "0x4501203": {
        "type": "Informations",
        "description": "Xóa bảng thành công"
    },
    "0x4501204": {
        "type": "Error",
        "description": "Không có quyền thay đổi vì bạn không thuộc nhóm thực hiện yêu cầu"
    }
  };
  
  export default responseMessages;
  