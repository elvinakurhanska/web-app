const DEST_URL = 'http://localhost:3000'
const HIDDEN_PASSWORD = '***'
const INTERNAL_SERVER_ERROR = 500

const clearPasswordsTable = () => document.querySelector('#passwords-table').innerHTML = ''

const getTextBoxValue = textBoxId => document.querySelector(`#${textBoxId}`).value

const doPostRequest = async (url, object) => await fetch(url, {
    method: 'post',
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

        const td1 = document.createElement('td')
        td1.textContent = site

        const td2 = document.createElement('td')
        td2.textContent = HIDDEN_PASSWORD

        const td3 = document.createElement('td')

        const [showPasswordButton, changePasswordButton, deletePasswordButton] = createButtons(3)

        // changePasswordButton.addEventListener('click', () => alert('change clicked'))

        changePasswordButton.onclick = () => {
            showAddChangePasswordModal('Change Password', 'Change', site)
        }

        deletePasswordButton.addEventListener('click', () => alert('delete clicked'))

        showPasswordButton.onclick = () => {
            const password = td2.textContent === HIDDEN_PASSWORD ?
                passwords[site] :
                HIDDEN_PASSWORD

            const button = td2.childNodes[1]
            td2.textContent = password
            td2.appendChild(button)
        }

        appendChildren(td3, showPasswordButton, changePasswordButton, deletePasswordButton)
        appendChildren(tr, td1, td2, td3)
        tbody.appendChild(tr)
    }
}

const createDOMs = (DOMType, times) => {

}

const createButtons = times => {
    const buttons = []

    for (let i = 0; i < times; i++) {
        const button = document.createElement('button')
        buttons.push(button)
    }

    return buttons
}

const addNewPassword = async () => {
    const [site, password] = [getTextBoxValue('site'), getTextBoxValue('password')]

    if (!site || !password) {
        showErrorModal(`Enter 'site' and 'password' values`)
        return
    }

    const result = await doPostRequest(`${DEST_URL}/create-password`, {
        site,
        password
    }).catch(_ => showErrorModal('errorModal', 'Uploading new password was not successful'))

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

    // const siteInput = document.querySelector(`#site`)
    // const pswInput = document.querySelector(`#password`)
    // siteInput.value = ''
    // pswInput.value = ''
    
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

    if (previousSiteValue) {
        modal.querySelector('#site').value = previousSiteValue
    }

    addChangePasswordModal.show()
}
