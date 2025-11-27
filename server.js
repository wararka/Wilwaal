// server.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// =========================================================
//                   QAYBTA DIYAARINTA GALLYADA
// =========================================================

// Faylasha Keydka
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const POSTS_FILE = path.join(__dirname, 'post', 'posts.json');
const COMMENTS_FILE = path.join(__dirname, 'data', 'comments.json');
const MUSIC_FILE = path.join(__dirname, 'data', 'music.json'); 
const ANNOUNCEMENTS_FILE = path.join(__dirname, 'data', 'announcements.json');
const ADMIN_GROUP_FILE = path.join(__dirname, 'data', 'admin-group.json');

// Galalka Media
const profileUploadDir = path.join(__dirname, 'profile');
const mediaPostDir = path.join(__dirname, 'media-post');
const CHAT_DIR = path.join(__dirname, 'chat-messages');
const CHAT_MEDIA_DIR = path.join(__dirname, 'sheeko-media');
const MUSIC_UPLOAD_DIR = path.join(__dirname, 'music-media');
const ARTIST_IMAGES_DIR = path.join(__dirname, 'artist-images'); // 🎯 CUSUB

// Hubi in galku jiraan, haddii kale abuur
[
    profileUploadDir, 
    mediaPostDir, 
    ARTIST_IMAGES_DIR, // 🎯 CUSUB
    path.dirname(USERS_FILE), 
    path.dirname(POSTS_FILE), 
    path.dirname(COMMENTS_FILE), 
    path.dirname(MUSIC_FILE),
    path.dirname(ANNOUNCEMENTS_FILE),
    path.dirname(ADMIN_GROUP_FILE),
    CHAT_DIR, 
    CHAT_MEDIA_DIR,
    MUSIC_UPLOAD_DIR
].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// =========================================================
//                   QAYBTA CAAWISA: AKHRINTA/QORISTA JSON
// =========================================================

// Users Functions
function getUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        if (error.code === 'ENOENT') { fs.writeFileSync(USERS_FILE, '[]', 'utf8'); return []; }
        return [];
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4), 'utf8');
    } catch (error) {
        console.error("Khalad ku yimid qorista users.json:", error);
    }
}

// Posts Functions
function getPosts() {
    try {
        const data = fs.readFileSync(POSTS_FILE, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        if (error.code === 'ENOENT') { fs.writeFileSync(POSTS_FILE, '[]', 'utf8'); return []; }
        return [];
    }
}

function savePosts(posts) {
    try {
        fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 4), 'utf8');
    } catch (error) {
        console.error("Khalad ku yimid qorista posts.json:", error);
    }
}

// Comments Functions
function getComments() {
    try {
        const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        if (error.code === 'ENOENT') { fs.writeFileSync(COMMENTS_FILE, '[]', 'utf8'); return []; }
        return [];
    }
}

function saveComments(comments) {
    try {
        fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 4), 'utf8');
    } catch (error) {
        console.error("Khalad ku yimid qorista comments.json:", error);
    }
}

// Music Functions
function getMusic() {
    try {
        const data = fs.readFileSync(MUSIC_FILE, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        if (error.code === 'ENOENT') { fs.writeFileSync(MUSIC_FILE, '[]', 'utf8'); return []; }
        return [];
    }
}

function saveMusic(music) {
    try {
        fs.writeFileSync(MUSIC_FILE, JSON.stringify(music, null, 4), 'utf8');
    } catch (error) {
        console.error("Khalad ku yimid qorista music.json:", error);
    }
}

// Announcements Functions
function getAnnouncements() {
    try {
        const data = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        if (error.code === 'ENOENT') { fs.writeFileSync(ANNOUNCEMENTS_FILE, '[]', 'utf8'); return []; }
        return [];
    }
}

function saveAnnouncements(announcements) {
    try {
        fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 4), 'utf8');
    } catch (error) {
        console.error("Khalad ku yimid qorista announcements.json:", error);
    }
}

// Admin Group Functions
function getAdminGroup() {
    try {
        const data = fs.readFileSync(ADMIN_GROUP_FILE, 'utf8');
        return data ? JSON.parse(data) : { members: [1], invitations: [] };
    } catch (error) {
        if (error.code === 'ENOENT') { 
            const initialGroup = { members: [1], invitations: [] };
            fs.writeFileSync(ADMIN_GROUP_FILE, JSON.stringify(initialGroup), 'utf8'); 
            return initialGroup; 
        }
        return { members: [1], invitations: [] };
    }
}

function saveAdminGroup(adminGroup) {
    try {
        fs.writeFileSync(ADMIN_GROUP_FILE, JSON.stringify(adminGroup, null, 4), 'utf8');
    } catch (error) {
        console.error("Khalad ku yimid qorista admin-group.json:", error);
    }
}

// Chat/Sheeko Functions
function getChatFilePath(id1, id2) {
    const sortedIds = [id1, id2].sort((a, b) => a - b);
    return path.join(CHAT_DIR, `${sortedIds[0]}-${sortedIds[1]}.json`);
}

function getChatHistory(id1, id2) {
    const filePath = getChatFilePath(id1, id2);
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        if (error.code === 'ENOENT') { return []; }
        console.error(`Khalad ku yimid akhrinta sheekada ${id1}-${id2}:`, error);
        return [];
    }
}

function saveChatHistory(id1, id2, messages) {
    const filePath = getChatFilePath(id1, id2);
    try {
        fs.writeFileSync(filePath, JSON.stringify(messages, null, 4), 'utf8');
    } catch (error) {
        console.error(`Khalad ku yimid qorista sheekada ${id1}-${id2}:`, error);
    }
}

// =========================================================
//                  DEJINTA FAYL-SOO-DIRKA (MULTER)
// =========================================================

