# anyHeavy Combinator Examples

The following combinators can be applied to the `anyHeavy` function:

### anyHeavyIf
Returns a frequently occurring value using the heavy hitters algorithm only for rows that match the given condition.

### anyHeavyArray
Returns a frequently occurring value using the heavy hitters algorithm from elements in the array.

### anyHeavyMap
Returns a frequently occurring value using the heavy hitters algorithm for each key in the map separately.

### anyHeavySimpleState
Returns the heavy hitters state with SimpleAggregateFunction type.

### anyHeavyState
Returns the intermediate state of heavy hitters calculation.

### anyHeavyMerge
Combines intermediate states to get the final frequently occurring value.

### anyHeavyMergeState
Combines intermediate states but returns an intermediate state.

### anyHeavyForEach
Returns frequently occurring values using the heavy hitters algorithm for corresponding elements in multiple arrays.

### anyHeavyDistinct
Returns a frequently occurring value using the heavy hitters algorithm using distinct values only.

### anyHeavyOrDefault
Returns default value if there are no rows.

### anyHeavyOrNull
Returns NULL if there are no rows. 