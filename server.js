var application_root = __dirname,
	express = require("express"),
	path = require("path"),
	mongoose = require("mongoose"),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;;

var app = express();

app.configure(function() {
	app.use(express.bodyParser());

	app.use(express.methodOverride());

	app.use(app.router);

	app.use(express.static(path.join(application_root, 'site')));

	app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

var port = 4711;

app.listen(port, function() {
	console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});

// Routes
app.get("/api", function(request, response) {
	response.send("Library API is running");
});

// Connect to database
mongoose.connect("mongodb://localhost/library_database");

//Schemas
var bookSchema = new Schema({
	title: String,
	author: String,
	releaseDate: Date,
	keywords: [{ type: ObjectId, ref: 'Keyword' }] // NEW
});

var keywordSchema = new Schema({
	keyword: String,
	book: { type: ObjectId, ref: 'Book' }
});

// Models
var Keyword = mongoose.model('Keyword', keywordSchema);
var Book = mongoose.model('Book', bookSchema);

app.all('/', function(req, res, next) {
 	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "X-Requested-With");
  	next();
});

app.get('/api/books', function(request, response) {
	return Book.find(function(err, books) {
		if (!err) {
			return response.send(books);
		} else {
			return console.log(err);
		}
	});
});

// Insert a new book
app.post('/api/books', function(request, response) {
	var book = new Book({
		title: request.body.title,
		author: request.body.author,
		releaseDate: request.body.releaseDate,
		keywords: [request.body.keywords]
	});
	book.save(function(err) {
		if (!err) {
			return console.log('book created');
		} else {
			return console.log(err);
		}
	});
	return response.send(book);
});

//Get a single book by id
app.get('/api/books/:id', function( request, response ) {
	return Book.findById( request.params.id, function( err, book ) {
		if( !err ) {
			return response.send( book );
		} else {
			return console.log( err );
		}
	});
});

//Update a book
app.put('/api/books/:id', function( request, response ) {
	console.log('Updating book ' + request.body.title );
	return Book.findById( request.params.id, function( err, book ) {
		book.title = request.body.title;
		book.author = request.body.author;
		book.releaseDate = request.body.releaseDate;
		book.keywords.push(request.body.keywords);
		return book.save( function( err ) {
			if( !err ) {
				console.log('book updated');
			} else {
				console.log( err );
			}
			return response.send( book );
		});
	});
});

// Delete a book
app.delete('/api/books/:id', function(request, response) {
	console.log('Deleting book with id: ' + request.params.id);
	return Book.findById(request.params.id, function(err, book) {
		return book.remove(function(err) {
			if (!err) {
				console.log('Book removed');
				return response.send('');
			} else {
				console.log(err);
			}
		});
	});
});

/* ------------------------------------------------------------------------------------------------ */

app.get('/api/keywords', function(request, response) {
	return Keyword.find(function(err, keywords) {
		if (!err) {
			return response.send(keywords);
		} else {
			return console.log(err);
		}
	});
});

// Insert a new keyword
app.post('/api/keywords', function(request, response) {
	var keyword = new Keyword({
		keyword: request.body.keyword,
		book: request.body.book
	});
	keyword.save(function(err) {
		if (!err) {
			return console.log('keyword created');
		} else {
			return console.log(err);
		}
		Book.findById( request.body.book, function( err, book ) {
			book.keywords.push(request.body.keywords);
			book.save( function( err ) {
				if( !err ) {
					console.log('book updated');
				} else {
					console.log( err );
				}
				// return response.send( book );
			});
		});
	});
	return response.send(keyword);
});

//Get a single keyword by id
app.get('/api/keywords/:id', function( request, response ) {
	return Keyword.findById( request.params.id, function( err, keyword ) {
		if( !err ) {
			return response.send( keyword );
		} else {
			return console.log( err );
		}
	});
});

//Update a keyword
app.put('/api/keywords/:id', function( request, response ) {
	console.log('Updating keyword ' + request.body.title );
	return Keyword.findById( request.params.id, function( err, keyword ) {
		keyword.keyword = request.body.keyword;
		keyword.book = request.body.book;
		return keyword.save( function( err ) {
			if( !err ) {
				console.log('keyword updated');
			} else {
				console.log( err );
			}
			return response.send( keyword );
		});
	});
});

// Delete a keyword
app.delete('/api/keywords/:id', function(request, response) {
	console.log('Deleting keyword with id: ' + request.params.id);
	return Keyword.findById(request.params.id, function(err, keyword) {
		return keyword.remove(function(err) {
			if (!err) {
				console.log('Keyword removed');
				return response.send('');
			} else {
				console.log(err);
			}
		});
	});
});