// Storage for Profile Images
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, profileUploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const username = req.body.username || (req.session.user ? req.session.user.username : 'unknown');
        cb(null, 'profile-' + username + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const profileUpload = multer({ storage: profileStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// Storage for Post Media (Image, Video, Audio)
const postMediaStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, mediaPostDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const username = req.session.user ? req.session.user.username : 'unknown';
        cb(null, 'media-' + username + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const postMediaUpload = multer({ storage: postMediaStorage, limits: { fileSize: 100 * 1024 * 1024 } });

// Storage for Chat Media
const chatMediaStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, CHAT_MEDIA_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const senderId = req.session.user ? req.session.user.id : 'unknown';
        cb(null, 'chat-media-' + senderId + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const chatMediaUpload = multer({ storage: chatMediaStorage, limits: { fileSize: 100 * 1024 * 1024 } });

// Storage for Music Uploads (Audio/Video)
const musicStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, MUSIC_UPLOAD_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const username = req.session.user ? req.session.user.username : 'unknown';
        cb(null, 'music-' + username + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const musicUpload = multer({ 
    storage: musicStorage, 
    limits: { fileSize: 500 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Kaliya waxaad soo gelin kartaa Audio ama Video.'), false);
        }
    }
});

// Storage for Artist Images (CUSUB)
const artistImageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, ARTIST_IMAGES_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const artistName = req.body.artistName || 'unknown';
        cb(null, 'artist-' + artistName.replace(/[^a-zA-Z0-9]/g, '_') + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const artistImageUpload = multer({ 
    storage: artistImageStorage, 
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// =========================================================
//              DEJINTA MIDDLEWARE-KA GUUD
// =========================================================

app.use(session({
    secret: 'sir_adag_oo_loogu_talagalay_node-js_project',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, secure: false }
}));

// 🛡️ MIDDLEWARE-GA ILAALINTA HTML-YADA
app.use((req, res, next) => {
    const path = req.path.toLowerCase();
    
    // Ogolaaw file-yada CSS, JS, sawiro, iwm
    if (path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|mp4|mp3|wav|ogg)$/)) {
        return next();
    }
    
    // Haddii uu yahay HTML file
    if (path.endsWith('.html')) {
        // Login iyo register waayaa rukhsan
        if (path === '/login.html' || path === '/register.html') {
            return next();
        }
        
        // HTML-yada kale waa inay baahan yihiin login
        if (!req.session.isLoggedIn) {
            return res.redirect('/login.html');
        }
    }
    
    next();
});

// KA DIBNA static middleware-ka 🛡️
app.use(express.static('public'));
app.use('/profiles', express.static(profileUploadDir));
app.use('/media-posts', express.static(mediaPostDir));
app.use('/sheeko-media', express.static(CHAT_MEDIA_DIR));
app.use('/music-media', express.static(MUSIC_UPLOAD_DIR));
app.use('/artist-images', express.static(ARTIST_IMAGES_DIR)); // 🎯 CUSUB

// Waxay xamili kartaa labada Form Data (urlencoded) iyo JSON (fetch API)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =========================================================
//                  MIDDLEWARE-KA ILAALINTA
// =========================================================

function requireLogin(req, res, next) {
    if (req.session.isLoggedIn) {
        // 🚨 Hubi in user-ku aan xannibanayn
        const users = getUsers();
        const currentUser = users.find(u => u.id === req.session.user.id);
        
        if (currentUser && currentUser.isBlocked) {
            // User-ka waa la xannibay - destroy session
            req.session.destroy(() => {
                return res.redirect('/login.html?message=Your account has been blocked');
            });
            return;
        }
        
        next();
    } else {
        res.redirect('/login.html');
    }
}

function requireAdmin(req, res, next) {
    if (req.session.isLoggedIn && req.session.user.isAdmin) {
        next();
    } else {
        res.status(403).send('Helitaanka Waa La Diiday. Waxaad u baahan tahay Xuquuqda Admin-ka.');
    }
}

// =========================================================
//                       ROUTES MUHIIM AH
// =========================================================

// --- 1. ROUTE-KA ISKU-DIWAANGELINTA (REGISTER) - HAGAAGSAN ---
app.post('/register', profileUpload.single('profileImage'), (req, res) => {
    const { username, password } = req.body;
    let profileImagePath = null;

    if (!username || !password) {
        return res.status(400).send('Khalad: Fadlan buuxi Username iyo Password.');
    }

    // Nadiifi username-ka
    const cleanUsername = username.trim();
    
    if (cleanUsername.length < 3) {
        return res.status(400).send('Khalad: Username-ku waa inuu ka yaraan 3 xaraf.');
    }

    const users = getUsers();
    
    // Hubi in username-ku aan horay u jiray (case-insensitive)
    const userExists = users.some(user => 
        user.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (userExists) {
        return res.status(400).send('Khalad: Magaca Isticmaalaha "' + cleanUsername + '" horay ayaa loo isticmaalay.');
    }

    if (req.file) {
        profileImagePath = '/profiles/' + req.file.filename;
    }

    const newUser = {
        username: cleanUsername, // Store cleaned username
        password,
        profileImage: profileImagePath,
        id: users.length + 1,
        isAdmin: users.length === 0,
        isBlocked: false,
        isPublic: true, 
        joinedAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    res.redirect('/login.html?message=Koontadaada si guul leh ayaa loo abuuray! Fadlan soo gal.');
});



// --- 2. ROUTE-KA SOO-GELISTA (LOGIN) - HAGAAGSAN ---
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Fadlan buuxi Username iyo Password.' });
    }

    // Nadiifi username-ka
    const cleanUsername = username.trim();
    const users = getUsers();
    
    // Raadi user-ka (case-insensitive)
    const user = users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());

    if (user) {
        if (user.isBlocked) {
             return res.status(403).json({ success: false, message: 'Akoonkaaga waa la xannibay.' });
        }
        
        try {
            // HAGAAGSIN: Hubi in password-ku ay hashed tahay ama plain text
            let isPasswordValid = false;
            
            if (user.password.startsWith('$2b$')) {
                // Password-ku waa hashed - isticmaal bcrypt.compare
                isPasswordValid = await bcrypt.compare(password, user.password);
            } else {
                // Password-ku waa plain text - isticmaal isbarbar dhig direct
                isPasswordValid = (password === user.password);
            }

            if (isPasswordValid) {
                req.session.isLoggedIn = true;
                req.session.user = {
                    username: user.username, // Use original username from database
                    id: user.id,
                    profileImage: user.profileImage,
                    isAdmin: user.isAdmin
                };
                res.json({ success: true, message: 'Soo galitaanka guul leh!' });
            } else {
                res.status(401).json({ success: false, message: 'Magaca Isticmaalaha ama Furaha Sirta waa khalad.' });
            }
        } catch (error) {
            console.error('Khalad ku yimid hubinta password-ka:', error);
            res.status(500).json({ success: false, message: 'Khalad server gudaha ah.' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Magaca Isticmaalaha ama Furaha Sirta waa khalad.' });
    }
});






// --- 3. ROUTE-KA ABUURISTA QORAALKA (CREATE POST) ---
app.post('/create-post', requireLogin, postMediaUpload.single('postMedia'), (req, res) => {
    const { postText } = req.body;

    if (!postText && !req.file) {
        return res.status(400).send('Fadlan ku dar qoraal ama media si aad post u abuurto.');
    }

    let mediaPath = null;
    let mediaType = null;
    
    if (req.file) {
        mediaPath = '/media-posts/' + req.file.filename;
        const mimeType = req.file.mimetype;
        if (mimeType.startsWith('image/')) mediaType = 'image';
        else if (mimeType.startsWith('video/')) mediaType = 'video';
        else if (mimeType.startsWith('audio/')) mediaType = 'audio';
    }

    const posts = getPosts();
    const newPost = {
        id: 'post_' + Date.now().toString(),
        userId: req.session.user.id,
        text: postText,
        mediaPath: mediaPath,
        mediaType: mediaType,
        createdAt: new Date().toISOString(),
        likedBy: [], 
        views: 0,
        isPublic: true, 
    };

    posts.unshift(newPost); 
    savePosts(posts);

    res.send(`<script>alert('Post-kaaga si guul leh ayaa loo soo dhigay!'); window.location.href = '/index.html';</script>`);
});

//=========================================================//
  //                         API ROUTES
// =========================================================//


// --- API: Soo Deji Macluumaadka Userka ---
app.get('/api/user-info', requireLogin, (req, res) => {
    res.json({ success: true, user: req.session.user });
});

// --- API: Soo Deji Qoraallada (Posts) ---
app.get('/api/posts', (req, res) => {
    const users = getUsers();
    const posts = getPosts();
    const allComments = getComments();
    const currentUserId = req.session.isLoggedIn ? req.session.user.id : null; 

    const postsWithDetails = posts
        .filter(post => {
            return post.isPublic !== false || post.userId === currentUserId;
        })
        .map(post => {
            const postComments = allComments.filter(c => c.postId === post.id);
            const user = users.find(u => u.id === post.userId);
            
            if (!post.likedBy) post.likedBy = [];

            return {
                ...post,
                comments: postComments,
                likes: post.likedBy.length,
                username: user ? user.username : 'Deleted User',
                userProfileImage: user ? user.profileImage : null,
                isEditable: post.userId === currentUserId
            };
        });
    
    res.json(postsWithDetails);
});

// --- API: Kordhi Views-ka (Haddii userku bogga arko) ---
app.post('/api/posts/view/:postId', requireLogin, (req, res) => {
    const postId = req.params.postId;
    const posts = getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex !== -1) {
        if (typeof posts[postIndex].views !== 'number') posts[postIndex].views = 0;
        posts[postIndex].views++;
        savePosts(posts);
        return res.json({ success: true, views: posts[postIndex].views });
    }
    res.status(404).json({ success: false, message: 'Post lama helin' });
});

// --- API: Ku dar Like ama Ka Noqo Like ---
app.post('/api/posts/like/:postId', requireLogin, (req, res) => {
    const postId = req.params.postId;
    const userId = req.session.user.id;
    const posts = getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) return res.status(404).json({ success: false, message: 'Post lama helin' });
    
    if (!posts[postIndex].likedBy) posts[postIndex].likedBy = [];

    const likedByUser = posts[postIndex].likedBy.includes(userId);

    if (likedByUser) {
        posts[postIndex].likedBy = posts[postIndex].likedBy.filter(id => id !== userId);
    } else {
        posts[postIndex].likedBy.push(userId);
    }

    posts[postIndex].likes = posts[postIndex].likedBy.length;
    savePosts(posts);

    res.json({ success: true, likes: posts[postIndex].likes, liked: !likedByUser });
});

// --- API: Ku dar Comment/Reply ---
app.post('/api/posts/comment/:postId', requireLogin, (req, res) => {
    const postId = req.params.postId;
    const { commentText } = req.body;
    
    if (!commentText) return res.status(400).json({ success: false, message: 'Fadlan ku qor faallo.' });
    
    const posts = getPosts();
    if (!posts.some(p => p.id === postId)) return res.status(404).json({ success: false, message: 'Post lama helin.' });

    const comments = getComments();
    const newComment = {
        id: Date.now().toString(),
        postId: postId,
        userId: req.session.user.id,
        username: req.session.user.username,
        text: commentText,
        createdAt: new Date().toISOString()
    };

    comments.push(newComment);
    saveComments(comments);

    res.json({ success: true, comment: newComment });
});

// --- API: Tirtir Comment/Reply ---
app.post('/api/comments/delete/:commentId', requireLogin, (req, res) => {
    const commentId = req.params.commentId;
    const currentUserId = req.session.user.id;
    let comments = getComments();
    
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return res.status(404).json({ success: false, message: "Comment lama helin." });

    const comment = comments[commentIndex];
    const posts = getPosts();
    const post = posts.find(p => p.id === comment.postId);

    if (comment.userId !== currentUserId && (post && post.userId !== currentUserId)) {
         return res.status(403).json({ success: false, message: "Awood uma lihid inaad tirtirto faalladan." });
    }

    comments.splice(commentIndex, 1);
    saveComments(comments);

    res.json({ success: true });
});

// --- API: Beddel Xaaladda Privacy-ga ee Post-ga (Only Me / Public) ---
app.post('/api/posts/toggle-privacy/:postId', requireLogin, (req, res) => {
    const postId = req.params.postId;
    const currentUserId = req.session.user.id;
    let posts = getPosts();
    
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) return res.status(404).json({ success: false, message: "Post lama helin." });
    
    if (posts[postIndex].userId !== currentUserId) {
        return res.status(403).json({ success: false, message: "Awood uma lihid inaad beddesho post-kan." });
    }

    posts[postIndex].isPublic = posts[postIndex].isPublic !== true;
    savePosts(posts);

    res.json({ success: true, isPublic: posts[postIndex].isPublic });
});

// =========================================================
//                          PROFILE ROUTES
// =========================================================

// --- API: Soo Deji Xogta Profile-kaaga ---
app.get('/api/profile/my-data', requireLogin, (req, res) => {
    const currentUserId = req.session.user.id;
    const users = getUsers();
    const posts = getPosts();
    
    const currentUser = users.find(u => u.id === currentUserId);
    const userPosts = posts.filter(p => p.userId === currentUserId);
    
    let totalLikes = 0;
    userPosts.forEach(p => {
        totalLikes += p.likedBy ? p.likedBy.length : 0;
    });

    const profileData = {
        id: currentUser.id,
        username: currentUser.username,
        profileImage: currentUser.profileImage,
        postCount: userPosts.length,
        totalLikes: totalLikes,
        isPublic: currentUser.isPublic !== false
    };
    
    res.json({ success: true, user: profileData, posts: userPosts, isMyProfile: true });
});

// --- API: Soo Deji Xogta Profile-ka User-ka Kale ---
app.get('/api/profile/user-data/:id', requireLogin, (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUserId = req.session.user.id;
    const users = getUsers();
    const posts = getPosts();

    const targetUser = users.find(u => u.id === targetUserId);

    if (!targetUser) {
        return res.status(404).json({ success: false, message: "User lama helin." });
    }

    if (targetUser.isPublic === false && targetUserId !== currentUserId) {
        return res.status(403).json({ success: false, message: "Profile-kan waa mid gaar ah." });
    }

    const userPosts = posts.filter(p => p.userId === targetUserId && (p.isPublic !== false || targetUserId === currentUserId));

    let totalLikes = 0;
    userPosts.forEach(p => {
        totalLikes += p.likedBy ? p.likedBy.length : 0;
    });

    const profileData = {
        id: targetUser.id,
        username: targetUser.username,
        profileImage: targetUser.profileImage,
        postCount: userPosts.length,
        totalLikes: totalLikes,
        isPublic: targetUser.isPublic !== false
    };

    res.json({ 
        success: true, 
        user: profileData, 
        posts: userPosts,
        isMyProfile: targetUserId === currentUserId
    });
});

// --- API: Beddel Xaaladda Privacy-ga (Profile Guud) ---
app.post('/api/profile/toggle-privacy', requireLogin, (req, res) => {
    const currentUserId = req.session.user.id;
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUserId);

    if (userIndex === -1) return res.status(404).json({ success: false, message: "User lama helin." });

    users[userIndex].isPublic = users[userIndex].isPublic !== true;
    saveUsers(users);

    res.json({ success: true, isPublic: users[userIndex].isPublic });
});

// --- API: Tirtir Post-ga ---
app.post('/api/posts/delete/:postId', requireLogin, (req, res) => {
    const postId = req.params.postId;
    const currentUserId = req.session.user.id;
    let posts = getPosts();
    let allComments = getComments();

    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) return res.status(404).json({ success: false, message: "Post lama helin." });

    if (posts[postIndex].userId !== currentUserId) {
        return res.status(403).json({ success: false, message: "Awood uma lihid Adigu inaad tirtirto post-kan. " });
    }

    const remainingComments = allComments.filter(c => c.postId !== postId);
    saveComments(remainingComments);

    posts.splice(postIndex, 1);
    savePosts(posts);

    res.json({ success: true });
});

// =========================================================
//                          CHAT/SHEEKO ROUTES
// =========================================================

// --- API: Soo Deji Liiska User-rada (Marka laga reebo naftaada) ---
app.get('/api/users-list', requireLogin, (req, res) => {
    const users = getUsers();
    const currentUserId = req.session.user.id;
    
    const chatUsers = users
        .filter(u => u.id !== currentUserId && u.isBlocked === false)
        .map(u => ({
            id: u.id,
            username: u.username,
            profileImage: u.profileImage || '/profiles/default.png'
        }));

    res.json({ success: true, users: chatUsers });
});

// --- API: Dir Fariin ama Media ---
app.post('/api/chat/send-message', requireLogin, chatMediaUpload.single('chatMedia'), (req, res) => {
    const senderId = req.session.user.id;
    const { partnerId, messageText } = req.body;
    const partnerIdInt = parseInt(partnerId);

    if (!messageText && !req.file) {
        return res.status(400).json({ success: false, message: 'Fadlan ku dar qoraal ama file.' });
    }
    
    const users = getUsers();
    if (!users.some(u => u.id === partnerIdInt)) {
        return res.status(404).json({ success: false, message: 'Partner-ka sheekada lama helin. Inyar Sug fadlan ' });
    }

    let mediaPath = null;
    let mediaType = null;
    
    if (req.file) {
        mediaPath = '/sheeko-media/' + req.file.filename;
        const mimeType = req.file.mimetype;
        if (mimeType.startsWith('image/')) mediaType = 'image';
        else if (mimeType.startsWith('video/')) mediaType = 'video';
        else if (mimeType.startsWith('audio/')) mediaType = 'audio';
    }

    const messages = getChatHistory(senderId, partnerIdInt);
    
    const newMessage = {
        id: 'msg_' + Date.now().toString(),
        senderId: senderId,
        text: messageText,
        mediaPath: mediaPath,
        mediaType: mediaType,
        timestamp: new Date().toISOString()
    };

    messages.push(newMessage);
    saveChatHistory(senderId, partnerIdInt, messages);

    res.json({ success: true, message: newMessage });
});

// --- API: Soo Deji Taariikhda Sheekada ---
app.get('/api/chat/history/:partnerId', requireLogin, (req, res) => {
    const currentUserId = req.session.user.id;
    const partnerIdInt = parseInt(req.params.partnerId);

    if (currentUserId === partnerIdInt) {
         return res.status(400).json({ success: false, message: "Kuma sheekaysan kartid naftaada." });
    }

    const messages = getChatHistory(currentUserId, partnerIdInt);

    res.json({ success: true, messages: messages });
});




// 🆕 API: Get message status (read/delivered)
app.get('/api/chat/message-status/:messageId', requireLogin, (req, res) => {
    const messageId = req.params.messageId;
    const userId = req.session.user.id;
    
    try {
        const users = getUsers();
        let messageStatus = null;
        
        // Search for message in all chats
        users.forEach(user1 => {
            users.forEach(user2 => {
                if (!messageStatus) {
                    const chatFile = getChatFilePath(user1.id, user2.id);
                    try {
                        if (fs.existsSync(chatFile)) {
                            const messages = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
                            const message = messages.find(msg => msg.id === messageId);
                            
                            if (message) {
                                messageStatus = {
                                    id: message.id,
                                    senderId: message.senderId,
                                    readBy: message.readBy || [],
                                    delivered: true, // Since it's in the chat file
                                    timestamp: message.timestamp,
                                    isDeleted: (message.deletedFor || []).includes(userId)
                                };
                            }
                        }
                    } catch (error) {
                        console.error(`Khalad chat file ${chatFile}:`, error);
                    }
                }
            });
        });
        
        res.json({ 
            success: true, 
            status: messageStatus 
        });
    } catch (error) {
        console.error('Khalad message-status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Khalad soo dejinta xaaladda fariinta' 
        });
    }
});



