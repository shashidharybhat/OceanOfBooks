const AdminDashboard = {
  template: `
  <div class="container">
  <div v-if="sections.length">
    <div v-for="section in sections" :key="section.id" class="row mt-2 mb-2 bg-light">
      <div class="d-flex justify-content-between w-100">
        <h2 class="modal-title text-center">{{ section.name }}</h2>
        <div class="flex-shrink-1">
          <button @click.prevent="openBookModal(section.id)" class="align-items-center btn btn-info btn-sm">Add Book</button>
        </div>
      </div>
      <div v-if="books.length">
            <div v-for="book in books" :key="book.id" class="row mt-2 mb-2">
              <div v-if="book.section_id == section.id"class="col">
                <div class="card" style="max-width: 160px ">
                  <h5 class="card-header">{{ book.title }}</h5>
                  <div class="card-body">
                    <p class="small">Section: {{ getSectionName(book.section_id) }}</p>
                    <p class="small">Author: {{ book.author }}</p>
                    <p class="small">Availability: {{ book.stock }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </div>
  </div>
  <div v-else>
    <div class="row mt-4 mb-4">
      <div class="d-flex justify-content-between">
        <h2 class="modal-title text-center">No Sections Available</h2>
      </div>
    </div>
  </div>

  <!-- New Section Button -->
  <div class="row mt-4 mb-4">
      <div class="d-flex justify-content-between">
        <h2 class="modal-title text-center">Add New Section</h2>
        <div class="float-end">
          <button data-bs-toggle="modal" data-bs-target="#SectionAdd" class="align-items-end btn btn-primary btn-sm">New Section</button>
        </div>
      </div>
    </div>

  <!-- Section Modal -->
    <div class="modal fade" id="SectionAdd" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add New Section</h5>
            <button type="button" class="btn-close" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addSection">
              <div class="mb-3">
                <label for="sectionName" class="form-label">Section Name</label>
                <input type="text" v-model="newSection.name" class="form-control" id="sectionName" required>
                <label for="sectionDesc" class="form-label">Section Description</label>
                <input type="text" v-model="newSection.desc" class="form-control" id="sectionDesc" required>
              </div>
              <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Add Section</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Book Modal -->
    <div class="modal fade" id="BookAdd" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add New Book to {{ this.selectedSectionName }}</h5>
            <button type="button" class="btn-close" @click="closeBookModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addBook()">
              <div class="mb-3">
                <label for="BookTitle" class="form-label">Book Title</label>
                <input type="text" v-model="newBook.title" class="form-control" id="BookTitle" required>
                <label for="BookAuthor" class="form-label">Book Author</label>
                <input type="text" v-model="newBook.author" class="form-control" id="BookAuthor" required>
                <label for="currentStock" class="form-label">Book Availability Limit</label>
                <input type="text" v-model="newBook.stock" class="form-control" id="currentStock" required>
              </div>
              <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Add Section</button>
            </form>
          </div>
        </div>
      </div>
    </div>
</div>`,
  data() {
    return {
      sections: [],
      selectedSectionId: null,
      selectedSectionName: '',
      newSection: {
        name: '',
        desc: ''
      },
      newBook: {
        title: '',
        section_id: '',
        stock: '',
        author: ''
      },
      books: [],
      showBookModal: false,
      myModal: null
    };
  },
  created() {
    this.fetchSections();
    this.fetchBooks();
  },
  mounted() {
    this.myModal = new bootstrap.Modal(document.getElementById('BookAdd'));
  },
  methods: {
    async fetchSections() {
      try {
        const response = await fetch('/api/sections', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        const data = await response.json();
        this.sections = data;
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    },
    async fetchBooks() {
      try {
        const response = await fetch('/api/books', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        const data = await response.json();
        this.books = data;
        console.log('Books:', this.books);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    },
    async addBook() {
      try {
        await fetch('/api/books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token'),
          },
          body: JSON.stringify({
            title: this.newBook.title,
            section_id: this.selectedSectionId,
            stock: this.newBook.stock,
            author: this.newBook.author
          })
        });
        this.newBook = {
          title: '',
          section_id: '',
          stock: '',
          author: ''
        };
        this.closeBookModal();
        this.fetchBooks();
      } catch (error) {
        console.error('Error adding book:', error);
      }
    },
    openBookModal(sectionId) {
      console.log('Opening book modal for section:', sectionId);
      this.showBookModal = true;
      this.selectedSectionId = sectionId;
      this.selectedSectionName = this.sections.find(section => section.id === sectionId).name;
      this.myModal.show();
    },
    closeBookModal() {
      this.showBookModal = false;
      this.selectedSectionId = '';
    },
    async addSection() {
      try {
        const response = await fetch('/api/sections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token'),
          },
          body: JSON.stringify({ name: this.newSection.name, description: this.newSection.desc })
        });
        this.fetchSections();
      } catch (error) {
        console.error('Error adding section:', error);
      }
    },
    getSectionName(sectionId) {
      const section = this.sections.find(section => section.id === sectionId);
      return section ? section.name : '';
    }
  }
};
export default AdminDashboard;