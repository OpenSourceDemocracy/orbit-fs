import * as Orbit_db from "orbit-db";

export class Store {
  _db: Orbit_db.Store;
    constructor(orbitdb_instance: Orbit_db.Store){
      this._db = orbitdb_instance
    }
  get db(): Orbit_db.Store {
    return this._db;
    }

    get address(){
      return this.db.address.toString()
    }

    async load(){
      await this.db.load()
    }

    get events(){
      return this.db.events
    }
}

export class EventStore<T> extends Store {

  get db(): Orbit_db.Eventstore {
    return (this._db as Orbit_db.Eventstore);
  }

  add(item: T): void {
    this.db.add(item)
  }

  get(item: T): T{
    return this.db.get(item).payload.value
  }

  last(n: number): Array<T> {
    return this.db.iterator({ limit: n }).collect()
      .map((e) => e.payload.value);
  }

  peek(){
    return this.last(1)[0];
  }

  get all() {
    return this.last(-1);
  }

  destroy(){
    this.db.drop();
  }

}
