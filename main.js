import pkg from 'simple-git';
import GoogleSpreadsheet from 'google-spreadsheet'
import fs, { link } from 'fs'
// import SimpleGit from 'simple-git';
import "google-spreadsheet"

import simpleGit from 'simple-git';
const git = simpleGit()

const apiKey = "AIzaSyAdZJbuWhBhiDQ-L3fGD02HdUpVgMwrqFs"
const doc = new GoogleSpreadsheet.GoogleSpreadsheet('16Kl3rvCKqopZhwirNFaku1dtE5wslvE49i6e2AGPBp0')
doc.useApiKey(apiKey);

const gitOptions = {
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6,
}
// const git = simpleGit(gitOptions)



await doc.loadInfo()
console.log("Reading "+doc.title)

const sheet = doc.sheetsByIndex[0]
const rows = await sheet.getRows()
var scanning = false

// events object
var fileData = {events:[]}

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
                type: row.type,
                desc: row.description,
                place: row.location
            }
            if (row.links != "") {
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
            fileData.events.push(event)
        }
    }    
}

// Save to file
var jsonContent = JSON.stringify(fileData)

fs.writeFile("events.json", jsonContent, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing to events.json")
        return console.log(err)
    }
    console.log("Saved to events.json")
})
