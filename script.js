const DEST_URL = 'http://localhost:3000'
const HIDDEN_PASSWORD = '***'
const INTERNAL_SERVER_ERROR = 500

const clearPasswordsTable = () => document.querySelector('#passwords-table').innerHTML = ''

const getTextBoxValue = textBoxId => document.querySelector(`#${textBoxId}`).value

const post = async (url, object) => performRequest('post', url, object)
const put = async (url, object) => performRequest('put', url, object)
const deleteReq = async (url, object) => performRequest('delete', url, object)

const performRequest = async (method, url, object) => await fetch(url, {
    method,
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
})

const appendChildren = (element, ...children) => children.forEach(child => element.appendChild(child))

const getPasswords = async () => {
    clearPasswordsTable()

    const response = await fetch(`${DEST_URL}/get-passwords`)
    const passwords = await response.json()

    const tbody = document.querySelector('#passwords-table')

    for (const site in passwords) {
        const tr = document.createElement('tr')

        const [td1, td2, td3] = createDOMs('td', 3)

        td1.textContent = site
        td2.textContent = HIDDEN_PASSWORD

        const [showPasswordIcon, changePasswordIcon, deletePasswordIcon] = createDOMs('i', 3)

        showPasswordIcon.className = 'bi bi-eye'
        changePasswordIcon.className = 'bi bi-pencil-square'
        deletePasswordIcon.className = 'bi bi-trash'

        showPasswordIcon.onclick = () => {
            const password = td2.textContent === HIDDEN_PASSWORD ?
                passwords[site] :
                HIDDEN_PASSWORD

            const button = td2.childNodes[1]
            td2.textContent = password
            td2.appendChild(button)
        }

        changePasswordIcon.onclick = () => showAddChangePasswordModal('Change Password', 'Change', site)

        deletePasswordIcon.onclick = async () => {
            const modal = document.querySelector('#confirmation-dialog-modal')
            const confirmationDialogModal = new bootstrap.Modal(modal)

            // here we take button from confirmation modal window
            // and attaching 'onlick' to it

            const confirmationDialogButton = modal.querySelector('#confirmation-dialog-button') //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Attention!!!!!!!!!!!!!!!!!!!!!
            confirmationDialogButton.onclick = () => deletePassword(site)

            confirmationDialogModal.show()
        }

        appendChildren(td3, showPasswordIcon, changePasswordIcon, deletePasswordIcon)
        appendChildren(tr, td1, td2, td3)
        tbody.appendChild(tr)
    }
}

const createDOMs = (DOMType, times) => {
    const elements = []

    for (let i = 0; i < times; i++) {
        const element = document.createElement(DOMType)
        elements.push(element)
    }

    return elements
}

const addChangePassword = async () => {
    // refactor 'getTextBoxValue' function (into 'getTextBoxValues')
    // const [site, password] = getTextBoxValues('site', 'password')
    const [site, password] = [getTextBoxValue('site'), getTextBoxValue('password')]

    if (!site || !password) {
        showErrorModal(`Enter 'site' and 'password' values`)
        return
    }

    let result //rewrite into ternary
    if (document.querySelector('#site').disabled) {
        result = await put(`${DEST_URL}/change-password`, {
            site,
            password
        }).catch(_ => showErrorModal('Changing the password was not successful'))
    } else {
        result = await post(`${DEST_URL}/create-password`, {
            site,
            password
        }).catch(_ => showErrorModal('Uploading new password was not successful'))
    }

    // refactor into switch (and then reuse it in other requests stuff)
    if (result.status === INTERNAL_SERVER_ERROR) {
        showErrorModal(`Password for this site already exists.\nPlease use 'change password' button`)
        return
    }
    if (!result.ok) {
        showErrorModal('Request was not successfull')
        return
    }

    const addChangePasswordModal = document.querySelector(`#add-change-password-modal`)
    const closeButton = addChangePasswordModal.querySelector('.btn-close')
    
    clearAddPasswordForm()

    closeButton.click()
    
    await getPasswords()
}

const clearInput = inputID => document.querySelector(inputID).value = ''
//istead of line 82,83,84,85

const clearAddPasswordForm = () => {
    clearInput(`#site`)
    clearInput(`#password`)
}

const closeAddPasswordModal = () => clearAddPasswordForm()

const showErrorModal = modalText => {
    const modal = document.querySelector('#error-modal')
    const errorModal = new bootstrap.Modal(modal)
    const modalBody = errorModal.querySelector('.modal-body')
    modalBody.innerHTML = ''

    for (const value of modalText.split('\n')) {
        const modalDiv = document.createElement('div')
        modalDiv.textContent = value
        modalBody.appendChild(modalDiv)
    }

    errorModal.show()
}

const showAddChangePasswordModal = (headerTitle, addChangePasswordButtonCaption, previousSiteValue = '') => {
    const modal = document.querySelector('#add-change-password-modal')
    const addChangePasswordModal = new bootstrap.Modal(modal)

    modal.querySelector('.modal-title').textContent = headerTitle
    modal.querySelector('#addChangePasswordButton').textContent = addChangePasswordButtonCaption

    const siteInput = modal.querySelector('#site')
    if (previousSiteValue) {
        siteInput.value = previousSiteValue
        siteInput.disabled = true
    } else {
        siteInput.disabled = false
    }

    addChangePasswordModal.show()
}

const deletePassword = async site => {
    deleteReq(`${DEST_URL}/delete-password`, {
        site
    })

    //for all modals we need to create a function for 3 modal window steps(BELOW), to minimize code/reuse the code
    // - receive modal
    // - receive close button 
    // - receive click 

    const confirmationDialogModal = document.querySelector(`#add-change-password-modal`)
    const closeButton = confirmationDialogModal.querySelector('.btn-close')
    closeButton.click()

    await getPasswords()
}
