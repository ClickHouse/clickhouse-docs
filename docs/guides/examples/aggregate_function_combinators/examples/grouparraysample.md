# groupArraySample Combinator Examples

The following combinators can be applied to the `groupArraySample` function:

### groupArraySampleIf
Creates an array from sampled values only for rows that match the given condition.

### groupArraySampleArray
Creates an array from sampled elements in arrays.

### groupArraySampleMap
Creates an array of sampled values for each key in the map separately.

### groupArraySampleSimpleState
Returns the array of sampled values with SimpleAggregateFunction type.

### groupArraySampleState
Returns the intermediate state of sampling calculation.

### groupArraySampleMerge
Combines intermediate states to get the final array of sampled values.

### groupArraySampleMergeState
Combines intermediate states but returns an intermediate state.

### groupArraySampleForEach
Creates arrays from sampled values in corresponding elements of multiple arrays.

### groupArraySampleDistinct
Creates an array from distinct sampled values only.

### groupArraySampleOrDefault
Returns an empty array if there are no rows.

### groupArraySampleOrNull
Returns NULL if there are no rows. 