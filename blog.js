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
    const postListContainer = document.querySelector('.post-list-container');
    const postList = document.querySelector('.post-list');
    const postViewer = document.querySelector('.post-viewer');
    const statusCount = document.querySelector('.status-count');

    // Function to get list of posts from directory
    async function getPostFiles() {
        console.log('Attempting to fetch index.json...');
        try {
            const response = await fetch('./posts/index.json');
            console.log('Index.json response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const posts = await response.json();
            console.log('Successfully loaded index.json:', posts);
            return posts;
        } catch (error) {
            console.error('Error getting post files:', error);
            return [];
        }
    }

    // Load and parse posts
    async function loadPosts() {
        console.log('Starting to load posts...');
        try {
            const postFiles = await getPostFiles();
            console.log('Got post files:', postFiles);
            const posts = await Promise.all(postFiles.map(async postInfo => {
                console.log('Fetching post:', postInfo.file);
                const response = await fetch(`./posts/${postInfo.file}`);
                console.log(`Response for ${postInfo.file}:`, response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${postInfo.file}`);
                }
                const markdown = await response.text();
                const parsed = parseMd(markdown);
                if (!parsed) {
                    console.log(`Failed to parse markdown for ${postInfo.file}`);
                    return null;
                }
                console.log(`Successfully loaded post: ${postInfo.file}`);
                return {
                    title: parsed.metadata.title,
                    date: parsed.metadata.date,
                    content: parsed.content
                };
            }));

            const filteredPosts = posts.filter(post => post !== null);
            console.log('Final processed posts:', filteredPosts);
            return filteredPosts.sort((a, b) => 
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
        postListContainer.innerHTML = '';
        
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
                day: '2-digit',
                year: 'numeric'
            }).replace(', ', ' ');

            postElement.appendChild(titleElement);
            postElement.appendChild(dateElement);
            postListContainer.appendChild(postElement);

            postElement.addEventListener('click', () => {
                // Remove active class from all posts
                document.querySelectorAll('.post').forEach(p => p.classList.remove('active'));
                // Add active class to clicked post
                postElement.classList.add('active');

                // Update viewer
                renderPostContent(post);
            });
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
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
        
        // Create a container for the rendered content
        postViewer.innerHTML = `
            <div class="viewer-header">
                <div class="subject">${post.title}</div>
                <div class="date">${formattedDate}</div>
            </div>
            <div class="viewer-content markdown-content">${marked.parse(post.content)}</div>
        `;
    }

    // Window controls and toolbar actions
    document.addEventListener('click', (e) => {
        // Handle window controls
        if (e.target.matches('.window-controls button')) {
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
        
        // Handle toolbar buttons
        if (e.target.matches('.tool-button')) {
            const action = e.target.dataset.action;
            if (action === 'home') {
                window.location.href = 'index.html';
            }
        }
    });

    // Add divider functionality
    let isDragging = false;
    let startX, startWidth;

    postList.addEventListener('mousedown', function(e) {
        const rect = postList.getBoundingClientRect();
        const isClickOnDivider = e.clientX >= rect.right - 4 && e.clientX <= rect.right;
        
        if (isClickOnDivider) {
            isDragging = true;
            startX = e.pageX;
            startWidth = postList.offsetWidth;
            
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        const width = startWidth + (e.pageX - startX);
        if (width > 100 && width < window.innerWidth - 200) {
            postList.style.width = width + 'px';
        }
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    });

    // Initial render
    renderPosts();
}); 