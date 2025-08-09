"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createToken = exports.createRefreshToken = exports.computeHMAC = exports.checkToken = exports.checkRefreshToken = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _crypto = require("crypto");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var secretKey = "mysecretkey";
if (process.env.JWT_SECRET_KEY) {
  secretKey = process.env.JWT_SECRET_KEY;
}
var createToken = exports.createToken = function createToken(_ref) {
  var userid = _ref.userid,
    role = _ref.role;
  var token = _jsonwebtoken["default"].sign({
    userid: userid,
    role: role,
    iss: "jwt test server"
  }, secretKey, {
    algorithm: "HS256",
    expiresIn: "1h"
  });
  return token;
};
var createRefreshToken = exports.createRefreshToken = function createRefreshToken(_ref2) {
  var userid = _ref2.userid,
    role = _ref2.role,
    type = _ref2.type;
  var token = _jsonwebtoken["default"].sign({
    userid: userid,
    role: role,
    type: type,
    iss: "jwt test server"
  }, secretKey, {
    algorithm: "HS256",
    expiresIn: "7d"
  });
  return token;
};
var checkToken = exports.checkToken = function checkToken(_ref3) {
  var token = _ref3.token,
    callback = _ref3.callback;
  _jsonwebtoken["default"].verify(token, secretKey, {
    algorithms: ['HS256']
  }, function (err, decode) {
    if (err) {
      callback({
        status: "fail",
        message: err
      });
    } else {
      var exp = new Date(decode.exp * 1000);
      var now = Date.now();
      if (exp < now) {
        callback({
          status: "fail",
          message: "expired token"
        });
      } else if (decode.type === "refresh_token") {
        callback({
          status: "fail",
          message: "use your valid access_token"
        });
      } else {
        callback({
          status: "success",
          users: decode
        });
      }
    }
  });
};
var checkRefreshToken = exports.checkRefreshToken = function checkRefreshToken(_ref4) {
  var refresh_token = _ref4.refresh_token,
    callback = _ref4.callback;
  _jsonwebtoken["default"].verify(refresh_token, secretKey, {
    algorithms: ['HS256']
  }, function (err, decode) {
    if (err) {
      callback({
        status: "fail",
        message: err
      });
    } else {
      var exp = new Date(decode.exp * 1000);
      var now = Date.now();
      if (exp < now) {
        callback({
          status: "fail",
          message: "expired token"
        });
      } else {
        callback({
          status: "success",
          users: decode
        });
      }
    }
  });
};
var computeHMAC = exports.computeHMAC = function computeHMAC(userid, password) {
  return (0, _crypto.createHash)('sha256').update(userid + ":" + password).digest('hex');
};
//# sourceMappingURL=authutil.js.map