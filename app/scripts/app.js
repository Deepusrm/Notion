var client;

init();

let ticketData;
let ticket_id;
let product;

async function init() {
  client = await app.initialized();
  client.events.on('app.activated', async () => {
    try {
      product = await client.context.product;

      if (product === 'freshdesk') {
        ticketData = await client.data.get('ticket');
        console.log(ticketData);
        ticket_id = ticketData.ticket.id;
      }else if(product === 'freshservice'){
        ticketData = await client.data.get('ticket');
        console.log(ticketData);
        ticket_id = ticketData.ticket.display_id;
      }
      console.log('Ticket id is : ' + ticket_id);
      setupApp();
    } catch (error) {
      console.error(error);
    }
  });
}

async function setupApp() {
  console.log('Ticket id is : ' + ticket_id);
  const createButton = document.getElementById('createButton');
  // const editButton = document.getElementById('editButton');
  // const deleteButton = document.getElementById('deleteButton');
  const viewButton = document.getElementById('viewButton');

  createButton.addEventListener('click', async () => {
    await client.interface.trigger('showModal', {
      template: './createNoteModal.html'
    })
  })

  // deleteButton.addEventListener('click', deleteNote);

  viewButton.addEventListener('click', async () => {
    await client.interface.trigger('showModal', {
      template: './viewNoteModal.html'
    })
  })
}

// async function deleteNote() {
//   document.getElementById('cta_buttons').style.display = "none";
//   document.getElementById('deleteNoteField').style.display = "block";

//   document.getElementById('delete').addEventListener('click', async () => {
//     document.getElementById('loader').style.display = "block";
//     const noteId = document.getElementById('noteId').value;

//     try {
//       const response = await client.request.invoke('deleteNote', { ticketId: ticket_id, note_id: noteId ,product_name:product});
//       if (response.response === 'Note deleted successfully!') {
//         document.getElementById('loader').style.display = "none";
//         document.getElementById('cta_buttons').style.display = "block";
//         document.getElementById('deleteNoteField').style.display = "none";
//         await showNotifications(response.response, 'success');
//       } else {
//         document.getElementById('loader').style.display = "none";
//         await showNotifications(response.response, 'danger');
//       }
//     } catch (error) {
//       document.getElementById('loader').style.display = "none";
//       await showNotifications(error.message, 'danger');
//     }
//   })
// }