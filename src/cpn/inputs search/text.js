import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default (props) => {
    const { field, changeTrigger, defaultValue } = props;
    const [current, setCurrent] = useState('')
// console.log(field)
    const fieldChangeData = (e) => {
        const { value } = e.target
        setCurrent(value)
        changeTrigger(field, value)
    }
    useEffect(() => {
        setCurrent(defaultValue)
    }, [defaultValue])

    return (

            <div class="col-md-4 col-sm-3">
                <form>
                    <div class="form-group">
                        <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label> <br></br>
                        <textarea type="text"
                    rows="1"
                            className="form-control"
                            value={current}
                            placeholder="" onChange={fieldChangeData}
                        />
                    </div>
                </form>
            </div>
        
    )
}