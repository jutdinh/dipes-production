import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default (props) => {
    const { field, changeTrigger, defaultValue } = props;
    const [current, setCurrent] = useState('')

    const fieldChangeData = (e) => {
        const { value } = e.target
        setCurrent(value)
        changeTrigger(field, value)
    }
    useEffect(() => {
        setCurrent(defaultValue)
    }, [defaultValue])

    return (


        <div class="row justify-content-center">
            <div class="form-group col-md-6">
                <form>
                    <div class="form-group">
                        <label for="name">{field.field_name}{!field.nullable && <span style={{ color: 'red' }}> *</span>}</label> <br></br>
                        <textarea type="text"
                            className="form-control"
                            value={current}
                            placeholder="" onChange={fieldChangeData}
                        />
                    </div>
                   
                </form>
            </div>
        </div>
    )
}