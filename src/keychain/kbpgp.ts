
import KeyChain from './keychain';

import kbpgp = require("kbpgp");

let my_asp = new kbpgp.ASP({
    progress_hook: function(o) {
      console.log("I was called with progress!", o);
    }
 });
interface Options {

    asp: any,
    userid: string,
    primary: {nbits: number},
    subkeys: any[]

}
let DefaultOptions = {
  asp:my_asp,
  primary:{nbits: 4096},
  subkeys:[],
}
 export class Kbpgp {
   constructor() {

   }

   static async create(id:string){
     let opts:Options = {
       ...DefaultOptions,
       userid: id
     }
     return new Promise((resolve, reject) => {
         kbpgp.KeyManager.generate_ecc(opts,
            function (err, res) {
             if (err){
               reject(err);
             }else{
               resolve(res);
             }
     })})
 }
}
