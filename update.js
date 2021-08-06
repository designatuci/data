const { GoogleSpreadsheet } = require('google-spreadsheet')

const apiKey = "AIzaSyAdZJbuWhBhiDQ-L3fGD02HdUpVgMwrqFs"
const doc = new GoogleSpreadsheet('16Kl3rvCKqopZhwirNFaku1dtE5wslvE49i6e2AGPBp0')
doc.useApiKey(apiKey);

(async function() {
    await doc.loadInfo()
    console.log("Reading "+doc.title)
    
}()).then(()=>{
    (async function() {
        const sheet = doc.sheetsByIndex[0]
        const rows = await sheet.getRows()
        scanning = false
        for (row of rows) {
            // For each row:
            if (row._rawData == "DATA START TAG       Do not modify this cell. Insert a new cell below this one to create a new event.") {
                scanning = true
            } else if (scanning) {
                // For each event:
                if (row.enabled=="TRUE") {
                    console.log("------")
                    console.log(row.title)
                    console.log("\t"+row.time)
                    console.log("\t"+(new Date(row.time)))
                    console.log("\t"+row.type)
                    console.log("\t"+row.description)
                    console.log("\t"+row.location)

                }
            }
        }
    }())

})
