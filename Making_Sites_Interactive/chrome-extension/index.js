let myLeads = [];
let idMap = new Map();
let dragging, draggedOver;

const inputEl    = document.getElementById("input-el");
const inputBtn   = document.getElementById("button-input");
const saveTabBtn = document.getElementById("button-tab");
const deleteBtn  = document.getElementById("button-delete");
const ulEl       = document.getElementById("ul-el");
const thisLocalStorage = JSON.parse(localStorage.getItem("myLeads"));

const delete_emoji = "\u{274c}";
const copy_emoji   = "\u{1f4cb}";
const link_emoji   = "\u{1f517}";


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
    const lead = e.srcElement.id;

    if (idMap.has(lead)) {
        myLeads.splice(idMap.get(lead), 1);
        localStorage.setItem("myLeads", JSON.stringify(myLeads));
        renderLeads(myLeads);
        setIdMap(myLeads);
    }
}

function copyLead(e) {
    const lead = e.srcElement.id;
    let leadCopyStr = "";

    if (idMap.has(lead)) {
        leadCopyStr = lead.split(" ");
        leadCopyStr = leadCopyStr[leadCopyStr.length - 1];

        navigator.clipboard.writeText(leadCopyStr);
    }
}

function setDragging(e) {
    dragging = e.target.id;
}

function setDraggedOver(e) {
    e.preventDefault();
    draggedOver = e.target.id;
}

function compare(e) {
    myLeads.splice(idMap.get(dragging), 1);
    myLeads.splice(idMap.get(draggedOver), 0, dragging);
    
    addToLocalStorage(myLeads);
}

function renderLeads(_myLeads) {
    let listItems = ""
    let thisLead;
    for (let i = 0; i < _myLeads.length; i++) {
        thisLead = _myLeads[i];
        listItems += `
            <li class="list-lead" id="${thisLead}" draggable="true">
                <span id="${thisLead}">
                <button class="copy-lead" id="${thisLead}">${copy_emoji}</button>|
                <a class="link-lead" id="${thisLead}" href="${thisLead}" target="_blank">${link_emoji}</a>|
                <button class="delete-lead" id="${thisLead}">${delete_emoji}</button>| 
                    ${thisLead}
                </span>
            </li>
        `;
    }
    ulEl.innerHTML = listItems;
    
    const listElements   = document.getElementsByClassName("list-lead");
    const deleteElements = document.getElementsByClassName("delete-lead");
    const copyElements   = document.getElementsByClassName("copy-lead");

    for (let i = 0; i < _myLeads.length; i++) {
        thisLead = _myLeads[i];

        listElements[i].addEventListener("drag", setDragging);
        listElements[i].addEventListener("dragover", setDraggedOver);
        listElements[i].addEventListener("drop", compare);

        deleteElements[i].addEventListener("click", removeFromLocalStorage);
        copyElements[i].addEventListener("click", copyLead);
    }
}

if (myLeads.length !== 0) {
    renderLeads(myLeads);
}

