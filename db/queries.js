// we require the connection here, not knex!

const knex = require('./knex');
const knexPostgis = require('knex-postgis');
const st = knexPostgis(knex);

const db = knex({
  dialect: 'postgres'
});

// dont think this is used anywhere anymore
const allPois = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Transform(lg.geom,4326))::json As geometry , row_to_json((SELECT l FROM (SELECT id, merknad, regdate, asset_type, kritisk_merknad, img_name) As l)) As properties FROM sandfang.assets As lg   ) As f )  As fc;"

const getLast = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Transform(lg.geom,4326))::json As geometry , row_to_json((SELECT l FROM (SELECT id, merknad, regdate, asset_type, kritisk_merknad, img_name) As l)) As properties FROM sandfang.assets As lg order by id desc limit 1 ) As f )  As fc;"

const allbbox = `SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features 
FROM (SELECT 'Feature' As type,
   ST_AsGeoJSON(ST_Transform(lg.geom,4326),8)::json As geometry, 
   row_to_json(
       (SELECT l FROM (SELECT id, asset_type) As l)) As properties 
      FROM sandfang.assets As lg where geom && ST_Transform(ST_MakeEnvelope(?, ? ,?, ?, 4326),25832)
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
    const sql = knex('sandfang.assets').where('id', id).first();
    return sql

    //return knex('sandfang.assets').where('id', id).first();
  },
  // get latest
  getLatest() {
    const sql = knex.select('id', st.transform('geom', 4326).as('geom').from('sandfang.assets').toString())
    return sql
    //return knex('sandfang.assets').orderBy('id', 'desc').limit(1);
  },
  getLatestRaw() {
    // retrun all rows in pois table
    return knex.raw(getLast);
  },
  create(poi) {
    poi.geom = st.transform(st.geomFromText(poi.geom, 4326),25832);
    const sql = db.insert(poi).returning('*').into('sandfang.assets');
    console.log(sql.toString());
    return sql;
  },
  // Uppdate poi
  update(id, poi) {
    return knex('sandfang.assets').where('id', id).update(poi, '*');
  },
  // update registered skade
  updateSkade(skader_id, reparert) {
    const sql = knex('sandfang.skader').where('skader_id', skader_id).update(reparert, '*');
    console.log(sql.toString());
    return sql;
  },
  delete(id) {
    return knex('sandfang.assets').where('id', id).del();
  },
  // create new tomming
  createTomming(tomming) {
    const sql = db.insert(tomming).returning('*').into('sandfang.tomming');
    console.log(sql.toString());
    return sql;
  },
  // get tomming for id
  getTomming(id) {
    const sql = knex.from('sandfang.tomming')
    .where('assets_id', id);
    console.log(sql.toString());
    return sql;
  },
  createSkade(damages) {
    sql = knex('sandfang.skader').returning('*').insert(damages)
    //console.log(sql.toString());
    return sql;
  },
  getSkade(id) {
    const sql = knex.from('sandfang.skader')
    // .innerJoin('fyllingsgrad', 'regdato', 'poi.id', 'tomming.poi_id')
    //.innerJoin('*')
    .where('assets_id', id)
    .whereNull('reparert')
    .orWhere({'reparert': 'f'})
    //console.log(sql.toString());
    return sql;
  },
  updateImgName(id, img_name) {
    const sql = knex('sandfang.assets').where('id',id).update('img_name', img_name.img_name).returning('*');
    //console.log(sql.toString());
    return sql;
  },
  findId(id) {
    typeof(id);
    console.log(typeof(parseInt(id)));
    //const sql = knex.raw("select * from poi WHERE cast(id as TEXT) like '%5%' limit(5)")
    // SELECT ST_AsGeoJSON(geom, 3) FROM public.poi where id = 55
    const sql = knex.raw("SELECT id, ST_AsGeoJSON(ST_Transform(geom,4326), 8) FROM sandfang.assets where cast(id as TEXT) like '%'||?||'%' order by id asc limit(1)", [parseInt(id)]);
    //knex('users').whereRaw('id = ?', [1])
    //console.log(sql.toString());
    return sql;
  },
  getOneByEmail(email) {
    return knex('sandfang.user').where('email', email).first();
  },
  getUserById(id) {
    return knex('sandfang.user').where('id', id).first();
  },
  createUser(user) {
    return knex('sandfang.user').insert(user, ['id', 'email', 'password', 'admin']).then(ids => {
      console.log(ids[0]);
      return ids[0];
    })
  },
  getAllUserrs(){
    return knex.select('*').from('sandfang.user')
  },
  deleteUser(id){
    console.log(id);
    return knex('sandfang.user').where('id', id).del();
  },
  // Get from tomming where date is between...
  tommingBetween(from, to){
    return knex.raw("select * from sandfang.tomming where regdato >= ? and regdato < ?", [from, to])
  },
  getManyAssets(ids){
    n = ids.toString();

    const manyPois = `SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Transform(lg.geom,4326))::json As geometry , row_to_json((SELECT l FROM (SELECT id, merknad, regdate, asset_type, kritisk_merknad, img_name) As l)) As properties FROM sandfang.assets As lg where id in (${n})  ) As f )  As fc`
    //console.log(n)

    const sql =  knex.raw(manyPois);
    //console.log(sql.toString());
    return sql;
  },
  createAssociation(kobling_punkt) {
    const sql = db.insert(kobling_punkt).returning('*').into('sandfang.kobling_punkt');
    console.log(sql.toString());
    return sql;
  },
  getConnectionsById(id) {
    const sql = knex('sandfang.kobling_punkt').where('assets_id', id);
    console.log(sql.toString());
    return sql;
  },
  getLatLngOfAsset(listOfIds) {
    n = listOfIds.toString();
    //const sql = knex.raw("Select id, ST_AsText(geom) from poi where id= ?", [id] )
    const sql = knex.raw(`Select id, ST_AsText(ST_Transform(geom,4326)) from sandfang.assets where id in (${n})`)
    console.log(sql.toString())
    return sql
  },
  kobling_punkt(uuid) {
    return knex('sandfang.kobling_punkt').where('id', uuid).del();
  },
  
  
}