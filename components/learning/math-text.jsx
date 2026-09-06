import katex from 'katex';
import 'katex/dist/katex.min.css';
export function MathText({ value, block = false }) {
  let html;
  if (value) {
    try {
      html = katex.renderToString(value, {
        throwOnError: false,
        displayMode: block,
        trust: false,
        output: 'htmlAndMathml',
      });
    } catch {}
  }
  return value ? (
    html ? (
      <span
        className={block ? 'math-block' : 'math-inline'}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    ) : (
      <span>{value}</span>
    )
  ) : null;
}
export function Rich({ text = '' }) {
  return (
    <>
      {text
        .split(/(\$[^$]+\$)/g)
        .map((part, i) =>
          part.startsWith('$') ? (
            <MathText key={i} value={part.slice(1, -1)} />
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
    </>
  );
}
