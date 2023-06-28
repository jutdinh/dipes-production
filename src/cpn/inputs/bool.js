import { useState, useEffect } from 'react';

export default (props) => {
    const { defaultValue, field, changeTrigger } = props;
    const [ height, setHeight ] = useState(0);
    const [ current, setCurrent ] = useState(0)

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
    const [ data, setData ] = useState(values[current])

    useEffect(() => {        

        if( defaultValue !== undefined ){
            setCurrent(defaultValue == 1 ? 0 : 1)
            setData( values[defaultValue == 1 ? 0 : 1] )
        }else{
            setCurrent(1)
            setData( values[0] )
            changeTrigger(field, values[0].value )
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

    const changeValue = (e) => {
        const value = e.target.value;       
        console.log(value)        
        setData( values[value == true ? 0 : 1] )
        changeTrigger(field, value )
    }



    return (
        // <div className="w-100-pct p-1">
        //     <div className="flex">
        //         <div className="flex flex-bottom">
        //             <span className="block text-16-px"> {field.field_name}{!field.nullable && <span style={{color: 'red'}}> *</span>}</span>
        //         </div>
        //         <div className="rel flex flex-no-wrap fill-available m-l-1 no-border border-1-bottom">
        //             <input
        //                 onBlur = { blurTrigger }
        //                 onFocus = { focusTrigger }
        //                 value = { data.label } readOnly
        //                 className="text-16-px block text-center no-border fill-available" spellCheck="false"/>
        //             <div className="rel w-12-pct flex-middle">
        //                 <img className="w-12-px block ml-auto" src="/assets/icon/drop-arrow.png"/>
        //             </div>
        //         </div>
        //     </div>
        //     <div className="rel">
        //         <div className="abs-default w-100-pct no-overflow bg-white shadow" style={{ height: `${ height }px` }}>
        //             <div className="block w-100-pct p-0-5 overflow" style={{ height: `${ height }px` }}>
        //             { values.map( val =>
        //                  <div key={ val.id }>
        //                     <span className="block p-0-5 bg-white pointer hover"
        //                         onClick={ () => { changeValue( val.value ); setData( val ) } }
        //                     >{ val.label }</span>
        //                  </div>
        //               )}
        //             </div>
        //         </div>
        //     </div>

        // </div>

        <div class="row justify-content-center">
        
        <div class="col-md-6">
            <form>
                <div class="form-group">
                    <label for="name">{field.field_name}{!field.nullable && <span style={{ color: 'red' }}> *</span>}</label>
                    <select value={ data.value } onChange={ changeValue } className="form-control">
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