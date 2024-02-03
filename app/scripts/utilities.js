
async function showNotifications(message, type) {
    try {
        const client = await app.initialized();
        await client.interface.trigger('showNotify', {
            type: type,
            message: message
        })
    } catch (error) {
        console.log(error);
    }
}

function resetForm() {
    let form = document.querySelector('fw-form');
    let inputs = form.querySelectorAll('fw-input, fw-select, fw-textarea');

    inputs.forEach(input => {
        switch (input.tagName) {
            case 'FW-INPUT':
            case 'FW-TEXTAREA':
                input.value = '';
                break;
            case 'FW-SELECT':
                input.value = input.querySelector('fw-select-option').value;
                break;
        }
    })
}

async function showToast(message, type) {
    const toast = document.getElementById('modalToast');
    toast.content = message;
    toast.type = type;
    toast.trigger();
}
