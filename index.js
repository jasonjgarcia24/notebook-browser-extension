const inputEl         = document.getElementById("input-el");
const inputBtn        = document.getElementById("button-input");
const saveTabBtn      = document.getElementById("button-tab");
const newNavTabBtn    = document.getElementById("__tab_create__");
const deleteBtn       = document.getElementById("button-delete");
const ulElements      = document.getElementsByClassName("content-ul");

const home_page      = "Home";
const active_tab_str = " __tab_active__";
const active_div_str = " __div_active__";
const active_ul_str  = " __ul_active__";
const delete_emoji   = "\u{274c}";
const copy_emoji     = "\u{1f4cb}";
const link_emoji     = "\u{1f517}";
const ul_finder      = /(?<=ul-)\w*[^ ]+/;
const li_finder      = /(?<=li-)\w*[^ ]+/;
const tab_finder     = /(?<=tab-)\w*[^ ]+/;

const user_input = () => { return inputEl.value.replace(" ", "~"); }

let notesIdMap      = new Map();
let notesClassMap   = new Map(JSON.parse(localStorage.getItem("notesClassMap")));
let ulElementMap    = new Map(JSON.parse(localStorage.getItem("ulElementMap")));

let navTabUlContent = undefined;
let ulActive        = undefined;
let dragging        = undefined;
let draggedOver     = undefined;

createNewPage(home_page);

inputBtn.addEventListener("click", function () {    
    if (!inputEl.value) { return };

    const _note = user_input()
    const _page = getPage()

    if (!notesClassMap.has(_page)) {
        notesClassMap.set(_page, []);
    }
    notesClassMap.get(_page).push(_note);

    updateLocalStorage("notesClassMap", notesClassMap, renderPageNotes);

    inputEl.value = "";
})

saveTabBtn.addEventListener("click", function () {
    const _page = getPage();

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        notesClassMap.get(_page).push(tabs[0].url);
        updateLocalStorage("notesClassMap", notesClassMap, renderPageNotes);
    })
})

newNavTabBtn.addEventListener("click", function () {
    const _page = user_input();
    if (!_page) { return }

    createNewPage(_page);
    inputEl.value = "";
})

function addNavTabEventListeners() {
    const _tabs = document.getElementsByClassName("tab");
    const _page = (_tab) => { return _tab.className.match(tab_finder)[0].trim() };

    Array.from(_tabs).forEach(_tab => {
        _tab.addEventListener("click", function () {
            setActivePage(_page(_tab));
            set_ulActive();
            renderPageNotes(notesClassMap);
        })
    })
}

function set_ulElementMap(_page) {
    let _tab = `tab tab-${_page}`;
    let _ul  = `content-ul ul-${_page}`;

    ulElementMap.set(_tab, _ul);

    updateLocalStorage("ulElementMap", ulElementMap);
}

function set_ulActive() {
    ulActive = document.getElementsByClassName(active_ul_str)[0];
}

function getPage() {
    const _page = ulActive.className.match(ul_finder)[0].trim();
    ensurePageExists(_page);
    
    return _page;
}

function ensurePageExists(_page) {
    let _storedPage = notesClassMap.get(_page);

    if (!_storedPage) {
        notesClassMap.set(_page, new Array());
        updateLocalStorage("notesClassMap", notesClassMap);

        _storedPage = notesClassMap.get(_page);
    }

    return _storedPage;
}

function setActivePage(_page) {
    const _tab = document.getElementsByClassName(`tab-${_page}`)[0];
    const _div = document.getElementsByClassName(`container-content-ul-${_page}`)[0];
    const _ul  = document.getElementsByClassName(`ul-${_page}`)[0];
    const _active_div = document.getElementsByClassName(active_div_str)[0];

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
    _tab.className += active_tab_str;
    _div.className += active_div_str;
    _ul.className  += active_ul_str;
}

function updateLocalStorage(_key, _val, _func) {
    localStorage.setItem(_key, JSON.stringify([..._val]));
    if (_func) { _func(_val); }
}

function deleteNoteEventHandler(e) {
    const _page = getPage()
    const _lead_to_delete = e.srcElement.id;
    const _new_leadsClassMap = notesClassMap.get(_page).filter(_lead => _lead !== _lead_to_delete);

    notesClassMap.set(_page, _new_leadsClassMap);
    updateLocalStorage("notesClassMap", notesClassMap, renderPageNotes);
}

function copyNoteEventHandler(e) {
    const lead = e.srcElement.id;
    let leadCopyStr = "";

    if (notesIdMap.has(lead)) {
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
    const _idx_dragging    = notesClassMap.get(_page).indexOf(dragging);
    const _idx_draggedOver = notesClassMap.get(_page).indexOf(draggedOver);

    notesClassMap.get(_page).splice(_idx_dragging, 1);
    notesClassMap.get(_page).splice(_idx_draggedOver, 0, dragging);
    
    updateLocalStorage("notesClassMap", notesClassMap, renderPageNotes);
}

function createNewPage(_page) {   
    ensurePageExists(_page)
    set_ulElementMap(_page);
    renderPageBase();
    setActivePage(_page);
    set_ulActive();
    renderPageNotes(notesClassMap);
    addNavTabEventListeners();
}

function renderPageBase() {
    const _div_container     = document.getElementById("container-content");
    const _tab_container     = document.getElementById("container-tab");
    const _existing_nav_tabs = document.getElementsByClassName("tab")

    ulElementMap.forEach((_ul, _tab) => {
        if (!Array.from(_existing_nav_tabs).filter(
            _existing_tab => _existing_tab.className.includes(_tab)
        ).length) {
            const _tabName    = _tab.match(tab_finder)[0].trim();
            const _tabElement = document.createElement("a");
            const _divElement = document.createElement("div");
            const _ulElement  = document.createElement("ul");
            
            _tabElement.className = _tab;
            _divElement.className = `container-content-ul container-content-ul-${_tabName}`;
            _ulElement.className  = _ul;

            _tabElement.href        = "#";
            _tabElement.textContent = _tabName.replace("~", " ");

            _tab_container.appendChild(_tabElement);
            _div_container.appendChild(_divElement);
            _divElement.appendChild(_ulElement);
        }
    })
}

function renderPageNotes(_notesClassMap) {
    let _listItems  = ""
    let _page       = getPage();
    let _classLeads = _notesClassMap.get(_page);
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

if (notesClassMap.size !== 0) {
    renderPageNotes(notesClassMap);
}

