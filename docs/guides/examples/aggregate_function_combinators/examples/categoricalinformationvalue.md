# categoricalInformationValue Combinator Examples

The following combinators can be applied to the `categoricalInformationValue` function:

### categoricalInformationValueIf
Calculates information value for categorical variables only for rows that match the given condition.

### categoricalInformationValueArray
Calculates information value for categorical variables from elements in the array.

### categoricalInformationValueMap
Calculates information value for categorical variables for each key in the map separately.

### categoricalInformationValueSimpleState
Returns the information value state with SimpleAggregateFunction type.

### categoricalInformationValueState
Returns the intermediate state of information value calculation.

### categoricalInformationValueMerge
Combines intermediate states to get the final information value.

### categoricalInformationValueMergeState
Combines intermediate states but returns an intermediate state.

### categoricalInformationValueForEach
Calculates information value for categorical variables for corresponding elements in multiple arrays.

### categoricalInformationValueDistinct
Calculates information value for categorical variables using distinct values only.

### categoricalInformationValueOrDefault
Returns 0 if there are no rows.

### categoricalInformationValueOrNull
Returns NULL if there are no rows. 