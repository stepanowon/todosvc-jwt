"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createToken = exports.computeHMAC = exports.checkToken = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _crypto = require("crypto");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var secretKey = "mysecretkey";
if (process.env.JWT_SECRET_KEY) {
  secretKey = process.env.JWT_SECRET_KEY;
}
var createToken = exports.createToken = function createToken(_ref) {
  var userid = _ref.userid,
    role = _ref.role;
  console.log(userid + ", " + role);
  var token = _jsonwebtoken["default"].sign({
    userid: userid,
    role: role
  }, secretKey, {
    algorithm: "HS256",
    expiresIn: "14d"
  });
  return token;
};
var checkToken = exports.checkToken = function checkToken(_ref2) {
  var token = _ref2.token,
    callback = _ref2.callback;
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