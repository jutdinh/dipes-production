export default [
    { id: 1, name: "INT", type: "int", props: [{ name: "AUTO_INCREMENT", label: "Tự động tăng", type: "bool" }, { name: "PATTERN", friend: "AUTO_INCREMENT", type: "text", label: "Định dạng" },  { name: "MIN", label: "Giá trị tối thiểu", type: "int" }, { name: "MAX", label: "Giá trị tối đa", type: "int" }] },
    { id: 2, name: "INT UNSIGNED", type: "int", props: [{ name: "AUTO_INCREMENT", label: "Tự động tăng", type: "bool" }, { name: "PATTERN", friend: "AUTO_INCREMENT", type: "text", label: "Định dạng" }, { name: "MIN", label: "Giá trị tối thiểu", type: "int" }, { name: "MAX", label: "Giá trị tối đa", type: "int" }]},
    { id: 3, name: "BIG INT", type: "int", props: [{ name: "AUTO_INCREMENT", label: "Tự động tăng", type: "bool" }, { name: "PATTERN", friend: "AUTO_INCREMENT", type: "text", label: "Định dạng" }, { name: "MIN", label: "Giá trị tối thiểu", type: "int" }, { name: "MAX", label: "Giá trị tối đa", type: "int" }] },
    { id: 4, name: "BIG INT UNSIGNED", type: "int", props: [{ name: "AUTO_INCREMENT", label: "Tự động tăng", type: "bool" }, { name: "PATTERN", friend: "AUTO_INCREMENT", type: "text", label: "Định dạng" }, { name: "MIN", label: "Giá trị tối thiểu", type: "int" }, { name: "MAX", label: "Giá trị tối đa", type: "int" }]},
    { id: 5, name: "BOOL", type: "bool", props: [ { name: "IF_TRUE", label: "Giá trị đúng", type: "text" }, { name: "IF_FALSE", label: "Giá trị sai", type: "text" }  ] },
    { id: 6, name: "DECIMAL", type: "floating-point",
        props: [ { name: "MAX", label: "Giá trị tối đa", type: "int" }, {name: "MIN", label: "Giá trị tối thiểu", type: "int" },{ name: "DELIMITER", label: "Số chữ số thập phân", type: "int" } ] }, /* dec(5,2) ~ 999.99 */
    { id: 7, name: "DECIMAL UNSIGNED", type: "floating-point",
        props: [ { name: "MAX", label: "Giá trị tối đa", type: "int" }, {name: "MIN", label: "Giá trị tối thiểu", type: "int" },{ name: "DELIMITER", label: "Số chữ số thập phân", type: "int" } ] }, /* dec(5,2) ~ 999.99 */
    { id: 8, name: "DATE", type: "date", props: [ { name: "FORMAT", type: "text", label: "Định dạng" }] },
    // { id: 9, name: "TIME", type: "time", props: [ { name: "FORMAT", type: "text", label: "Định dạng" }] },
    { id: 10, name: "DATETIME", type: "datetime", props: [ { name: "FORMAT", type: "text", label: "Định dạng" }] },
    { id: 11, name: "TEXT", type: "text", props: [{ name: "LENGTH", label: "Độ dài tối đa", type: "int" }] },
    { id: 12, name: "CHAR", type: "char", props: [ { name: "LENGTH", label: "Độ dài tối đa", type: "int" } ] }, /* Char( 255 ) */
    // { id: 13, name: "VARCHAR", type: "char", props: [ { name: "LENGTH", label: "Độ dài tối đa", type: "int" } ] }, /* Varchar( 255 ) */
    { id: 14, name: "EMAIL", type: "char", props: [  ] }, 
    { id: 14, name: "PHONE", type: "char", props: [  ] }, 
]
