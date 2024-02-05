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
    console.log(ticket_id);
    let createNoteButton = document.getElementById('create');
    if (createNoteButton) {
        createNoteButton.addEventListener('click', createNote);
    }
})

async function createNote() {
    document.getElementById('loader').style.display = "block";

    const noteType = +document.getElementById('noteType').value;
    const noteTitle = document.getElementById('noteTitle').value.trim();
    const noteContent = document.getElementById('noteContent').value.trim();

    let note = { noteType, noteTitle, noteContent };

    let ticket = {
        "PageId": "",
        "Notes": {},
        "url": ""
    }

    let params = { ...note, ticket, ticket_id ,product}

    try {
        await client.db.set(`ticket-${ticket_id} (${product})`, { ticket }, { setIf: "not_exist" });
        const responseData = await client.request.invoke('createNote', { data: params });

        document.getElementById('loader').style.display = "none";
        resetForm();
        if (responseData.response === "Note created successfully!") {

            showToast(responseData.response, 'success');
            document.getElementById('loader').style.display = "none";
            resetForm();
            // await showNotifications(responseData.response,'success');
            console.log('Success ' + responseData.response);
        } else {
            // await showNotifications(responseData.response,'danger');
            showToast(responseData.response, 'error');
            document.getElementById('loader').style.display = "none";
            console.log('Sorry ' + responseData.response);
        }
    } catch (error) {
        if (error.message === 'The setIf conditional request failed') {
            try {
                const responseData = await client.request.invoke('appendNote', { data: params });
                document.getElementById('loader').style.display = "none";
                resetForm();
                if (responseData.response === 'Note added successfully!') {
                    showToast(responseData.response, 'success');
                    document.getElementById('loader').style.display = "none";
                    console.log('Success ' + responseData.response);
                } else {
                    showToast(responseData.response, 'error');
                    document.getElementById('loader').style.display = "none";
                    console.log('Sorry ' + responseData.response);
                }
            } catch (error) {
                console.error(error);
                showToast(error.message, 'error');
                document.getElementById('loader').style.display = "none";
            }

        } else {
            showToast(error.message, 'error');
            document.getElementById('loader').style.display = "none";
            console.error(error);
        }
    }

}