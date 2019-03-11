import * as IPFS from 'ipfs';
let ipfsAPI = require('ipfs-api');
let Repo = require('ipfs-repo');
let Memory = require('interface-datastore').MemoryDatastore;
let Lock = require('ipfs-repo/src/lock-memory');
import * as Orbitdb from 'orbit-db';
import * as fs from 'fs';
import * as path from 'path';
var ipfsClient = require('ipfs-http-client');

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
          '/dns4/ws-star1.par.dwebops.pub/tcp/443/wss/p2p-websocket-star/',
          // '/dns4/spacestation.hopto.org/tcp/9090/wss/p2p-websocket-star',
        ],
      },
    },
  };

  public static async createAPI(addr ='localhost', port = '5001', options = {protocol:'http'}): Promise<any> {
    return ipfsClient();
  }


  public static async create(config?:any ): Promise<any> {
    config = Object.assign(DefaultIpfs.config, config);
    return new Promise((resolve, reject) => {
      let ipfs: IPFS = new IPFS(config);
      ipfs.on('error', reject);
      ipfs.on('ready', () => resolve(ipfs));
    });
  }

  public static syncCreate(config: any, cb: (err:any,res?:any) => void) {
    config = Object.assign(DefaultIpfs.config, config);
    let ipfs: IPFS = new IPFS(config);
    (ipfs as any).on('error', (err) => cb(err, null));
    ipfs.on('ready', () => cb(null, ipfs));

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


export class DefaultOrbitdb {
  public static async create(config?: any): Promise<Orbitdb> {
    var ipfs: IPFS;
    if (config.ipfs){
      ipfs = config.ipfs
    } else {
      ipfs =(await DefaultIpfs.createTemp());
    }
    let orbitdir = "./.orbitdb/DEFAULT";

    // var id;
    // try {
    //   let dir = fs.readdirSync(orbitdir);
    //   for (let x in dir) {
    //     var isAvailable = false;
    //     id = path.join(orbitdir, dir[x]);
    //     let dirs = fs.readdirSync(id);
    //     for (let dir in dirs) {
    //         if (fs.existsSync(path.join(id, dir,'default'))){
    //           isAvailable = fs.existsSync(path.join(id, dir,'default', 'LOCK'));
    //           break;
    //         }
    //      }
    //     if (isAvailable){
    //       console.log(`Found ${id}`);
    //       orbitPath = id;
    //       break;
    //     }
    //   }
    // } catch (err){
    //   console.log(err);
    //   throw err;
    // }
    return new Orbitdb(ipfs, orbitdir);
  }
}
