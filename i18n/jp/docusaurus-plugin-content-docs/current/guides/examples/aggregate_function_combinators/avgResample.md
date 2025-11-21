---
slug: '/examples/aggregate-function-combinators/avgResample'
title: 'avgResample'
description: 'avg での Resample コンビネータの使用例'
keywords: ['avg', 'Resample', 'combinator', 'examples', 'avgResample']
sidebar_label: 'avgResample'
doc_type: 'reference'
---



# countResample {#countResample}


## 説明 {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample)
コンビネータを[`count`](/sql-reference/aggregate-functions/reference/count)
集約関数に適用することで、指定されたキー列の値を固定数（`N`）の
区間でカウントできます。


## 使用例 {#example-usage}

### 基本的な例 {#basic-example}

例を見てみましょう。従業員の`name`、`age`、`wage`を含むテーブルを作成し、データを挿入します:

```sql
CREATE TABLE employee_data
(
    name String,
    age UInt8,
    wage Float32
)
ENGINE = MergeTree()
ORDER BY tuple()

INSERT INTO employee_data (name, age, wage) VALUES
    ('John', 16, 10.0),
    ('Alice', 30, 15.0),
    ('Mary', 35, 8.0),
    ('Evelyn', 48, 11.5),
    ('David', 62, 9.9),
    ('Brian', 60, 16.0);
```

年齢が`[30,60)`と`[60,75)`の区間にある人々の平均賃金を取得しましょう(`[`は閉区間、`)`は開区間)。年齢には整数表現を使用するため、実際には`[30, 59]`と`[60,74]`の区間の年齢が対象となります。
これを行うには、`avg`集約関数に`Resample`コンビネータを適用します。

```sql
WITH avg_wage AS
(
    SELECT avgResample(30, 75, 30)(wage, age) AS original_avg_wage
    FROM employee_data
)
SELECT
    arrayMap(x -> round(x, 3), original_avg_wage) AS avg_wage_rounded
FROM avg_wage;
```

```response
┌─avg_wage_rounded─┐
│ [11.5,12.95]     │
└──────────────────┘
```


## 関連項目 {#see-also}

- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
