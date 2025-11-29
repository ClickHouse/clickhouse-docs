---
description: '条件付き関数に関するドキュメント'
sidebar_label: '条件'
slug: /sql-reference/functions/conditional-functions
title: '条件付き関数'
doc_type: 'リファレンス'
---

# 条件付き関数 {#conditional-functions}

## 概要 {#overview}

### 条件式の結果を直接使用する {#using-conditional-results-directly}

条件式は常に `0`、`1`、または `NULL` を返します。そのため、次のように条件式の結果を直接使用できます。

```sql
SELECT left < right AS is_small
FROM LEFT_RIGHT

┌─is_small─┐
│     ᴺᵁᴸᴸ │
│        1 │
│        0 │
│        0 │
│     ᴺᵁᴸᴸ │
└──────────┘
```


### 条件式における NULL 値 {#null-values-in-conditionals}

条件式に `NULL` が含まれている場合、その評価結果も `NULL` になります。

```sql
SELECT
    NULL < 1,
    2 < NULL,
    NULL < NULL,
    NULL = NULL

┌─less(NULL, 1)─┬─less(2, NULL)─┬─less(NULL, NULL)─┬─equals(NULL, NULL)─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ               │
└───────────────┴───────────────┴──────────────────┴────────────────────┘
```

そのため、型が `Nullable` の場合はクエリを慎重に構築する必要があります。

次の例は、`multiIf` に等値条件を追加しなかったために失敗するケースを示しています。

```sql
SELECT
    left,
    right,
    multiIf(left < right, '左の方が小さい', left > right, '右の方が小さい', '両方とも等しい') AS faulty_result
FROM LEFT_RIGHT

┌─left─┬─right─┬─faulty_result────┐
│ ᴺᵁᴸᴸ │     4 │ 両方とも等しい       │
│    1 │     3 │ 左の方が小さい  │
│    2 │     2 │ 両方とも等しい       │
│    3 │     1 │ 右の方が小さい │
│    4 │  ᴺᵁᴸᴸ │ 両方とも等しい       │
└──────┴───────┴──────────────────┘
```


### CASE ステートメント {#case-statement}

ClickHouse の CASE 式は、SQL の CASE 演算子と同様の条件付きロジックを提供します。条件を評価し、最初に一致した条件に基づいて値を返します。

