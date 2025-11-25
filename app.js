// Block Shift - Frequency Tracking System

class FrequencyManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('blockShiftUsers')) || [];
        this.currentUserId = JSON.parse(localStorage.getItem('blockShiftUserId')) || 1;

        this.init();
    }

    init() {
        this.renderTable();
        this.bindEvents();
    }

    bindEvents() {
        // Modal triggers
        document.getElementById('addUserBtn').addEventListener('click', () => this.showModal('addUserModal'));
        document.getElementById('assignFrequencyBtn').addEventListener('click', () => {
            this.populateUserSelect();
            this.showModal('assignFrequencyModal');
        });

        // Close modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.hideModal(closeBtn.closest('.modal').id));
        });

        // Click outside modal
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });

        // Form submissions
        document.getElementById('addUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addUser();
        });

        document.getElementById('assignFrequencyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.assignFrequency();
        });

        // Table actions
        document.getElementById('frequencyTableBody').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                this.deleteUser(e.target.dataset.userId);
            } else if (e.target.classList.contains('status-toggle')) {
                this.toggleStatus(e.target.dataset.userId);
            }
        });
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    addUser() {
        const userName = document.getElementById('userName').value.trim();

        if (!userName) return;

        const user = {
            id: this.currentUserId++,
            name: userName,
            frequency: null,
            status: 'Idle',
            lastActivity: new Date().toLocaleString()
        };

        this.users.push(user);
        this.saveData();
        this.renderTable();
        this.hideModal('addUserModal');
        document.getElementById('addUserForm').reset();
    }

    assignFrequency() {
        const userId = Number(document.getElementById('userSelect').value);
        const frequency = Number(document.getElementById('frequencyValue').value);

        if (!userId || isNaN(frequency) || frequency <= 0) return;

        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.frequency = frequency;
            user.status = 'Active';
            user.lastActivity = new Date().toLocaleString();

            this.saveData();
            this.renderTable();
            this.hideModal('assignFrequencyModal');
            document.getElementById('assignFrequencyForm').reset();
        }
    }

    deleteUser(userId) {
        const userIdNum = Number(userId);
        if (confirm('Are you sure you want to delete this user?')) {
            this.users = this.users.filter(u => u.id !== userIdNum);
            this.saveData();
            this.renderTable();
        }
    }

    toggleStatus(userId) {
        const userIdNum = Number(userId);
        const user = this.users.find(u => u.id === userIdNum);

        if (user) {
            const statusCycle = ['Idle', 'Active', 'Inactive'];
            const currentIndex = statusCycle.indexOf(user.status);
            user.status = statusCycle[(currentIndex + 1) % statusCycle.length];
            user.lastActivity = new Date().toLocaleString();

            this.saveData();
            this.renderTable();
        }
    }

    populateUserSelect() {
        const select = document.getElementById('userSelect');
        select.innerHTML = '<option value="">Select User</option>';

        this.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            select.appendChild(option);
        });
    }

    renderTable() {
        const tbody = document.getElementById('frequencyTableBody');
        tbody.innerHTML = '';

        if (this.users.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    No users added yet. Click "Add User" to get started.
                </td>
            `;
            tbody.appendChild(row);
            return;
        }

        this.users.forEach(user => {
            const row = document.createElement('tr');
            const statusClass = `status-${user.status.toLowerCase()}`;
            const actions = `
                <button class="btn btn-danger delete-btn" data-user-id="${user.id}">Delete</button>
                <button class="btn btn-secondary status-toggle" data-user-id="${user.id}">Change Status</button>
            `;

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.frequency ? user.frequency + ' MHz' : 'Not Assigned'}</td>
                <td class="${statusClass}">${user.status}</td>
                <td>${user.lastActivity}</td>
                <td>${actions}</td>
            `;

            tbody.appendChild(row);
        });
    }

    saveData() {
        localStorage.setItem('blockShiftUsers', JSON.stringify(this.users));
        localStorage.setItem('blockShiftUserId', JSON.stringify(this.currentUserId));
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new FrequencyManager();
});
