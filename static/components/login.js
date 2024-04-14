const login = {
    template:
        `<div class="container content-section mt-4 bg-light">
            <div class="mb-3 p-5 bg-light">
            <h3 class="mb-3">{{ isAdmin ? 'User' : 'Admin' }} Login</h3>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" name="email" placeholder="Email" v-model="formData.email" />
                <label for="password" class="form-label mt-1">Password</label>
                <input type="password" class="form-control" name="password" placeholder="Password" v-model="formData.password" />
                <button class="btn btn-primary mt-2" type="submit" @click.prevent="loginUser">Login</button>
                </div>
        </div>
        <div class="border-top pt-3">
        <small class="text-muted">
            <span v-if="isAdmin">Admin Login</span>
            <span v-else>User Login</span>
            <button class="btn ml-2" @click.prevent="toggleAdminMode">{{ !isAdmin ? 'User' : 'Admin' }} Login</button>
        </small>
    </div>
    </div>
    </div>`,

    data() {
        return {
            formData: {
                email: '',
                password: ''
            },
            isAdmin: false,
        }
    },
    methods: {
        async loginUser() {
            const response = await fetch('/Ulogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.formData),
            })
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                localStorage.setItem('auth-token', data['token']);
                sessionStorage.setItem('auth-token', data['token']);
                localStorage.setItem('role', data['role']);
                sessionStorage.setItem('role', data['role']);
                this.$root.$emit('loginSuccess', true);
                console.log(data['role']);
                if (data['role'] == 'librarian'){
                    this.$router.push('/admin');
                    console.log('Welcome Admin');
                }else{
                this.$router.push('/profile');
                }
                console.log('Logged in');
            }
        },
        toggleAdminMode() {
            this.isAdmin = !this.isAdmin;
        },
    },

}
export default login;