const payloadUtils = require('./payload_utilities');
const utils = require('./utilities');
exports = {
    createNote: async function (args) {
        const parentBlock = payloadUtils.parentBlock(args.data.ticket_id);
        const [childBlock, noteId] = payloadUtils.childBlock(args.data.noteTitle);
        const body = { ...parentBlock, ...childBlock };
        payloadUtils.appendBlock(body, args);

        let pageId = null;
        let url = null;

        try {
            [pageId, url] = await utils.returnPageIdOnCreatingNote(body);
            console.log('Note created successfully');
        } catch (error) {
            console.error(error);
        }

        try {
            const results = await $request.invokeTemplate('getPageBlocks', {
                context: { page_id: pageId }
            })
            console.log(pageId);
            const blockIds = utils.returnBlockIds(results);

            const ticket = args.data.ticket;
            ticket.PageId = pageId;
            ticket.Notes[noteId] = blockIds;
            ticket.url = url;

            await $db.update(`ticket-${args.data.ticket_id}`, 'set', { ticket }, { setIf: "exist" });
            console.log('DB updated successfully');
            renderData(null, 'Note created successfully!');
        } catch (error) {
            console.error(error);
            const customError = new Error(error.message);
            renderData(customError, null);
        }

    },

    appendNote: async function (args) {
        const pageId = await $db.get(`ticket-${args.data.ticket_id}`);
        const [childBlock,noteId] = payloadUtils.childBlock(args.data.noteTitle);

        payloadUtils.appendBlock(childBlock,args);

        try {
            const results = await $request.invokeTemplate('appendToExistingPage',{
                context:{page_id:pageId["ticket"]["PageId"]},
                body:JSON.stringify(childBlock)
            });
            const blockIds = utils.returnBlockIds(results);

            let note = `ticket.Notes[${noteId}]`;
            await $db.update(`ticket-${args.data.ticket_id}`,'set',{[note]:blockIds},{setIf:"exist"});
            console.log('DB updated successfully');
            renderData(null,'Note added successfully!');
        } catch (error) {
            console.error(error);
            const customError = new Error(error.message);
            renderData(customError,null);
        }

    },
    deleteNote: async function () {
        console.log('Vanakkam da mapla..blore lendhu')
        renderData(null, 'Vanakkam da mapla..blore lendhu');
    }
}