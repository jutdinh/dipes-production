import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default (props) => {
    const { field, changeTrigger, defaultValue } = props;
    const [current, setCurrent] = useState('')
    const [textError, settextError] = useState(false);
    const validateVarchar = (varchar) => {
        return varchar.length <= 65535;
    };



// console.log(field)
    const fieldChangeData = (e) => {
        const { value } = e.target
        setCurrent(value)
        if (validateVarchar(value) || value === '') {
            settextError(false);
            changeTrigger(field, value);
        } else {
            settextError(true);
        }
      
    }
    useEffect(() => {
        setCurrent(defaultValue)
    }, [defaultValue])

    return (


        <div class="row justify-content-center">
            <div class="form-group col-md-6">
                <form>
                    <div class="form-group">
                        <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label> <br></br>
                        <textarea type="text"
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                               
                            }
                        }}
                            className="form-control"
                            value={current}
                            placeholder="" onChange={fieldChangeData}
                        />
                       { textError && (
                        <div className="rel">
                            <div className="abs">
                                <span  className="block crimson mb-2 text-14-px " style={{color: 'red'}}>
                                Vượt quá số lượng kí tự
                                </span>
                            </div>
                        </div>
                    )}
                    </div>
                   
                </form>
            </div>
        </div>
    )
}