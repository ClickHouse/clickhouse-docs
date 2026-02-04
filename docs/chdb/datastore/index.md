---
title: 'DataStore - Pandas-Compatible API'
sidebar_label: 'Overview'
slug: /chdb/datastore
description: 'DataStore provides a pandas-compatible API with SQL optimization for high-performance data analysis'
keywords: ['chdb', 'datastore', 'pandas', 'dataframe', 'sql', 'lazy evaluation']
doc_type: 'guide'
---

# DataStore: Pandas-Compatible API with SQL Optimization

DataStore is chDB's pandas-compatible API that combines the familiar pandas DataFrame interface with the power of SQL query optimization. Write pandas-style code, get ClickHouse performance.

## Key Features {#key-features}

- **Pandas Compatibility**: 209 pandas DataFrame methods, 56 `.str` methods, 42+ `.dt` methods
- **SQL Optimization**: Operations automatically compile to optimized SQL queries
- **Lazy Evaluation**: Operations are deferred until results are needed
- **630+ API Methods**: Comprehensive API surface for data manipulation
- **ClickHouse Extensions**: Additional accessors (`.arr`, `.json`, `.url`, `.ip`, `.geo`) not available in pandas

## Architecture {#architecture}

<div style={{textAlign: 'center'}}>
  <img src={require('../images/datastore_architecture.png').default} alt="DataStore Architecture" style={{maxWidth: '700px', width: '100%'}} />
</div>

DataStore uses **lazy evaluation** with **dual-engine execution**:

1. **Lazy Operation Chain**: Operations are recorded, not executed immediately
2. **Smart Engine Selection**: QueryPlanner routes each segment to optimal engine (chDB for SQL, Pandas for complex ops)
3. **Intermediate Caching**: Results cached at each step for fast iterative exploration

See [Execution Model](execution-model.md) for details.

## One-Line Migration from Pandas {#migration}

```python
# Before (pandas)
import pandas as pd
df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()

# After (DataStore) - just change the import!
from chdb import datastore as pd
df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()
```

Your existing pandas code works unchanged, but now runs on the ClickHouse engine.

## Performance Comparison {#performance}

DataStore delivers significant performance improvements over pandas, especially for aggregation and complex pipelines:

| Operation | Pandas | DataStore | Speedup |
|-----------|--------|-----------|---------|
| GroupBy count | 347ms | 17ms | **19.93x** |
| Complex pipeline | 2,047ms | 380ms | **5.39x** |
| Filter+Sort+Head | 1,537ms | 350ms | **4.40x** |
| GroupBy agg | 406ms | 141ms | **2.88x** |

*Benchmark on 10M rows. See [benchmark script](https://github.com/chdb-io/chdb/blob/main/refs/benchmark_datastore_vs_pandas.py) and [Performance Guide](../guides/pandas-performance.md) for details.*

## When to Use DataStore {#when-to-use}

**Use DataStore when:**
- Working with large datasets (millions of rows)
- Performing aggregations and groupby operations
- Querying data from files, databases, or cloud storage
- Building complex data pipelines
- You want pandas API with better performance

**Use raw SQL API when:**
- You prefer writing SQL directly
- You need fine-grained control over query execution
- Working with ClickHouse-specific features not exposed in pandas API

## Feature Comparison {#comparison}

| Feature | pandas | polars | DuckDB | DataStore |
|---------|--------|--------|--------|-----------|
| Pandas API compatible | - | Partial | No | **Full** |
| Lazy evaluation | No | Yes | Yes | **Yes** |
| SQL query support | No | Yes | Yes | **Yes** |
| ClickHouse functions | No | No | No | **Yes** |
| String/DateTime accessors | Yes | Yes | No | **Yes + extras** |
| Array/JSON/URL/IP/Geo | No | Partial | No | **Yes** |
| Direct file queries | No | Yes | Yes | **Yes** |
| Cloud storage support | No | Limited | Yes | **Yes** |

## API Statistics {#api-stats}

| Category | Count | Coverage |
|----------|-------|----------|
| DataFrame methods | 209 | 100% of pandas |
| Series.str accessor | 56 | 100% of pandas |
| Series.dt accessor | 42+ | 100%+ (includes ClickHouse extras) |
| Series.arr accessor | 37 | ClickHouse-specific |
| Series.json accessor | 13 | ClickHouse-specific |
| Series.url accessor | 15 | ClickHouse-specific |
| Series.ip accessor | 9 | ClickHouse-specific |
| Series.geo accessor | 14 | ClickHouse-specific |
| **Total API methods** | **630+** | - |

## Documentation Navigation {#navigation}

### Getting Started {#getting-started}
- [Quickstart](quickstart.md) - Installation and basic usage
- [Migration from Pandas](../guides/migration-from-pandas.md) - Step-by-step migration guide

### API Reference {#api-reference}
- [Factory Methods](factory-methods.md) - Creating DataStore from various sources
- [Query Building](query-building.md) - SQL-style query operations
- [Pandas Compatibility](pandas-compat.md) - All 209 pandas-compatible methods
- [Accessors](accessors.md) - String, DateTime, Array, JSON, URL, IP, Geo accessors
- [Aggregation](aggregation.md) - Aggregate and window functions
- [I/O Operations](io.md) - Reading and writing data

### Advanced Topics {#advanced-topics}
- [Execution Model](execution-model.md) - Lazy evaluation and caching
- [Class Reference](class-reference.md) - Complete API reference

### Configuration & Debugging {#configuration-debugging}
- [Configuration](../configuration/index.md) - All configuration options
- [Debugging](../debugging/index.md) - Explain, profiling, and logging

### Pandas User Guides {#pandas-user-guides}
- [Pandas Cookbook](../guides/pandas-cookbook.md) - Common patterns
- [Key Differences](../guides/pandas-differences.md) - Important differences from pandas
- [Performance Guide](../guides/pandas-performance.md) - Optimization tips
- [SQL for Pandas Users](../guides/pandas-to-sql.md) - Understanding the SQL behind pandas operations

## Quick Example {#quick-example}

```python
from chdb import datastore as pd

# Read data from various sources
ds = pd.read_csv("sales.csv")
# or: ds = pd.DataStore.uri("s3://bucket/sales.parquet")
# or: ds = pd.DataStore.from_mysql("mysql://user:pass@host/db/table")

# Familiar pandas operations - automatically optimized to SQL
result = (ds
    .filter(ds['amount'] > 1000)           # WHERE amount > 1000
    .groupby('region')                      # GROUP BY region
    .agg({'amount': ['sum', 'mean']})       # SUM(amount), AVG(amount)
    .sort_values('sum', ascending=False)    # ORDER BY sum DESC
    .head(10)                               # LIMIT 10
)

# View the generated SQL
print(result.to_sql())

# Execute and get results
df = result.to_df()  # Returns pandas DataFrame
```

## Next Steps {#next-steps}

- **New to DataStore?** Start with the [Quickstart Guide](quickstart.md)
- **Coming from pandas?** Read the [Migration Guide](../guides/migration-from-pandas.md)
- **Want to learn more?** Explore the [API Reference](class-reference.md)
