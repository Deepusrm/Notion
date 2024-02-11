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
  const viewButton = document.getElementById('viewButton');

  createButton.addEventListener('click', async () => {
    await client.interface.trigger('showModal', {
      template: './createNoteModal.html'
    })
  })

  viewButton.addEventListener('click', async () => {
    await client.interface.trigger('showModal', {
      template: './viewNoteModal.html'
    })
  })
}