function Admin(row) {
    this.email = row[0];
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Admin
}