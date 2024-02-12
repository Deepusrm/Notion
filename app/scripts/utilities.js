
async function showNotifications(message, type) {
    try {
        const client = await app.initialized();
        await client.interface.trigger('showNotify', {
            type: type,
            message: message
        })
    } catch (error) {
        console.log(error);
    }
}

function resetForm() {
    let form = document.querySelector('fw-form');
    let inputs = form.querySelectorAll('fw-input, fw-select, fw-textarea');

    inputs.forEach(input => {
        switch (input.tagName) {
            case 'FW-INPUT':
            case 'FW-TEXTAREA':
                input.value = '';
                break;
            case 'FW-SELECT':
                input.value = input.querySelector('fw-select-option').value;
                break;
        }
    })
}

async function showToast(message, type) {
    const toast = document.getElementById('modalToast');
    toast.content = message;
    toast.type = type;
    toast.trigger();
}

function removeBlock(blockids, id){
    blockids.filter((element) => element!== id);
    return blockids;
}


async function enableFields(){
    const buttons = Array.from(document.getElementsByClassName('deleteButton'));
    buttons.forEach((element)=>{
        element.style.display="block";
    })

    const paragraphs = Array.from(document.getElementsByClassName('fw-text-normal'));
    paragraphs.forEach((element) =>{
        element.style.color = "#1b334b";
        element.setAttribute('contenteditable',true);
    })

    const checkboxes = Array.from(document.getElementsByTagName('fw-checkbox'));
    checkboxes.forEach((element) =>{
        element.disabled = false;
        const children = Array.from(element.children);
        children[0].setAttribute('contenteditable',true);
    })

    const headings = Array.from(document.getElementsByClassName('fw-type-h3'));
    headings.forEach((element) =>{
        element.style.color = "#1b334b";
        element.setAttribute('contenteditable',true);
    })

    const list = Array.from(document.getElementsByTagName('li'));
    list.forEach((element)=>{
        element.style.color = "#1b334b";
        element.setAttribute('contenteditable',true);
    })

    const buttonGroup = `
        <fw-button-group>
            <fw-button color="primary" id="update">Update</fw-button>
            <fw-button color="secondary" id="back">Back</fw-button>
        </fw-button-group>
    `
    document.getElementById('edit').style.display = "none";
    document.getElementById('noteDetails').insertAdjacentHTML('beforeend',buttonGroup);
    
    document.getElementById('update').addEventListener('click',handleEdit);
    document.getElementById('back').addEventListener('click',disableFields);
}

async function disableFields(){
    const buttons = Array.from(document.getElementsByClassName('deleteButton'));
    buttons.forEach((element)=>{
        element.style.display="none";
    })

    const paragraphs = Array.from(document.getElementsByClassName('fw-text-normal'));
    paragraphs.forEach((element) =>{
        element.style.color = "#95a2af";
        element.setAttribute('contenteditable',false);
    })

    const checkboxes = Array.from(document.getElementsByTagName('fw-checkbox'));
    checkboxes.forEach((element) =>{
        element.disabled = true;
        const children = Array.from(element.children);
        children[0].setAttribute('contenteditable',false);
    })

    const headings = Array.from(document.getElementsByClassName('fw-type-h3'));
    headings.forEach((element) =>{
        element.style.color = "#95a2af";
        element.setAttribute('contenteditable',false);
    })

    const list = Array.from(document.getElementsByTagName('li'));
    list.forEach((element)=>{
        element.style.color = "#95a2af";
        element.setAttribute('contenteditable',false);
    })

    document.getElementById('edit').style.display = "block";
    Array.from(document.getElementsByTagName('fw-button-group')).forEach(element => {
        element.remove();
    });

}

function getClass(element){
    const className = Array.from(element.classList).join(' ');

    return className;
}
async function getEditedNotes(serverNotesResponse,clientNotes){

    console.log("getEditedNotes function entered");
    const editedNotes = [];
    const headings = serverNotesResponse.filter((element) => element.type === 'heading_3');
    const todos = serverNotesResponse.filter((element) => element.type === 'to_do');
    const paras = serverNotesResponse.filter((element) => element.type === 'paragraph');
    const lists = serverNotesResponse.filter((element) => element.type === 'numbered_list_item');

    const clientNotesLength = clientNotes["headings"].length + clientNotes["paragraphs"].length + clientNotes["checkboxes"].length + clientNotes["lists"].length;
    console.log(serverNotesResponse.length +" - server side response");
    console.log(clientNotesLength + " - Client side response");
    if(serverNotesResponse.length === clientNotesLength){
        for(let i=0 ;i<clientNotes["headings"].length;i++){
            if(headings[i]["content"] !== clientNotes["headings"][i]["content"]){
                console.log('heading matched!');
                editedNotes.push(clientNotes["headings"][i]);
            }
        }

        for(let j=0; j<clientNotes["checkboxes"].length;j++){
            let isContentNotMatched = todos[j]["content"] !== clientNotes["checkboxes"][j]["content"];
            let isChecked = todos[j]["checked"] !== clientNotes["checkboxes"][j]["isChecked"];
            if((isContentNotMatched && isChecked) || (isContentNotMatched || isChecked)){
                console.log('todos matched!');
                editedNotes.push(clientNotes["checkboxes"][j]);
            }
        }

        for (let k = 0; k < clientNotes["lists"].length; k++) {
            if(lists[k]["content"] !== clientNotes["lists"][k]["content"]){
                editedNotes.push(clientNotes["lists"][k]);
            }
        }

        for (let l = 0; l < clientNotes["paragraphs"].length; l++) {
            if(paras[l]["content"] !== clientNotes["paragraphs"][l]["content"]){
                editedNotes.push(clientNotes["lists"][l]);
            }
        }
    }

    console.log(editedNotes);
    return editedNotes;
}

async function refresh(){
    const content = Array.from(document.getElementsByClassName('content'));
    content.forEach((element)=>{
        element.remove();
    })

    const lines = Array.from(document.getElementsByTagName('hr'));
    lines.forEach((element)=>{
        element.remove();
    })

    const buttons = Array.from(document.getElementsByTagName('fw-button-group'));
    buttons.forEach((element)=>{
        element.remove();
    })
    
    await viewNotes();
}