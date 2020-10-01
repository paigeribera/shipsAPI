const express = require("express");
const app = express();

const Datastore = require("@google-cloud/datastore");
const bodyParser = require("body-parser");

const projectId = "paigeribera-12345";
const datastore = new Datastore({ projectId: projectId });

const SHIP = "Ship";
const SLIP = "Slip";

const router = express.Router();

app.use(bodyParser.json());

function fromDatastore(item) {
  item.id = item[Datastore.KEY].id;
  return item;
}
/* ------------- Begin Ship Model Functions ------------- */
function post_ship(name, type, length, at_sea) {
  var key = datastore.key(SHIP);
  // all need boats are at sea starting off
  const new_ship = { name: name, type: type, length: length, at_sea: 0 };
  return datastore.save({ key: key, data: new_ship }).then(() => {
    return key;
  });
}

function get_ships() {
  const q = datastore.createQuery(SHIP);
  return datastore.runQuery(q).then(entities => {
    return entities[0].map(fromDatastore);
  });
}

function put_ship(id, name, type, length, at_sea) {
  const key = datastore.key([SHIP, parseInt(id, 10)]);
  const ship = { name: name, type: type, length: length, at_sea: at_sea };
  return datastore.save({ key: key, data: ship });
}

function delete_ship(id) {
  const key = datastore.key([SHIP, parseInt(id, 10)]);
  return datastore.delete(key);
}

/* ------------- End Model Functions ------------- */


/* ------------- Begin Controller Functions For Ships ------------- */

router.get("/ships", function(req, res) {
  const ships = get_ships().then(ships => {
    console.error(ships);
    res.status(200).json(ships);
  });
});

router.post("/ships", function(req, res) {
  console.error(req.body);
  post_ship(req.body.name, req.body.type, req.body.length).then(key => {
    res.status(200).send('{ "id": ' + key.id + " }");
  });
});

router.put("ships/:id", function(req, res) {
  put_ship(req.params.id, req.body.name, req.body.type, req.body.length).then(
    res.status(200)
  );
});

router.delete("ships/:id", function(req, res) {
  delete_ship(req.params.id).then(res.status(200).end());
});

/* ------------- End Controller Functions ------------- */

/* ------------- Begin Controller Slip Functions ------------- */

router.get("/slips", function(req, res) {
  const slips = get_slips().then(slips => {
    console.error(slips);
    res.status(200).json(slips);
  });
});

router.post("/slips", function(req, res) {
  console.error(req.body);
  post_slip(req.body.number, req.body.current_boat, req.body.arrival_date).then(
    key => {
      res.status(200).send('{ "id": ' + key.id + " }");
    }
  );
});

router.put("slips/:id", function(req, res) {
  console.error(req.params.id, req.body);
  put_slip(
    req.params.id,
    req.body.number,
    req.body.current_boat,
    req.body.arrival_date
  )
    .then(res.status(200))
    .catch(err => console.error("error on put", err));
});

router.delete("slips/:id", function(req, res) {
  delete_slip(req.params.id).then(res.status(200).end());
});

/* ------------- End Controller Functions ------------- */

app.use("/", router);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.error(`Server listening on port ${PORT}...`);
});
