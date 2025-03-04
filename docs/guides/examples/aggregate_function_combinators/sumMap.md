---
slug: '/examples/aggregate-function-combinators/sumMap'
description: 'Example of using the sumMap combinator'
keywords: ['sum', 'map', 'combinator', 'examples', 'sumMap']
sidebar_label: 'sumMap'
---

# sumMap

The [`Map`](/sql-reference/aggregate-functions/combinators#-map) combinator can be applied to the [`sum`](/sql-reference/aggregate-functions/reference/sum) function to calculate the sum of values for each key in a map using the `sumMap` function.

This is useful when you want to aggregate values by key in a map structure.

## Example Usage

### Calculating website metric totals

In this example we'll use an example table with page metrics
to show how the `sumMap` function can be used to easily sum
values in a map. In our example table, event counts such as
page views, clicks, signups or purchases are stored in column
`event_counts` which is of type Map.

```sql title="Query"
CREATE TABLE website_metrics (
    date Date,
    website_section String,
    event_counts Map(String, UInt64)
) ENGINE = Memory;

INSERT INTO website_metrics VALUES
    ('2024-01-01', 'homepage', {'pageview': 1254, 'click': 385, 'signup': 42}),
    ('2024-01-01', 'products', {'pageview': 876, 'click': 423, 'purchase': 56}),
    ('2024-01-02', 'homepage', {'pageview': 1342, 'click': 401, 'signup': 38}),
    ('2024-01-02', 'products', {'pageview': 921, 'click': 458, 'purchase': 63});

-- Aggregate metrics by date across all website sections
SELECT 
    date,
    sumMap(event_counts) AS total_events_by_type
FROM website_metrics
GROUP BY date
ORDER BY date;
```

```markdown title="Response"
   ┌───────date─┬─total_events_by_type────────────────────────────────────┐
1. │ 2024-01-01 │ {'click':808,'pageview':2130,'purchase':56,'signup':42} │
2. │ 2024-01-02 │ {'click':859,'pageview':2263,'purchase':63,'signup':38} │
   └────────────┴─────────────────────────────────────────────────────────┘
```

### Calculate total revenue by region and product

In this example we'll use a table with regional sales data to calculate total revenue by region.

```sql title="Query"
CREATE TABLE regional_sales_map
(
    date Date,
    product_id String,
    regional_revenue Map(String, Float64)
) ENGINE = Memory;

INSERT INTO regional_sales_map VALUES
    ('2024-01-01', 'P1', {'North': 1000.5, 'South': 2000.3, 'East': 1500.8}),
    ('2024-01-01', 'P2', {'North': 3000.2, 'South': 4000.1, 'West': 2500.5}),
    ('2024-01-02', 'P1', {'North': 1200.3, 'South': 1800.5, 'East': 1600.2}),
    ('2024-01-02', 'P2', {'North': 2800.4, 'South': 3500.6, 'West': 2200.8});

SELECT
    date,
    sumMap(regional_revenue) AS total_revenue_by_region,
    sumMap(regional_revenue)['North'] AS north_revenue,
    sumMap(regional_revenue)['South'] AS south_revenue,
    sumMap(regional_revenue)['East'] AS east_revenue,
    sumMap(regional_revenue)['West'] AS west_revenue
FROM regional_sales_map
GROUP BY date
ORDER BY date ASC
```

```markdown title="Response"
   ┌───────date─┬─total_revenue_by_region─────────────────────────────────────┬─north_revenue─┬─south_revenue─┬─east_revenue─┬─west_revenue─┐
1. │ 2024-01-01 │ {'East':1500.8,'North':4000.7,'South':6000.4,'West':2500.5} │        4000.7 │        6000.4 │       1500.8 │       2500.5 │
2. │ 2024-01-02 │ {'East':1600.2,'North':4000.7,'South':5301.1,'West':2200.8} │        4000.7 │        5301.1 │       1600.2 │       2200.8 │
   └────────────┴─────────────────────────────────────────────────────────────┴───────────────┴───────────────┴──────────────┴──────────────┘
``` 