const Model  = require('./config/models/model') 
const RECORDs_PER_PARTITION = 10000
const formatIndex = (index, format = "0000000") => {
    const stringifyIndex = index.toString()

    if( stringifyIndex.length > format.length  ){
        return stringifyIndex
    }
    return format.slice( 0, format.length -stringifyIndex.length ) + stringifyIndex
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

const makeKHACHHANG = async () => {
    const JSONPattern =  {
        id: 0,
        "1MKH": "KH0000",
        "1TKH": "Bé Mốc Noè",
        "1ĐC": "Trà Vinh - Vietnam",
        "1DĐ": "0368474601",
        "1E": "mail.moc@mail.com",
    }

    const model = new Model('1KH')
     const Table = model.getModel()

     for( let loop = 0 ; loop < 1; loop++ ){
        const customers = []
        for( let i = 0; i < 100; i++ ){
            const currentCustomers = []
    
            for( let j = 0 ; j < RECORDs_PER_PARTITION; j++ ){
                const KH = { ...JSONPattern }
                KH.id = i*RECORDs_PER_PARTITION + j;
                KH["1MKH"] = `KH${ formatIndex( KH.id + loop * 1_000_000 ) }`
                KH["1TKH"] = `KHACH HANG MAU ${ KH.id }`
                KH["1ĐC"] = "Cinecidee Secret Room"
                KH["1DĐ"] = "0368474601"
                KH["1E"] = `moc.${ formatIndex(KH.id) }@mylangroup.com`            
                currentCustomers.push(KH)
            }
            customers[i] = {
                position: `${ ( loop * 1_000_000 ) + ( i )*RECORDs_PER_PARTITION }-${( ( loop * 1_000_000 )) + (i + 1) * RECORDs_PER_PARTITION - 1}`,
                data: currentCustomers,
                total: RECORDs_PER_PARTITION
            }            
            console.log(`INSERTED PARTITION ${ customers[i].position }`)
        }
        await Table.__insertMany__( customers)
    }
    
    Table.__insertMany__( [{
        position: `sumerize`,
        total: 1000000,
    }] )
        
    console.log( "DONE KHACH HANG" )
}

const makeLOAISANPHAM = () => {
    const JSONPattern =   {        
            "1MLSP": "LSP0206",
            "2TL": "PRODCTION TYPE"   
    }

    const productionTypes = []

    for( let i = 0; i < 100; i++ ){
        const currentTypes = []

        for( let j = 0 ; j < RECORDs_PER_PARTITION; j++ ){
            const LSP = { ...JSONPattern }
            LSP.id = i*RECORDs_PER_PARTITION + j;
            LSP["1MLSP"] = `LSP-${ formatIndex( LSP.id ) }`
            LSP["2TL"] = `LOẠI SẢN PHẨM ${ LSP.id }`                        
            currentTypes[j] = LSP
        }

        // console.log(`INSERT DATA ${ i*RECORDs_PER_PARTITION }-${(i+1) * RECORDs_PER_PARTITION - 1}`)
        productionTypes[i] = {
            position: `${ i*RECORDs_PER_PARTITION }-${(i+1) * RECORDs_PER_PARTITION - 1}`,
            data: currentTypes,
            total: RECORDs_PER_PARTITION
        }
    }
    productionTypes[100] = {
        position: `sumerize`,
        total: 1000000,
    }
    const model = new Model('2LSP')
    const Table = model.getModel()
    Table.__insertMany__( productionTypes)
    
    console.log( "DONE LOAI SAN PHAM" )

    
}


const makeNHANVIEN = () => {
    const JSONPattern =  {
        "1MNV": "NV-0001",
        "1HT": "Bành Mốc",
        "2ĐC": "Trà Vinh - Vietnam",
        "2DĐ": "0368474601",
        "2E": "moc.mail@mail.com"
    }

    const employees = []

    for( let i = 0; i < 100; i++ ){
        const currentCollection = []

        for( let j = 0 ; j < RECORDs_PER_PARTITION; j++ ){
            const NV = { ...JSONPattern }
            NV.id = i*RECORDs_PER_PARTITION + j;
            NV["1MNV"] = `NV-${ formatIndex( NV.id ) }`
            NV["1HT"] = `NHÂN VIÊN ${ NV.id }`           
            NV["__position__"] = `${ i*RECORDs_PER_PARTITION }-${(i+1) * RECORDs_PER_PARTITION - 1}`
            currentCollection[j] = NV
        }

        // console.log(`INSERT DATA ${ i*RECORDs_PER_PARTITION }-${(i+1) * RECORDs_PER_PARTITION - 1}`)
        employees[i] = {
            position: `${ i*RECORDs_PER_PARTITION }-${(i+1) * RECORDs_PER_PARTITION - 1}`,
            data: currentCollection,
            total: RECORDs_PER_PARTITION
        }
    }
    employees[100] = {
        position: `sumerize`,
        total: 1000000,
    }
     const model = new Model('1NV')
     const Table = model.getModel()
     Table.__insertMany__( employees )
        
    console.log( "DONE NHAN VIEN" )
}

const makeSANPHAM = async () => {
    const JSONPattern =  {
        "2MSP": "SP-0001",
        "1TSP": "Bành Mốc",
        "3LSP": "LSP-000001"
        
    }

    const employees = []

    const model = new Model('2SP')
    const Table = model.getModel()

     for( let loop = 0 ; loop < 1; loop++ ){
        const customers = []
        for( let i = 0; i < 100; i++ ){
            const currentCustomers = []
    
            for( let j = 0 ; j < RECORDs_PER_PARTITION; j++ ){
                const NV = { ...JSONPattern }
                NV.id = i*RECORDs_PER_PARTITION + j;
                NV["2MSP"] = `SP-2023${ formatIndex( NV.id, "0000" ) }`
                NV["1TSP"] = `SẢN PHẨM ${ NV.id }`           
                NV["3LSP"] = `LSP-${ formatIndex( getRandomInt(6), "00000000") }`
                currentCustomers[j] = NV
            }
            customers[i] = {
                position: `${ ( loop * 1_000_000 ) + ( i )*RECORDs_PER_PARTITION }-${( ( loop * 1_000_000 )) + (i + 1) * RECORDs_PER_PARTITION - 1}`,
                data: currentCustomers,
                total: RECORDs_PER_PARTITION
            }            
            console.log(`INSERTED PARTITION ${ customers[i].position }`)
        }
        await Table.__insertMany__( customers)
    }
     
     Table.__insertMany__(  [{
        position: `sumerize`,
        total: 1000000,
    }] )
        
    console.log( "DONE SAN PHAM" )
}

const makeDONHANG = () => {
    const JSONPattern =  {
        "1SHĐ": "SHĐ-2023-0001",
        "2MKH": "Bành Mốc",
        "1NĐ": `2023-${ getRandomInt(11) + 1 }-${getRandomInt(25) + 5 }`,
        "1NVLĐ": "NV-000001",
        "__position__": "0-999"
    }

    const employees = []

    for( let i = 0; i < 1000; i++ ){
        const currentCollection = []

        for( let j = 0 ; j < RECORDs_PER_PARTITION; j++ ){
            const NV = { ...JSONPattern }
            NV.id = i*RECORDs_PER_PARTITION + j;
            NV["1SHĐ"] = `SHĐ-2023-${ formatIndex( NV.id ) }`
            NV["2MKH"] = `KH-${ formatIndex( getRandomInt(RECORDs_PER_PARTITION) ) }`           
            NV["1NĐ"] = `2023-${ getRandomInt(11) + 1 }-${getRandomInt(25) + 5 }`
            NV["1NVLĐ"] = `NV-${ formatIndex( getRandomInt(RECORDs_PER_PARTITION) ) }`
            NV["__position__"] = `${ i*RECORDs_PER_PARTITION }-${(i+1) * RECORDs_PER_PARTITION - 1}`

            currentCollection[j] = NV
        }

        // console.log(`INSERT DATA ${ i*RECORDs_PER_PARTITION }-${(i+1) * RECORDs_PER_PARTITION - 1}`)
        employees[i] = {
            position: `${ i*RECORDs_PER_PARTITION }-${(i+1) * RECORDs_PER_PARTITION - 1}`,
            data: currentCollection,
            total: RECORDs_PER_PARTITION
        }
    }
    employees[100] = {
        position: `sumerize`,
        total: 10000000,
    }
     const model = new Model('1ĐH')
     const Table = model.getModel()
     Table.__insertMany__( employees )
        
    console.log( "DONE DON HANG" )
}

const makeCHITIETDATHANG = () => {
    const JSONPattern =  {
        "2SHĐ": "SHĐ-2023-0001",
        "3MSP": "SP-000000",
        "1SL": 20,
        "1ĐG": 20.01
    }

    const employees = []
    
    for( let i = 0; i < 3000; i++ ){
        const currentCollection = []

        for( let j = 0 ; j < RECORDs_PER_PARTITION; j++ ){
            const NV = { ...JSONPattern }
            NV.id = i*RECORDs_PER_PARTITION + j;
            NV["2SHĐ"] = `SHĐ-2023-00004`
            NV["3MSP"] = `SP-2023${ formatIndex(i*RECORDs_PER_PARTITION+j, "0000") }`           
            NV[ "1SL"] = getRandomInt(995) + 5
            NV[ "1ĐG"] = parseFloat(`${ getRandomInt(25) + 5 }.${ getRandomInt(5)*20 }`)            

            currentCollection[j] = NV
        }

        // console.log(`INSERT DATA ${ i*RECORDs_PER_PARTITION }-${(i+1) * RECORDs_PER_PARTITION - 1}`)
        employees[i] = {
            position: `${ i*RECORDs_PER_PARTITION + 9_000_000 }-${(i+1) * RECORDs_PER_PARTITION - 1 + 9_000_000}`,
            data: currentCollection,
            total: RECORDs_PER_PARTITION
        }

        console.log( employees[i].position )
    }
    // employees[3000] = {
    //     position: `sumerize`,
    //     total: 3000000,
    // }
     const model = new Model('1CTĐH')
     const Table = model.getModel()
     Table.__insertMany__( employees )
        
    console.log( "DONE CHI TIET HOA DON " )
}

const Main = () => {
    // makeKHACHHANG()
    makeLOAISANPHAM()
    makeNHANVIEN()
    makeSANPHAM()

    // makeDONHANG()
    // makeCHITIETDATHANG()
}

Main()