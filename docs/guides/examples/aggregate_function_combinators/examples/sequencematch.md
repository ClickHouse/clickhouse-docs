# sequenceMatch Combinator Examples

The following combinators can be applied to the `sequenceMatch`, `sequenceCount`, and `sequenceMatchEvents` functions:

### sequenceMatchIf
Matches event sequence patterns only for rows that match the given condition.

### sequenceMatchArray
Matches event sequence patterns from elements in the array.

### sequenceMatchMap
Matches event sequence patterns for each key in the map separately.

### sequenceMatchSimpleState
Returns the sequence matching state with SimpleAggregateFunction type.

### sequenceMatchState
Returns the intermediate state of sequence matching calculation.

### sequenceMatchMerge
Combines intermediate states to get the final sequence matching result.

### sequenceMatchMergeState
Combines intermediate states but returns an intermediate state.

### sequenceMatchForEach
Matches event sequence patterns for corresponding elements in multiple arrays.

### sequenceMatchDistinct
Matches event sequence patterns using distinct events only.

### sequenceMatchOrDefault
Returns 0 if there are no rows.

### sequenceMatchOrNull
Returns NULL if there are no rows.

### sequenceCountIf
Counts matching sequences only for rows that match the given condition.

### sequenceCountArray
Counts matching sequences from elements in the array.

### sequenceCountMap
Counts matching sequences for each key in the map separately.

### sequenceCountSimpleState
Returns the sequence counting state with SimpleAggregateFunction type.

### sequenceCountState
Returns the intermediate state of sequence counting calculation.

### sequenceCountMerge
Combines intermediate states to get the final sequence count.

### sequenceCountMergeState
Combines intermediate states but returns an intermediate state.

### sequenceCountForEach
Counts matching sequences for corresponding elements in multiple arrays.

### sequenceCountDistinct
Counts matching sequences using distinct events only.

### sequenceCountOrDefault
Returns 0 if there are no rows.

### sequenceCountOrNull
Returns NULL if there are no rows.

### sequenceMatchEventsIf
Matches and returns event details only for rows that match the given condition.

### sequenceMatchEventsArray
Matches and returns event details from elements in the array.

### sequenceMatchEventsMap
Matches and returns event details for each key in the map separately.

### sequenceMatchEventsSimpleState
Returns the event matching state with SimpleAggregateFunction type.

### sequenceMatchEventsState
Returns the intermediate state of event matching calculation.

### sequenceMatchEventsMerge
Combines intermediate states to get the final event matching details.

### sequenceMatchEventsMergeState
Combines intermediate states but returns an intermediate state.

### sequenceMatchEventsForEach
Matches and returns event details for corresponding elements in multiple arrays.

### sequenceMatchEventsDistinct
Matches and returns event details using distinct events only.

### sequenceMatchEventsOrDefault
Returns an empty array if there are no rows.

### sequenceMatchEventsOrNull
Returns NULL if there are no rows. 