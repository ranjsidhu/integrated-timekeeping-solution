const React = require("react");

// simple stub that returns an empty <svg/> for any icon component request
const Icon = (props) => React.createElement("svg", props, null);

// export default and allow any named export to resolve to the same stub component
const proxy = new Proxy(Icon, {
  get: () => Icon,
  apply: () => Icon,
});

module.exports = proxy;
module.exports.default = Icon;
