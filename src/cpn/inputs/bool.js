import { useState, useEffect } from 'react';

export default (props) => {
    const { defaultValue, field, changeTrigger } = props;
    const [height, setHeight] = useState(0);
    const [current, setCurrent] = useState(0)

    const values = [
        {
            id: 0,
            label: field.DEFAULT_TRUE,
            value: true
        },
        {
            id: 1,
            label: field.DEFAULT_FALSE,
            value: false
        },
    ]
    const [data, setData] = useState(values[current])

    useEffect(() => {

        if (defaultValue !== undefined) {
            setCurrent(defaultValue == 1 ? 0 : 1)
            setData(values[defaultValue == 1 ? 0 : 1])
        } else {
            setCurrent(1)
            setData(values[0])
            changeTrigger(field, values[0].value)
        }
    }, [defaultValue])

    const blurTrigger = (e) => {
        e.preventDefault();
        setTimeout(() => {
            setHeight(0)
        }, 135)
    }

    const focusTrigger = () => {
        setHeight(100);
    }

    // const changeValue = (e) => {
    //     const value = e.target.value;       
    //     console.log(value)        
    //     setData( values[value == "true" ? 0 : 1] )
    //     changeTrigger(field, value )
    // }
    const changeValue = (e) => {
        const value = e.target.value;
        console.log(value);

        setData(values[value === 'true' ? 0 : 1]);
        changeTrigger(field, value);
    };




    return (
        <div class="row justify-content-center">
            <div class="col-md-6">
                <form>
                    <div class="form-group">
                        <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                        <select value={data.value} onChange={changeValue} className="form-control">
                            {values.map((val, index) =>
                                <option key={index} value={val.value}>{val.label}</option>
                            )}
                        </select>
                    </div>
                </form>
            </div>
        </div>
    )
}