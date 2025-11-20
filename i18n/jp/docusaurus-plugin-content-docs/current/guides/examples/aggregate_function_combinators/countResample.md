---
slug: '/examples/aggregate-function-combinators/countResample'
title: 'countResample'
description: 'count と Resample コンビネータを使用する例'
keywords: ['count', 'Resample', 'combinator', 'examples', 'countResample']
sidebar_label: 'countResample'
doc_type: 'reference'
---



# countResample {#countResample}


## 説明 {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample)
コンビネータを[`count`](/sql-reference/aggregate-functions/reference/count)
集約関数に適用することで、指定されたキー列の値を固定数の
区間（`N`）でカウントできます。


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

年齢が`[30,60)`と`[60,75)`の区間にある人数を数えてみましょう。年齢には整数表現を使用しているため、実際には`[30, 59]`と`[60,74]`の区間になります。これを行うには、`count`に`Resample`コンビネータを適用します:

```sql
SELECT countResample(30, 75, 30)(name, age) AS amount FROM employee_data
```

```response
┌─amount─┐
│ [3,2]  │
└────────┘
```


## 関連項目 {#see-also}

- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
