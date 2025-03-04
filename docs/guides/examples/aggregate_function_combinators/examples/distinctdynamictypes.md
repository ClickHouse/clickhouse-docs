# distinctDynamicTypes Combinator Examples

The following combinators can be applied to the `distinctDynamicTypes` function:

### distinctDynamicTypesIf
Returns distinct dynamic types only for rows that match the given condition.

### distinctDynamicTypesArray
Returns distinct dynamic types from elements in the array.

### distinctDynamicTypesMap
Returns distinct dynamic types for each key in the map separately.

### distinctDynamicTypesSimpleState
Returns the distinct types state with SimpleAggregateFunction type.

### distinctDynamicTypesState
Returns the intermediate state of distinct types calculation.

### distinctDynamicTypesMerge
Combines intermediate states to get the final distinct types.

### distinctDynamicTypesMergeState
Combines intermediate states but returns an intermediate state.

### distinctDynamicTypesForEach
Returns distinct dynamic types for corresponding elements in multiple arrays.

### distinctDynamicTypesDistinct
Returns distinct dynamic types using distinct values only.

### distinctDynamicTypesOrDefault
Returns an empty array if there are no rows.

### distinctDynamicTypesOrNull
Returns NULL if there are no rows. 