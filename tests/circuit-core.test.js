const assert = require("node:assert/strict");
const {
  QUESTIONS,
  blankRelays,
  functionalTests,
  solveNetwork
} = require("../js/app.js");

for (const code of ["A", "B", "C", "D"]) {
  const referenceWires = QUESTIONS[code].reference().map(([from, to]) => ({ from, to }));
  const result = functionalTests(code, referenceWires);

  assert.equal(
    result.passed,
    result.total,
    `題型 ${code} 的官方參考接線未通過全部功能測試：${result.failures.join("、")}`
  );

  const brokenWires = referenceWires.slice(1);
  const brokenResult = functionalTests(code, brokenWires);
  assert.ok(
    brokenResult.passed < brokenResult.total,
    `題型 ${code} 移除必要電源接線後仍被判定全部通過`
  );
}

const directShort = solveNetwork(
  [{ from: "POWER.R", to: "POWER.T" }],
  new Set(),
  blankRelays(),
  true
);

assert.equal(directShort.shorted, true, "R-T 直接短路未被偵測");

console.log("A-D 參考電路、故障接線與短路測試皆通過。");
