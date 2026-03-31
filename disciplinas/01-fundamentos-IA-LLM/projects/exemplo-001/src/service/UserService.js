export class UserService {
    #storageKey = 'ew-academy-users';

    async getDefaultUsers() {
        const response = await fetch('./data/users.json');
        const users = await response.json();
        this.#setStorage(users);

        return users;
    }

    async getUsers() {
        const users = this.#getStorage();
        return users;
    }

    async getUserById(userId) {
        const users = this.#getStorage();
        return users.find(user => user.id === userId);
    }

    async updateUser(user) {
        const users = this.#getStorage();
        const userIndex = users.findIndex(u => u.id === user.id);

        users[userIndex] = { ...users[userIndex], ...user };
        this.#setStorage(users);

        return users[userIndex];
    }

    async addUser(user) {
        const users = this.#getStorage();
        this.#setStorage([user, ...users]);
    }

    #getStorage() {
        const data = sessionStorage.getItem(this.#storageKey);
        return data ? JSON.parse(data) : [];
    }

    #setStorage(data) {
        sessionStorage.setItem(this.#storageKey, JSON.stringify(data));
    }


}
