type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "code"; text: string };

export function parseArticleBody(source: string): Block[] {
  const chunks = source.replace(/\r\n/g, "\n").split(/```/);
  const blocks: Block[] = [];

  chunks.forEach((chunk, index) => {
    if (index % 2 === 1) {
      const code = chunk.replace(/^\w+\n/, "").trim();
      if (code) blocks.push({ type: "code", text: code });
      return;
    }
    for (const part of chunk.split(/\n{2,}/)) {
      const text = part.trim();
      if (!text) continue;
      if (text.startsWith("## ")) {
        blocks.push({ type: "h2", text: text.slice(3).trim() });
        continue;
      }
      const lines = text.split("\n").map((line) => line.trim());
      if (lines.every((line) => line.startsWith("- "))) {
        blocks.push({
          type: "ul",
          items: lines.map((line) => line.slice(2).trim()),
        });
        continue;
      }
      blocks.push({ type: "p", text: lines.join(" ") });
    }
  });

  return blocks;
}

export function ArticleBody({ body }: { body: string }) {
  const blocks = parseArticleBody(body);
  return (
    <div className="article-body">
      {blocks.map((block, index) => {
        if (block.type === "h2") return <h2 key={index}>{block.text}</h2>;
        if (block.type === "ul") {
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "code") {
          return (
            <pre key={index}>
              <code dir="ltr">{block.text}</code>
            </pre>
          );
        }
        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
}
