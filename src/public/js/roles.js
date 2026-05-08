const rolesTableBody = document.getElementById("rolesTableBody")
const btnNewRole = document.getElementById("btnNewRole")
const formRole = document.getElementById("formRole")
const modalRole = document.getElementById("modalRole")
const modalRoleBS = new bootstrap.Modal(modalRole)
const modalDeleteRole = document.getElementById("modalDelete")
const modalDeleteRoleBS = new bootstrap.Modal(modalDeleteRole)
const btnDeleteRoleModal = modalDeleteRole.querySelector("#btnModalDelete")

let editModeRole = false
let currentRoleId = 0

const loadRoles = async () => {

    try {
        checkSession()
        const response = await fetch('/roles/all')
        
        if (response.status === 401) {
            window.location.href = '/index.html'
            return
        }

        const roles = await response.json()
        loadTableRoles(roles)

    } catch (error) {
        showToast("Error al cargar la lista de roles", "error")

    }
}

const loadTableRoles = (roles) => {
    rolesTableBody.innerHTML = '';

    if (roles.length === 0) {
        rolesTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">No hay roles definidos</td>
            </tr>`;
        return;
    }

    roles.forEach(rol => {
        rolesTableBody.innerHTML += `
            <tr>
                <td class="fw-bold text-dark">${rol.nombre}</td>
                <td class="text-muted small">${rol.descripcion || 'Sin descripción'}</td>
                <td>
                    <span class="badge bg-light text-dark border">
                        ${rol.cantidad_usuarios} usuarios
                    </span>
                </td>
                <td>
                    <span class="badge ${rol.activo ? 'bg-success' : 'bg-secondary'}">
                        ${rol.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-primary me-1" onclick="editRole(${rol.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="deleteRole(${rol.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

window.loadRoles = loadRoles


btnNewRole.onclick = () => {

    modalRoleBS.show()
    editModeRole = false
    formRole.reset()
}

formRole.onsubmit = async (e) => {

    checkSession()
    e.preventDefault()
    const name = document.getElementById("roleName").value.trim()
    const desc = document.getElementById("roleDesc").value.trim()
    const active = document.getElementById("roleStatus").checked

    const url = editModeRole ? `/roles/update/${currentRoleId}` : '/roles/new'
    const method = editModeRole ? 'PUT' : 'POST'

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, desc, active })
        })

        if (response.ok) {

            modalRoleBS.hide();
            showToast(editModeRole ? "Rol actualizado con exito" : "Rol creado con exito")
            loadRoles()
            loadStats()

        } else {
            const data = await response.json();
            showToast(data.error || "Error al guardar rol", "error")
        }

    } catch (error) {
        console.log(error)
        showToast("Error al crear el rol " + error, "error")
    }
}


window.editRole = async (id) => {

    checkSession()
    editMode = true
    currentRoleId = id

    try {

        const response = await fetch(`/roles/all`)
        const roles = await response.json()
        const rol = roles.find(r => r.id === id)

        if (rol) {
            editModeRole = true
            currentRoleId = id

            document.getElementById("roleName").value = rol.nombre
            document.getElementById("roleDesc").value = rol.descripcion
            document.getElementById("roleStatus").checked = rol.activo === 1
            document.getElementById("roleModalTitle").innerHTML = '<i class="bi bi-pencil-square me-2"></i> Editar Rol'
            
            modalRoleBS.show()
        }
    } catch (error) {
        showToast("Error al cargar datos del rol", "error")
    }
};

window.deleteRole = async (id) => {

    checkSession()

    modalDeleteRoleBS.show()

    btnDeleteRoleModal.onclick = async () => {

        try {
            const response = await fetch(`/roles/delete/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()

            if (response.ok) {
                modalDeleteRoleBS.hide()
                showToast("Rol eliminado correctamente")
                loadRoles()
                loadStats()
            } else {
                showToast(data.error || "Error al eliminar rol", "error")
            }

        } catch (error) {
            console.error(error)
            showToast("Error al eliminar rol", "error")
        }
    }
}
