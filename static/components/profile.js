
const profile = {
    template: `
    <div class="container mt-5">
    <h1 class="text-center mb-4">User Statistics</h1>
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else>
      <p class="mb-3">Reading Time: {{ formatReadingTime(stats.reading_time) }}</p>
      
      <div class="mb-4">
        <h3>Top Rated Books</h3>
        <ul class="list-group">
          <li v-for="(book, index) in stats.top_rated_books" :key="index" class="list-group-item">
            {{ book.title }} - Rating: {{ book.rating }}
          </li>
        </ul>
      </div>
      
      <div class="mb-4">
        <h3>Most Requested Books</h3>
        <ul class="list-group">
          <li v-for="(book, index) in stats.most_requested_books" :key="index" class="list-group-item">
            {{ book.title }} - Requests: {{ book.count}}
          </li>
        </ul>
      </div>
      
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
            profile: {},
            success: true,
            error: "Something went wrong with the request.",
            stats: null,
            loading: true
        }
    },
    async mounted() {
        const response = await fetch('/api/stats/' + localStorage.getItem('user_id'), {
            headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem('auth-token')
            }
        });
        if (response.ok) {
            this.stats = await response.json();
            console.log(this.stats.top_rated_books);
            this.loading = false;
            this.$nextTick(() => {
                this.SectionDistributionChart();
            });
        } else {
            this.success = false;
        }
    },

    methods: {
        SectionDistributionChart() {
            if (this.stats.section_distribution) {
                const sectionNames = this.stats.section_distribution.map(section => section.section_name);
                const bookCounts = this.stats.section_distribution.map(section => section.book_count);
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
        },
        formatReadingTime(seconds) {
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${days} days ${hours} hours ${minutes} minutes`;
        }
    },
}

export default profile;