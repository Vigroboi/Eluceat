// Initialize Supabase Client
const supabaseUrl = 'your-project-url'
const supabaseKey = 'your-anon-key'
const supabase = supabase.createClient(supabaseUrl, supabaseKey)

// DOM Elements
const clientName = document.getElementById('client-name')
const lastLoginDate = document.getElementById('last-login-date')
const chatMessages = document.getElementById('chat-messages')
const messageInput = document.getElementById('message-input')
const sendButton = document.getElementById('send-message')
const fileUpload = document.getElementById('file-upload')
const filesList = document.querySelector('.files-list')

// Initialize Portal
async function initializePortal() {
    // Check authentication
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        window.location.href = '/login.html'
        return
    }

    // Load user data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile) {
        clientName.textContent = profile.full_name
        lastLoginDate.textContent = new Date(profile.last_login).toLocaleString()
    }

    // Initialize real-time chat
    initializeChat()
    // Load files
    loadFiles()
    // Update progress bars
    updateProgress()

    await updateLastLogin()
    await loadDashboard()
    await loadProjects()
    await loadInvoices()
    await loadSupportTickets()
}

// Chat Functions
async function initializeChat() {
    // Subscribe to new messages
    const subscription = supabase
        .channel('public:messages')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages' 
        }, payload => {
            addMessageToChat(payload.new)
        })
        .subscribe()

    // Load existing messages
    const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

    messages.reverse().forEach(addMessageToChat)
}

function addMessageToChat(message) {
    const messageElement = document.createElement('div')
    messageElement.classList.add('message')
    messageElement.innerHTML = `
        <strong>${message.sender_name}:</strong>
        <p>${message.content}</p>
        <small>${new Date(message.created_at).toLocaleString()}</small>
    `
    chatMessages.appendChild(messageElement)
    chatMessages.scrollTop = chatMessages.scrollHeight
}

// File Handling
async function loadFiles() {
    const { data: files, error } = await supabase
        .storage
        .from('client-files')
        .list()

    if (error) {
        console.error('Error loading files:', error)
        return
    }

    filesList.innerHTML = files.map(file => `
        <div class="file-item">
            <i class="fa fa-file"></i>
            <span>${file.name}</span>
            <button onclick="downloadFile('${file.name}')">Download</button>
        </div>
    `).join('')
}

// Event Listeners
sendButton.addEventListener('click', async () => {
    const content = messageInput.value.trim()
    if (!content) return

    const { error } = await supabase
        .from('messages')
        .insert([{ 
            content,
            sender_id: (await supabase.auth.getUser()).data.user.id
        }])

    if (!error) {
        messageInput.value = ''
    }
})

fileUpload.addEventListener('change', async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const { error } = await supabase
        .storage
        .from('client-files')
        .upload(`${Date.now()}-${file.name}`, file)

    if (!error) {
        loadFiles()
    }
})

async function updateLastLogin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date().toISOString()
    const { error } = await supabase
        .from('profiles')
        .update({ 
            last_login: now,
            login_count: supabase.sql`login_count + 1`
        })
        .eq('id', user.id)

    if (!error) {
        lastLoginDate.textContent = new Date(now).toLocaleString()
    }
}

// Add new functions for each section
async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Load recent activity
    const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    // Update dashboard stats
    updateDashboardStats(activities)
}

async function loadProjects() {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

    displayProjects(projects)
}

async function loadInvoices() {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

    displayInvoices(invoices)
}

async function loadSupportTickets() {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: tickets } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

    displaySupportTickets(tickets)
}

// Add logout handler
document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signOut()
    if (!error) {
        window.location.href = '/login.html'
    }
})

// Initialize portal when page loads
document.addEventListener('DOMContentLoaded', initializePortal) 