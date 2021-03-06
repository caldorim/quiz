var path = require('path');

//Postgres DATABASE_URL = postgres://user:passwd@host:port/database
//SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user     = (url[2]||null);
var pwd      = (url[3]||null);
var protocol = (url[1]||null);
var dialect  = (url[1]||null);
var port     = (url[5]||null);
var host     = (url[4]||null);
var storage  = process.env.DATABASE_STORAGE;

//Cargar Modelo ORM. Construiremos el modelo con sequelize
var Sequelize = require('sequelize');

//Usar BBDD SQLite. Sequelize es la clase de la BD
var sequelize = new Sequelize(DB_name, user, pwd, 
	                         {dialect:  protocol,
	                          protocol: protocol,
	                          port:     port,
	                          host:     host,
	                          storage:  storage,    //solo SQLite (.env)
	                          omitNull: true        //solo Postgres
	                         });

//Importar la definición de las tablas Quiz en quiz.js y Comment en comments.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));
var Comment = sequelize.import(path.join(__dirname, 'comment'));

//Declaración de relación 1-N entre Quiz y Comment (métodos de sequelize) con borrado en cascada
Comment.belongsTo(Quiz);
//Quiz.hasMany(Comment);
Quiz.hasMany(Comment, {
'constraints': true,
'onUpdate': 'cascade',
'onDelete': 'cascade',
'hooks': true
}); 

//exportar definición de las tablas Quiz y Comment para que se pueda usar en otros lugares de la aplicación
exports.Quiz = Quiz;
exports.Comment = Comment; 

//sequelize.sync() crea e inicializa tabla de preguntas en DB
//then(..) ejecuta el manejador una vez creada la tabla
sequelize.sync().then(function() {
  Quiz.count().then(function (count) {
    if (count === 0) {  //la tabla se inicializa solo si está vacía
    	Quiz.create({ pregunta: 'Capital de Italia',
                      respuesta: 'Roma',
                      tema: 'humanidades' });
    	Quiz.create({ pregunta: 'Capital de Portugal',
                      respuesta: 'Lisboa',
                      tema: 'humanidades' })
    	.then(function(){console.log('Base de datos inicializada')});
    };
  });
});