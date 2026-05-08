const btnNewUser = document.getElementById("btnNewUser")
const tableBody = document.getElementById("usuariosTableBody")
const formUser = document.getElementById("formUser")
const alertContainer = document.getElementById("alert-container")
const alertApi = document.getElementById("alert-api")
const userTable = document.querySelectorAll(".user-table")
const inputSearch = document.getElementById("userSearch")

const modalUser= document.getElementById("modalUser")
const modalUserBS = new bootstrap.Modal(modalUser)

btnNewUser.onclick = async () =>{
    editMode = false
    currentUser = 0
    formUser.reset()
    modalUser.querySelector(".modal-title").innerText = "Gestion de Usuario"
    formUser.querySelector("#userPassword").required = true
    formUser.querySelector("#confirmPassword").required = true
    await loadRolesSelect()
    modalUserBS.show()
}

const modalDelete = document.getElementById("modalDelete")
const modalDeleteBS = new bootstrap.Modal(modalDelete)
const btnDeleteModal = modalDelete.querySelector("#btnModalDelete")

const modalDetail = document.getElementById("modalDetail")
const modalDetailBS = new bootstrap.Modal(modalDetail)

let editMode = false
let currentUser = 0

const formatDate = (date) => {
    if (!date) return "No registrada"

    return new Date(date).toLocaleDateString()
}


//Funcion para obtener los usuarios de la bd
const loadUsers = async () => {

    try {
        checkSession()
        const response = await fetch('/users/all')
        if (response.status === 401) {
            window.location.href = '/index.html'
            return
        }

        const users = await response.json()
        loadTableUsers(users)

    } catch (error) {
        showToast(error || "Error al cargar lista de usuarios", "error")
    }
}

window.loadUsers = loadUsers


