module.exports = function (configValue) {
  let stack = [];
  const decoratedValueName = "bound configValue";

  const makeDynamicConfig = (e) => {
    Object.entries(e).forEach(([key, value]) => {
      stack.push([key, value, e]);
    });

    while (stack.length) {
      const [key, value, target] = stack.pop();

      if (value === null) continue;

      if (Array.isArray(value)) {
        for (let idx = 0; idx < value.length; idx++) {
          const el = value[idx];

          if (typeof el === "function" && el.name === decoratedValueName) {
            Object.defineProperty(value, idx, { get: el });
          }

          if (el === null) continue;

          if (Array.isArray(el)) {
            el.forEach((value, idx) => {
              stack.push([idx, value, el]);
            });
            continue;
          }

          if (typeof el === "object") {
            Object.entries(el).forEach(([key, value]) => {
              stack.push([key, value, el]);
            });
            continue;
          }
        }
      }

      if (typeof value === "object") {
        Object.entries(value).forEach(([key, val]) => {
          stack.push([key, val, value]);
        });
        continue;
      }

      if (typeof value === "function" && value.name === decoratedValueName) {
        Object.defineProperty(target, key, { get: value });
      }
    }

    return e;
  };
  const dynamicConfigValue = (...args) => configValue.bind(null, ...args);

  return {
    makeDynamicConfig,
    dynamicConfigValue,
  };
};
