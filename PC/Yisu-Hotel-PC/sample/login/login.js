const API_BASE = 'http://localhost:5050';

let countdownTimer = null;
let countdownSeconds = 60;

function showSuccess(message) {
    const successMessage = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    successText.textContent = message;
    successMessage.classList.add('show');
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    errorText.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

function validatePhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}

function validatePassword(password) {
    return password && password.length >= 6 && password.length <= 20;
}

function validateCode(code) {
    return /^\d{6}$/.test(code);
}

function startCountdown(buttonId) {
    const button = document.getElementById(buttonId);
    countdownSeconds = 60;
    button.disabled = true;
    button.textContent = `${countdownSeconds}秒后重发`;
    
    countdownTimer = setInterval(() => {
        countdownSeconds--;
        button.textContent = `${countdownSeconds}秒后重发`;
        
        if (countdownSeconds <= 0) {
            clearInterval(countdownTimer);
            button.disabled = false;
            button.textContent = '发送验证码';
        }
    }, 1000);
}

async function sendCode(phone, type) {
    try {
        const response = await fetch(`${API_BASE}/auth/send-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone, type })
        });
        
        const result = await response.json();
        
        if (result.code === 0) {
            showSuccess('验证码已发送');
            return true;
        } else {
            showError(result.msg || '验证码发送失败');
            return false;
        }
    } catch (error) {
        showError('网络错误，请稍后重试');
        return false;
    }
}

async function checkAccount(phone) {
    try {
        const response = await fetch(`${API_BASE}/auth/check-account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone })
        });
        
        const result = await response.json();
        return result.data && result.data.available;
    } catch (error) {
        return false;
    }
}

function saveToken(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function clearToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function updateUIForTab(tab) {
    const tabContainer = document.getElementById('tab-container');
    const socialLogin = document.getElementById('social-login');
    const footerText = document.getElementById('footer-text');
    
    if (tab === 'register') {
        tabContainer.style.display = 'block';
        socialLogin.style.display = 'none';
        footerText.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400">已有账号？ <a class="text-primary font-bold hover:underline" href="#" id="go-to-login">立即登录</a></p>';
        footerText.style.display = 'block';
        
        const goToLoginBtn = document.getElementById('go-to-login');
        if (goToLoginBtn) {
            goToLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                switchTab('login');
            });
        }
    } else if (tab === 'forgot') {
        tabContainer.style.display = 'none';
        socialLogin.style.display = 'none';
        footerText.style.display = 'none';
    } else {
        tabContainer.style.display = 'block';
        socialLogin.style.display = 'block';
        footerText.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400">还没有账号？ <a class="text-primary font-bold hover:underline" href="#" id="go-to-register">免费开始</a></p>';
        footerText.style.display = 'block';
        
        const goToRegisterBtn = document.getElementById('go-to-register');
        if (goToRegisterBtn) {
            goToRegisterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                switchTab('register');
            });
        }
    }
}

