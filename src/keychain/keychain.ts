

export default interface KeyChain {
  importKey(key: Buffer);
  exportKey(passphrase: string): Buffer;
  generateKey();
}
