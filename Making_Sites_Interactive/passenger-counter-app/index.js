// document.getElementById("count-el").innerText = 5

// initialize the count as 0
// listen for clicks on the increment button
// increment the count variable when the button is clicked
// change the count-el in the HTML to reflect the new count

const reset_num_clicks = 0

let countEl     = document.getElementById("count-el")
let record      = document.getElementById("record")
let num_clicks  = reset_num_clicks
let recordArray = [num_clicks]

setRecords(recordArray)

function increment() {
    num_clicks = num_clicks + 1
    countEl.innerText = num_clicks
}

function reset() {
    console.log(`Saved ${num_clicks} number of clicks!`)
    console.log(recordArray)
    recordArray.push(num_clicks)

    if (recordArray.length > 3) {
        recordArray.shift()
    }

    setRecords(recordArray)

    num_clicks = reset_num_clicks
    countEl.innerText = reset_num_clicks
}

function setRecords(records) {  
    record.innerText  = `Records: ${records}`.replace(/,/g, " - ")
}

