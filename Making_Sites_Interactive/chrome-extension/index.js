myLeads = [];
const inputEl    = document.getElementById("input-el");
const inputBtn   = document.getElementById("button-input");
const saveTabBtn = document.getElementById("button-tab");
const deleteBtn  = document.getElementById("button-delete");
const ulEl       = document.getElementById("ul-el");
const thisLocalStorage = JSON.parse(localStorage.getItem("myLeads"));

const delete_emoji = "\u{274c}";
const copy_emoji = "\u{1f4cb}";
const link_emoji   = "\u{1f517}"

if (thisLocalStorage) { myLeads = thisLocalStorage; }


inputBtn.addEventListener("click", function () {
    if (!inputEl.value) { return };

    myLeads.push(inputEl.value);
    addToLocalStorage(myLeads);
    renderLeads(myLeads);

    inputEl.value = "";
})

saveTabBtn.addEventListener("click", function () {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        myLeads.push(tabs[0].url);
        localStorage.setItem("myLeads", JSON.stringify(myLeads));
        renderLeads(myLeads);
    })
})

deleteBtn.addEventListener("click", function () {
    if (!myLeads) { return };

    const msg = "Are you sure you want to delete all?";
    if (!confirmSelection(msg)) { return };

    myLeads = [];
    clearLocalStorage();
    renderLeads(myLeads);
})

function addToLocalStorage(_lead) {
    localStorage.setItem("myLeads", JSON.stringify(_lead));
}

function removeFromLocalStorage(e) {
    const thisLead = e.srcElement.id;
    let i = 0;
    let match = false;

    while (i < myLeads.length || !match) {
        if (thisLead.includes(myLeads[i])) {
            myLeads.splice(i, 1);
            localStorage.setItem("myLeads", JSON.stringify(myLeads));
            renderLeads(myLeads);
            match = true;
        }
        i++;
    }
}

function clearLocalStorage() {
    localStorage.clear();
}

function confirmSelection(msg) {
    if (confirm(msg)) {
        return true;
    }
    else {
        return false;
    }
}

function copyLead(e) {
    const thisLead = e.srcElement.id;
    let i = 0;
    let match = false;

    while (i < myLeads.length || !match) {
        if (thisLead.includes(myLeads[i])) {
            navigator.clipboard.writeText(myLeads[i])
            match = true;
        }
        i++;
    }
}

function renderLeads(_myLeads) {
    let listItems = ""
    for (let i = 0; i < _myLeads.length; i++) {        
        listItems += `
            <li>
                <span>
                <button class="copy-lead" id="copy-${_myLeads[i]}">${copy_emoji}</button>|
                <a class="link-lead" href="${_myLeads[i]}" target="_blank">${link_emoji}</a>|
                <button class="delete-lead" id="delete-${_myLeads[i]}">${delete_emoji}</button>| 
                    ${_myLeads[i]}
                </span>
            </li>
        `;
    }
    ulEl.innerHTML = listItems;

    for (let i = 0; i < _myLeads.length; i++) {        
        document.getElementById(`delete-${_myLeads[i]}`).addEventListener("click", removeFromLocalStorage);
        document.getElementById(`copy-${_myLeads[i]}`).addEventListener("click", copyLead);
    }
}

if (myLeads.length !== 0) {
    renderLeads(myLeads);
}

