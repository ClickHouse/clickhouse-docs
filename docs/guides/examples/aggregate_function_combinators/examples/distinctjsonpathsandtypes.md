# distinctJSONPathsAndTypes Combinator Examples

The following combinators can be applied to the `distinctJSONPathsAndTypes` function:

### distinctJSONPathsAndTypesIf
Returns distinct JSON paths and their types only for rows that match the given condition.

### distinctJSONPathsAndTypesArray
Returns distinct JSON paths and their types from elements in the array.

### distinctJSONPathsAndTypesMap
Returns distinct JSON paths and their types for each key in the map separately.

### distinctJSONPathsAndTypesSimpleState
Returns the distinct paths and types state with SimpleAggregateFunction type.

### distinctJSONPathsAndTypesState
Returns the intermediate state of distinct paths and types calculation.

### distinctJSONPathsAndTypesMerge
Combines intermediate states to get the final distinct JSON paths and types.

### distinctJSONPathsAndTypesMergeState
Combines intermediate states but returns an intermediate state.

### distinctJSONPathsAndTypesForEach
Returns distinct JSON paths and their types for corresponding elements in multiple arrays.

### distinctJSONPathsAndTypesDistinct
Returns distinct JSON paths and their types using distinct values only.

### distinctJSONPathsAndTypesOrDefault
Returns an empty array if there are no rows.

### distinctJSONPathsAndTypesOrNull
Returns NULL if there are no rows. 