// --- API: Soo Deji Fariimaha Cusub (Polling) ---
app.get('/api/chat/updates/:partnerId', requireLogin, (req, res) => {
    const currentUserId = req.session.user.id;
    const partnerIdInt = parseInt(req.params.partnerId);
    const lastId = req.query.lastId;

    if (currentUserId === partnerIdInt) {
         return res.status(400).json({ success: false, message: "Kuma sheekaysan kartid naftaada." });
    }
    
    const messages = getChatHistory(currentUserId, partnerIdInt);

    let newMessages = [];
    if (lastId) {
        const lastIndex = messages.findIndex(msg => msg.id === lastId);
        if (lastIndex !== -1) {
            newMessages = messages.slice(lastIndex + 1);
        } else {
            newMessages = messages.slice(-10);
        }
    } else {
        newMessages = messages;
    }

    res.json({ success: true, messages: newMessages });
});


// =========================================================
//           READ RECEIPTS SYSTEM - SAXDA AH
// =========================================================

// 🆕 Function: Update read receipts - SAXDA
function updateReadReceipts(readerId, partnerId) {
    const chatHistory = getChatHistory(readerId, partnerId);
    let hasUpdates = false;
    
    chatHistory.forEach(message => {
        // Mark messages from partner as read
        if (message.senderId === partnerId) {
            // Initialize readBy array if it doesn't exist
            if (!message.readBy) {
                message.readBy = [];
            }
            // Add reader to readBy if not already there
            if (!message.readBy.includes(readerId)) {
                message.readBy.push(readerId);
                message.readAt = message.readAt || new Date().toISOString();
                hasUpdates = true;
            }
        }
    });
    
    if (hasUpdates) {
        saveChatHistory(readerId, partnerId, chatHistory);
    }
    
    return hasUpdates;
}

