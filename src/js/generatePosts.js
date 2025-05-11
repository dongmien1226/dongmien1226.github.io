const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { title } = require('process');

const contentDir = path.join(__dirname, 'src/content');
const outputDir = path.join(__dirname, 'src/posts');

if(!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read all markdown files and convert them to JSON
fs.readdir(contentDir, (err, files) => {
    if(err) {
        console.error('Failed to read content directory: ', err);
        return;
    }

    files
    .filter(file => file.endsWith('.md'))
    .forEach(file => {
        const filePath = path.join(contentDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Extract metadata and content
        const tagsMatch = content.match(/tags:\s*(.*)/);
        const tags = tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim()) : [];
        const cleanedContent = content.replace(/tags:\s*.*\n/, '');
        const htmlContent = marked(cleanedContent);

        const post = {
            title: file.replace('.md', '').replace(/-/g, ' '),
            filename: file,
            tags,
            htmlContent,
        };

        // Write the JSON file
        const outputFilePath = path.join(outputDir, `${file.replace('.md', 'json')}`);
        fs.writeFileSync(outputFilePath, JSON.stringify(post, null, 2));
        console.log(`Generated: ${outputFilePath}`);
    });
});
