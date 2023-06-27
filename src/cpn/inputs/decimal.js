import { useState, useEffect } from 'react';

export default (props) => {
    const { field, changeTrigger, defaultValue, unsigned } = props;
    const [current, setCurrent] = useState(defaultValue ? defaultValue : "")
    const [decimalError, setDecimalError] = useState(false);
    const validateDecimal = (decimal, unsigned) => {
        const decimalRegex = unsigned ? /^\d+(\.\d{1,2})?$/ : /^-?\d+(\.\d{1,2})?$/;
        const maxLength = unsigned ? 5 : 6;
        const desiredDotPosition = 3;
    
        if (decimal.length > maxLength) {
            return false;
        }
    
        if (decimal.indexOf('.') !== -1 && decimal.indexOf('.') !== desiredDotPosition) {
            return false;
        }
    
        return decimalRegex.test(decimal);
    };
    

    const fieldChangeData = (e) => {
        const { value } = e.target;
        setCurrent(value);
       
            changeTrigger(field, value);
        
    };

    useEffect(() => {
        setCurrent(defaultValue)
    }, [defaultValue])

    return (
        <div className="w-100-pct p-1 m-t-1">
            <div>
                <span className="block text-16-px"> {field.field_name}{!field.nullable && <span style={{color: 'red'}}> *</span>}</span>
            </div>
            <div className="m-t-0-5">
                <input type="number" step={2}
                    className={`p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1 `}
                    placeholder="" onChange={fieldChangeData} value={current}
                />
                
            </div>
        </div>
    )
}
