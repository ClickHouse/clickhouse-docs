---
title: 'explain() 方法'
sidebar_label: 'explain()'
slug: /chdb/debugging/explain
description: '使用 explain() 方法查看 DataStore 的执行计划'
keywords: ['chdb', 'datastore', 'explain', 'execution', 'plan', 'sql']
doc_type: 'reference'
---

# explain() 方法 \{#explain-method\}

`explain()` 方法会显示 DataStore 查询的执行计划，帮助你理解将执行哪些操作以及会生成哪些 SQL。

## 基本用法 \{#basic\}

```python
from pathlib import Path
Path("sales.csv").write_text("""\
region,product,category,amount,quantity,price,date,order_id
East,Widget,Electronics,5200,10,120,2024-01-15,1001
West,Gadget,Electronics,800,5,160,2024-02-20,1002
East,Gizmo,Home,6500,3,100,2024-03-10,1003
North,Widget,Electronics,4500,6,150,2024-06-18,1004
West,Gadget,Electronics,2000,8,250,2024-09-14,1005
""")

from chdb import datastore as pd

ds = pd.read_csv("sales.csv")

query = (ds
    .filter(ds['amount'] > 1000)
    .groupby('region')
    .agg({'amount': ['sum', 'mean']})
    .sort('sum', ascending=False)
)

# View execution plan
query.explain()
```


## 语法 \{#syntax\}

```python
explain(verbose=False) -> None
```

**参数：**

| 参数名       | 类型   | 默认值     | 描述      |
| --------- | ---- | ------- | ------- |
| `verbose` | bool | `False` | 显示更多元数据 |


## 输出格式 \{#output-format\}

### 标准输出 \{#standard\}

```text
================================================================================
Execution Plan (in execution order)
================================================================================

 [1] 📊 Data Source: file('sales.csv', 'csv')

Operations:
────────────────────────────────────────────────────────────────────────────────
    ️  Segment 1 [chDB] (from source): Operations 2-5
    ️  Note: SQL operations after Pandas ops use Python() table function

 [2] 🚀 [chDB] WHERE: "amount" > 1000
 [3] 🚀 [chDB] GROUP BY: region
 [4] 🚀 [chDB] AGGREGATE: sum(amount), avg(amount)
 [5] 🚀 [chDB] ORDER BY: sum DESC

────────────────────────────────────────────────────────────────────────────────
Final State: 📊 Pending (lazy, not yet executed)
             └─> Will execute when print(), .to_df(), .execute() is called

────────────────────────────────────────────────────────────────────────────────
Generated SQL Query:
────────────────────────────────────────────────────────────────────────────────

SELECT region, SUM(amount) AS sum, AVG(amount) AS mean
FROM file('sales.csv', 'csv')
WHERE "amount" > 1000
GROUP BY region
ORDER BY sum DESC

================================================================================
```


### 图标说明 \{#icons\}

| 图标 | 含义 |
|------|---------|
| 📊 | 数据源 |
| 🚀 | chDB（SQL）操作 |
| 🐼 | pandas 操作 |

### 详细输出 \{#verbose\}

```python
query.explain(verbose=True)
```

详细模式会为每个操作显示更多细节，包括带有内部行顺序跟踪机制的完整 SQL 查询。

***


## 三个执行阶段 \{#phases\}

`EXPLAIN` 的输出将操作分为三个阶段：

### 阶段 1：SQL 查询构建（惰性执行） \{#phase-1\}

将被编译为 SQL 的操作：

```text
  1. Source: file('sales.csv', 'CSVWithNames')
  2. Filter: amount > 1000      
  3. GroupBy: region
  4. Aggregate: sum(amount)
```


### 阶段 2：执行点 \{#phase-2\}

当触发器被触发时：

```text
  5. Execute SQL -> DataFrame
     Trigger: to_df() called
```


### 阶段 3：DataFrame 操作 \{#phase-3\}

执行完成后的操作：

```text
  6. [pandas] pivot_table(...)
  7. [pandas] apply(custom_func)
```

***


## 理解查询计划 \{#understanding\}

### 源信息 \{#source\}

```text
Source: file('sales.csv', 'CSVWithNames')
```

* `file()` - ClickHouse 的 file() 表函数
* `'CSVWithNames'` - 带表头的文件格式

其他数据源类型：

```text
Source: s3('bucket/data.parquet', ...)
Source: mysql('host', 'db', 'table', ...)
Source: __dataframe__  (pandas DataFrame input)
```


### 过滤操作 \{#filter\}

```text
Filter: amount > 1000 AND status = 'active'
```

显示将应用的 WHERE 子句。


### GROUP BY 与聚合 \{#groupby\}

```text
GroupBy: region, category
Aggregate: sum(amount), avg(amount), count(id)
```

显示 GROUP BY 所使用的列和聚合函数。


### 排序操作 \{#sort\}

```text
Sort: sum DESC, region ASC
```

展示 ORDER BY 子句。


### LIMIT 操作 \{#limit\}

```text
Limit: 10
Offset: 100
```

显示 LIMIT 和 OFFSET。

***


## 引擎信息 \{#engine\}

启用详细模式时，可以看到将使用的引擎：

```text
Filter: amount > 1000
  - Engine: chdb
  - Pushdown: Yes

Apply: custom_function
  - Engine: pandas
  - Pushdown: No
```


### 下推 \{#pushdown\}

- **是**：操作将在数据源侧（SQL）执行
- **否**：操作需要在 pandas 中执行

---

## 示例 \{#examples\}

### 简单查询 \{#example-simple\}

