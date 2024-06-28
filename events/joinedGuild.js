const databaseHandler = require('../database/databaseHandler.js');

module.exports = {
    async joinedGuild(guild) {
        if (databaseHandler.isGuildInDatabase(guild.id) == null) {
            databaseHandler.addGuild(guild);
        };
    }
};