// 🆕 API: Mark messages as read - SAXDA
app.post('/api/chat/mark-read/:partnerId', requireLogin, (req, res) => {
    const readerId = req.session.user.id;
    const partnerId = parseInt(req.params.partnerId);
    
    // Validate partnerId
    if (isNaN(partnerId)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Partner ID waa khalad' 
        });
    }
    
    try {
        const updated = updateReadReceipts(readerId, partnerId);
        res.json({ 
            success: true, 
            updated: updated,
            message: updated ? 'Fariimaha waa la aqriyay' : 'Dhammaan fariimaha horay ayaa la aqriyay'
        });
    } catch (error) {
        console.error('Khalad mark-read:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Khalad marka la aqrinayo fariimaha' 
        });
    }
});

// 🆕 API: Get read status for messages - SAXDA
app.get('/api/chat/read-status/:partnerId', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    const partnerId = parseInt(req.params.partnerId);
    
    // Validate partnerId
    if (isNaN(partnerId)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Partner ID waa khalad' 
        });
    }
    
    try {
        const chatHistory = getChatHistory(userId, partnerId);
        const readStatus = {};
        
        chatHistory.forEach(message => {
            if (message.senderId === userId) { // My messages
                readStatus[message.id] = {
                    read: message.readBy && message.readBy.includes(partnerId),
                    readAt: message.readAt,
                    readBy: message.readBy || []
                };
            }
        });
        
        res.json({ 
            success: true, 
            readStatus: readStatus 
        });
    } catch (error) {
        console.error('Khalad read-status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Khalad soo dejinta xaaladda aqrinta' 
        });
    }
});






// =========================================================
//           MESSAGE DELETION SYSTEM - SAXDA (IMPROVED)
// =========================================================

// 🆕 Function: Delete message with different modes - SAXDA (IMPROVED)
function deleteMessage(messageId, deleterId, deleteMode) {
    let foundInAnyChat = false;
    
    console.log(`🔍 Deleting message ${messageId} by user ${deleterId} with mode: ${deleteMode}`);
    
    // Search through all chat files more efficiently
    const users = getUsers();
    
    for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length; j++) {
            const user1 = users[i];
            const user2 = users[j];
            
            const chatFiles = [
                getChatFilePath(user1.id, user2.id),
                getChatFilePath(user2.id, user1.id)
            ];
            
            for (const chatFile of chatFiles) {
                try {
                    if (fs.existsSync(chatFile)) {
                        let messages = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
                        const messageIndex = messages.findIndex(msg => msg.id === messageId);
                        
                        if (messageIndex !== -1) {
                            const message = messages[messageIndex];
                            foundInAnyChat = true;
                            
                            console.log(`✅ Found message ${messageId} in chat file: ${chatFile}`);
                            console.log(`📝 Message sender: ${message.senderId}, Deleter: ${deleterId}`);
                            
                            // Initialize deletion tracking
                            if (!message.deletedFor) {
                                message.deletedFor = [];
                                console.log(`🆕 Initialized deletedFor array for message ${messageId}`);
                            }
                            if (!message.deletedBy) {
                                message.deletedBy = [];
                                console.log(`🆕 Initialized deletedBy array for message ${messageId}`);
                            }
                            
                            if (deleteMode === 'only_me') {
                                // Delete only for the deleter
                                if (!message.deletedFor.includes(deleterId)) {
                                    message.deletedFor.push(deleterId);
                                    console.log(`🗑️ Marked message ${messageId} as deleted for user ${deleterId} (only_me)`);
                                } else {
                                    console.log(`ℹ️ Message ${messageId} already deleted for user ${deleterId}`);
                                }
                            } else if (deleteMode === 'everyone') {
                                // Delete for everyone (only message sender can do this)
                                if (message.senderId === deleterId) {
                                    // Delete for all users who might have access
                                    const allUserIds = users.map(u => u.id);
                                    message.deletedFor = [...new Set([...message.deletedFor, ...allUserIds])];
                                    if (!message.deletedBy.includes(deleterId)) {
                                        message.deletedBy.push(deleterId);
                                    }
                                    console.log(`🗑️ Marked message ${messageId} as deleted for ALL users (everyone)`);
                                } else {
                                    console.log(`❌ User ${deleterId} not authorized to delete message ${messageId} for everyone. Sender is ${message.senderId}`);
                                    return false; // Not authorized
                                }
                            } else if (deleteMode === 'this_message') {
                                // Delete this specific message for deleter
                                if (!message.deletedFor.includes(deleterId)) {
                                    message.deletedFor.push(deleterId);
                                    console.log(`🗑️ Marked message ${messageId} as deleted for user ${deleterId} (this_message)`);
                                } else {
                                    console.log(`ℹ️ Message ${messageId} already deleted for user ${deleterId}`);
                                }
                            }
                            
                            // Save the updated messages back to file
                            messages[messageIndex] = message;
                            fs.writeFileSync(chatFile, JSON.stringify(messages, null, 4));
                            console.log(`💾 Saved updated chat file: ${chatFile}`);
                            
                            // Log final state
                            console.log(`📊 Final state - deletedFor: [${message.deletedFor.join(', ')}], deletedBy: [${message.deletedBy.join(', ')}]`);
                            
                            return true; // Message found and processed
                        }
                    }
                } catch (error) {
                    console.error(`❌ Khalad chat file ${chatFile}:`, error);
                }
            }
        }
    }
    
    if (!foundInAnyChat) {
        console.log(`❌ Message ${messageId} not found in any chat file`);
    }
    
    return foundInAnyChat;
}

// 🆕 API: Delete message - SAXDA (IMPROVED)
app.post('/api/chat/delete-message', requireLogin, (req, res) => {
    const { messageId, deleteMode } = req.body;
    const deleterId = req.session.user.id;
    
    console.log(`📨 Delete request - Message: ${messageId}, Mode: ${deleteMode}, User: ${deleterId}`);
    
    // Validate input
    if (!messageId || !deleteMode) {
        console.log(`❌ Validation failed - Missing messageId or deleteMode`);
        return res.status(400).json({ 
            success: false, 
            message: 'Fadlan soo geli messageId iyo deleteMode' 
        });
    }
    
    // Validate deleteMode
    const validModes = ['only_me', 'everyone', 'this_message'];
    if (!validModes.includes(deleteMode)) {
        console.log(`❌ Validation failed - Invalid deleteMode: ${deleteMode}`);
        return res.status(400).json({ 
            success: false, 
            message: 'DeleteMode waa khalad. Ku dooro: only_me, everyone, ama this_message' 
        });
    }
    
    try {
        const deleted = deleteMessage(messageId, deleterId, deleteMode);
        
        if (deleted) {
            console.log(`✅ Delete successful for message ${messageId}`);
            res.json({ 
                success: true, 
                message: 'Fariinta si guul leh ayaa loo tirtiray',
                deleteMode: deleteMode
            });
        } else {
            console.log(`❌ Delete failed - Message ${messageId} not found or not authorized`);
            res.status(404).json({ 
                success: false, 
                message: 'Fariinta lama helin ama awood uma lihid' 
            });
        }
    } catch (error) {
        console.error('❌ Khalad delete-message:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Khalad tirtirida fariinta' 
        });
    }
});

// =========================================================
//           ENHANCED CHAT HISTORY WITH DELETION FILTERING
// =========================================================

