function preprocessHTMLForPDF(html: string): string {
  // Base URL for your deployed application
  const baseURL = 'https://guaranteeth-slides.vercel.app';
  
  // Replace local asset paths with absolute URLs
  // Pattern matches Vite asset paths like /_app/immutable/assets/filename.hash.ext
  html = html.replace(/src="(\/_app\/immutable\/assets\/[^"]+)"/g, `src="${baseURL}$1"`);
  
  // Replace source paths from lib directory (like /src/lib/834.jpg)
  html = html.replace(/src="(\/src\/lib\/[^"]+\.(jpg|jpeg|png|gif|svg|webp))"/gi, `src="${baseURL}$1"`);
  
  // Replace any other relative paths that start with /
  html = html.replace(/src="(\/[^"]+(?<!data:)[^"]*\.(jpg|jpeg|png|gif|svg|webp))"/gi, `src="${baseURL}$1"`);
  
  // Replace background-image URLs in style attributes
  html = html.replace(/url\(["']?(\/_app\/immutable\/assets\/[^)]+)["']?\)/g, `url(${baseURL}$1)`);
  html = html.replace(/url\(["']?(\/src\/lib\/[^)]+\.(jpg|jpeg|png|gif|svg|webp))["']?\)/gi, `url(${baseURL}$1)`);
  html = html.replace(/url\(["']?(\/[^)]+(?<!data:)[^)]*\.(jpg|jpeg|png|gif|svg|webp))["']?\)/gi, `url(${baseURL}$1)`);
  
  // Keep data: URLs as-is (they're already absolute)
  // Keep https: URLs as-is (they're already absolute)
  
  return html;
}



export async function generatePDF(html: string): Promise<Response> {
  // Preprocess HTML to convert local image paths to absolute URLs
  const processedHTML = preprocessHTMLForPDF(html);
  
  return await fetch('https://pdf-gen-pi.vercel.app/api/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html: processedHTML })
  });
}