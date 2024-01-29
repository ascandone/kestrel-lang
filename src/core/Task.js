/* eslint-disable @typescript-eslint/no-var-requires */
const { stdin } = require("node:process");
const { createInterface } = require("node:readline");

class Task$Task {
  constructor(run) {
    this.run = run;
  }
}

function Task$task_of(x) {
  return new Task$Task((resolve) => {
    resolve(x);
  });
}

function Task$await(t, f) {
  return new Task$Task((resolveV) => {
    const c1 = t.run((valueA) => {
      const newTask = f(valueA);
      const c2 = newTask.run((valueB) => {
        resolveV(valueB);
        return () => c2?.();
      });
    });
    return () => c1?.();
  });
}

function Task$println(str) {
  return new Task$Task((resolve) => {
    console.log(str);
    resolve(null);
  });
}

function Task$print(str) {
  return new Task$Task((resolve) => {
    process.stdout.write(str);
    resolve(null);
  });
}

function Task$sleep(ms) {
  return new Task$Task((resolve) => {
    const id = setTimeout(resolve, ms, null);
    return () => clearTimeout(id);
  });
}

const Task$readline = new Task$Task((resolve) => {
  const rl = createInterface({ input: stdin });
  rl.question("", (line) => {
    rl.close();
    resolve(line);
  });
  return () => rl.close();
});
