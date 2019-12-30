import jsdom from "jsdom";
import cheerio from "cheerio";
import Benchmark from "benchmark";
import fs from "fs";

import { printResult, extractResult } from "./utils";

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
  .on("cycle", (event: any) => {
    const result = extractResult(event);
    printResult(result);
  });

suite.run();
