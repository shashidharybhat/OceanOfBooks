const AdminStats = {
    template: `
    <div class="container mt-5">
    <h1 class="text-center mb-4">Librarian Statistics</h1>
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else>
      <p class="mb-3">Total Books: {{ stats.total_books }}</p>
      <p class="mb-3">Total Sections: {{ stats.total_sections }}</p>
      <p class="mb-3">Active Readers: {{ stats.active_logs }}</p>
      <p class="mb-3">Pending Requests: {{ stats.pending_requests }}</p>
      <p class="mb-3">Denied Requests: {{ stats.denied_requests }}</p>

      <div class="mb-4">
        <h3>Section Distribution</h3>
        <div class="chart-container" style="max-width: 400px; max-height: 400px;">
          <canvas id="SectionDistributionChart"></canvas>
        </div>
      </div>
    </div>
  </div>
    `,
    data() {
        return {
            stats: null,
            loading: true
        }
    },
    async mounted() {
        const response = await fetch('/api/admin/stats', {
            headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem('auth-token')
            }
        });
        if (response.ok) {
            this.stats = await response.json();
            this.loading = false;
            this.$nextTick(() => {
                this.renderSectionDistributionChart();
            });
        }
    },
    methods: {
        renderSectionDistributionChart() {
            if (this.stats.section_distribution) {
                const sectionNames = this.stats.section_distribution.section_names;
                const bookCounts = this.stats.section_distribution.book_counts;
                new Chart(document.getElementById('SectionDistributionChart'), {
                    type: 'pie',
                    data: {
                        labels: sectionNames,
                        datasets: [{
                            data: bookCounts,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.7)',
                                'rgba(54, 162, 235, 0.7)',
                                'rgba(255, 206, 86, 0.7)',
                                'rgba(75, 192, 192, 0.7)',
                                'rgba(153, 102, 255, 0.7)'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                    }
                });
            }
        }
    }
}

export default AdminStats;
