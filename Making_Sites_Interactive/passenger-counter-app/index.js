// document.getElementById("count-el").innerText = 5

// initialize the count as 0
// listen for clicks on the increment button
// increment the count variable when the button is clicked
// change the count-el in the HTML to reflect the new count

let countEl     = document.getElementById("count-el")
let record      = document.getElementById("record")
let num_clicks  = 0
let recordArray = [num_clicks]

record.textContent = "Record: - "

function increment() {
    num_clicks += 1
    countEl.textContent = num_clicks
}

function save() {
    console.log(`Saved ${num_clicks} number of clicks!`)
    console.log(recordArray)
    recordArray.push(num_clicks)

    if (recordArray.length > 3 || (recordArray.length == 2 && recordArray[0] == 0) ) {
        recordArray.shift()
    }

    setRecords()

    num_clicks = -1
    increment()
}

function setRecords() {  
    record.textContent = `Records: ${recordArray}`.replace(/,/g, " - ")
}

