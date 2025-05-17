document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("markdown-viewer");
  const listArea = document.getElementById("misc-container");

  const params = new URLSearchParams(window.location.search);
  const file = params.get('file');

  if (file) {
    // View mode: display the markdown post
    fetch(`${file}`)
      .then(res => {
        if (!res.ok) throw new Error('Markdown file not found');
        return res.text();
      })
      .then(md => {
        viewer.innerHTML = `
          <div class="blog-post">
            <button class="back-button" onclick="window.location.href='/misc.html'">← Back to list</button>
            ${marked.parse(md)}
          </div>
        `;
        container.style.display = 'none';
        viewer.style.display = 'block';
      })
      .catch(err => {
        viewer.innerHTML = '<p class="error">⚠️ Failed to load the article.</p>';
        container.style.display = 'none';
        viewer.style.display = 'block';
        console.error(err);
      });

    return;
  }

  fetch("./js/misc.json")
    .then((res) => res.json())
    .then((data) => {
      const posts = Array.isArray(data) ? data : [data];
      posts
        .forEach((post) => {
          const item = document.createElement("div");
          item.className = "misc-item";

          const title = document.createElement("h2");
          title.textContent = post.title;

          const link = document.createElement("a");
          link.href = `${post.filename}`;
          link.className = "post-link";
          link.textContent = "=>";

          item.appendChild(title);
          item.appendChild(link);
          listArea.appendChild(item);
        })
        .catch((err) => {
          listArea.innerHTML = `<p class="error">Failed to load misc.json.</p>`;
          console.error(err);
        });
    });
});
