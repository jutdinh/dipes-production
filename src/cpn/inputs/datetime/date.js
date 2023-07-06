import { useState, useEffect } from 'react';

export default (props) => {
    const { field, changeTrigger, defaultValue } = props;
    const [current, setCurrent] = useState("");

    const fieldChangeData = (e) => {
        const { value } = e.target;
        changeTrigger(field, value)
        setCurrent(value)
    }

    useEffect(() => {
        if(defaultValue){
            const dateValue = new Date(defaultValue).toISOString().slice(0,10);
            setCurrent(dateValue);
        }
    }, [defaultValue])

    console.log(current)

    return (
        <div className="row justify-content-center">
            <div className="col-md-6">
                <form>
                    <div className="form-group">
                        <label htmlFor="name"> {field.field_name}{!field.NULL && <span style={{color: 'red'}}> *</span>}</label>
                        <input type="date"
                            className="form-control"
                            placeholder="" onChange={fieldChangeData} value={current}
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}
