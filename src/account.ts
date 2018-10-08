import * as OrbitDB from 'orbit-db';
import * as IPFS from 'ipfs';
import {DefaultIpfs} from './ipfs';
let Key = require('interface-datastore').Key;
let Keystore = require('orbit-db-keystore');
import {OrbitFS} from './fs';

let Store = require('store2');

class DataStore {
  datastore: any = Store;
  constructor(public namespace?: string){
  }

  has(key:any) {
    return this.datastore.has(new Key(key));
  }

  put(key:any, value:any){
    return  this.datastore.set(new Key(key), value, true);
  }

  get(key:any){
      return this.datastore.get(new Key(key));
  }
}

export class Account {
  orbitdb!: OrbitDB;
  DBdirectory: string;
  options: any;
  contacts: any[];
  contactsMap: Map<any,any>;
  posts: any[];
  db: any;
  ipfs: IPFS;
  _dataStore: DataStore;
  name = '';
  petitions: any[] = [];


  constructor(ipfs: IPFS, options?: any) {
      this.DBdirectory = Object.assign({directory: "./orbitdb"},options).directory;
      this.contacts = [];
      this.contactsMap = new Map();
      this.posts = [];
      this.ipfs = ipfs;
      this._dataStore = new DataStore();
      this.orbitdb = new OrbitDB(ipfs, this.DBdirectory, options);
  }

  static async create(ipfs: IPFS, options?:any) {
      return new Account(ipfs, options);
  }

  get repo(): any {
    return (this.ipfs as any)._repo;
  }

  get storage(): any {
    if (this.repo.closed){
      this.repo.datastore.open();
    }
    return this._dataStore;
  }

  loggedin() {
    return this.storage.has('account');
  }

  saveAccount(){
    this.storage.put('account', this.orbitdb.id);
  }

  fromStorage(){
    return this.storage.get('account');
  }

  async accountDB(){
    if (!this.db){
      this.db = await this.orbitdb.keyvalue('OpenSourceDemocracy',
      {sync:true, write:["*"]});
      await this.db.load();
    }
    return this.db;
  }

  async login(email: string, password:string){
    let db = await this.accountDB();
    let encryptedKey = db.get(email);
    this.importAccount(encryptedKey, password);
    this.orbitdb = new OrbitDB(this.ipfs, this.DBdirectory,
      {peerId: encryptedKey.id, keystore: this.orbitdb.keystore});
    this.saveAccount();
  }

  get key() {
    return this.orbitdb.key;
  }

  get keystore(){
    return this.orbitdb.keystore;
  }

  get id() {
    return this.orbitdb.id;
  }

  get publicKey() {
    return this.key.getPublic('hex');
  }

  async exportAccount(password: string){
    return this.keystore.exportKey(this.id, password);
  }

  async importAccount(exportedKey: any, password: string){
    try {
      exportedKey.salt = exportedKey.salt.data;
      exportedKey.IV = exportedKey.IV.data;
      exportedKey.data = exportedKey.data.data;
    await this.keystore.importKey(exportedKey, password);
    this.orbitdb = new OrbitDB(this.ipfs, this.DBdirectory,
      {peerId: exportedKey.id, keystore: this.orbitdb.keystore});
    await this.saveAccount();
  } catch(err){
      console.log(err);
  }
  }

  async getPrivateFS(key: string){
    return OrbitFS.create(this.orbitdb, "ROOT", [key]);
  }

  sign(data) {
    return this.keystore.sign(this.key, data);
  }

  verify(signature, key, data){
    return this.keystore.verify(signature, key, data);
  }
}

// async function test(){
//   let account = new Account(await DefaultIpfs.create(),"./orbitdb");
//   let exportedKey = await account.orbitdb.keystore.exportKey(account.id, "password");
//   let keystore = Keystore.create("./.test_keystore");
//   await keystore.importKey(exportedKey, 'password');
//   console.log(keystore.getKey(account.id));
//   console.log(account.orbitdb.keystore.getKey(account.id));
// }
// test();
