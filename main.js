// Router
class Router {
    constructor() {
        this.routes = {};
        this.currentPath = '/';
        
        window.addEventListener('popstate', () => {
            this.loadRoute(window.location.pathname);
        });
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    navigate(path) {
        window.history.pushState({}, '', path);
        this.loadRoute(path);
    }

    loadRoute(path) {
        this.currentPath = path;
        const handler = this.routes[path] || this.routes['/'];
        if (handler) {
            handler();
        }
    }

    init() {
        this.loadRoute(window.location.pathname);
    }
}

// App State
const state = {
    projects: [],
    settings: {
        profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bufferclick'
    },
    isAuthenticated: sessionStorage.getItem('isAdminAuthenticated') === 'true'
};

// Database helpers
function getProjects(callback) {
    const projectsRef = window.dbRef(window.db, 'projects');
    window.dbOnValue(projectsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const projectsArray = Object.entries(data).map(([id, project]) => ({
                id,
                ...project
            }));
            projectsArray.sort((a, b) => a.order - b.order);
            state.projects = projectsArray;
        } else {
            state.projects = [];
        }
        callback(state.projects);
    });
}

function getSettings(callback) {
    const settingsRef = window.dbRef(window.db, 'settings');
    window.dbOnValue(settingsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            state.settings = { ...state.settings, ...data };
        }
        callback(state.settings);
    });
}

function addProject(project) {
    const projectsRef = window.dbRef(window.db, 'projects');
    return window.dbPush(projectsRef, project);
}

function deleteProject(projectId) {
    const projectRef = window.dbRef(window.db, `projects/${projectId}`);
    return window.dbRemove(projectRef);
}

function updateProjectsOrder(projects) {
    const updates = {};
    projects.forEach((project, idx) => {
        updates[`projects/${project.id}/order`] = idx;
    });
    return window.dbUpdate(window.dbRef(window.db), updates);
}

function updateSettings(settings) {
    const settingsRef = window.dbRef(window.db, 'settings');
    return window.dbSet(settingsRef, settings);
}

// Pages
function renderHome() {
    getSettings((settings) => {
        document.getElementById('app').innerHTML = `
            <div class="home-container">
                <div class="home-content">
                    <div class="profile-pic">
                        <img src="${settings.profilePicture}" alt="bufferclick">
                    </div>
                    <h1>Hello, I'm bufferclick</h1>
                    <p>I'm from Sweden and I love to make stuff</p>
                    <button class="btn btn-primary" id="browse-btn">Browse My Projects</button>
                </div>
            </div>
        `;

        document.getElementById('browse-btn').addEventListener('click', () => {
            router.navigate('/projects');
        });
    });
}

function renderProjects() {
    document.getElementById('app').innerHTML = `
        <div>
            <div class="header">
                <div class="container">
                    <div class="header-content">
                        <h1>My Projects</h1>
                        <button class="btn btn-primary" id="back-home-btn">Back to Home</button>
                    </div>
                </div>
            </div>
            <div class="container">
                <div id="projects-container" class="loading">Loading projects...</div>
            </div>
        </div>
    `;

    document.getElementById('back-home-btn').addEventListener('click', () => {
        router.navigate('/');
    });

    getProjects((projects) => {
        const container = document.getElementById('projects-container');
        
        if (projects.length === 0) {
            container.className = 'empty-state';
            container.innerHTML = 'No projects yet. Check back soon!';
            return;
        }

        container.className = 'projects-grid';
        container.innerHTML = projects.map(project => `
            <div class="project-card" data-url="${project.redirectUrl}">
                <div class="project-image">
                    <img src="${project.imageUrl}" alt="${project.name}">
                </div>
                <div class="project-info">
                    <h2>${project.name}</h2>
                    <p>${project.description}</p>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                window.open(card.dataset.url, '_blank');
            });
        });
    });
}

function renderAdminLogin() {
    document.getElementById('app').innerHTML = `
        <div class="login-container">
            <div class="login-box">
                <h1>Admin Login</h1>
                <form id="login-form">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" class="input" id="username" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" class="input" id="password" required>
                    </div>
                    <div id="error-container"></div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                </form>
                <div class="text-center">
                    <a href="#" class="text-link" id="back-link">Back to Home</a>
                </div>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'admin' && password === 'bufferclickbutterlick') {
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            state.isAuthenticated = true;
            router.navigate('/admin/panel');
        } else {
            document.getElementById('error-container').innerHTML = `
                <div class="error-message">Invalid credentials</div>
            `;
            document.getElementById('password').value = '';
        }
    });

    document.getElementById('back-link').addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate('/');
    });
}

