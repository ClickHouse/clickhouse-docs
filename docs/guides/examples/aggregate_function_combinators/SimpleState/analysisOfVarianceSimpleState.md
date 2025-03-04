---
slug: '/examples/aggregate-function-combinators/SimpleState/analysisOfVarianceSimpleState'
description: 'Example of using the analysisOfVarianceSimpleState combinator'
keywords: ['analysisofvariance', 'simplestate', 'combinator', 'examples', 'analysisOfVarianceSimpleState']
sidebar_label: 'analysisOfVarianceSimpleState'
---

# analysisOfVarianceSimpleState example

The [SimpleState](/sql-reference/aggregate-functions/combinators#-simplestate) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysisofvariance) function to return the ANOVA state with SimpleAggregateFunction type using the `analysisOfVarianceSimpleState` function.

## Example Usage

```sql
SELECT analysisOfVarianceSimpleState(value) FROM table;
``` 