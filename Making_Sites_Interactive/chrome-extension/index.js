let myLeads = [];
const inputEl    = document.getElementById("input-el");
const inputBtn   = document.getElementById("button-input");
const saveTabBtn = document.getElementById("button-tab");
const deleteBtn  = document.getElementById("button-delete");
const ulEl       = document.getElementById("ul-el");
const thisLocalStorage = JSON.parse(localStorage.getItem("myLeads"));

const delete_emoji = "\u{274c}";
const copy_emoji   = "\u{1f4cb}";
const link_emoji   = "\u{1f517}";

let base, dragging, draggedOver;
let idMap = new Map();

if (thisLocalStorage) { myLeads = thisLocalStorage; }
if (myLeads) { setIdMap(myLeads) }


function setIdMap(_myLeads) {
    idMap.clear();

    for (let i = 0; i < _myLeads.length; i++) {
        idMap.set(_myLeads[i], i);
    }
}

inputBtn.addEventListener("click", function () {
    if (!inputEl.value) { return };

    myLeads.push(inputEl.value);
    addToLocalStorage(myLeads);

    inputEl.value = "";
})

saveTabBtn.addEventListener("click", function () {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        myLeads.push(tabs[0].url);
        addToLocalStorage(myLeads);
    })
})

function addToLocalStorage(_lead) {
    localStorage.setItem("myLeads", JSON.stringify(_lead));
    renderLeads(myLeads);
    setIdMap(myLeads);
}

function removeFromLocalStorage(e) {
    const lead = getLeadFromElementId(e.srcElement.id);

    if (idMap.has(lead)) {
        myLeads.splice(idMap.get(lead), 1);
        localStorage.setItem("myLeads", JSON.stringify(myLeads));
        renderLeads(myLeads);
        setIdMap(myLeads);
    }
}

function copyLead(e) {
    const thisLead = e.srcElement.id;
    let i = 0;
    let match = false;
    let leadCopyStr = "";

    while (i < myLeads.length || !match) {
        if (thisLead.includes(myLeads[i])) {
            leadCopyStr = myLeads[i].split(" ");
            leadCopyStr = leadCopyStr[leadCopyStr.length - 1];

            navigator.clipboard.writeText(leadCopyStr);
            match = true;
        }
        i++;
    }
}

function setDragging(e) {
    dragging = getLeadFromElementId(e.target.id);
}

function setDraggedOver(e) {
    e.preventDefault();
    draggedOver = getLeadFromElementId(e.target.id);
}

function compare(e) {
    myLeads.splice(idMap.get(dragging), 1);
    myLeads.splice(idMap.get(draggedOver), 0, dragging);
    
    addToLocalStorage(myLeads);
}

function getLeadFromElementId(_id) {    
    let lead = _id.split("-");
    lead = lead[lead.length - 1];

    return lead
}

function renderLeads(_myLeads) {
    let listItems = ""
    let thisLead;
    for (let i = 0; i < _myLeads.length; i++) {
        thisLead = _myLeads[i];
        listItems += `
            <li id="item-${thisLead}" draggable="true">
                <span id="span-${thisLead}">
                <button class="copy-lead" id="copy-${thisLead}">${copy_emoji}</button>|
                <a class="link-lead" id="anchor-${thisLead}" href="${thisLead}" target="_blank">${link_emoji}</a>|
                <button class="delete-lead" id="delete-${thisLead}">${delete_emoji}</button>| 
                    ${thisLead}
                </span>
            </li>
        `;
    }
    ulEl.innerHTML = listItems;

    let listItem, deleteItem, copyItem;

    for (let i = 0; i < _myLeads.length; i++) {
        thisLead   = _myLeads[i];
        listItem   = document.getElementById(`item-${thisLead}`);
        deleteItem = document.getElementById(`delete-${thisLead}`);
        copyItem   = document.getElementById(`copy-${thisLead}`);

        listItem.addEventListener("drag", setDragging);
        listItem.addEventListener("dragover", setDraggedOver);
        listItem.addEventListener("drop", compare);

        deleteItem.addEventListener("click", removeFromLocalStorage);
        copyItem.addEventListener("click", copyLead);
    }
}

if (myLeads.length !== 0) {
    renderLeads(myLeads);
}

