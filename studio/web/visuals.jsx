/* Inline SVG exposes its mathematical description through image semantics. */
/* oxlint-disable jsx-a11y/prefer-tag-over-role */
import { useMemo, useState } from 'react';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
import { substitute } from '../shared/substitution.mjs';
import { MathText } from '../../components/learning/math-text.jsx';
import {
  quadratic,
  polynomialTex,
  fmt,
  plotBounds,
} from '../../lib/visual-math.js';

export { MathText };
export function Rich({ text = '' }) {
  return text
    .split(
      /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([^\n]*?\\\)|(?<!\\)\$[^$\n]+?(?<!\\)\$|\*\*[^*]+\*\*|(?:^|\n)[ \t]*---[ \t]*(?=\n|$))/g,
    )
    .map((part, i) =>
      part.startsWith('$$') || part.startsWith('\\[') ? (
        <MathText key={i} value={part.slice(2, -2)} block />
      ) : part.startsWith('\\(') ? (
        <MathText key={i} value={part.slice(2, -2)} />
      ) : part.startsWith('$') && part.endsWith('$') && part.length > 1 ? (
        <MathText key={i} value={part.slice(1, -1)} />
      ) : part.startsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : part.trim() === '---' ? (
        <span key={i} className="rich-divider" />
      ) : (
        <span key={i}>{part}</span>
      ),
    );
}
export function PrismMark({ large = false }) {
  return (
    <span className={`prism-mark ${large ? 'large' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 40 40">
        <path d="M20 5 36 32H4Z" fill="currentColor" />
        <path d="m20 5 5 27H4Z" fill="#ffffff" opacity=".3" />
        <path d="m20 5 5 27h11Z" fill="#000000" opacity=".15" />
      </svg>
    </span>
  );
}
export function HeroGraph() {
  return (
    <div className="hero-graph" aria-hidden="true">
      <div className="graph-paper" />
      <svg viewBox="0 0 500 360">
        <path className="axis-line" d="M40 230H470M170 25V330" />
        <path
          d="M55 45Q235 455 415 45"
          fill="none"
          stroke="#305e4b"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="118" cy="167" r="8" fill="#e6aa60" />
        <circle cx="352" cy="167" r="8" fill="#e6aa60" />
        <path
          d="m465 225 7 5-7 5M165 32l5-7 5 7"
          fill="none"
          stroke="#9dada2"
          strokeWidth="2"
        />
      </svg>
      <div className="floating-note note-equation">
        <MathText value="x^2-5x+6=0" />
      </div>
      <div className="floating-note note-idea">
        <span className="small-spark">✦</span> Different paths.
        <br />
        Your own understanding.
      </div>
      <div className="graph-tag">A LITTLE CURIOSITY GOES A LONG WAY</div>
    </div>
  );
}

export function Substitution({ component, onExplore, disabled }) {
  const [input, setInput] = useState(String(component.candidate));
  const value = Number(input);
  const valid =
    input.trim() !== '' && Number.isFinite(value) && Math.abs(value) <= 1000;
  const x = valid ? value : 0;
  const { a, b, c } = component.coefficients;
  const calculation = substitute(component.coefficients, x);
  const { terms, totals, result, isRoot } = calculation;
  const low = Math.min(...totals),
    high = Math.max(...totals),
    span = Math.max(4, high - low);
  const scale = (n) => 60 + ((n - low + span * 0.12) / (span * 1.24)) * 680;
  const labels = ['Square term', 'Linear term', 'Constant'];
  const expression = [`${a}(${x})^2`, `${b}(${x})`, `${c}`];
  const display = (n) =>
    Number.isInteger(n) ? String(n) : Number(n.toPrecision(8)).toString();
  return (
    <section
      className="interactive-card substitution-card"
      aria-label={component.title}
    >
      <div className="visual-heading">
        <span className="eyebrow">PUT A VALUE THROUGH THE EQUATION</span>
        <h3>{component.title}</h3>
      </div>
      <p className="muted">
        Change x. Follow the three contributions back to zero.
      </p>
      <div className="substitution-controls">
        <label>
          Candidate value{' '}
          <span className="candidate-input">
            <span>x =</span>
            <input
              aria-label="Candidate value"
              type="number"
              min="-1000"
              max="1000"
              step="any"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </span>
        </label>
        <label className="candidate-slider">
          Slide to explore
          <input
            aria-label="Explore candidate value"
            type="range"
            min={Math.min(-10, x)}
            max={Math.max(10, x)}
            step="1"
            value={x}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
      </div>
      {!valid ? (
        <p role="status">Enter a number between −1000 and 1000.</p>
      ) : (
        <>
          <div className="substitution-terms">
            {terms.map((term, i) => (
              <div key={labels[i]} className={`substitution-term term-${i}`}>
                <span>{labels[i]}</span>
                <MathText value={expression[i]} />
                <strong>{display(term)}</strong>
              </div>
            ))}
          </div>
          <svg
            className="substitution-diagram"
            viewBox="0 0 800 220"
            role="img"
            aria-label={`Starting at zero, add ${terms.map(display).join(', then ')}. The result is ${display(result)}.`}
          >
            <line
              x1={scale(0)}
              x2={scale(0)}
              y1="20"
              y2="193"
              stroke="#547d68"
              strokeDasharray="5 5"
            />
            <text
              x={scale(0)}
              y="211"
              textAnchor="middle"
              className="zero-label"
            >
              0 · root target
            </text>
            {terms.map((term, i) => {
              const y = 38 + i * 60,
                start = scale(totals[i]),
                end = scale(totals[i + 1]);
              return (
                <g key={labels[i]} className={`term-${i}`}>
                  <line
                    x1={start}
                    x2={end}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {i < 2 && (
                    <line
                      x1={end}
                      x2={end}
                      y1={y + 7}
                      y2={y + 53}
                      stroke="#c0cbbd"
                      strokeDasharray="3 4"
                    />
                  )}
                  <circle
                    cx={start}
                    cy={y}
                    r="5"
                    fill="white"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx={end} cy={y} r="6" fill="currentColor" />
                  <text x={(start + end) / 2} y={y - 13} textAnchor="middle">
                    {term >= 0 ? '+' : '−'}
                    {display(Math.abs(term))}
                  </text>
                  <text
                    x={end}
                    y={y + 23}
                    textAnchor="middle"
                    className="running-total"
                  >
                    total {display(totals[i + 1])}
                  </text>
                </g>
              );
            })}
          </svg>
          <div
            className={`substitution-verdict ${isRoot ? 'is-root' : ''}`}
            aria-live="polite"
          >
            <strong>
              {isRoot ? 'Back to zero.' : 'Not at zero yet.'} x = {display(x)}{' '}
              {isRoot ? 'is a root' : 'is not a root'}.
            </strong>
            <MathText
              value={`${terms.map((n) => `(${display(n)})`).join('+')}=${display(result)}${isRoot ? '' : String.raw`\ne 0`}`}
            />
          </div>
          <button
            className="text-button"
            disabled={disabled}
            onClick={() =>
              onExplore(
                `I used the substitution visual at x = ${x}. The terms were ${terms.join(', ')}, with total ${result}. It ${isRoot ? 'is' : 'is not'} a root.`,
              )
            }
          >
            Share this observation with Prism <ArrowUpRight size={15} />
          </button>
        </>
      )}
    </section>
  );
}

export function FactorPairs({ component, onExplore, disabled }) {
  const [p, setP] = useState(0),
    [q, setQ] = useState(
      component.sum === 0 && component.product === 0 ? 1 : 0,
    );
  return (
    <section
      className="interactive-card factor-card"
      aria-label={component.title}
    >
      <div className="visual-heading">
        <span className="eyebrow">MAKE THE CONNECTION</span>
        <h3>{component.title}</h3>
      </div>
      <p className="muted">
        Find two numbers with sum <strong>{component.sum}</strong> and product{' '}
        <strong>{component.product}</strong>.
      </p>
      <div className="pair-values">
        <label>
          First number
          <input
            aria-label="First factor"
            type="number"
            min="-1000"
            max="1000"
            value={p}
            onChange={(e) =>
              setP(Math.max(-1000, Math.min(1000, Number(e.target.value))))
            }
          />
        </label>
        <span>×</span>
        <label>
          Second number
          <input
            aria-label="Second factor"
            type="number"
            min="-1000"
            max="1000"
            value={q}
            onChange={(e) =>
              setQ(Math.max(-1000, Math.min(1000, Number(e.target.value))))
            }
          />
        </label>
      </div>
      <div className="pair-readings" aria-live="polite">
        <div className={p + q === component.sum ? 'matched' : ''}>
          <span>THEIR SUM</span>
          <strong>{p + q}</strong>
          <small>aim for {component.sum}</small>
        </div>
        <div className={p * q === component.product ? 'matched' : ''}>
          <span>THEIR PRODUCT</span>
          <strong>{p * q}</strong>
          <small>aim for {component.product}</small>
        </div>
      </div>
      <button
        className="text-button"
        disabled={disabled}
        onClick={() =>
          onExplore(
            `I explored the pair ${p} and ${q}. Their sum is ${p + q} and their product is ${p * q}.`,
          )
        }
      >
        Share my pair with Prism <ArrowUpRight size={16} />
      </button>
    </section>
  );
}

export function Parabola({ component, onExplore, disabled }) {
  const { a, b, c } = component.coefficients;
  const result = useMemo(() => quadratic(a, b, c), [a, b, c]);
  const bounds = useMemo(() => plotBounds(a, b, c), [a, b, c]);
  const [x, setX] = useState(Math.max(bounds[0], Math.min(bounds[2], 0)));
  const [xMin, yMax, xMax, yMin] = bounds;
  const px = (n) => 40 + ((n - xMin) / (xMax - xMin)) * 520;
  const py = (n) => 280 - ((n - yMin) / (yMax - yMin)) * 250;
  const y = a * x * x + b * x + c;
  const curve = Array.from({ length: 241 }, (_, i) => {
    const t = xMin + ((xMax - xMin) * i) / 240;
    return `${i ? 'L' : 'M'}${px(t)},${Math.max(-10000, Math.min(10000, py(a * t * t + b * t + c)))}`;
  }).join(' ');
  return (
    <section
      className="interactive-card parabola-card"
      aria-label={component.title}
    >
      <div className="visual-heading">
        <span className="eyebrow">SEE IT ANOTHER WAY</span>
        <h3>{component.title}</h3>
      </div>
      <MathText value={`y=${polynomialTex(a, b, c)}`} block />
      <svg
        className="parabola-svg"
        viewBox="0 0 600 320"
        role="img"
        aria-label={`Parabola of y equals ${polynomialTex(a, b, c)}. Selected x ${fmt(x)}, y ${fmt(y)}. Use the slider to explore.`}
      >
        <defs>
          <clipPath id={`plot-${component.title.replace(/[^a-z0-9]/gi, '')}`}>
            <rect x="40" y="25" width="520" height="255" />
          </clipPath>
        </defs>
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <line
              x1={40 + i * 65}
              x2={40 + i * 65}
              y1="25"
              y2="280"
              stroke="#e1e7dd"
            />
            <line
              x1="40"
              x2="560"
              y1={30 + i * 31.25}
              y2={30 + i * 31.25}
              stroke="#e1e7dd"
            />
          </g>
        ))}
        <line x1="40" x2="560" y1={py(0)} y2={py(0)} stroke="#91a191" />
        <line x1={px(0)} x2={px(0)} y1="25" y2="280" stroke="#91a191" />
        <path
          d={curve}
          fill="none"
          stroke="#315f4b"
          strokeWidth="3"
          clipPath={`url(#plot-${component.title.replace(/[^a-z0-9]/gi, '')})`}
        />
        {component.revealRoots &&
          result.roots.map((r) => (
            <g key={r}>
              <circle cx={px(r)} cy={py(0)} r="5" fill="#bd663d" />
              <text
                x={px(r)}
                y={py(0) + 22}
                textAnchor="middle"
                fontSize="12"
                fill="#74452e"
              >
                {fmt(r)}
              </text>
            </g>
          ))}
        {py(y) >= 25 && py(y) <= 280 && (
          <circle
            cx={px(x)}
            cy={py(y)}
            r="6"
            fill="#d5a253"
            stroke="white"
            strokeWidth="2"
          />
        )}
        <text x="570" y={Math.min(298, Math.max(20, py(0) + 5))} fontSize="13">
          x
        </text>
        <text x={Math.min(548, Math.max(15, px(0) - 15))} y="20" fontSize="13">
          y
        </text>
        <text x="40" y="302" fontSize="11">
          {fmt(xMin)}
        </text>
        <text x="535" y="302" fontSize="11">
          {fmt(xMax)}
        </text>
      </svg>
      <label className="plot-slider">
        <span>
          Move along the curve <strong>x = {fmt(x)}</strong>
        </span>
        <input
          aria-label="Position on the parabola"
          type="range"
          min={xMin}
          max={xMax}
          step={(xMax - xMin) / 200}
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
        />
      </label>
      <div className="coordinate-readout" aria-live="polite">
        <span>
          x <strong>{fmt(x)}</strong>
        </span>
        <span>
          y <strong>{fmt(y)}</strong>
        </span>
        <button
          title="Reset point"
          aria-label="Reset point"
          className="icon-button"
          onClick={() => setX(Math.max(xMin, Math.min(xMax, 0)))}
        >
          <RotateCcw size={15} />
        </button>
      </div>
      {component.revealRoots && (
        <p className="muted">
          {result.roots.length
            ? `Real roots: ${result.roots.map(fmt).join(' and ')}${result.kind === 'repeated' ? ' (repeated)' : ''}.`
            : 'The curve does not cross the x-axis: no real roots.'}
        </p>
      )}
      <button
        className="text-button"
        disabled={disabled}
        onClick={() =>
          onExplore(
            `At x=${fmt(x)}, I observed y=${fmt(y)} on y=${polynomialTex(a, b, c)}.`,
          )
        }
      >
        Share this observation <ArrowUpRight size={16} />
      </button>
      <small className="rounding-note">
        Displayed coordinates are rounded to 3 decimals.
      </small>
    </section>
  );
}
