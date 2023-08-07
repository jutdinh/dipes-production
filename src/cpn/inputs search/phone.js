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
       
      
            changeTrigger(field, value);
          

       
    };
    useEffect(() => {
        setCurrent(defaultValue);
    }, [defaultValue]);


    return (
 
                 
           
        <div className="col-md-4 col-sm-3">
                    <form>
                        <div class="form-group">
                            <label for="name">{field.field_name}{!field.NULL && <span style={{color: 'red'}}> *</span> }</label>
                            <input
                                type="number"
                                className={`form-control ${phoneError ? 'border-red' : ''} `}
                                value={current}
                                placeholder=""
                                onChange={fieldChangeData}
                            />
                        </div>
                    </form>
                </div>
                   

      
    );
};
