const desktop=document.getElementById('desktop');
const boot=document.getElementById('boot');
const start=document.getElementById('start');
const menu=document.getElementById('start-menu');
const tasks=document.getElementById('task-buttons');
const toast=document.getElementById('toast');
const contextMenu=document.getElementById('context-menu');
const terminalInput=document.getElementById('terminal-input');
const terminalLog=document.getElementById('terminal-log');
const clock=document.getElementById('clock');

let z=20;
const state={};
const windows=[...document.querySelectorAll('.window')];

window.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{boot?.classList.add('hidden');desktop?.classList.remove('hidden');openApp('about')},900);
  updateClock();
  setInterval(updateClock,1000);
  document.querySelectorAll('[data-app]').forEach(el=>el.addEventListener('click',()=>openApp(el.dataset.app)));
  document.querySelectorAll('[data-action="close"]').forEach(el=>el.addEventListener('click',e=>closeWindow(e.target.closest('.window'))));
  document.querySelectorAll('[data-action="min"]').forEach(el=>el.addEventListener('click',e=>minWindow(e.target.closest('.window'))));
  document.querySelectorAll('[data-action="max"]').forEach(el=>el.addEventListener('click',e=>toggleMax(e.target.closest('.window'))));
  windows.forEach(setupWindow);
  start?.addEventListener('click',e=>{e.stopPropagation();menu?.classList.toggle('open');contextMenu?.classList.remove('open')});
  document.addEventListener('click',e=>{if(menu&&!menu.contains(e.target)&&e.target!==start)menu.classList.remove('open');if(contextMenu&&!contextMenu.contains(e.target))contextMenu.classList.remove('open')});
  desktop?.addEventListener('contextmenu',e=>{if(e.target.closest('.window')||e.target.closest('.taskbar'))return;e.preventDefault();showContext(e.clientX,e.clientY)});
  document.querySelectorAll('[data-context]').forEach(el=>el.addEventListener('click',()=>handleContext(el.dataset.context)));
  terminalInput?.addEventListener('keydown',handleTerminal);
  document.querySelectorAll('[data-project]').forEach(el=>el.addEventListener('dblclick',()=>projectOpen(el.dataset.project)));
  document.querySelectorAll('.desktop-icon').forEach(el=>el.addEventListener('dblclick',()=>openApp(el.dataset.app)));
});

