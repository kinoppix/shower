# Shower

Shower is a instant messaging server inspired by Pega.IO.
Shower sends your texts/images/activities/behaviours immediately to others.

Technologies has changed our browsing life drastically.
JavaScript released us from reloading browser many times, mobile phone allowed us to browse everywhere.

Now there is a big needs that everyone wants to communicate with others instantly.
Shower adds realtime communicating function on current websites.
As Shower is designed as a standalone server, you can use any languages.


## Install
	apt-get install redis
	wget https://github.com/kinoppix/shower/zipball/master
	unzip
	cd shower
	npm install


### Configurations
- edit "settings.js"
- Shower uses port 80 by default. For some reasons, you can change another port. But we recommend port 80 because most firewalls don't block it.
- Configure listen address for inner API. The inner API doesn't have any protections.


### Start Shower

	NODE_ENV=production node app.js &


## Server Usage

### Ruby
	# create namespace(first time only)
	res = Net::HTTP.get(URI('http://shower-server-in/namespace.add?namespace=live1'))
	# post message
	query_string = "channel=broadcast&message=" + URI.encode("this is test")
	uri = URI('http://shower-server-in/live1'
	res = Net::HTTP.new(uri.host, uri.port).post(uri.path, query_string)


## Client Usage
```html
	<script>
		var socket = io.connect('http://shower-server/live1');
  	
		socket.on('connect', function () {
			socket.on('broadcast', function (obj) {
				console.log(obj.message);
			});
			socket.on('premium_member', function (obj) {
				console.log(obj.message);
			});
		});
	</script>
```


## Development

### Run test
	make test

## Known issues

- No installer
- Change Makefile to Cakefile
- Logging
- Need to catch up the specifications of Node.js and express. They can be changed frequently.
