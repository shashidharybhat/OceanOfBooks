import home from './components/home.js';
import profile from './components/profile.js';
import login from './components/login.js';

const routes = [
    { path: '/', component: home },
    { path: '/profile/:id', component: profile },
    { path: '/profile', component: profile },
    { path: '/login', component: login },
]

const router = new VueRouter({
    routes,
    base: '/',
});


const app = new Vue({
    template: `
    <div class="container-fluid w-100 p-0">
        <nav class="navbar navbar-expand " style="background-color: #99dbd6">
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
                    </ul>
                </div>
                <div class="ml-auto me-2 d-flex flex-row">
                    <button class="btn btn-warning btn-outline-dark me-2 ml-auto" style="color: #23261f" v-on:click="toggleAuth" v-on:loginSuccess="this.isLoggedIn = true">
                    {{ getLogin ? "Logout" : "Login" }}
                    </button>
                </div>
            </div>
        </nav>
        <router-view></router-view>
    </div>
    `,
    el: '#app',
    router,
    delimiters: ['{{', '}}'],
    data: function (){
        return {
            sessionToken: null,
            isLoggedIn: false,
            currentUser: null,
        }
    },
    created() {
        this.$root.$on('loginSuccess', (logged) => {
          this.isLoggedIn = logged;
          if(logged){
            if(this.sessionToken){
            this.sessionToken = sessionStorage.getItem('auth-token') || localStorage.getItem('auth-token');
            this.getCurrentUser();
            }else{
                alert("You are not logged in")
            }
          }
        });
    },
    mounted() {
        this.sessionToken = sessionStorage.getItem('auth-token') || localStorage.getItem('auth-token');
        if (this.sessionToken) {
            this.getCurrentUser();
            this.isLoggedIn = true;
        }
    },

    methods: {
        async toggleAuth() {
            if (this.isLoggedIn) {
                const res = await fetch('/logout');
                if (res.ok) {
                    this.isLoggedIn = false;
                    this.currentUser = null;
                    this.$router.push('/');
                    this.$emit(loginSuccess, false)
                    console.log('Logged out');
                }
                sessionStorage.removeItem('auth-token');
                localStorage.removeItem('auth-token');
            } else {
                this.$router.push('/login');
                console.log('Logging in');
            }
        },
        getCurrentUser() {
            fetch('/api/users/0', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.sessionToken,
                }
            }).then(res => res.json())
                .then(data => {
                    this.currentUser = data;
                }
                );
            console.log(this.currentUser)
        },
    },
    computed: {
        currentRoute() {
            return this.$route.path;
        },
        getLogin() {
            return this.isLoggedIn;
        },
    },
    watch: {
        isLoggedIn: function (val) {
            if (val) {
                this.getCurrentUser();
            }
        },
    }
});