const utils = require('./utilities');
exports.parentBlock = function (id,product) {
    const parentJSON = {
        parent: {
            type: "database_id",
            database_id: "<%=iparam.notion_database%>"
        },
        properties: {
            Name: {
                title: [{
                    type: "text",
                    text: {
                        content: "TICKET -" + id + `(${product})`
                    }
                }]
            }
        }
    }

    return parentJSON;
}

exports.childBlock = function (title) {
    // let noteId = utils.generateNoteId();

    const childJSON = {
        children: [
        {
            object: "block",
            type: "heading_3",
            heading_3: {
                rich_text: [{
                    text: {
                        content: title
                    }
                }]
            }
        }]
    }

    return childJSON;
}

exports.appendBlock = function (body, args) {
    const noteData = args.data;
    console.log("content " + JSON.stringify(noteData.noteContent));
    if (noteData.noteType === 1) {
        const array = noteData.noteContent.split("\n");
        array.forEach(element => {
            body["children"].push({
                object: "block",
                type: "to_do",
                to_do: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: element
                            }
                        }
                    ],
                    checked: false,
                    color: "default"
                }
            })
        });
    } else if (noteData.noteType === 2) {
        if (noteData.noteContent.includes("\n")) {
            const array = noteData.noteContent.split("\n");
            array.forEach(element => {
                body["children"].push({
                    object: "block",
                    type: "numbered_list_item",
                    numbered_list_item: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: element
                                }
                            }
                        ]
                    }
                })
            });
        } else {
            body["children"].push({
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [{
                        text: {
                            content: noteData.noteContent
                        }
                    }]
                }
            })
        }
    }
    body["children"].push({
        object: "block",
        type: "divider",
        divider: {}
    })
}