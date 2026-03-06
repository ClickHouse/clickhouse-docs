---
title: 'explain() メソッド'
sidebar_label: 'explain()'
slug: /chdb/debugging/explain
description: 'explain() メソッドで DataStore の実行計画を表示する'
keywords: ['chdb', 'datastore', 'explain', 'execution', 'plan', 'sql']
doc_type: 'reference'
---

# explain() メソッド \{#explain-method\}

`explain()` メソッドは DataStore のクエリに対する実行計画を表示し、どのような処理が行われ、どのような SQL が生成されるかを把握するのに役立ちます。

## 基本的な使い方 \{#basic\}

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


## 構文 \{#syntax\}

```python
explain(verbose=False) -> None
```

**パラメーター:**

| パラメーター    | 型    | デフォルト   | 説明             |
| --------- | ---- | ------- | -------------- |
| `verbose` | bool | `False` | 追加のメタデータを表示します |


## 出力フォーマット \{#output-format\}

### 標準出力 \{#standard\}

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


### アイコンの凡例 \{#icons\}

| アイコン | 意味 |
|------|---------|
| 📊 | データソース |
| 🚀 | chDB (SQL) 操作 |
| 🐼 | pandas 操作 |

### 詳細な出力 \{#verbose\}

```python
query.explain(verbose=True)
```

Verbose モードでは、各オペレーションごとに、内部の行順序トラッキング機構を含む完全な SQL クエリなど、追加の詳細が表示されます。

***


## 3 つの実行フェーズ \{#phases\}

`explain` の出力では、処理が次の 3 つのフェーズに分けて示されます。

### フェーズ1: SQL クエリ構築（遅延評価） \{#phase-1\}

SQL にコンパイルされる操作:

```text
  1. Source: file('sales.csv', 'CSVWithNames')
  2. Filter: amount > 1000      
  3. GroupBy: region
  4. Aggregate: sum(amount)
```


### フェーズ 2: 実行ポイント \{#phase-2\}

トリガーが発生したとき:

```text
  5. Execute SQL -> DataFrame
     Trigger: to_df() called
```


### フェーズ 3: DataFrame の操作 \{#phase-3\}

実行後に行う操作:

```text
  6. [pandas] pivot_table(...)
  7. [pandas] apply(custom_func)
```

***


## プランを理解する \{#understanding\}

### ソース情報 \{#source\}

```text
Source: file('sales.csv', 'CSVWithNames')
```

* `file()` - ClickHouse の file() テーブル関数
* `'CSVWithNames'` - ヘッダー行付きのファイル形式

その他のソースタイプ:

```text
Source: s3('bucket/data.parquet', ...)
Source: mysql('host', 'db', 'table', ...)
Source: __dataframe__  (pandas DataFrame input)
```


### フィルタ処理 \{#filter\}

```text
Filter: amount > 1000 AND status = 'active'
```

適用される WHERE 句を表示します。


### GROUP BY と集約 \{#groupby\}

```text
GroupBy: region, category
Aggregate: sum(amount), avg(amount), count(id)
```

GROUP BY のカラムと集約関数を表示します。


### ソート操作 \{#sort\}

```text
Sort: sum DESC, region ASC
```

ORDER BY 句を示します。


### LIMIT 操作 \{#limit\}

```text
Limit: 10
Offset: 100
```

LIMIT および OFFSET を示します。

***


## エンジン情報 \{#engine\}

verbose モードを使用すると、どのエンジンが使われるかを確認できます。

```text
Filter: amount > 1000
  - Engine: chdb
  - Pushdown: Yes

Apply: custom_function
  - Engine: pandas
  - Pushdown: No
```


### プッシュダウン \{#pushdown\}

- **はい**: 処理はデータソース（SQL）側で実行されます
- **いいえ**: 処理は pandas 側での実行が必要です

---

## 例 \{#examples\}

### 単純なクエリ \{#example-simple\}

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


### 高度な集約 \{#example-complex\}

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


### SQL と pandas の混在 \{#example-mixed\}

処理をすべて SQL 側に委譲できない場合、実行プランには複数のセグメントが表示されます。

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


## explain() を使ったデバッグ \{#debugging\}

### フィルター条件のロジックを確認する \{#debug-filter\}

```python
# Verify your filter is correct
query = ds.filter((ds['age'] > 25) & (ds['city'] == 'NYC'))
query.explain()
# Output shows: Filter: age > 25 AND city = 'NYC'
```


### カラム選択を検証する \{#debug-select\}

```python
# Check column pruning
query = ds.select('name', 'age').filter(ds['age'] > 25)
query.explain()
# Output shows: SELECT name, age FROM ... WHERE age > 25
```


### 集約を理解する \{#debug-agg\}

```python
# Check aggregation functions
query = ds.groupby('dept').agg({'salary': ['sum', 'mean', 'std']})
query.explain()
# Output shows: SELECT dept, SUM(salary), AVG(salary), stddevPop(salary)
```

***


## ベストプラクティス \{#best-practices\}

### 1. 大規模クエリ実行前の確認 \{#best-practice-1\}

```python
# Always explain first for large data
query = ds.complex_pipeline()
query.explain()  # Check plan

# If plan looks correct
result = query.to_df()  # Execute
```


### 2. デバッグ時は VERBOSE を使用する \{#best-practice-2\}

```python
# When something seems wrong
query.explain(verbose=True)
# Shows engine selection and pushdown info
```


### 3. to_sql() との比較 \{#best-practice-3\}

```python
# explain() shows the plan
query.explain()

# to_sql() shows just the SQL
print(query.to_sql())

# Both useful for different purposes
```


### 4. プッシュダウンの状態を確認する \{#best-practice-4\}

```python
# Verbose mode shows if operations are pushed down
query.explain(verbose=True)

# If Pushdown: No, operation runs in pandas
# Consider restructuring query for better performance
```
