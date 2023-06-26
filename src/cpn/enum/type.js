// export const ValidTypeEnum = Object.freeze({
//     INT: { value: "INT", label: "INT" },
//     INT_UNSIGNED: { value: "INT UNSIGNED", label: "INT UNSIGNED" },
//     BIGINT: { value: "BIGINT", label: "BIGINT" },
//     BIGINT_UNSIGNED: { value: "BIGINT UNSIGNED", label: "BIGINT UNSIGNED" },
//     BOOL: { value: "BOOL", label: "BOOL" },
//     DECIMAL: { value: "DECIMAL", label: "DECIMAL" },
//     DECIMAL_UNSIGNED: { value: "DECIMAL UNSIGNED", label: "DECIMAL UNSIGNED" },
//     DATE: { value: "DATE", label: "DATE" },
//     DATETIME: { value: "DATETIME", label: "DATETIME" },
//     TEXT: { value: "TEXT", label: "TEXT" },
//     CHAR: { value: "CHAR", label: "CHAR" },
//     EMAIL: { value: "EMAIL", label: "EMAIL" },
//     PHONE: { value: "PHONE", label: "PHONE" },
// });

export const ValidTypeEnum = Object.freeze({
    INT: { id: 1, name: "INT", type: "int", limit: {
        min: -2147483648,
        max: 2147483647
    },props: [{ name: "AUTO_INCREMENT", label: "Tự động tăng", type: "bool" }, { name: "PATTERN", friend: "AUTO_INCREMENT", type: "text", label: "Định dạng" }, { name: "MIN", label: "Giá trị tối thiểu", type: "int" }, { name: "MAX", label: "Giá trị tối đa", type: "int" }] },
  
    INT_UNSIGNED: { id: 2, name: "INT UNSIGNED", type: "int", limit: {
        min: 0,
        max: 4294967295
    }, props: [{ name: "AUTO_INCREMENT", label: "Tự động tăng", type: "bool" }, { name: "PATTERN", friend: "AUTO_INCREMENT", type: "text", label: "Định dạng" }, { name: "MIN", label: "Giá trị tối thiểu", type: "int" }, { name: "MAX", label: "Giá trị tối đa", type: "int" }] },
   
    BIGINT: { id: 3, name: "BIGINT", type: "int",  limit: {
        min: -9223372036854776000,
        max: 9223372036854775999
    }, props: [{ name: "AUTO_INCREMENT", label: "Tự động tăng", type: "bool" }, { name: "PATTERN", friend: "AUTO_INCREMENT", type: "text", label: "Định dạng" }, { name: "MIN", label: "Giá trị tối thiểu", type: "int" }, { name: "MAX", label: "Giá trị tối đa", type: "int" }] },
    
    BIGINT_UNSIGNED: { id: 4, name: "BIGINT UNSIGNED", type: "int",  limit: {
        min: 0,
        max: 18446744073709552000
    }, props: [{ name: "AUTO_INCREMENT", label: "Tự động tăng", type: "bool" }, { name: "PATTERN", friend: "AUTO_INCREMENT", type: "text", label: "Định dạng" }, { name: "MIN", label: "Giá trị tối thiểu", type: "int" }, { name: "MAX", label: "Giá trị tối đa", type: "int" }] },
   
    BOOL: { id: 5, name: "BOOL", type: "bool", limit: {
        min: 0,
        max: 1
    }, props: [{ name: "IF_TRUE", label: "Giá trị đúng", type: "text" }, { name: "IF_FALSE", label: "Giá trị sai", type: "text" }] },
    
    DECIMAL: {
        id: 6, name: "DECIMAL", type: "floating-point", limit: {
            min: -9223372036854776000,
            max: 9223372036854775999
        },
        props: [{ name: "MAX", label: "Giá trị tối đa", type: "int" }, { name: "MIN", label: "Giá trị tối thiểu", type: "int" }, { name: "DECIMAL_PLACE", label: "Số chữ số thập phân", type: "int" }]
    }, /* dec(5,2) ~ 999.99 */
   
    DECIMAL_UNSIGNED: {
        id: 7, name: "DECIMAL UNSIGNED", type: "floating-point",
        limit: {
            min: 0,
            max: 18446744073709552000
        },
        props: [{ name: "MAX", label: "Giá trị tối đa", type: "int" }, { name: "MIN", label: "Giá trị tối thiểu", type: "int" }, { name: "DECIMAL_PLACE", label: "Số chữ số thập phân", type: "int" }]
    }, /* dec(5,2) ~ 999.99 */
   
    DATE: { id: 8, name: "DATE", type: "date", format: "dd/MM/yyyy", props: [{ name: "FORMAT", type: "text", label: "Định dạng" }] },
    DATETIME: { id: 10, name: "DATETIME", type: "datetime", format: "dd/MM/yyyy hh:mm:ss", props: [{ name: "FORMAT", type: "text", label: "Định dạng" }] },
    TEXT: { id: 11, name: "TEXT", type: "text",  name: "TEXT", props: [{ name: "LENGTH", label: "Độ dài tối đa", type: "int" }] },
    CHAR: { id: 12, name: "CHAR", type: "char", props: [] }, /* Char( 255 ) */
    EMAIL: { id: 14, name: "EMAIL", type: "char", format: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, props: [] },
    PHONE: { id: 14, name: "PHONE", type: "char", format: /^\d{10,15}$/, props: [] },
});