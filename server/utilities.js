exports.generateNoteId = function generateNoteId() {
    let id = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 6; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    console.log(id);
    return id;
}

exports.returnPageIdOnCreatingNote = async function(bodyParam){
    const responseData = await $request.invokeTemplate("createPage",{
        context:{},
        body:JSON.stringify(bodyParam)
    })
    const responseJSON = JSON.parse(responseData.response);
    const pageId = responseJSON.id;
    const url = responseJSON.url;

    return [pageId,url];
}

exports.returnBlockIds = function(payload){
    const responseData = JSON.parse(payload.response);

    let blockIds = [];
    responseData["results"].forEach((element)=>{
        blockIds.push(element["id"]);
    })

    return blockIds;
}

exports.returnNoteData = async function(payload){
    const noteData = [];

    payload["results"].forEach((element) =>{
        const note = {
            "type":"",
            "content":"",
            "id":""
        }
        if(element['type'] === 'heading_3'){
            note.type = 'heading_3';
            note.id = element.id;
            note.content = element['heading_3']['rich_text'][0]['text']['content'];

            noteData.push(note);
        }else if(element['type'] === 'paragraph'){
            if(!element['paragraph']['rich_text'][0]['text']['content'].startsWith('note id :')){
                note.type = 'paragraph';
                note.id = element.id;
                note.content = element['paragraph']['rich_text'][0]['text']['content'];

                noteData.push(note);
            }
        }else if(element['type'] === 'to_do'){
            note.type = 'to_do';
            note.id = element.id;
            note.content = element['to_do']['rich_text'][0]['text']['content'];

            noteData.push(note);
        }else if(element['type'] === 'numbered_list_item'){
            note.type = 'numbered_list_item';
            note.id = element.id;
            note.content = element['numbered_list_item']['rich_text'][0]['text']['content'];

            noteData.push(note);
        }else if(element['type'] === 'divider'){
            note.type = 'divider';
            note.id = element.id;
            note.content = null;

            noteData.push(note);
        }
    })

    return noteData;
}
