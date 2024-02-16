import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
export default (props) => {
    // const { field, changeTrigger, defaultValue } = props;
    const { proxy, pages, lang, functions } = useSelector(state => state);
    const [current, setCurrent] = useState('');
    const [imageError, setImageError] = useState(false);
    // const [phoneError, setPhoneError] = useState(false);
    const { field, changeTrigger, defaultValue } = props;
 



    const fieldChangeData = (e) => {
        const { value } = e.target;
        setCurrent(value);
            changeTrigger(field, value);
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
                            <img
                                className={`form-control`}
                                value={current}
                                width={40}
                                onChange={fieldChangeData}
                            />
                        </div>
                    </form>
                </div>
            </div>          
    );
};
