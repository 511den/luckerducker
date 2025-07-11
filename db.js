// Имитация базы данных пользователей
let usersDatabase = [
    {
        id: 1,
        username: "admin",
        password: "admin123",
        email: "admin@example.com",
        isAdmin: true
    },
    {
        id: 2,
        username: "user",
        password: "user123",
        email: "user@example.com",
        isAdmin: false
    }
];

// Имитация базы данных модов
let modsDatabase = [
    {
        id: 1,
        name: "Драконы в игре",
        author: "DragonLover",
        description: "Добавляет 5 новых видов драконов с уникальными способностями.",
        filename: "dragons_mod.zip",
        fileUrl: "#",
        status: "approved",
        date: "15.07.2023",
        downloads: 1245,
        userId: 2
    },
    {
        id: 2,
        name: "Магические шляпы",
        author: "MagicWizard",
        description: "30 новых магических шляп с уникальными эффектами.",
        filename: "magic_hats.zip",
        fileUrl: "#",
        status: "approved",
        date: "10.07.2023",
        downloads: 892,
        userId: 2
    },
    {
        id: 3,
        name: "Новые текстуры оружия",
        author: "WeaponMaster",
        description: "Полный ретекстур всех видов оружия в HD качестве.",
        filename: "weapons_hd.zip",
        fileUrl: "#",
        status: "pending",
        date: "20.07.2023",
        downloads: 0,
        userId: 2
    }
];

// Функции для работы с пользователями
function loginUser(username, password) {
    return usersDatabase.find(u => u.username === username && u.password === password) || null;
}

function registerUser(username, password, email, isAdmin = false) {
    if (usersDatabase.some(u => u.username === username)) {
        return false;
    }
    
    const newUser = {
        id: Date.now(),
        username,
        password,
        email,
        isAdmin
    };
    
    usersDatabase.push(newUser);
    return true;
}

// Функции для работы с модами
function getMods() {
    return modsDatabase;
}

function getModById(id) {
    return modsDatabase.find(m => m.id === id);
}

function addNewMod(mod) {
    modsDatabase.push(mod);
}

function approveMod(id) {
    const mod = modsDatabase.find(m => m.id === id);
    if (mod) {
        mod.status = "approved";
    }
}

function rejectMod(id) {
    modsDatabase = modsDatabase.filter(m => m.id !== id);
}

function deleteMod(id) {
    modsDatabase = modsDatabase.filter(m => m.id !== id);
}

function downloadMod(id) {
    const mod = modsDatabase.find(m => m.id === id);
    if (mod) {
        mod.downloads++;
        
        // В реальной системе здесь было бы скачивание с сервера
        // Это имитация скачивания
        const link = document.createElement('a');
        link.href = mod.fileUrl;
        link.download = mod.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Экспорт функций для использования в других файлах
window.loginUser = loginUser;
window.registerUser = registerUser;
window.getMods = getMods;
window.getModById = getModById;
window.addNewMod = addNewMod;
window.approveMod = approveMod;
window.rejectMod = rejectMod;
window.deleteMod = deleteMod;
window.downloadMod = downloadMod;