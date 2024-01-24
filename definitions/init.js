const Filename = PATH.databases('schema.flow');
var ID = '';

Flow.on('save', function(schema) {
	schema.dtupdated = new Date();
	var data = JSON.stringify(schema, null, '\t');
	F.Fs.writeFile(Filename, data, ERROR('Flow.save'));
	CONF.backup && F.Fs.appendFile(Filename + '.bk', data + '\n', NOOP);
});

ON('ready', function() {
	setTimeout(function() {

		let divider = '====================================================';

		console.log(divider);
		console.log('https://flow.totaljs.com/?socket=' + encodeURIComponent('http://127.0.0.1:{$port}/flow/?token={token}'.args(CONF)));
		console.log(divider);
		console.log();

		F.Fs.readFile(Filename, 'utf8', function(err, response) {
			var data = response.parseJSON(true);
			if (!data.id)
				data.id = GUID(5);
			ID = data.id;
			Flow.load(data, ERROR('Flow.load'));
		});

	}, 1000);
});

// Load websocket
// max. 8 MB
ROUTE('SOCKET  /flow/ <8MB', function($) {

	$.autodestroy();

	Flow.socket(ID, $, function(client, next) {
		if (BLOCKED(client, 10) || CONF.token !== client.query.token) {
			client.destroy();
		} else {
			BLOCKED(client, -1);
			next();
		}
	});

});