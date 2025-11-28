---
slug: '/examples/aggregate-function-combinators/countResample'
title: 'countResample'
description: 'count と Resample コンビネータを併用する例'
keywords: ['count', 'Resample', 'combinator', 'examples', 'countResample']
sidebar_label: 'countResample'
doc_type: 'reference'
---



# countResample {#countResample}



## 説明 {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
コンビネータは、[`count`](/sql-reference/aggregate-functions/reference/count)
集約関数に適用して、指定したキー列の値を固定数 (`N`) の区間に分割してカウントできます。



## 利用例

### 基本的な例

例を見てみましょう。従業員の `name`、`age`、`wage` を格納するテーブルを作成し、いくつかのデータを挿入してみます。

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

年齢が `[30,60)` および `[60,75)` の範囲に含まれるすべての人を数えましょう。
年齢は整数で表現しているため、実際には `[30, 59]` および `[60,74]` の範囲の年齢になります。
これを行うために、`count` に対して `Resample` コンビネータを適用します。

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
- [`Resample コンビネータ`](/sql-reference/aggregate-functions/combinators#-resample)
