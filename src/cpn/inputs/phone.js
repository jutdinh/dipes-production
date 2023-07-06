import { useState, useEffect } from 'react';

export default (props) => {
    // const { field, changeTrigger, defaultValue } = props;
    const [current, setCurrent] = useState('');
    const [phoneError, setPhoneError] = useState(false);
    // const [phoneError, setPhoneError] = useState(false);
    const { field, changeTrigger, defaultValue, onPhoneError } = props;
    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^\d{10,15}$/;
        return phoneRegex.test(phone);
    };




    const fieldChangeData = (e) => {
        const { value } = e.target;
        setCurrent(value);
        const isValidPhone = validatePhoneNumber(value) || value === '';

        onPhoneError(!isValidPhone);
        if (isValidPhone) {
            changeTrigger(field, value);
            setPhoneError(false);

        } else {
            setPhoneError(true);
        }
    };
    useEffect(() => {
        setCurrent(defaultValue);
    }, [defaultValue]);


    return (
 
                 
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <form>
                        <div class="form-group">
                            <label for="name">{field.field_name}{!field.NULL && <span style={{color: 'red'}}> *</span> }</label>
                            <input
                                type="text"
                                className={`form-control ${phoneError ? 'border-red' : ''} `}
                                value={current}
                                placeholder=""
                                onChange={fieldChangeData}
                            />
                        </div>

                    { phoneError && (
                        <div className="rel">
                            <div className="abs">
                                <span className="block crimson p-0-5 text-14-px">
                                    Số điện thoại không hợp lệ
                                </span>
                            </div>
                        </div>
                    )}
                    </form>
                </div>
            </div>          

      
    );
};
