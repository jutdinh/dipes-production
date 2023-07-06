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
        <div class="row justify-content-center">
            <div class="col-md-6">
                <form>
                    <div class="form-group">
                        <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                        <input type="number" step={2}
                            className={`form-control`}
                            placeholder="" onChange={fieldChangeData} value={current}
                        />
                    </div>

                </form>
            </div>
        </div>
    )
}
