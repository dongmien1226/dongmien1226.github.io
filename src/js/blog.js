document.addEventListener("DOMContentLoaded", () => {
    const postContainer = document.getElementById("post-container");
    if (!postContainer) return;

    const params = new URLSearchParams(window.location.search);
    const filename = params.get("post");

    if (!filename) {
        postContainer.innerHTML = "<h2>Post not found</h2>";
        return;
    }

    // Load post metadata from posts.json
    fetch("src/js/posts.json")
        .then((res) => {
            if (!res.ok) throw new Error("Failed to load posts.json");
            return res.json();
        })
        .then((posts) => {
            const postMeta = posts.find(p => p.filename === filename);
            if (!postMeta) throw new Error("Post metadata not found");

            return fetch(`posts/${filename}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to load markdown file");
                    return res.text();
                })
                .then(markdown => {
                    const htmlContent = marked.parse(markdown); // uses marked.js to convert markdown to HTML
                    const formattedDate = new Date(postMeta.date).toLocaleDateString();

                    const tagsHTML = postMeta.tags.map(tag =>
                        `<p class="tag">${tag}</p>`
                    ).join(' ');

                    postContainer.innerHTML = `
                        <p class="post-date">Published on: ${formattedDate}</p>
                        <div class="tags-container">${tagsHTML}</div>
                        ${htmlContent}
                    `;

                    // Add general tags at the bottom
                    if (postMeta.generalTags && postMeta.generalTags.length > 0) {
                        const tagsContainer = document.createElement("div");
                        tagsContainer.classList.add("tags-container");

                        tagsContainer.innerHTML = `
                            <h3>All tags:</h3>
                            <ul class="tags-list">
                                ${postMeta.generalTags.map(tag =>
                                    `<li><a href="./archive.html?tag=${tag}">${tag}</a></li>`
                                ).join('')}
                            </ul>
                        `;

                        postContainer.appendChild(tagsContainer);
                    }
                });
        })
        .catch((err) => {
            console.error("Error fetching post:", err);
            postContainer.innerHTML = "<h2>Failed to load post</h2>";
        });
});
