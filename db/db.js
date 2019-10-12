const sqlite3 = require('sqlite3').verbose();
const q = require("q");
let db = new sqlite3.Database('./items.sqlite3.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the items database.');

  db.run('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT);');

});


exports.Add = async function (item) {
  db.run(`INSERT INTO items(item) VALUES(?)`, [JSON.stringify(item)], function (err) {
    if (err) {
      return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  });
}

exports.Update = async function (id, item) {
  db.run("UPDATE items set item=? WHERE id = ?", [JSON.stringify(item), id], function (err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) updated: ${this.changes}`);
  })
}

exports.Delete = function (id) {
  let item = Get(id);
  item.deleted = true;
  Update(id, item);
}
exports.Get = async function (id) {
  let item = {};
  db.get("SELECT id,item from items WHERE id = ?", [id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    item = JSON.parse(row.item);
    item.id = row.id;
  });
 
  return item;
}

exports.GetAll = function () {
  var deffered = q.defer();
  var items = [];

  db.each("SELECT id,item from items", function (err, row) {
    if (err) {
      throw err;
    }
    let item = JSON.parse(row.item);
    item.id = row.id;
    items.push(item);
  });

  console.log("s ",items)
  deffered.resolve(items)
  return deffered;
}