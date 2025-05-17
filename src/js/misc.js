fetch('/misc.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('misc-container');

    const item = document.createElement('div');
    item.className = 'misc-item';

    const title = document.createElement('h2');
    title.textContent = data.title;

    const link = document.createElement('a');
    link.href = `${data.filename}`;
    link.textContent = "->";
    link.className = "post-link";

    item.appendChild(title);
    item.appendChild(link);
    container.appendChild(item);
  })
  .catch(err => console.error("Failed to load misc.json", err));
