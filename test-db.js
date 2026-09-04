const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('intima-health');
    const doctors = database.collection('doctors');
    const allDoctors = await doctors.find({}, { projection: { email: 1, showOnHomepage: 1 } }).toArray();
    console.log(JSON.stringify(allDoctors, null, 2));
  } finally {
    await client.close();
  }
}
main().catch(console.dir);
