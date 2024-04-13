const profile = {
    template: `
        <div v-if="success">
            <h1>Profile</h1>
            <h2>Profile ID: {{ profile.id }}</h2>
            <h4>{{ profile.username }}</h4>
            <h5>{{ profile.email }}</h5>
        </div>
        <div v-else>
        {{ error }}
        </div>
    `,
    data() {
        return {
            profile: {},
            success: true,
            error: "Something went wrong with the request.",
        }
    },
    async mounted() {
        console.log(this.$route.params.id)
        if (this.$route.params.id == null) {
            const response = await fetch('/api/users/0', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': sessionStorage.getItem('auth-token'),
                }
            });
            const data = await response.json();
            console.log(data)
            if (response.ok) {
                this.profile = data;
            } else if (response.status == 401) {
                this.success = false;
                this.error = data.response.errors[0]
                console.log(this.error)
            } else {
                this.success = false;
                this.error = data.message;
            }
        } else {
            const response = await fetch('/api/users/' + this.$route.params.id, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': sessionStorage.getItem('auth-token'),
                }
            });
            const data = await response.json();
            if (response.ok) {
                this.profile = data;
            } else if (response.status == 401) {
                this.success = false;
                this.error = data.response.errors[0]
                console.log(this.error)
            } else {
                this.success = false;
                this.error = data.message;
            }
        }
    }
}

export default profile;