export default {
    template:
        `        <nav class="navbar navbar-expand " style="background-color: #99dbd6">
        <div class="container">
            <div class="navbar-brand">
                <router-link to="/" style="text-decoration: none; color: black">
                <img src="/static/logo.png"  style="width: 40px; height: 40px">
                    <span style="color: blue">Ocean</span>
                    <span style="color: green">Of</span>
                    <span style="color: black">Books</span>
                </router-link>
            </div>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <ul class="navbar-nav">
                    <li class="nav-link" style="color: #23261f"><router-link
                            style="text-decoration: none; color: inherit;" to="/">Home</router-link></li>
                    <li class="nav-link" style="color: #23261f"><router-link
                            style="text-decoration: none; color: inherit;" to="/profile">Profile</router-link></li>
                    <li class="nav-link" style="color: #23261f">
                    <router-link style="text-decoration: none; color: inherit;" to="/mybooks">My Books</router-link></li>
                </ul>
            </div>
            <div class="ml-auto me-2 d-flex flex-row">
            <button class="btn btn-warning btn-outline-dark me-2 ml-auto" style="color: #23261f" @click.prevent="registerUser" v-if="!isLoggedIn">
            Sign Up
            </button>
                <button class="btn btn-warning btn-outline-dark me-2 ml-auto" style="color: #23261f" @click.prevent="toggleAuth" >
                {{ isLoggedIn ? "Logout" : "Login" }}
                </button>
            </div>
        </div>
    </nav>`,
    data() {
        return {
            sessionToken: null,
            isLoggedIn: false,
        }
    },
    created() {
        this.sessionToken = sessionStorage.getItem('auth-token') || localStorage.getItem('auth-token');
        if (this.sessionToken) {
            this.getCurrentUser();
            this.isLoggedIn = true;
        };
        this.$root.$on('loginSuccess', (logged) => {
            this.isLoggedIn = logged;
            if (logged) {
                if (this.sessionToken) {
                    this.sessionToken = sessionStorage.getItem('auth-token') || localStorage.getItem('auth-token');
                    this.getCurrentUser();
                    console.log('Welcome' + this.currentUser.username)
                }
            }
        });
    },
    methods: {
        async toggleAuth() {
            if (this.isLoggedIn) {
                const res = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('auth-token'),
                    }
                });
                if (res.ok) {
                    localStorage.removeItem('auth-token');
                    sessionStorage.removeItem('auth-token');
                    localStorage.removeItem('role');
                    sessionStorage.removeItem('role');
                    localStorage.removeItem('user_id');
                    sessionStorage.removeItem('user_id');
                    this.sessionToken = null;
                    this.isLoggedIn = false;
                    this.$root.$emit('loginSuccess', false);
                    this.$router.push('/login');
                    console.log('Logged out');
                }
            } else {
                this.$router.push('/login');
            }
        },
        registerUser() {
            this.$router.push('/register');
        },
        getCurrentUser() {
            fetch('/api/users/all', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.sessionToken,
                }
            }).then(res => res.json())
                .then(data => {
                    this.currentUser = data;
                    console.log(data);
                }
                );
        },
    },

}
