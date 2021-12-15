const inputEl      = document.getElementById("input-el");
const inputBtn     = document.getElementById("button-input");
const saveTabBtn   = document.getElementById("button-tab");
const newNavTabBtn = document.getElementById("__tab_create__");
const deleteBtn    = document.getElementById("button-delete");
const ulElements   = document.getElementsByClassName("content-ul");

const home_page      = "Home";
const active_tab_str = " __tab_active__";
const active_div_str = " __div_active__";
const active_ul_str  = " __ul_active__";
const delete_emoji   = "\u{274c}";
const copy_emoji     = "\u{1f4cb}";
const edit_emoji     = "\u{270d}";
const save_emoji     = "\u{1f4be}"
const ul_finder      = /(?<=ul-)\w*[^ ]+/;
const li_finder      = /(?<=li-)\w*[^ ]+/;
const tab_finder     = /(?<=tab-)\w*[^ ]+/;

const user_input = () => { return inputEl.value.replace(" ", "~"); }

let anchorTextMap = new Map(JSON.parse(localStorage.getItem("anchorTextMap")));
let notesClassMap = new Map(JSON.parse(localStorage.getItem("notesClassMap")));
let ulElementMap  = new Map(JSON.parse(localStorage.getItem("ulElementMap")));

let navTabUlContent = undefined;
let ulActive        = undefined;
let dragging        = undefined;
let draggedOver     = undefined;

createNewPage(home_page);

inputBtn.addEventListener("click", function () {    
    if (!inputEl.value) { return };
    if (!getAvailability(inputEl.value)) { return };

    const _note = user_input()
    const _page = getPage()

    anchorTextMap.set(_note, _note)
    notesClassMap.get(_page).push(_note);

    updateLocalStorage("anchorTextMap", anchorTextMap);
    updateLocalStorage("notesClassMap", notesClassMap, renderPageNotes);

    inputEl.value = "";
})

saveTabBtn.addEventListener("click", function () {
    const _page = getPage();

    chrome.tabs.query({active: true, currentWindow: true}, function (_tabs) {
        anchorTextMap.set(_tabs[0].url, _tabs[0].url)
        notesClassMap.get(_page).push(_tabs[0].url);
        updateLocalStorage("anchorTextMap", anchorTextMap);
        updateLocalStorage("notesClassMap", notesClassMap, renderPageNotes);
    })
})

newNavTabBtn.addEventListener("click", function () {
    const _page = user_input();
    if (!_page) { return }

    createNewPage(_page);
    inputEl.value = "";
})

function getAvailability(_note) {
    let isAvailable = true;

    notesClassMap.forEach((_notes, _page) => {
        if (Array.from(_notes).includes(_note)) {
            isAvailable = false;
            alert(`"${_note}" exists in the "${_page}" page as "${anchorTextMap.get(_note)}"!!\n\nYou must first remove it from there to add it to this page.`)
        }
    })

    return isAvailable;
}

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

function revertNoteEventHandler(e) {
    const _note  = e.srcElement.id;
    const _page  = getPage();
    const _input = document.getElementsByClassName(`input-note_title-${_page}-${_note}`)[0];
    const _link  = document.getElementsByClassName(`link-note-${_page}-${_note}`)[0]

    if (_link.style.visibility === "hidden") {
        const _inputSpan = document.getElementsByClassName(`span-note_title-${_page}-${_note}`)[0];

        _input.value = "";
        _link.style.visibility      = "visible";
        _inputSpan.style.visibility = "hidden";
    }
    else {
        const _note_to_delete = e.srcElement.id;
        const _new_notesClassMap = notesClassMap.get(_page).filter(_note => _note !== _note_to_delete);

        anchorTextMap.delete(_note);
        notesClassMap.set(_page, _new_notesClassMap);
        updateLocalStorage("anchorTextMap", anchorTextMap);
        updateLocalStorage("notesClassMap", notesClassMap, renderPageNotes);
    }
}

function saveNoteTitleEventHandler(e) {
    const _note  = e.srcElement.id;
    const _page = getPage();
    const _input = document.getElementsByClassName(`input-note_title-${_page}-${_note}`)[0];
    const _link  = document.getElementsByClassName(`link-note-${_page}-${_note}`)[0];

    if (_input.value) {
        const _inputSpan = document.getElementsByClassName(`span-note_title-${_page}-${_note}`)[0];

        anchorTextMap.set(_note, _input.value);
        updateLocalStorage("anchorTextMap", anchorTextMap);

        _link.textContent = _input.value;
        _input.value      = "";

        _link.style.visibility      = "visible";
        _inputSpan.style.visibility = "hidden";
    }
}

function editNoteEventHandler(e) {
    const _note  = e.srcElement.id;
    const _page  = getPage();
    const _link  = document.getElementsByClassName(`link-note-${_page}-${_note}`)[0]
    const _input = document.getElementsByClassName(`span-note_title-${_page}-${_note}`)[0];

    _link.style.visibility  = "hidden";
    _input.style.visibility = "visible";
}

function copyNoteEventHandler(e) {
    const _note = e.srcElement.id;
    navigator.clipboard.writeText(_note);
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
    const _page       = getPage();
    const _classNotes = _notesClassMap.get(_page);
    let _listItems    = "";
    let _note         = undefined;

    for (let i = 0; i < _classNotes.length; i++) {
        _note = _classNotes[i];

        _listItems += `
            <li class="list-note li-${_page}" id="${_note}" draggable="true">
                <div class="div-note" id="${_note}">
                    <button class="btn btn-note copy-note-${_page}-${_note}" id="${_note}">${copy_emoji}</button> |
                    <button class="btn btn-note edit-note-${_page}-${_note}" id="${_note}">${edit_emoji}</button> |
                    <button class="btn btn-note delete-note-${_page}-${_note}" id="${_note}">${delete_emoji}</button> | 
                    <div class="div-note-link">
                        <span class="span-note_title span-note_title-${_page}-${_note}" style="visibility: hidden">
                            <button class="btn btn-note save-note_title-${_page}-${_note}" id="${_note}">${save_emoji}</button> | 
                            <input class="input input-note_title input-note_title-${_page}-${_note}" id="${_note}" type="text" placeholder="Update display name..." />
                        </span>
                        <a class="link link-note link-note-${_page}-${_note}" href=${_note} target="_blank">${anchorTextMap.get(_note)}</a>
                    </div>
                </div>
            </li>
        `;
    }
    ulActive.innerHTML = _listItems;

    const listElements = document.getElementsByClassName(`li-${_page}`);
    let revertElements;
    let saveElements;
    let editElements;
    let copyElements;
    for (let i = 0; i < _classNotes.length; i++) {
        _note = _classNotes[i]; 

        revertElements = document.getElementsByClassName(`delete-note-${_page}-${_note}`)[0];
        saveElements   = document.getElementsByClassName(`save-note_title-${_page}-${_note}`)[0];
        editElements   = document.getElementsByClassName(`edit-note-${_page}-${_note}`)[0];
        copyElements   = document.getElementsByClassName(`copy-note-${_page}-${_note}`)[0];

        listElements[i].addEventListener("drag",     setDragging);
        listElements[i].addEventListener("dragover", setDraggedOver);
        listElements[i].addEventListener("drop",     compare);

        revertElements.addEventListener("click", revertNoteEventHandler);
        saveElements.addEventListener("click",   saveNoteTitleEventHandler);
        editElements.addEventListener("click",   editNoteEventHandler);
        copyElements.addEventListener("click",   copyNoteEventHandler);
    }
}

if (notesClassMap.size !== 0) {
    renderPageNotes(notesClassMap);
}

