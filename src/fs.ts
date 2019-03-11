let mfs = require("ipfs-mfs").core;
import * as Orbitdb from "orbit-db";
import * as ipfs from "ipfs";
let Key = require("interface-datastore").Key;
let bs58 = require("bs58");
import { EventStore } from "./store";
import {DefaultOrbitdb} from "./ipfs";

type Path = string;

type Content = string | Buffer | ReadableStream | Blob | Path | ArrayBuffer;

export interface StatInfo {
  size: number;
  blocks: number;
  type: string
}

export class OrbitFS {
  mfs: any;
  store: EventStore<any>;
  ipfs: ipfs;
  RootKey = new Key("/");
  repo: any;
  datastore: any;
  bs58 = bs58;
  static EMPTY_DIRECTORY_HASH =
    "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn";
  static DEFAULT_DB_ADDRESS = "defualt";
  syncRoot: string;

  constructor(public orbitdb: Orbitdb, store: EventStore<any>, options?: any) {
    this.ipfs = orbitdb._ipfs;
    // this.RootKey = new Key(store.address);
    this.mfs = mfs(this.ipfs, { ...options });
    this.repo = (this.ipfs as any)._repo;
    this.datastore = this.repo && this.repo.datastore;
    this.store = store;
    this.syncRoot = OrbitFS.EMPTY_DIRECTORY_HASH;

    this.store.events.on("ready", async (dbname: string) => {
      debugger;
      let root = this.store.peek();
      if (root) {
        await this.updateRoot(root);
      }
    });
    this.store.events.on("replicated", async (address: string) => {
      debugger;
      await this.updateRoot(this.store.peek());
      console.log(await this.Root());
    });
    this.store.load();

  }

  async commit() {
    await this.store.add(await this.Root());
  }

  async Root(): Promise<string> {
    return (await this.stat("/")).hash;
  }

  async updateRoot(buffer: string|Buffer): Promise<any> {
    debugger;
    buffer = bs58.decode(buffer.toString());
    if (this.repo.closed) {
      await this.datastore.open();
    }
    return new Promise(
      (resolve, reject) => this.datastore.put(this.RootKey, buffer,
          (err)=> {
              if (err){
                reject(err);
              }
              else {
                resolve();
                this.syncRoot = bs58.encode(buffer);
              }
              })
    );
  }

  id() {
    return this.orbitdb.id;
  }

  async cp(from: Path, to: Path, options?: any) {
    return this.mfs.cp([from, to], options);
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

  // static async readFile(file: File) {
  //   return await
  // }

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

  async mv(from: Path, to: Path, options?: any) {
    return this.mfs.mv([from, to], options);
  }

  async flush(paths: Path[]) {
    return this.mfs.flush(paths);
  }

  async ls(path: Path): Promise<string[]> {
    return this.mfs.ls(path);
  }

  static async createDefault(address: string = OrbitFS.DEFAULT_DB_ADDRESS){
    let db = await DefaultOrbitdb.create();
    return await OrbitFS.create(address, ["*"], db);
  }

  static async fromIPFS(ipfs: ipfs, address: string = OrbitFS.DEFAULT_DB_ADDRESS) {
    let db = await DefaultOrbitdb.create({ipfs:ipfs});
    return await OrbitFS.create(address, ["*"], db);
  }

  static async create(
    address: string,
    permission = ["*"],
    orbitdb?: Orbitdb,
    options?: any
  ) {
    let eventStore = new EventStore(
      await orbitdb.eventlog(address, {
        write: permission,
        sync: true
      })
    );
    let fs = new OrbitFS(orbitdb, eventStore, options);
    // await fs.store.load();
    return fs;
  }

  async empty(): Promise<void> {
    await this.updateRoot(OrbitFS.EMPTY_DIRECTORY_HASH);
  }
}
