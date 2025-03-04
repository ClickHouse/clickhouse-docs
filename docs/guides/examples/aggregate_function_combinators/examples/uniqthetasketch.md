# uniqThetaSketch Combinator Examples

The following combinators can be applied to the `uniqThetaSketch` function:

### uniqThetaSketchIf
Calculates approximate number of different values using Theta Sketch algorithm only for rows that match the given condition.

### uniqThetaSketchArray
Calculates approximate number of different values using Theta Sketch algorithm from elements in the array.

### uniqThetaSketchMap
Calculates approximate number of different values using Theta Sketch algorithm for each key in the map separately.

### uniqThetaSketchSimpleState
Returns the Theta Sketch state with SimpleAggregateFunction type.

### uniqThetaSketchState
Returns the intermediate state of Theta Sketch calculation.

### uniqThetaSketchMerge
Combines intermediate states to get the final approximate count.

### uniqThetaSketchMergeState
Combines intermediate states but returns an intermediate state.

### uniqThetaSketchForEach
Calculates approximate number of different values using Theta Sketch algorithm for corresponding elements in multiple arrays.

### uniqThetaSketchDistinct
Calculates approximate number of different values using Theta Sketch algorithm using distinct values only.

### uniqThetaSketchOrDefault
Returns 0 if there are no rows.

### uniqThetaSketchOrNull
Returns NULL if there are no rows. 