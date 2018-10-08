import * as IPFS from 'ipfs';
let Repo = require('ipfs-repo');
let Memory = require('interface-datastore').MemoryDatastore;
let Lock = require('ipfs-repo/src/lock-memory');
let repo = {
  storageBackends: {
    root: Memory, // version and config data will be saved here
    blocks: Memory,
    keys: Memory,
    datastore: Memory
  },
  lock: Lock
}

export class DefaultIpfs {
  static config = {
    repo: './.ipfs',
    EXPERIMENTAL: {
      pubsub: true,
    },
    config: {
      Addresses: {
        Swarm: [
          '/dns4/spacestation.hopto.org/tcp/9090/wss/p2p-websocket-star',
        ],
      },
    },
  };

  public static async create(config?:any ): Promise<any> {
    config = Object.assign(DefaultIpfs.config, config);
    return new Promise((resolve, reject) => {
      let ipfs = new IPFS(config);
      ipfs.on('error', reject);
      ipfs.on('ready', () => resolve(ipfs));
    });
  }

  public static async createTemp(config = DefaultIpfs.config): Promise<any> {
    return new Promise((resolve, reject) => {
      let ipfs = new IPFS({ ...config, repo:  DefaultIpfs.TempRepo(__dirname)});
      ipfs.on('error', reject);
      ipfs.on('ready', () => resolve(ipfs));
    });
  }
  public static TempRepo(dirname: string) {
    return new Repo(dirname + "/.jsipfs", repo)
  }
}
