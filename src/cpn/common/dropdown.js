import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default (props) => {
    const { uid } = useSelector( state => state.functions )
    const thisWidgetID = uid();
    const { options, func, defaultValue, bg, fitWidth } = props;
    const [ value, setValue ] = useState({})

    useEffect(()=> {
       setValue( defaultValue )        
    },[ defaultValue ])

    const clickHandler = (e, opt) => {
        e.preventDefault()
        setValue( opt )
        func(opt)
    }

    return(
        <div class="dropdown">
            <button className={ `btn ${ bg ? bg : "btn-primary" } dropdown-toggle` }
                    type="button" 
                    id={ thisWidgetID } 
                    data-toggle="dropdown" 
                    aria-haspopup="true" 
                    aria-expanded="false"  
                    style={ fitWidth && { minWidth: "120px" } }                  
            > { value.label }
            </button>
            <div className="dropdown-menu" aria-labelledby={ thisWidgetID }>
                { options.map( opt =>
                    <a key={ opt.id } href="#" className="dropdown-item cursor-pointer" onClick={ (e) => { clickHandler(e, opt) } }>{ opt.label }</a>
                 ) }               
                
            </div>
        </div>
    )
}