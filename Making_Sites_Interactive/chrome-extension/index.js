const inputEl          = document.getElementById("input-el");
const inputBtn         = document.getElementById("button-input");
const saveTabBtn       = document.getElementById("button-tab");
const deleteBtn        = document.getElementById("button-delete");
const navTabs          = document.getElementsByClassName("tab");
const navTabContent    = document.getElementsByClassName("container-content-ul");
const ulElements       = document.getElementsByClassName("content-ul");

const delete_emoji = "\u{274c}";
const copy_emoji   = "\u{1f4cb}";
const link_emoji   = "\u{1f517}";
const ul_finder    = /(?<=ul-)\w*[^ ]+/;
const li_finder    = /(?<=li-)\w*[^ ]+/;
const tab_finder   = /(?<=tab-)\w*[^ ]+/;

let leadsIdMap    = new Map();
let leadsClassMap = new Map(JSON.parse(localStorage.getItem("leadsClassMap")));
let ulMap         = new Map();
let ulActive      = undefined;
let dragging      = undefined;
let draggedOver   = undefined;
console.log(leadsClassMap)


setActiveUl()
setTabMap(navTabs, navTabContent)

inputBtn.addEventListener("click", function () {
    if (!inputEl.value) { return };
    
    const _label = getUlLabel()

    if (!leadsClassMap.has(_label)) {
        leadsClassMap.set(_label, []);
    }
    leadsClassMap.get(_label).push(inputEl.value);

    addToLocalStorage(leadsClassMap);

    inputEl.value = "";
})

saveTabBtn.addEventListener("click", function () {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const _label = getUlLabel();
        
        leadsClassMap.get(_label).push(tabs[0].url);
        addToLocalStorage(leadsClassMap);
    })
})

for (i = 0; i < navTabs.length; i++) {
    let _tab = navTabs[i].className;

    navTabs[i].addEventListener("click", function () {
        let _div = ulMap.get(_tab);
        let _ul  = _div.children[0];

        for (let ii = 0; ii < navTabContent.length; ii++) {
            navTabContent[ii].style.display = "none";
        }

        for (let ii = 0; ii < ulElements.length; ii++) {
            ulElements[ii].className = ulElements[ii].className.replace(" __active__", "");
        }

        _div.style.display = "block";
        _ul.className += " __active__";

        setActiveUl()
        renderLeads(leadsClassMap);
    })
}

function setTabMap(_navTabs, _navTabContent) {
    let ii   = 0;
    let _tab = undefined;
    let _div  = undefined;

    for (let i = 0; i < _navTabs.length; i++) {
        ii   = 0;
        _tab = _navTabs[i].className.match(tab_finder)[0].trim();

        while (ii < _navTabContent.length && _div !== _tab) {
            _div = _navTabContent[ii].className.match(ul_finder)[0].trim();
            if (_div === _tab) {
                ulMap.set(_navTabs[i].className, _navTabContent[ii]);
            }
            ii++;
        }
    }
    console.log("Active Tab: ", ulMap);
}

function setActiveUl() {
    let i    = 0;
    let _ul  = undefined;
    ulActive = undefined;

    while (!ulActive && i < ulElements.length) {
        _ul = ulElements[i];
        if (_ul.className.includes(" __active__")) {
            ulActive = _ul;
        }
        i++;
    }
    console.log("Active UL: ", ulActive);
}

function getUlLabel() {
    return ulActive.className.match(ul_finder)[0].trim();
}

function addToLocalStorage(_lead) {
    localStorage.setItem("leadsClassMap", JSON.stringify([...leadsClassMap]));
    renderLeads(leadsClassMap);
    setLeadsClassMap(leadsClassMap);
}

function removeFromLocalStorage(e) {
    const _label = getUlLabel()
    const _lead  = e.srcElement.id;

    if (leadsIdMap.has(_label, _lead)) {
        leadsClassMap.splice(leadsClassMap.get(_lead), 1);
        localStorage.setItem("leadsClassMap", JSON.stringify([...leadsClassMap]));
        renderLeads(leadsClassMap);
        setLeadsClassMap(leadsClassMap);
    }
}

function copyLead(e) {
    const lead = e.srcElement.id;
    let leadCopyStr = "";

    if (leadsIdMap.has(lead)) {
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
    leadsClassMap.splice(leadsIdMap.get(dragging), 1);
    leadsClassMap.splice(leadsIdMap.get(draggedOver), 0, dragging);
    
    addToLocalStorage(leadsClassMap);
}

function renderLeads(_leadsClassMap) {
    let _listItems  = ""
    let _label      = getUlLabel();
    let _classLeads = _leadsClassMap.get(_label);
    let _lead;
    // console.log(_label)

    for (let i = 0; i < _classLeads.length; i++) {
        _lead = _classLeads[i];
        _listItems += `
            <li class="list-lead li-${_label}" id="${_lead}" draggable="true">
                <span id="${_lead}">
                <button class="btn btn-lead copy-lead" id="${_lead}">${copy_emoji}</button>|
                <a class="btn btn-lead link-lead" id="${_lead}" href="${_lead}" target="_blank">${link_emoji}</a>|
                <button class="btn btn-lead delete-lead" id="${_lead}">${delete_emoji}</button>| 
                    ${_lead}
                </span>
            </li>
        `;
    }
    ulActive.innerHTML = _listItems;
    // console.log(ulActive)

    const listElements   = document.getElementsByClassName("list-lead");
    const deleteElements = document.getElementsByClassName("delete-lead");
    const copyElements   = document.getElementsByClassName("copy-lead");

    for (let i = 0; i < _classLeads.length; i++) {
        _lead = _classLeads[i];

        listElements[i].addEventListener("drag", setDragging);
        listElements[i].addEventListener("dragover", setDraggedOver);
        listElements[i].addEventListener("drop", compare);

        deleteElements[i].addEventListener("click", removeFromLocalStorage);
        copyElements[i].addEventListener("click", copyLead);
    }
}

// console.log(leadsClassMap)
if (leadsClassMap.size !== 0) {
    renderLeads(leadsClassMap);
}

