const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://admin:mO29Y4cMikV9U2Vf@eter.dsvmalt.mongodb.net/?retryWrites=true&w=majority&appName=Eter";

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

module.exports = {
    async addGuild(guildData) {
        const guildCollection = database.collection('Guilds');
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
        const collection = database.collection('Guilds');

        const result = await collection.findOne({ id: id });

        return result;
    },

    async addLog(logType, targetId, serverId, userId, reason, expiration) {
        const logCollection = database.collection('Logs');
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

    // async addLog(type, log) {
    //     const logData = database.collection('Bot Log');

    //     const logObject = {

    //     }
    // }


};