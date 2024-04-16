import router from './router.js';
import UserNavbar from './components/UserNavbar.js';
import AdminNavbar from './components/AdminNavbar.js';

router.beforeEach((to, from, next) => {
    const authToken = localStorage.getItem('auth-token');
    const role = localStorage.getItem('role');

    if (to.name !== 'Login' && to.name !== 'Register' && !authToken) {
        next({ path: '/Login' });
    } else if (role === 'librarian' && to.name === 'UserDashboard') {
        next('/admin');
    } else {
        next();
    }
});

const app = new Vue({
    template: `
    <div class="container-fluid w-100 p-0">
        <AdminNavbar v-if="isAdmin"></AdminNavbar>
        <UserNavbar v-else :isLoggedIn='isLoggedIn'></UserNavbar>
        <router-view></router-view>
    </div>
    `,
    el: '#app',
    router,
    delimiters: ['{{', '}}'],
    components: {
        UserNavbar,
        AdminNavbar
    },
    data: function (){
        return {
            isLoggedIn: false,
            isAdmin: false,
        }
    },
    created() {
        this.checkLoginStatus();
    },
    methods: {
        checkLoginStatus() {
            const authToken = sessionStorage.getItem('auth-token') || localStorage.getItem('auth-token');
            const role = sessionStorage.getItem('role') || localStorage.getItem('role');
            if (authToken && role === 'librarian') {
                this.isAdmin = true;
                this.isLoggedIn = true;
            } else {
                this.isLoggedIn = !!authToken;
                this.isAdmin = false;
            }
        },
    },
    watch: {
        $route() {
            this.checkLoginStatus();
        }
    }
});