// Function to parse frontmatter and content from markdown
function parseMd(markdown) {
    const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return null;

    const frontMatter = match[1];
    const content = match[2].trim();
    
    // Parse frontmatter
    const metadata = {};
    frontMatter.split('\n').forEach(line => {
        const [key, ...value] = line.split(':');
        if (key && value) {
            metadata[key.trim()] = value.join(':').trim();
        }
    });

    return { metadata, content };
}

// Function to format date for display
function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit'
    }) + ' ' + date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    // DOM elements
    const postList = document.querySelector('.post-list-container');
    const postViewer = document.querySelector('.post-viewer');
    const statusCount = document.querySelector('.status-count');

    // Load and parse posts
    async function loadPosts() {
        try {
            // Get all markdown files from the posts directory
            const response = await fetch('/posts/');
            const html = await response.text();
            
            // Create a temporary element to parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Find all links that end with .md
            const mdFiles = Array.from(doc.querySelectorAll('a'))
                .filter(a => a.href.endsWith('.md'))
                .map(a => a.href.split('/').pop());
            
            // Load and parse each markdown file
            const posts = await Promise.all(mdFiles.map(async file => {
                const response = await fetch(`/posts/${file}`);
                const markdown = await response.text();
                const parsed = parseMd(markdown);
                if (!parsed) return null;

                return {
                    id: file.replace('.md', ''),
                    title: parsed.metadata.title,
                    date: parsed.metadata.date,
                    content: parsed.content
                };
            }));

            return posts.filter(post => post !== null).sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            );
        } catch (error) {
            console.error('Error loading posts:', error);
            return [];
        }
    }

    // Render posts
    async function renderPosts() {
        const posts = await loadPosts();
        
        // Clear existing posts
        postList.innerHTML = '';
        
        // Add posts
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <div class="post-title">${post.title}</div>
                <div class="post-date">${formatDate(post.date)}</div>
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
        const formattedDate = new Date(post.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });

        const header = `Subject: ${post.title}\nDate: ${formattedDate}\n\n`;
        const content = post.content.split('\n').map(line => line.trim()).join('\n');

        postViewer.innerHTML = `
            <div class="viewer-content" style="white-space: pre-wrap; font-family: 'W95FA', monospace;">${header}${content}</div>
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