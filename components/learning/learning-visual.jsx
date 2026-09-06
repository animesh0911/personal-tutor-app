/* JSXGraph owns its SVG host; inline mathematical SVGs need image semantics. */
/* oxlint-disable jsx-a11y/prefer-tag-over-role */
'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { MathText } from './math-text';
import {
  validateVisual,
  quadratic,
  valueAt,
  fmt,
  texNum,
  polynomialTex,
  linearTex,
  factorCoefficients,
  factorPairs,
  plotBounds,
} from '@/lib/visual-math';

const M = ({ children }) => <MathText value={children} block />;
function Action({ children, onClick, selected }) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
function Range({ label, value, min, max, step = 1, onChange }) {
  return (
    <div className="visual-range">
      <span>
        {label}: <strong>{fmt(value)}</strong>
      </span>
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      />
    </div>
  );
}
function Plot({ a, b, c, x }) {
  const host = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let disposed = false,
      board,
      api;
    import('jsxgraph')
      .then((module) => {
        if (disposed || !host.current) return;
        api = module.default ?? module;
        const bounds = plotBounds(a, b, c),
          y = valueAt(a, b, c, x);
        bounds[1] = Math.max(bounds[1], y + 2);
        bounds[3] = Math.min(bounds[3], y - 2);
        bounds[0] = Math.min(bounds[0], x - 1);
        bounds[2] = Math.max(bounds[2], x + 1);
        board = api.JSXGraph.initBoard(host.current, {
          boundingbox: bounds,
          axis: true,
          grid: true,
          showCopyright: false,
          showNavigation: false,
          pan: { enabled: false },
          zoom: { enabled: false },
          keyboard: { enabled: false },
          resize: { enabled: true },
          renderer: 'svg',
        });
        board.create('functiongraph', [(t) => valueAt(a, b, c, t)], {
          strokeColor: '#4F46E5',
          strokeWidth: 3,
        });
        quadratic(a, b, c).roots.forEach((root) =>
          board.create('point', [root, 0], {
            name: `root ${fmt(root)}`,
            fixed: true,
            size: 4,
            strokeColor: '#047857',
            fillColor: '#047857',
            label: { offset: [5, 15] },
          }),
        );
        board.create('point', [x, y], {
          name: 'P',
          fixed: true,
          size: 5,
          strokeColor: '#0E7490',
          fillColor: '#0E7490',
        });
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
      if (board) api.JSXGraph.freeBoard(board);
    };
  }, [a, b, c, x]);
  return (
    <>
      {failed && (
        <p>
          The graph could not load. The equation and values below still work.
        </p>
      )}
      <div
        ref={host}
        className="learning-graph"
        role="img"
        aria-label={`Graph of y equals ${polynomialTex(a, b, c)}. Marked point: ${fmt(x)}, ${fmt(valueAt(a, b, c, x))}. Roots: ${quadratic(a, b, c).roots.map(fmt).join(', ') || 'none'}.`}
      />
    </>
  );
}
function GraphActivity({ s }) {
  const [x, setX] = useState(s.x ?? 0),
    [c, setC] = useState(s.c);
  const result = quadratic(s.a, s.b, c),
    threshold = s.a ? (s.b * s.b) / (4 * s.a) : 0;
  const bounds = plotBounds(s.a, s.b, c);
  return (
    <>
      <M>{`y=${polynomialTex(s.a, s.b, c)}`}</M>
      <Plot a={s.a} b={s.b} c={c} x={x} />
      {s.mode === 'discriminant' ? (
        <>
          <p>
            Move the curve by changing its constant. Watch the crossings of the
            horizontal axis.
          </p>
          <div className="visual-actions">
            {[
              threshold - Math.sign(s.a || 1) * 2,
              threshold,
              threshold + Math.sign(s.a || 1) * 2,
            ].map((n, i) => (
              <Action key={i} selected={c === n} onClick={() => setC(n)}>
                {['Two crossings', 'One touch', 'No crossings'][i]}
              </Action>
            ))}
            <Action onClick={() => setC(s.c)}>Original equation</Action>
          </div>
          <M>{`D=b^2-4ac=${texNum(result.d)}`}</M>
        </>
      ) : (
        <>
          <p>
            Move point P. A root is an x-value where the curve meets the
            horizontal axis: y = 0.
          </p>
          <Range
            label="Point x"
            value={x}
            min={Math.min(bounds[0], s.x ?? 0)}
            max={Math.max(bounds[2], s.x ?? 0)}
            step={0.25}
            onChange={setX}
          />
          <div className="visual-actions">
            {result.roots.map((r, i) => (
              <Action key={i} onClick={() => setX(r)}>
                Try root {fmt(r)}
              </Action>
            ))}
            <Action onClick={() => setX(s.x ?? 0)}>Reset point</Action>
          </div>
          <M>{`y=${texNum(s.a)}(${texNum(x)})^2+(${texNum(s.b)})(${texNum(x)})+(${texNum(c)})\\approx ${fmt(valueAt(s.a, s.b, c, x))}`}</M>
        </>
      )}
      <p className="visual-result" aria-live="polite">
        {result.kind === 'constant'
          ? 'This is a constant function.'
          : result.roots.length === 0
            ? 'No real roots: the curve does not meet y = 0.'
            : `${result.roots.length === 1 ? 'One distinct real root' : 'Two real roots'}: ${result.roots.map(fmt).join(' and ')}${result.kind === 'repeated' ? ' (a repeated root)' : ''}.`}{' '}
        Non-integer labels are rounded to 3 decimals.
      </p>
    </>
  );
}
function FactorGrid({ s }) {
  const [step, setStep] = useState(0),
    [p, q, r, t] = s.factors,
    [a, b, c] = factorCoefficients(s.factors);
  return (
    <>
      <M>{`(${linearTex(p, q)})(${linearTex(r, t)})`}</M>
      <p>
        Each box multiplies its row by its column. Negative products keep their
        minus sign.
      </p>
      <div
        className="algebra-grid"
        role="group"
        aria-label="Factor multiplication grid"
      >
        {[
          '',
          `${texNum(r)}x`,
          texNum(t),
          `${texNum(p)}x`,
          `${texNum(p * r)}x^2`,
          `${texNum(p * t)}x`,
          texNum(q),
          `${texNum(q * r)}x`,
          texNum(q * t),
        ].map((v, i) => (
          <div key={i} className={i < 3 || i % 3 === 0 ? 'grid-heading' : ''}>
            {i > 3 && i % 3 !== 0 && step === 0 ? (
              <span>?</span>
            ) : (
              <MathText value={v || '\\times'} />
            )}
          </div>
        ))}
      </div>
      <div className="visual-actions">
        <Action onClick={() => setStep(Math.min(2, step + 1))}>
          {step === 0
            ? 'Show the four products'
            : step === 1
              ? 'Combine like terms'
              : 'All steps shown'}
        </Action>
        <Action onClick={() => setStep(0)}>Start again</Action>
      </div>
      {step >= 1 && (
        <M>{`${texNum(p * r)}x^2+(${texNum(p * t)})x+(${texNum(q * r)})x+(${texNum(q * t)})`}</M>
      )}
      {step >= 2 && (
        <>
          <M>{`${polynomialTex(a, b, c)}=0`}</M>
          <M>{`${linearTex(p, q)}=0\\quad\\text{or}\\quad ${linearTex(r, t)}=0`}</M>
          <p>
            Undo this grid to factorise. Then set either factor equal to zero.
          </p>
        </>
      )}
    </>
  );
}
function ZeroProduct({ s }) {
  const [p, q, r, t] = s.factors,
    roots = [-q / p, -t / r],
    [x, setX] = useState(0),
    left = valueAt(0, p, q, x),
    right = valueAt(0, r, t, x);
  return (
    <>
      <M>{`(${linearTex(p, q)})(${linearTex(r, t)})=0`}</M>
      <Range
        label="Try x"
        value={x}
        min={Math.min(0, ...roots) - 2}
        max={Math.max(0, ...roots) + 2}
        step={0.25}
        onChange={setX}
      />
      <div className="term-cards">
        <div data-zero={left === 0}>
          <M>{`${texNum(left)}`}</M>First factor
        </div>
        <span>×</span>
        <div data-zero={right === 0}>
          <M>{`${texNum(right)}`}</M>Second factor
        </div>
        <span>=</span>
        <div data-zero={left * right === 0}>
          <M>{`${texNum(left * right)}`}</M>Product
        </div>
      </div>
      <div className="visual-actions">
        {roots.map((v, i) => (
          <Action key={i} onClick={() => setX(v)}>
            Try x = {fmt(v)}
          </Action>
        ))}
      </div>
      <p aria-live="polite">
        {left * right === 0
          ? 'The product is zero because at least one factor is zero.'
          : 'Neither factor is zero, so their product is not zero.'}{' '}
        The factors do not both have to be zero.
      </p>
    </>
  );
}
function Terms({ s }) {
  const [show, setShow] = useState(s.kind === 'coefficient_cards');
  const terms = s.terms ?? [s.c, s.b, s.a, 0];
  return (
    <>
      <M>{s.original ?? `${polynomialTex(s.a, s.b, s.c)}=0`}</M>
      {!show ? (
        <Action onClick={() => setShow(true)}>
          Simplify and sort the terms
        </Action>
      ) : (
        <>
          <div className="term-cards">
            {[3, 2, 1, 0].map((power) => (
              <div key={power} data-zero={terms[power] === 0}>
                <span>
                  {['Constant', 'x term', 'Squared term', 'Cubed term'][power]}
                </span>
                <M>{`${texNum(terms[power])}${power ? `x${power > 1 ? `^${power}` : ''}` : ''}`}</M>
              </div>
            ))}
          </div>
          <p>
            {terms[3] !== 0
              ? 'A cubed term remains, so this is not quadratic.'
              : terms[2] !== 0
                ? 'The highest remaining power is 2: this is quadratic.'
                : 'The squared terms cancel or are absent. This is not quadratic.'}
          </p>
          {s.kind === 'coefficient_cards' && (
            <M>{`a=${texNum(s.a)},\\quad b=${texNum(s.b)},\\quad c=${texNum(s.c)}`}</M>
          )}
          <p>
            Read each coefficient with its sign. A missing term has coefficient
            zero.
          </p>
        </>
      )}
    </>
  );
}
function Square({ s }) {
  const [n, setN] = useState(s.n),
    side = s.kind === 'signed_square' ? Math.abs(n) : Math.sqrt(n),
    area = side * side;
  return (
    <>
      {s.kind === 'signed_square' && (
        <Range
          label="Number to square"
          value={n}
          min={-9}
          max={9}
          onChange={setN}
        />
      )}
      <svg
        className="square-model"
        viewBox="0 0 160 160"
        role="img"
        aria-label={`${side} by ${side} grid: ${area} unit squares.`}
      >
        {Array.from({ length: area }, (_, i) => (
          <rect
            key={i}
            x={15 + ((i % side) * 130) / Math.max(1, side)}
            y={15 + (Math.floor(i / side) * 130) / Math.max(1, side)}
            width={130 / Math.max(1, side)}
            height={130 / Math.max(1, side)}
            fill="#E0E7FF"
            stroke="#4F46E5"
            strokeWidth="1"
          />
        ))}
      </svg>
      <M>
        {s.kind === 'signed_square'
          ? `(${n})^2=(${n})\\times(${n})=${area}`
          : `\\sqrt{${n}}=${side}\\quad\\Rightarrow\\quad\\frac{\\sqrt{${n}}}{${texNum(s.d)}}=${texNum(side / s.d)}`}
      </M>
      <p>
        {s.kind === 'signed_square'
          ? 'The picture uses the absolute value for side lengths. Two negative factors make a positive product; a geometric length is never negative.'
          : 'The square root is the non-negative side length. Find that length first, then divide.'}
      </p>
    </>
  );
}
function Balance({ s }) {
  const [step, setStep] = useState(0);
  return (
    <>
      <p>Keep both sides equal: do the same operation on each side.</p>
      <div className="balance-model">
        <div>
          <M>
            {step === 0
              ? linearTex(s.a, s.b)
              : step === 1
                ? `${texNum(s.a)}x`
                : 'x'}
          </M>
        </div>
        <strong>=</strong>
        <div>
          <M>
            {step === 0 ? '0' : step === 1 ? texNum(-s.b) : texNum(-s.b / s.a)}
          </M>
        </div>
      </div>
      <div className="visual-actions">
        <Action onClick={() => setStep(Math.min(2, step + 1))}>
          {step === 0
            ? `${s.b > 0 ? 'Subtract' : 'Add'} ${fmt(Math.abs(s.b))} on both sides`
            : step === 1
              ? `Divide both sides by ${fmt(s.a)}`
              : 'Balanced and solved'}
        </Action>
        <Action onClick={() => setStep(0)}>Reset</Action>
      </div>
      {step === 2 && (
        <p>
          Substitute this x-value into the starting equation to check that the
          left side is zero.
        </p>
      )}
    </>
  );
}
function Pairs({ s }) {
  const [pair, setPair] = useState(/** @type {number[] | null} */ (null));
  return (
    <>
      <p>
        Find a pair with product <strong>{s.product}</strong> and sum{' '}
        <strong>{s.sum}</strong>. Try the factor pairs.
      </p>
      <div className="visual-actions">
        {factorPairs(s.product).map(([u, v]) => (
          <Action
            key={`${u},${v}`}
            selected={pair?.[0] === u}
            onClick={() => setPair([u, v])}
          >
            {u}, {v}
          </Action>
        ))}
      </div>
      {pair && (
        <div className="term-cards" aria-live="polite">
          <div data-zero={pair[0] + pair[1] === s.sum}>
            <M>{`${pair[0]}+(${pair[1]})=${pair[0] + pair[1]}`}</M>
            {pair[0] + pair[1] === s.sum
              ? 'Sum matches!'
              : 'Try a different sum'}
          </div>
          <div>
            <M>{`(${pair[0]})(${pair[1]})=${s.product}`}</M>Product matches
          </div>
        </div>
      )}
    </>
  );
}
function Formula({ s }) {
  const [step, setStep] = useState(0),
    result = quadratic(s.a, s.b, s.c);
  const steps = [
    `a=${texNum(s.a)},\\ b=${texNum(s.b)},\\ c=${texNum(s.c)}`,
    `D=(${texNum(s.b)})^2-4(${texNum(s.a)})(${texNum(s.c)})=${texNum(result.d)}`,
    result.d < 0
      ? 'D<0\\quad\\Rightarrow\\quad\\text{no real roots}'
      : `x=\\frac{-(${texNum(s.b)})\\pm\\sqrt{${texNum(result.d)}}}{2(${texNum(s.a)})}`,
    result.d < 0
      ? '\\text{The curve never meets }y=0'
      : `x\\approx ${result.roots.map(fmt).join('\\quad\\text{or}\\quad')}`,
  ];
  return (
    <>
      <M>{`${polynomialTex(s.a, s.b, s.c)}=0`}</M>
      <div className="formula-stops">
        {['Pick a, b, c', 'Find D', 'Substitute', 'See roots'].map(
          (label, i) => (
            <Action
              key={label}
              selected={step === i}
              onClick={() => setStep(i)}
            >
              {i + 1}. {label}
            </Action>
          ),
        )}
      </div>
      <M>{steps[step]}</M>
      <p>
        {
          [
            'Carry the minus signs with the coefficients.',
            'The discriminant tells us how many real roots to expect.',
            'The ± sign gives two branches; when D is zero, both branches give the same root.',
            'The marked roots are where the curve reaches zero. Decimal labels are rounded.',
          ][step]
        }
      </p>
      {step === 3 && <Plot a={s.a} b={s.b} c={s.c} x={result.vertex[0]} />}
    </>
  );
}
function Rectangle({ s }) {
  const solution =
      (-s.extra + Math.sqrt(s.extra * s.extra + 4 * s.k * s.area)) / (2 * s.k),
    [width, setWidth] = useState(Math.max(1, Math.floor(solution / 2))),
    length = s.k * width + s.extra,
    area = width * length;
  const scale = 210 / Math.max(length, width),
    w = width * scale,
    h = length * scale;
  return (
    <>
      <p>
        Change the width. The length follows the rule, so the area changes too.
      </p>
      <svg
        className="rectangle-model"
        viewBox="0 0 330 280"
        role="img"
        aria-label={`Rectangle width ${fmt(width)}, length ${fmt(length)}, area ${fmt(area)}.`}
      >
        <rect
          x="65"
          y="30"
          width={w}
          height={h}
          rx="3"
          fill="#E0F2FE"
          stroke="#0E7490"
          strokeWidth="2"
        />
        <text x={65 + w / 2} y="20" textAnchor="middle">
          width {fmt(width)}
        </text>
        <text x={75 + w} y={30 + h / 2}>
          length
        </text>
        <text x={75 + w} y={50 + h / 2}>
          {fmt(length)}
        </text>
      </svg>
      <Range
        label="Width"
        value={width}
        min={0.5}
        max={Math.ceil(solution * 1.5)}
        step={0.5}
        onChange={setWidth}
      />
      <M>{`\\text{length}=${texNum(s.k)}x+${texNum(s.extra)},\\quad\\text{area}=x(${linearTex(s.k, s.extra)})`}</M>
      <p className="visual-result" aria-live="polite">
        Area now: {fmt(area)} square units. Target: {s.area}.{' '}
        {Math.abs(area - s.area) < 0.001
          ? 'It fits!'
          : area < s.area
            ? 'Make the width larger.'
            : 'Make the width smaller.'}
      </p>
    </>
  );
}
const renderers = {
  quadratic_plot: GraphActivity,
  factor_grid: FactorGrid,
  zero_product: ZeroProduct,
  polynomial_terms: Terms,
  coefficient_cards: Terms,
  signed_square: Square,
  square_root: Square,
  linear_balance: Balance,
  factor_pair: Pairs,
  formula_steps: Formula,
  rectangle_area: Rectangle,
};
export function LearningVisual({ spec }) {
  if (!validateVisual(spec)) return null;
  const Renderer = renderers[spec.kind];
  return (
    <figure className="learning-visual">
      <figcaption>
        <span className="eyebrow">SEE IT · TRY IT</span>
        <span>Explore freely — this isn’t a scored question.</span>
      </figcaption>
      <Renderer s={spec} />
      <details className="visual-description">
        <summary>Read the original example description</summary>
        <p>{spec.alt}</p>
      </details>
    </figure>
  );
}