ClickHouse は 2 つの形式の CASE をサポートしています：

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br />
   この形式は柔軟に記述でき、内部的には [multiIf](/sql-reference/functions/conditional-functions#multiIf) 関数を使用して実装されています。各条件は独立して評価され、式には非定数値を含めることができます。

```sql
SELECT
    number,
    CASE
        WHEN number % 2 = 0 THEN number + 1
        WHEN number % 2 = 1 THEN number * 10
        ELSE number
    END AS result
FROM system.numbers
WHERE number < 5;

-- 以下のように変換されます
SELECT
    number,
    multiIf((number % 2) = 0, number + 1, (number % 2) = 1, number * 10, number) AS result
FROM system.numbers
WHERE number < 5

┌─number─┬─result─┐
│      0 │      1 │
│      1 │     10 │
│      2 │      3 │
│      3 │     30 │
│      4 │      5 │
└────────┴────────┘

5 rows in set. Elapsed: 0.002 sec.
```

2. `CASE <expr> WHEN <val1> THEN ... WHEN <val2> THEN ... ELSE ... END`
   <br />
   このよりコンパクトな形式は、定数値との比較に最適化されており、内部的には `caseWithExpression()` を使用します。

例えば、次の記述は有効です。

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN 100
        WHEN 1 THEN 200
        ELSE 0
    END AS result
FROM system.numbers
WHERE number < 3;

-- 次のように変換されます

SELECT
    number,
    caseWithExpression(number, 0, 100, 1, 200, 0) AS result
FROM system.numbers
WHERE number < 3

┌─number─┬─result─┐
│      0 │    100 │
│      1 │    200 │
│      2 │      0 │
└────────┴────────┘

3行のセット。経過時間: 0.002秒。
```

この形式でも、戻り値式を定数にする必要はありません。

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN number + 1
        WHEN 1 THEN number * 10
        ELSE number
    END
FROM system.numbers
WHERE number < 3;

-- 以下のように変換されます

SELECT
    number,
    caseWithExpression(number, 0, number + 1, 1, number * 10, number)
FROM system.numbers
WHERE number < 3

┌─number─┬─caseWithExpr⋯0), number)─┐
│      0 │                        1 │
│      1 │                       10 │
│      2 │                        2 │
└────────┴──────────────────────────┘

3 rows in set. Elapsed: 0.001 sec.
```


#### 注意点 {#caveats}

ClickHouse は、CASE 式（`multiIf` などの内部的に同等な式を含む）について、条件を評価する前の段階で結果の型を決定します。これは、戻り値の式同士で型が異なる場合（異なるタイムゾーンや数値型など）に重要になります。

* 結果の型は、すべての分岐の中で互換性のある型のうち最も「大きい」型に基づいて選択されます。
* 一度この型が選択されると、他のすべての分岐は、その条件が実行時に決して真にならない場合でも、暗黙的にこの型へキャストされます。
* DateTime64 のように、タイムゾーンが型シグネチャの一部になっている型では、これが予期しない挙動につながることがあります。最初に見つかったタイムゾーンがすべての分岐で使用されてしまい、他の分岐で異なるタイムゾーンを指定していてもそれが反映されない場合があります。

例えば、以下では、すべての行が最初にマッチした分岐のタイムゾーン、つまり `Asia/Kolkata` でタイムスタンプを返します。

```sql
SELECT
    number,
    CASE
        WHEN number = 0 THEN fromUnixTimestamp64Milli(0, 'Asia/Kolkata')
        WHEN number = 1 THEN fromUnixTimestamp64Milli(0, 'America/Los_Angeles')
        ELSE fromUnixTimestamp64Milli(0, 'UTC')
    END AS tz
FROM system.numbers
WHERE number < 3;

-- 次のように変換されます

SELECT
    number,
    multiIf(number = 0, fromUnixTimestamp64Milli(0, 'Asia/Kolkata'), number = 1, fromUnixTimestamp64Milli(0, 'America/Los_Angeles'), fromUnixTimestamp64Milli(0, 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

┌─number─┬──────────────────────tz─┐
│      0 │ 1970-01-01 05:30:00.000 │
│      1 │ 1970-01-01 05:30:00.000 │
│      2 │ 1970-01-01 05:30:00.000 │
└────────┴─────────────────────────┘

3 rows in set. Elapsed: 0.011 sec.
```

ここでは、ClickHouse は複数の `DateTime64(3, <timezone>)` の戻り値型を検出します。最初に見つかったものに基づき、共通の型を `DateTime64(3, 'Asia/Kolkata'` と推論し、他の分岐も暗黙的にこの型へキャストします。

これは、意図したタイムゾーンの書式を保持するために文字列へ変換することで対処できます。

```sql
SELECT
    number,
    multiIf(
        number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'),
        number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'),
        formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')
    ) AS tz
FROM system.numbers
WHERE number < 3;

-- 以下のように変換されます

SELECT
    number,
    multiIf(number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'), number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'), formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

┌─number─┬─tz──────────────────┐
│      0 │ 1970-01-01 05:30:00 │
│      1 │ 1969-12-31 16:00:00 │
│      2 │ 1970-01-01 00:00:00 │
└────────┴─────────────────────┘

3行のセット。経過時間: 0.002秒。
```

{/* 
  以下のタグ内の内容は、ドキュメントフレームワークのビルド時に
  system.functions から自動生成されたドキュメントで置き換えられます。タグを変更したり削除したりしないでください。
  詳細は https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md を参照してください。
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
