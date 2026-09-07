import {
  quadratic,
  texNum,
  polynomialTex,
  linearTex,
  factorCoefficients,
} from './visual-math.js';
const step = (title, body, tiles, equation) => ({
  title,
  body,
  tiles,
  equation,
});
const tile = (label, math) => ({ label, math });
export function visualStory(s) {
  const n = texNum;
  switch (s.kind) {
    case 'factor_grid':
    case 'zero_product': {
      const [p, q, r, t] = s.factors,
        [a, b, c] = factorCoefficients(s.factors);
      return [
        step(
          'Two smaller pieces',
          'We want to write this expression as two pieces multiplied together.',
          [tile('Our expression', polynomialTex(a, b, c))],
        ),
        ...[
          [
            'Start with the two x parts',
            'Multiply the x parts. An x times an x makes x².',
            `${n(p)}x\\times ${n(r)}x=${n(p * r)}x^2`,
          ],
          [
            'Keep the first x part',
            'Now multiply it by the plain number in the other bracket.',
            `${n(p)}x\\times(${n(t)})=${n(p * t)}x`,
          ],
          [
            'Use the first plain number',
            'Multiply it by the x part in the other bracket.',
            `(${n(q)})\\times ${n(r)}x=${n(q * r)}x`,
          ],
          [
            'Finish with the plain numbers',
            'Multiply these last two pieces. Now every pair has had a turn.',
            `(${n(q)})\\times(${n(t)})=${n(q * t)}`,
          ],
        ].map(([title, body, math]) =>
          step(
            title,
            body,
            [tile('This multiplication', math)],
            `(${linearTex(p, q)})(${linearTex(r, t)})`,
          ),
        ),
        step(
          'Put matching pieces together',
          'The two x pieces can join. The squared piece and the plain number stay separate.',
          [
            tile('Squared piece', `${n(a)}x^2`),
            tile('Join the x pieces', `${n(p * t)}x+(${n(q * r)})x=${n(b)}x`),
            tile('Plain number', n(c)),
          ],
          `${polynomialTex(a, b, c)}=(${linearTex(p, q)})(${linearTex(r, t)})`,
        ),
        step(
          'How can the product be zero?',
          'Zero times anything is zero. So either bracket can be the zero piece.',
          [
            tile('Make this zero', `${linearTex(p, q)}=0`),
            tile('OR make this zero', `${linearTex(r, t)}=0`),
          ],
        ),
        step(
          'Two ways to reach zero',
          'Solve each small equation. Each value makes at least one bracket zero.',
          [
            tile('One possible x', `x=${n(-q / p)}`),
            tile('Another possible x', `x=${n(-t / r)}`),
          ],
        ),
      ];
    }
    case 'quadratic_plot': {
      const { a, b, c } = s,
        r = quadratic(a, b, c),
        x = s.x ?? 0,
        y = a * x * x + b * x + c;
      return [
        step(
          'Think of a number machine',
          'Put in a number called x. Follow the rule to get a number called y.',
          [
            tile('Put in', `x=${n(x)}`),
            tile('The rule', polynomialTex(a, b, c)),
            tile('Comes out', `y=${n(y)}`),
          ],
        ),
        step(
          'A dot shows one result',
          'Across tells us x. Up or down tells us y. This dot records the machine’s answer.',
          [tile('Across', n(x)), tile('Up / down', n(y))],
        ),
        step(
          'We are looking for zero',
          'A root is an input that makes the answer zero. On the picture, those dots sit on the horizontal zero line.',
          [tile('The target', 'y=0')],
        ),
        step(
          s.mode === 'discriminant'
            ? 'Count the places that reach zero'
            : 'Find where the curve meets zero',
          r.roots.length === 0
            ? 'This curve never reaches zero. There are no real roots.'
            : r.roots.length === 1
              ? 'The curve touches zero once. Both answers are the same.'
              : 'The curve reaches zero in two places. Each x-value is a root.',
          r.roots.map((v) =>
            tile('Input that gives zero', `x\\approx ${n(v)}`),
          ),
          s.mode === 'discriminant' ? `D=b^2-4ac=${n(r.d)}` : undefined,
        ),
      ];
    }
    case 'formula_steps': {
      const r = quadratic(s.a, s.b, s.c);
      return [
        step(
          'Give each number a name',
          'Keep the sign attached to its number. These three numbers go into the same recipe every time.',
          [
            tile('a: beside x²', n(s.a)),
            tile('b: beside x', n(s.b)),
            tile('c: on its own', n(s.c)),
          ],
          `${polynomialTex(s.a, s.b, s.c)}=0`,
        ),
        step(
          'Work out the part under the square root',
          'Do this small calculation first. We call its answer D.',
          [
            tile('Square b', `(${n(s.b)})^2=${n(s.b * s.b)}`),
            tile(
              'Multiply 4, a and c',
              `4(${n(s.a)})(${n(s.c)})=${n(4 * s.a * s.c)}`,
            ),
          ],
          `D=${n(s.b * s.b)}-(${n(4 * s.a * s.c)})=${n(r.d)}`,
        ),
        step(
          'Put the numbers in their places',
          r.d < 0
            ? 'D is negative. No real number squared gives a negative number, so we stop here.'
            : 'The top starts with the opposite of b. The bottom is twice a.',
          [tile('Opposite of b', n(-s.b)), tile('Twice a', n(2 * s.a))],
          r.d < 0
            ? '\\text{No real roots}'
            : `x=\\frac{${n(-s.b)}\\pm\\sqrt{${n(r.d)}}}{${n(2 * s.a)}}`,
        ),
        step(
          'Follow each branch',
          r.d < 0
            ? 'The graph does not meet the zero line.'
            : r.d === 0
              ? 'Adding zero and subtracting zero give the same answer.'
              : 'The ± symbol means “do it twice”: once with plus and once with minus.',
          r.roots.map((v, i) => tile(`Answer ${i + 1}`, `x\\approx ${n(v)}`)),
        ),
      ];
    }
    case 'linear_balance':
      return [
        step(
          'Both sides must match',
          'An equals sign says that the left and right have the same value.',
          [tile('Left side', linearTex(s.a, s.b)), tile('Right side', '0')],
        ),
        step(
          'Remove the extra number',
          `To undo ${s.b >= 0 ? 'adding' : 'subtracting'} ${Math.abs(s.b)}, ${s.b >= 0 ? 'subtract' : 'add'} it on BOTH sides.`,
          [tile('Left side', `${n(s.a)}x`), tile('Right side', n(-s.b))],
        ),
        step(
          'Find one x',
          `There are ${n(s.a)} lots of x. Divide BOTH sides by ${n(s.a)}.`,
          [tile('One x', `x=${n(-s.b / s.a)}`)],
        ),
      ];
    case 'rectangle_area':
      return [
        step(
          'Start with a rectangle',
          'We do not know its width yet. Call that missing width x.',
          [tile('Width', 'x')],
        ),
        step(
          'Build the length',
          `The length is ${s.k} times the width, then ${s.extra} more.`,
          [tile('Width', 'x'), tile('Length', linearTex(s.k, s.extra))],
        ),
        step(
          'Cover the rectangle',
          'Area means how much space is inside. Multiply width by length.',
          [
            tile('Width', 'x'),
            tile('Length', linearTex(s.k, s.extra)),
            tile('Known area', n(s.area)),
          ],
          `x(${linearTex(s.k, s.extra)})=${n(s.area)}`,
        ),
        step(
          'Now we have an equation',
          'The picture tells us what to multiply. Solve this equation, then keep a positive width.',
          [
            tile('Width × length', `x(${linearTex(s.k, s.extra)})`),
            tile('Must equal', n(s.area)),
          ],
        ),
      ];
    case 'signed_square':
    case 'square_root': {
      const root = s.kind === 'square_root',
        side = root ? Math.sqrt(s.n) : Math.abs(s.n),
        area = side * side;
      return [
        step(
          'Build a square',
          `Put ${side} little squares in each row. Make ${side} rows.`,
          [tile('In each row', n(side)), tile('Number of rows', n(side))],
        ),
        step(
          'Count the little squares',
          'Rows times squares in each row gives the total.',
          [tile('Total squares', `${n(side)}\\times ${n(side)}=${n(area)}`)],
        ),
        step(
          root
            ? 'Go backwards to find the side'
            : 'What if the number has a minus sign?',
          root
            ? 'A square root asks: which non-negative side length makes this square?'
            : 'Squaring means multiplying a number by itself. Two negative factors give a positive answer.',
          [
            tile(
              root ? 'Side length' : 'Square of the number',
              root
                ? `\\sqrt{${n(s.n)}}=${n(side)}`
                : `(${n(s.n)})(${n(s.n)})=${n(area)}`,
            ),
          ],
        ),
        ...(root
          ? [
              step(
                'Now share that answer',
                'Find the square root first. Then do the division.',
                [
                  tile(
                    'Divide the side length',
                    `\\frac{${n(side)}}{${n(s.d)}}=${n(side / s.d)}`,
                  ),
                ],
              ),
            ]
          : []),
      ];
    }
    case 'factor_pair': {
      let pair;
      for (let i = -Math.abs(s.product); i <= Math.abs(s.product); i++)
        if (i && s.product % i === 0 && i + s.product / i === s.sum) {
          pair = [i, s.product / i];
          break;
        }
      const [a, b] = pair ?? [0, 0];
      return [
        step(
          'Two numbers. Two jobs.',
          'We need one pair that passes BOTH checks.',
          [tile('Multiply to get', n(s.product)), tile('Add to get', n(s.sum))],
        ),
        step(
          'Try this pair',
          'First check what happens when we multiply.',
          [tile('First number', n(a)), tile('Second number', n(b))],
          `(${n(a)})(${n(b)})=${n(s.product)}`,
        ),
        step(
          'Check the second job',
          'Now add the very same two numbers. If the sum matches too, we have our pair.',
          [tile('Add them', `${n(a)}+(${n(b)})=${n(s.sum)}`)],
        ),
      ];
    }
    case 'coefficient_cards':
    case 'polynomial_terms': {
      const t = s.terms ?? [s.c, s.b, s.a, 0];
      return [
        step(
          'Sort the pieces',
          'Look for x², x, and plain numbers. Keep each minus sign with its piece.',
          [
            tile(
              'Starting equation',
              s.original ?? `${polynomialTex(s.a, s.b, s.c)}=0`,
            ),
          ],
        ),
        step(
          'Put matching pieces in their own boxes',
          'Simplify first. A box with zero means that kind of piece is missing or has cancelled.',
          [3, 2, 1, 0].map((i) =>
            tile(
              ['Plain number', 'x pieces', 'x² pieces', 'x³ pieces'][i],
              `${n(t[i])}${i ? `x^{${i}}` : ''}`,
            ),
          ),
        ),
        step(
          'Look for the biggest power left',
          t[3]
            ? 'There is an x³ piece, so this is not quadratic.'
            : t[2]
              ? 'The biggest power left is x². That makes this quadratic.'
              : 'No x² piece remains. This is not quadratic.',
          s.kind === 'coefficient_cards'
            ? [tile('a', n(s.a)), tile('b', n(s.b)), tile('c', n(s.c))]
            : [
                tile(
                  'Highest power',
                  t[3] ? '3' : t[2] ? '2' : t[1] ? '1' : '0',
                ),
              ],
        ),
      ];
    }
    default:
      return [];
  }
}
