if (typeof global.structuredClone !== "function") {
  global.structuredClone = (val: any) => {
    if (val === undefined) return undefined;
    return JSON.parse(JSON.stringify(val));
  };
}

import "@testing-library/jest-dom";
