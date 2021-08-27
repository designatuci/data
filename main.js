import GoogleSpreadsheet from 'google-spreadsheet'
import ogs from 'open-graph-scraper'
import fs, { link } from 'fs'
import "google-spreadsheet"

const apiKey = "AIzaSyAdZJbuWhBhiDQ-L3fGD02HdUpVgMwrqFs"
const doc = new GoogleSpreadsheet.GoogleSpreadsheet('16Kl3rvCKqopZhwirNFaku1dtE5wslvE49i6e2AGPBp0')
doc.useApiKey(apiKey);

await doc.loadInfo()
console.log("Reading "+doc.title)

//
//  Events
//

console.log("Loading Events")

const sheet_events = doc.sheetsByIndex[0]
var rows = await sheet_events.getRows()
var scanning = false

// events object
var file_events = {events:[]}

for (let row of rows) {
    // For each row:
    if (row._rawData == "DATA START TAG       Do not modify this cell. Insert a new cell below this one to create a new event.") {
        scanning = true
    } else if (scanning) {
        // For each event:
        if (row.enabled=="TRUE") {
            let event = {
                title: row.title,
                time: row.time,
		duration: row.duration,
                type: row.type,
                desc: row.description,
                place: row.location
            }
            if (row.links && row.links.length > 0) {
                var links = []
                let groups = row.links.matchAll(`\(([^:()]+)[: ]+([^()]+)\)`)
                for (let l of groups) {
                    links.push({
                        label: l[2],
                        link: l[3]
                    })
                }
                event.links = links
            }
            file_events.events.push(event)
        }
    }    
}

// Save to file
var jsonContent = JSON.stringify(file_events)

fs.writeFile("events.json", jsonContent, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing to events.json")
        return console.log(err)
    }
    console.log("Saved to events.json")
})




//
//  Hyperlinks
//

console.log("Loading Hyperlinks")

const sheet_links = doc.sheetsByIndex[2]
rows = await sheet_links.getRows()
scanning = false

// links object
var file_links = {links:[]}

for (let row of rows) {
    // For each row:
    if (!scanning && row._rawData == "DATA START TAG       Do not modify this cell. Insert new combinations below this one to create new hyperlinks.") {
        scanning = true
    } else if (scanning) {
        // For each resources:
        if (row.enabled=="TRUE") {
            let item = {
                code: row.code,
                link: row.link,
            }
            file_links.links.push(item)
        }
    }    
}

// Save to file
jsonContent = JSON.stringify(file_links)

fs.writeFile("hyperlinks.json", jsonContent, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing to hyperlinnks.json")
        return console.log(err)
    }
    console.log("Saved to hyperlinks.json")
})



//
//  Resources
//

console.log("Loading Resources")

const sheet_res = doc.sheetsByIndex[1]
rows = await sheet_res.getRows()
scanning = false

// resources object
var file_res = {resources:[]}
var pending_res = []

for (let row of rows) {
    // For each row:
    if (!scanning && row._rawData == "DATA START TAG       Do not modify this cell. Insert new cells below this one to create a new resource.") {
        scanning = true
    } else if (scanning) {
        // For each resources:
        if (row.enabled=="TRUE") {
            let item = {
                title: row.title,
                type: row.type,
                link: row.link,
                desc: row.description,
            }
            const options = { url: row.link };
            pending_res.push(
                ogs(options, (error, results, response) => {
                    if (results.ogImage) {
                        item.ogImg = results.ogImage.url
                    }
                    file_res.resources.push(item)
                })
            )
        }
    }    
}

// Save to file
Promise.all(pending_res).then(()=>{
    console.log("OG images loaded")
    jsonContent = JSON.stringify(file_res)
    
    fs.writeFile("resources.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing to resources.json")
            return console.log(err)
        }
        console.log("Saved to resources.json")
    })

})
