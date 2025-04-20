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
    // Configure marked for security
    marked.setOptions({
        headerIds: false,
        mangle: false,
        headerPrefix: '',
        breaks: true,
        gfm: true,
        sanitize: true
    });

    // DOM elements
    const postList = document.querySelector('.post-list-container');
    const postViewer = document.querySelector('.post-viewer');
    const statusCount = document.querySelector('.status-count');

    // Function to get list of posts from directory
    async function getPostFiles() {
        try {
            const response = await fetch('./posts/');
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = Array.from(doc.querySelectorAll('a'));
            return links
                .map(link => link.getAttribute('href'))
                .filter(href => href && href.endsWith('.md'))
                .map(href => href.split('/').pop());
        } catch (error) {
            console.error('Error getting post files:', error);
            return [];
        }
    }

    // Load and parse posts
    async function loadPosts() {
        try {
            const postFiles = await getPostFiles();
            const posts = await Promise.all(postFiles.map(async file => {
                const response = await fetch(`./posts/${file}`);
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
        posts.forEach((post, index) => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            if (index === 0) postElement.classList.add('active');

            const titleElement = document.createElement('div');
            titleElement.className = 'post-title';
            titleElement.textContent = post.title;

            const dateElement = document.createElement('div');
            dateElement.className = 'post-date';
            const date = new Date(post.date);
            dateElement.textContent = date.toLocaleDateString('en-US', { 
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            postElement.appendChild(titleElement);
            postElement.appendChild(dateElement);
            postList.appendChild(postElement);

            postElement.addEventListener('click', () => {
                // Remove active class from all posts
                document.querySelectorAll('.post').forEach(p => p.classList.remove('active'));
                // Add active class to clicked post
                postElement.classList.add('active');

                // Update viewer
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
        
        // Create a container for the rendered content
        postViewer.innerHTML = `
            <div class="viewer-header" style="font-family: 'W95FA', monospace; white-space: pre-wrap;">${header}</div>
            <div class="viewer-content markdown-content">${marked.parse(post.content)}</div>
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