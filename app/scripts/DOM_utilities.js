function appendNoteContent(payload){
    const noteContainer = document.getElementById('noteDetails');
    payload.forEach((element) => {
        let content = document.createElement('div');
        content.className = "content";
        content.setAttribute('data-id',element.id)
        let button = `<fw-button color="secondary" size="icon" class = "deleteButton">
            <fw-icon size="16" name="delete" ></fw-icon>
          </fw-button>`;
        if (element.type === 'heading_3') {
            const heading_3 = `<div class="fw-type-h3">${element.content}</div><br>`;
            content.insertAdjacentHTML('beforeend', heading_3);
        } else if (element.type === 'paragraph') {
            const paragraph = `<p class="fw-text-normal">${element.content}</p>`;
            content.insertAdjacentHTML('beforeend', paragraph);
            content.insertAdjacentHTML('beforeend', button);
        } else if (element.type === 'to_do') {
            let todo;
            if(element.checked === true){
                todo = `<fw-checkbox checked="true" disabled="true"><span class="todo">${element.content}</span></fw-checkbox><br><br>`;
            }else{
                todo = `<fw-checkbox checked="false" disabled="true"><span class="todo">${element.content}</span></fw-checkbox><br><br>`;
            }
            content.insertAdjacentHTML('beforeend', todo);
            content.insertAdjacentHTML('beforeend', button);
        } else if (element.type === 'numbered_list_item') {
            const list = `<li>${element.content}</li>`
            content.insertAdjacentHTML('beforeend', list);
            content.insertAdjacentHTML('beforeend', button);
        } else if (element.type === 'divider') {
            const horizontal_line = document.createElement('hr');
            noteContainer.appendChild(horizontal_line);
        }

        noteContainer.appendChild(content);
    });

    const editButton = `<fw-button color="primary" id="edit">Edit</fw-button>`;
    noteContainer.insertAdjacentHTML('beforeend',editButton);
}