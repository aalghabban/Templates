const { response } = require("express");
var Express = require("express");
var Router = Express.Router();
var Responses = new (require("./response"))();
var HandshakeApis = new (require("../apis/handshakeApis"))();
var Configuration = require("./config.json");

// Enable handshake function.
if (Configuration.EnableHandshake) {
  Router.get("/handshake", async function (req, res) {
    return await Responses.Wrapper(
      req,
      res,
      HandshakeApis.Get,
      1200,
      "Administrator"
    );
  });
}

// Handling the 404 errors.
Router.use(async function (req, res) {
  return await Responses.Wrapper(req, res, null, 1400);
});

module.exports = Router;
