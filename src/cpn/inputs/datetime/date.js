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
        console.log(defaultValue)
    }, [defaultValue])
    return(
       
         <div class="row justify-content-center">
         <div class="col-md-6">
             <form>
                 <div class="form-group">
                     <label for="name"> {field.field_name}{!field.nullable && <span style={{color: 'red'}}> *</span>}</label>
                     <input type="date"
                    className="form-control"
                    placeholder="" onChange={ fieldChangeData } value={ current }
                    />
                 </div>
             </form>
         </div>
     </div>
    )
}



// import { useState, useEffect } from 'react';
// import { format, parse, isValid } from 'date-fns';

// const formatDate = (dateStr, pattern = 'dd/MM/yyyy') => {
//   if (!dateStr) return '';
//   const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
//   return isValid(parsedDate) ? format(parsedDate, pattern) : '';
// };

// const parseDate = (dateStr, pattern = 'dd/MM/yyyy') => {
//   if (!dateStr) return '';
//   const parsedDate = parse(dateStr, pattern, new Date());
//   return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : '';
// };

// export default (props) => {
//   const { field, changeTrigger, defaultValue } = props;
//   const [current, setCurrent] = useState(defaultValue ? defaultValue : '');

//   const fieldChangeData = (e) => {
//     const { value } = e.target;
//     changeTrigger(field, formatDate(value, field.props.PATTERN));
//     setCurrent(value);
//   };

//   useEffect(() => {
//     setCurrent(defaultValue);
//     console.log(defaultValue);
//   }, [defaultValue]);

//   return (
//     <div className="w-100-pct p-1 m-t-1">
//       <div>
//         {field.field_name}
//         {!field.nullable && <span style={{ color: 'red' }}> *</span>}
//       </div>
//       <div className="m-t-0-5">
//         <input
//           type="date"
//           className="p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1"
//           placeholder=""
//           onChange={fieldChangeData}
//           value={parseDate(current, field.props.PATTERN)}
//         />
//       </div>
//     </div>
//   );
// };
