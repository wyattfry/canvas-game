import { createClient } from 'redis';

const redisPassword = process.env.REDIS_PASSWORD || 'testing';

const redisUrl = `redis://default:${redisPassword}@redis:6379`;

class Datastore {
  static getScores(callback) {
    const ds = createClient({
      url: redisUrl,
    });
    ds.on('error', (err) => console.log('Redis Client Error.\n', err));
    ds.connect()
      .then(() => ds.lRange('scores', 0, -1))
      .then((scoresRaw) => {
        const allScores = [];
        scoresRaw.sort((a, b) => JSON.parse(b)[1] - JSON.parse(a)[1]).forEach((s) => {
          allScores.push(JSON.parse(s));
        });
        callback(allScores);
      })
      .then(() => ds.quit())
      .catch((error) => console.log('Error getting scores.\n', error));
  }

  static setScore(name, amount, callback) {
    const ds = createClient({
      url: redisUrl,
    });
    ds.on('error', (err) => console.log('Redis Client Error.\n', err));
    ds.connect()
      .then(() => ds.lPush('scores', JSON.stringify([name, amount])))
      .then(callback)
      .then(() => ds.quit())
      .catch((error) => console.error('Error setting score.\n', error));
  }
}

export default Datastore;
