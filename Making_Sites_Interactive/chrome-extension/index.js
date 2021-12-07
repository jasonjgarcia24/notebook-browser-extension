myLeads = [];
const inputEl = document.getElementById("input-el");
const inputBtn = document.getElementById("button-input");
const ulEl = document.getElementById("ul-el");
const thisLocalStorage = JSON.parse(localStorage.getItem("myLeads"));

if (thisLocalStorage) { myLeads = thisLocalStorage; }


inputBtn.addEventListener("click", function () {
    if (!inputEl.value) { return }

    myLeads.push(inputEl.value);
    inputEl.value = "";    
    addToLocalStorage(myLeads);
    renderLeads();
})

function addToLocalStorage(_val) {
    localStorage.setItem("myLeads", JSON.stringify(_val));
}

function removeFromLocalStorage(_idx) {
    myLeads.splice(_idx, 1);
    localStorage.setItem("myLeads", JSON.stringify(myLeads));

    renderLeads();
}

function addRemoveEventListeners() {
    console.log(myLeads)
    for (let i = 0; i < myLeads.length; i++) {  
        btn = document.getElementsByName(myLeads[i])[0];      
        console.log(btn);

        btn.addEventListener("click", removeFromLocalStorage(i))
    }
}

function renderLeads() {
    let listItems = ""
    for (let i = 0; i < myLeads.length; i++) {
        listItems += `
            <li>
                ${myLeads[i]}
                <button id='button-remove' class='push-btn' name='${myLeads[i]}'>
                    REMOVE
                </button>
            </li>
        `;
    }
    ulEl.innerHTML = listItems;
}

renderLeads();

