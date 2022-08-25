import { createClient } from 'redis';

const redisPassword = process.env.REDIS_PASSWORD || 'testing';

const redisUrl = `redis://default:${redisPassword}@redis:6379`;

class Datastore {
  static async getScores() {
    const ds = createClient({
      url: redisUrl,
    });
    ds.on('error', (err) => console.log('Redis Client Error.\n', err));
    await ds.connect();
    const scoresRaw = await ds.lRange('scores', 0, -1);
    const allScores = [];
    scoresRaw
      .sort((a, b) => JSON.parse(b)[1] - JSON.parse(a)[1])
      .forEach((s) => allScores.push(JSON.parse(s)));
    await ds.quit();
    return allScores;
  }

  static async setScore(name, amount) {
    const ds = createClient({
      url: redisUrl,
    });
    ds.on('error', (err) => console.log('Redis Client Error.\n', err));
    await ds.connect();
    await ds.lPush('scores', JSON.stringify([name, amount]));
    await ds.quit();
  }
}

export default Datastore;
