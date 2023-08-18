import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import copy from 'copy-to-clipboard';

function ActivationForm() {
  const { lang, proxy, auth, functions } = useSelector(state => state);

  const [key, setKey] = useState({ MAC: "", activated: true });
  const _token = localStorage.getItem("_token");

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (event) => {
    event.preventDefault();
    copy(key.MAC);

    setIsCopied(true);


    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  useEffect(() => {
    fetch(`${proxy()}/auth/activation/machine_id`, {
      headers: {
        Authorization: _token
      }
    }).then(res => res.json()).then(res => {
      const { success, machineId, activation_key } = res
      let MAC = "UNKNOWN MAC ADDRESS"
      let activated
      if (success) {
        MAC = machineId
      }
      if (activation_key == undefined) {
        activated = false
      }
      setKey({ ...key, MAC, activation_key, activated })
    })
  }, [])

  const submitKey = () => {
    fetch(`${proxy()}/auth/activate/key`, {
      method: "POST",
      headers: {
        Authorization: _token,
        "content-type": "application/json"
      },
      body: JSON.stringify({ key: key.activation_key })
    }).then(res => res.json()).then(res => {
      const { status } = res;
      // console.log(status)
      functions.showApiResponseMessage(status)
    })
  }

  return (
    <div class="midde_cont">
      <div class="container-fluid">
        <div class="row column_title">
          <div class="col-md-12">
            <div class="page_title">
              <h4 class="ml-1">{lang["activation"]}</h4>
            </div>
          </div>
        </div>
        <div class="row margin_top_30">
          <div class="col-md-2"></div>
          <div class="col-md-8">
            <div class="white_shd full ">
              <div class="full graph_head">
                <div class="heading1 margin_0">
                  <h5><a></a> {lang["activation"]}</h5>
                </div>
              </div>

              <div class="full price_table padding_infor_info" style={{ display: 'flex', flexDirection: 'column', minHeight: '40vh' }}>
                <form>
                  <div class="row" style={{ marginBottom: 'auto' }}>
                    <div className="form-group col-lg-12">
                      <label>{lang["MAC"]}</label>
                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <input
                          type="text"
                          className="form-control"
                          value={key.MAC}
                          readOnly
                          style={{ flex: 1 }}
                        />
                        <i
                          className="fa fa-clipboard ml-3 pointer"
                          onClick={handleCopy}
                          style={{ fontSize: '24px' }}
                          title='Copy'
                        ></i>

                        {isCopied &&
                          <div className="copy-alert" style={{
                            animation: 'fadeInOut 3s ease-out',
                            position: 'absolute',
                            top: '100%',
                            left: '40%',
                            // transform: 'translate(10px, -50%)',
                            zIndex: 1
                          }}>
                            <i className='fa fa-check-circle mr-1 mt-1'></i> {lang["copied"]}
                          </div>
                        }
                      </div>
                    </div>

                    <div class="form-group col-lg-12">
                      <label>{lang["activate.key"]}</label>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <textarea type="text" class="form-control" value={key.activation_key} onChange={
                          (e) => { setKey({ ...key, activation_key: e.target.value }) }
                        }
                          style={{ minHeight: 275 }}
                          spellCheck={false}
                        />
                      </div>
                    </div>

                    <div class="form-group col-lg-12">
                      <button type="button" onClick={submitKey} class="btn btn-success ">{lang["active now"]}</button>
                    </div>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivationForm;
