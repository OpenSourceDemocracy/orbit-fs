# Orbit-fs
Built on top of OrbitDB, Orbit-fs provides a mutable filesystem interface.  IPFS provides a content addressable directory structure, which is to say that the hash of the content of the directory is the key in the distributed filesystem.  ipfs-mfs is a package which allows you to mutate a filesystem and track the new hash that is generated.  OrbitDB is an append only log, where users sync up on the updates to a log with a permanent reference.  

OrbitFS combines these two so that each update to a an ipfs-mfs is broadcast with OrbitDB.  An update consistents of the hash to the new root of the filesytem and the hash to the previous.  This means that users only need to get the most recent update in order to get caught up.  Furthermore each update is cryptographically signed.


# Adding Solid

Solid is a project that aims to provide protocols for accessing and controlling a user's data on a solid server called a datapod.  Underneath it uses the an abstraction called Resource Description Framework (RDF), which is a simple way to represent relationships between entities.  It is often referred to as linked-data, because each entity and the relationship between them are links. 
