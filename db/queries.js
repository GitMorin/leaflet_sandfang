// we require the connection here, not knex!

const knex = require('./knex');
const knexPostgis = require('knex-postgis');
const st = knexPostgis(knex);

const db = knex({
  dialect: 'postgres'
});

const allPois = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Transform(lg.geom,4326))::json As geometry , row_to_json((SELECT l FROM (SELECT id, merkned, regdate, asset_type, kritisk_merkned, img_name) As l)) As properties FROM poi As lg   ) As f )  As fc;"

const getLast = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Transform(lg.geom,4326))::json As geometry , row_to_json((SELECT l FROM (SELECT id, merkned, regdate, asset_type, kritisk_merkned, img_name) As l)) As properties FROM poi As lg order by id desc limit 1 ) As f )  As fc;"

const allbbox = `SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features 
FROM (SELECT 'Feature' As type,
   ST_AsGeoJSON(ST_Transform(lg.geom,4326),4)::json As geometry, 
   row_to_json(
       (SELECT l FROM (SELECT id, asset_type) As l)) As properties 
      FROM poi As lg where geom && ST_MakeEnvelope(?, ? ,?, ?, 4326)
        AND asset_type = ?) As f )  As fc;`

module.exports = {
  getAll() {
    // retrun all rows in pois table
    return knex.raw(allPois);
  },
  getBbox(southwest_lng,southwest_lat,northeast_lng,northeast_lat, asset_type) {
    const sql =  knex.raw(allbbox, [southwest_lng,southwest_lat,northeast_lng,northeast_lat, asset_type]);
    //console.log(sql.toString());
    return sql;
  },
  getOne(id) {
    return knex('poi').where('id', id).first();
  },
  // get latest
  getLatest() {
    return knex('poi').orderBy('id', 'desc').limit(1);
  },
  getLatestRaw() {
    // retrun all rows in pois table
    return knex.raw(getLast);
  },
  create(poi) {
    poi.geom = st.geomFromText(poi.geom, 4326);
    const sql = db.insert(poi).returning('*').into('poi');
    console.log(sql.toString());
    return sql;
  },
  // Uppdate poi
  update(id, poi) {
    return knex('poi').where('id', id).update(poi, '*');
  },
  // update registered skade
  updateSkade(skader_id, reparert) {
    const sql = knex('skader').where('skader_id', skader_id).update(reparert, '*');
    console.log(sql.toString());
    return sql;
  },
  delete(id) {
    return knex('poi').where('id', id).del();
  },
  // create new tomming
  createTomming(tomming) {
    const sql = db.insert(tomming).returning('*').into('tomming');
    console.log(sql.toString());
    return sql;
        // create tomming with fk value of id
  },
  // get tomming for id
  getTomming(id) {
    const sql = knex.from('tomming')
    // .innerJoin('fyllingsgrad', 'regdato', 'poi.id', 'tomming.poi_id')
    //.innerJoin('*')
    .where('poi_id', id);
    console.log(sql.toString());
    return sql;
  },
  createSkade(damages) {
    //data = [{poi_id:357, skade_type:"skadet_lokk"},{poi_id:357, skade_type:"skadet_kumrug"}];
    console.log('from queries')
    sql = knex('skader').returning('*').insert(damages)
    // add on return all
    console.log(sql.toString());
    return sql;
  },
  getSkade(id) {
    const sql = knex.from('skader')
    // .innerJoin('fyllingsgrad', 'regdato', 'poi.id', 'tomming.poi_id')
    //.innerJoin('*')
    .where('poi_id', id)
    .whereNull('reparert')
    .orWhere({'reparert': 'f'})
    console.log(sql.toString());
    return sql;
  },
  updateImgName(id, img_name) {
    const sql = knex('poi').where('id',id).update('img_name', img_name.img_name).returning('*');
    //console.log(sql.toString());
    return sql;
  },
 //SELECT * FROM poi WHERE cast(id as TEXT) like '%15%' limit 5
 //.where('column', 'ilike', 'XXXX%')
  // findId(id) {
  //   typeof(id);
  //   console.log(typeof(parseInt(id)));
  //   //const sql = knex.raw("select * from poi WHERE cast(id as TEXT) like '%5%' limit(5)")
  //   const sql = knex.raw("select id from poi WHERE cast(id as TEXT) like '%'||?||'%' order by id asc limit(1)", [parseInt(id)]);
  //   //knex('users').whereRaw('id = ?', [1])
  //   console.log(sql.toString());
  //   return sql;
  // }


  // findId(id) {
  //   typeof(id);
  //   console.log(typeof(parseInt(id)));
  //   //const sql = knex.raw("select * from poi WHERE cast(id as TEXT) like '%5%' limit(5)")
  //   // SELECT ST_AsGeoJSON(geom, 3) FROM public.poi where id = 55
  //   const sql = knex.raw(getLast);
  //   //knex('users').whereRaw('id = ?', [1])
  //   console.log(sql.toString());
  //   return sql;
  // }


  findId(id) {
    typeof(id);
    console.log(typeof(parseInt(id)));
    //const sql = knex.raw("select * from poi WHERE cast(id as TEXT) like '%5%' limit(5)")
    // SELECT ST_AsGeoJSON(geom, 3) FROM public.poi where id = 55
    const sql = knex.raw("SELECT id, ST_AsGeoJSON(geom, 5) FROM public.poi where cast(id as TEXT) like '%'||?||'%' order by id asc limit(1)", [parseInt(id)]);
    //knex('users').whereRaw('id = ?', [1])
    //console.log(sql.toString());
    return sql;
  },
  getOneByEmail(email) {
    return knex('user').where('email', email).first();
  },
  getUserById(id) {
    return knex('user').where('id', id).first();
  },
  createUser(user) {
    return knex('user').insert(user, ['id', 'email', 'password', 'admin']).then(ids => {
      console.log(ids[0]);
      return ids[0];
    })
  },
  getAllUserrs(){
    return knex.select('*').from('user')
  },
  deleteUser(id){
    console.log(id);
    return knex('user').where('id', id).del();
  },
  // Get from tomming where date is between...
  tommingBetween(from, to){
    return knex.raw("select * from tomming where regdato >= ? and regdato < ?", [from, to])
  },
  getManyAssets(ids){
    n = ids.toString();

    const manyPois = `SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Transform(lg.geom,4326))::json As geometry , row_to_json((SELECT l FROM (SELECT id, merkned, regdate, asset_type, kritisk_merkned, img_name) As l)) As properties FROM poi As lg where id in (${n})  ) As f )  As fc`
    //console.log(n)

    const sql =  knex.raw(manyPois);
    //console.log(sql.toString());
    return sql;
  },
  createAssociation(kobling_punkt) {
    const sql = db.insert(kobling_punkt).returning('*').into('kobling_punkt');
    console.log(sql.toString());
    return sql;
  },
  
  
}