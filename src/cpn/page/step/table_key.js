import React, { useState } from 'react';
import copy from 'copy-to-clipboard';


function Active_Helpdesk() {
  const [isActivated, setIsActivated] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsActivated(true);
    // TODO: Thêm mã để xử lý thông tin form và tạo mã kích hoạt
  };

  const copyToClipboard = () => {
    const copyText = document.getElementById("activationKey");
    copyText.select();
    document.execCommand("copy");
    alert("Đã sao chép mã kích hoạt!");
  };
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (event) => {
    event.preventDefault();
    copy();

    setIsCopied(true);


    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  function formatPrinterKey(key) {
    return key.match(/.{1,4}/g).join('-');
  }

  const rawKey = "PRTA123B45PRTA123B45";
  const formattedKey = formatPrinterKey(rawKey);

  return (
   
    <div class="col-md-12">
    <div class="table-responsive">

      <>
        <table class="table table  ">
          <thead>
            <tr class="color-tr" style={{ height: "40px" }}>
              <th class="font-weight-bold" style={{ width: "20px" }} scope="col">ID </th>
              <th class="font-weight-bold"  style={{ maxWidth: "350px", minWidth: "200px" }}scope="col">
                <div className="th-container">
                  Tên dòng máy
                  <i className="fa fa-filter icon-view size-18" />
                </div>
              </th>
              <th class="font-weight-bold" style={{ width: "180px" }} scope="col">
                <div className="th-container">
                  Số LOT
                  <i className="fa fa-filter icon-view size-18" />
                </div>
              </th>
              <th class="font-weight-bold" style={{ width: "320px" }} scope="col"><div className="th-container">
                UUID
                <i className="fa fa-filter icon-view size-18" />
              </div>
              </th>
              <th class="font-weight-bold align-center" style={{ maxWidth: "350px", minWidth: "300px" }} scope="col"><div className="th-container">
                Key
              
              </div>
              </th>
              {/* <th class="font-weight-bold align-center" style={{ width: "350px" }} scope="col">Thao tác</th> */}
            </tr>
          </thead>
          <tbody>

            <tr>
              <td>1</td>
              <td>R10</td>
              <td>LOT2023-927A45B7</td>
              <td>f4d4b1f8-8d44-11eb-8dcd-0242ac130003</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <textarea
                    type="text"
                    class="form-control"
                    value={"PRTA-123B-45PR-TA12-3B45"}
                    style={{ height: "32px" }}
                    spellCheck={false}
                  />
                  <i
                    className="fa fa-clipboard ml-3 pointer"

                    style={{ fontSize: '24px' }}
                    title='Copy'
                  ></i>
                </div>

                {isCopied &&
                  <div className="copy-alert" style={{
                    animation: 'fadeInOut 3s ease-out',
                    position: 'absolute',
                    top: '1%',
                    left: '40%',
                    transform: 'translate(10px, -50%)',
                    zIndex: 1
                  }}>
                    <i className='fa fa-check-circle mr-1 mt-1'></i>
                  </div>
                }
              </td>


            </tr>
            <tr>
              <td>2</td>
              <td>R10</td>
              <td>LOT2023-927A45B7</td>
              <td>f4d4b1f8-8d44-11eb-8dcd-0242ac130003</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <textarea
                    type="text"
                    class="form-control"
                    value={"PRTA-123B-45PR-TA12-3B45"}
                    style={{ height: "32px" }}
                    spellCheck={false}
                  />
                  <i
                    className="fa fa-clipboard ml-3 pointer"

                    style={{ fontSize: '24px' }}
                    title='Copy'
                  ></i>
                </div>

                {isCopied &&
                  <div className="copy-alert" style={{
                    animation: 'fadeInOut 3s ease-out',
                    position: 'absolute',
                    top: '1%',
                    left: '40%',
                    transform: 'translate(10px, -50%)',
                    zIndex: 1
                  }}>
                    <i className='fa fa-check-circle mr-1 mt-1'></i>
                  </div>
                }
              </td>


            </tr>
            <tr>
              <td>3</td>
              <td>R10</td>
              <td>LOT2023-927A45B7</td>
              <td>f4d4b1f8-8d44-11eb-8dcd-0242ac130003</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <textarea
                    type="text"
                    class="form-control"
                    value={"PRTA-123B-45PR-TA12-3B45"}
                    style={{ height: "32px" }}
                    spellCheck={false}
                  />
                  <i
                    className="fa fa-clipboard ml-3 pointer"

                    style={{ fontSize: '24px' }}
                    title='Copy'
                  ></i>
                </div>

                {isCopied &&
                  <div className="copy-alert" style={{
                    animation: 'fadeInOut 3s ease-out',
                    position: 'absolute',
                    top: '1%',
                    left: '40%',
                    transform: 'translate(10px, -50%)',
                    zIndex: 1
                  }}>
                    <i className='fa fa-check-circle mr-1 mt-1'></i>
                  </div>
                }
              </td>


            </tr>
            <tr>
              <td>4</td>
              <td>R10</td>
              <td>LOT2023-927A45B7</td>
              <td>f4d4b1f8-8d44-11eb-8dcd-0242ac130003</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <textarea
                    type="text"
                    class="form-control"
                    value={"PRTA-123B-45PR-TA12-3B45"}
                    style={{ height: "32px" }}
                    spellCheck={false}
                  />
                  <i
                    className="fa fa-clipboard ml-3 pointer"

                    style={{ fontSize: '24px' }}
                    title='Copy'
                  ></i>
                </div>

                {isCopied &&
                  <div className="copy-alert" style={{
                    animation: 'fadeInOut 3s ease-out',
                    position: 'absolute',
                    top: '1%',
                    left: '40%',
                    transform: 'translate(10px, -50%)',
                    zIndex: 1
                  }}>
                    <i className='fa fa-check-circle mr-1 mt-1'></i>
                  </div>
                }
              </td>


            </tr>
            <tr>
              <td>5</td>
              <td>R10</td>
              <td>LOT2023-927A45B7</td>
              <td>f4d4b1f8-8d44-11eb-8dcd-0242ac130003</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <textarea
                    type="text"
                    class="form-control"
                    value={"PRTA-123B-45PR-TA12-3B45"}
                    style={{ height: "32px" }}
                    spellCheck={false}
                  />
                  <i
                    className="fa fa-clipboard ml-3 pointer"

                    style={{ fontSize: '24px' }}
                    title='Copy'
                  ></i>
                </div>

                {isCopied &&
                  <div className="copy-alert" style={{
                    animation: 'fadeInOut 3s ease-out',
                    position: 'absolute',
                    top: '1%',
                    left: '40%',
                    transform: 'translate(10px, -50%)',
                    zIndex: 1
                  }}>
                    <i className='fa fa-check-circle mr-1 mt-1'></i>
                  </div>
                }
              </td>


            </tr>
            <tr>
              <td style={{height: "200px"}}></td>
            </tr>

          </tbody>
        </table>
      </>

    </div>
    <div className="d-flex justify-content-between align-items-center mt-2">
      <p>
        Hiển thị 1-5 của 5 kết quả
      </p>
      <nav aria-label="Page navigation example">
        <ul className="pagination mb-0">
          {/* Nút đến trang đầu */}
          <li className={`page-item 'disabled' : ''}`}>
            <button className="page-link" >
              &#8810;
            </button>
          </li>
          <li className={`page-item 'disabled' : ''`}>
            <button className="page-link" >
              &laquo;
            </button>
          </li>
          <li cclassName={`page-item active`}>
            <button className="page-link active" >
              1
            </button>
          </li>
          <li className={`page-item `}>
            <button className="page-link" >
              &raquo;
            </button>
          </li>
          {/* Nút đến trang cuối */}
          <li className={`page-item `}>
            <button className="page-link" >
              &#8811;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  );
}

export default Active_Helpdesk;
