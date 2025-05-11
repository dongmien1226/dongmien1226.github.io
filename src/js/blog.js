document.addEventListener("DOMContentLoaded", () => {
    const postContainer = document.getElementById("post-container");

    // Get the filename of the blog post from the URL query parameters
    const params = new URLSearchParams(window.location.search);
    const filename = params.get("post");

    if (!filename) {
        postContainer.innerHTML = "<h2>Post not found</h2>";
        return;
    }

    // Fetch the blog post content
    fetch(`./api/post/${filename}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to fetch post");
            }
            return res.json();
        })
        .then(({ htmlContent, tags, date, generalTags }) => {
            const formattedDate = new Date(date).toLocaleDateString(); // format the date and time
            const tagsHTML = tags.map(tag => `<p class="tag">${tag}</p>`).join(' ');
            postContainer.innerHTML = `
                <p class="post-date">Published on: ${formattedDate}</p>
                <div class="tags-container">${tagsHTML}</div>
                ${htmlContent}
            `;

            // Add tags at the bottom of the post
            if (tags && tags.length > 0) {
                const tagsContainer = document.createElement("div");
                tagsContainer.classList.add("tags-container");

                tagsContainer.innerHTML = `
                    <h3>All tags:</h3>
                    <ul class="tags-list">
                        ${generalTags.map(tag => `<li><a href="/archive.html?tag=${tag}">${tag}</a></li>`).join('')}
                    </ul>
                `;

                postContainer.appendChild(tagsContainer);
            }
        })
        .catch((err) => {
            console.error("Error fetching post:", err);
            postContainer.innerHTML = "<h2>Failed to load post</h2>";
        });
});