# largestTriangleThreeBuckets Combinator Examples

The following combinators can be applied to the `largestTriangleThreeBuckets` function:

### largestTriangleThreeBucketsIf
Performs data downsampling only for rows that match the given condition.

### largestTriangleThreeBucketsArray
Performs data downsampling on elements in the array.

### largestTriangleThreeBucketsMap
Performs data downsampling for each key in the map separately.

### largestTriangleThreeBucketsSimpleState
Returns the downsampled data with SimpleAggregateFunction type.

### largestTriangleThreeBucketsState
Returns the intermediate state of data downsampling calculation.

### largestTriangleThreeBucketsMerge
Combines intermediate states to get the final downsampled data.

### largestTriangleThreeBucketsMergeState
Combines intermediate states but returns an intermediate state.

### largestTriangleThreeBucketsForEach
Performs data downsampling on corresponding elements in multiple arrays.

### largestTriangleThreeBucketsDistinct
Performs data downsampling using distinct values only.

### largestTriangleThreeBucketsOrDefault
Returns an empty array if there are no rows.

### largestTriangleThreeBucketsOrNull
Returns NULL if there are no rows. 