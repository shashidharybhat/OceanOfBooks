const AdminDashboard = {
  template: `
  <div class="container">
  <div v-if="sections.length">
    <div v-for="section in sections" :key="section.id" class="row mt-2 mb-2 bg-light">
      <div class="d-flex justify-content-between w-100">
        <h2 class="modal-title text-center">{{ section.name }}</h2>
        <div class="flex-shrink-1">
          <button @click.prevent="openBookModal(section.id)" class="align-items-center btn btn-info btn-sm">Add Book</button>
          <button @click.prevent="openSectionEditModal(section.id)" class="align-items-center btn btn-warning btn-sm">Edit Section</button>
          <button @click.prevent="deleteSection(section.id)" class="align-items-center btn btn-danger btn-sm">Delete Section</button>
          </div>
      </div>
      <div v-if="books.length">
        <div class="row mt-4 mb-4 row-cols-4">
            <div v-for="book in books" v-if="book.section_id === section.id" :key="book.id">
              <div class="col">
                <div class="card mt-2" style="min-width: 120px">
                  <h5 class="card-header">{{ book.title }}</h5>
                  <div class="card-body">
                    <div class="d-flex flex-column justify-content-between flex-shrink-1">
                      <p class="small">Section: {{ getSectionName(book.section_id) }}</p>
                      <p class="small">Author: {{ book.author }}</p>
                      <p class="small">Availability: {{ book.stock }}</p>
                      <button @click.prevent="deleteBook(book.id)" class="btn btn-danger btn-sm">Delete Book</button>
                    </div>
                  </div>
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
        <h4 class="modal-title text-center">No Sections Available</h4>
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
    <div class="modal fade" id="SectionEdit" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add New Section</h5>
            <button type="button" class="btn-close" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="editSection">
              <div class="mb-3">
                <label for="sectionName" class="form-label">Section Name</label>
                <input type="text" v-model="newSection.name" class="form-control" id="sectionName" required>
                <label for="sectionDesc" class="form-label">Section Description</label>
                <input type="text" v-model="newSection.description" class="form-control" id="sectionDesc" required>
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
      selectedSectionDesc: '',
      newSection: {
        name: '',
        description: ''
      },
      newBook: {
        title: '',
        section_id: '',
        stock: '',
        author: ''
      },
      books: [],
      AddBookModal: null
    };
  },
  created() {
    this.fetchSections();
    this.fetchBooks();
  },
  mounted() {
    this.AddBookModal = new bootstrap.Modal(document.getElementById('BookAdd'));
    this.SectionEditModal = new bootstrap.Modal(document.getElementById('SectionEdit'));
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
    async editSection() {
      try {
        const response = await fetch(`/api/sections/${this.selectedSectionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify({ name: this.newSection.name, description: this.newSection.desc })
        });
        this.fetchSections();
      } catch (error) {
        console.error('Error editing section:', error);
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
      this.selectedSectionId = sectionId;
      this.selectedSectionName = this.sections.find(section => section.id === sectionId).name;
      this.AddBookModal.show();
    },
    closeBookModal() {
      this.AddBookModal.hide();
      this.selectedSectionId = '';
    },
    openSectionEditModal(sectionId) {
      this.newSection = this.sections.find(section => section.id === sectionId);
      this.selectedSectionId = sectionId;
      console.log('Editing section:', this.newSection);
      this.SectionEditModal.show();
    },
    closeSectionEditModal() {
      this.SectionEditModal.hide();
      this.newSection = {
        name: '',
        desc: ''
      };
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
        this.newSection = {
          name: '',
          desc: ''
        };
        this.fetchSections();
      } catch (error) {
        console.error('Error adding section:', error);
      }
    },
    async deleteSection(sectionId) {
      try {
        const response = await fetch(`/api/sections/${sectionId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        this.fetchSections();
      } catch (error) {
        console.error('Error deleting section:', error);
      }
    },
    async deleteBook(bookId) {
      try {
        const response = await fetch(`/api/books/${bookId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        this.fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    },
    getSectionName(sectionId) {
      const section = this.sections.find(section => section.id === sectionId);
      return section ? section.name : '';
    }
  }
};
export default AdminDashboard;