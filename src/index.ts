import BaseClient from 'lavalink';
import Redis = require('ioredis');
import QueueStore from './QueueStore';
import Queue from './Queue';
import { ClientOptions } from 'lavalink/typings/core/Client';

export interface Options extends ClientOptions {
  hosts?: {
    ws?: string;
    rest?: string;
    redis?: Redis.Redis | Redis.RedisOptions;
  }
}

export abstract class Client extends BaseClient {
  public readonly queues: QueueStore;

  constructor(opts: Options) {
    if (!opts.hosts || !opts.hosts.redis) throw new Error('cannot make a queue without a Redis connection');

    super(opts);
    this.queues = new QueueStore(this, opts.hosts.redis instanceof Redis ? opts.hosts.redis : new Redis(opts.hosts.redis));

    this.on('event', (d) => {
      this.queues.get(d.guildId).emit('event', d);
    });

    this.on('playerUpdate', (d) => {
      this.queues.get(d.guildId).emit('playerUpdate', d);
    });
  }
}

export {
  QueueStore,
  Queue,
}

export default Client;