function renderAdminPanel() {
    if (!state.isAuthenticated) {
        router.navigate('/admin');
        return;
    }

    document.getElementById('app').innerHTML = `
        <div class="admin-container">
            <div class="header">
                <div class="container">
                    <div class="header-content">
                        <h1>Admin Panel</h1>
                        <div class="admin-actions">
                            <button class="btn btn-primary" id="view-site-btn">View Site</button>
                            <button class="btn btn-secondary" id="logout-btn">Logout</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container">
                <!-- Settings Section -->
                <div class="settings-section">
                    <h2>Profile Settings</h2>
                    <div class="settings-preview" id="settings-preview">
                        <div class="settings-preview-pic">
                            <img src="${state.settings.profilePicture}" alt="Profile">
                        </div>
                        <div class="settings-preview-text">
                            <strong>Current Profile Picture</strong>
                            <span>This appears on the home page</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Profile Picture URL</label>
                        <input type="url" class="input" id="profile-pic-url" value="${state.settings.profilePicture}" placeholder="https://example.com/image.jpg">
                    </div>
                    <button class="btn btn-primary" id="save-settings-btn">Save Profile Picture</button>
                </div>

                <!-- Add Project Button -->
                <button class="btn btn-primary" id="add-project-btn">Add New Project</button>
                
                <!-- Add Project Form -->
                <div id="add-form-container"></div>
                
                <!-- Projects List -->
                <div class="project-list">
                    <h2>Manage Projects (<span id="project-count">0</span>)</h2>
                    <div id="projects-list-container"></div>
                </div>
            </div>
        </div>
    `;

    let showForm = false;

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.removeItem('isAdminAuthenticated');
        state.isAuthenticated = false;
        router.navigate('/admin');
    });

    // View Site
    document.getElementById('view-site-btn').addEventListener('click', () => {
        router.navigate('/');
    });

    // Save Profile Picture
    document.getElementById('save-settings-btn').addEventListener('click', () => {
        const profilePicUrl = document.getElementById('profile-pic-url').value;
        if (profilePicUrl) {
            updateSettings({ profilePicture: profilePicUrl }).then(() => {
                state.settings.profilePicture = profilePicUrl;
                document.querySelector('.settings-preview-pic img').src = profilePicUrl;
                alert('Profile picture updated successfully!');
            });
        }
    });

    // Load Settings
    getSettings((settings) => {
        state.settings = settings;
        document.getElementById('profile-pic-url').value = settings.profilePicture;
        document.querySelector('.settings-preview-pic img').src = settings.profilePicture;
    });

    // Toggle Add Form
    document.getElementById('add-project-btn').addEventListener('click', () => {
        showForm = !showForm;
        renderAddForm(showForm);
    });

    function renderAddForm(show) {
        const container = document.getElementById('add-form-container');
        
        if (!show) {
            container.innerHTML = '';
            document.getElementById('add-project-btn').textContent = 'Add New Project';
            return;
        }

        document.getElementById('add-project-btn').textContent = 'Cancel';
        container.innerHTML = `
            <div class="form-card">
                <h2>Add New Project</h2>
                <form id="project-form">
                    <div class="form-group">
                        <label>Project Name</label>
                        <input type="text" class="input" id="project-name" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea class="input" id="project-description" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Image URL</label>
                        <input type="url" class="input" id="project-image" placeholder="https://example.com/image.jpg" required>
                    </div>
                    <div class="form-group">
                        <label>Redirect URL</label>
                        <input type="url" class="input" id="project-url" placeholder="https://example.com" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Add Project</button>
                </form>
            </div>
        `;

        document.getElementById('project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newProject = {
                name: document.getElementById('project-name').value,
                description: document.getElementById('project-description').value,
                imageUrl: document.getElementById('project-image').value,
                redirectUrl: document.getElementById('project-url').value,
                order: state.projects.length
            };

            addProject(newProject).then(() => {
                showForm = false;
                renderAddForm(false);
            });
        });
    }

    // Load and render projects
    getProjects((projects) => {
        document.getElementById('project-count').textContent = projects.length;
        const container = document.getElementById('projects-list-container');
        
        if (projects.length === 0) {
            container.innerHTML = '<div class="empty-state">No projects yet. Add your first project above!</div>';
            return;
        }

        container.innerHTML = projects.map((project, index) => `
            <div class="project-item">
                <div class="project-thumbnail">
                    <img src="${project.imageUrl}" alt="${project.name}">
                </div>
                <div class="project-details">
                    <h3>${project.name}</h3>
                    <p>${project.description}</p>
                    <a href="${project.redirectUrl}" target="_blank">${project.redirectUrl}</a>
                </div>
                <div class="project-controls">
                    <button class="btn btn-primary btn-small ${index === 0 ? 'btn-disabled' : ''}" 
                            data-action="up" 
                            data-index="${index}"
                            ${index === 0 ? 'disabled' : ''}>
                        UP
                    </button>
                    <button class="btn btn-primary btn-small ${index === projects.length - 1 ? 'btn-disabled' : ''}" 
                            data-action="down" 
                            data-index="${index}"
                            ${index === projects.length - 1 ? 'disabled' : ''}>
                        DOWN
                    </button>
                    <button class="btn btn-danger btn-small" 
                            data-action="delete" 
                            data-id="${project.id}">
                        DELETE
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('button[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const index = parseInt(btn.dataset.index);
                const id = btn.dataset.id;

                if (action === 'delete') {
                    if (confirm('Are you sure you want to delete this project?')) {
                        deleteProject(id);
                    }
                } else if (action === 'up' && index > 0) {
                    const newProjects = [...projects];
                    [newProjects[index - 1], newProjects[index]] = [newProjects[index], newProjects[index - 1]];
                    updateProjectsOrder(newProjects);
                } else if (action === 'down' && index < projects.length - 1) {
                    const newProjects = [...projects];
                    [newProjects[index], newProjects[index + 1]] = [newProjects[index + 1], newProjects[index]];
                    updateProjectsOrder(newProjects);
                }
            });
        });
    });
}

// Initialize Router
const router = new Router();
router.addRoute('/', renderHome);
router.addRoute('/projects', renderProjects);
router.addRoute('/admin', renderAdminLogin);
router.addRoute('/admin/panel', renderAdminPanel);

// Start app
router.init();
