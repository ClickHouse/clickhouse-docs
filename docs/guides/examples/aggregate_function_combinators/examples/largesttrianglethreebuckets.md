# largestTriangleThreeBuckets Combinator Examples

The following combinators can be applied to the `largestTriangleThreeBuckets` function:

### largestTriangleThreeBucketsIf
Performs data downsampling using the LTTB algorithm only for rows that match the given condition.

### largestTriangleThreeBucketsArray
Performs data downsampling using the LTTB algorithm from elements in the array.

### largestTriangleThreeBucketsMap
Performs data downsampling using the LTTB algorithm for each key in the map separately.

### largestTriangleThreeBucketsSimpleState
Returns the LTTB state with SimpleAggregateFunction type.

### largestTriangleThreeBucketsState
Returns the intermediate state of LTTB calculation.

### largestTriangleThreeBucketsMerge
Combines intermediate states to get the final downsampled data.

### largestTriangleThreeBucketsMergeState
Combines intermediate states but returns an intermediate state.

### largestTriangleThreeBucketsForEach
Performs data downsampling using the LTTB algorithm for corresponding elements in multiple arrays.

### largestTriangleThreeBucketsDistinct
Performs data downsampling using the LTTB algorithm using distinct values only.

### largestTriangleThreeBucketsOrDefault
Returns an empty array if there are no rows.

### largestTriangleThreeBucketsOrNull
Returns NULL if there are no rows. 