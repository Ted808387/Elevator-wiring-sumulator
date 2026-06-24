(() => {
  "use strict";

  const POWER_WIRES = [
    ["POWER.R", "TB1.R1"],
    ["TB1.R1", "NFB.RI"],
    ["NFB.TI", "TB1.T1"],
    ["TB1.T1", "POWER.T"]
  ];

  const coil = (input, relay) => [
    ["NFB.RO", `I${input}.IN`],
    [`I${input}.OUT`, `X${relay}.A1`],
    [`X${relay}.A2`, "NFB.TO"]
  ];

  function referenceA() {
    const wires = [...POWER_WIRES];
    const routes = [
      { input: 1, relay: 1, x4: 1, self: 1, locks: [[2, 1], [3, 1]] },
      { input: 2, relay: 2, x4: 2, self: 2, locks: [[3, 2], [1, 2]] },
      { input: 3, relay: 3, x4: 3, self: 3, locks: [[1, 3], [2, 3]] }
    ];
    routes.forEach(({ input, relay, x4, self, locks }) => {
      wires.push(["NFB.RO", `I${input}.IN`]);
      wires.push([`I${input}.OUT`, `X4.C${x4}`], [`I${input}.OUT`, `X${relay}.C${self}`]);
      wires.push([`X4.NC${x4}`, `X${locks[0][0]}.C${locks[0][1]}`]);
      wires.push([`X${relay}.NO${self}`, `X${locks[0][0]}.C${locks[0][1]}`]);
      wires.push([`X${locks[0][0]}.NC${locks[0][1]}`, `X${locks[1][0]}.C${locks[1][1]}`]);
      wires.push([`X${locks[1][0]}.NC${locks[1][1]}`, `X${relay}.A1`]);
      wires.push([`X${relay}.A2`, "NFB.TO"]);
    });
    wires.push(["NFB.RO", "X1.C4"], ["NFB.RO", "X2.C4"], ["NFB.RO", "X3.C4"]);
    wires.push(["X1.NO4", "X4.A1"], ["X2.NO4", "X4.A1"], ["X3.NO4", "X4.A1"]);
    wires.push(["X4.A2", "NFB.TO"]);
    return wires;
  }

  function referenceB() {
    const wires = [...POWER_WIRES];
    for (let i = 1; i <= 4; i += 1) wires.push(...coil(i, i));
    const holds = [
      { relay: 1, contacts: [[2, 2], [3, 2], [4, 2]] },
      { relay: 2, contacts: [[1, 2], [3, 3], [4, 3]] },
      { relay: 3, contacts: [[1, 3], [2, 3], [4, 4]] },
      { relay: 4, contacts: [[1, 4], [2, 4], [3, 4]] }
    ];
    holds.forEach(({ relay, contacts }) => {
      wires.push(["NFB.RO", `X${relay}.C1`]);
      wires.push([`X${relay}.NO1`, `X${contacts[0][0]}.C${contacts[0][1]}`]);
      wires.push([`X${contacts[0][0]}.NC${contacts[0][1]}`, `X${contacts[1][0]}.C${contacts[1][1]}`]);
      wires.push([`X${contacts[1][0]}.NC${contacts[1][1]}`, `X${contacts[2][0]}.C${contacts[2][1]}`]);
      wires.push([`X${contacts[2][0]}.NC${contacts[2][1]}`, `X${relay}.A1`]);
    });
    return wires;
  }

  function referenceC() {
    const wires = [...POWER_WIRES];
    for (let i = 1; i <= 4; i += 1) wires.push(...coil(i, i));
    wires.push(["NFB.RO", "TB2.14"], ["TB2.14", "X1.C1"]);
    wires.push(["X1.NC1", "X2.C1"], ["X1.NO1", "X2.C2"]);
    wires.push(["X2.NC1", "X3.C1"]);
    wires.push(["X2.NO1", "X3.C2"], ["X2.NC2", "X3.C2"]);
    wires.push(["X2.NO2", "X3.C3"]);
    wires.push(["X3.NC1", "X4.C1"]);
    wires.push(["X3.NO1", "X4.C2"], ["X3.NC2", "X4.C2"]);
    wires.push(["X3.NO2", "X4.C3"], ["X3.NC3", "X4.C3"]);
    wires.push(["X3.NO3", "X4.C4"]);
    wires.push(["X4.NC1", "TB2.0"]);
    wires.push(["X4.NO1", "TB2.1"], ["X4.NC2", "TB2.1"]);
    wires.push(["X4.NO2", "TB2.2"], ["X4.NC3", "TB2.2"]);
    wires.push(["X4.NO3", "TB2.3"], ["X4.NC4", "TB2.3"]);
    wires.push(["X4.NO4", "TB2.4"]);
    return wires;
  }

  function referenceD() {
    const wires = [...POWER_WIRES];
    for (let i = 1; i <= 4; i += 1) wires.push(...coil(i, i));
    wires.push(["NFB.RO", "TB2.14"], ["TB2.14", "X4.C1"], ["X4.NO1", "X3.C1"]);
    wires.push(["X3.NC1", "X2.C1"], ["X3.NO1", "X2.C2"]);
    wires.push(["X2.NC1", "X1.C1"], ["X2.NO1", "X1.C2"]);
    wires.push(["X2.NC2", "X1.C3"], ["X2.NO2", "X1.C4"]);
    wires.push(["X1.NC1", "TB2.0"], ["X1.NO1", "TB2.1"]);
    wires.push(["X1.NC2", "TB2.2"], ["X1.NO2", "TB2.3"]);
    wires.push(["X1.NC3", "TB2.4"], ["X1.NO3", "TB2.5"]);
    wires.push(["X1.NC4", "TB2.6"], ["X1.NO4", "TB2.7"]);
    return wires;
  }

  const QUESTIONS = {
    A: {
      title: "優先選擇電路 A",
      description: "輸入 1～3 中，以最初加入的信號優先；該信號除去前，其他輸入無法加入。",
      hint: "輸入後使用 X4 常閉與本身常開接點形成切換，再串接其他電驛的常閉互鎖。",
      reference: referenceA,
      kind: "priority"
    },
    B: {
      title: "優先選擇電路 B",
      description: "以最後最新加入的輸入信號為優先，輸入信號可隨時改變。",
      hint: "每一線圈由輸入直接啟動，保持支路串接其他三只電驛的常閉接點。",
      reference: referenceB,
      kind: "latest"
    },
    C: {
      title: "電驛作動檢出電路 C",
      description: "檢出 X1～X4 的作動數量，並在 TB2 的 0～4 端輸出對應結果。",
      hint: "從 TB2-14 依序通過 X1、X2、X3、X4 的轉換接點，將相同計數狀態合併。",
      reference: referenceC,
      kind: "count"
    },
    D: {
      title: "二進位轉十進位解碼電路 D",
      description: "輸入 4 作為檢出允許，輸入 1～3 的二進位組合解碼至 TB2 的 0～7。",
      hint: "TB2-14 先經 X4 常開接點，再由 X3、X2、X1 逐層分支到 0～7。",
      reference: referenceD,
      kind: "decode"
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      QUESTIONS,
      blankRelays,
      solveNetwork,
      functionalTests
    };
    return;
  }

  const state = {
    mode: "practice",
    question: "A",
    wires: [],
    history: [],
    selectedTerminal: null,
    selectedColor: "#ef4444",
    nfbOn: false,
    pressedInputs: new Set(),
    relayStates: blankRelays(),
    zoom: 1,
    timerSeconds: 3000,
    timerId: null,
    examQuestion: null,
    examSubmitted: false,
    unstable: false,
    shorted: false
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const board = $("#wiringBoard");
  const wireLayer = $("#wireLayer");

  function blankRelays() {
    return { X1: false, X2: false, X3: false, X4: false };
  }

  function createRelays() {
    const area = $("#relayArea");
    for (let i = 1; i <= 4; i += 1) {
      const banks = Array.from({ length: 4 }, (_, index) => {
        const bank = index + 1;
        return `
          <div class="contact-bank">
            <div class="contact-bank-title">接點 ${bank}</div>
            <button class="terminal c" data-terminal="X${i}.C${bank}"><span>C${bank}</span></button>
            <button class="terminal no" data-terminal="X${i}.NO${bank}"><span>NO${bank}</span></button>
            <button class="terminal nc" data-terminal="X${i}.NC${bank}"><span>NC${bank}</span></button>
          </div>`;
      }).join("");
      area.insertAdjacentHTML("beforeend", `
        <section class="relay" id="relay-X${i}" data-component="X${i}">
          <div class="relay-name">X${i} 電磁電驛</div>
          <div class="relay-state">釋放</div>
          <button class="terminal relay-terminal a1" data-terminal="X${i}.A1"><span>A1</span></button>
          <button class="terminal relay-terminal a2" data-terminal="X${i}.A2"><span>A2</span></button>
          <div class="contact-banks">${banks}</div>
        </section>`);
    }
  }

  function createInputs() {
    const area = $("#inputArea");
    for (let i = 1; i <= 4; i += 1) {
      area.insertAdjacentHTML("beforeend", `
        <section class="input-unit" data-component="I${i}">
          <div class="input-title">輸入 ${i}</div>
          <button class="push-button" data-input="I${i}" type="button">按住測試</button>
          <button class="terminal input-terminal in" data-terminal="I${i}.IN"><span>IN</span></button>
          <button class="terminal input-terminal out" data-terminal="I${i}.OUT"><span>OUT</span></button>
        </section>`);
    }
  }

  function normalizePair(a, b) {
    return [a, b].sort().join("::");
  }

  function addLog(message) {
    const item = document.createElement("li");
    item.textContent = `${new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}　${message}`;
    $("#eventLog").prepend(item);
    while ($("#eventLog").children.length > 8) $("#eventLog").lastElementChild.remove();
  }

  function showBoardMessage(message, type = "") {
    $("#boardMessage").textContent = message;
    $("#boardMessage").className = `board-message ${type}`.trim();
  }

  function getTerminalCenter(id) {
    const terminal = document.querySelector(`[data-terminal="${CSS.escape(id)}"]`);
    if (!terminal) return null;
    const rect = terminal.getBoundingClientRect();
    const layerRect = wireLayer.getBoundingClientRect();
    const scaleX = wireLayer.clientWidth / layerRect.width;
    const scaleY = wireLayer.clientHeight / layerRect.height;
    return {
      x: (rect.left + rect.width / 2 - layerRect.left) * scaleX,
      y: (rect.top + rect.height / 2 - layerRect.top) * scaleY
    };
  }

  function renderWires() {
    wireLayer.innerHTML = "";
    state.wires.forEach((wire, index) => {
      const start = getTerminalCenter(wire.from);
      const end = getTerminalCenter(wire.to);
      if (!start || !end) return;
      const middle = (start.y + end.y) / 2;
      const d = `M ${start.x} ${start.y} C ${start.x} ${middle}, ${end.x} ${middle}, ${end.x} ${end.y}`;
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.setAttribute("stroke", wire.color);
      path.setAttribute("class", "wire-path");
      const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
      hit.setAttribute("d", d);
      hit.setAttribute("class", "wire-hit");
      hit.dataset.wireIndex = String(index);
      group.append(path, hit);
      wireLayer.append(group);
    });
    $("#connectionCount").textContent = `${state.wires.length} 條導線`;
    $("#wireStatus").textContent = String(state.wires.length);
  }

  function saveState() {
    if (state.mode === "exam") return;
    localStorage.setItem("elevator-wiring-simulator-v2", JSON.stringify({
      mode: state.mode,
      question: state.question,
      wires: state.wires,
      selectedColor: state.selectedColor
    }));
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("elevator-wiring-simulator-v2"));
      if (!saved) return;
      state.mode = saved.mode === "exam" ? "practice" : (saved.mode || "practice");
      state.question = QUESTIONS[saved.question] ? saved.question : "A";
      state.wires = Array.isArray(saved.wires) ? saved.wires : [];
      state.selectedColor = saved.selectedColor || "#ef4444";
    } catch {
      localStorage.removeItem("elevator-wiring-simulator-v2");
    }
  }

  function connectTerminals(first, second) {
    if (first === second) return showBoardMessage("起點和終點不能相同", "error");
    const pair = normalizePair(first, second);
    if (state.wires.some(wire => normalizePair(wire.from, wire.to) === pair)) {
      return showBoardMessage("這兩個端子已經接線", "error");
    }
    state.history.push(JSON.stringify(state.wires));
    state.wires.push({ from: first, to: second, color: state.selectedColor });
    renderWires();
    simulateCircuit();
    saveState();
    addLog(`接線 ${first} → ${second}`);
    showBoardMessage(state.shorted ? "警告：目前配線形成 R-T 短路路徑" : `已連接 ${first} 與 ${second}`, state.shorted ? "error" : "success");
  }

  function terminalClick(event) {
    const terminal = event.target.closest("[data-terminal]");
    if (!terminal || state.examSubmitted) return;
    event.stopPropagation();
    const id = terminal.dataset.terminal;
    if (!state.selectedTerminal) {
      state.selectedTerminal = id;
      terminal.classList.add("selected");
      return showBoardMessage(`已選擇 ${id}，請點選另一個端子`);
    }
    const first = state.selectedTerminal;
    state.selectedTerminal = null;
    $$(".terminal.selected").forEach(el => el.classList.remove("selected"));
    connectTerminals(first, id);
  }

  function addEdge(graph, a, b) {
    if (!graph.has(a)) graph.set(a, new Set());
    if (!graph.has(b)) graph.set(b, new Set());
    graph.get(a).add(b);
    graph.get(b).add(a);
  }

  function buildGraph(wires, relays, inputs, nfbOn) {
    const graph = new Map();
    wires.forEach(wire => addEdge(graph, wire.from, wire.to));
    addEdge(graph, "TB1.R1", "TB1.R2");
    addEdge(graph, "TB1.T1", "TB1.T2");
    if (nfbOn) {
      addEdge(graph, "NFB.RI", "NFB.RO");
      addEdge(graph, "NFB.TI", "NFB.TO");
    }
    inputs.forEach(input => addEdge(graph, `${input}.IN`, `${input}.OUT`));
    Object.entries(relays).forEach(([relay, active]) => {
      for (let bank = 1; bank <= 4; bank += 1) {
        addEdge(graph, `${relay}.C${bank}`, `${relay}.${active ? "NO" : "NC"}${bank}`);
      }
    });
    return graph;
  }

  function reachable(graph, start) {
    const seen = new Set([start]);
    const queue = [start];
    while (queue.length) {
      const node = queue.shift();
      (graph.get(node) || []).forEach(next => {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      });
    }
    return seen;
  }

  function solveNetwork(wires, inputs, initialRelays = blankRelays(), nfbOn = true) {
    let relays = { ...initialRelays };
    const signatures = new Set();
    let unstable = false;
    for (let pass = 0; pass < 20; pass += 1) {
      const signature = Object.values(relays).map(Number).join("");
      if (signatures.has(signature)) {
        unstable = true;
        break;
      }
      signatures.add(signature);
      const graph = buildGraph(wires, relays, inputs, nfbOn);
      const live = reachable(graph, "POWER.R");
      const neutral = reachable(graph, "POWER.T");
      const next = blankRelays();
      for (let i = 1; i <= 4; i += 1) {
        const relay = `X${i}`;
        next[relay] =
          (live.has(`${relay}.A1`) && neutral.has(`${relay}.A2`)) ||
          (live.has(`${relay}.A2`) && neutral.has(`${relay}.A1`));
      }
      if (Object.keys(next).every(key => next[key] === relays[key])) {
        const stableGraph = buildGraph(wires, next, inputs, nfbOn);
        const stableLive = reachable(stableGraph, "POWER.R");
        return {
          relays: next,
          live: stableLive,
          shorted: stableLive.has("POWER.T"),
          unstable: false
        };
      }
      relays = next;
    }
    const graph = buildGraph(wires, relays, inputs, nfbOn);
    const live = reachable(graph, "POWER.R");
    return { relays, live, shorted: live.has("POWER.T"), unstable };
  }

  function simulateCircuit() {
    const result = solveNetwork(state.wires, state.pressedInputs, state.relayStates, state.nfbOn);
    state.relayStates = result.relays;
    state.unstable = result.unstable;
    state.shorted = result.shorted;
    renderElectricalState(result.live);
  }

  function renderElectricalState(live = new Set()) {
    const active = [];
    Object.entries(state.relayStates).forEach(([relay, on]) => {
      $(`#relay-${relay}`).classList.toggle("active", on);
      $(".relay-state", $(`#relay-${relay}`)).textContent = on ? "吸合" : "釋放";
      if (on) active.push(relay);
    });
    $("#relayStatus").textContent = active.join("、") || "無";
    $("#inputStatus").textContent = [...state.pressedInputs].join("、") || "無";
    $("#nfbStatus").textContent = state.nfbOn ? "ON" : "OFF";
    $$("[data-terminal]").forEach(el => el.classList.toggle("energized", state.nfbOn && live.has(el.dataset.terminal)));
  }

  function setNfb(on) {
    state.nfbOn = on;
    $("#nfbSwitch").classList.toggle("on", on);
    $("#nfbSwitch").setAttribute("aria-pressed", String(on));
    $("b", $("#nfbSwitch")).textContent = on ? "ON" : "OFF";
    if (!on) state.relayStates = blankRelays();
    simulateCircuit();
    addLog(`NFB 切換為 ${on ? "ON" : "OFF"}`);
  }

  function setInput(input, pressed) {
    if (pressed) state.pressedInputs.add(input);
    else state.pressedInputs.delete(input);
    const button = $(`[data-input="${input}"]`);
    button.classList.toggle("pressed", pressed);
    button.textContent = pressed ? "輸入中" : "按住測試";
    simulateCircuit();
  }

  function currentQuestion() {
    return state.mode === "exam" ? state.examQuestion : state.question;
  }

  function updateTask() {
    const code = currentQuestion();
    const question = QUESTIONS[code];
    $("#taskBadge").textContent = `題型 ${code}`;
    $("#taskTitle").textContent = question.title;
    $("#taskDescription").textContent = question.description;
    $("#questionSelect").value = code;
    if (state.mode === "free") {
      $("#taskBadge").textContent = "自由模式";
      $("#taskTitle").textContent = "自由配線工作台";
      $("#taskDescription").textContent = "不限制答案，可自行連接多組電驛接點並測試。";
    }
  }

  function resetBoard(clearSaved = false) {
    state.history = [];
    state.wires = [];
    state.selectedTerminal = null;
    state.pressedInputs.clear();
    state.relayStates = blankRelays();
    state.nfbOn = false;
    state.unstable = false;
    state.shorted = false;
    $("#nfbSwitch").classList.remove("on");
    $("#nfbSwitch").setAttribute("aria-pressed", "false");
    $("b", $("#nfbSwitch")).textContent = "OFF";
    renderWires();
    renderElectricalState();
    if (clearSaved) saveState();
  }

  function setMode(mode) {
    if (mode === state.mode && mode === "exam" && !state.examSubmitted) return;
    state.mode = mode;
    state.examSubmitted = false;
    $$(".mode-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.mode === mode));
    const free = mode === "free";
    $("#questionSelect").disabled = free || mode === "exam";
    $("#hintButton").hidden = mode !== "practice";
    $("#answerButton").hidden = mode !== "practice";
    $("#checkButton").hidden = free;
    $("#timer").hidden = mode !== "exam";
    if (mode === "exam") {
      state.examQuestion = ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];
      resetBoard();
      startExam();
    } else {
      stopTimer();
      state.examQuestion = null;
    }
    updateTask();
    saveState();
    addLog(`切換至${mode === "practice" ? "練習" : mode === "exam" ? "模擬測驗" : "自由配線"}模式`);
  }

  function formatTime(seconds) {
    return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  }

  function startExam() {
    stopTimer();
    state.timerSeconds = 3000;
    $("#timer").textContent = formatTime(state.timerSeconds);
    state.timerId = window.setInterval(() => {
      state.timerSeconds -= 1;
      $("#timer").textContent = formatTime(state.timerSeconds);
      if (state.timerSeconds <= 0) {
        stopTimer();
        state.examSubmitted = true;
        checkResult();
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
  }

  function relayNames(relays) {
    return Object.entries(relays).filter(([, on]) => on).map(([name]) => name).sort().join(",");
  }

  function functionalTests(code, wires) {
    const failures = [];
    let total = 0;
    let passed = 0;
    const run = (label, inputs, expectedRelays, expectedOutput, initial = blankRelays()) => {
      total += 1;
      const result = solveNetwork(wires, new Set(inputs), initial, true);
      let ok = !result.unstable && !result.shorted;
      if (expectedRelays !== null) ok = ok && relayNames(result.relays) === expectedRelays;
      if (expectedOutput !== null) {
        const liveOutputs = Array.from({ length: 10 }, (_, n) => n).filter(n => result.live.has(`TB2.${n}`));
        ok = ok && liveOutputs.length === 1 && liveOutputs[0] === expectedOutput;
      }
      if (ok) passed += 1;
      else failures.push(label);
      return result.relays;
    };

    if (code === "A") {
      const selected = run("輸入 1 單獨動作", ["I1"], "X1,X4", null);
      const first = run("輸入 1 優先於輸入 2", ["I1", "I2"], "X1,X4", null, selected);
      run("輸入 1 除去後輸入 2 可加入", ["I2"], "X2,X4", null, first);
      run("輸入 3 單獨動作", ["I3"], "X3,X4", null);
    } else if (code === "B") {
      const x1 = run("輸入 1 後 X1 保持", ["I1"], "X1", null);
      const held = run("輸入 1 放開後仍保持", [], "X1", null, x1);
      const x3 = run("最新輸入 3 取代 X1", ["I3"], "X3", null, held);
      run("輸入 3 放開後 X3 保持", [], "X3", null, x3);
    } else if (code === "C") {
      const combos = [
        [], ["I1"], ["I1", "I2"], ["I1", "I2", "I3"], ["I1", "I2", "I3", "I4"]
      ];
      combos.forEach((inputs, count) => run(`${count} 只電驛作動輸出 ${count}`, inputs, null, count));
    } else {
      for (let value = 0; value < 8; value += 1) {
        const inputs = ["I4"];
        if (value & 1) inputs.push("I1");
        if (value & 2) inputs.push("I2");
        if (value & 4) inputs.push("I3");
        run(`二進位 ${value.toString(2).padStart(3, "0")} 輸出 ${value}`, inputs, null, value);
      }
    }
    return { total, passed, failures };
  }

  function checkResult() {
    const code = currentQuestion();
    const tests = functionalTests(code, state.wires);
    const safety = solveNetwork(state.wires, state.pressedInputs, state.relayStates, true);
    const reference = new Set(QUESTIONS[code].reference().map(pair => normalizePair(...pair)));
    const actual = new Set(state.wires.map(wire => normalizePair(wire.from, wire.to)));
    const matched = [...reference].filter(pair => actual.has(pair)).length;
    const functionalScore = Math.round((tests.passed / tests.total) * 70);
    const safetyScore = safety.shorted || safety.unstable ? 0 : 20;
    const wiringScore = Math.round((matched / reference.size) * 10);
    const score = functionalScore + safetyScore + wiringScore;
    const passed = score >= 60 && tests.passed === tests.total && !safety.shorted && !safety.unstable;

    if (state.mode === "exam") {
      state.examSubmitted = true;
      stopTimer();
    }
    $("#resultIcon").textContent = passed ? "✓" : "!";
    $("#resultIcon").classList.toggle("fail", !passed);
    $("#resultTitle").textContent = passed ? "功能測試通過" : "電路功能仍需修正";
    $("#resultSummary").textContent = `依官方題型執行 ${tests.total} 組輸入測試，通過 ${tests.passed} 組。`;
    $("#scoreBlock").textContent = `${score} 分`;
    const details = [
      `功能測試：${tests.passed}／${tests.total}`,
      safety.shorted ? "安全檢查：形成 R-T 短路路徑" : "安全檢查：未檢出 R-T 短路",
      safety.unstable ? "穩定性：電驛狀態振盪" : "穩定性：正常",
      `參考接線涵蓋：${matched}／${reference.size}`
    ];
    if (tests.failures.length) details.push(`未通過：${tests.failures.slice(0, 4).join("、")}`);
    if (state.mode === "exam") details.push(`剩餘時間：${formatTime(state.timerSeconds)}`);
    $("#resultDetails").innerHTML = details.map(item => `<li>${item}</li>`).join("");
    $("#resultModal").hidden = false;
  }

  function showReferenceStep() {
    const expected = QUESTIONS[currentQuestion()].reference();
    const actual = new Set(state.wires.map(wire => normalizePair(wire.from, wire.to)));
    const missing = expected.find(pair => !actual.has(normalizePair(...pair)));
    if (!missing) return showBoardMessage("參考接線已完整，可執行功能測試", "success");
    showBoardMessage(`下一條參考接線：${missing[0]} ↔ ${missing[1]}`);
    missing.map(id => document.querySelector(`[data-terminal="${CSS.escape(id)}"]`)).filter(Boolean).forEach(el => {
      el.classList.add("selected");
      window.setTimeout(() => el.classList.remove("selected"), 2200);
    });
  }

  function deleteWire(index) {
    if (state.examSubmitted || !state.wires[index]) return;
    state.history.push(JSON.stringify(state.wires));
    state.wires.splice(index, 1);
    renderWires();
    simulateCircuit();
    saveState();
  }

  function clearWires() {
    if (!state.wires.length || state.examSubmitted) return;
    state.history.push(JSON.stringify(state.wires));
    state.wires = [];
    renderWires();
    simulateCircuit();
    saveState();
  }

  function undo() {
    if (state.examSubmitted) return;
    const previous = state.history.pop();
    if (previous === undefined) return showBoardMessage("目前沒有可復原的操作");
    state.wires = JSON.parse(previous);
    renderWires();
    simulateCircuit();
    saveState();
  }

  function setZoom(next) {
    state.zoom = Math.max(0.45, Math.min(1.2, next));
    board.style.transform = `scale(${state.zoom})`;
    $("#boardViewport").style.minHeight = `${Math.min(900 * state.zoom + 44, 800)}px`;
    $("#zoomLabel").textContent = `${Math.round(state.zoom * 100)}%`;
    requestAnimationFrame(renderWires);
  }

  function bindEvents() {
    board.addEventListener("click", terminalClick);
    wireLayer.addEventListener("click", event => {
      const hit = event.target.closest("[data-wire-index]");
      if (hit) deleteWire(Number(hit.dataset.wireIndex));
    });
    $("#nfbSwitch").addEventListener("click", () => setNfb(!state.nfbOn));
    $$(".push-button").forEach(button => {
      const input = button.dataset.input;
      button.addEventListener("pointerdown", event => {
        event.preventDefault();
        setInput(input, true);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach(type => button.addEventListener(type, () => setInput(input, false)));
    });
    $$(".color-dot").forEach(button => button.addEventListener("click", () => {
      state.selectedColor = button.dataset.color;
      $$(".color-dot").forEach(el => el.classList.toggle("active", el === button));
      saveState();
    }));
    $$(".mode-tab").forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
    $("#questionSelect").addEventListener("change", event => {
      state.question = event.target.value;
      resetBoard(true);
      updateTask();
    });
    $("#undoButton").addEventListener("click", undo);
    $("#clearButton").addEventListener("click", clearWires);
    $("#hintButton").addEventListener("click", () => showBoardMessage(QUESTIONS[currentQuestion()].hint));
    $("#answerButton").addEventListener("click", showReferenceStep);
    $("#checkButton").addEventListener("click", checkResult);
    $$(".guide-tab").forEach(tab => tab.addEventListener("click", () => {
      $$(".guide-tab").forEach(el => el.classList.toggle("active", el === tab));
      $$(".guide-content").forEach(el => el.classList.toggle("active", el.id === `${tab.dataset.guide}Guide`));
    }));
    $("#zoomInButton").addEventListener("click", () => setZoom(state.zoom + 0.1));
    $("#zoomOutButton").addEventListener("click", () => setZoom(state.zoom - 0.1));
    $("#resetViewButton").addEventListener("click", () => setZoom(window.innerWidth <= 700 ? 0.52 : 0.85));
    $("#helpButton").addEventListener("click", () => { $("#helpModal").hidden = false; });
    $$("[data-close-modal]").forEach(el => el.addEventListener("click", () => { $("#resultModal").hidden = true; }));
    $$("[data-close-help]").forEach(el => el.addEventListener("click", () => { $("#helpModal").hidden = true; }));
    window.addEventListener("resize", () => requestAnimationFrame(renderWires));
  }

  function init() {
    createRelays();
    createInputs();
    loadState();
    bindEvents();
    $$(".mode-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.mode === state.mode));
    $$(".color-dot").forEach(button => button.classList.toggle("active", button.dataset.color === state.selectedColor));
    updateTask();
    renderWires();
    simulateCircuit();
    setMode(state.mode);
    setZoom(window.innerWidth <= 700 ? 0.52 : 0.85);
  }

  init();
})();
