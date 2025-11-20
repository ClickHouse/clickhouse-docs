---
slug: '/examples/aggregate-function-combinators/groupArrayResample'
title: 'groupArrayResample'
description: 'groupArray で Resample コンビネーターを使用する例'
keywords: ['groupArray', 'Resample', 'combinator', 'examples', 'groupArrayResample']
sidebar_label: 'groupArrayResample'
doc_type: 'reference'
---



# groupArrayResample {#grouparrayresample}


## 説明 {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample)
コンビネータを[`groupArray`](/sql-reference/aggregate-functions/reference/sum)集約関数に適用することで、
指定されたキー列の範囲を固定数の区間（`N`）に分割し、
各区間に含まれるデータポイントから代表値（最小キーに対応する値）を1つ選択して
結果配列を構築できます。
これにより、すべての値を収集するのではなく、データのダウンサンプリングされたビューが作成されます。


## 使用例 {#example-usage}

例を見てみましょう。従業員の`name`、`age`、`wage`を含むテーブルを作成し、データを挿入します:

```sql
CREATE TABLE employee_data
(
    name String,
    age UInt8,
    wage Float32
) ENGINE = MergeTree()
ORDER BY tuple()

INSERT INTO employee_data (name, age, wage) VALUES
    ('John', 16, 10.0),
    ('Alice', 30, 15.0),
    ('Mary', 35, 8.0),
    ('Evelyn', 48, 11.5),
    ('David', 62, 9.9),
    ('Brian', 60, 16.0);
```

年齢が`[30,60)`と`[60,75)`の区間に含まれる人の名前を取得してみましょう。年齢には整数表現を使用しているため、実際には`[30, 59]`と`[60,74]`の区間になります。

名前を配列に集約するには、`groupArray`集約関数を使用します。この関数は1つの引数を取ります。今回の場合は、name列です。`groupArrayResample`関数は、age列を使用して年齢ごとに名前を集約します。必要な区間を定義するために、`groupArrayResample`関数に`30`、`75`、`30`を引数として渡します:

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM employee_data
```

```response
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```


## 関連項目 {#see-also}

- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
