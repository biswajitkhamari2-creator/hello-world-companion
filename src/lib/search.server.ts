export async function searchWeb(query: string, maxResults = 3): Promise<string> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const html = await res.text();
    // Robust regex to match class in any attribute order with single or double quotes
    const snippetMatches = Array.from(html.matchAll(/<a\s+(?:[^>]*?\s+)?class=["']result__snippet["'][^>]*>([\s\S]*?)<\/a>/g));
    const titleMatches = Array.from(html.matchAll(/<a\s+(?:[^>]*?\s+)?class=["']result__url["'][^>]*>([\s\S]*?)<\/a>/g));
    
    const snippets: string[] = [];
    const count = Math.min(maxResults, snippetMatches.length);
    
    for (let i = 0; i < count; i++) {
      const snippet = snippetMatches[i][1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
      const title = titleMatches[i] ? titleMatches[i][1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() : "Search Result";
      if (snippet) {
        snippets.push(`Result ${i + 1}: ${title}\nContext: ${snippet}`);
      }
    }
    
    if (snippets.length === 0) {
      return "No real-time search context found.";
    }
    
    return snippets.join("\n\n");
  } catch (err) {
    console.error("Search verification error:", err);
    return "Search service temporarily unavailable.";
  }
}
