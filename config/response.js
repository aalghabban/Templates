var Messages = require("./messages.json");

class Responses {
  constructor() { }

  async Wrapper(req, res, func = null, code = 1200, role = "public") {
    var message = null;
    try {
      message = await this.CustomResponse(null, message, 1200);
      if (func !== null) {
        message.Data = await func(req);
      }
    } catch (err) {
      message = null;

      // in case the error is related to unique values.
      message = await this.UniqueIssues(err, message, Messages);

      // in case the error is related to messages validation.
      message = await this.ValidationIssues(err, message, Messages);

      // by default all errors will throw technical issues.
      message = await this.CustomResponse(err, message, null);

      if (typeof message === "undefined" || message === null) {
        message = await this.GeneralError(err, message);
      }
    }

    return res.status(message.HttpCodeStatus).send(message);
  }

  async GeneralError(err, message) {
    if (typeof message === "undefined" || message === null) {
      message = Messages.find((x) => x.Code === 1500);
    }

    return message;
  }

  async CustomResponse(err, message, code) {
    if (message === null) {
      if (err !== null && isNaN(err.message) === false) {
        message = Messages.find((x) => x.Code === Number(err.message));
      } else {
        message = Messages.find((x) => x.Code === code);
      }
    }

    return message;
  }

  async UniqueIssues(err, message, Messages) {
    if (message === null && err.message.includes("duplicate")) {
      var property = err.message.split(":")[2].split("_")[0].trim();
      message = Messages.find((x) => x.Property === property);
      return message;
    }

    return message;
  }

  async ValidationIssues(err, message, Messages) {

    if (message === null && err.message.includes("validation")) {
      var issues = err.message
        .replace("templates validation failed:", "")
        .trim()
        .split(",");
      var messagesIssues = [];

      for (var issue = 0; issue < issues.length; issue++) {

        messagesIssues.push({
          Property: issues[issue].split(":")[0],
          Issue: Messages.find(
            (x) => x.Code === Number(issues[issue].split(":")[1])
          ),
        });


      }

      message = messagesIssues[0].Issue;
      message.Property = messagesIssues[0].Property;
      message.Data = {
        MoreIssues: messagesIssues.slice(1),
      };

      return message;
    }

    return message;
  }
}

module.exports = Responses;
