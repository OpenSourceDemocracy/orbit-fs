let mfs = require("ipfs-mfs").core;
import { DefaultIpfs } from "./ipfs";
import * as Orbitdb from "orbit-db";
import * as ipfs from "ipfs";
let Key = require("interface-datastore").Key;
let bs58 = require("bs58");
import { EventStore, Store } from "./store";

type Path = string;

type Content = string | Buffer | ReadableStream | Blob | Path | ArrayBuffer;

class OrbitFS {
  mfs: any;
  store: EventStore<any>;
  ipfs: ipfs;
  RootKey = new Key("/local/filesroot");
  repo: any;
  datastore: any;
  bs58 = bs58;
  static EMPTY_DIRECTORY_HASH =
    "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn";

  constructor(ipfs: ipfs, store: EventStore<any>, options?: any) {
    this.ipfs = ipfs;
    // this.RootKey = new Key(store.address);
    this.mfs = mfs(ipfs, { ...options });
    this.repo = (ipfs as any)._repo;
    this.datastore = this.repo && this.repo.datastore;
    this.store = store;

    this.store.events.on("ready", async (dbname: string) => {
      debugger;
      await this.updateRoot(this.store.peek());
    });
    this.store.events.on("replicated", async (address: string) => {
      await this.updateRoot(this.store.peek());
    });
    store.load();
  }

  async commit() {
    this.store.add(await this.Root());
  }

  async Root(): Promise<string> {
    return (await this.stat("/")).hash;
  }

  async updateRoot(buffer: string) {
    buffer = bs58.decode(buffer);
    if (this.repo.closed) {
      await this.datastore.open();
    }
    await this.datastore.put(this.RootKey, buffer);
  }

  async cp(from: Path[], to: Path, options?: any) {
    return this.mfs.cp(from, to, options);
  }

  async mkdir(path: Path, options?: any) {
    return this.mfs.mkdir(path, options);
  }

  async stat(path: Path, options?: any) {
    try {
      let stat = this.mfs.stat(path, options);
      return stat;
    } catch (err) {
      return false;
    }
  }

  async rm(paths: Path[], options?: any) {
    return this.mfs.rm(paths, options);
  }

  async read(path: Path, options?: any) {
    return this.mfs.read(path, options);
  }

  static async readFile(file: File) {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result);
      };
      temporaryFileReader.readAsText(file);
    });
  }

  async readReadableStream(path: Path, options?: any) {
    return this.mfs.ReadReadableStream(path, options);
  }

  async readPullStream(path: Path, options?: any) {
    return this.mfs.readPullstream(path, options);
  }

  async write(path: Path, content: Content, options?: any) {
    if (content instanceof ArrayBuffer) {
      content = Buffer.from(content);
    } else if (typeof content === "string") {
      content = new Blob([content]);
    }
    return this.mfs.write(path, content, { ...options, cidVersion: 0 });
  }

  async mv(from: Path[], to: Path, options?: any) {
    return this.mfs.mv(from, to, options);
  }

  async flush(paths: Path[]) {
    return this.mfs.flush(paths);
  }

  async ls(path: Path) {
    return this.mfs.ls(path);
  }

  static async create(
    orbitdb: Orbitdb,
    address: string,
    permission = ["*"],
    options?: any
  ) {
    let eventStore = new EventStore(
      await orbitdb.eventlog(address, {
        write: permission,
        sync: true
      })
    );
    return new OrbitFS(orbitdb._ipfs, eventStore, options);
  }
}

export { OrbitFS };



async function test() {
  // let orbitdb = await OrbitManager.createOrbit('./orbitdb')
  let ipfs = await DefaultIpfs.create();
  let ipfs2 = await DefaultIpfs.create({repo:"./.temp"});

  console.log(ipfs2.isOnline());
  // let orbitdb = new Orbitdb(ipfs, './.orbitdb');
  // let ipfs2 = await DefaultIpfs.createTemp();
  // let orbitdb2 = new Orbitdb(ipfs2, './.orbitdb');
  // let eventStore = await orbitdb.eventlog('test')
  // // await eventStore.load();
  // // eventStore.add("Hello");
  // // console.log(eventStore.get(0));
  // let orbitdb1 = await OrbitManager.createOrbit('./orbitdb2', {temp:true});
  // let eventStore = new EventStore(await orbitdb.eventlog('test', {write: ['*']}));
  // let eventStore2 = new EventStore(await orbitdb1.eventlog('test', {write: ['*']}));
  // // await eventStore.load();
  // // await eventStore2.load();
  // console.log(eventStore.address);
  // console.log(eventStore2.address);
  //
  // eventStore.events.on('replicated', () => {
  //   console.log(eventStore.peek());
  // });
  // eventStore2.events.on('replicated', () => {
  //   console.log("event2: " + eventStore2.peek());
  // });
  // let i = 0;
  //  setInterval(async () => {
  //    console.log("added!");
  //    eventStore.add(`hello world ${i++}`);
  //    console.log(eventStore.peek())},
  //             3000);

  //
  // let orbitfs = await OrbitFS.create(orbitdb, 'test');
  // let orbitfs2 = await OrbitFS.create(orbitdb2, 'test');
  //
  // console.log(await orbitfs2.stat('/'));
  // try {
  //   await orbitfs.mfs.stat('/test')
  //   await orbitfs.mfs.rm('/test', { recursive: true });
  // } catch (err) {
  // }
  // console.log(orbitfs.store.all);
  // await orbitfs.mkdir('/test');
  // console.log(orbitfs.store.all);
  // orbitfs.commit();
  // console.log(orbitfs.store.all);
  // console.log(await orbitfs2.ls('/'))
  // orbitfs.updateRoot(await orbitfs.Root())
  // console.log(await orbitfs2.stat('/'));
  try {
    // orbitdb._ipfs.stop();
  } catch (err) {}

  // try {
  //   await orbitfs.mfs.stat('/test')
  //   await orbitfs.mfs.rm('/test', { recursive: true });
  // } catch (err) {
  // }
  // await orbitfs.mfs.mkdir('/test');
  // console.log(await orbitfs.mfs.stat('/'))
  // let orbitfs2 = new OrbitFS(ipfs, './orbit', { root: 'Qmf8aX5W6wboWckFvkuxXVhDSzqxSgnjGuNPfbiELCeDFF' });
}
test();
