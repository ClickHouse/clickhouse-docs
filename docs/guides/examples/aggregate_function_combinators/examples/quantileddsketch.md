# quantileDDSketch Combinator Examples

The following combinators can be applied to the `quantileDDSketch` function:

### quantileDDSketchIf
Calculates quantile using the DDSketch algorithm only for rows that match the given condition.

### quantileDDSketchArray
Calculates quantile using the DDSketch algorithm from elements in the array.

### quantileDDSketchMap
Calculates quantile using the DDSketch algorithm for each key in the map separately.

### quantileDDSketchSimpleState
Returns the DDSketch state with SimpleAggregateFunction type.

### quantileDDSketchState
Returns the intermediate state of DDSketch quantile calculation.

### quantileDDSketchMerge
Combines intermediate states to get the final quantile value.

### quantileDDSketchMergeState
Combines intermediate states but returns an intermediate state.

### quantileDDSketchForEach
Calculates quantiles using the DDSketch algorithm for corresponding elements in multiple arrays.

### quantileDDSketchDistinct
Calculates quantile using the DDSketch algorithm using distinct values only.

### quantileDDSketchOrDefault
Returns 0 if there are no rows.

### quantileDDSketchOrNull
Returns NULL if there are no rows. 