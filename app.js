
(() => {
  
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  const LS_KEY = 'todo_app_tasks';


  const style = document.createElement('style');
  style.textContent = `
  

  :root {
    --bg: #0e0c14;
    --card: #1b1823;
    --accent: #8b5cf6;
    --accent-hover: #a78bfa;
    --border: #2d2a38;
    --text: #e2e8f0;
    --muted: #8a8f9e;
    --success: #22c55e;
    --radius: 12px;
    --shadow: 0 0 18px rgba(139, 92, 246, 0.15);
    --shadow-hover: 0 0 24px rgba(139, 92, 246, 0.25);
    
  }

  
  * {
    box-sizing: border-box;
    transition: all 0.25s ease;
  }

  html, body {
    height: 100%;
    margin: 0;
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
  }

  .app {
    max-width: 900px;
    margin: 50px auto;
    padding: 0 16px;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  h1 {
    font-family: 'Cinzel', serif;
    font-size: 1.8rem;
    letter-spacing: 1px;
    color: var(--accent);
    text-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
    margin: 0;
  }

  .card {
    background: var(--card);
    border-radius: var(--radius);
    padding: 20px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }

  .form-inline {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  input[type='text'], input[type='date'], select, .search {
    padding: 8px 12px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    font-size: 0.95rem;
    background: #15121e;
    color: var(--text);
    outline: none;
  }

  input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
  }

  button {
    cursor: pointer;
    border: none;
    border-radius: var(--radius);
    padding: 8px 14px;
    font-size: 0.9rem;
    font-weight: 500;
    background: var(--accent);
    color: #fff;
    box-shadow: var(--shadow);
  }

  button:hover {
    background: var(--accent-hover);
    box-shadow: var(--shadow-hover);
    transform: translateY(-1px);
  }

  .btn-ghost {
    background: transparent;
    color: var(--accent);
    border: 1px solid rgba(139, 92, 246, 0.4);
    box-shadow: none;
  }

  .btn-ghost:hover {
    background: rgba(139, 92, 246, 0.1);
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.2);
  }

  .small {
    font-size: 0.85rem;
    padding: 6px 10px;
  }

  .filters {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .task {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-radius: var(--radius);
    background: #181520;
    border: 1px solid var(--border);
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
  }

  .task:hover {
    background: #1f1a2b;
    box-shadow: 0 0 16px rgba(139, 92, 246, 0.2);
    transform: translateY(-2px);
  }

  .task.dragging {
    opacity: 0.6;
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
  }

  .task.completed {
    opacity: 0.6;
    text-decoration: line-through;
    border-color: rgba(34, 197, 94, 0.3);
  }

  .task.completed .title {
    color: var(--success);
  }

  .task .title {
    flex: 1;
    margin: 0 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .task .meta {
    font-size: 0.8rem;
    color: var(--muted);
  }

  .actions {
    display: flex;
    gap: 6px;
  }

  .no-tasks {
    text-align: center;
    color: var(--muted);
    padding: 16px;
  }

  footer {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    color: var(--muted);
    font-size: 0.8rem;
  }

  @media (max-width: 640px) {
    .controls {
      flex-direction: column;
      align-items: stretch;
    }
    .form-inline {
      flex-direction: column;
      align-items: stretch;
    }
  }
  `;
  document.head.appendChild(style);


  
  let tasks = []; 
  let filter = 'all'; 
  let sortAsc = true;
  let searchTerm = '';

  
  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  }
  function load() {
    try{
      const raw = localStorage.getItem(LS_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    }catch(e){ tasks = []; }
  }

  
  const app = document.createElement('main');
  app.className = 'app';

  
  const container = document.createElement('section');
  container.className = 'card';

  
  const controls = document.createElement('div');
  controls.className = 'controls';


  const form = document.createElement('form');
  form.className = 'form-inline';
  form.addEventListener('submit', e => e.preventDefault());

  const inputTitle = document.createElement('input');
  inputTitle.type = 'text'; inputTitle.placeholder = 'Новая задача'; inputTitle.required = true;
  const inputDate = document.createElement('input');
  inputDate.type = 'date';

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Добавить';
  addBtn.type = 'button';
  addBtn.addEventListener('click', () => {
    const t = inputTitle.value.trim();
    if(!t) return inputTitle.focus();
    const d = inputDate.value || null;
    const newTask = {id: uid(), title: t, date: d, done: false, createdAt: new Date().toISOString()};
    tasks.push(newTask);
    inputTitle.value = '';
    inputDate.value = '';
    save();
    render();
    inputTitle.focus();
  });

  form.append(inputTitle, inputDate, addBtn);

 
  const filtersWrap = document.createElement('div');
  filtersWrap.className = 'filters';

  const selectFilter = document.createElement('select');
  selectFilter.className = 'select small';
  ['all','active','done'].forEach(v => {
    const o = document.createElement('option');
    o.value = v; o.textContent = ({all:'Все',active:'Невыполнено',done:'Выполнено'})[v];
    selectFilter.appendChild(o);
  });
  selectFilter.value = filter;
  selectFilter.addEventListener('change', () => { filter = selectFilter.value; render(); });

  
  let sortEnabled = true; 

  const sortBtn = document.createElement('button');
  sortBtn.className = 'btn-ghost small';
  sortBtn.type = 'button';

  function updateSortLabel() {
    if (!sortEnabled) {
      sortBtn.textContent = 'Сортировка: выкл.';
    } else {
      sortBtn.textContent = sortAsc
        ? 'Сортировать: по дате ↑'
        : 'Сортировать: по дате ↓';
    }
  }

  updateSortLabel();

  sortBtn.addEventListener('click', (e) => {
    
    if (e.ctrlKey) {
      sortAsc = !sortAsc;
    } else {
      
      sortEnabled = !sortEnabled;
    }
    updateSortLabel();
    render();
  });


  const searchInput = document.createElement('input');
  searchInput.type = 'text'; searchInput.placeholder = 'Поиск по названию'; searchInput.className = 'search';
  searchInput.addEventListener('input', e => { searchTerm = e.target.value.trim().toLowerCase(); render(); });

  filtersWrap.append(selectFilter, sortBtn, searchInput);

  controls.append(form, filtersWrap);
  container.appendChild(controls);

  
  const listWrap = document.createElement('div');
  listWrap.className = 'task-list';
  listWrap.id = 'taskList';
  container.appendChild(listWrap);

  
  const footer = document.createElement('div');
  footer.style.marginTop = '12px';
  const clearBtn = document.createElement('button');
  clearBtn.className = 'small btn-ghost';
  clearBtn.type = 'button';
  clearBtn.textContent = 'Удалить все выполненные';
  clearBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.done);
    save(); render();
  });
  footer.appendChild(clearBtn);
  container.appendChild(footer);

  app.appendChild(container);
  document.body.appendChild(app);

  
  function formatDate(d){ if(!d) return '—'; const dt = new Date(d); if(isNaN(dt)) return '—'; return dt.toLocaleDateString(); }

  function render(){
    
    let list = [...tasks];
    if(filter === 'active') list = list.filter(t => !t.done);
    if(filter === 'done') list = list.filter(t => t.done);
    if(searchTerm) list = list.filter(t => t.title.toLowerCase().includes(searchTerm));
    if (sortEnabled) {
  list.sort((a, b) => {
    const ad = a.date || '';
    const bd = b.date || '';
    if (ad === bd) return 0;
    if (!ad) return 1;
    if (!bd) return -1;
    return sortAsc ? ad.localeCompare(bd) : bd.localeCompare(ad);
  });
}


    listWrap.replaceChildren();
    if(list.length === 0){
      const no = document.createElement('div'); no.className = 'no-tasks'; no.textContent = 'Пока что задач нет	  ┐(︶▽︶)┌'; listWrap.appendChild(no); return;
    }

    list.forEach((task, index) => {
      const item = document.createElement('div');
      item.className = 'task';
      item.draggable = true;
      item.dataset.id = task.id;

      if(task.done) item.classList.add('completed');

      
      item.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', task.id);
        item.classList.add('dragging');
      });
      item.addEventListener('dragend', () => { item.classList.remove('dragging'); });

      item.addEventListener('dragover', e => { e.preventDefault(); const after = getDragAfterElement(listWrap, e.clientY); if(after == null){ listWrap.appendChild(item); } else { listWrap.insertBefore(item, after); } });
      item.addEventListener('drop', e => { e.preventDefault();
        const ids = Array.from(listWrap.children).filter(n => n.dataset && n.dataset.id).map(n => n.dataset.id);
       
        tasks = ids.map(id => tasks.find(t => t.id === id)).filter(Boolean);
        save(); render();
      });

      
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = task.done;
      cb.addEventListener('change', () => { task.done = cb.checked; save(); render(); });

      const titleWrap = document.createElement('div'); titleWrap.className = 'title';
      const tname = document.createElement('div'); tname.textContent = task.title; tname.className = 'task-title';
      const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = `Срок: ${formatDate(task.date)} · добавлено ${new Date(task.createdAt).toLocaleString()}`;
      titleWrap.append(tname, meta);

      const actions = document.createElement('div'); actions.className = 'actions';

      const editBtn = document.createElement('button'); editBtn.className = 'small btn-ghost'; editBtn.type = 'button'; editBtn.textContent = 'Редакт.';
      editBtn.addEventListener('click', () => {
        startEdit(task.id);
      });

      const delBtn = document.createElement('button'); delBtn.className = 'small btn-ghost'; delBtn.type = 'button'; delBtn.textContent = 'Удалить';
      delBtn.addEventListener('click', () => {
        if(confirm('Удалить задачу?')){
          tasks = tasks.filter(t => t.id !== task.id); save(); render();
        }
      });

     
      item.append(cb, titleWrap, actions);
      actions.append(editBtn, delBtn);
      listWrap.appendChild(item);
    });
  }

  
  function getDragAfterElement(container, y){
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if(offset < 0 && offset > closest.offset){
        return {offset: offset, element: child};
      } else return closest;
    }, {offset: Number.NEGATIVE_INFINITY}).element;
  }


  function startEdit(id){
    const task = tasks.find(t => t.id === id); if(!task) return;
    
    const node = listWrap.querySelector(`[data-id='${id}']`);
    if(!node) return;
    node.replaceChildren();
    node.classList.remove('completed');

    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = task.done;
    cb.addEventListener('change', () => { task.done = cb.checked; });

    const titleWrap = document.createElement('div'); titleWrap.className = 'title';
    const titleInput = document.createElement('input'); titleInput.type = 'text'; titleInput.value = task.title; titleInput.style.width = '100%';
    const dateInput = document.createElement('input'); dateInput.type = 'date'; dateInput.value = task.date || '';

    titleWrap.append(titleInput, dateInput);

    const actions = document.createElement('div'); actions.className = 'actions';
    const saveBtn = document.createElement('button'); saveBtn.className = 'small'; saveBtn.textContent = 'Сохранить';
    const cancelBtn = document.createElement('button'); cancelBtn.className = 'small btn-ghost'; cancelBtn.textContent = 'Отмена';

    saveBtn.addEventListener('click', () => {
      const newTitle = titleInput.value.trim();
      const newDate = dateInput.value || null;
      if(!newTitle){ alert('Заголовок не может быть пустым'); titleInput.focus(); return; }
      task.title = newTitle; task.date = newDate; task.done = cb.checked; save(); render();
    });
    cancelBtn.addEventListener('click', () => render());

    actions.append(saveBtn, cancelBtn);
    node.append(cb, titleWrap, actions);
  }

  
  load(); render();
})();
