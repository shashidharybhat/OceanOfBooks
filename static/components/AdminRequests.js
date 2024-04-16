const AdminRequestsPage = {
    template: `
      <div class="container mt-4">
        <h2 class="text-center">Requested Books</h2>
        <div v-if="requests.length === 0" class="text-center mt-5">
          <h4>No requests</h4>
        </div>
        <div class="row mb-3" v-else>
            <div class="col"><b>Book</b></div>
            <div class="col"><b>User</b></div>
            <div class="col text-end"><b>Actions</b></div>
        </div>
        <div v-for="request in requests" :key="request.id" class="row mb-3 bg-light">
          <div class="col mt-2 mb-2 ">{{ request.book.title }} by {{ request.book.author }}</div>
          <div class="col mt-2 mb-2 ">{{ request.user.username }}</div>
          <div class="col text-end mt-2 mb-2">
            <button @click="approveRequest(request.id)" class="btn btn-success">Approve</button>
            <button @click="denyRequest(request.id)" class="btn btn-danger">Deny</button>
          </div>
        </div>
        <h2 class="text-center">Access Logs</h2>
        <div v-if="accessLogs.length === 0" class="text-center mt-5">
          <h4>No access logs</h4>
        </div>
        <div class="row mb-3" v-else>
            <div class="col"><b>Book</b></div>
            <div class="col"><b>User</b></div>
            <div class="col"><b>Action</b></div>
        </div>
        <div v-for="log in accessLogs" :key="log.id" class="row mb-3 bg-light">
          <div class="col mt-2 mb-2 ">{{ log.book.title }} by {{ log.book.author }}</div>
          <div class="col mt-2 mb-2 ">{{ log.user.username }}</div>
          <button @click="revokeAccess(log.id)" class="col btn btn-danger mt-2 mb-2">Revoke Access</button>
        </div>        
      </div>
    `,
    data() {
      return {
        requests: [],
        accessLogs: []
      };
    },
    created() {
      this.fetchRequests();
      this.fetchAccessLogs();
    },
    methods: {
      async fetchRequests() {
        try {
          const response = await fetch('/api/admin/request', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
          const requests = await response.json();
          this.requests = await this.enrichRequestsWithBookAndUserDetails(requests);
        } catch (error) {
          console.error('Error fetching requests:', error);
        }
      },
      async fetchAccessLogs() {
        try {
          const response = await fetch('/api/admin/logs', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
          const logs = await response.json();
          console.log(logs);
          this.accessLogs = await this.enrichRequestsWithBookAndUserDetails(logs);
        }
        catch (error) {
          console.error('Error fetching access logs:', error);
        }
      },
      async enrichRequestsWithBookAndUserDetails(requests) {
        try {
          const bookIds = requests.map(request => request.book_id);
          const userMap = await this.fetchAllUsersAsMap();
          const booksResponse = await fetch('/api/books', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
          const books = await booksResponse.json();
          return requests.map(request => ({
            ...request,
            book: books.find(book => book.id === request.book_id),
            user: userMap[request.user_id] || { name: 'Unknown User' }
          }));
        } catch (error) {
          console.error('Error enriching requests with book and user details:', error);
          return [];
        }
      },
      async fetchAllUsersAsMap() {
        try {
          const response = await fetch('/api/users/all', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
          const users = await response.json();
          return users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {});
        } catch (error) {
          console.error('Error fetching all users:', error);
          return {};
        }
      },
      async revokeAccess(logId) {
        try {
          await fetch(`/api/admin/logs`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token')
            },
            body: JSON.stringify({ id: logId, status: 'revoked'})
          });
          this.accessLogs = this.accessLogs.filter(log => log.id !== logId);
        } catch (error) {
          console.error('Error revoking access:', error);
        }
      },
      async approveRequest(requestId) {
        try {
          await this.updateRequestStatus(requestId, 'approved');
        } catch (error) {
          console.error('Error approving request:', error);
        }
      },
      async denyRequest(requestId) {
        try {
          await this.updateRequestStatus(requestId, 'denied');
        } catch (error) {
          console.error('Error denying request:', error);
        }
      },
      async updateRequestStatus(requestId, status) {
        try {
          await fetch(`/api/admin/request`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token')
            },
            body: JSON.stringify({ status: status, id: parseInt(requestId) })
          });
          const index = this.requests.findIndex(request => request.id === requestId);
          if (index !== -1) {
            Vue.set(this.requests, index, { ...this.requests[index], status });
          }
        } catch (error) {
          console.error(`Error updating request ${requestId} status to ${status}:`, error);
        }
      }
    }
  };
  export default AdminRequestsPage;
  