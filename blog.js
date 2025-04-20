document.addEventListener('DOMContentLoaded', () => {
    // Sample blog posts data
    const posts = [
        {
            id: 1,
            title: "Welcome to my blog!",
            date: "16:06 19/04/24",
            content: `Subject: Welcome to my blog!
Date: April 19, 2024

Welcome to my retro-styled blog! This interface is inspired by classic email clients 
like Eudora. Feel free to explore the different posts.

Best regards,
Suhail`
        },
        {
            id: 2,
            title: "Building a Retro Blog Interface",
            date: "11:23 19/04/24",
            content: `Subject: Building a Retro Blog Interface
Date: April 19, 2024

I've been working on creating this retro-styled blog interface that mimics the look 
and feel of classic email clients from the Windows 95 era. Here's what I've done:

1. Used the classic Windows 95 color scheme
2. Implemented the characteristic window styling
3. Added familiar UI elements like the menu bar and toolbar
4. Maintained the compact, information-dense layout

The goal was to create a nostalgic yet functional interface that brings back 
memories of the early days of personal computing.

Regards,
Suhail`
        }
    ];

    // DOM elements
    const postList = document.querySelector('.post-list');
    const postViewer = document.querySelector('.post-viewer');
    const statusCount = document.querySelector('.status-count');

    // Render posts
    function renderPosts() {
        // Add posts
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <div class="post-title">${post.title}</div>
                <div class="post-date">${post.date}</div>
            `;
            postElement.addEventListener('click', () => {
                document.querySelectorAll('.post').forEach(p => p.classList.remove('active'));
                postElement.classList.add('active');
                renderPostContent(post);
            });
            postList.appendChild(postElement);
        });
        
        // Update status count
        statusCount.textContent = `${posts.length} message${posts.length !== 1 ? 's' : ''}`;

        // Show first post by default
        if (posts.length > 0) {
            renderPostContent(posts[0]);
            postList.querySelector('.post').classList.add('active');
        } else {
            postViewer.innerHTML = '<div class="viewer-content">No messages available.</div>';
        }
    }

    // Render post content
    function renderPostContent(post) {
        postViewer.innerHTML = `
            <div class="viewer-content">
                ${post.content.split('\n').join('<br>')}
            </div>
        `;
    }

    // Window controls
    document.querySelector('.window-controls').addEventListener('click', (e) => {
        if (e.target.matches('button')) {
            const action = e.target.dataset.action;
            switch (action) {
                case 'minimize':
                    document.querySelector('.blog-window').style.display = 'none';
                    break;
                case 'maximize':
                    document.querySelector('.blog-window').classList.toggle('maximized');
                    break;
                case 'close':
                    window.location.href = 'index.html';
                    break;
            }
        }
    });

    // Initial render
    renderPosts();
}); 