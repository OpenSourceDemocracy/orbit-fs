import { OrbitFS } from "../src/fs";
import * as _fs from "fs";
import * as path from "path";
import * as asc from "assemblyscript/cli/asc";
import * as process from 'process';
import { DefaultIpfs } from '../src/ipfs';
import * as IPFS from 'ipfs';
let bs58 = require("bs58");

import * as loader from "assemblyscript/dist/assemblyscript-loader";

let Key = require("interface-datastore").Key;
let source: string = `

declare function cat(path: string): string;
import "allocator/arena";

class A {
  constructor(public x: i32){}

}

export function runCat(): void {
  cat("Meow Meow!!");
}


export function makeA(x: i32): A {
  return new A(x);
}


`

async function cp_r(fs: OrbitFS, from: string, to: string) {
  let toplevel = path.basename(from);
  let addFolder = async (from, to) => {
    try {
      let entries = _fs.readdirSync(from);
      // console.log(entries);
      for (let i in entries) {
        let entry = entries[i];
        // console.log(entry + "-------------");
        let oldPath = path.join(from, entry);
        let newPath = path.join(to, entry);
        if (_fs.statSync(oldPath).isDirectory()) {
          // console.log(`copying directory ${oldPath} to ${newPath}`);
          await fs.mkdir(newPath, { p: true });
          await addFolder(oldPath, newPath);
          // console.log(await fs.ls(newPath+"/.."));
          // await fs.flush([newPath]);

        } else {
          // console.log(`copying ${oldPath} to ${newPath}`);
          await fs.write(newPath, Buffer.from(_fs.readFileSync(oldPath)), { create: true, parents:true })
          // await fs.flush([newPath]);
        }
      }
    } catch (err) {
      console.error(err)
    }
  }
  await fs.mkdir(to);
  await addFolder(from, to);
}
var ipfs: IPFS;
var fs;
async function main() {
  try {
    ipfs = await DefaultIpfs.createTemp();
    console.log(ipfs.isOnline());
    fs = await OrbitFS.fromIPFS(ipfs);
    await fs.updateRoot(Buffer.from("QmcbaKaJbMtnRgqKmAb2XAGoCHCLn75PEudZ4viJLPRe5v"));
    console.log(await fs.ls("/"));
    await fs.write('/index.ts', Buffer.from(source), { create: true });
    await cp_r(fs, `${__dirname}/../node_modules/assemblyscript/std/assembly`, "/~lib");
    let files = await fs.ls('/');
    console.log(files)
    debugger;

  } catch (e) {

  }

}
//  async function extra(){
//    try {
//    // await fs.mkdir('/dev/stdout', {p:true});
//    // let ipfs = ipfsClient();
//    // console.log((await ipfs.id()).id);
//    // let root = `/{Root}`;
//    // await fs.empty();
//    await fs.commit();
//    debugger;
//    // debugger;
//    // if (!(await fs.stat("/~lib"))){
//    //   await fs.cp('/std/assembly', "/~lib", {recursive:true, parents:true});
//    // }
//    // console.log(await fs.ls('/~lib'));
//
//
//    // await cp_r(fs, `${__dirname}/../node_modules/assemblyscript/std`, "/std");
//    // console.log(await fs.ls("/"));
//
//    // let stdout: asc.OutputStream = {
//    //   write : async (chunk) => {
//    //     await fs.write('/dev/stdout',chunk);
//    //   },
//    //   toBuffer :
//    // }
//    //
//    let options = {
//      readFile: async (baseName: string, baseDir: string):Promise<string> => {
//        debugger;
//        let name = path.join(baseDir, baseName);
//        let str = (await fs.read(name)).toString();
//        console.log(`reading ${name} + ${str}`);
//        return str;
//      },
//      writeFile: async (baseName: string, content: Uint8Array, baseDir: string): Promise<void> => {
//        let name = path.join(baseDir, baseName);
//        debugger;
//        await fs.write(name, Buffer.from(content), {create:true, flush:true});
//      },
//
//      optimizeLevel: 3,
//      baseDir:"/",
//      binaryFile: "a.wasm",
//      textFile: "a.wat",
//      // noLib:"",
//      // lib:"std/assembly"
//    }
//    let input = {"index.ts":""};
//    //
//    // console.log(Object.keys(input))
//    // try {
//    var res = await asc.compileString(input, options);
//    console.log(res.stderr.toString());
//    console.log(res);
//    console.log(res.stdout.toString());
//  // }catch (e){
//  //   console.log(e);
//  // }
//    // console.log(`${res.text}`)
//    console.log(await fs.ls('/'));
//    var mod:loader.ASInstance & {runCat: ()=>void};
//    function cat(ptr: number){
//      console.log(mod.memory.getString(ptr));
//    }
//    mod = loader.instantiateBuffer(await fs.read(`/a.wasm`), {index: {cat: cat}, env: {}});
//    mod.runCat();
//     // function ping(x) {
//     //   f.mkdir(`${root}/${x}`);
//     //   setTimeout(() => {debugger; ping(x+1);}, 1000);
//     // }
//     console.log(await fs.Root());
//
//    // fs.mkdir(root);
//    // ping(0);
//    // console.log(await f.stat(`/{Root}/hello_world`));
//  });
//  }catch(err){
//    console.log(err);
//    console.log("Closing....");
//    process.exit(0)
//  } finally {
//    // await fs.orbitdb.disconnect();
//    // _fs.rmdirSync(`${__dirname}/../.orbitdb/DEFAULT`);
//  }
//
// }
main();
// console.log(_fs.readdirSync(`${__dirname}`, {withFileTypes:true}));
