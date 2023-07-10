import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

function ActivationForm() {
  const { lang, proxy, auth, functions } = useSelector(state => state);
  
  const [key, setKey] = useState({ MAC: "", activated: true });
  const _token = localStorage.getItem("_token");

  useEffect(() => {
    fetch(`${ proxy() }/auth/activation/machine_id`, {
      headers: {
        Authorization: _token
      }
    }).then( res => res.json() ).then( res => {
      const { success, machineId, activation_key } = res      
      let MAC = "UNKNOWN MAC ADDRESS"
      let activated
      if( success ){
        MAC = machineId
      }      
      if( activation_key == undefined ){
        activated = false
      }
      setKey({ ...key, MAC, activation_key, activated })
    })
  }, [])

  const submitKey = () => {    
    fetch(`${ proxy() }/auth/activate/key`, {
      method: "POST",
      headers: {
        Authorization: _token,
        "content-type":  "application/json"
      },
      body: JSON.stringify({ key: key.activation_key })
    }).then( res => res.json() ).then( res => {
      const { status } = res;
      functions.showApiResponseMessage(status)
    })
  }

  return (
    <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4>{lang["activation"]}</h4>
                        </div>
                    </div>
                </div>
                <div class="row margin_top_30">
                    <div class="col-md-2"></div>
                    <div class="col-md-8">
                        <div class="white_shd full ">
                            <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <h5><a><i class="fa fa-chevron-circle-left mr-3 mb-2"></i></a> {lang["activation"]}</h5>
                                </div>
                            </div>                           
                          
                            <div class="full price_table padding_infor_info" style={{ display: 'flex', flexDirection: 'column', minHeight: '40vh' }}>
                                <form>
                                  <div class="row" style={{ marginBottom: 'auto' }}>
                                    <div class="form-group col-lg-12">
                                      <label>{lang["MAC"]}</label>
                                      <input type="text" class="form-control" value={key.MAC}  />
                                    </div>
                                    <div class="form-group col-lg-12">
                                        <label>{lang["activate.key"]}</label>
                                        <textarea type="text" class="form-control" value={ key.activation_key } onChange={
                                            (e) => { setKey({ ...key, activation_key: e.target.value }) }
                                        } 
                                          style={{ minHeight: 275 }}
                                          spellCheck={false}
                                        />
                                      </div>      
                                        <div class="form-group col-lg-12">
                                            <button type="button" onClick={ submitKey } class="btn btn-success ">{lang["active now"]}</button>                                        
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
