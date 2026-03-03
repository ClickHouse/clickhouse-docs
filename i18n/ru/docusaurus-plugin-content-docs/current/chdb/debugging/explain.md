---
title: 'Метод explain()'
sidebar_label: 'explain()'
slug: /chdb/debugging/explain
description: 'Просмотр планов выполнения запросов DataStore с помощью метода explain()'
keywords: ['chdb', 'datastore', 'explain', 'execution', 'plan', 'sql']
doc_type: 'reference'
---

# Метод explain() \{#explain-method\}

Метод `explain()` показывает план выполнения запроса к DataStore, помогая понять, какие операции будут выполнены и какой SQL-код будет сгенерирован.

## Основы использования \{#basic\}

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


## Синтаксис \{#syntax\}

```python
explain(verbose=False) -> None
```

**Параметры:**

| Параметр  | Тип  | Значение по умолчанию | Описание                             |
| --------- | ---- | --------------------- | ------------------------------------ |
| `verbose` | bool | `False`               | Отображать дополнительные метаданные |


## Формат вывода \{#output-format\}

### Стандартный вывод \{#standard\}

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


### Условные обозначения значков \{#icons\}

| Значок | Значение |
|--------|----------|
| 📊 | Источник данных |
| 🚀 | Операция chDB (SQL) |
| 🐼 | Операция pandas |

### Подробный режим вывода \{#verbose\}

```python
query.explain(verbose=True)
```

Подробный режим показывает дополнительную информацию для каждой операции, включая полный SQL‑запрос с механизмами внутреннего отслеживания порядка строк.

***


## Три этапа выполнения \{#phases\}

Вывод explain показывает операции, разбитые на три этапа:

### Этап 1: построение SQL-запроса (отложенное) \{#phase-1\}

Операции, которые транслируются в SQL:

```text
  1. Source: file('sales.csv', 'CSVWithNames')
  2. Filter: amount > 1000      
  3. GroupBy: region
  4. Aggregate: sum(amount)
```


### Фаза 2: Точка выполнения \{#phase-2\}

Когда срабатывает триггер:

```text
  5. Execute SQL -> DataFrame
     Trigger: to_df() called
```


### Этап 3: операции над DataFrame \{#phase-3\}

Операции после выполнения:

```text
  6. [pandas] pivot_table(...)
  7. [pandas] apply(custom_func)
```

***


## Разбор плана \{#understanding\}

### Информация об источнике данных \{#source\}

```text
Source: file('sales.csv', 'CSVWithNames')
```

* `file()` - табличная функция ClickHouse file()
* `'CSVWithNames'` - файловый формат с заголовком

Другие типы источников данных:

```text
Source: s3('bucket/data.parquet', ...)
Source: mysql('host', 'db', 'table', ...)
Source: __dataframe__  (pandas DataFrame input)
```


### Операции фильтрации \{#filter\}

```text
Filter: amount > 1000 AND status = 'active'
```

Показывает условие WHERE, которое будет применено.


### GROUP BY и агрегация \{#groupby\}

```text
GroupBy: region, category
Aggregate: sum(amount), avg(amount), count(id)
```

Показывает столбцы GROUP BY и функции агрегации.


### Операции сортировки \{#sort\}

```text
Sort: sum DESC, region ASC
```

Показывает предложение ORDER BY.


### Операции с LIMIT \{#limit\}

```text
Limit: 10
Offset: 100
```

Отображает LIMIT и OFFSET.

***


## Информация о движке \{#engine\}

В режиме подробного вывода можно увидеть, какой движок будет использоваться:

```text
Filter: amount > 1000
  - Engine: chdb
  - Pushdown: Yes

Apply: custom_function
  - Engine: pandas
  - Pushdown: No
```


### Pushdown \{#pushdown\}

- **Да**: Операция будет выполняться на стороне источника данных (SQL)
- **Нет**: Операция требует выполнения средствами pandas

---

## Примеры \{#examples\}

### Простой запрос \{#example-simple\}

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


### Сложная агрегация \{#example-complex\}

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


### Смешанное использование SQL и pandas \{#example-mixed\}

Когда операции нельзя полностью выполнить на стороне SQL, в плане отображается несколько сегментов:

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


## Отладка с помощью explain() \{#debugging\}

### Проверьте логику фильтрации \{#debug-filter\}

```python
# Verify your filter is correct
query = ds.filter((ds['age'] > 25) & (ds['city'] == 'NYC'))
query.explain()
# Output shows: Filter: age > 25 AND city = 'NYC'
```


### Проверьте выбор столбцов \{#debug-select\}

```python
# Check column pruning
query = ds.select('name', 'age').filter(ds['age'] > 25)
query.explain()
# Output shows: SELECT name, age FROM ... WHERE age > 25
```


### Понимание агрегации \{#debug-agg\}

```python
# Check aggregation functions
query = ds.groupby('dept').agg({'salary': ['sum', 'mean', 'std']})
query.explain()
# Output shows: SELECT dept, SUM(salary), AVG(salary), stddevPop(salary)
```

***


## Рекомендуемые практики \{#best-practices\}

### 1. Проверяйте большие запросы перед выполнением \{#best-practice-1\}

```python
# Always explain first for large data
query = ds.complex_pipeline()
query.explain()  # Check plan

# If plan looks correct
result = query.to_df()  # Execute
```


### 2. Используйте режим verbose для отладки \{#best-practice-2\}

```python
# When something seems wrong
query.explain(verbose=True)
# Shows engine selection and pushdown info
```


### 3. Сравнить с to_sql() \{#best-practice-3\}

```python
# explain() shows the plan
query.explain()

# to_sql() shows just the SQL
print(query.to_sql())

# Both useful for different purposes
```


### 4. Проверьте статус pushdown \{#best-practice-4\}

```python
# Verbose mode shows if operations are pushed down
query.explain(verbose=True)

# If Pushdown: No, operation runs in pandas
# Consider restructuring query for better performance
```