```python
from pathlib import Path
Path("data.csv").write_text("""\
name,age,city,salary,department
Alice,25,NYC,55000,Engineering
Bob,30,LA,65000,Product
Charlie,35,NYC,80000,Engineering
Diana,28,SF,70000,Design
Eve,42,NYC,95000,Product
""")

ds = pd.read_csv("data.csv")
ds.filter(ds['age'] > 25).explain()
```

```text
================================================================================
Execution Plan (in execution order)
================================================================================

 [1] 📊 Data Source: file('data.csv', 'csv')

Operations:
────────────────────────────────────────────────────────────────────────────────
    ️  Segment 1 [chDB] (from source): Operations 2-2

 [2] 🚀 [chDB] WHERE: "age" > 25

────────────────────────────────────────────────────────────────────────────────
Generated SQL Query:
────────────────────────────────────────────────────────────────────────────────

SELECT * FROM file('data.csv', 'csv') WHERE "age" > 25

================================================================================
```


### 复杂聚合 \{#example-complex\}

```python
query = (ds
    .filter(ds['date'] >= '2024-01-01')
    .filter(ds['amount'] > 100)
    .select('region', 'category', 'amount')
    .groupby('region', 'category')
    .agg({
        'amount': ['sum', 'mean', 'count']
    })
    .sort('sum', ascending=False)
    .limit(20)
)
query.explain()
```

```text
================================================================================
Execution Plan (in execution order)
================================================================================

 [1] 📊 Data Source: file('sales.csv', 'csv')

Operations:
────────────────────────────────────────────────────────────────────────────────
    ️  Segment 1 [chDB] (from source): Operations 2-8

 [2] 🚀 [chDB] WHERE: "date" >= '2024-01-01'
 [3] 🚀 [chDB] WHERE: "amount" > 100
 [4] 🚀 [chDB] SELECT: region, category, amount
 [5] 🚀 [chDB] GROUP BY: region, category
 [6] 🚀 [chDB] AGGREGATE: sum(amount), avg(amount), count(amount)
 [7] 🚀 [chDB] ORDER BY: sum DESC
 [8] 🚀 [chDB] LIMIT: 20

────────────────────────────────────────────────────────────────────────────────
Generated SQL Query:
────────────────────────────────────────────────────────────────────────────────

SELECT region, category, 
       SUM(amount) AS sum, 
       AVG(amount) AS mean, 
       COUNT(amount) AS count
FROM file('sales.csv', 'csv')
WHERE "date" >= '2024-01-01' AND "amount" > 100
GROUP BY region, category
ORDER BY sum DESC
LIMIT 20

================================================================================
```


### 混合使用 SQL 和 pandas \{#example-mixed\}

当操作无法完全下推到 SQL 时，查询计划会显示多个阶段：

```python
query = (ds
    .filter(ds['age'] > 25)           # SQL
    .groupby('city')                   # SQL
    .agg({'salary': 'mean'})           # SQL
    .apply(lambda x: x * 1.1)          # pandas (triggers segment split)
    .filter(ds['mean'] > 50000)        # SQL (new segment)
)
query.explain()
```

```text
================================================================================
Execution Plan (in execution order)
================================================================================

 [1] 📊 Data Source: file('data.csv', 'csv')

Operations:
────────────────────────────────────────────────────────────────────────────────
    ️  Segment 1 [chDB] (from source): Operations 2-4
    ️  Segment 2 [Pandas] (on DataFrame): Operation 5
    ️  Segment 3 [chDB] (on DataFrame): Operation 6
    ️  Note: SQL operations after Pandas ops use Python() table function

 [2] 🚀 [chDB] WHERE: "age" > 25
 [3] 🚀 [chDB] GROUP BY: city
 [4] 🚀 [chDB] AGGREGATE: avg(salary)
 [5] 🐼 [Pandas] APPLY: lambda
 [6] 🚀 [chDB] WHERE: "mean" > 50000

================================================================================
```

***


## 使用 explain() 调试 \{#debugging\}

### 验证过滤逻辑 \{#debug-filter\}

```python
# Verify your filter is correct
query = ds.filter((ds['age'] > 25) & (ds['city'] == 'NYC'))
query.explain()
# Output shows: Filter: age > 25 AND city = 'NYC'
```


### 检查列选择 \{#debug-select\}

```python
# Check column pruning
query = ds.select('name', 'age').filter(ds['age'] > 25)
query.explain()
# Output shows: SELECT name, age FROM ... WHERE age > 25
```


### 理解聚合 \{#debug-agg\}

```python
# Check aggregation functions
query = ds.groupby('dept').agg({'salary': ['sum', 'mean', 'std']})
query.explain()
# Output shows: SELECT dept, SUM(salary), AVG(salary), stddevPop(salary)
```

***


## 最佳实践 \{#best-practices\}

### 1. 在执行大查询之前先检查 \{#best-practice-1\}

```python
# Always explain first for large data
query = ds.complex_pipeline()
query.explain()  # Check plan

# If plan looks correct
result = query.to_df()  # Execute
```


### 2. 使用详细输出（verbose）进行调试 \{#best-practice-2\}

```python
# When something seems wrong
query.explain(verbose=True)
# Shows engine selection and pushdown info
```


### 3. 与 to_sql() 的对比 \{#best-practice-3\}

```python
# explain() shows the plan
query.explain()

# to_sql() shows just the SQL
print(query.to_sql())

# Both useful for different purposes
```


### 4. 检查下推情况 \{#best-practice-4\}

```python
# Verbose mode shows if operations are pushed down
query.explain(verbose=True)

# If Pushdown: No, operation runs in pandas
# Consider restructuring query for better performance
```
