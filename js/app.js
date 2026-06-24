(() => {
  "use strict";

  const QUESTIONS = {
    A: {
      title: "優先選擇電路 A",
      description: "輸入 1～3 依先到信號取得優先權；某一輸入動作後，其他輸入暫時無法加入。",
      hint: "先完成 R、T 經 NFB 的控制電源，再思考如何用電驛常閉接點阻止其他線圈吸合。",
      expected: [
        ["POWER.R", "TB1.R1"], ["TB1.R1", "NFB.RI"], ["NFB.RO", "I1.IN"],
        ["I1.OUT", "X1.A1"], ["X1.A2", "NFB.TO"], ["NFB.TI", "TB1.T1"],
        ["TB1.T1", "POWER.T"], ["NFB.RO", "I2.IN"], ["I2.OUT", "X1.C"],
        ["X1.NC", "X2.A1"], ["X2.A2", "NFB.TO"], ["NFB.RO", "I3.IN"],
        ["I3.OUT", "X2.C"], ["X2.NC", "X3.A1"], ["X3.A2", "NFB.TO"],
        ["X1.NO", "TB2.1"], ["X2.NO", "TB2.2"], ["X3.NO", "TB2.3"]
      ]
    },
    B: {
      title: "最新輸入優先電路 B",
      description: "新的輸入信號可取代原先信號，使最後輸入的回路優先保持動作。",
      hint: "利用每一只電驛的 NO 接點作保持，並用其他電驛的 NC 接點解除先前狀態。",
      expected: [
        ["POWER.R", "TB1.R1"], ["TB1.R1", "NFB.RI"], ["NFB.TI", "TB1.T1"],
        ["TB1.T1", "POWER.T"], ["NFB.RO", "I1.IN"], ["I1.OUT", "X1.A1"],
        ["X1.A2", "NFB.TO"], ["NFB.RO", "I2.IN"], ["I2.OUT", "X2.A1"],
        ["X2.A2", "NFB.TO"], ["NFB.RO", "I3.IN"], ["I3.OUT", "X3.A1"],
        ["X3.A2", "NFB.TO"], ["NFB.RO", "I4.IN"], ["I4.OUT", "X4.A1"],
        ["X4.A2", "NFB.TO"], ["X1.NO", "TB2.1"], ["X2.NO", "TB2.2"],
        ["X3.NO", "TB2.3"], ["X4.NO", "TB2.4"]
      ]
    },
    C: {
      title: "電驛作動檢出電路 C",
      description: "依 X1～X4 電驛吸合的數量，在 TB2 的 0～4 端輸出對應檢出結果。",
      hint: "先讓輸入 1～4 分別驅動 X1～X4，再將電驛接點組合到 TB2 的數量輸出端。",
      expected: [
        ["POWER.R", "TB1.R1"], ["TB1.R1", "NFB.RI"], ["NFB.TI", "TB1.T1"],
        ["TB1.T1", "POWER.T"], ["NFB.RO", "I1.IN"], ["I1.OUT", "X1.A1"],
        ["X1.A2", "NFB.TO"], ["NFB.RO", "I2.IN"], ["I2.OUT", "X2.A1"],
        ["X2.A2", "NFB.TO"], ["NFB.RO", "I3.IN"], ["I3.OUT", "X3.A1"],
        ["X3.A2", "NFB.TO"], ["NFB.RO", "I4.IN"], ["I4.OUT", "X4.A1"],
        ["X4.A2", "NFB.TO"], ["X1.C", "NFB.RO"], ["X1.NO", "TB2.1"],
        ["X2.NO", "TB2.2"], ["X3.NO", "TB2.3"], ["X4.NO", "TB2.4"]
      ]
    },
    D: {
      title: "二進位轉十進位解碼電路 D",
      description: "將輸入的二進位組合轉換為 TB2 的十進位 0～9 輸出，用於解碼練習。",
      hint: "先完成四組輸入與電驛線圈，再利用 NO／NC 狀態組合出不同的十進位輸出。",
      expected: [
        ["POWER.R", "TB1.R1"], ["TB1.R1", "NFB.RI"], ["NFB.TI", "TB1.T1"],
        ["TB1.T1", "POWER.T"], ["NFB.RO", "I1.IN"], ["I1.OUT", "X1.A1"],
        ["X1.A2", "NFB.TO"], ["NFB.RO", "I2.IN"], ["I2.OUT", "X2.A1"],
        ["X2.A2", "NFB.TO"], ["NFB.RO", "I3.IN"], ["I3.OUT", "X3.A1"],
        ["X3.A2", "NFB.TO"], ["NFB.RO", "I4.IN"], ["I4.OUT", "X4.A1"],
        ["X4.A2", "NFB.TO"], ["X1.C", "NFB.RO"], ["X1.NC", "TB2.0"],
        ["X1.NO", "TB2.1"], ["X2.NO", "TB2.2"], ["X3.NO", "TB2.4"],
        ["X4.NO", "TB2.8"]
      ]
    }
  };

  const state = {
    mode: "practice",
    question: "A",
    wires: [],
    history: [],
    selectedTerminal: null,
    selectedColor: "#ef4444",
    nfbOn: false,
    pressedInputs: new Set(),
    relayStates: { X1: false, X2: false, X3: false, X4: false },
    zoom: 1,
    timerSeconds: 3000,
    timerId: null,
    examStarted: false
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const board = $("#wiringBoard");
  const wireLayer = $("#wireLayer");

  function createRelays() {
    const area = $("#relayArea");
    for (let i = 1; i <= 4; i += 1) {
      area.insertAdjacentHTML("beforeend", `
        <section class="relay" id="relay-X${i}" data-component="X${i}">
          <div class="relay-name">X${i} 電磁電驛</div>
          <div class="relay-state">釋放</div>
          <button class="terminal relay-terminal a1" data-terminal="X${i}.A1"><span>A1</span></button>
          <button class="terminal relay-terminal a2" data-terminal="X${i}.A2"><span>A2</span></button>
          <button class="terminal relay-terminal c" data-terminal="X${i}.C"><span>C</span></button>
          <button class="terminal relay-terminal no" data-terminal="X${i}.NO"><span>NO</span></button>
          <button class="terminal relay-terminal nc" data-terminal="X${i}.NC"><span>NC</span></button>
        </section>
      `);
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
        </section>
      `);
    }
  }

  function normalizePair(a, b) {
    return [a, b].sort().join("::");
  }

  function addLog(message) {
    const log = $("#eventLog");
    const li = document.createElement("li");
    li.textContent = `${new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}　${message}`;
    log.prepend(li);
    while (log.children.length > 8) log.lastElementChild.remove();
  }

  function showBoardMessage(message, type = "") {
    const el = $("#boardMessage");
    el.textContent = message;
    el.className = `board-message ${type}`.trim();
  }

  function getTerminalCenter(id) {
    const terminal = document.querySelector(`[data-terminal="${CSS.escape(id)}"]`);
    if (!terminal) return null;
    const terminalRect = terminal.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    return {
      x: (terminalRect.left + terminalRect.width / 2 - boardRect.left) / state.zoom,
      y: (terminalRect.top + terminalRect.height / 2 - boardRect.top) / state.zoom
    };
  }

  function wirePath(start, end) {
    const midpoint = (start.y + end.y) / 2;
    return `M ${start.x} ${start.y} C ${start.x} ${midpoint}, ${end.x} ${midpoint}, ${end.x} ${end.y}`;
  }

  function renderWires() {
    wireLayer.innerHTML = "";
    state.wires.forEach((wire, index) => {
      const start = getTerminalCenter(wire.from);
      const end = getTerminalCenter(wire.to);
      if (!start || !end) return;
      const d = wirePath(start, end);
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const visible = document.createElementNS("http://www.w3.org/2000/svg", "path");
      visible.setAttribute("d", d);
      visible.setAttribute("stroke", wire.color);
      visible.setAttribute("class", "wire-path");
      const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
      hit.setAttribute("d", d);
      hit.setAttribute("class", "wire-hit");
      hit.dataset.wireIndex = String(index);
      group.append(visible, hit);
      wireLayer.append(group);
    });
    $("#connectionCount").textContent = `${state.wires.length} 條導線`;
    $("#wireStatus").textContent = String(state.wires.length);
  }

  function saveState() {
    const payload = {
      mode: state.mode,
      question: state.question,
      wires: state.wires,
      selectedColor: state.selectedColor
    };
    localStorage.setItem("elevator-wiring-simulator", JSON.stringify(payload));
    $("#saveStatus").textContent = "已自動儲存";
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("elevator-wiring-simulator"));
      if (!saved) return;
      state.mode = saved.mode || "practice";
      state.question = saved.question || "A";
      state.wires = Array.isArray(saved.wires) ? saved.wires : [];
      state.selectedColor = saved.selectedColor || "#ef4444";
    } catch {
      localStorage.removeItem("elevator-wiring-simulator");
    }
  }

  function connectTerminals(first, second) {
    if (first === second) {
      showBoardMessage("起點和終點不能是同一個端子", "error");
      return;
    }
    const pair = normalizePair(first, second);
    if (state.wires.some(wire => normalizePair(wire.from, wire.to) === pair)) {
      showBoardMessage("這兩個端子已經接線", "error");
      return;
    }
    state.history.push(JSON.stringify(state.wires));
    state.wires.push({ from: first, to: second, color: state.selectedColor });
    renderWires();
    simulateCircuit();
    saveState();
    addLog(`接線 ${first} → ${second}`);
    showBoardMessage(`已連接 ${first} 與 ${second}`, "success");
    if (state.mode === "practice") checkImmediateHazards(first, second);
  }

  function checkImmediateHazards(first, second) {
    const directShort = normalizePair(first, second) === normalizePair("POWER.R", "POWER.T");
    if (directShort) showBoardMessage("警告：R 與 T 不可直接連接，這會造成短路", "error");
  }

  function terminalClick(event) {
    const terminal = event.target.closest("[data-terminal]");
    if (!terminal) return;
    event.stopPropagation();
    const id = terminal.dataset.terminal;
    if (!state.selectedTerminal) {
      state.selectedTerminal = id;
      terminal.classList.add("selected");
      showBoardMessage(`已選擇 ${id}，請點選另一個端子`);
      return;
    }
    const first = state.selectedTerminal;
    $$(".terminal.selected").forEach(el => el.classList.remove("selected"));
    state.selectedTerminal = null;
    connectTerminals(first, id);
  }

  function deleteWire(index) {
    const wire = state.wires[index];
    if (!wire) return;
    state.history.push(JSON.stringify(state.wires));
    state.wires.splice(index, 1);
    renderWires();
    simulateCircuit();
    saveState();
    addLog(`刪除 ${wire.from} ↔ ${wire.to}`);
  }

  function buildGraph() {
    const graph = new Map();
    const addEdge = (a, b) => {
      if (!graph.has(a)) graph.set(a, new Set());
      if (!graph.has(b)) graph.set(b, new Set());
      graph.get(a).add(b);
      graph.get(b).add(a);
    };
    state.wires.forEach(wire => addEdge(wire.from, wire.to));
    addEdge("TB1.R1", "TB1.R2");
    addEdge("TB1.T1", "TB1.T2");
    if (state.nfbOn) {
      addEdge("NFB.RI", "NFB.RO");
      addEdge("NFB.TI", "NFB.TO");
    }
    state.pressedInputs.forEach(input => addEdge(`${input}.IN`, `${input}.OUT`));
    Object.entries(state.relayStates).forEach(([relay, active]) => {
      addEdge(`${relay}.C`, `${relay}.${active ? "NO" : "NC"}`);
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

  function simulateCircuit() {
    for (let pass = 0; pass < 6; pass += 1) {
      const graph = buildGraph();
      const live = reachable(graph, "POWER.R");
      const neutral = reachable(graph, "POWER.T");
      let changed = false;
      for (let i = 1; i <= 4; i += 1) {
        const relay = `X${i}`;
        const active = state.nfbOn &&
          ((live.has(`${relay}.A1`) && neutral.has(`${relay}.A2`)) ||
           (live.has(`${relay}.A2`) && neutral.has(`${relay}.A1`)));
        if (state.relayStates[relay] !== active) {
          state.relayStates[relay] = active;
          changed = true;
        }
      }
      if (!changed) break;
    }
    renderElectricalState();
  }

  function renderElectricalState() {
    const activeRelays = [];
    Object.entries(state.relayStates).forEach(([relay, active]) => {
      const el = $(`#relay-${relay}`);
      el.classList.toggle("active", active);
      $(".relay-state", el).textContent = active ? "吸合" : "釋放";
      if (active) activeRelays.push(relay);
    });
    $("#relayStatus").textContent = activeRelays.join("、") || "無";
    $("#inputStatus").textContent = [...state.pressedInputs].join("、") || "無";
    $("#nfbStatus").textContent = state.nfbOn ? "ON" : "OFF";
    const graph = buildGraph();
    const live = reachable(graph, "POWER.R");
    $$("[data-terminal]").forEach(el => el.classList.toggle("energized", state.nfbOn && live.has(el.dataset.terminal)));
  }

  function setNfb(on) {
    state.nfbOn = on;
    const button = $("#nfbSwitch");
    button.classList.toggle("on", on);
    button.setAttribute("aria-pressed", String(on));
    $("b", button).textContent = on ? "ON" : "OFF";
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

  function updateTask() {
    const question = QUESTIONS[state.question];
    $("#taskBadge").textContent = `題型 ${state.question}`;
    $("#taskTitle").textContent = question.title;
    $("#taskDescription").textContent = question.description;
    $("#questionSelect").value = state.question;
    if (state.mode === "free") {
      $("#taskBadge").textContent = "自由模式";
      $("#taskTitle").textContent = "自由配線工作台";
      $("#taskDescription").textContent = "不限制答案，可自行連接端子並操作 NFB、按鈕與電驛。";
    }
  }

  function setMode(mode) {
    state.mode = mode;
    $$(".mode-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.mode === mode));
    const free = mode === "free";
    $("#questionSelect").disabled = free;
    $("#hintButton").hidden = mode === "exam" || free;
    $("#answerButton").hidden = mode === "exam" || free;
    $("#checkButton").hidden = free;
    $("#timer").hidden = mode !== "exam";
    if (mode === "exam") startExam();
    else stopTimer();
    updateTask();
    saveState();
    addLog(`切換至${mode === "practice" ? "練習" : mode === "exam" ? "模擬測驗" : "自由配線"}模式`);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  }

  function startExam() {
    stopTimer();
    state.examStarted = true;
    state.timerSeconds = 3000;
    $("#timer").textContent = formatTime(state.timerSeconds);
    state.timerId = window.setInterval(() => {
      state.timerSeconds -= 1;
      $("#timer").textContent = formatTime(state.timerSeconds);
      if (state.timerSeconds <= 0) {
        stopTimer();
        checkResult();
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
  }

  function checkResult() {
    const expected = new Set(QUESTIONS[state.question].expected.map(pair => normalizePair(...pair)));
    const actual = new Set(state.wires.map(wire => normalizePair(wire.from, wire.to)));
    const correct = [...expected].filter(pair => actual.has(pair));
    const missing = [...expected].filter(pair => !actual.has(pair));
    const extra = [...actual].filter(pair => !expected.has(pair));
    const shorted = actual.has(normalizePair("POWER.R", "POWER.T"));
    const connectionScore = Math.round((correct.length / expected.size) * 70);
    const safetyScore = shorted ? 0 : 15;
    const neatnessScore = Math.max(0, 15 - Math.min(15, extra.length * 3));
    const score = Math.min(100, connectionScore + safetyScore + neatnessScore);
    const passed = score >= 70 && !shorted && missing.length === 0;

    $("#resultIcon").textContent = passed ? "✓" : "!";
    $("#resultIcon").classList.toggle("fail", !passed);
    $("#resultTitle").textContent = passed ? "配線檢查通過" : "仍有需要修正的地方";
    $("#resultSummary").textContent = passed
      ? "必要接線完整，且未檢出直接短路。"
      : "請依檢查摘要修正，再重新通電測試。";
    $("#scoreBlock").textContent = `${score} 分`;
    const details = [
      `正確接線：${correct.length}／${expected.size}`,
      `漏接：${missing.length} 條`,
      `非題目接線：${extra.length} 條`,
      shorted ? "安全檢查：檢出 R、T 直接短路" : "安全檢查：未檢出直接短路"
    ];
    if (state.mode === "exam") details.push(`剩餘時間：${formatTime(state.timerSeconds)}`);
    $("#resultDetails").innerHTML = details.map(item => `<li>${item}</li>`).join("");
    $("#resultModal").hidden = false;
  }

  function showHint() {
    showBoardMessage(QUESTIONS[state.question].hint);
    addLog("查看題型提示");
  }

  function showAnswerStep() {
    const expected = QUESTIONS[state.question].expected;
    const actual = new Set(state.wires.map(wire => normalizePair(wire.from, wire.to)));
    const missing = expected.find(pair => !actual.has(normalizePair(...pair)));
    if (!missing) {
      showBoardMessage("必要接線已全部完成，可以通電測試", "success");
      return;
    }
    showBoardMessage(`下一條參考接線：${missing[0]} ↔ ${missing[1]}`);
    const terminals = missing.map(id => document.querySelector(`[data-terminal="${CSS.escape(id)}"]`)).filter(Boolean);
    terminals.forEach(el => el.classList.add("selected"));
    window.setTimeout(() => terminals.forEach(el => el.classList.remove("selected")), 2400);
  }

  function clearWires() {
    if (!state.wires.length) return;
    state.history.push(JSON.stringify(state.wires));
    state.wires = [];
    state.selectedTerminal = null;
    renderWires();
    simulateCircuit();
    saveState();
    addLog("清除全部配線");
    showBoardMessage("已清除全部導線");
  }

  function undo() {
    const previous = state.history.pop();
    if (previous === undefined) {
      showBoardMessage("目前沒有可復原的操作");
      return;
    }
    state.wires = JSON.parse(previous);
    renderWires();
    simulateCircuit();
    saveState();
    addLog("復原上一個配線操作");
  }

  function setZoom(next) {
    state.zoom = Math.max(0.55, Math.min(1.25, next));
    board.style.transform = `scale(${state.zoom})`;
    const viewport = $("#boardViewport");
    board.parentElement.style.setProperty("--board-scale", state.zoom);
    viewport.style.minHeight = `${Math.min(720 * state.zoom + 44, 760)}px`;
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
      ["pointerdown", "touchstart"].forEach(type => button.addEventListener(type, event => {
        event.preventDefault();
        setInput(input, true);
      }, { passive: false }));
      ["pointerup", "pointercancel", "pointerleave", "touchend"].forEach(type => button.addEventListener(type, () => setInput(input, false)));
    });

    $$(".color-dot").forEach(button => button.addEventListener("click", () => {
      state.selectedColor = button.dataset.color;
      $$(".color-dot").forEach(el => el.classList.toggle("active", el === button));
      saveState();
    }));

    $$(".mode-tab").forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
    $("#questionSelect").addEventListener("change", event => {
      state.question = event.target.value;
      updateTask();
      saveState();
    });

    $("#undoButton").addEventListener("click", undo);
    $("#clearButton").addEventListener("click", clearWires);
    $("#hintButton").addEventListener("click", showHint);
    $("#answerButton").addEventListener("click", showAnswerStep);
    $("#checkButton").addEventListener("click", checkResult);

    $$(".guide-tab").forEach(tab => tab.addEventListener("click", () => {
      $$(".guide-tab").forEach(el => el.classList.toggle("active", el === tab));
      $$(".guide-content").forEach(el => el.classList.toggle("active", el.id === `${tab.dataset.guide}Guide`));
    }));

    $("#zoomInButton").addEventListener("click", () => setZoom(state.zoom + 0.1));
    $("#zoomOutButton").addEventListener("click", () => setZoom(state.zoom - 0.1));
    $("#resetViewButton").addEventListener("click", () => {
      setZoom(window.innerWidth <= 700 ? 0.68 : 1);
      $("#boardViewport").scrollTo({ left: 0, top: 0, behavior: "smooth" });
    });

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
    setZoom(window.innerWidth <= 700 ? 0.68 : 1);
  }

  init();
})();
