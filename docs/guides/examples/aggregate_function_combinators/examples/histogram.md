# histogram Combinator Examples

The following combinators can be applied to the `histogram` function:

### histogramIf
Generates histogram data only for rows that match the given condition.

### histogramArray
Generates histogram data from elements in the array.

### histogramMap
Generates histogram data for each key in the map separately.

### histogramSimpleState
Returns the histogram state with SimpleAggregateFunction type.

### histogramState
Returns the intermediate state of histogram calculation.

### histogramMerge
Combines intermediate states to get the final histogram data.

### histogramMergeState
Combines intermediate states but returns an intermediate state.

### histogramForEach
Generates histogram data for corresponding elements in multiple arrays.

### histogramDistinct
Generates histogram data using distinct values only.

### histogramOrDefault
Returns an empty histogram if there are no rows.

### histogramOrNull
Returns NULL if there are no rows. 