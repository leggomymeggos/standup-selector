function Admin(row) {
    this.email = row[0];
    this.slackName = row[1];
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Admin
}