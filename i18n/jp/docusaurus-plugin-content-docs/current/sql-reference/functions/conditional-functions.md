---
description: '条件関数のドキュメント'
sidebar_label: '条件'
slug: /sql-reference/functions/conditional-functions
title: '条件関数'
doc_type: 'reference'
---



# 条件付き関数



## 概要 {#overview}

### 条件式の結果を直接使用する {#using-conditional-results-directly}

条件式は常に `0`、`1`、または `NULL` のいずれかの結果を返します。そのため、次のように条件式の結果を直接使用できます:

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

条件式に `NULL` 値が含まれる場合、結果も `NULL` になります。

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

そのため、型が `Nullable` の場合は、クエリを慎重に構築する必要があります。

次の例は、`multiIf` に等価条件を追加しないことで、この問題を示しています。

```sql
SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'right is smaller', 'Both equal') AS faulty_result
FROM LEFT_RIGHT

┌─left─┬─right─┬─faulty_result────┐
│ ᴺᵁᴸᴸ │     4 │ Both equal       │
│    1 │     3 │ left is smaller  │
│    2 │     2 │ Both equal       │
│    3 │     1 │ right is smaller │
│    4 │  ᴺᵁᴸᴸ │ Both equal       │
└──────┴───────┴──────────────────┘
```

### CASE 文 {#case-statement}

ClickHouse の CASE 式は、SQL の CASE 演算子と同様の条件ロジックを提供します。条件を評価し、最初に一致した条件に基づいて値を返します。

