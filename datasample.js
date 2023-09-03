const fetch = require('node-fetch');

let dataTemplate = {
    "2ML": "LSP0492",
    "2TL" : "L"
};
let sampleDataSet = [];
let numberOfSamples = 100;

for (let i = 0; i < numberOfSamples; i++) {
    let newDataTemplate = { ...dataTemplate };  
    newDataTemplate["2MLSP"] = `ML${i+1}`;  
    newDataTemplate["2TLSP"] = `Tên loại ${i+1}`;  
  
    sampleDataSet.push(newDataTemplate);
}

console.log("hihihih",sampleDataSet);

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return response.json();
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async function() {
    for (let sampleData of sampleDataSet) {
        try {
            const result = await postData('http://127.0.0.1:5000/ui/D549ADE1C51E4C9AAEC5DE4F78E1337D', sampleData);
            await sleep(25); 
        } catch (error) {
            console.error('Error:', error);
        }
    }
})();
