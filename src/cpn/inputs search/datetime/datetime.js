import { useState, useEffect } from 'react';

export default ( props ) => {
    const { field, changeTrigger, defaultValue } = props;
    const [ current, setCurrent ] = useState(defaultValue ? defaultValue:"")

    const fieldChangeData = (e) => {
        const { value } = e.target;
        changeTrigger( field, value )
        setCurrent( value )

    }

    useEffect(() => {
        if(defaultValue){
            let date = new Date(defaultValue);
            let localISOTime = date.toISOString().slice(0,19);
            setCurrent(localISOTime);
        }
    }, [defaultValue])
    

    return(
        <div className="col-md-4 col-sm-3">
            <form>
                <div className="form-group">
                    <label htmlFor="name"> {field.field_name}{!field.NULL && <span style={{color: 'red'}}> *</span>}</label>
                    <input type="datetime-local"
                        className="form-control"
                        placeholder="" onChange={fieldChangeData} value={current}
                    />
                </div>
            </form>
        </div>
    )
}
