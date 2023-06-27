import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default ( props ) => {
    const { field, changeTrigger, defaultValue } = props;
    const [ current, setCurrent ] = useState('')

    const fieldChangeData = (e) => {
        const { value } = e.target
        setCurrent(value)
        changeTrigger( field, value )
    }
    useEffect(() => {
        setCurrent(defaultValue)
    }, [defaultValue])

    return(
        <div className="w-100-pct p-1 m-t-1">
            <div>
                <span className="block text-16-px">
                    {/* { field.field_name } */}
                    {field.field_name}{!field.nullable && <span style={{color: 'red'}}> *</span>}
                </span>
            </div>
            <div className="m-t-0-5">
                <textarea type="text"
                    className="p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1"
                    value={current}
                    placeholder="" onChange={ fieldChangeData }
                    />
            </div>
        </div>
    )
}