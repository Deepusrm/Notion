let product;
let noteData;
document.addEventListener('DOMContentLoaded', async () => {
    client = await app.initialized();
    product = await client.context.product;

    if (product === 'freshdesk') {
        ticketData = await client.data.get('ticket');
        console.log(ticketData);
        ticket_id = ticketData.ticket.id;
    } else if (product === 'freshservice') {
        ticketData = await client.data.get('ticket');
        console.log(ticketData);
        ticket_id = ticketData.ticket.display_id;
    }

    await viewNotes();
    // deleteNote();
})

async function viewNotes() {
    document.getElementById('loader').style.display = 'block';
    const ticketHeading = document.getElementById('heading_2');
    ticketHeading.innerHTML = `Ticket - ${ticket_id}`;
    try {
        noteData = await client.request.invoke('getNotes', { id: ticket_id, product_name: product });
    } catch (error) {
        document.getElementById('loader').style.display = 'none';
        if (error.message === 'Record not found')
            showToast("No notes for this ticket, please create a new one", 'error');
        throw error;
    }
    const noteContainer = document.getElementById('noteDetails');
    console.log(noteData.response);

    if (!noteData.response) {
        document.getElementById('loader').style.display = 'none';
        showToast('Page is empty! please add a note!', 'error');
    }
    noteData.response.forEach((element) => {
        let content = document.createElement('div');
        content.className = "content";
        content.setAttribute('data-id',element.id)
        let button = `<fw-button color="secondary" size="icon" class = "deleteButton">
            <fw-icon size="16" name="delete" ></fw-icon>
          </fw-button>`;
        if (element.type === 'heading_3') {
            const heading_3 = `<div class="fw-type-h3">${element.content}</div><br>`;
            content.insertAdjacentHTML('beforeend', heading_3);
        } else if (element.type === 'paragraph') {
            const paragraph = `<p class="fw-text-normal">${element.content}</p>`;
            content.insertAdjacentHTML('beforeend', paragraph);
            content.insertAdjacentHTML('beforeend', button);
        } else if (element.type === 'to_do') {
            const todo = `<fw-checkbox disabled="true"><span class="todo">${element.content}</span></fw-checkbox><br><br>`;
            content.insertAdjacentHTML('beforeend', todo);
            content.insertAdjacentHTML('beforeend', button);
        } else if (element.type === 'numbered_list_item') {
            const list = `<li>${element.content}</li>`
            content.insertAdjacentHTML('beforeend', list);
            content.insertAdjacentHTML('beforeend', button);
        } else if (element.type === 'divider') {
            const horizontal_line = document.createElement('hr');
            noteContainer.appendChild(horizontal_line);
        }

        noteContainer.appendChild(content);
    });

    const editButton = `<fw-button color="primary" id="edit">Edit</fw-button>`;
    noteContainer.insertAdjacentHTML('beforeend',editButton);

    document.getElementById('loader').style.display = 'none';
    console.log('Note uploaded successfully');

    document.getElementById('edit').addEventListener('click',enableFields);

    deleteNote();
}
let ticketData;
let ticket_id;
async function deleteNote() {

    if (product === 'freshdesk') {
        ticketData = await client.data.get('ticket');
        console.log(ticketData);
        ticket_id = ticketData.ticket.id;
    } else if (product === 'freshservice') {
        ticketData = await client.data.get('ticket');
        console.log(ticketData);
        ticket_id = ticketData.ticket.display_id;
    }
    console.log("delete function entered");
    const buttons = document.querySelectorAll('.deleteButton');

    const ticket = await client.db.get(`ticket-${ticket_id} (${product})`);
    let notes = ticket.ticket.Notes;
    console.log(notes);
    buttons.forEach((button) => {
        button.addEventListener('click', async (event)=> {
            const blockId = event.currentTarget.parentNode.getAttribute('data-id');
            if(blockId){
                notes = notes.filter((id) => id!== blockId);
                console.log(blockId);
                console.log(notes);
                const response = await client.request.invoke('deleteNote',{block_id : blockId , blockIds : notes , ticketId:`ticket-${ticket_id} (${product})`});
                if(response.response === 'Note deleted successfully!'){
                    const parentDiv = button.parentElement;
                    parentDiv.classList.add('slide-up-fade-out');
                    setTimeout(() =>{
                        parentDiv.remove();
                    },300);
                }
            }
        })
    })
}

const updateButton = document.getElementById('update');
updateButton.addEventListener('click', async ()=>{
    const editableElements = Array.from(document.querySelectorAll('[contenteditable=true]'));

    const headings = [];
    editableElements.filter((element) => getClass(element) === 'fw-type-h3').forEach((element)=>{
        headings.push({
            "type":"heading_3",
            "content":element.innerHTML,
            "isChecked":false,
            "blockId":element.parentNode.getAttribute('data-id')
        })
    })

    const checkboxes = [];
    editableElements.filter((element) => getClass(element) === 'todo').forEach((element) =>{
        const isChecked = element.parentElement.checked;
        checkboxes.push({
            "type":"to_do",
            "content":element.innerHTML,
            "isChecked":isChecked,
            "blockId":(element.parentNode).parentNode.getAttribute('data-id')
        })
    })

    const lists = [];
    editableElements.filter((element) => element.tagName.toLowerCase() === 'li').forEach((element) =>{
        lists.push({
            "type":"numbered_list_item",
            "content":element.innerHTML,
            "isChecked":false,
            "blockId":element.parentNode.getAttribute('data-id')
        })
    })

    const paragraphs = [];
    editableElements.filter((element) => element.tagName.toLowerCase() === 'p').forEach((element) =>{
        paragraphs.push({
            "type":"paragraph",
            "content":element.innerHTML,
            "isChecked":false,
            "blockId":element.parentNode.getAttribute('data-id')
        })
    })

    const editedElements = {"headings":headings,"paragraphs":paragraphs,"checkboxes":checkboxes,"lists":lists};
    const notes = noteData.filter((element) => element.type !== 'divider');

    await updateNotes(notes,editedElements);
});