// 🆕 Function: Get chat history with deleted messages filtered - SAXDA
function getChatHistoryWithFilter(userId, partnerId) {
    const messages = getChatHistory(userId, partnerId);
    
    console.log(`📨 Raw messages from chat between ${userId} and ${partnerId}: ${messages.length}`);
    
    // Filter out messages deleted for current user
    const filteredMessages = messages.filter(message => {
        const isDeleted = message.deletedFor && message.deletedFor.includes(userId);
        if (isDeleted) {
            console.log(`🗑️ Filtering out deleted message: ${message.id} for user ${userId}`);
        }
        return !isDeleted;
    });
    
    console.log(`📨 Filtered messages: ${filteredMessages.length}`);
    
    return filteredMessages;
}

// 🆕 API: Get enhanced chat history - SAXDA
app.get('/api/chat/enhanced-history/:partnerId', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    const partnerId = parseInt(req.params.partnerId);
    
    console.log(`📨 Enhanced history request - User: ${userId}, Partner: ${partnerId}`);
    
    if (isNaN(partnerId)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Partner ID waa khalad' 
        });
    }
    
    try {
        const filteredMessages = getChatHistoryWithFilter(userId, partnerId);
        
        // Add status information to each message
        const enhancedMessages = filteredMessages.map(message => ({
            ...message,
            isMyMessage: message.senderId === userId,
            isRead: message.readBy && message.readBy.includes(partnerId),
            isDeletedForMe: message.deletedFor && message.deletedFor.includes(userId),
            canDelete: message.senderId === userId,
            deletedForCount: message.deletedFor ? message.deletedFor.length : 0,
            deletedByCount: message.deletedBy ? message.deletedBy.length : 0
        }));
        
        res.json({ 
            success: true, 
            messages: enhancedMessages,
            stats: {
                total: enhancedMessages.length,
                deleted: getChatHistory(userId, partnerId).length - enhancedMessages.length
            }
        });
        
    } catch (error) {
        console.error('❌ Khalad enhanced-history:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Khalad soo dejinta taariikhda sheekada' 
        });
    }
});






// =========================================================
//           MESSAGE STATUS SYSTEM - SAXDA
// =========================================================

// 🆕 Function: Get message status - SAXDA
function getMessageStatus(messageId, userId) {
    const users = getUsers();
    
    for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length; j++) {
            const user1 = users[i];
            const user2 = users[j];
            
            const chatFiles = [
                getChatFilePath(user1.id, user2.id),
                getChatFilePath(user2.id, user1.id)
            ];
            
            for (const chatFile of chatFiles) {
                try {
                    if (fs.existsSync(chatFile)) {
                        const messages = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
                        const message = messages.find(msg => msg.id === messageId);
                        
                        if (message) {
                            return {
                                id: message.id,
                                senderId: message.senderId,
                                readBy: message.readBy || [],
                                delivered: true,
                                timestamp: message.timestamp,
                                isDeleted: (message.deletedFor || []).includes(userId),
                                deletedFor: message.deletedFor || [],
                                deletedBy: message.deletedBy || []
                            };
                        }
                    }
                } catch (error) {
                    console.error(`Khalad chat file ${chatFile}:`, error);
                }
            }
        }
    }
    
    return null;
}

// 🆕 API: Get message status (read/delivered) - SAXDA
app.get('/api/chat/message-status/:messageId', requireLogin, (req, res) => {
    const messageId = req.params.messageId;
    const userId = req.session.user.id;
    
    // Validate messageId
    if (!messageId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Message ID waa loo baahan yahay' 
        });
    }
    
    try {
        const messageStatus = getMessageStatus(messageId, userId);
        
        if (messageStatus) {
            res.json({ 
                success: true, 
                status: messageStatus 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Fariinta lama helin' 
            });
        }
    } catch (error) {
        console.error('Khalad message-status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Khalad soo dejinta xaaladda fariinta' 
        });
    }
});

// =========================================================
//           ENHANCED CHAT HISTORY - SAXDA
// =========================================================

// 🆕 Function: Get enhanced chat history with status - SAXDA
app.get('/api/chat/enhanced-history/:partnerId', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    const partnerId = parseInt(req.params.partnerId);
    
    // Validate partnerId
    if (isNaN(partnerId)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Partner ID waa khalad' 
        });
    }
    
    try {
        const messages = getChatHistory(userId, partnerId);
        
        // Filter out messages deleted for current user
        const filteredMessages = messages.filter(message => 
            !message.deletedFor || !message.deletedFor.includes(userId)
        );
        
        // Add status information to each message
        const enhancedMessages = filteredMessages.map(message => ({
            ...message,
            isMyMessage: message.senderId === userId,
            isRead: message.readBy && message.readBy.includes(partnerId),
            isDeletedForMe: message.deletedFor && message.deletedFor.includes(userId),
            canDelete: message.senderId === userId // Only sender can delete for everyone
        }));
        
        res.json({ 
            success: true, 
            messages: enhancedMessages 
        });
    } catch (error) {
        console.error('Khalad enhanced-history:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Khalad soo dejinta taariikhda sheekada' 
        });
    }
});








// =========================================================
//                   SETTINGS ROUTES - HAGAAGSAN
// =========================================================

// 2. CHANGE PASSWORD (HAGAAGSAN)
app.post('/settings/change-password', requireLogin, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.session.user.id; 

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Fadlan buuxi dhammaan sanduuqyada.' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Furaha sirta cusub waa inuu ka yaraan 6 xaraf.' });
    }

    try {
        let users = getUsers();
        const currentUserIndex = users.findIndex(u => u.id === userId);
        const user = users[currentUserIndex];

        if (currentUserIndex === -1) {
            return res.status(404).json({ success: false, message: 'User-ka lama helin.' });
        }
        
        // HAGAAGSIN: Hubi in password-ku ay plain text tahay ama hashed
        let isMatch;
        
        // Haddii password-ku ay tahay hashed (waxay bilowdaa $2b$)
        if (user.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(oldPassword, user.password);
        } else {
            // Haddii password-ku ay tahay plain text
            isMatch = (oldPassword === user.password);
        }

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Furaha sirta ee hadda jira ma saxna.' });
        }

        // Hash-garee sirta cusub
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        users[currentUserIndex].password = hashedNewPassword;
        saveUsers(users);

        res.json({ success: true, message: 'Furaha sirta si guul leh ayaa loo badalay.' });

    } catch (error) {
        console.error('Khalad ku yimid badalka password-ka:', error);
        res.status(500).json({ success: false, message: 'Khalad server gudaha ah.' });
    }
});

// =========================================================
//           SETTINGS ROUTES - CUSUB (With Auto Delete Old Images)
// =========================================================

// --- API: Update Username and Profile Image ---
app.post('/settings/update', requireLogin, profileUpload.single('newProfileImage'), (req, res) => {
    const { newUsername } = req.body;
    const currentUserId = req.session.user.id;

    if (!newUsername || newUsername.trim() === '') {
        return res.status(400).json({ success: false, message: 'Username cusub waa loo baahan yahay.' });
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUserId);

    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User lama helin.' });
    }

    // Check if new username is already taken by another user
    const usernameExists = users.some(user => 
        user.username === newUsername && user.id !== currentUserId
    );

    if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username-kan horay ayaa loo isticmaalay.' });
    }

    // Store old profile image path before updating
    const oldProfileImagePath = users[userIndex].profileImage;

    // Update username
    users[userIndex].username = newUsername.trim();

    // Update profile image if provided
    if (req.file) {
        const newProfileImagePath = '/profiles/' + req.file.filename;
        users[userIndex].profileImage = newProfileImagePath;

        // 🗑️ TIRTIR SAWIRKA HORE HADDII UU JIRO OO AAN DEFAULT AHYN
        if (oldProfileImagePath && 
            oldProfileImagePath !== '/profiles/default.png' &&
            oldProfileImagePath.startsWith('/profiles/')) {
            
            try {
                const oldImageFilename = path.basename(oldProfileImagePath);
                const oldImageFullPath = path.join(profileUploadDir, oldImageFilename);
                
                if (fs.existsSync(oldImageFullPath)) {
                    fs.unlinkSync(oldImageFullPath);
                    console.log(`✅ Sawirka hore waa la tirtiray: ${oldImageFilename}`);
                }
            } catch (error) {
                console.error('❌ Khalad ku yimid tirtirista sawirka hore:', error);
                // Ha joojin cusboonaysiinta haddii tirtirida ay fashilantahay
            }
        }
    }

    saveUsers(users);

    // Update session
    req.session.user.username = users[userIndex].username;
    req.session.user.profileImage = users[userIndex].profileImage;

    res.json({ 
        success: true, 
        message: 'Xogta si guul leh ayaa loo cusboonaysiiyay!',
        user: req.session.user
    });
});

