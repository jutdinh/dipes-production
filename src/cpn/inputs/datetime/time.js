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
        setCurrent(defaultValue)
    }, [defaultValue])

    return(
        <div className="w-100-pct p-1 m-t-1">
            <div>
            {field.field_name}{!field.nullable && <span style={{color: 'red'}}> *</span>}
            </div>
            <div className="m-t-0-5">
                <input type="time"
                    className="p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1"
                    placeholder="" onChange={ fieldChangeData } value={ current }
                    />
            </div>
        </div>
    )
}
