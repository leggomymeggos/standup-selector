function Admin(row) {
    this.email = row[0];
    this.slackName = row[1];
    this.dmUcid = row[2] === '' ? undefined : row[2];
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Admin
}