function switchTab(tab) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    if (tab === 'login' || tab === 'register') {
        const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    const activeContent = document.getElementById(`${tab}-form`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    updateUIForTab(tab);
}

document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });

    document.getElementById('forgot-password-link').addEventListener('click', function(e) {
        e.preventDefault();
        switchTab('forgot');
    });

    document.getElementById('back-to-login').addEventListener('click', function(e) {
        e.preventDefault();
        switchTab('login');
    });

    document.getElementById('login-password-toggle').addEventListener('click', function() {
        const input = document.getElementById('login-password');
        const icon = this.querySelector('.material-symbols-outlined');
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            input.type = 'password';
            icon.textContent = 'visibility';
        }
    });

    document.getElementById('register-password-toggle').addEventListener('click', function() {
        const input = document.getElementById('register-password');
        const icon = this.querySelector('.material-symbols-outlined');
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            input.type = 'password';
            icon.textContent = 'visibility';
        }
    });

    document.getElementById('forgot-password-toggle').addEventListener('click', function() {
        const input = document.getElementById('forgot-password');
        const icon = this.querySelector('.material-symbols-outlined');
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            input.type = 'password';
            icon.textContent = 'visibility';
        }
    });

    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const phone = document.getElementById('login-phone').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!validatePhone(phone)) {
            showError('手机号格式不正确');
            return;
        }
        
        if (!validatePassword(password)) {
            showError('密码长度应为6-20位');
            return;
        }
        
        const loginBtn = document.getElementById('login-btn');
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> 登录中...';
        
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone, password })
            });
            
            const result = await response.json();
            
            if (result.code === 0) {
                saveToken(result.data.token, result.data.user);
                showSuccess('登录成功');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                showError(result.msg || '登录失败');
            }
        } catch (error) {
            showError('网络错误，请稍后重试');
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span>登录到仪表板</span><span class="material-symbols-outlined text-sm">login</span>';
        }
    });

    document.getElementById('register-send-code').addEventListener('click', async function() {
        const phone = document.getElementById('register-phone').value.trim();
        
        if (!validatePhone(phone)) {
            showError('手机号格式不正确');
            return;
        }
        
        const isAvailable = await checkAccount(phone);
        if (!isAvailable) {
            showError('该手机号已被注册');
            return;
        }
        
        this.disabled = true;
        const success = await sendCode(phone, 'register');
        if (success) {
            startCountdown('register-send-code');
        } else {
            this.disabled = false;
        }
    });

    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const phone = document.getElementById('register-phone').value.trim();
        const code = document.getElementById('register-code').value.trim();
        const password = document.getElementById('register-password').value;
        const role = document.querySelector('input[name="role"]:checked').value;
        const agreed = document.getElementById('register-agreed').checked;
        
        if (!validatePhone(phone)) {
            showError('手机号格式不正确');
            return;
        }
        
        if (!validateCode(code)) {
            showError('验证码格式不正确');
            return;
        }
        
        if (!validatePassword(password)) {
            showError('密码长度应为6-20位');
            return;
        }
        
        if (!agreed) {
            showError('请同意用户协议与隐私政策');
            return;
        }
        
        const registerBtn = document.getElementById('register-btn');
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> 注册中...';
        
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone, password, code, role, agreed })
            });
            
            const result = await response.json();
            
            if (result.code === 0) {
                saveToken(result.data.token, result.data.user);
                showSuccess('注册成功');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                showError(result.msg || '注册失败');
            }
        } catch (error) {
            showError('网络错误，请稍后重试');
        } finally {
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<span>注册账号</span><span class="material-symbols-outlined text-sm">person_add</span>';
        }
    });

    document.getElementById('forgot-send-code').addEventListener('click', async function() {
        const phone = document.getElementById('forgot-phone').value.trim();
        
        if (!validatePhone(phone)) {
            showError('手机号格式不正确');
            return;
        }
        
        this.disabled = true;
        const success = await sendCode(phone, 'reset');
        if (success) {
            startCountdown('forgot-send-code');
        } else {
            this.disabled = false;
        }
    });

    document.getElementById('forgot-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const phone = document.getElementById('forgot-phone').value.trim();
        const code = document.getElementById('forgot-code').value.trim();
        const newPassword = document.getElementById('forgot-password').value;
        
        if (!validatePhone(phone)) {
            showError('手机号格式不正确');
            return;
        }
        
        if (!validateCode(code)) {
            showError('验证码格式不正确');
            return;
        }
        
        if (!validatePassword(newPassword)) {
            showError('密码长度应为6-20位');
            return;
        }
        
        const forgotBtn = document.getElementById('forgot-btn');
        forgotBtn.disabled = true;
        forgotBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> 重置中...';
        
        try {
            const response = await fetch(`${API_BASE}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone, code, new_password: newPassword })
            });
            
            const result = await response.json();
            
            if (result.code === 0) {
                showSuccess('密码重置成功');
                setTimeout(() => {
                    switchTab('login');
                }, 1500);
            } else {
                showError(result.msg || '密码重置失败');
            }
        } catch (error) {
            showError('网络错误，请稍后重试');
        } finally {
            forgotBtn.disabled = false;
            forgotBtn.innerHTML = '<span>重置密码</span><span class="material-symbols-outlined text-sm">lock_reset</span>';
        }
    });

    const token = getToken();
    const user = getUser();
    if (token && user) {
        window.location.href = '/dashboard.html';
    }
});