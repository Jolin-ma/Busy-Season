export function renderAuthPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Sign In — LegacyLink</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: { fontFamily: { serif: ['Playfair Display', 'Georgia', 'serif'], sans: ['Inter', 'system-ui', 'sans-serif'] } } }
    }
  </script>
  <style>
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }
    input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px #fafaf9 inset; }
  </style>
</head>
<body class="min-h-screen bg-stone-50 font-sans flex flex-col items-center justify-center px-6 py-12 antialiased">

  <div class="w-full max-w-sm">

    <!-- Logo -->
    <div class="text-center mb-8">
      <div class="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.6" class="w-5 h-5">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h1 class="font-serif text-2xl text-stone-800">LegacyLink</h1>
      <p class="text-stone-400 text-xs tracking-widest uppercase mt-1">Preserving Stories</p>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-3xl shadow-sm border border-stone-100 p-7">

      <!-- Tabs -->
      <div class="flex bg-stone-100 rounded-2xl p-1 mb-7">
        <button id="tab-login" onclick="switchTab('login')"
          class="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-white text-stone-800 shadow-sm transition-all">
          Sign In
        </button>
        <button id="tab-signup" onclick="switchTab('signup')"
          class="flex-1 py-2.5 text-sm font-semibold rounded-xl text-stone-400 transition-all hover:text-stone-600">
          Create Account
        </button>
      </div>

      <!-- Login Panel -->
      <div id="panel-login" class="tab-panel active">
        <form onsubmit="handleLogin(event)" novalidate>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Email</label>
              <input id="login-email" type="email" placeholder="you@example.com" autocomplete="email"
                class="w-full border border-stone-200 bg-stone-50 rounded-xl px-4 py-3.5 text-sm text-stone-800
                       focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-colors" />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider">Password</label>
                <a href="#" class="text-xs text-stone-400 hover:text-stone-600 transition-colors">Forgot?</a>
              </div>
              <input id="login-password" type="password" placeholder="••••••••" autocomplete="current-password"
                class="w-full border border-stone-200 bg-stone-50 rounded-xl px-4 py-3.5 text-sm text-stone-800
                       focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-colors" />
            </div>
          </div>

          <p id="login-error" class="text-red-500 text-xs mt-3 hidden"></p>

          <button type="submit" id="login-btn"
            class="mt-5 w-full bg-stone-900 text-white py-4 rounded-2xl text-sm font-semibold
                   hover:bg-stone-700 active:bg-stone-900 transition-colors">
            Sign In
          </button>
        </form>
      </div>

      <!-- Signup Panel -->
      <div id="panel-signup" class="tab-panel">
        <form onsubmit="handleSignup(event)" novalidate>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input id="signup-name" type="text" placeholder="Jane Smith" autocomplete="name"
                class="w-full border border-stone-200 bg-stone-50 rounded-xl px-4 py-3.5 text-sm text-stone-800
                       focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-colors" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Email</label>
              <input id="signup-email" type="email" placeholder="you@example.com" autocomplete="email"
                class="w-full border border-stone-200 bg-stone-50 rounded-xl px-4 py-3.5 text-sm text-stone-800
                       focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-colors" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Password</label>
              <input id="signup-password" type="password" placeholder="Min. 8 characters" autocomplete="new-password"
                class="w-full border border-stone-200 bg-stone-50 rounded-xl px-4 py-3.5 text-sm text-stone-800
                       focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-colors" />
            </div>
          </div>

          <p id="signup-error" class="text-red-500 text-xs mt-3 hidden"></p>
          <p id="signup-success" class="text-green-600 text-xs mt-3 hidden">Account created! You can now sign in.</p>

          <button type="submit" id="signup-btn"
            class="mt-5 w-full bg-stone-900 text-white py-4 rounded-2xl text-sm font-semibold
                   hover:bg-stone-700 active:bg-stone-900 transition-colors">
            Create Account
          </button>

          <p class="text-center text-[10px] text-stone-400 mt-4 leading-relaxed">
            By creating an account you agree to our<br/>Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>

    </div>

    <p class="text-center text-[10px] text-stone-300 mt-6">LegacyLink &mdash; Preserving Stories</p>
  </div>

  <script>
    function switchTab(tab) {
      const isLogin = tab === 'login';
      document.getElementById('panel-login').classList.toggle('active', isLogin);
      document.getElementById('panel-signup').classList.toggle('active', !isLogin);

      const loginBtn  = document.getElementById('tab-login');
      const signupBtn = document.getElementById('tab-signup');
      if (isLogin) {
        loginBtn.classList.add('bg-white', 'text-stone-800', 'shadow-sm');
        loginBtn.classList.remove('text-stone-400');
        signupBtn.classList.remove('bg-white', 'text-stone-800', 'shadow-sm');
        signupBtn.classList.add('text-stone-400');
      } else {
        signupBtn.classList.add('bg-white', 'text-stone-800', 'shadow-sm');
        signupBtn.classList.remove('text-stone-400');
        loginBtn.classList.remove('bg-white', 'text-stone-800', 'shadow-sm');
        loginBtn.classList.add('text-stone-400');
      }
    }

    function setLoading(btnId, loading, label) {
      const btn = document.getElementById(btnId);
      btn.disabled = loading;
      btn.textContent = loading ? 'Please wait…' : label;
      btn.classList.toggle('opacity-60', loading);
    }

    function showError(id, msg) {
      const el = document.getElementById(id);
      el.textContent = msg;
      el.classList.remove('hidden');
    }

    function hideError(id) {
      document.getElementById(id).classList.add('hidden');
    }

    async function handleLogin(e) {
      e.preventDefault();
      hideError('login-error');
      const email    = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        showError('login-error', 'Please fill in all fields.');
        return;
      }

      setLoading('login-btn', true, 'Sign In');
      try {
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          window.location.href = data.redirectUrl ?? '/dashboard';
        } else {
          showError('login-error', data.error ?? 'Sign in failed.');
        }
      } catch {
        showError('login-error', 'Network error — please try again.');
      } finally {
        setLoading('login-btn', false, 'Sign In');
      }
    }

    async function handleSignup(e) {
      e.preventDefault();
      hideError('signup-error');
      document.getElementById('signup-success').classList.add('hidden');

      const name     = document.getElementById('signup-name').value.trim();
      const email    = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;

      if (!name || !email || !password) {
        showError('signup-error', 'Please fill in all fields.');
        return;
      }
      if (password.length < 8) {
        showError('signup-error', 'Password must be at least 8 characters.');
        return;
      }

      setLoading('signup-btn', true, 'Create Account');
      try {
        const res = await fetch('/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          document.getElementById('signup-success').classList.remove('hidden');
          setTimeout(() => switchTab('login'), 1500);
        } else {
          showError('signup-error', data.error ?? 'Sign up failed.');
        }
      } catch {
        showError('signup-error', 'Network error — please try again.');
      } finally {
        setLoading('signup-btn', false, 'Create Account');
      }
    }
  </script>

</body>
</html>`;
}
