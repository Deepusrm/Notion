let product;
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
})

async function viewNotes() {
    document.getElementById('loader').style.display = 'block';
    const ticketHeading = document.getElementById('heading_2');
    ticketHeading.innerHTML = `Ticket - ${ticket_id}`;
    let noteData;
    try {
        noteData = await client.request.invoke('getNotes', { id: ticket_id , product_name: product});
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
        if (element.type === 'heading_3') {
            const heading_3 = `<div class="fw-type-h3">${element.content}</div><br>`;
            noteContainer.insertAdjacentHTML('beforeend', heading_3);
        } else if (element.type === 'paragraph') {
            const paragraph = `<p class="fw-text-normal fw-text-grey-900">${element.content}</p>`;
            noteContainer.insertAdjacentHTML('beforeend', paragraph);
        } else if (element.type === 'to_do') {
            const todo = `<fw-checkbox>${element.content}</fw-checkbox> <br><br>`;
            noteContainer.insertAdjacentHTML('beforeend', todo);
        } else if (element.type === 'numbered_list_item') {
            const list = `<li>${element.content}</li>`
            noteContainer.insertAdjacentHTML('beforeend', list);
        } else if (element.type === 'divider') {
            const horizontal_line = document.createElement('hr');
            noteContainer.appendChild(horizontal_line);
        }
    });

    document.getElementById('loader').style.display = 'none';
    console.log('Note uploaded successfully');
}