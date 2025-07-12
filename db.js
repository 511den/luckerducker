// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Путь к файлу с данными
const DATA_FILE = path.join(__dirname, 'data.json');

// Загрузка данных из файла
function loadData() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        // Если файла нет, создаем начальные данные
        const initialData = {
            users: [
                {
                    id: 1,
                    username: "admin",
                    password: "admin123",
                    email: "admin@example.com",
                    isAdmin: true,
                    regDate: "01.07.2023",
                    modsCount: 2,
                    downloadsCount: 2137,
                    likesCount: 145
                },
                {
                    id: 2,
                    username: "user",
                    password: "user123",
                    email: "user@example.com",
                    isAdmin: false,
                    regDate: "05.07.2023",
                    modsCount: 1,
                    downloadsCount: 0,
                    likesCount: 0
                }
            ],
            mods: [
                {
                    id: 1,
                    name: "Драконы в игре",
                    author: "admin",
                    description: "Добавляет 5 новых видов драконов с уникальными способностями.",
                    filename: "dragons_mod.zip",
                    fileUrl: "#",
                    status: "approved",
                    isOfficial: true,
                    date: "15.07.2023",
                    downloads: 1245,
                    likes: 145,
                    userId: 1,
                    comments: [
                        {id: 1, userId: 2, username: "user", text: "Отличный мод! Драконы просто невероятные!", date: "16.07.2023", likes: 0}
                    ]
                },
                {
                    id: 2,
                    name: "Магические шляпы",
                    author: "admin",
                    description: "30 новых магических шляп с уникальными эффектами.",
                    filename: "magic_hats.zip",
                    fileUrl: "#",
                    status: "approved",
                    isOfficial: true,
                    date: "10.07.2023",
                    downloads: 892,
                    likes: 92,
                    userId: 1,
                    comments: []
                },
                {
                    id: 3,
                    name: "Новые текстуры оружия",
                    author: "user",
                    description: "Полный ретекстур всех видов оружия в HD качестве.",
                    filename: "weapons_hd.zip",
                    fileUrl: "#",
                    status: "pending",
                    isOfficial: false,
                    date: "20.07.2023",
                    downloads: 0,
                    likes: 0,
                    userId: 2,
                    comments: []
                }
            ]
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
}

// Сохранение данных в файл
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API для работы с пользователями
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const data = loadData();
    const user = data.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, message: 'Неверные логин или пароль' });
    }
});

app.post('/api/register', (req, res) => {
    const { username, password, email, adminCode } = req.body;
    const data = loadData();
    
    if (data.users.some(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'Пользователь с таким логином уже существует' });
    }
    
    const isAdmin = (adminCode === process.env.ADMIN_CODE || adminCode === '********'); // Замените на реальный код
    
    const newUser = {
        id: Date.now(),
        username,
        password,
        email,
        isAdmin,
        regDate: new Date().toLocaleDateString(),
        modsCount: 0,
        downloadsCount: 0,
        likesCount: 0
    };
    
    data.users.push(newUser);
    saveData(data);
    
    res.json({ success: true, user: newUser });
});

// API для работы с модами
app.get('/api/mods', (req, res) => {
    const data = loadData();
    res.json(data.mods);
});

app.get('/api/mods/:id', (req, res) => {
    const data = loadData();
    const mod = data.mods.find(m => m.id === parseInt(req.params.id));
    
    if (mod) {
        res.json(mod);
    } else {
        res.status(404).json({ message: 'Мод не найден' });
    }
});

app.post('/api/mods', (req, res) => {
    const { mod } = req.body;
    const data = loadData();
    
    mod.id = Date.now();
    data.mods.push(mod);
    
    // Обновляем статистику пользователя
    const user = data.users.find(u => u.id === mod.userId);
    if (user) user.modsCount++;
    
    saveData(data);
    res.json({ success: true, mod });
});

app.put('/api/mods/:id/approve', (req, res) => {
    const data = loadData();
    const mod = data.mods.find(m => m.id === parseInt(req.params.id));
    
    if (mod) {
        mod.status = "approved";
        saveData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ message: 'Мод не найден' });
    }
});

app.delete('/api/mods/:id', (req, res) => {
    const data = loadData();
    const modIndex = data.mods.findIndex(m => m.id === parseInt(req.params.id));
    
    if (modIndex !== -1) {
        data.mods.splice(modIndex, 1);
        saveData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ message: 'Мод не найден' });
    }
});

app.post('/api/mods/:id/download', (req, res) => {
    const data = loadData();
    const mod = data.mods.find(m => m.id === parseInt(req.params.id));
    
    if (mod) {
        mod.downloads++;
        
        // Обновляем статистику пользователя
        const user = data.users.find(u => u.id === mod.userId);
        if (user) user.downloadsCount++;
        
        saveData(data);
        res.json({ success: true, downloads: mod.downloads });
    } else {
        res.status(404).json({ message: 'Мод не найден' });
    }
});

app.post('/api/mods/:id/like', (req, res) => {
    const { userId } = req.body;
    const data = loadData();
    const mod = data.mods.find(m => m.id === parseInt(req.params.id));
    
    if (mod) {
        if (!mod.likedBy) mod.likedBy = [];
        
        if (mod.likedBy.includes(userId)) {
            // Удаляем лайк
            const index = mod.likedBy.indexOf(userId);
            mod.likedBy.splice(index, 1);
            mod.likes--;
            
            // Обновляем статистику пользователя
            const user = data.users.find(u => u.id === mod.userId);
            if (user) user.likesCount--;
        } else {
            // Добавляем лайк
            mod.likedBy.push(userId);
            mod.likes++;
            
            // Обновляем статистику пользователя
            const user = data.users.find(u => u.id === mod.userId);
            if (user) user.likesCount++;
        }
        
        saveData(data);
        res.json({ success: true, likes: mod.likes, isLiked: mod.likedBy.includes(userId) });
    } else {
        res.status(404).json({ message: 'Мод не найден' });
    }
});

app.post('/api/mods/:id/comments', (req, res) => {
    const { userId, username, text } = req.body;
    const data = loadData();
    const mod = data.mods.find(m => m.id === parseInt(req.params.id));
    
    if (mod) {
        const newComment = {
            id: Date.now(),
            userId,
            username,
            text,
            date: new Date().toLocaleDateString(),
            likes: 0
        };
        
        mod.comments.push(newComment);
        saveData(data);
        res.json({ success: true, comment: newComment });
    } else {
        res.status(404).json({ message: 'Мод не найден' });
    }
});

// API для работы с пользователями (админка)
app.get('/api/users', (req, res) => {
    const data = loadData();
    res.json(data.users);
});

app.delete('/api/users/:id', (req, res) => {
    const data = loadData();
    const userIndex = data.users.findIndex(u => u.id === parseInt(req.params.id));
    
    if (userIndex !== -1) {
        // Удаляем все моды этого пользователя
        data.mods = data.mods.filter(m => m.userId !== parseInt(req.params.id));
        
        // Удаляем пользователя
        data.users.splice(userIndex, 1);
        saveData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ message: 'Пользователь не найден' });
    }
});

// Статистика
app.get('/api/stats', (req, res) => {
    const data = loadData();
    const stats = {
        totalUsers: data.users.length,
        totalMods: data.mods.length,
        pendingMods: data.mods.filter(m => m.status === 'pending').length,
        totalDownloads: data.mods.reduce((sum, mod) => sum + mod.downloads, 0)
    };
    res.json(stats);
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
