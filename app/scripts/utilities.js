
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
async function updateNotes(serverNotesResponse,clientNotes){
    const headings = serverNotesResponse.filter((element) => element.type === 'heading_3');
    const todos = serverNotesResponse.filter((element) => element.type === 'to_do');
    const paras = serverNotesResponse.filter((element) => element.type === 'paragraph');
    const lists = serverNotesResponse.filter((element) => element.type === 'numbered_list_item');

    let response;
    if(serverNotesResponse.length === clientNotes.length){
        for(let i=0 ;i<clientNotes["headings"].length;i++){
            if(headings[i]["content"] !== clientNotes["headings"][i]["content"]){
                try {
                    response = await client.request.invoke('updateNote',{data:clientNotes["headings"][i]});
                    console.log("Success : heading - "+i);  
                } catch (error) {
                    console.error(error);
                }
            }
        }

        for(let j=0; j<clientNotes["checkboxes"];j++){
            try {
                response = await client.request.invoke('updateNote',{data:clientNotes["checkboxes"][j]});
                console.log("Success : to do - "+j);
            } catch (error) {
                console.error(error);
            }
        }
    }
}