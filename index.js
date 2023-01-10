var Express = require("express");
var app = Express();
var BodyParser = require("body-parser");
var Cors = require("cors");
var Configuration = require("./config/config.json");
var Mongoose = require("mongoose");
var Router = require("./config/router");
var FileSystem = require("fs");
var Https = require("https");
var Settings = new (require('./controllers/setting'))();

class Server {
  constructor() { }

  async Start() {

    var args = process.argv; 
    console.log("Enabling body parser..");
    app.use(BodyParser.urlencoded({ extended: false }));
    app.use(BodyParser.json());

    console.log("Enabling cors..");
    app.use(Cors());

    console.log("Connect to database...");
    Mongoose.set("strictQuery", true);
    Mongoose.connect(Configuration.DbConnection);

    if (await Settings.IsSettingsSet() === false) {
      Settings.Save(Configuration);
    }

    if(args.indexOf("--reconfigure") != -1){
      console.log("Rebuilding configuration..");
      Settings.Save(Configuration);
    }

    console.log("Loading Certificate..");
    var privateKey = FileSystem.readFileSync(Configuration.SSL.Key);
    var certificate = FileSystem.readFileSync(Configuration.SSL.Cert);

    console.log("loading API's");
    app.use("/", Router);

    // Verifying  wither Https is enabled or not.
    if (Configuration.SSL.IsEnabled) {
      Https.createServer(
        {
          key: privateKey,
          cert: certificate,
        },
        app
      ).listen(Configuration.Port);
      var message = Configuration.EnableHandshake === true ?
        Configuration.AppName +
        ", Listen on the port ..." +
        Configuration.Port +
        ", using https, https://localhost:" +
        Configuration.Port +
        "/handshake" :
        Configuration.AppName +
        ", Listen on the port ..." +
        Configuration.Port +
        ", using https, https://localhost:" +
        Configuration.Port;

      console.log(message);
    } else {
      app.listen(Configuration.Port, () => {
        var message = Configuration.EnableHandshake === true ?
          Configuration.AppName +
          ", Listen on the port ..." +
          Configuration.Port +
          ", using https, http://localhost:" +
          Configuration.Port +
          "/handshake" :
          Configuration.AppName +
          ", Listen on the port ..." +
          Configuration.Port +
          ", using https, http://localhost:" +
          Configuration.Port;

        console.log(message);
      });
    }
  }
}

new Server().Start();
