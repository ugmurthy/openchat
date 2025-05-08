import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import parse from 'html-react-parser';
import 'highlight.js/styles/github.css'; // Still using highlight.js base styling

function MarkdownItRenderer({ 
  markdown, 
  className = '', 
  fontSize = 'text-base', // Tailwind default: 16px
  fontFamily = 'font-sans', // Tailwind default sans-serif
  textColor = 'text-inherit' // Inherits parent color
}) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${
            hljs.highlight(str, { language: lang }).value
          }</code></pre>`;
        } catch (__) {}
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    }
  });

  const html = md.render(markdown);
  const reactElements = parse(html);

  // Combine all Tailwind classes
  const baseClasses = [
    fontSize, // e.g., 'text-sm', 'text-lg'
    fontFamily, // e.g., 'font-sans', 'font-serif'
    textColor, // e.g., 'text-gray-800', 'text-black'
    'leading-relaxed', // Line height
    'break-words', // Word wrap
    'markdown-content' // Custom class for scoping
  ].join(' ');

  return (
    <div className={`${baseClasses} ${className}`}>
      {reactElements}
    </div>
  );
}

// Optional: Add this to your global CSS file for markdown-specific styling
/*
@layer components {
  .markdown-content pre {
    @apply bg-gray-50 p-4 rounded-md overflow-x-auto my-4;
  }
  .markdown-content code {
    @apply bg-gray-50 px-1 py-0.5 rounded font-mono;
  }
  .markdown-content pre code {
    @apply bg-transparent px-0 py-0;
  }
  .markdown-content p {
    @apply mb-4;
  }
  .markdown-content h1 {
    @apply text-3xl mt-6 mb-4 leading-tight;
  }
  .markdown-content h2 {
    @apply text-2xl mt-6 mb-4 leading-tight;
  }
  .markdown-content h3 {
    @apply text-xl mt-6 mb-4 leading-tight;
  }
  .markdown-content h4, .markdown-content h5, .markdown-content h6 {
    @apply text-lg mt-6 mb-4 leading-tight;
  }
}
*/

export default MarkdownItRenderer;
