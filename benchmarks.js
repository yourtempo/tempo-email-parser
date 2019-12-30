import jsdom from "jsdom";
import cheerio from "cheerio";
import Benchmark from "benchmark";
import fs from "fs";

const EMAIL_BUFFER = fs.readFileSync("./freelance-work.html");
const EMAIL_STRING = EMAIL_BUFFER.toString();

const suite = new Benchmark.Suite();

/*
### Understanding the results

Each benchmark prints its results, showing:
- The number of **operation per second**. This is the relevant value, that must be compared with values from different implementation.
- The **number of samples** run. BenchmarkJS has a special heuristic to choose how many samples must be made. The results are more accurate with a high number of samples. Low samples count is often tied with high relative margin of error
- The **relative margin of error** for the measure. The lower the value, the more accurate the results are. When compared with previous results, we display the average relative margin of error.
- (comparison only) A **comparison** of the two implementation, according to BenchmarkJS. It can be Slower, Faster, or Indeterminate.
- (comparison only) The **difference** in operations per second. Expressed as a percentage of the reference.

*/

// const BENCHMARK_OPTIONS = {
//   // To ensure a better accuracy, force a minimum number of samples
//   minSamples: 50 // default 10
// };

suite
  .add("Parse#jsdom", () => {
    new jsdom.JSDOM(EMAIL_STRING);
  })
  .add("Parse#cheerio", () => {
    cheerio.load(EMAIL_STRING);
  })
  // On each benchmark completion
  .on("cycle", event => {
    const result = serializeResult(event);
    compareResult(result);
  });

suite.run();

/**
 * Creates a result object for a benchmark cycle event
 */
function serializeResult(event) {
  const { target } = event;
  const { error, name } = target;

  const result = {
    name,
  };

  if (target.error) {
    Object.assign(result, { error });
  } else {
    const { hz } = target;
    const { rme, mean, sample } = target.stats;

    Object.assign(result, {
      hz,
      stats: {
        rme,
        mean,
        sample,
      },
    });
  }

  return result;
}

/**
 * Pretty print a benchmark result, along with its reference.
 * Mean difference, and rme computations inspired from
 * https://github.com/facebook/immutable-js/blob/master/resources/bench.js
 *
 * @param {Object} result
 * @param {Object} reference (optional) Old result to compare to
 */

function compareResult(result, reference = {}) {
  const { name } = result;
  const ref = reference[name];
  const errored = ref && (ref.error || result.error);

  print(name);

  print(indent(2), "Current:	", formatPerf(result));

  if (ref) {
    print(indent(2), "Reference:	", formatPerf(ref));
  }

  // Print comparison

  if (ref && !errored) {
    print(indent(2), `comparison: ${compare(result, ref)}`);
  }

  // Print difference as percentage
  if (ref && !errored) {
    const newMean = 1 / result.stats.mean;
    const prevMean = 1 / ref.stats.mean;
    const diffMean = (100 * (newMean - prevMean)) / prevMean;

    print(indent(2), `diff: ${signed(diffMean.toFixed(2))}%`); // diff: -3.45%
  }

  // Print relative mean error
  if (ref && !errored) {
    const aRme =
      100 *
      Math.sqrt(
        (square(result.stats.rme / 100) + square(ref.stats.rme / 100)) / 2,
      );

    print(indent(2), `rme: \xb1${aRme.toFixed(2)}%`); // rme: ±6.22%
  } else if (!result.error) {
    print(indent(2), `rme: \xb1${result.stats.rme.toFixed(2)}%`); // rme: ±6.22%
  }

  print(""); // newline
}

/**
 * Pretty format a benchmark's ops/sec along with its sample size
 * @param {Object} result
 * @return {String}
 */

function formatPerf(result) {
  if (result.error) return result.error;
  const { hz } = result;
  const runs = result.stats.sample.length;
  const opsSec = Benchmark.formatNumber(`${hz.toFixed(hz < 100 ? 2 : 0)}`);
  return `${opsSec} ops/sec (${runs} runs sampled)`;
}

/**
 * @param {Object} newResult
 * @param {Object} oldResult
 * @return {String} Faster, Slower, or Indeterminate
 */

function compare(newResult, oldResult) {
  const comparison = new Benchmark().compare.call(newResult, oldResult);

  switch (comparison) {
    case 1:
      return "Faster";
    case -1:
      return "Slower";
    default:
      return "Indeterminate";
  }
}

function indent(level = 0) {
  return Array(level + 1).join("  ");
}

function square(x) {
  return x * x;
}

function signed(x) {
  return x > 0 ? `+${x}` : `${x}`;
}

function print(...strs) {
  console.log(...strs);
}
