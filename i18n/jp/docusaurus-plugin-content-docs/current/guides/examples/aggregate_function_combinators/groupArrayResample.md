---
slug: '/examples/aggregate-function-combinators/groupArrayResample'
title: 'groupArrayResample'
description: 'groupArray で Resample コンビネータを使用する例'
keywords: ['groupArray', 'Resample', 'コンビネータ', '使用例', 'groupArrayResample']
sidebar_label: 'groupArrayResample'
doc_type: 'リファレンス'
---

# groupArrayResample \\{#grouparrayresample\\}

## 説明 \\{#description\\}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
コンビネータは、[`groupArray`](/sql-reference/aggregate-functions/reference/sum) 集約関数に適用して、
指定したキー列の範囲を固定数 (`N`) の区間に分割し、
各区間に含まれるデータポイントから、キーが最小のものに対応する代表値を 1 つ選び、それらで結果の配列を構成できます。
これにより、すべての値を収集するのではなく、データをダウンサンプリングしたビューが得られます。

## 使用例 \\{#example-usage\\}

例を見てみましょう。従業員の `name`、`age`、`wage` を格納するテーブルを作成し、そこにいくつかのデータを挿入してみます。

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

`[30,60)` と `[60,75)` の区間に年齢が含まれる人の名前を取得しましょう。
年齢は整数で表現しているので、実際には `[30, 59]` と `[60,74]` の区間の年齢が対象になります。

名前を配列に集約するには、`groupArray` 集約関数を使います。
この関数は 1 つだけ引数を取ります。この場合は name 列です。`groupArrayResample`
関数では、age 列を使って年齢ごとに名前を集約します。必要な区間を定義するために、
`groupArrayResample` 関数に `30`, `75`, `30` を引数として渡します。

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM employee_data
```

```response
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

## 関連項目 \\{#see-also\\}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
