/*
 * This file contains utils to work with BenchmarkJS results.
 * Those are adapted from past projects of mines (Soreine).
 */

import Benchmark from "benchmark";

type SuccessResult = {
  name: string;
  stats: {
    rme: number;
    mean: number;
    hz: number;
    sample: number;
  };
};

type ErrorResult = {
  name: string;
  error: string;
};

type BenchmarkResult = SuccessResult | ErrorResult;

type BenchmarkCycleEvent = any;

/**
 * Creates a result object for a benchmark cycle event
 */
function extractResult(event: Benchmark.Event): BenchmarkResult {
  const { target } = event;
  const { error, name, hz, stats } = target as any;

  if (error) {
    return {
      name,
      error,
    };
  } else {
    const { rme, mean, sample } = stats;

    return {
      name,
      stats: {
        hz,
        rme,
        mean,
        sample,
      },
    };
  }
}

function isSuccess(result: BenchmarkResult): result is SuccessResult {
  return !(result as ErrorResult).error;
}

/**
 * Pretty print a benchmark result, along with its reference.
 * Mean difference, and rme computations inspired from
 * https://github.com/facebook/immutable-js/blob/master/resources/bench.js
 */

function printResult(
  result: BenchmarkResult,
  //  Old result to use as reference for comparison
  ref: BenchmarkResult | void,
) {
  const { name } = result;

  print(name);

  print(indent(2), "Current:	", formatPerf(result));

  if (ref) {
    print(indent(2), "Reference:	", formatPerf(ref));
  }

  // Print comparison

  if (ref && isSuccess(result) && isSuccess(ref)) {
    print(indent(2), `comparison: ${compare(result, ref)}`);
  }

  // Print difference as percentage
  if (ref && isSuccess(result) && isSuccess(ref)) {
    const newMean = 1 / result.stats.mean;
    const prevMean = 1 / ref.stats.mean;
    const diffMean = (100 * (newMean - prevMean)) / prevMean;

    print(indent(2), `diff: ${signed(diffMean.toFixed(2))}%`); // diff: -3.45%
  }

  // Print relative mean error
  if (ref && isSuccess(result) && isSuccess(ref)) {
    const aRme =
      100 *
      Math.sqrt(
        (square(result.stats.rme / 100) + square(ref.stats.rme / 100)) / 2,
      );

    print(indent(2), `rme: \xb1${aRme.toFixed(2)}%`); // rme: ±6.22%
  } else if (isSuccess(result)) {
    print(indent(2), `rme: \xb1${result.stats.rme.toFixed(2)}%`); // rme: ±6.22%
  }

  print(""); // newline
}

/**
 * Pretty format a benchmark's ops/sec along with its sample size
 * @param {Object} result
 * @return {String}
 */

function formatPerf(result: BenchmarkResult) {
  if (!isSuccess(result)) return result.error;
  const { hz, sample } = result.stats;
  const runs = sample;
  const opsSec = Benchmark.formatNumber(+`${hz.toFixed(hz < 100 ? 2 : 0)}`);
  return `${opsSec} ops/sec (${runs} runs sampled)`;
}

/**
 * @param {Object} newResult
 * @param {Object} oldResult
 * @return {String} Faster, Slower, or Indeterminate
 */

function compare(newResult: BenchmarkResult, oldResult: BenchmarkResult) {
  const comparison = new Benchmark({}).compare.call(newResult, oldResult);

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

function square(x: number) {
  return x * x;
}

function signed(x: string): string {
  return ((x as any) as number) > 0 ? "+" : "";
}

function print(...strs: any[]) {
  console.log(...strs);
}

export { extractResult, printResult };