// --- API: Delete User Account (With Enhanced Image Cleanup) ---
app.post('/settings/delete-account', requireLogin, (req, res) => {
    const currentUserId = req.session.user.id;
    let users = getUsers();
    let posts = getPosts();
    let comments = getComments();
    let music = getMusic();

    const userIndex = users.findIndex(u => u.id === currentUserId);

    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User lama helin.' });
    }

    // 🗑️ Tirtir sawirka profile-ka user-ka
    const userProfileImage = users[userIndex].profileImage;
    if (userProfileImage && 
        userProfileImage !== '/profiles/default.png' &&
        userProfileImage.startsWith('/profiles/')) {
        
        try {
            const imageFilename = path.basename(userProfileImage);
            const imageFullPath = path.join(profileUploadDir, imageFilename);
            
            if (fs.existsSync(imageFullPath)) {
                fs.unlinkSync(imageFullPath);
                console.log(`✅ Sawirka profile-ka user-ka waa la tirtiray: ${imageFilename}`);
            }
        } catch (error) {
            console.error('❌ Khalad ku yimid tirtirista sawirka profile-ka:', error);
        }
    }

    // 🗑️ Tirtir media-ka posts-ka user-ka
    const userPosts = posts.filter(p => p.userId === currentUserId);
    userPosts.forEach(post => {
        if (post.mediaPath && post.mediaPath.startsWith('/media-posts/')) {
            try {
                const mediaFilename = path.basename(post.mediaPath);
                const mediaFullPath = path.join(mediaPostDir, mediaFilename);
                
                if (fs.existsSync(mediaFullPath)) {
                    fs.unlinkSync(mediaFullPath);
                    console.log(`✅ Media-ka post-ka waa la tirtiray: ${mediaFilename}`);
                }
            } catch (error) {
                console.error('❌ Khalad ku yimid tirtirista media-ka post-ka:', error);
            }
        }
    });

    // 🗑️ Tirtir muusigga user-ka
    const userMusic = music.filter(m => m.uploadedByUserId === currentUserId);
    userMusic.forEach(song => {
        if (song.mediaPath && song.mediaPath.startsWith('/music-media/')) {
            try {
                const musicFilename = path.basename(song.mediaPath);
                const musicFullPath = path.join(MUSIC_UPLOAD_DIR, musicFilename);
                
                if (fs.existsSync(musicFullPath)) {
                    fs.unlinkSync(musicFullPath);
                    console.log(`✅ Faylka muusigga waa la tirtiray: ${musicFilename}`);
                }
            } catch (error) {
                console.error('❌ Khalad ku yimid tirtirista faylka muusigga:', error);
            }
        }
    });

    // Remove user's data from all collections
    posts = posts.filter(p => p.userId !== currentUserId);
    comments = comments.filter(c => c.userId !== currentUserId);
    music = music.filter(m => m.uploadedByUserId !== currentUserId);
    
    // Remove user from users list
    users.splice(userIndex, 1);

    // Save all updated data
    savePosts(posts);
    saveComments(comments);
    saveMusic(music);
    saveUsers(users);

    // Destroy session
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Khalad ku yimid burinta session-ka:', err);
        }
        res.json({ 
            success: true, 
            message: 'Akoonkaaga si guul leh ayaa loo tirtiray!' 
        });
    });
});

// =========================================================
//           CLEANUP FUNCTION - Tirtir Sawiro Aan La Isticmaalin
// =========================================================

function cleanupUnusedProfileImages() {
    try {
        const users = getUsers();
        const usedImages = new Set();
        
        // Urur dhammaan sawirada la isticmaalayo
        users.forEach(user => {
            if (user.profileImage && user.profileImage.startsWith('/profiles/')) {
                const filename = path.basename(user.profileImage);
                usedImages.add(filename);
            }
        });

        // Akhri dhammaan faylasha galka profile
        const files = fs.readdirSync(profileUploadDir);
        
        files.forEach(file => {
            // Ha tirtirin default.png
            if (file === 'default.png') return;
            
            if (!usedImages.has(file)) {
                try {
                    const filePath = path.join(profileUploadDir, file);
                    fs.unlinkSync(filePath);
                    console.log(`🧹 Sawir aan la isticmaalin waa la tirtiray: ${file}`);
                } catch (error) {
                    console.error(`❌ Khalad ku yimid tirtirista ${file}:`, error);
                }
            }
        });
        
        console.log('✅ Nadiifinta sawirada waa la dhammaystiray');
    } catch (error) {
        console.error('❌ Khalad ku yimid nadiifinta sawirada:', error);
    }
}

// =========================================================
//           ADMIN CLEANUP ROUTE (Optional)
// =========================================================

app.post('/api/admin/cleanup-images', requireAdmin, (req, res) => {
    try {
        cleanupUnusedProfileImages();
        res.json({ success: true, message: 'Nadiifinta sawirada waa la dhammaystiray' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Khalad ku yimid nadiifinta' });
    }
});

// =========================================================
//           FUNCTION: UPDATE EXISTING USERS TO HASHED
// =========================================================


// =========================================================
//           FUNCTION: UPDATE EXISTING USERS TO HASHED
// =========================================================

async function updateAllUsersToHashedPasswords() {
    try {
        const users = getUsers();
        let updatedCount = 0;
        
        for (let user of users) {
            // Haddii password-ku aanu ahayn hashed
            if (user.password && !user.password.startsWith('$2b$')) {
                console.log(`Hashing password for user: ${user.username}`);
                user.password = await bcrypt.hash(user.password, 10);
                updatedCount++;
            }
        }
        
        if (updatedCount > 0) {
            saveUsers(users);
            console.log(`Waxaa la hagaajiyay ${updatedCount} user oo password-yadooda loo beddelay hashed`);
        } else {
            console.log('Dhammaan user-yada waxay leeyihiin hashed passwords');
        }
    } catch (error) {
        console.error('Khalad ku yimid hagaajinta user-yada:', error);
    }
}

// =========================================================
//                          ADMIN ROUTES
// =========================================================

app.get('/api/admin/users', requireAdmin, (req, res) => {
    const users = getUsers();
    const posts = getPosts();
    const allComments = getComments();
    
    const userStats = {};
    users.forEach(user => {
        userStats[user.id] = { postCount: 0, commentCount: 0 };
    });

    posts.forEach(post => {
        if (userStats[post.userId]) userStats[post.userId].postCount++;
    });

    allComments.forEach(comment => {
        if (userStats[comment.userId]) userStats[comment.userId].commentCount++;
    });

    const usersWithStats = users.map(user => ({
        id: user.id,
        username: user.username,
        joinedAt: user.joinedAt,
        isAdmin: user.isAdmin,
        isBlocked: user.isBlocked,
        postCount: userStats[user.id] ? userStats[user.id].postCount : 0,
        commentCount: userStats[user.id] ? userStats[user.id].commentCount : 0
    }));
    
    res.json({ success: true, users: usersWithStats });
});

// =========================================================
// ENHANCED ADMIN BLOCK USER FUNCTION
// =========================================================
app.post('/api/admin/toggle-block/:id', requireAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) return res.json({ success: false, message: 'User lama helin.' });

    const wasBlocked = users[userIndex].isBlocked;
    users[userIndex].isBlocked = !users[userIndex].isBlocked;
    saveUsers(users);

    // 🚨 CUSUB: Haddii user-ka la xannibay, destroy sessions-kiisa
    if (!wasBlocked && users[userIndex].isBlocked) {
        console.log(`🚨 User ${users[userIndex].username} waa la xannibay - waa inuu logout gareeyaa`);
    }

    res.json({ 
        success: true, 
        isBlocked: users[userIndex].isBlocked,
        message: users[userIndex].isBlocked ? 
            `User-ka waa la xannibay. Wuxuu logout gareyn doonaa marka uu page refresh gareeyo.` :
            `User-ka waa la furtay.`
    });
});

app.post('/api/admin/delete-user/:id', requireAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    let users = getUsers();

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.json({ success: false, message: 'User lama helin.' });

    let posts = getPosts().filter(p => p.userId !== userId);
    let comments = getComments().filter(c => c.userId !== userId);
    savePosts(posts);
    saveComments(comments);
    
    users.splice(userIndex, 1);
    saveUsers(users);

    res.json({ success: true });
});

