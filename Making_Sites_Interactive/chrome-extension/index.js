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


set_ulActive()
set_ulMap(navTabs, navTabContent)
addNavTabEventListeners()

inputBtn.addEventListener("click", function () {
    if (!inputEl.value) { return };
    
    const _label = getPage()

    if (!leadsClassMap.has(_label)) {
        leadsClassMap.set(_label, []);
    }
    leadsClassMap.get(_label).push(inputEl.value);

    updateLocalStorage(leadsClassMap);

    inputEl.value = "";
})

saveTabBtn.addEventListener("click", function () {
    const _page = getPage();

    // leadsClassMap.get(_page).push("hi_there");
    // updateLocalStorage(leadsClassMap);

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        leadsClassMap.get(_page).push("hi_there");//tabs[0].url);
        updateLocalStorage(leadsClassMap);
    })
})

function addNavTabEventListeners() {
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

            set_ulActive()
            renderLeads(leadsClassMap);
        })
    }
}

function set_ulMap(_navTabs, _navTabContent) {
    let ii   = 0;
    let _tab = undefined;
    let _div = undefined;

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
}

function set_ulActive() {
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
}

function getPage() {
    return ulActive.className.match(ul_finder)[0].trim();
}

function updateLocalStorage(_leadsClassMap) {
    localStorage.setItem("leadsClassMap", JSON.stringify([..._leadsClassMap]));
    renderLeads(_leadsClassMap);
}

function deleteNoteEventHandler(e) {
    const _page = getPage()
    const _lead_to_delete = e.srcElement.id;
    const _new_leadsClassMap = leadsClassMap.get(_page).filter(_lead => _lead !== _lead_to_delete);

    console.log("_new_leadsClassMap: ", _new_leadsClassMap);
    leadsClassMap.set(_page, _new_leadsClassMap);

    updateLocalStorage(leadsClassMap);
    renderLeads(leadsClassMap);

    console.log(_page);
    console.log(_lead_to_delete);
    console.log(leadsClassMap);
}

function copyNoteEventHandler(e) {
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
    
    updateLocalStorage(leadsClassMap);
}

function renderLeads(_leadsClassMap) {
    let _listItems  = ""
    let _page       = getPage();
    let _classLeads = _leadsClassMap.get(_page);
    let _lead;

    for (let i = 0; i < _classLeads.length; i++) {
        _lead = _classLeads[i];
        _listItems += `
            <li class="list-lead li-${_page}" id="${_lead}" draggable="true">
                <span id="${_page}">
                <button class="btn btn-lead copy-lead-${_page}-${_lead}" id="${_lead}">${copy_emoji}</button>|
                <a class="btn btn-lead link-lead-${_page}-${_lead}" id="${_lead}" href="${_lead}" target="_blank">${link_emoji}</a>|
                <button class="btn btn-lead delete-lead-${_page}-${_lead}" id="${_lead}">${delete_emoji}</button>| 
                    ${_lead}
                </span>
            </li>
        `;
    }
    ulActive.innerHTML = _listItems;

    const listElements = document.getElementsByClassName(`li-${_page}`);
    let   deleteElements;
    let   copyElements;
    for (let i = 0; i < _classLeads.length; i++) {
        _lead = _classLeads[i]; 

        deleteElements = document.getElementsByClassName(`delete-lead-${_page}-${_lead}`)[0];
        copyElements   = document.getElementsByClassName(`copy-lead-${_page}-${_lead}`)[0];

        listElements[i].addEventListener("drag",     setDragging);
        listElements[i].addEventListener("dragover", setDraggedOver);
        listElements[i].addEventListener("drop",     compare);

        deleteElements.addEventListener("click", deleteNoteEventHandler);
        copyElements.addEventListener("click",   copyNoteEventHandler);
    }
}

if (leadsClassMap.size !== 0) {
    renderLeads(leadsClassMap);
}