function updateClock(){if(clock)clock.textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});}
function setupWindow(win){
  win.addEventListener('mousedown',()=>focusWindow(win));
  const title=win.querySelector('.titlebar');
  if(!title)return;
  let dragging=false,sx=0,sy=0,ox=0,oy=0;
  title.addEventListener('mousedown',e=>{
    if(e.target.closest('button')||win.classList.contains('maximized')||innerWidth<761)return;
    dragging=true;sx=e.clientX;sy=e.clientY;ox=win.offsetLeft;oy=win.offsetTop;focusWindow(win);e.preventDefault();
  });
  window.addEventListener('mousemove',e=>{
    if(!dragging)return;
    const taskbarH=54;
    const nx=Math.max(4,Math.min(innerWidth-win.offsetWidth-4,ox+e.clientX-sx));
    const ny=Math.max(4,Math.min(innerHeight-win.offsetHeight-taskbarH,oy+e.clientY-sy));
    win.style.left=`${nx}px`;win.style.top=`${ny}px`;
  });
  window.addEventListener('mouseup',()=>dragging=false);
}
function openApp(app){
  const win=document.querySelector(`[data-window="${app}"]`);if(!win)return;
  if(!state[app]){state[app]={min:false};placeWindow(win,app);createTask(app)}
  win.classList.add('open');state[app].min=false;focusWindow(win);menu?.classList.remove('open');contextMenu?.classList.remove('open');
  if(app==='terminal')setTimeout(()=>terminalInput?.focus(),50);
}
function placeWindow(win,app){
  const w=win.offsetWidth,h=win.offsetHeight;
  if(innerWidth<761){win.style.left='8px';win.style.top='8px';return;}
  const pos={about:[Math.round(innerWidth*.20),Math.round(innerHeight*.13)],projects:[Math.round(innerWidth*.28),Math.round(innerHeight*.16)],terminal:[Math.round(innerWidth*.15),Math.round(innerHeight*.18)],code:[Math.round(innerWidth*.35),Math.round(innerHeight*.11)],readme:[Math.round(innerWidth*.42),Math.round(innerHeight*.27)],contact:[Math.round(innerWidth*.47),Math.round(innerHeight*.34)],browser:[Math.round(innerWidth*.22),Math.round(innerHeight*.13)]};
  const p=pos[app]||[120,90];win.style.left=`${Math.max(8,Math.min(innerWidth-w-8,p[0]))}px`;win.style.top=`${Math.max(8,Math.min(innerHeight-h-62,p[1]))}px`;win.style.zIndex=++z;win.classList.add('open');
}
function focusWindow(win){if(!win)return;win.style.zIndex=++z;document.querySelectorAll('.task-button').forEach(b=>b.classList.remove('active'));document.querySelector(`.task-button[data-task="${win.dataset.window}"]`)?.classList.add('active');}
function createTask(app){
  const existing=document.querySelector(`.task-button[data-task="${app}"]`);if(existing)return;
  const title=document.querySelector(`[data-window="${app}"] .titlebar>span`)?.textContent.trim()||app;
  const b=document.createElement('button');b.className='task-button';b.dataset.task=app;b.textContent=title;
  b.addEventListener('click',()=>{const win=document.querySelector(`[data-window="${app}"]`);if(!win)return;if(state[app]?.min||!win.classList.contains('open')){win.classList.add('open');state[app].min=false;focusWindow(win)}else if(Number(win.style.zIndex)===z)minWindow(win);else focusWindow(win)});
  tasks?.appendChild(b);
}
function closeWindow(win){if(!win)return;const app=win.dataset.window;win.classList.remove('open','maximized');state[app]={min:false};document.querySelector(`.task-button[data-task="${app}"]`)?.remove();toastMsg(`${app} closed`);}
function minWindow(win){if(!win)return;const app=win.dataset.window;win.classList.remove('open');state[app]={min:true};document.querySelector(`.task-button[data-task="${app}"]`)?.classList.remove('active');}
function toggleMax(win){if(!win)return;win.classList.toggle('maximized');if(win.classList.contains('maximized')){win.dataset.prevLeft=win.style.left;win.dataset.prevTop=win.style.top;win.style.left='0';win.style.top='0'}else{win.style.left=win.dataset.prevLeft||'120px';win.style.top=win.dataset.prevTop||'80px'}focusWindow(win)}
function toastMsg(msg){if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(toast._timer);toast._timer=setTimeout(()=>toast.classList.remove('show'),1700)}
function showContext(x,y){if(!contextMenu)return;contextMenu.style.left=`${Math.min(x,innerWidth-180)}px`;contextMenu.style.top=`${Math.min(y,innerHeight-180)}px`;contextMenu.classList.add('open')}
function handleContext(action){contextMenu?.classList.remove('open');if(action==='refresh'){toastMsg('Desktop refreshed');return}openApp(action)}
function projectOpen(name){const data={tkcode:'tkcode opened — you are looking at it.',caveman:'Caveman — experimental programming language.',chicken:'Chicken — language experiment.',ai:'AI Lab — self-hosted AI experiments.'};if(name==='tkcode')window.open('https://github.com/CoderKoda/tkcode','_blank','noopener');else toastMsg(data[name]||`${name} opened`)}
function print(text){if(!terminalLog)return;const div=document.createElement('div');div.textContent=text;terminalLog.appendChild(div);terminalLog.scrollTop=terminalLog.scrollHeight;}
function clearTerminal(){if(terminalLog)terminalLog.innerHTML='';}
function handleTerminal(e){
  if(e.key!=='Enter')return;
  const raw=terminalInput.value.trim();terminalInput.value='';if(!raw)return;
  print(`koda@kodaos:~$ ${raw}`);
  const [cmd,...args]=raw.split(/\s+/);const value=args.join(' ');
  if(cmd==='help')print('Commands: help, about, projects, contact, github, code, readme, browser, clear, date, echo, ls, pwd, whoami, neofetch, open <app>, exit');
  else if(cmd==='about')openApp('about');
  else if(cmd==='projects'||cmd==='ls')openApp('projects');
  else if(cmd==='contact')openApp('contact');
  else if(cmd==='code')openApp('code');
  else if(cmd==='readme')openApp('readme');
  else if(cmd==='browser')openApp('browser');
  else if(cmd==='github')window.open('https://github.com/CoderKoda','_blank','noopener');
  else if(cmd==='clear')clearTerminal();
  else if(cmd==='date')print(new Date().toString());
  else if(cmd==='pwd')print('C:\\Users\\Koda');
  else if(cmd==='whoami')print('Koda — developer, tinkerer, builder.');
  else if(cmd==='neofetch')print('KodaOS\nBrowser: '+navigator.userAgent.split(') ')[0].replace(/^.*\\(/,'')+'\nShell: koda-shell\nProjects: 4\nStatus: building');
  else if(cmd==='echo')print(value);
  else if(cmd==='open'){if(value==='github')window.open('https://github.com/CoderKoda','_blank','noopener');else openApp(value||'readme');}
  else if(cmd==='exit')minWindow(document.querySelector('[data-window="terminal"]'));
  else print(`command not found: ${cmd}`);
}
