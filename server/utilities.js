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
