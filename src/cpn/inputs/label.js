// import { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';

// export default (props) => {

//     const { field, changeTrigger, related, table, defaultValue, selectOption } = props;
//     const [current, setCurrent] = useState('')

// // console.log(field)

//     useEffect(() => {
//         setCurrent(defaultValue)
//     }, [defaultValue])
//     return (
//         <div class="row justify-content-center">
//             <div class="form-group col-md-6">
//                 <form>
//                     <div class="form-group">
//                         <label className='font-weight-bold' for="name">{field.field_name}:</label> <br></br>
//                         <p>{current}</p>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     )
// }

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default (props) => {
  const { lang, proxy, auth, pages, functions, socket } = useSelector(
    (state) => state
  );
  const { field, changeTrigger, related, table, defaultValue, selectOption } =
    props;
  const [current, setCurrent] = useState("");
  console.log(current);
  console.log(props);

  useEffect(() => {
    setCurrent(defaultValue);
  }, [defaultValue]);

  const handleDownload = (url) => {
    // // URL cơ bản của dịch vụ xem tập tin Office trực tuyến
    // const baseUrl = "https://view.officeapps.live.com/op/view.aspx?src=";
    // const encodedUrl = encodeURIComponent(url); // Mã hóa URL của tập tin
    // const fullUrl = `${baseUrl}${encodedUrl}`;

    window.open(proxy() + url, "_blank");
  };

  function renderFiles(current) {
    // Nếu `current` là một mảng, render một danh sách hình ảnh
    if (Array.isArray(current)) {
      return current.map((file, index) => {
        // Kiểm tra nếu file là định dạng tài liệu
        if (functions.isExcelDocumentFormat(file)) {
          // Nếu đúng, render hình ảnh
          return (
            <div
              className="image-container"
              key={index}
              onClick={() => handleDownload(file)}
              title={`${file.split("/")[2]}`}
            >
              <img
                src={"/images/icon/excel.svg"}
                className="selected-image-add"
                alt={`file-${index}`}
              />
              <div className="download-icon"></div>
            </div>
          );
        } else if (functions.isPdfDocumentFormat(file)) {
          return (
            <div
              className="image-container"
              key={index}
              onClick={() => handleDownload(file)}
              title={`${file.split("/")[2]}`}
            >
              <img
                key={index}
                src={"/images/icon/pdf.svg"}
                className="selected-image-add pointer"
                alt={`file-${index}`}
                style={{ maxWidth: "100%", height: "auto", padding: "4px" }}
                onClick={() => handleDownload(file)}
              />
              <div className="download-icon"></div>
            </div>
          );
        } else if (functions.isDocDocumentFormat(file)) {
          return (
            <div
              className="image-container"
              key={index}
              onClick={() => handleDownload(file)}
              title={`${file.split("/")[2]}`}
            >
              <img
                key={index}
                src={"/images/icon/docs.svg"}
                className="selected-image-add pointer"
                alt={`file-${index}`}
                style={{ maxWidth: "100%", height: "auto", padding: "4px" }}
                onClick={() => handleDownload(file)}
              />
              <div className="download-icon"></div>
            </div>
          );
        } else if (functions.isZipDocumentFormat(file)) {
          return (
            <div
              className="image-container"
              key={index}
              onClick={() => handleDownload(file)}
              title={`${file.split("/")[2]}`}
            >
              <img
                key={index}
                src={"/images/icon/zip.svg"}
                className="selected-image-add pointer"
                alt={`file-${index}`}
                style={{ maxWidth: "100%", height: "auto", padding: "4px" }}
                onClick={() => handleDownload(file)}
              />
              <div className="download-icon"></div>
            </div>
          );
        } else {
          return (
            <img
              key={index}
              src={proxy() + file}
              className="selected-image-add pointer"
              alt={`file-${index}`}
              style={{ maxWidth: "100%", height: "auto", padding: "4px" }}
              title={`${file.split("/")[2]}`}
            />
          );
        }
        // Nếu không, không render gì (hoặc bạn có thể quyết định render một phần tử khác)
        return null;
      });
    }

    // Nếu `current` là một chuỗi và không phải là giá trị placeholder như "FILE-0001"
    else if (typeof current === "string") {
      return (
        <img
          src={current}
          alt="file"
          className="selected-image-add pointer"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      );
    }
    // Nếu không có file hợp lệ để hiển thị
    return <p>No file available</p>;
  }

  return (
    <div class="row justify-content-center">
      <div class="form-group col-md-12">
        <form>
          <div class="form-group">
            <label className="font-weight-bold" for="name">
              {field.field_name}:
            </label>
            <br></br>
            {/* <p>{current}</p> */}
            <p>
              {field.DATATYPE === "DATE" || field.DATATYPE === "DATETIME"
                ? functions.renderDateTimeByFormat(defaultValue, field.FORMAT)
                : field.DATATYPE === "BOOL"
                ? defaultValue
                  ? field.DEFAULT_TRUE
                  : field.DEFAULT_FALSE
                : field.DATATYPE === "FILE"
                ? renderFiles(current)
                : current}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
