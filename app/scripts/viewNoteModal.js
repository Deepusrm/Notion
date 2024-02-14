let product;
let noteData;
let client;
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
        console.error(error);
        // const errorMessage = JSON.parse(error.response).message;
        document.getElementById('loader').style.display = 'none';
        if (error.message === 'Record not found'){
            showToast("No notes for this ticket, please create a new one", 'error');
            setTimeout(()=>{
                client.instance.close();
            },3000);
            throw error;
        }
    }
    console.log(noteData);

    if (noteData.response.length === 0) {
        document.getElementById('loader').style.display = 'none';
        showToast('Page is empty! please add a note!', 'error');
        setTimeout(()=>{
            client.instance.close();
        },3000);
    } else {
        appendNoteContent(noteData.response);
    }

    document.getElementById('loader').style.display = 'none';
    console.log('Note uploaded successfully');

    document.getElementById('edit').addEventListener('click', enableFields);

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
    buttons.forEach(async (button) => {
        button.addEventListener('click', async (event) => {
            const blockId = event.currentTarget.parentNode.getAttribute('data-id');
            if (blockId) {
                notes = notes.filter((id) => id !== blockId);
                console.log(blockId);
                console.log(notes);
                const response = await client.request.invoke('deleteNote', { block_id: blockId, blockIds: notes, ticketId: `ticket-${ticket_id} (${product})` });
                if (response.response === 'Note deleted successfully!') {
                    const parentDiv = button.parentElement;
                    parentDiv.classList.add('slide-up-fade-out');
                    setTimeout(() => {
                        parentDiv.remove();
                    }, 300);
                }
            }
            noteData = await client.request.invoke('getNotes', { id: ticket_id, product_name: product });
            console.log(noteData);
        })
    })

}

async function handleEdit() {
    document.getElementById('loader').style.display = "block";
    let editedNotes = [];
    const editableElements = Array.from(document.querySelectorAll('[contenteditable=true]'));

    const headings = [];
    editableElements.filter((element) => getClass(element) === 'fw-type-h3').forEach((element) => {
        headings.push({
            "type": "heading_3",
            "content": element.innerHTML,
            "isChecked": false,
            "blockId": element.parentNode.getAttribute('data-id')
        })
    })

    const checkboxes = [];
    editableElements.filter((element) => getClass(element) === 'todo').forEach((element) => {
        const isChecked = element.parentElement.checked;
        console.log(isChecked);
        checkboxes.push({
            "type": "to_do",
            "content": element.innerHTML,
            "isChecked": isChecked,
            "blockId": (element.parentNode).parentNode.getAttribute('data-id')
        })
    })

    const lists = [];
    editableElements.filter((element) => element.tagName.toLowerCase() === 'li').forEach((element) => {
        lists.push({
            "type": "numbered_list_item",
            "content": element.innerHTML,
            "isChecked": false,
            "blockId": element.parentNode.getAttribute('data-id')
        })
    })

    const paragraphs = [];
    editableElements.filter((element) => element.tagName.toLowerCase() === 'p').forEach((element) => {
        paragraphs.push({
            "type": "paragraph",
            "content": element.innerHTML,
            "isChecked": false,
            "blockId": element.parentNode.getAttribute('data-id')
        })
    })

    const editedElements = { "headings": headings, "paragraphs": paragraphs, "checkboxes": checkboxes, "lists": lists };
    const notes = noteData.response.filter((element) => element.type !== 'divider');

    editedNotes = await getEditedNotes(notes, editedElements);

    if (editedNotes) {
        editedNotes.forEach(async (element) => {
            try {
                const response = await client.request.invoke('updateNote', { element });
                console.log(response.response);
            } catch (error) {
                console.error(error);
            }
        })
        document.getElementById('loader').style.display = "none";
        showToast('Note updated successfully!', 'success');
        await refresh();
        setTimeout(() => {
            client.instance.close();
        }, 2000);
    }
}
