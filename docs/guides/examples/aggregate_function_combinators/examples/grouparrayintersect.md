# groupArrayIntersect Combinator Examples

The following combinators can be applied to the `groupArrayIntersect` function:

### groupArrayIntersectIf
Returns an array of intersecting elements only for rows that match the given condition.

### groupArrayIntersectArray
Returns an array of intersecting elements from elements in the array.

### groupArrayIntersectMap
Returns an array of intersecting elements for each key in the map separately.

### groupArrayIntersectSimpleState
Returns the intersection array state with SimpleAggregateFunction type.

### groupArrayIntersectState
Returns the intermediate state of intersection array calculation.

### groupArrayIntersectMerge
Combines intermediate states to get the final intersection array.

### groupArrayIntersectMergeState
Combines intermediate states but returns an intermediate state.

### groupArrayIntersectForEach
Returns arrays of intersecting elements for corresponding elements in multiple arrays.

### groupArrayIntersectDistinct
Returns an array of intersecting elements using distinct values only.

### groupArrayIntersectOrDefault
Returns an empty array if there are no rows.

### groupArrayIntersectOrNull
Returns NULL if there are no rows. 