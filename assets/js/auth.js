// Initialize Supabase Client
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = supabase.createClient(supabaseUrl, supabaseKey)

// DOM Elements
const authModal = document.getElementById('authModal')
const profileEditModal = document.getElementById('profileEditModal')
const loginForm = document.getElementById('loginForm')
const signupForm = document.getElementById('signupForm')
const profileEditForm = document.getElementById('profileEditForm')
const authButtons = document.getElementById('authButtons')
const userProfileSection = document.getElementById('userProfileSection')
const userDisplayName = document.getElementById('userDisplayName')
const userProfilePic = document.getElementById('userProfilePic')

// Auth State Management
let currentUser = null

// Check initial auth state
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        currentUser = session.user
        showUserProfile()
        loadUserProfile()
    } else {
        currentUser = null
        showAuthButtons()
    }
})

// Show/Hide UI Elements
function showUserProfile() {
    authButtons.style.display = 'none'
    userProfileSection.style.display = 'flex'
}

function showAuthButtons() {
    authButtons.style.display = 'flex'
    userProfileSection.style.display = 'none'
}

// Modal Controls
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = function() {
        authModal.style.display = 'none'
        profileEditModal.style.display = 'none'
    }
})

window.onclick = function(event) {
    if (event.target == authModal) {
        authModal.style.display = 'none'
    }
    if (event.target == profileEditModal) {
        profileEditModal.style.display = 'none'
    }
}

// Auth Form Switching
document.getElementById('switchToSignup').onclick = function(e) {
    e.preventDefault()
    loginForm.style.display = 'none'
    signupForm.style.display = 'block'
}

document.getElementById('switchToLogin').onclick = function(e) {
    e.preventDefault()
    signupForm.style.display = 'none'
    loginForm.style.display = 'block'
}

// Auth Button Handlers
document.getElementById('loginBtn').onclick = function() {
    authModal.style.display = 'block'
    loginForm.style.display = 'block'
    signupForm.style.display = 'none'
}

document.getElementById('signupBtn').onclick = function() {
    authModal.style.display = 'block'
    signupForm.style.display = 'block'
    loginForm.style.display = 'none'
}

document.getElementById('editProfileBtn').onclick = function() {
    profileEditModal.style.display = 'block'
    loadUserProfile()
}

document.getElementById('logoutBtn').onclick = async function() {
    await supabase.auth.signOut()
    showAuthButtons()
}

// Form Submissions
document.getElementById('loginFormElement').onsubmit = async function(e) {
    e.preventDefault()
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
        authModal.style.display = 'none'
    } catch (error) {
        alert(error.message)
    }
}

document.getElementById('signupFormElement').onsubmit = async function(e) {
    e.preventDefault()
    const email = document.getElementById('signupEmail').value
    const password = document.getElementById('signupPassword').value
    const displayName = document.getElementById('signupName').value

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        })
        if (authError) throw authError

        // Create profile record
        const { data, error } = await supabase
            .from('profiles')
            .insert([
                {
                    user_id: authData.user.id,
                    display_name: displayName,
                }
            ])
        if (error) throw error

        authModal.style.display = 'none'
        alert('Please check your email for verification link')
    } catch (error) {
        alert(error.message)
    }
}

// Profile Management
async function loadUserProfile() {
    if (!currentUser) return

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single()
        
        if (error) throw error

        if (data) {
            userDisplayName.textContent = data.display_name
            if (data.avatar_url) {
                userProfilePic.src = data.avatar_url
            }
            document.getElementById('editDisplayName').value = data.display_name
        }
    } catch (error) {
        console.error('Error loading profile:', error)
    }
}

document.getElementById('profileEditForm').onsubmit = async function(e) {
    e.preventDefault()
    const displayName = document.getElementById('editDisplayName').value
    const profilePic = document.getElementById('profilePicInput').files[0]

    try {
        let avatarUrl = null
        
        if (profilePic) {
            const fileExt = profilePic.name.split('.').pop()
            const fileName = `${currentUser.id}-avatar.${fileExt}`
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, profilePic, {
                    upsert: true
                })
            
            if (uploadError) throw uploadError
            
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)
            
            avatarUrl = publicUrl
        }

        const updateData = {
            display_name: displayName,
            ...(avatarUrl && { avatar_url: avatarUrl })
        }

        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', currentUser.id)

        if (error) throw error

        profileEditModal.style.display = 'none'
        loadUserProfile()
    } catch (error) {
        alert(error.message)
    }
}

// Contact Form Handler
document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
    e.preventDefault()
    const name = document.getElementById('contactName').value
    const email = document.getElementById('contactEmail').value
    const message = document.getElementById('contactMessage').value

    try {
        const { data, error } = await supabase
            .from('contact_messages')
            .insert([
                {
                    name,
                    email,
                    message,
                    status: 'new'
                }
            ])

        if (error) throw error

        // Send email notification using Supabase Edge Function
        await fetch('YOUR_SUPABASE_EDGE_FUNCTION_URL', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
                name,
                email,
                message
            })
        })

        alert('Message sent successfully!')
        this.reset()
    } catch (error) {
        alert('Error sending message: ' + error.message)
    }
}) 