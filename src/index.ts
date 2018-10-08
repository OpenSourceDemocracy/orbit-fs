import {Account} from "./account";
import {DefaultIpfs} from "./ipfs";



async function main() {
  try {
  let ipfs = await DefaultIpfs.create();
  console.log(ipfs.isOnline());
  let a = new Account(ipfs);
  console.log(a.id);
  }
  catch (err){
    console.log(err);
  }
  debugger;

}

main();
