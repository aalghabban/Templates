var Configuration = require("../config/config.json");

class HandshakeApi {
  constructor() { }

  async Get(req) {
    return {
      Module: Configuration.AppName,
      Port: Configuration.Port,
      Https: Configuration.SSL.IsEnabled,
    };
  }
}

module.exports = HandshakeApi;
