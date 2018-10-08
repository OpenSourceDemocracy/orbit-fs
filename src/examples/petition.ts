import * as rdf from "rdflib";


class Petition {
  graph:any
  container: any
  body:any
  title:any

  constructor(container, title, body){
    this.graph = rdf.graph();
    this.container = container;
    this.title = rdf.lit(title);
    this.body = rdf.lit(body);
  }
  static async create(container, title, body){
    let petition = new Petition(container, title, body);
  }
}
