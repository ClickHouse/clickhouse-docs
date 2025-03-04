# groupUniqArray Combinator Examples

The following combinators can be applied to the `groupUniqArray` function:

### groupUniqArrayIf
Creates an array of unique values only for rows that match the given condition.

### groupUniqArrayArray
Creates an array of unique values from elements in the array.

### groupUniqArrayMap
Creates an array of unique values for each key in the map separately.

### groupUniqArraySimpleState
Returns the array of unique values with SimpleAggregateFunction type.

### groupUniqArrayState
Returns the intermediate state of unique array construction.

### groupUniqArrayMerge
Combines intermediate states to get the final array of unique values.

### groupUniqArrayMergeState
Combines intermediate states but returns an intermediate state.

### groupUniqArrayForEach
Creates arrays of unique values from corresponding elements in multiple arrays.

### groupUniqArrayDistinct
Creates an array of unique values (same as regular function).

### groupUniqArrayOrDefault
Returns an empty array if there are no rows.

### groupUniqArrayOrNull
Returns NULL if there are no rows. 