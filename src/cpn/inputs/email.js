import { useState, useEffect } from 'react';

export default (props) => {
    const [current, setCurrent] = useState('');
    const { field, changeTrigger, defaultValue, onEmailError } = props;
    const [emailError, setEmailError] = useState(false);
    const validateEmail = (email) => {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegex.test(email);
    };

  
    const fieldChangeData = (e) => {
        const { value } = e.target;
        setCurrent(value);
        const isValidEmail = validateEmail(value) || value === '';  
        onEmailError(!isValidEmail);
        if (isValidEmail) {
          changeTrigger(field, value);
          setEmailError(false);
        }
        else{
            setEmailError(true);
        }
      };

    useEffect(() => {
        setCurrent(defaultValue);
    }, [defaultValue]);

    return (
        <div className="w-100-pct p-1 m-t-1">
            
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <form>
                        <div class="form-group">
                            <label for="name">{field.field_name}{!field.NULL && <span style={{color: 'red'}}> *</span> }</label>
                            <input
                                type="email"
                                className={`form-control ${emailError ? 'border-red' : ''} `}
                                value={current}
                                placeholder=""
                                onChange={fieldChangeData}
                            />
                        </div>

                    {emailError&& (
                        <div className="rel">
                            <div className="abs">
                                <span className="block crimson p-0-5 text-14-px">
                                    Địa chỉ email không hợp lệ
                                </span>
                            </div>
                        </div>
                    )}
                    </form>
                </div>
            </div>

        </div>
    );
};
