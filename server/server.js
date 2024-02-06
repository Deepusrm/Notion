const payloadUtils = require('./payload_utilities');
const utils = require('./utilities');
exports = {
    createNote: async function (args) {
        const parentBlock = payloadUtils.parentBlock(args.data.ticket_id,args.data.product);
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

            await $db.update(`ticket-${args.data.ticket_id} (${args.data.product})`, 'set', { ticket }, { setIf: "exist" });
            console.log('DB updated successfully');
            renderData(null, 'Note created successfully!');
        } catch (error) {
            console.error(error);
            const customError = new Error(error.message);
            renderData(customError, null);
        }

    },

    appendNote: async function (args) {
        const pageId = await $db.get(`ticket-${args.data.ticket_id} (${args.data.product})`);
        const [childBlock, noteId] = payloadUtils.childBlock(args.data.noteTitle);

        payloadUtils.appendBlock(childBlock, args);

        try {
            const results = await $request.invokeTemplate('appendToExistingPage', {
                context: { page_id: pageId["ticket"]["PageId"] },
                body: JSON.stringify(childBlock)
            });
            const blockIds = utils.returnBlockIds(results);

            let note = "ticket.Notes."+noteId;
            await $db.update(`ticket-${args.data.ticket_id} (${args.data.product})`, 'set', { [note]: blockIds }, { setIf: "exist" });
            console.log('DB updated successfully');
            renderData(null, 'Note added successfully!');
        } catch (error) {
            console.error(error);
            const customError = new Error(error.message);
            renderData(customError, null);
        }

    },


    // deleteNote: async function (args) {
    //     console.log('delete function entered')
    //     try {
    //         const ticket = await $db.get(`ticket-${args.ticketId} (${args.product_name})`);
    //         console.log(ticket);
    //         const noteId = args.note_id;
    //         console.log(noteId)
    //         const noteBlocks = ticket.ticket["Notes"][noteId];

    //         console.log(noteBlocks);
    //         if (!Array.isArray(noteBlocks)) {
    //             renderData(null, "Note doesn't exist");
    //             return;
    //         }

    //         for (const block of noteBlocks) {
    //             await $request.invokeTemplate('deleteBlock', {
    //                 context: { block_id: block }
    //             })
    //         }
    //         console.log("Note deleted successfully!");
    //         const notePath = "ticket.Notes." + args.note_id;
    //         await $db.update(`ticket-${args.ticketId} (${args.product_name})`, "remove", [notePath], { setIf: "exist" });
    //         console.log("Note removed successfully from the db");
    //         renderData(null, 'Note deleted successfully!');
    //     } catch (error) {
    //         console.error(error);
    //         const customError = new Error(error.message, null);
    //         renderData(customError, null);
    //     }

    // },

    getNotes: async function (args) {
        try {
            const ticket = await $db.get(`ticket-${args.id} (${args.product_name})`);
            const pageId = ticket.ticket.PageId;

            const response = await $request.invokeTemplate('getPageBlocks', {
                context: { page_id: pageId }
            })

            const results = JSON.parse(response.response);

            const blockData = await utils.returnNoteData(results);
            renderData(null, blockData);

        } catch (error) {
            console.error(error);
            const customError = new Error(error.message);
            renderData(customError,null);
        }
    }
}