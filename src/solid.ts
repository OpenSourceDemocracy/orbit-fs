import * as rdf from "rdflib";
import {Kbpgp} from "./keychain/kbpgp";
let SolidAuthClient = require("solid-auth-client");

const FOAF = rdf.Namespace("http://xmlns.com/foaf/0.1/");
const VCARD = rdf.Namespace("http://www.w3.org/2006/vcard/ns#");
const PIM = rdf.Namespace("http://www.w3.org/ns/pim/space#");
type url = string;

class Profile {
  static instances = new Map();
  id:url
  doc:any
  store:any
  fetcher: any
  updater: any
  container:any
  key:any
  PUB:any
  CARD:any
  constructor(id: string , store?: any ) {
    this.id = id;
    this.doc = rdf.sym(id); //Make WebID Subject
    // Set up a local data store and associated data fetcher and updater
    this.store = store ? store : rdf.graph();
    this.fetcher = new rdf.Fetcher(this.store);
    this.updater = new rdf.UpdateManager(this.store);

  }

  get storage(){
    return this.store.any(this.doc, PIM("storage"), null);
  }

  get fullName() {
   return this.store.any(this.doc, VCARD('fn'));
  }

  get friends() {
    return this.store.each(this.doc, VCARD("url"));
  }

  /*
   *  Use async static method because constructor can't be asynchronous
  */
  static async create(id) {
    let account = new Profile(id);
    await account.fetcher.load(id);
    //  account.container = await account.fetcher.createContainer(account.storage.uri+"/public", "petitions")
    account.key = await Kbpgp.create(account.id);
    let pub = account.storage.uri+"public/";
    await account.fetcher.load(pub);
    account.PUB = rdf.Namespace(pub);
    account.CARD = rdf.Namespace(id.split("#")[0]+"#")
    return account;
  }



  static async login() {
    await SolidAuthClient.popupLogin({
      popupUri:
        "https://ipfs.io/ipfs/QmUvhFLdZGUQMA5qHxYbRdMg6gstyfLyNSvUUzfwWV261Z/login.html"
    });

  }

  static async nodeLogin(idp){
      const session = await SolidAuthClient.currentSession();
      if (!session)
        await SolidAuthClient.login(idp);
      else
        console.log(`Logged in as ${session.webId}`);

  }

  static async logout() {
    await SolidAuthClient.logout();
  }

}
async function test(){
  Profile.nodeLogin("https://sirwillem.solid.community/profile/card#me")

}

// async function addKey(person) {
//   if (!my){
//     my = await Profile.create(person);
//   }
//   console.log("addKey " + my.id);
//   let thisResource = my.doc;
//   let key = $rdf.lit("My Public Key!");
//   let hasKey = VCARD("hasKey");
//   let statement = new $rdf.Statement(
//     thisResource,
//     hasKey,
//     key,
//     thisResource.doc
//   );
//
//   await my.updater.insert_statement(statement);
//   console.log(my.store.any(my.doc, VCARD('hasKey')));
//   debugger;
//   // console.log(my.container);
// }
//
//
// async function loadProfile(person) {
//   my = await Profile.create(person);
//   const fullName = my.fullName
//   $("#viewer").show();
//   $("#profile").val(person);
//   $("#fullName").text(fullName && fullName.value);
//
//   // Load the person's friends
//   const friends = my.friends
//   $("#friends").empty();
//   friends.forEach(async friend => {
//     await my.fetcher.load(friend);
//     const fullName = my.store.any(friend, VCARD("fn"));
//     const photo = my.store.any(friend, VCARD("hasPhoto"));
//     if (photo){
//       $("#friends").append(
//         $("<li><img src=" + photo.value + "></img>").append(
//           $("<a>")
//             .text(fullName && fullName.value)
//             .click(() => loadProfile(friend.value))
//         )
//     );
//     }
//   });
// }
