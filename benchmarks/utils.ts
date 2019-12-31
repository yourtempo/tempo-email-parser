/*
 * This file contains utils to work with BenchmarkJS results.
 * Those are adapted from past projects of mines (Soreine).
 */

import fs from "fs";
import path from "path";
import Benchmark from "benchmark";

type SuccessResult = {
  name: string;
  stats: {
    rme: number;
    mean: number;
    hz: number;
    runs: number;
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
        runs: sample.length,
      },
    };
  }
}

function isSuccess(result: BenchmarkResult): result is SuccessResult {
  return !(result as ErrorResult).error;
}

/**
 * Pretty print a benchmark result.
 * Mean difference, and rme computations inspired from
 * https://github.com/facebook/immutable-js/blob/master/resources/bench.js
 */

function printResult(result: BenchmarkResult) {
  const { name } = result;

  print(name);

  print(indent(2), "Current:	");

  formatPerf(result).map(s => print(indent(4), s));

  print(""); // newline
}

/**
 * Pretty format a benchmark's ops/sec along with its sample size
 * @param {Object} result
 * @return {String}
 */

function formatPerf(result: BenchmarkResult): string[] {
  if (!isSuccess(result)) return [result.error];
  const { hz, runs } = result.stats;
  const opsSec = Benchmark.formatNumber(+`${hz.toPrecision(4)}`);
  const opDuration = Benchmark.formatNumber(+`${(1000 / hz).toPrecision(4)}`);

  return [
    `${opDuration} ms`,
    `${opsSec} ops/sec`,
    `(${runs} runs sampled)`,
    `Relative Margin of Error: \xb1${result.stats.rme.toFixed(2)}%`,
  ];
}

function indent(level = 0) {
  return Array(level + 1).join("  ");
}

function print(...strs: any[]) {
  console.log(...strs);
}

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(__dirname, relativePath)).toString();
}

export { extractResult, printResult, readFile };
