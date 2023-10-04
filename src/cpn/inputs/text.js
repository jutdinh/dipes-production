import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default (props) => {

    const { field, changeTrigger, related, table, defaultValue, selectOption } = props;
    const [current, setCurrent] = useState('')
    const { proxy, unique_string, lang } = useSelector(state => state);
    const [textError, settextError] = useState(false);
    const validateVarchar = (varchar) => {
        return varchar.length <= 65535;
    };

    const isFieldForeign = () => {
        if (table) {
            const { foreign_keys } = table;
            const key = foreign_keys.find(key => key.field_id == field.id)
            if (key) {
                return key
            }
        }
        return false
    }

    const isPrimaryKey = () => {
        if (table) {
            const { primary_key } = table;
            const key = primary_key.find(key => key == field.id)
            if (key) {
                return key
            }
        }
        return false
    }

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
if(isPrimaryKey()){
    return (
        <div class="row justify-content-center">
            <div class="form-group col-md-6">
                <form>
                    <div class="form-group">
                        <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label> <br></br>
                        <textarea disabled type="text"
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
                               {lang["char error"]}
                                </span>
                            </div>
                        </div>
                    )}
                    </div>
                   
                </form>
            </div>
        </div>
    )
} else {
    return (


        <div class="row justify-content-center">
            <div class="form-group col-md-6">
                <form>
                    <div class="form-group">
                        <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label> <br></br>
                        <textarea type="text" rows="1" 
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
                                {lang["char error"]}
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
    
}