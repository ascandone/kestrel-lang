const { stdin } = require("node:process");
const { createInterface } = require("node:readline");

function int_to_string(x) {
  return x.toString();
}

class Task {
  constructor(run) {
    this.run = run;
  }
}

function task_of(x) {
  return new Task((resolve) => {
    resolve(x);
  });
}

function await(t, f) {
  return new Task((resolveV) => {
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

function println(str) {
  return new Task((resolve) => {
    console.log(str);
    resolve(null);
  });
}

function print(str) {
  return new Task(function print(resolve) {
    process.stdout.write(str);
    resolve(null);
  });
}

const readline = new Task((resolve) => {
  const rl = createInterface({ input: stdin });
  rl.question("", (line) => {
    rl.close();
    resolve(line);
  });
  return () => rl.close();
});
