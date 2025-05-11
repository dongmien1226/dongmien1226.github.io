//# This file contains the JavaScript code for the home page of the website.
// It includes functionality for a hamburger menu and a button to toggle the menu visibility.
const hamburger = document.querySelector(".hamburger");
const linksContainer = document.querySelector(".links-container");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  linksContainer.classList.toggle("active");
});

// make display posts and pagination
document.addEventListener("DOMContentLoaded", () => {
  const postsContainer = document.querySelector("#posts-container");
  const prevPageBtn = document.querySelector(".prev-page");
  const nextPageBtn = document.querySelector(".next-page");
  const pageInfo = document.querySelector(".page-info");

  let currentPage = 1;
  const postsPerPage = 10;

  // Fetch and display posts
  function fetchPosts(page) {
    fetch("src/api/posts")
      .then((res) => res.json())
      .then((posts) => {
        // console.log("Fetched posts:", posts); - debug

        const totalPages = Math.ceil(posts.length / postsPerPage);
        const start = (page - 1) * postsPerPage;
        const end = start + postsPerPage;
        const paginatedPosts = posts.slice(start, end);

        postsContainer.innerHTML = "";

        paginatedPosts.forEach((post) => {
          const blogCard = document.createElement("div");
          blogCard.classList.add("blog-card");
          const formattedDate = new Date(post.date).toLocaleDateString(); // Format the date

          const tagsHTML = post.tags.map(tag => `<p class="tag">${tag}</p>`).join(' ');

          blogCard.innerHTML = `
                <img src="${post.imageUrl}" alt="${post.title}" class="blog-image">
                <h2>${post.title}</h2>
                <div class="tags-container">${tagsHTML}</div>
                <a href="/blog.html?post=${post.filename}" class="btn dark">Read more</a>
          `;

          postsContainer.appendChild(blogCard);
        });

        pageInfo.textContent = `Page ${page} of ${totalPages}`;
        prevPageBtn.disabled = page === 1;
        nextPageBtn.disabled = page === totalPages;
      })
      .catch((err) => console.error("Error fetching posts:", err));
  }

  // Event listeners for pagination buttons
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchPosts(currentPage);
    }
  });

  nextPageBtn.addEventListener("click", () => {
    currentPage++;
    fetchPosts(currentPage);
  });

  // Initial fetch
  fetchPosts(currentPage);
});
