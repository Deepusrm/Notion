var client;

init();

let ticketData;
let ticket_id;

async function init() {
  client = await app.initialized();
  client.events.on('app.activated', async () => {
    try {
      ticketData = await client.data.get('ticket');
      ticket_id = ticketData.ticket.id;
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

  createButton.addEventListener('click',async()=>{
    await client.interface.trigger('showModal',{
      template:'./createNoteModal.html'
    })
  })

  viewButton.addEventListener('click',async()=>{
    await client.interface.trigger('showModal',{
      template:'./viewModal.html'
    })
  })
}
