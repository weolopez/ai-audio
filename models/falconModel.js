const falconModel = {
  publicPath: "models/falcon_params.pv",
  forceWrite: true,
};

(function () {
  if (typeof module !== "undefined" && typeof module.exports !== "undefined")
    module.exports = falconModel;
})();