//Funcion para cargar los usuarios obtenidos por loadUsers() y los carga en la tabla 
const loadTableUsers = (users) => {

    tableBody.innerHTML = ''

    if (users.length == 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">No se encontraron resultados</td>
            </tr>`
        return
    }

    users.forEach(user => {
        tableBody.innerHTML += `
            <tr class="user-table" onclick="detailUser(${user.id})">
                <td class="fw-bold text-dark">${user.nombre}</td>
                <td>${user.email}</td>
                <td>${user.dni}</td>
                <td>
                    <span class="badge bg-secondary">
                        ${user.rol_nombre}
                    </span>
                </td>
                <td>
                    <span class="badge ${user.activo ? 'bg-success' : 'bg-secondary'}">
                        ${user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${formatDate(user.fecha_alta)}</td>
                <td class="text-end">
                        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); editUser(${user.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); deleteUser(${user.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `
    })

}

const loadRolesSelect = async (currentRoleId = null) => {

    const response = await fetch('/roles/all')
    const roles = await response.json()
    const select = document.getElementById("userRol")

    select.innerHTML = '<option value="" selected disabled>Seleccionar</option>'

    roles.forEach(rol => {
        const isActive = rol.activo === 1
        const isCurrentRole = currentRoleId && Number(rol.id) === Number(currentRoleId)

        if (!isActive && !isCurrentRole) return

        const option = document.createElement("option")
        option.value = rol.id
        option.textContent = isActive ? rol.nombre : `${rol.nombre} (inactivo)`

        select.appendChild(option)
    })

    if (currentRoleId) {
        select.value = currentRoleId
    }
}



//Input para buscar usuarios con like
inputSearch.oninput = async ()=>{

    checkSession()

    const filter = userSearch.value.trim()
    
    if (filter == "") {
        loadUsers()
        return
    }

    try {
        const response = await fetch(`/users/search?filter=${encodeURIComponent(filter)}`)
        const users = await response.json()

        if (response.ok) {
            loadTableUsers(users)
        }

    } catch (error) {
        console.error("Error en el buscador:", error)
    }

}

//Onsubmit del formulario de creacion de usuarios
formUser.onsubmit = async (e) =>{

    e.preventDefault()
    checkSession()

    const name = formUser.querySelector("#userName").value.trim()
    const dni = formUser.querySelector("#userDni").value.trim()
    const email = formUser.querySelector("#userEmail").value.trim()
    const rol = formUser.querySelector("#userRol").value.trim()
    const date = formUser.querySelector("#userBirth").value.trim()
    const adress = formUser.querySelector("#userAddress").value.trim()
    const cp = formUser.querySelector("#userZip").value.trim()
    const pass = formUser.querySelector("#userPassword").value.trim()
    const confirmPass = formUser.querySelector("#confirmPassword").value.trim()
    const obs = formUser.querySelector("#userObs").value.trim()
    const active = formUser.querySelector("#userStatus").checked


    if(!name || !dni || !email || !rol ){
        showToast("Debe completar los campos requeridos.", "error")
        return
    }

    if (!editMode && !pass) {
        showToast("Debe completar los campos requeridos.", "error")
        return
    }

    if(!editMode && pass.length < 8){
        showToast("La contraseña debe tener al menos 8 caracteres.", "error")
        return
    }

    if(pass != confirmPass){
        showToast("Las contraseñas deben coincidir.", "error")
        return
    }

    const url = editMode ? `/users/update/${currentUser}` : '/users/new'
    const method = editMode ? 'PUT' : 'POST'

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, dni, email, rol, date, adress, cp, pass, confirmPass, obs, active})
        })

        const data = await response.json()

        if (response.ok) {

            modalUserBS.hide()
            loadUsers()
            loadStats()
            formUser.reset()
            showToast(editMode ? "Usuario actualizado correctamente" : "Usuario creado correctamente")
            editMode = false

        } else {
            showToast(data.error || "Error al crear usuario", "error")
        }

    } catch (error) {
        console.error('Error:', error)
    }


}


//Evento que muestra el modal de detalle de usuario
window.detailUser = async (id) => {

    checkSession()

    try {
        const response = await fetch(`/users/id/${id}`)
        const user = await response.json()

        if (response.ok) {

            document.getElementById('detailName').textContent = user.nombre
            document.getElementById('detailDni').textContent = user.dni 
            document.getElementById('detailBirth').textContent = formatDate(user.fecha_nacimiento)
            document.getElementById('detailEmail').textContent = user.email
            document.getElementById('detailCreatedAt').textContent = formatDate(user.fecha_alta)
            document.getElementById('detailRol').textContent = user.rol_nombre
            const detailStatus = document.getElementById('detailStatus')
            detailStatus.textContent = user.activo === 1 ? 'Activo' : 'Inactivo'
            detailStatus.className = `badge ${user.activo === 1 ? 'bg-success' : 'bg-secondary'}`
            const domicilio = user.domicilio || "No registrado"
            const cp = user.codigo_postal || "No registrado"
            document.getElementById('detailLocation').textContent = `${domicilio} - CP: ${cp}`
            document.getElementById('detailObs').textContent = user.observacion || "Sin notas"
            modalDetailBS.show()
        }

    } catch (error) {
        console.error("Error al obtener detalle de usuario:", error)
        showToast("Error al cargar la información del usuario", "error")
    }
}

//Evento que abre el modal de edicion de usuario
window.editUser = async (id) => {

    checkSession()
    editMode = true
    currentUser = id

    try {
        const response = await fetch(`/users/id/${id}`)
        const user = await response.json()

        if (response.ok) {

            await loadRolesSelect(user.rol_id)

            formUser.querySelector("#userName").value = user.nombre
            formUser.querySelector("#userDni").value = user.dni
            formUser.querySelector("#userEmail").value = user.email
            formUser.querySelector("#userRol").value = user.rol_id
            formUser.querySelector("#userBirth").value = user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : ''
            formUser.querySelector("#userAddress").value = user.domicilio || ""
            formUser.querySelector("#userZip").value = user.codigo_postal || ""
            formUser.querySelector("#userObs").value = user.observacion || ""
            formUser.querySelector("#userStatus").checked = user.activo === 1

            formUser.querySelector("#userPassword").required = false
            formUser.querySelector("#confirmPassword").required = false
            formUser.querySelector("#userPassword").value = ""
            formUser.querySelector("#confirmPassword").value = ""

            modalUser.querySelector(".modal-title").innerText = "Editar Usuario"
            
            modalUserBS.show()
        }

    } catch (error) {
        showToast("Error al cargar datos del usuario", "error")
    }
} 

//Evento que abre modal de eliminacion de usuario
window.deleteUser = async (id) => {

    const currentUserData = await checkSession()
    if (currentUserData && currentUserData.id == id) {
        showToast("No se puede eliminar mientras el usuario este logeado", "error")
        return
    }

    modalDeleteBS.show()
    
    btnDeleteModal.onclick = async () =>{

        try {
            const response = await fetch(`/users/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (response.ok) {

                modalDeleteBS.hide()                
                loadUsers()
                loadStats()
                showToast("Usuario eliminado correctamente")
                
            } else {
                showToast(data.error || "Error al eliminar usuario", "error")
            }

        } catch (error) {
            showToast(data.error || "Error al eliminar usuario", "error")
        }
    }
}




