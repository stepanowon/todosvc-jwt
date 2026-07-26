"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createToken = exports.createRefreshToken = exports.computeHMAC = exports.checkToken = exports.checkRefreshToken = void 0;
var _jose = require("jose");
var _crypto = require("crypto");
var secretKey = "mysecretkey";
if (process.env.JWT_SECRET_KEY) {
  secretKey = process.env.JWT_SECRET_KEY;
}
var secret = new TextEncoder().encode(secretKey);
var createToken = exports.createToken = function createToken(_ref) {
  var userid = _ref.userid,
    role = _ref.role;
  return new _jose.SignJWT({
    userid: userid,
    role: role,
    iss: "jwt test server"
  }).setProtectedHeader({
    alg: "HS512",
    typ: "JWT"
  }).setIssuedAt().setExpirationTime("1h").sign(secret);
};
var createRefreshToken = exports.createRefreshToken = function createRefreshToken(_ref2) {
  var userid = _ref2.userid,
    role = _ref2.role,
    type = _ref2.type;
  return new _jose.SignJWT({
    userid: userid,
    role: role,
    type: type,
    iss: "jwt test server"
  }).setProtectedHeader({
    alg: "HS512",
    typ: "JWT"
  }).setIssuedAt().setExpirationTime("7d").sign(secret);
};
var checkToken = exports.checkToken = function checkToken(_ref3) {
  var token = _ref3.token,
    callback = _ref3.callback;
  (0, _jose.jwtVerify)(token, secret, {
    algorithms: ['HS512']
  }).then(function (_ref4) {
    var payload = _ref4.payload;
    if (payload.type === "refresh_token") {
      callback({
        status: "fail",
        message: "use your valid access_token"
      });
    } else {
      callback({
        status: "success",
        users: payload
      });
    }
  })["catch"](function (err) {
    callback({
      status: "fail",
      message: err.code === "ERR_JWT_EXPIRED" ? "expired token" : err
    });
  });
};
var checkRefreshToken = exports.checkRefreshToken = function checkRefreshToken(_ref5) {
  var refresh_token = _ref5.refresh_token,
    callback = _ref5.callback;
  (0, _jose.jwtVerify)(refresh_token, secret, {
    algorithms: ['HS512']
  }).then(function (_ref6) {
    var payload = _ref6.payload;
    callback({
      status: "success",
      users: payload
    });
  })["catch"](function (err) {
    callback({
      status: "fail",
      message: err.code === "ERR_JWT_EXPIRED" ? "expired token" : err
    });
  });
};
var computeHMAC = exports.computeHMAC = function computeHMAC(userid, password) {
  return (0, _crypto.createHash)('sha256').update(userid + ":" + password).digest('hex');
};
//# sourceMappingURL=authutil.js.map