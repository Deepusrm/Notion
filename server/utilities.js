exports.returnPageIdFromURL = async (url)=>{
    let urlPathArray = url.split('?');
    urlPathArray.pop();
    if(url.includes('-')){
        urlPathArray = (urlPathArray.join()).split('-');
    }else if(url.includes('/')){
        urlPathArray = (urlPathArray.join()).split('/');
    }
    const page_id = urlPathArray[urlPathArray.length - 1];

    return page_id;
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
            "id":"",
            "checked":false
        }
        if(element['type'] === 'heading_3'){
            note.type = 'heading_3';
            note.id = element.id;
            note.content = element['heading_3']['rich_text'][0]['text']['content'];
            note.checked = false;
            // console.log("done - heading")
            noteData.push(note);
        }else if(element['type'] === 'paragraph'){
                note.type = 'paragraph';
                note.id = element.id;
                note.content = element['paragraph']['rich_text'][0]['text']['content'];
                note.checked = false;
                // console.log("done - paragraph")
                noteData.push(note);
        }else if(element['type'] === 'to_do'){
            note.type = 'to_do';
            note.id = element.id;
            note.content = element['to_do']['rich_text'][0]['text']['content'];
            note.checked = element['to_do']['checked'];
            // console.log("done - todo")
            noteData.push(note);
        }else if(element['type'] === 'numbered_list_item'){
            note.type = 'numbered_list_item';
            note.id = element.id;
            note.content = element['numbered_list_item']['rich_text'][0]['text']['content'];
            note.checked = false;
            // console.log("done - list")
            noteData.push(note);
        }else if(element['type'] === 'divider'){
            note.type = 'divider';
            note.id = element.id;
            note.content = null;
            note.checked = false;
            // console.log("done - divider")
            noteData.push(note);
        }
    })

    return noteData;
}


exports.getObject = function(data){
    return {
        object:"block",
        type:data["type"],
        [data["type"]]:{
            "rich_text":[{
                text:{
                    content:data["content"]
                }
            }]
        }
    }
}

exports.getTodoObject = function(data){
    return {
        object:"block",
        type:data["type"],
        [data["type"]]:{
            rich_text:[{
                text:{
                    content:data["content"]
                }
            }],
            checked:data["isChecked"]
        }
    }
}