// =========================================================
// ENHANCED CLEANUP FUNCTION - Muuji sawirada la tirtirayo
// =========================================================
function cleanupUnusedProfileImages() {
    try {
        const users = getUsers();
        const usedImages = new Set();
        const cleanupReport = {
            totalFiles: 0,
            deletedFiles: 0,
            keptFiles: 0,
            deletedList: [],
            keptList: []
        };
        
        // Urur dhammaan sawirada la isticmaalayo
        users.forEach(user => {
            if (user.profileImage && user.profileImage.startsWith('/profiles/')) {
                const filename = path.basename(user.profileImage);
                usedImages.add(filename);
                cleanupReport.keptList.push({
                    filename: filename,
                    username: user.username,
                    reason: 'In use'
                });
            }
        });

        // Akhri dhammaan faylasha galka profile
        const files = fs.readdirSync(profileUploadDir);
        cleanupReport.totalFiles = files.length;
        
        files.forEach(file => {
            // Ha tirtirin default.png
            if (file === 'default.png') {
                cleanupReport.keptList.push({
                    filename: file,
                    username: 'System',
                    reason: 'Default image'
                });
                return;
            }
            
            if (!usedImages.has(file)) {
                try {
                    const filePath = path.join(profileUploadDir, file);
                    const fileStats = fs.statSync(filePath);
                    
                    fs.unlinkSync(filePath);
                    cleanupReport.deletedFiles++;
                    cleanupReport.deletedList.push({
                        filename: file,
                        size: (fileStats.size / 1024).toFixed(2) + ' KB',
                        deletedAt: new Date().toISOString()
                    });
                    
                    console.log(`🧹 Sawir aan la isticmaalin waa la tirtiray: ${file}`);
                } catch (error) {
                    console.error(`❌ Khalad ku yimid tirtirista ${file}:`, error);
                }
            } else {
                cleanupReport.keptFiles++;
            }
        });
        
        console.log('✅ Nadiifinta sawirada waa la dhammaystiray');
        return cleanupReport;
    } catch (error) {
        console.error('❌ Khalad ku yimid nadiifinta sawirada:', error);
        throw error;
    }
}

// =========================================================
// ENHANCED ADMIN CLEANUP ROUTE
// =========================================================
app.post('/api/admin/cleanup-images', requireAdmin, (req, res) => {
    try {
        const cleanupReport = cleanupUnusedProfileImages();
        res.json({ 
            success: true, 
            message: `Nadiifinta sawirada waa la dhammaystiray. ${cleanupReport.deletedFiles} fayl ayaa la tirtiray.`,
            report: cleanupReport
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Khalad ku yimid nadiifinta' });
    }
});

// =========================================================
// SYSTEM ANNOUNCEMENTS & POLICIES
// =========================================================

// --- API: Soo dejinta announcements-ka ---
app.get('/api/announcements', requireLogin, (req, res) => {
    const announcements = getAnnouncements();
    res.json({ success: true, announcements: announcements });
});

// --- API: Abuurista announcement cusub (Admin only) ---
app.post('/api/admin/announcements', requireAdmin, (req, res) => {
    const { title, message, type = 'info' } = req.body;
    
    if (!title || !message) {
        return res.status(400).json({ success: false, message: 'Fadlan buuxi cinwaanka iyo fariinta.' });
    }

    const announcements = getAnnouncements();
    const newAnnouncement = {
        id: 'announce_' + Date.now().toString(),
        title: title,
        message: message,
        type: type, // 'info', 'warning', 'success', 'error'
        createdBy: req.session.user.username,
        createdAt: new Date().toISOString(),
        isActive: true
    };

    announcements.unshift(newAnnouncement);
    
    // Keep only last 10 announcements
    if (announcements.length > 10) {
        announcements.splice(10);
    }
    
    saveAnnouncements(announcements);

    res.json({ 
        success: true, 
        message: 'Fariinta si guul leh ayaa loo soo dhigay!',
        announcement: newAnnouncement
    });
});

// =========================================================
// ADMIN GROUP MANAGEMENT
// =========================================================

// --- API: Soo dejinta kooxda admin-ka ---
app.get('/api/admin/group', requireLogin, (req, res) => {
    const adminGroup = getAdminGroup();
    const users = getUsers();
    
    // Add user details to group members
    const membersWithDetails = adminGroup.members.map(memberId => {
        const user = users.find(u => u.id === memberId);
        return user ? {
            id: user.id,
            username: user.username,
            profileImage: user.profileImage,
            isOnline: false
        } : null;
    }).filter(Boolean);

    // Add details to invitations
    const invitationsWithDetails = adminGroup.invitations.map(invitation => {
        const user = users.find(u => u.id === invitation.userId);
        return user ? {
            ...invitation,
            username: user.username,
            profileImage: user.profileImage
        } : null;
    }).filter(Boolean);

    res.json({ 
        success: true, 
        group: {
            members: membersWithDetails,
            invitations: invitationsWithDetails
        }
    });
});

// --- API: Ku dir codsi kooxda admin-ka (Zaki kaliya) ---
app.post('/api/admin/group/invite', requireAdmin, (req, res) => {
    const { userId } = req.body;
    const currentUser = req.session.user;
    
    // 🛡️ Kaliya Zaki ayaa awood u leh inuu ku daro kooxda
    if (currentUser.username !== 'zaki') {
        return res.status(403).json({ 
            success: false, 
            message: 'Kaliya Zaki ayaa awood u leh inuu ku daro kooxda admin-ka.' 
        });
    }

    const users = getUsers();
    const targetUser = users.find(u => u.id === parseInt(userId));
    
    if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User lama helin.' });
    }

    if (targetUser.isAdmin) {
        return res.status(400).json({ success: false, message: 'User-kan horay ayuu ugu jiraa kooxda admin-ka.' });
    }

    const adminGroup = getAdminGroup();
    
    // Hubi in aan horey ugu jirin invitations
    const existingInvitation = adminGroup.invitations.find(inv => inv.userId === parseInt(userId));
    if (existingInvitation) {
        return res.status(400).json({ success: false, message: 'Horay ayaa loo diray codsi kooxda.' });
    }

    const newInvitation = {
        id: 'invite_' + Date.now().toString(),
        userId: parseInt(userId),
        invitedBy: currentUser.username,
        invitedAt: new Date().toISOString(),
        status: 'pending'
    };

    adminGroup.invitations.push(newInvitation);
    saveAdminGroup(adminGroup);

    res.json({ 
        success: true, 
        message: `Codsi kooxda admin-ka ayaa loo diray ${targetUser.username}.`,
        invitation: newInvitation
    });
});

// --- API: Ka saar qof kooxda admin-ka (Zaki kaliya) ---
app.post('/api/admin/group/remove', requireAdmin, (req, res) => {
    const { userId } = req.body;
    const currentUser = req.session.user;
    
    // 🛡️ Kaliya Zaki ayaa awood u leh inuu ka saaro kooxda
    if (currentUser.username !== 'zaki') {
        return res.status(403).json({ 
            success: false, 
            message: 'Kaliya Zaki ayaa awood u leh inuu ka saaro kooxda admin-ka.' 
        });
    }

    const adminGroup = getAdminGroup();
    const userIndex = adminGroup.members.indexOf(parseInt(userId));
    
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User-kan ma ku jiro kooxda admin-ka.' });
    }

    // Ha ka saarin Zaki naftiisa
    if (parseInt(userId) === currentUser.id) {
        return res.status(400).json({ success: false, message: 'Kuma saari kartid naftaada kooxda admin-ka.' });
    }

    adminGroup.members.splice(userIndex, 1);
    saveAdminGroup(adminGroup);

    // Update user isAdmin status
    const users = getUsers();
    const userToRemove = users.find(u => u.id === parseInt(userId));
    if (userToRemove) {
        userToRemove.isAdmin = false;
        saveUsers(users);
    }

    res.json({ 
        success: true, 
        message: `User-ka waa laga saaray kooxda admin-ka.`
    });
});

// --- API: Aqbal codsiga kooxda (User can accept invitation) ---
app.post('/api/admin/group/accept', requireLogin, (req, res) => {
    const { invitationId } = req.body;
    const currentUser = req.session.user;
    
    const adminGroup = getAdminGroup();
    const invitationIndex = adminGroup.invitations.findIndex(inv => inv.id === invitationId && inv.userId === currentUser.id);
    
    if (invitationIndex === -1) {
        return res.status(404).json({ success: false, message: 'Codsiga lama helin ama ma aha mid kuu sax ah.' });
    }

    const invitation = adminGroup.invitations[invitationIndex];
    
    // Add user to admin group members
    if (!adminGroup.members.includes(currentUser.id)) {
        adminGroup.members.push(currentUser.id);
    }
    
    // Remove the invitation
    adminGroup.invitations.splice(invitationIndex, 1);
    saveAdminGroup(adminGroup);

    // Update user isAdmin status
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].isAdmin = true;
        saveUsers(users);
        
        // Update session
        req.session.user.isAdmin = true;
    }

    res.json({ 
        success: true, 
        message: `Waad ku biirtay kooxda admin-ka!`
    });
});

// --- API: Diid codsiga kooxda (User can reject invitation) ---
app.post('/api/admin/group/reject', requireLogin, (req, res) => {
    const { invitationId } = req.body;
    const currentUser = req.session.user;
    
    const adminGroup = getAdminGroup();
    const invitationIndex = adminGroup.invitations.findIndex(inv => inv.id === invitationId && inv.userId === currentUser.id);
    
    if (invitationIndex === -1) {
        return res.status(404).json({ success: false, message: 'Codsiga lama helin ama ma aha mid kuu sax ah.' });
    }

    // Remove the invitation
    adminGroup.invitations.splice(invitationIndex, 1);
    saveAdminGroup(adminGroup);

    res.json({ 
        success: true, 
        message: `Waad diiday codsiga kooxda admin-ka.`
    });
});

