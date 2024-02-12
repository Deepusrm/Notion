const payloadUtils = require('./payload_utilities');
const utils = require('./utilities');
exports = {
    createNote: async function (args) {
        const parentBlock = payloadUtils.parentBlock(args.data.ticket_id, args.data.product);
        const childBlock = payloadUtils.childBlock(args.data.noteTitle);
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
            ticket.Notes = ticket.Notes.concat(blockIds);
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
        const childBlock = payloadUtils.childBlock(args.data.noteTitle);

        payloadUtils.appendBlock(childBlock, args);

        try {
            const results = await $request.invokeTemplate('appendToExistingPage', {
                context: { page_id: pageId["ticket"]["PageId"] },
                body: JSON.stringify(childBlock)
            });
            const blockIds = utils.returnBlockIds(results);

            let note = "ticket.Notes.";
            let notes = pageId["ticket"]["Notes"];
            notes = notes.concat(blockIds);
            await $db.update(`ticket-${args.data.ticket_id} (${args.data.product})`, 'set', { [note]: notes }, { setIf: "exist" });
            console.log('DB updated successfully');
            renderData(null, 'Note added successfully!');
        } catch (error) {
            console.error(error);
            const customError = new Error(error.message);
            renderData(customError, null);
        }

    },
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
            renderData(error, null);
        }
    },

    deleteNote: async function (args) {
        try {
            await $request.invokeTemplate('deleteBlock', {
                context: { block_id: args.block_id }
            })

            let path = "ticket.Notes";
            $db.update(args.ticketId, "set", { [path]: args.blockIds }, { setIf: "exist" });
            renderData(null, "Note deleted successfully!");
        } catch (error) {
            renderData(error, null);
        }
    },

    updateNote: async function (data) {
        // const dataToBeUpdated = data.editedNotes;

        let bodyJSON;
        try {
            if (data.element["type"] === 'to_do') {
                bodyJSON = utils.getTodoObject(data.element);
                await $request.invokeTemplate('updateBlock', {
                    context: { block_id: data.element["blockId"] },
                    body: JSON.stringify(bodyJSON)
                })
            } else {
                bodyJSON = utils.getObject(data.element);
                await $request.invokeTemplate('updateBlock', {
                    context: { block_id: data.element["blockId"] },
                    body: JSON.stringify(bodyJSON)
                })
            }
            renderData(null,"Note updated successfully");
        } catch (error) {
            renderData(error,null);
        }
    }
}