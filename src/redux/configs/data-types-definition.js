export default {
    char: {
        name: "CHAR"
    },
    varchar: {
        name: "VARCHAR"
    },
    int: {
        name: "INT",
        limit: {
            min: -2147483648,
            max: 2147483647
        }
    },
    uint: {
        name: "INT UNSIGNED",
        limit: {
            min: 0,
            max: 4294967295
        }
    },
    bigInt: {
        name: "BIG INT",
        limit: {
            min: -9223372036854776000,
            max: -9223372036854775999
        }
    },
    ubigInt: {
        name: "BIG INT UNSIGNED",
        limit: {
            min: 0,
            max: 18446744073709552000
        }
    },
    bool: {
        name: "BOOL",
        limit: {
            min: 0,
            max: 1
        }
    },
    decimal: {
        name: "DECIMAL",
        limit: {
            min: -9223372036854776000,
            max: -9223372036854775999
        }
    },
    udecimal: {
        name: "DECIMAL UNSIGNED",
        limit: {
            min: 0,
            max: 18446744073709552000
        }
    },
    date: {
        name: "DATE",
        format: "dd/MM/yyyy"
    },
    time: {
        name: "TIME",
        format: "hh:mm:ss"
    },
    datetime: {
        name: "DATETIME",
        format: "dd/MM/yyyy hh:mm:ss"
    },
    text: {
        name: "TEXT"
    },
    email: {
        name: "EMAIL",
        format: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    phone: {
        name: "PHONE",
        format:  /^\d{10,15}$/
    }
}
 /* CONTINUE TO CREATE FIELDS */
