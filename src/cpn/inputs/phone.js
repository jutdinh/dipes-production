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
        <div className="w-100-pct p-1 m-t-1">
            <div>
                <span className="block text-16-px">
                    {/* {field.field_name} */}
                    {field.field_name}{!field.nullable && <span style={{color: 'red'}}> *</span>}
                    
                </span>
            </div>
            <div className="m-t-0-5">
                <input
                    type="text"
                    className={`p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1   ${phoneError ? 'border-red' : ''} `}
                    value={current}
                    placeholder=""
                    onChange={fieldChangeData}
                />

            </div>
            {

                <div className="rel">
                    <div className="abs">
                        {phoneError && (
                            <span className="block crimson p-0-5 text-14-px">
                                Số điện thoại không hợp lệ
                            </span>
                        )}
                    </div>
                </div>}
        </div>
    );
};
