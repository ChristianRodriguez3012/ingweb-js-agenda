const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const methodOverride = require('method-override'); 
const app = express();
const PORT = process.env.PORT || 4242;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method')); 

let db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

//db.run(`DROP TABLE IF EXISTS eventos`, (err) => {
    //if (err) {
      //console.error(err.message);
    //}
    //console.log('Eventos table dropped.');
  //});
  
  db.run(`CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      descripcion TEXT,
      fecha TEXT
  )`, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Eventos table created.');
  });

// Ruta para obtener todos los eventos
app.get('/events', (req, res) => {
    db.all(`SELECT * FROM eventos`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.render('events', { eventos: rows });
    });
});

// Ruta para mostrar el formulario de creación de eventos
app.get('/events/new', (req, res) => {
    res.render('new'); // Renderiza la vista 'new.ejs'
});

// Ruta para agregar un nuevo evento
app.post('/events', (req, res) => {
    const { titulo, descripcion, fecha } = req.body;
    db.run(`INSERT INTO eventos (titulo, descripcion, fecha) VALUES (?, ?, ?)`, [titulo, descripcion, fecha], function(err) {
        if (err) {
            return console.log(err.message);
        }
        res.redirect('/events'); // Redirige a la lista de eventos
    });
});

// Ruta para mostrar el formulario de edición de eventos
app.get('/events/edit/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT * FROM eventos WHERE id = ?`, [id], (err, row) => {
        if (err) {
            throw err;
        }
        res.render('edit', { evento: row });
    });
});

// Ruta para actualizar un evento existente
app.post('/events/edit/:id', (req, res) => {
    const id = req.params.id;
    const { titulo, descripcion, fecha } = req.body;
    db.run(`UPDATE eventos SET titulo = ?, descripcion = ?, fecha = ? WHERE id = ?`, [titulo, descripcion, fecha, id], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/events'); // Redirige a la lista de eventos
    });
});

// Ruta para eliminar un evento
app.post('/events/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM eventos WHERE id = ?`, [id], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/events'); // Redirige a la lista de eventos
    });
});

// Ruta raíz que redirige a '/events'
app.get('/', (req, res) => {
    res.redirect('/events');
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});