ClickHouse は 2 つの形式の CASE をサポートしています:

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br />
   この形式は完全な柔軟性を提供し、内部的には
   [multiIf](/sql-reference/functions/conditional-functions#multiIf) 関数を使用して実装されています。
   各条件は独立して評価され、式には非定数値を含めることができます。

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

-- 次のように変換されます
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
   このよりコンパクトな形式は定数値のマッチングに最適化されており、
   内部的には `caseWithExpression()` を使用します。

例えば、次のような記述が有効です:

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

```


┌─number─┬─result─┐
│ 0 │ 100 │
│ 1 │ 200 │
│ 2 │ 0 │
└────────┴────────┘

3 rows in set. Elapsed: 0.002 sec.

````

この形式では、返り値の式が定数である必要はありません。

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

-- 次のように変換されます

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
````

#### 注意事項 {#caveats}

ClickHouseは、条件を評価する前にCASE式(または`multiIf`などの内部的な同等物)の結果型を決定します。これは、異なるタイムゾーンや数値型など、返り値の式の型が異なる場合に重要です。

- 結果型は、すべての分岐の中で最も大きな互換性のある型に基づいて選択されます。
- この型が選択されると、他のすべての分岐は暗黙的にその型にキャストされます - たとえそのロジックが実行時に決して実行されない場合でも。
- DateTime64のように、タイムゾーンが型シグネチャの一部である型の場合、これは予期しない動作につながる可能性があります。最初に検出されたタイムゾーンがすべての分岐に使用される可能性があり、他の分岐が異なるタイムゾーンを指定している場合でも同様です。

例えば、以下ではすべての行が最初にマッチした分岐のタイムゾーン、つまり`Asia/Kolkata`でタイムスタンプを返します

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

ここで、ClickHouseは複数の`DateTime64(3, <timezone>)`返り値型を認識します。最初に認識した`DateTime64(3, 'Asia/Kolkata'`を共通型として推論し、他の分岐を暗黙的にこの型にキャストします。

これは、意図したタイムゾーンのフォーマットを保持するために文字列に変換することで対処できます:

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

-- 次のように変換されます

SELECT
    number,
    multiIf(number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'), number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'), formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

```


┌─number─┬─tz──────────────────┐
│      0 │ 1970-01-01 05:30:00 │
│      1 │ 1969-12-31 16:00:00 │
│      2 │ 1970-01-01 00:00:00 │
└────────┴─────────────────────┘

3 行の結果セット。経過時間: 0.002 秒。

```

<!-- 
以下のタグ内のコンテンツは、ドキュメントフレームワークのビルド時に
system.functions から生成されたドキュメントで置き換えられます。タグの変更や削除は行わないでください。
参照: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->
```


<!--AUTOGENERATED_START-->

## clamp {#clamp}

導入バージョン: v24.5

指定された最小値と最大値の範囲内に値を制限します。

値が最小値より小さい場合は最小値を返します。値が最大値より大きい場合は最大値を返します。それ以外の場合は値そのものを返します。

すべての引数は比較可能な型である必要があります。結果の型は、すべての引数の中で最大の互換性のある型となります。

**構文**

```sql
clamp(value, min, max)
```

**引数**

- `value` — 制限する値。- `min` — 最小境界値。- `max` — 最大境界値。

**戻り値**

[min, max] の範囲に制限された値を返します。

**例**

**基本的な使用方法**

```sql title=Query
SELECT clamp(5, 1, 10) AS result;
```

```response title=Response
┌─result─┐
│      5 │
└────────┘
```

**最小値を下回る値**

```sql title=Query
SELECT clamp(-3, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      0 │
└────────┘
```

**最大値を上回る値**

```sql title=Query
SELECT clamp(15, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      7 │
└────────┘
```


## greatest {#greatest}

導入バージョン: v1.1

引数の中から最大値を返します。
`NULL` 引数は無視されます。

- 配列の場合、辞書順で最大の配列を返します。
- `DateTime` 型の場合、結果の型は最大の型に昇格されます（例: `DateTime32` と混在する場合は `DateTime64`）。

:::note `NULL` の動作を変更するには設定 `least_greatest_legacy_null_behavior` を使用してください
バージョン [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) では、`NULL` 値が無視されるという後方互換性のない変更が導入されました。以前は、引数の1つが `NULL` の場合に `NULL` を返していました。
以前の動作を維持するには、設定 `least_greatest_legacy_null_behavior`（デフォルト: `false`）を `true` に設定してください。
:::

**構文**

```sql
greatest(x1[, x2, ...])
```

**引数**

- `x1[, x2, ...]` — 比較する1つまたは複数の値。すべての引数は比較可能な型である必要があります。[`Any`](/sql-reference/data-types)

**戻り値**

引数の中から最大値を返します。最大の互換性のある型に昇格されます。[`Any`](/sql-reference/data-types)

**例**

**数値型**

```sql title=Query
SELECT greatest(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- 比較のために UInt8 を 64 ビットに昇格する必要があるため、返される型は Float64 です。
```

```response title=Response
┌─result─┬─type────┐
│      3 │ Float64 │
└────────┴─────────┘
```

**配列**

```sql title=Query
SELECT greatest(['hello'], ['there'], ['world']);
```

```response title=Response
┌─greatest(['hello'], ['there'], ['world'])─┐
│ ['world']                                 │
└───────────────────────────────────────────┘
```

**DateTime 型**

```sql title=Query
SELECT greatest(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- 比較のために DateTime32 を 64 ビットに昇格する必要があるため、返される型は DateTime64 です。
```

```response title=Response
┌─greatest(toD⋯(now(), 3))─┐
│  2025-05-28 15:50:53.000 │
└──────────────────────────┘
```


## if {#if}

導入バージョン: v1.1

条件分岐を実行します。

- 条件 `cond` がゼロ以外の値に評価される場合、関数は `then` 式の結果を返します。
- `cond` がゼロまたはNULLに評価される場合、`else` 式の結果が返されます。

設定 [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) は、短絡評価を使用するかどうかを制御します。

有効にすると、`then` 式は `cond` が真である行でのみ評価され、`else` 式は `cond` が偽である行で評価されます。

例えば、短絡評価を使用すると、次のクエリを実行する際にゼロ除算例外が発生しません:

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

`then` と `else` は同じ型である必要があります。

**構文**

```sql
if(cond, then, else)
```

**引数**

- `cond` — 評価される条件。[`UInt8`](/sql-reference/data-types/int-uint) または [`Nullable(UInt8)`](/sql-reference/data-types/nullable) または [`NULL`](/sql-reference/syntax#null)
- `then` — `cond` が真の場合に返される式。
- `else` — `cond` が偽またはNULLの場合に返される式。

**返される値**

条件 `cond` に応じて、`then` または `else` 式のいずれかの結果。

**例**

**使用例**

```sql title=クエリ
SELECT if(1, 2 + 2, 2 + 6) AS res;
```

```response title=レスポンス
┌─res─┐
│   4 │
└─────┘
```


## least {#least}

導入バージョン: v1.1

引数の中で最小の値を返します。
`NULL` 引数は無視されます。

- 配列の場合、辞書順で最小の配列を返します。
- DateTime型の場合、結果の型は最大の型に昇格されます(例: DateTime32と混在する場合はDateTime64)。

:::note `NULL` の動作を変更するには設定 `least_greatest_legacy_null_behavior` を使用してください
バージョン [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) では、`NULL` 値が無視されるという後方互換性のない変更が導入されました。以前は引数の1つが `NULL` の場合に `NULL` を返していました。
以前の動作を維持するには、設定 `least_greatest_legacy_null_behavior`(デフォルト: `false`)を `true` に設定してください。
:::

**構文**

```sql
least(x1[, x2, ...])
```

**引数**

- `x1[, x2, ...]` — 比較する単一の値または複数の値。すべての引数は比較可能な型である必要があります。[`Any`](/sql-reference/data-types)

**戻り値**

引数の中で最小の値を、最大の互換性のある型に昇格して返します。[`Any`](/sql-reference/data-types)

**例**

**数値型**

```sql title=Query
SELECT least(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- 比較のためにUInt8を64ビットに昇格する必要があるため、返される型はFloat64です。
```

```response title=Response
┌─result─┬─type────┐
│      1 │ Float64 │
└────────┴─────────┘
```

**配列**

```sql title=Query
SELECT least(['hello'], ['there'], ['world']);
```

```response title=Response
┌─least(['hell⋯ ['world'])─┐
│ ['hello']                │
└──────────────────────────┘
```

**DateTime型**

```sql title=Query
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- 比較のためにDateTime32を64ビットに昇格する必要があるため、返される型はDateTime64です。
```

```response title=Response
┌─least(toDate⋯(now(), 3))─┐
│  2025-05-27 15:55:20.000 │
└──────────────────────────┘
```


## multiIf {#multiIf}

導入バージョン: v1.1

クエリ内で[`CASE`](/sql-reference/operators#conditional-expression)演算子をよりコンパクトに記述できます。
各条件を順番に評価します。最初に真となる条件(非ゼロかつ`NULL`でない)に対して、対応する分岐値を返します。
いずれの条件も真でない場合は、`else`値を返します。

設定[`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation)は、短絡評価を使用するかどうかを制御します。有効にすると、`then_i`式は`((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)`が真である行でのみ評価されます。

例えば、短絡評価を使用すると、次のクエリを実行してもゼロ除算例外は発生しません:

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

すべての分岐式とelse式は共通のスーパータイプを持つ必要があります。`NULL`条件は偽として扱われます。

**構文**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**エイリアス**: `caseWithoutExpression`, `caseWithoutExpr`

**引数**

- `cond_N` — `then_N`が返されるかどうかを制御する、N番目に評価される条件。[`UInt8`](/sql-reference/data-types/int-uint)または[`Nullable(UInt8)`](/sql-reference/data-types/nullable)または[`NULL`](/sql-reference/syntax#null)
- `then_N` — `cond_N`が真の場合の関数の結果。
- `else` — いずれの条件も真でない場合の関数の結果。

**戻り値**

一致する`cond_N`に対して`then_N`の結果を返し、それ以外の場合は`else`条件を返します。

**例**

**使用例**

```sql title=Query
CREATE TABLE LEFT_RIGHT (left Nullable(UInt8), right Nullable(UInt8)) ENGINE = Memory;
INSERT INTO LEFT_RIGHT VALUES (NULL, 4), (1, 3), (2, 2), (3, 1), (4, NULL);

SELECT
    left,
    right,
    multiIf(left < right, 'leftの方が小さい', left > right, 'leftの方が大きい', left = right, '両方とも等しい', 'Null値') AS result
FROM LEFT_RIGHT;
```

```response title=Response
┌─left─┬─right─┬─result──────────┐
│ ᴺᵁᴸᴸ │     4 │ Null値          │
│    1 │     3 │ leftの方が小さい │
│    2 │     2 │ 両方とも等しい   │
│    3 │     1 │ leftの方が大きい │
│    4 │  ᴺᵁᴸᴸ │ Null値          │
└──────┴───────┴─────────────────┘
```

<!--AUTOGENERATED_END-->
