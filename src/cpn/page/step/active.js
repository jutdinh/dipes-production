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
    <div class="midde_cont">
      <div class="container-fluid">
        <div class="row column_title">
          <div class="col-md-12">
            <div class="page_title d-flex align-items-center">
              <h4 class="ml-1">Kích hoạt khóa</h4>
            </div>
          </div>
        </div>
        <div class="row column1">
          <div class="col-md-12">
            <div class="white_shd full margin_bottom_30">
              <div class="full price_table padding_infor_info">

                <div className="container justify-content-center mt-3">


                  <div className="step-indicator">
                    <ul className="step-list">
                      <li className={`step-item ${!isActivated ? "step-active" : ""} step-arrow-right`}>
                        <a className="step-link">Step 1: Thông Tin Máy In</a>
                      </li>
                      <li className={`step-item ${isActivated ? "step-active" : ""} step-arrow-both`}>
                        <a className="step-link">Step 2: Kết Quả Kích Hoạt</a>
                      </li>
                    </ul>
                  </div>




                  {!isActivated ? (
                    <div class="row justify-content-center mt-5">

                      <div class="col-md-12 p-20">
                        <div id="step1">
                          {/* <h2 class="align-center mb-4">Thông Tin Kích Hoạt License Máy In</h2> */}
                          <form onSubmit={handleSubmit}>
                            <div class="form-group">
                              <label for="printerName">Tên dòng máy</label>
                              <select className="form-control" value={""} >
                                <option value="">R10</option>
                                <option value="">R20</option>
                              </select>

                            </div>
                            <div class="form-group">
                              <label for="printerModel">UUID</label>
                              {/* <input type="text" value={"f4d4b1f8-8d44-11eb-8dcd-0242ac130003"} readOnly class="form-control" id="printerModel" placeholder="" /> */}

                              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={"f4d4b1f8-8d44-11eb-8dcd-0242ac130003"}
                                  // readOnly
                                  style={{ flex: 1 }}
                                />
                                <i
                                  className="fa fa-clipboard ml-3 pointer"
                                  onClick={handleCopy}
                                  style={{ fontSize: '24px' }}
                                  title='Copy'
                                ></i>

                                {isCopied &&
                                  <div className="copy-alert mt-1" style={{
                                    animation: 'fadeInOut 4s ease-out',
                                    position: 'absolute',
                                    top: '10%',
                                    left: '40%',
                                    transform: 'translate(10px, -50%)',
                                    zIndex: 1
                                  }}>
                                    <i className='fa fa-check-circle mr-1 mt-1'></i>Copied
                                  </div>
                                }
                              </div>
                            </div>
                            <div class="form-group">
                              <label for="serialNumber">Số LOT</label>
                              <input type="text" class="form-control" id="serialNumber" placeholder="Nhập số LOT" />
                            </div>
                            <div class="button-group">
                              <button type="submit" className="btn btn-primary">Kích hoạt</button>
                            </div>

                          </form>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div id="step2">
                      {/* <h2 class="align-center mb-4">Kết Quả Kích Hoạt</h2> */}


                      <div class="row mt-5">
                        <div class="col-md-6">
                          <div class="form-group col-lg-12">
                            <label class="mr-2">Dòng máy:</label>
                            <span class="font-weight-bold ">R10</span>
                          </div>
                          <div class="form-group col-lg-12">
                            <label class="mr-2">UUID:</label>
                            <span class="font-weight-bold">f4d4b1f8-8d44-11eb-8dcd-0242ac130003</span>
                          </div>
                          <div class="form-group col-lg-12">
                            <label class="mr-2">Số LOT:</label>
                            <span class="font-weight-bold">LOT2023-927A45B7</span>
                          </div>
                          <div class="form-group col-lg-12">
                            <label class="mr-2">Người kích hoạt:</label>
                            <span class="font-weight-bold">user@gmail.com</span>
                          </div>
                        </div>
                        <div class="col-md-6 center-image">
                          {/* <img src="/images/helpdesk/r10.png" width={448}></img> */}
                          <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
                            <ol class="carousel-indicators">
                              <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
                              <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
                              <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
                            </ol>
                            <div class="carousel-inner">
                              <div class="carousel-item active">
                                <img class="d-block w-100" src="/images/helpdesk/r10.png" alt="First slide" />
                              </div>
                              <div class="carousel-item">
                                <img class="d-block w-100" src="/images/helpdesk/r10.png" alt="Second slide" />
                              </div>
                              <div class="carousel-item">
                                <img class="d-block w-100" src="/images/helpdesk/r10.png" alt="Third slide" />
                              </div>
                            </div>
                            <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
                              <i class="fa fa-chevron-left fa-2x color-black"></i>
                            </a>
                            <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
                              <i class="fa fa-chevron-right fa-2x color-black"></i>
                            </a>

                          </div>
                        </div>

                      </div>
                      <div class="row">
                        <div class="col-md-12 pl-10">
                          <div class="form-group col-lg-12">
                            <label htmlFor="activationKey" class="no-select">Mã kích hoạt (Key):</label>
                            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                              <input
                                type="text"
                                className="form-control"
                                value={formattedKey}
                                readOnly
                                style={{ flex: 1 }}
                              />
                              {/* <i
                            className="fa fa-clipboard ml-3 pointer"
                            onClick={handleCopy}
                            style={{ fontSize: '24px' }}
                            title='Copy'
                          ></i> */}

                              {isCopied &&
                                <div className="copy-alert mt-1" style={{
                                  animation: 'fadeInOut 4s ease-out',
                                  position: 'absolute',
                                  top: '10%',
                                  left: '40%',
                                  transform: 'translate(10px, -50%)',
                                  zIndex: 1
                                }}>
                                  <i className='fa fa-check-circle mr-1 mt-1'></i>Copied
                                </div>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="button-group">
                        <button style={{ width: "100px" }} className="btn btn-primary mr-2" onClick={handleCopy}>Sao chép</button>
                        <button style={{ width: "100px" }} className="btn btn-info">Xuất ra file</button>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div >

  );
}

export default Active_Helpdesk;
