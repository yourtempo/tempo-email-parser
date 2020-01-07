## How to run benchmarks

To run benchmarks for `message-splitter` implementation

```
yarn run benchmarks
```

To run general benchmarks for external libraries

```
yarn run benchmarks:libraries
```

## Understanding the results

Each benchmark prints its results, showing:

-   The number of **operation per second**. This is the relevant value, that must be compared with values from different implementation.
-   The **number of samples** run. BenchmarkJS has a special heuristic to choose how many samples must be made. The results are more accurate with a high number of samples. Low samples count is often tied with high relative margin of error
-   The **relative margin of error** (rme) for the measure. The lower the value, the more accurate the results are. When compared with previous results, we display the average relative margin of error.
