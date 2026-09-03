const lines = [
  ["git status", "On branch main — working tree clean."],
  ["python main.py", "Hello, world. Let's build something."],
  ["npm run dev", "Local server started on :3000."],
  ["echo $STATUS", "building..."],
];

const typed = document.getElementById("typed");
const output = document.getElementById("terminal-output");

let index = 0;
let timer;

function cycleTerminal() {
  const [command, result] = lines[index];
  typed.textContent = "";
  output.textContent = "";
  let i = 0;

  clearInterval(timer);
  timer = setInterval(() => {
    typed.textContent = command.slice(0, i++);
    if (i > command.length) {
      clearInterval(timer);
      setTimeout(() => {
        output.textContent = result;
        index = (index + 1) % lines.length;
        setTimeout(cycleTerminal, 2600);
      }, 350);
    }
  }, 55);
}

window.addEventListener("load", () => {
  setTimeout(cycleTerminal, 600);
});
