import React, { useState } from 'react';


function Active_Helpdesk() {
  const [isActivated, setIsActivated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);


  const handleNextStep = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(3);
  };


  function formatPrinterKey(key) {
    return key.match(/.{1,4}/g).join('-');
  }

  const rawKey = "PRTA123B45PRTA123B45";
  const formattedKey = formatPrinterKey(rawKey);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmitFile = (event) => {
    event.preventDefault();
    // Xử lý dữ liệu của bạn ở đây, bao gồm việc xử lý tệp được chọn
    console.log(selectedFile);
  }

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  }
  return (


    <div className="container justify-content-center mt-3">

      <div className="step-indicator mlr-5">
        <ul className="step-list">
          <li className={`step-item ${currentStep === 1 ? "step-active" : ""} step-arrow-right`}>
            <a className="step-link">Step 1: Thông Tin Máy In</a>
          </li>
          <li className={`step-item ${currentStep === 2 ? "step-active" : ""} step-arrow-both`}>
            <a className="step-link">Step 2: [Tên bước mới]</a>
          </li>
          <li className={`step-item ${currentStep === 3 ? "step-active" : ""} step-arrow-left-flat-right`}>
            <a className="step-link">Step 3: Kết Quả Kích Hoạt</a>
          </li>

        </ul>
      </div>
      {currentStep === 1 && (
        <div class="row justify-content-center mt-5">

          <div class="col-md-12 p-20">
            <div id="step1">
              {/* <h2 class="align-center mb-4">Thông Tin Kích Hoạt License Máy In</h2> */}
              <form onSubmit={handleSubmit}>

               
                  <div className="form-group">
                    <label htmlFor="fileInput">Chọn tệp</label>
                    <input
                      type="file"
                      className="form-control"
                      id="fileInput"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* {selectedFile && (
                    <div>
                      <h2>Tệp đã chọn:</h2>
                      <p>Tên tệp: {selectedFile.name}</p>
                      <p>Kích thước: {selectedFile.size} bytes</p>
                      <p>Loại tệp: {selectedFile.type}</p>
                    </div>
                  )} */}
                
                <div class="form-group">
                  <label for="serialNumber">Số LOT</label>
                  <input type="text" class="form-control" id="serialNumber" placeholder="Nhập số LOT" />
                </div>

                <div class="button-group">
                  <button type="submit" onClick={handleNextStep} className="btn btn-primary">Kích hoạt</button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div>
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


                </div>
              </div>
            </div>
          </div>
          <div className="button-group">
            <button style={{ width: "100px" }} className="btn btn-primary mr-2" >Sao chép</button>
            <button type="submit" onClick={handleSubmit} className="btn btn-primary">Kích hoạt</button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <></>
      )}
    </div>





  );
}

export default Active_Helpdesk;
