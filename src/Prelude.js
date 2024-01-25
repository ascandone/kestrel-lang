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

function println(str) {
  return new Task((resolve) => {
    console.log(str);
    resolve(null);
    return undefined;
  });
}
