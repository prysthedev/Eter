const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

try {
    client.connect();
    client.db("admin").command({ ping: 1 });
    console.log("[DATABASE] Pinged your deployment. You successfully connected to MongoDB!");
} catch(err) {
    console.log(err);
};

const database = client.db('Test');
const mainDatabase = client.db('Main')
const guildCollection = database.collection('Guilds');
const logCollection = database.collection('Logs');
const developerCollection = mainDatabase.collection('Developers');

module.exports = {
    async addGuild(guildData) {
        const time = new Date().getTime() / 1000;

        const guild = {
            id: guildData.id,
            ownerId: guildData.ownerId,
            members: guildData.memberCount,
            partnered: guildData.partnered,
            verified: guildData.verified,
            dataUpdated: time,
            added: time
        };

        const result = await guildCollection.insertOne(guild);

        console.log(`[DATABASE] Guild was added with _id: ${result.insertedId}`);
    },

    async isGuildInDatabase(id) {
        const result = await guildCollection.findOne({ guildId: id });

        return result;
    },

    async addLog(logType, targetId, serverId, userId, reason, expiration) {
        const time = new Date().getTime() / 1000;

        if (logType === "tempBan") {
            const log = {
                type: logType,
                user: userId,
                target: targetId,
                server: serverId,
                reason: reason,
                timeLogged: time,
                expiration: expiration
            };

            const result = await logCollection.insertOne(log);

            console.log(`[DATABASE] Temp ban log was added with _id: ${result.insertedId}`);
        } else {
            const log = {
                type: logType,
                user: userId,
                target: targetId,
                server: serverId,
                reason: reason,
                timeLogged: time
            };

            const result = await logCollection.insertOne(log);

            console.log(`[DATABASE] Log was added with _id: ${result.insertedId}`);
        }
    },

    async setLogChannelForGuild(guildId, webhookId, webhookToken) {
        const schema = {
            guildId: guildId,
            webhookId: webhookId,
            webhookToken: webhookToken
        };

        const result = await guildCollection.insertOne(schema);

        console.log(`[DATABASE] Log channel was added with _id: ${result.insertedId}`);
    },

    async updateLogChannelForGuild(guildId, webhookId, webhookToken) {
        await guildCollection.updateOne(
            { guildId: guildId },
            { $set: { webhookId: webhookId, webhookToken: webhookToken } }
        );

        console.log(`[DATABASE] Log channel was updated for guildId: ${guildId}`);
    },

    async setDebugMode(guildId, status) {
        const inDatabase = await guildCollection.findOne({ guildId: guildId });

        if (inDatabase == null) {
            const addToDatabase = {
                guildId: guildId,
                debug: status
            };

            const results = await guildCollection.insertOne(addToDatabase);

            console.log(`[DATABASE] Guild was added with _id: ${result.insertedId}`);
        } else {
            const results = await guildCollection.updateOne(
                { guildId: guildId },
                { $set: { debug: status } },
                { upsert: true}
            );

            console.log(`[DATABASE] Debug status was updated for guildID: ${guildId}`);
        };
    },

    async developers(action, user) {
        if (action == 'addDeveloper') {
            const inDatabase = await developerCollection.findOne({user: user});

            if (inDatabase != null) {
                return console.log(`[DATABASE] ${user} is already in database.`)
            };

            const document = {
                user: user
            };

            const results = await developerCollection.insertOne(document);

            console.log(`[DATABASE] ${user} is now a developer.`);
        } else if (action == 'removeDeveloper') {
            const results = await developerCollection.deleteOne(
                { user: user }
            );

            console.log(`[DATABASE] ${user} is no longer a developer.`);
        };
    },

    async isDeveloper(user) {
        const inDatabase = await developerCollection.findOne({ user: user });

        if (inDatabase == null) {
            return false
        } else {
            return true
        };
    },

    async isInDebugMode(guildId) {
        const databaseResults = await guildCollection.findOne(
            { guildId: guildId, debug: true }
        );

        if (databaseResults == null) {
            return false;
        } else {
            return true;
        };
    }

    // async addLog(type, log) {
    //     const logData = database.collection('Bot Log');

    //     const logObject = {

    //     }
    // }
};