// =========================================================
//                          WILWAAL STUDIO (MUSIC) ROUTES
// =========================================================

// --- ROUTE-KA SOO GELINTA MUUSIGGA (UPLOAD MUSIC) - SAXDA AH ---
const uploadMusicFiles = multer();

app.post('/upload-music', requireLogin, uploadMusicFiles.fields([
    { name: 'artistImage', maxCount: 1 },
    { name: 'musicFile', maxCount: 1 }
]), (req, res) => {
    const { artistName, songTitle } = req.body;

    // 🛡️ Hubi in labada file ay soo galeen
    if (!req.files || !req.files.artistImage || !req.files.musicFile) {
        return res.status(400).send('Fadlan soo geli file muusig iyo sawirka fanaanka.');
    }

    if (!artistName || !songTitle) {
        return res.status(400).send('Fadlan buuxi Magaca Fanaanka iyo Magaca Heesta.');
    }
    
    const musicData = getMusic();

    try {
        // Process artist image
        const artistImageFile = req.files.artistImage[0];
        const artistImageFilename = 'artist-' + artistName.replace(/[^a-zA-Z0-9]/g, '_') + '-' + Date.now() + path.extname(artistImageFile.originalname);
        const artistImagePath = path.join(ARTIST_IMAGES_DIR, artistImageFilename);
        
        // Process music file
        const musicFile = req.files.musicFile[0];
        const musicFilename = 'music-' + req.session.user.username + '-' + Date.now() + path.extname(musicFile.originalname);
        const musicFilePath = path.join(MUSIC_UPLOAD_DIR, musicFilename);

        // Save files
        fs.writeFileSync(artistImagePath, artistImageFile.buffer);
        fs.writeFileSync(musicFilePath, musicFile.buffer);

        const newMusicEntry = {
            id: 'music_' + Date.now().toString(),
            artistName: artistName.trim(),
            songTitle: songTitle.trim(),
            artistImage: '/artist-images/' + artistImageFilename, // 🎯 CUSUB
            mediaPath: '/music-media/' + musicFilename,
            mediaMimeType: musicFile.mimetype, 
            uploadedByUserId: req.session.user.id,
            uploadedByUsername: req.session.user.username,
            uploadedAt: new Date().toISOString(),
            views: 0
        };
        
        musicData.push(newMusicEntry);
        saveMusic(musicData);

        res.send(`<script>alert('Muusiga si guul leh ayaa loo soo geliyay!'); window.location.href = '/wilwaal-studio.html';</script>`);
    } catch (error) {
        console.error('Khalad ku yimid soo gelinta muusigga:', error);
        res.status(500).send('Khalad ku yimid soo gelinta muusigga.');
    }
});

// --- API: Soo Deji Liiska Fanaaniinta ---
app.get('/api/music/artists', requireLogin, (req, res) => {
    const musicData = getMusic();
    
    const allArtists = musicData.map(m => m.artistName.trim());
    const uniqueArtists = [...new Set(allArtists)];
    
    const artistList = uniqueArtists.map(artist => {
        const songCount = musicData.filter(m => m.artistName === artist).length;
        return { 
            name: artist, 
            songCount: songCount 
        };
    });

    res.json({ success: true, artists: artistList });
});

// --- API: Soo Deji Heesaha Fanaan Gaar ah ---
app.get('/api/music/songs/:artistName', requireLogin, (req, res) => {
    const artistName = req.params.artistName;
    const users = getUsers(); 
    
    const musicData = getMusic();
    
    const songs = musicData
        .filter(m => m.artistName.toLowerCase() === artistName.toLowerCase())
        .map(m => {
            const uploader = users.find(u => u.id === m.uploadedByUserId);
            
            return {
                id: m.id,
                artistName: m.artistName,
                songTitle: m.songTitle,
                artistImage: m.artistImage, // 🎯 CUSUB
                mediaPath: m.mediaPath,
                mediaMimeType: m.mediaMimeType,
                uploadedAt: m.uploadedAt,
                uploadedByUsername: uploader ? uploader.username : "User La Tirtiray",
                isCurrentUserAdmin: req.session.user.isAdmin
            };
        });

    if (songs.length === 0) {
        return res.status(404).json({ success: false, message: "Lama helin wax heeso ah ee fanaankan." });
    }

    res.json({ success: true, artistName: artistName, songs: songs });
});

// --- API: Raadinta Muusigga (Search) ---
app.get('/api/music/search', requireLogin, (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    const musicData = getMusic();
    const users = getUsers();

    if (!query) {
         return res.json({ success: true, results: [] });
    }

    const searchResults = musicData
        .filter(m => 
            m.songTitle.toLowerCase().includes(query) ||
            m.artistName.toLowerCase().includes(query) ||
            (m.uploadedByUsername && m.uploadedByUsername.toLowerCase().includes(query)) 
        )
        .map(m => {
            const uploader = users.find(u => u.id === m.uploadedByUserId);
            return {
                id: m.id,
                songTitle: m.songTitle,
                artistName: m.artistName,
                artistImage: m.artistImage, // 🎯 CUSUB
                uploadedByUsername: uploader ? uploader.username : "User La Tirtiray",
                uploadedAt: m.uploadedAt,
                isCurrentUserAdmin: req.session.user.isAdmin 
            };
        });

    res.json({ success: true, results: searchResults });
});

// --- API: Admin Modify Song (Beddelka) ---
app.post('/api/music/modify', requireAdmin, (req, res) => {
    const { songId, newTitle, newArtist } = req.body;
    const musicData = getMusic();
    const songIndex = musicData.findIndex(m => m.id === songId);

    if (songIndex === -1) {
        return res.status(404).json({ success: false, message: "Heesta lama helin." });
    }

    if (newTitle) musicData[songIndex].songTitle = newTitle.trim();
    if (newArtist) musicData[songIndex].artistName = newArtist.trim();
    
    saveMusic(musicData);
    res.json({ success: true, message: "Muusiga si guul leh ayaa loo beddelay.", song: musicData[songIndex] });
});

// --- API: Admin Delete Song (Tirtiridda) ---
app.delete('/api/music/delete/:songId', requireAdmin, (req, res) => {
    const songId = req.params.songId;
    let musicData = getMusic();
    const songToDelete = musicData.find(m => m.id === songId);

    if (!songToDelete) {
        return res.status(404).json({ success: false, message: "Heesta lama helin." });
    }

    // Tirtir faylka muusigga
    const musicFilePath = path.join(MUSIC_UPLOAD_DIR, path.basename(songToDelete.mediaPath));
    if (fs.existsSync(musicFilePath)) {
        fs.unlinkSync(musicFilePath);
    }

    // Tirtir sawirka fanaanka
    if (songToDelete.artistImage) {
        const artistImagePath = path.join(ARTIST_IMAGES_DIR, path.basename(songToDelete.artistImage));
        if (fs.existsSync(artistImagePath)) {
            fs.unlinkSync(artistImagePath);
        }
    }

    musicData = musicData.filter(m => m.id !== songId);
    saveMusic(musicData);
    
    res.json({ success: true, message: "Heesta si guul leh ayaa loo tirtiray." });
});

// =========================================================
//                          ROUTES HTML
// =========================================================

app.get('/index.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/create-post.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'create-post.html'));
});
app.get('/settings.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});
app.get('/profile.html', requireLogin, (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});
app.get('/admin.html', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Routes-ka Cusub ee Sheekada
app.get('/users-list.html', requireLogin, (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'users-list.html'));
});
app.get('/sheeko.html', requireLogin, (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'sheeko.html'));
});

// Routes-ka Cusub ee Muusigga (Wilwaal Studio)
app.get('/upload-music.html', requireLogin, (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'upload-music.html'));
});
app.get('/wilwaal-studio.html', requireLogin, (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'wilwaal-studio.html'));
});
app.get('/heesaha.html', requireLogin, (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'heesaha.html'));
});

// Ka Bixitaanka (Logout)
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/index.html');
        res.redirect('/login.html');
    });
});

// Default Route
app.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect('/index.html');
    } else {
        res.redirect('/login.html');
    }
});

// =========================================================
//                       BILOWGA SERVER-KA
// =========================================================
app.listen(PORT, async () => {
    console.log(`Server-ku wuxuu ka shaqaynayaa http://localhost:${PORT}`);
    
    // 🛠️ Hagaaji user-yada marka server bilowdo
    await updateAllUsersToHashedPasswords();
    
    // 🧹 Nadiifi sawirada aan la isticmaalin
    cleanupUnusedProfileImages();
});