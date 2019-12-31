import jsdom from "jsdom";
import cheerio from "cheerio";
import Benchmark from "benchmark";

import { printResult, extractResult, readFile } from "./utils";

const suite = new Benchmark.Suite();

// On each benchmark completion
suite.on("cycle", (event: any) => {
  const result = extractResult(event);
  printResult(result);
});

const EMAILS = {
  BASIC: readFile("basic-lorem-gmail.html"),
  // The followings are the same as BASIC, but replied to itself one time, and two times
  // We can consider their relative sizes to be 1, 2 and 3.
  BASIC_REPLIED_X1: readFile("basic-lorem-gmail-replied-x1.html"),
  BASIC_REPLIED_X2: readFile("basic-lorem-gmail-replied-x2.html"),
};

// We test a simple parsing on basic HTML. Using a linear scale of input complexity, we can see if the performance is linear or worst.
suite
  .add("Parse#JSDom Size 1", () => {
    new jsdom.JSDOM(EMAILS.BASIC);
  })
  .add("Parse#JSDom Size 2", () => {
    new jsdom.JSDOM(EMAILS.BASIC_REPLIED_X1);
  })
  .add("Parse#JSDom Size 3", () => {
    new jsdom.JSDOM(EMAILS.BASIC_REPLIED_X2);
  })
  .add("Parse#Cheerio Size 1", () => {
    cheerio.load(EMAILS.BASIC);
  })
  .add("Parse#Cheerio Size 2", () => {
    cheerio.load(EMAILS.BASIC_REPLIED_X1);
  })
  .add("Parse#Cheerio Size 3", () => {
    cheerio.load(EMAILS.BASIC_REPLIED_X2);
  });

suite.run();
