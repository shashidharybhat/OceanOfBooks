const login = {
    template:
        `<div class="d-flex justify-content-center" style="margin-top: 25vh;">
            <div class="mb-3 p-5 bg-light">
            <h3 class="mb-3.
            ">Login</h3>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" name="email" placeholder="Email" v-model="formData.email" />
                <label for="password" class="form-label mt-1">Password</label>
                <input type="password" class="form-control" name="password" placeholder="Password" v-model="formData.password" />
                <button class="btn btn-primary mt-2" type="submit" @click.prevent="loginUser">Login</button>
                </div>
        </div>
    </div>`,

    data() {
        return {
            formData: {
                email: '',
                password: ''
            },
        }
    },
    methods: {
        async loginUser() {
            const response = await fetch('/login?include_auth_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.formData),
            })
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('auth-token', data.response.user.authentication_token);
                sessionStorage.setItem('auth-token', data.response.user.authentication_token);
                this.$root.$emit('loginSuccess', true);
                this.$router.push('/profile');
                console.log('Logged in');
            }
        },
    }
}
export default login;