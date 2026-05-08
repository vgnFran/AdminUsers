const spanUser = document.getElementById("user-display")
const btnLogout = document.getElementById("btnLogout")
const navUsers = document.getElementById("nav-users")
const navRoles = document.getElementById("nav-roles")
const viewUsers = document.getElementById("view-users")
const viewRoles = document.getElementById("view-roles")


const switchView = (view) => {

    loadStats()
    
    if (view === 'users') {
        viewUsers.classList.remove('d-none')
        viewRoles.classList.add('d-none')
        navUsers.classList.add('active')
        navRoles.classList.remove('active')
        loadUsers()

    } else if (view === 'roles') {
        viewUsers.classList.add('d-none')
        viewRoles.classList.remove('d-none')
        navUsers.classList.remove('active')
        navRoles.classList.add('active')
        loadRoles()
    }
}


navUsers.onclick = () => {
    switchView('users')
}

navRoles.onclick = () => {
    switchView('roles')
}


const checkSession = async () => {

    try {
        const res = await fetch('/users/check-session')
        if (!res.ok) {
            window.location.href = '/index.html?expired=true'
        }

        const data = await res.json()
        const userData = data.user
        
        spanUser.innerHTML=
        `
        <i class="bi bi-person-circle me-1"></i> 
        ${userData.name}
        <span class="badge bg-secondary mt-3 ms-2">${userData.rol}</span>
        `
        return userData

    } catch (error) {
        console.error("Error en el check de sesion")
        return null
    }

}    

setInterval(checkSession, 60000)

btnLogout.onclick = async () =>{

    try {
        const response = await fetch('/users/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
            window.location.href = '/index.html?logout=success'
        } else {
            alert("Error al cerrar sesion")
        }

    } catch (error) {
        console.error("Error en logout:", error)
    }
} 


const loadStats = async () => {

    try {
        const res = await fetch('/users/stats')
        const stats = await res.json()

        if (res.ok) {
            document.getElementById('stat-total').innerText = stats.cant_total
            document.getElementById('stat-activos').innerText = stats.cant_activos
            document.getElementById('stat-inactivos').innerText = stats.cant_inactivos
            document.getElementById('stat-roles').innerText = stats.cant_roles
        }

    } catch (error) {
        console.error("Error cargando stats:", error)
    }
}


const showToast = (message, type = "success") => {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "bottom", 
        position: "right", 
        stopOnFocus: true,
        style: {
            background: type === "success" ? "#198754" : "#dc3545",
            borderRadius: "8px"
        }
    }).showToast()
}


document.addEventListener('DOMContentLoaded', () => {
    checkSession()
    loadStats()
    loadUsers()
})

window.showToast = showToast;
window.checkSession = checkSession;
window.loadStats = loadStats;