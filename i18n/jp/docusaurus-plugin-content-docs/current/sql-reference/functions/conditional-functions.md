---
'description': 'Conditional Functionsに関するDocumentation'
'sidebar_label': '条件付き'
'slug': '/sql-reference/functions/conditional-functions'
'title': '条件付き関数'
'doc_type': 'reference'
---


# 条件関数

## 概要 {#overview}

### 条件結果の直接使用 {#using-conditional-results-directly}

条件は常に `0`、 `1`、または `NULL` に評価されます。したがって、条件結果を次のように直接使用できます。

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

### 条件内の NULL 値 {#null-values-in-conditionals}

`NULL` 値が条件に関与する場合、結果も `NULL` になります。

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

したがって、型が `Nullable` の場合は、クエリを注意深く構築する必要があります。

以下の例は、`multiIf` に等しい条件を追加できずに失敗することを示しています。

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

### CASE ステートメント {#case-statement}

ClickHouse の CASE 式は、SQL の CASE 演算子と同様の条件ロジックを提供します。条件を評価し、最初に一致した条件に基づいて値を返します。

ClickHouse は、2 つの CASE の形式をサポートしています。

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br/>
   この形式は完全な柔軟性を提供し、[multiIf](/sql-reference/functions/conditional-functions#multiIf) 関数を用いて内部的に実装されています。各条件は独立して評価され、式には非定数の値を含めることができます。

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

-- is translated to
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
   <br/>
   このコンパクトな形式は、定数値のマッチングに最適化されており、内部的には `caseWithExpression()` を使用しています。

例えば、以下は有効です。

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

-- is translated to

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

3 rows in set. Elapsed: 0.002 sec.
```

この形式では、戻り値の式を定数にする必要はありません。

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

-- is translated to

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

#### 注意事項 {#caveats}

ClickHouse は、CASE 式 (またはその内部等価物である `multiIf`) の結果タイプを、任意の条件を評価する前に決定します。これは、戻り値の式が異なる型 (例えば、異なるタイムゾーンや数値型) の場合に重要です。

- 結果の型は、すべてのブランチの中で互換性のある最大の型に基づいて選択されます。
- この型が選択されたら、他のすべてのブランチは暗黙的にこの型にキャストされます - たとえそのロジックが実行時に実行されることは決してないとしても。
- DateTime64 のように、タイムゾーンが型の署名の一部である型の場合、これは驚くべき動作を引き起こす可能性があります: 最初に遭遇したタイムゾーンが、他のブランチが異なるタイムゾーンを指定していても、すべてのブランチで使用される可能性があります。

例えば、以下ではすべての行が最初にマッチしたブランチのタイムゾーンでタイムスタンプを返します。つまり、`Asia/Kolkata` です。

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

-- is translated to

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

ここでは、ClickHouse は複数の `DateTime64(3, <timezone>)` の戻り型を見ます。最初に見るものとして `DateTime64(3, 'Asia/Kolkata'` を推測し、他のブランチをこの型に暗黙的にキャストします。

これは、意図したタイムゾーンのフォーマットを保持するために文字列に変換することで対処できます。

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

-- is translated to

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

3 rows in set. Elapsed: 0.002 sec.
```

<!-- 
以下のタグの内部コンテンツは、ドキュメントフレームワークのビルド時に 
system.functions から生成されたドキュメントで置き換えられます。タグを変更したり削除したりしないでください。
参照: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
## clamp {#clamp}

導入版: v24.5


値を指定された最小および最大境界内に制限します。

値が最小値未満の場合、最小値を返します。値が最大値を超える場合、最大値を返します。それ以外の場合は、値自体を返します。

すべての引数は比較可能な型でなければなりません。結果の型は、すべての引数の中で互換性のある最大の型です。
    

**構文**

```sql
clamp(value, min, max)
```

**引数**

- `value` — 制限する値。 - `min` — 最小境界。 - `max` — 最大境界。 

**返される値**

値を [min, max] 範囲に制限して返します。

**例**

**基本的な使用法**

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

導入版: v1.1


引数の中で最大の値を返します。
`NULL` 引数は無視されます。

- 配列の場合、辞書式で最大の配列を返します。
- `DateTime` 型の場合、結果の型は最大の型に昇格されます (例えば、`DateTime32` と混在している場合は `DateTime64`)。

:::note 設定 `least_greatest_legacy_null_behavior` を使用して `NULL` の動作を変更します
バージョン [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) は、`NULL` 値が無視されるという後方互換性のない変更を導入しました。これにより、以前は引数のいずれかが `NULL` の場合は `NULL` を返していました。
以前の動作を保持するには、設定 `least_greatest_legacy_null_behavior` (デフォルト: `false`) を `true` に設定します。
:::
    

**構文**

```sql
greatest(x1[, x2, ...])
```

**引数**

- `x1[, x2, ...]` — 比較する 1 つまたは複数の値。すべての引数は比較可能な型でなければなりません。 [`Any`](/sql-reference/data-types)


**返される値**

引数の中で最大の値を返し、最大互換性のある型に昇格します。 [`Any`](/sql-reference/data-types)

**例**

**数値型**

```sql title=Query
SELECT greatest(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- The type returned is a Float64 as the UInt8 must be promoted to 64 bit for the comparison.
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
-- The type returned is a DateTime64 as the DateTime32 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─greatest(toD⋯(now(), 3))─┐
│  2025-05-28 15:50:53.000 │
└──────────────────────────┘
```



## if {#if}

導入版: v1.1


条件分岐を実行します。

- 条件 `cond` がゼロでない値に評価される場合、関数は式 `then` の結果を返します。
- `cond` がゼロまたは NULL に評価される場合、`else` 式の結果が返されます。

設定 [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) は、ショートサーキット評価が使用されるかどうかを制御します。

有効の場合、`then` 式は `cond` が真である行のみで評価され、`else` 式は `cond` が偽である行で評価されます。

例えば、ショートサーキット評価を使用すると、以下のクエリを実行する際にゼロによる除算例外がスローされません。

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

`then` と `else` は同じ型である必要があります。


**構文**

```sql
if(cond, then, else)
```

**引数**

- `cond` — 評価される条件。 [`UInt8`](/sql-reference/data-types/int-uint) または [`Nullable(UInt8)`](/sql-reference/data-types/nullable) または [`NULL`](/sql-reference/syntax#null)
- `then` — `cond` が真の場合に返される式。 - `else` — `cond` が偽または `NULL` の場合に返される式。 

**返される値**

条件 `cond` に応じた `then` または `else` 式の結果。

**例**

**使用例**

```sql title=Query
SELECT if(1, 2 + 2, 2 + 6) AS res;
```

```response title=Response
┌─res─┐
│   4 │
└─────┘
```



## least {#least}

導入版: v1.1


引数の中で最小の値を返します。
`NULL` 引数は無視されます。

- 配列の場合、辞書式で最小の配列を返します。
- DateTime 型の場合、結果の型は最大の型に昇格されます (例えば、DateTime64 が DateTime32 と混在している場合)。

:::note 設定 `least_greatest_legacy_null_behavior` を使用して `NULL` の動作を変更します
バージョン [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) は、`NULL` 値が無視されるという後方互換性のない変更を導入しました。これにより、以前は引数のいずれかが `NULL` の場合は `NULL` を返していました。
以前の動作を保持するには、設定 `least_greatest_legacy_null_behavior` (デフォルト: `false`) を `true` に設定します。
:::
    

**構文**

```sql
least(x1[, x2, ...])
```

**引数**

- `x1[, x2, ...]` — 比較する単一の値または複数の値。すべての引数は比較可能な型でなければなりません。 [`Any`](/sql-reference/data-types)


**返される値**

引数の中で最小の値を返し、最大互換性のある型に昇格します。 [`Any`](/sql-reference/data-types)

**例**

**数値型**

```sql title=Query
SELECT least(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- The type returned is a Float64 as the UInt8 must be promoted to 64 bit for the comparison.
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

**DateTime 型**

```sql title=Query
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- The type returned is a DateTime64 as the DateTime32 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─least(toDate⋯(now(), 3))─┐
│  2025-05-27 15:55:20.000 │
└──────────────────────────┘
```



## multiIf {#multiIf}

導入版: v1.1


[`CASE`](/sql-reference/operators#conditional-expression) 演算子をクエリ内でよりコンパクトに記述することを可能にします。
条件を順に評価します。最初に真 (ゼロでなく、かつ `NULL` でない) である条件に対して、対応するブランチの値を返します。
条件がすべて真でない場合、`else` 値が返されます。

設定 [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) は、ショートサーキット評価が使用されるかどうかを制御します。 有効な場合、`then_i` 式は `((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)` が真である行でのみ評価されます。

例えば、ショートサーキット評価を使用すると、以下のクエリを実行する際にゼロによる除算例外がスローされません。

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

すべてのブランチと else 式は共通のスーパータイプを持たなければなりません。 `NULL` 条件は false と見なされます。
    

**構文**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**引数**

- `cond_N` — `then_N` が返されるかどうかを制御する N 番目に評価される条件。 [`UInt8`](/sql-reference/data-types/int-uint) または [`Nullable(UInt8)`](/sql-reference/data-types/nullable) または [`NULL`](/sql-reference/syntax#null)
- `then_N` — `cond_N` が真の場合の関数の結果。 - `else` — すべての条件が真でない場合の関数の結果。 

**返される値**

一致する `cond_N` に対する `then_N` の結果を返し、そうでなければ `else` 条件を返します。

**例**

**使用例**

```sql title=Query
CREATE TABLE LEFT_RIGHT (left Nullable(UInt8), right Nullable(UInt8)) ENGINE = Memory;
INSERT INTO LEFT_RIGHT VALUES (NULL, 4), (1, 3), (2, 2), (3, 1), (4, NULL);

SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'left is greater', left = right, 'Both equal', 'Null value') AS result
FROM LEFT_RIGHT;
```

```response title=Response
┌─left─┬─right─┬─result──────────┐
│ ᴺᵁᴸᴸ │     4 │ Null value      │
│    1 │     3 │ left is smaller │
│    2 │     2 │ Both equal      │
│    3 │     1 │ left is greater │
│    4 │  ᴺᵁᴸᴸ │ Null value      │
└──────┴───────┴─────────────────┘
```



<!--AUTOGENERATED_END-->
