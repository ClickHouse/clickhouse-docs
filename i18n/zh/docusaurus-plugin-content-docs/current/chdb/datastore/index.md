---
title: 'DataStore - 兼容 Pandas 的 API'
sidebar_label: '概览'
slug: /chdb/datastore
description: 'DataStore 提供兼容 Pandas 的 API，并利用 SQL 优化实现高性能数据分析'
keywords: ['chdb', 'datastore', 'pandas', 'dataframe', 'sql', 'lazy evaluation']
doc_type: 'guide'
---

# DataStore：Pandas 兼容 API 与 SQL 优化 \{#datastore-pandas-compatible-api-with-sql-optimization\}

DataStore 是 chDB 提供的、与 pandas 兼容的 API，它将熟悉的 pandas DataFrame 接口与 SQL 查询优化的强大能力相结合。使用 pandas 风格的代码，即可获得 ClickHouse 级别的性能。

## 关键特性 \{#key-features\}

- **Pandas 兼容性**：支持 209 个 pandas DataFrame 方法、56 个 `.str` 方法、42+ 个 `.dt` 方法
- **SQL 优化**：操作会自动编译为优化后的 SQL 查询
- **惰性求值**：仅在需要结果时才执行操作
- **630+ API 方法**：用于数据操作的完备 API 接口集合
- **ClickHouse 扩展**：提供 pandas 中不可用的额外访问器（`.arr`、`.json`、`.url`、`.ip`、`.geo`）

## 架构 \{#architecture\}

<div style={{textAlign: 'center'}}>
  <img src="../images/datastore_architecture.png" alt="DataStore 架构" style={{maxWidth: '700px', width: '100%'}} />
</div>

DataStore 采用具有 **惰性求值** 特性的 **双引擎执行**：

1. **惰性操作链**：只记录操作，而不是立即执行
2. **智能引擎选择**：QueryPlanner 将每个阶段路由到最优引擎（SQL 使用 chDB，复杂操作使用 Pandas）
3. **中间结果缓存**：在每一步缓存结果，以支持快速的迭代式探索

详情请参见 [执行模型](execution-model.md)。

## 一行代码迁移自 Pandas \{#migration\}

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

你现有的 pandas 代码可以不作任何修改直接运行，只是现在是在 ClickHouse 引擎上执行。


## 性能对比 \{#performance\}

与 pandas 相比，DataStore 在性能上有显著提升，尤其是在聚合和复杂处理流水线场景中：

| 操作 | Pandas | DataStore | 加速比 |
|-----------|--------|-----------|---------|
| GroupBy count | 347ms | 17ms | **19.93x** |
| Complex pipeline | 2,047ms | 380ms | **5.39x** |
| Filter+Sort+Head | 1,537ms | 350ms | **4.40x** |
| GroupBy agg | 406ms | 141ms | **2.88x** |

*基于 10M 行数据的基准测试。详情参见 [benchmark script](https://github.com/chdb-io/chdb/blob/main/refs/benchmark_datastore_vs_pandas.py) 和 [Performance Guide](../guides/pandas-performance.md)。*

## 何时使用 DataStore \{#when-to-use\}

**在以下情况下使用 DataStore：**

- 处理大规模数据集（数百万行）
- 执行聚合和 groupby（分组）操作
- 从文件、数据库或 Cloud 存储中查询数据
- 构建复杂数据管道
- 希望在使用 pandas API 的同时获得更高性能

**在以下情况下使用原生 SQL API：**

- 更喜欢直接编写 SQL 时
- 需要对查询执行进行细粒度控制时
- 需要使用 pandas API 无法访问的 ClickHouse 特性时

## 功能比较 \{#comparison\}

| 功能 | Pandas | Polars  | DuckDB | DataStore |
|---------|--------|---------|--------|-----------|
| Pandas API 兼容性 | -      | 部分兼容 | 否 | **完全兼容** |
| 惰性求值 | 否     | 是     | 是 | **是** |
| SQL 查询支持 | 否     | 是     | 是 | **是** |
| ClickHouse 函数 | 否     | 否      | 否 | **是** |
| 字符串/日期时间访问器 | 是    | 是     | 否 | **是 + 额外扩展** |
| 数组/JSON/URL/IP/Geo | 否     | 部分支持 | 否 | **是** |
| 直接文件查询 | 否     | 是     | 是 | **是** |
| Cloud 存储支持 | 否     | 有限支持 | 是 | **是** |

## API 统计信息 \{#api-stats\}

| 类别 | 数量 | 覆盖率 |
|----------|-------|----------|
| DataFrame 方法 | 209 | 覆盖 pandas 的 100% |
| Series.str 访问器 | 56 | 覆盖 pandas 的 100% |
| Series.dt 访问器 | 42+ | 覆盖 100%+（包括 ClickHouse 扩展） |
| Series.arr 访问器 | 37 | ClickHouse 特有 |
| Series.json 访问器 | 13 | ClickHouse 特有 |
| Series.url 访问器 | 15 | ClickHouse 特有 |
| Series.ip 访问器 | 9 | ClickHouse 特有 |
| Series.geo 访问器 | 14 | ClickHouse 特有 |
| **API 方法总数** | **630+** | - |

## 文档导航 \{#navigation\}

### 入门 \{#getting-started\}

- [快速开始](quickstart.md) - 安装和基本用法
- [从 Pandas 迁移](../guides/migration-from-pandas.md) - 分步迁移指南

### API 参考 \{#api-reference\}

- [Factory Methods](factory-methods.md) - 从各种数据源创建 DataStore 的工厂方法
- [Query Building](query-building.md) - 类 SQL 风格的查询操作
- [Pandas Compatibility](pandas-compat.md) - 全部 209 个与 pandas 兼容的方法
- [Accessors](accessors.md) - 字符串、DateTime、Array、JSON、URL、IP、Geo 访问器
- [Aggregation](aggregation.md) - 聚合和窗口函数
- [I/O Operations](io.md) - 数据的输入/输出操作

### 高级主题 \{#advanced-topics\}

- [执行模型](execution-model.md) - 惰性求值与缓存
- [类参考](class-reference.md) - 完整 API 参考文档

### 配置与调试 \{#configuration-debugging\}

- [配置](../configuration/index.md) - 所有配置选项
- [性能模式](../configuration/performance-mode.md) - 为最大吞吐量优化的 SQL 优先模式
- [调试](../debugging/index.md) - Explain、性能剖析和日志记录

### Pandas 使用指南 \{#pandas-user-guides\}

- [Pandas Cookbook](../guides/pandas-cookbook.md) - 常用模式示例
- [关键差异](../guides/pandas-differences.md) - 与 pandas 的重要区别
- [性能指南](../guides/pandas-performance.md) - 优化建议
- [面向 Pandas 用户的 SQL](../guides/pandas-to-sql.md) - 理解 pandas 操作背后的 SQL

## 快速示例 \{#quick-example\}

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


## 后续步骤 \{#next-steps\}

- **DataStore 新手？** 请从[快速入门指南](quickstart.md)开始
- **从 pandas 迁移？** 请阅读[迁移指南](../guides/migration-from-pandas.md)
- **想了解更多？** 请查看 [API 参考文档](class-reference.md)