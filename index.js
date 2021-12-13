const inputEl          = document.getElementById("input-el");
const inputBtn         = document.getElementById("button-input");
const saveTabBtn       = document.getElementById("button-tab");
const newNavTabBtn     = document.getElementById("__tab_create__");
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


setActivePage(navTabs[0].className.match(tab_finder)[0].trim())
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

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        leadsClassMap.get(_page).push(tabs[0].url);
        updateLocalStorage(leadsClassMap);
    })
})

newNavTabBtn.addEventListener("click", function () {
    renderNavTabs()
})

function addNavTabEventListeners() {
    const _navTabs = document.getElementsByClassName("tab");

    for (i = 0; i < _navTabs.length; i++) {
        let _page = _navTabs[i].className.match(tab_finder)[0].trim();
        
        _navTabs[i].addEventListener("click", function () {
            setActivePage(_page);
        })
    }
}

function set_ulMap(_navTabs, _navTabContent) {
    let ii    = 0;
    let _page = undefined;
    let _div  = undefined;

    for (let i = 0; i < _navTabs.length; i++) {
        ii   = 0;
        _page = _navTabs[i].className.match(tab_finder)[0].trim();

        while (ii < _navTabContent.length && _div !== _page) {
            _div = _navTabContent[ii].className.match(ul_finder)[0].trim();
            if (_div === _page) {
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
        if (_ul.className.includes(" __ul_active__")) {
            ulActive = _ul;
        }
        i++;
    }
}

function getPage() {
    const _page = ulActive.className.match(ul_finder)[0].trim();
    ensurePageExists(_page);
    
    return _page;
}

function ensurePageExists(_page) {
    let _storedPage = leadsClassMap.get(_page);

    if (!_storedPage) {
        leadsClassMap.set(_page, new Array());
        updateLocalStorage(leadsClassMap)

        _storedPage = leadsClassMap.get(_page);
    }

    return _storedPage;
}

function setActivePage(_page) {
    const _tab = document.getElementsByClassName(`tab-${_page}`)[0];
    const _div = document.getElementsByClassName(`container-content-ul-${_page}`)[0];
    const _ul  = document.getElementsByClassName(`ul-${_page}`)[0];
    const _active_div = document.getElementsByClassName("__div_active__")[0];

    function removeActiveClass(_str) {
        const _className = `__${_str}_active__`;

        Array.from(document.getElementsByClassName(_className)).forEach(_element => {
            _element.className  = _element.className.replace(` __${_str}_active__`, "");
        })
    }

    if (_active_div) { _active_div.style.display = "none"; }

    removeActiveClass("tab")
    removeActiveClass("div")
    removeActiveClass("ul")

    _div.style.display = "block";
    _tab.className += " __tab_active__";
    _div.className += " __div_active__";
    _ul.className  += " __ul_active__";

    set_ulActive()
    renderLeads(leadsClassMap);
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
    const _page = getPage();
    const _idx_dragging    = leadsClassMap.get(_page).indexOf(dragging);
    const _idx_draggedOver = leadsClassMap.get(_page).indexOf(draggedOver);

    leadsClassMap.get(_page).splice(_idx_dragging, 1);
    leadsClassMap.get(_page).splice(_idx_draggedOver, 0, dragging);
    
    updateLocalStorage(leadsClassMap);
}

function renderNavTabs() {
    const _new_tab_name     = inputEl.value;
    if (!_new_tab_name) { return }    

    const _current_nav_tabs = document.getElementsByClassName("tab");
    if (Array.from(_current_nav_tabs).filter(
        _element => _element.className.includes(`tab-${_new_tab_name}`)
    ).length) { return }

    const _div_container    = document.getElementById("container-content");
    const _tab_container    = document.getElementById("container-tab");
    const _new_tab          = document.createElement("a");
    const _new_div          = document.createElement("div");
    const _new_ul           = document.createElement("ul");

    _new_tab.className = `tab tab-${_new_tab_name}`;
    _new_div.className = `container-content-ul container-content-ul-${_new_tab_name}`;    
    _new_ul.className  = `content-ul ul-${_new_tab_name}`;

    _new_tab.href        = "#";
    _new_tab.textContent = _new_tab_name;

    _tab_container.appendChild(_new_tab);
    _div_container.appendChild(_new_div);
    _new_div.appendChild(_new_ul);

    addNavTabEventListeners()
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
                <span id="${_lead}">
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

