const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');
const { marked } = require('marked');
const fs = require('fs');
const { error } = require('console');

const port = 3000

let initial_path = path.join(__dirname, "src");
const app = express();

app.use(express.static(initial_path));
app.use(fileupload());

app.use(express.static(path.join(__dirname, "src"))); // Serve static files from the src folder
app.use(express.static(__dirname)); // Serve HTML files from the root directory

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,"index.html"));
});

app.get('/archive', (req, res) => {
    res.sendFile(path.join(__dirname, "archive.html"));
});

app.get('/misc', (req, res) => {
    res.sendFile(path.join(__dirname, "misc.html"));
});

// Upload an image
app.post('/api/upload', (req, res) => {
    if (!req.files || !req.files.image) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    if (image.size > 5 * 1024 * 1024) { // Limit to 5MB
    return res.status(400).json({ error: 'Image size exceeds 5MB.' });
}

    const image = req.files.image;
    const allowedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(image.name).toLowerCase();

    if(!allowedFormats.includes(ext)) {
        return res.status(400).json({ error: 'Unsupported image format.' });
    }

    const uploadPath = path.join(initial_path, 'uploads', image.name);

    image.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to upload image.' });
        }

        res.json({ message: 'Image uploaded successfully.', imageUrl: `/content/${image.name}` });
    });
});

// Get all blog posts
app.get('/api/posts', (req, res) => {
    const contentDir = path.join(initial_path, 'content');
    const uploadsDir = path.join(initial_path, 'uploads');
    const { tag } = req.query; // Get the tag from the query parameter

    fs.readdir(contentDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read content directory.' });
        }

        const supportedImageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

        const posts = files
            .filter(file => file.endsWith('.md'))
            .map(file => {
                const baseFilename = file.replace('.md', '');
                let imageUrl = '/uploads/default.png'; // default image

                for (const format of supportedImageFormats) {
                    const imagePath = path.join(uploadsDir, `${baseFilename}${format}`);
                    if(fs.existsSync(imagePath)) {
                        imageUrl = `/uploads/${baseFilename}${format}`;
                        break;
                    }
                }

                const filePath = path.join(contentDir, file);
                const stats = fs.statSync(filePath);
                const date = stats.mtime;

                // Extract tags from the Markdown file
                const content = fs.readFileSync(filePath, 'utf-8');
                const tagsMatch = content.match(/tags:\s*(.*)/);
                const tags = tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim()) : [];

                const generalTags = ['thm', 'htb', 'dreamhack', 'linux', 'misc'];

                return {
                    title: baseFilename.replace(/-/g, ' '),
                    filename: file,
                    imageUrl,
                    date,
                    tags,
                    generalTags,
                };
            })
            .filter(post => !tag || post.tags.includes(tag))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(posts);
    });
});

// Get a specific blog post
app.get('/api/post/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(initial_path, 'content', filename);

    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'Post not found.' });
            }
            return res.status(500).json({ error: 'Failed to read post content.' });
        }

        const stats = fs.statSync(filePath);
        const date = stats.mtime;

        // extract tags from the markdown file
        const tagsMatch = content.match(/tags:\s*(.*)/);
        const tags = tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim()) : [];

        const generalTags = ['thm', 'overthewire', 'portswigger', 'misc'];
        const cleanedContent = content.replace(/tags:\s*.*\n/, '');
        const htmlContent = marked(cleanedContent);
        res.json({ htmlContent, tags, date, generalTags });
    });

});

// archive
app.get('/api/archive', (req, res) => {
    const contentDir = path.join(initial_path, 'content');

    fs.readdir(contentDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read content directory.' });
        }

        const archive = {};

        files
            .filter(file => file.endsWith('.md'))
            .forEach(file => {
                const filePath = path.join(contentDir, file);
                const content = fs.readFileSync(filePath, 'utf8');

                // Extract tags from the Markdown file
                const tagsMatch = content.match(/tags:\s*(.*)/);
                const tags = tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim()) : [];

                // Add the post to each tag
                tags.forEach(tag => {
                    if (!archive[tag]) {
                        archive[tag] = [];
                    }
                    archive[tag].push({
                        title: file.replace('.md', '').replace(/-/g, ' '),
                        filename: file,
                    });
                });
            });

        res.json(archive);
    });
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(initial_path, 'uploads')));

app.listen(port, () => {
    console.log(`Server running on ${port} . . .`);
});
