---
'description': 'Operators のドキュメント'
'displayed_sidebar': 'sqlreference'
'sidebar_label': 'オペレーター'
'sidebar_position': 38
'slug': '/sql-reference/operators/'
'title': 'オペレーター'
'doc_type': 'reference'
---


# 演算子

ClickHouseは、優先度、優先順位、および結合性に応じて、クエリ解析段階で演算子を対応する関数に変換します。

## アクセス演算子 {#access-operators}

`a[N]` – 配列の要素にアクセスします。`arrayElement(a, N)`関数。

`a.N` – タプル要素にアクセスします。`tupleElement(a, N)`関数。

## 数値否定演算子 {#numeric-negation-operator}

`-a` – `negate(a)`関数。

タプルの否定については: [tupleNegate](../../sql-reference/functions/tuple-functions.md#tuplenegate)。

## 乗算および除算演算子 {#multiplication-and-division-operators}

`a * b` – `multiply(a, b)`関数。

タプルを数値で乗算する場合: [tupleMultiplyByNumber](../../sql-reference/functions/tuple-functions.md#tuplemultiplybynumber)、スカラー積の場合: [dotProduct](/sql-reference/functions/array-functions#arrayDotProduct)。

`a / b` – `divide(a, b)`関数。

タプルを数値で除算する場合: [tupleDivideByNumber](../../sql-reference/functions/tuple-functions.md#tupledividebynumber)。

`a % b` – `modulo(a, b)`関数。

## 加算および減算演算子 {#addition-and-subtraction-operators}

`a + b` – `plus(a, b)`関数。

タプルの加算については: [tuplePlus](../../sql-reference/functions/tuple-functions.md#tupleplus)。

`a - b` – `minus(a, b)`関数。

タプルの減算については: [tupleMinus](../../sql-reference/functions/tuple-functions.md#tupleminus)。

## 比較演算子 {#comparison-operators}

### equals関数 {#equals-function}
`a = b` – `equals(a, b)`関数。

`a == b` – `equals(a, b)`関数。

### notEquals関数 {#notequals-function}
`a != b` – `notEquals(a, b)`関数。

`a <> b` – `notEquals(a, b)`関数。

### lessOrEquals関数 {#lessorequals-function}
`a <= b` – `lessOrEquals(a, b)`関数。

### greaterOrEquals関数 {#greaterorequals-function}
`a >= b` – `greaterOrEquals(a, b)`関数。

### less関数 {#less-function}
`a < b` – `less(a, b)`関数。

### greater関数 {#greater-function}
`a > b` – `greater(a, b)`関数。

### like関数 {#like-function}
`a LIKE b` – `like(a, b)`関数。

### notLike関数 {#notlike-function}
`a NOT LIKE b` – `notLike(a, b)`関数。

### ilike関数 {#ilike-function}
`a ILIKE b` – `ilike(a, b)`関数。

### BETWEEN関数 {#between-function}
`a BETWEEN b AND c` – `a >= b AND a <= c`と同じです。

`a NOT BETWEEN b AND c` – `a < b OR a > c`と同じです。

## データセット操作用の演算子 {#operators-for-working-with-data-sets}

[IN演算子](../../sql-reference/operators/in.md)および[EXISTS](../../sql-reference/operators/exists.md)演算子を参照してください。

### in関数 {#in-function}
`a IN ...` – `in(a, b)`関数。

### notIn関数 {#notin-function}
`a NOT IN ...` – `notIn(a, b)`関数。

### globalIn関数 {#globalin-function}
`a GLOBAL IN ...` – `globalIn(a, b)`関数。

### globalNotIn関数 {#globalnotin-function}
`a GLOBAL NOT IN ...` – `globalNotIn(a, b)`関数。

### inサブクエリ関数 {#in-subquery-function}
`a = ANY (subquery)` – `in(a, subquery)`関数。  

### notInサブクエリ関数 {#notin-subquery-function}
`a != ANY (subquery)` – `a NOT IN (SELECT singleValueOrNull(*) FROM subquery)`と同じです。

### inサブクエリ関数 {#in-subquery-function-1}
`a = ALL (subquery)` – `a IN (SELECT singleValueOrNull(*) FROM subquery)`と同じです。

### notInサブクエリ関数 {#notin-subquery-function-1}
`a != ALL (subquery)` – `notIn(a, subquery)`関数。 

**例**

ALLを用いたクエリ:

```sql
SELECT number AS a FROM numbers(10) WHERE a > ALL (SELECT number FROM numbers(3, 3));
```

結果:

```text
┌─a─┐
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```

ANYを用いたクエリ:

```sql
SELECT number AS a FROM numbers(10) WHERE a > ANY (SELECT number FROM numbers(3, 3));
```

結果:

```text
┌─a─┐
│ 4 │
│ 5 │
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```

## 日付と時刻の操作用の演算子 {#operators-for-working-with-dates-and-times}

### EXTRACT {#extract}

```sql
EXTRACT(part FROM date);
```

指定された日付から部分を抽出します。たとえば、指定された日付から月を取得することや、時刻から秒を取得することができます。

`part`パラメーターは、抽出する日付の部分を指定します。以下の値が利用可能です:

- `DAY` — 月の日。可能な値: 1–31。
- `MONTH` — 月の番号。可能な値: 1–12。
- `YEAR` — 年。
- `SECOND` — 秒。可能な値: 0–59。
- `MINUTE` — 分。可能な値: 0–59。
- `HOUR` — 時。可能な値: 0–23。

`part`パラメーターは大文字小文字を区別しません。

`date`パラメーターは処理する日付または時間を指定します。[Date](../../sql-reference/data-types/date.md)または[DateTime](../../sql-reference/data-types/datetime.md)型がサポートされています。

例:

```sql
SELECT EXTRACT(DAY FROM toDate('2017-06-15'));
SELECT EXTRACT(MONTH FROM toDate('2017-06-15'));
SELECT EXTRACT(YEAR FROM toDate('2017-06-15'));
```

以下の例では、テーブルを作成し、`DateTime`型の値を挿入します。

```sql
CREATE TABLE test.Orders
(
    OrderId UInt64,
    OrderName String,
    OrderDate DateTime
)
ENGINE = Log;
```

```sql
INSERT INTO test.Orders VALUES (1, 'Jarlsberg Cheese', toDateTime('2008-10-11 13:23:44'));
```

```sql
SELECT
    toYear(OrderDate) AS OrderYear,
    toMonth(OrderDate) AS OrderMonth,
    toDayOfMonth(OrderDate) AS OrderDay,
    toHour(OrderDate) AS OrderHour,
    toMinute(OrderDate) AS OrderMinute,
    toSecond(OrderDate) AS OrderSecond
FROM test.Orders;
```

```text
┌─OrderYear─┬─OrderMonth─┬─OrderDay─┬─OrderHour─┬─OrderMinute─┬─OrderSecond─┐
│      2008 │         10 │       11 │        13 │          23 │          44 │
└───────────┴────────────┴──────────┴───────────┴─────────────┴─────────────┘
```

さらに例については、[tests](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00619_extract.sql)を参照できます。

### INTERVAL {#interval}

[Interval](../../sql-reference/data-types/special-data-types/interval.md)型の値を作成し、[Date](../../sql-reference/data-types/date.md)および[DateTime](../../sql-reference/data-types/datetime.md)型の値と算術演算に使用します。

間隔の種類:
- `SECOND`
- `MINUTE`
- `HOUR`
- `DAY`
- `WEEK`
- `MONTH`
- `QUARTER`
- `YEAR`

INTERVAL値を設定する際に文字列リテラルを使用することもできます。たとえば、`INTERVAL 1 HOUR`は`INTERVAL '1 hour'`または`INTERVAL '1' hour`と同じです。

:::tip    
異なるタイプの間隔を組み合わせることはできません。`INTERVAL 4 DAY 1 HOUR`のような表現を使用することはできません。最小の単位以下または等しい単位で指定してください。たとえば、`INTERVAL 25 HOUR`のように、連続した演算子を使用することもできます。
:::

例:

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY + INTERVAL 3 HOUR;
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:09:50 │                                    2020-11-08 01:09:50 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4 day' + INTERVAL '3 hour';
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:12:10 │                                    2020-11-08 01:12:10 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4' day + INTERVAL '3' hour;
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay('4')), toIntervalHour('3'))─┐
│ 2020-11-03 22:33:19 │                                        2020-11-08 01:33:19 │
└─────────────────────┴────────────────────────────────────────────────────────────┘
```

:::note    
`INTERVAL`構文または`addDays`関数は常に優先されます。単純な加算や減算（`now() + ...`のような構文）は時間設定を考慮しません。たとえば、夏時間などです。
:::

例:

```sql
SELECT toDateTime('2014-10-26 00:00:00', 'Asia/Istanbul') AS time, time + 60 * 60 * 24 AS time_plus_24_hours, time + toIntervalDay(1) AS time_plus_1_day;
```

```text
┌────────────────time─┬──time_plus_24_hours─┬─────time_plus_1_day─┐
│ 2014-10-26 00:00:00 │ 2014-10-26 23:00:00 │ 2014-10-27 00:00:00 │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**参照**

- [Interval](../../sql-reference/data-types/special-data-types/interval.md)データ型
- [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear)型変換関数

## 論理AND演算子 {#logical-and-operator}

構文 `SELECT a AND b` — `a`と`b`の論理積を計算します。関数は[and](/sql-reference/functions/logical-functions#and)です。

## 論理OR演算子 {#logical-or-operator}

構文 `SELECT a OR b` — `a`と`b`の論理和を計算します。関数は[or](/sql-reference/functions/logical-functions#or)です。

## 論理否定演算子 {#logical-negation-operator}

構文 `SELECT NOT a` — `a`の論理否定を計算します。関数は[not](/sql-reference/functions/logical-functions#not)です。

## 条件演算子 {#conditional-operator}

`a ? b : c` – `if(a, b, c)`関数。

注意:

条件演算子は、bとcの値を計算し、条件aが満たされているかどうかを確認し、対応する値を返します。もし`b`または`C`が[arrayJoin()](/sql-reference/functions/array-join)関数である場合、各行は「a」の条件に関係なく複製されます。

## 条件式 {#conditional-expression}

```sql
CASE [x]
    WHEN a THEN b
    [WHEN ... THEN ...]
    [ELSE c]
END
```

`x`が指定されている場合、`transform(x, [a, ...], [b, ...], c)`関数が使用されます。そうでない場合は`multiIf(a, b, ..., c)`です。

式に`ELSE c`句がない場合、デフォルト値は`NULL`です。

`transform`関数は`NULL`に対しては機能しません。

## 連結演算子 {#concatenation-operator}

`s1 || s2` – `concat(s1, s2)`関数。

## ラムダ生成演算子 {#lambda-creation-operator}

`x -> expr` – `lambda(x, expr)`関数です。

優先順位を持たない演算子もあり、それは括弧です：

## 配列生成演算子 {#array-creation-operator}

`[x1, ...]` – `array(x1, ...)`関数。

## タプル生成演算子 {#tuple-creation-operator}

`(x1, x2, ...)` – `tuple(x2, x2, ...)`関数。

## 結合性 {#associativity}

すべての二項演算子は左結合性を持ちます。たとえば、`1 + 2 + 3`は`plus(plus(1, 2), 3)`に変換されます。
時には、期待通りに動作しないこともあります。たとえば、`SELECT 4 > 2 > 3`は0になります。

効率のために、`and`および`or`関数は任意の数の引数を受け入れます。対応する`AND`および`OR`演算子の連鎖は、これらの関数の単一の呼び出しに変換されます。

## NULLのチェック {#checking-for-null}

ClickHouseは`IS NULL`および`IS NOT NULL`演算子をサポートしています。

### IS NULL {#is_null}

- [Nullable](../../sql-reference/data-types/nullable.md)型の値の場合、`IS NULL`演算子は次のように返します:
  - 値が`NULL`であれば`1`。
  - それ以外の場合は`0`。
- その他の値に対しては、`IS NULL`演算子は常に`0`を返します。

[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns)設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1`のとき、関数は列全体のデータを読み込むのではなく、[null](../../sql-reference/data-types/nullable.md#finding-null)サブカラムのみを読み取ります。クエリ`SELECT n IS NULL FROM table`は`SELECT n.null FROM TABLE`に変換されます。

<!-- -->

```sql
SELECT x+100 FROM t_null WHERE y IS NULL
```

```text
┌─plus(x, 100)─┐
│          101 │
└──────────────┘
```

### IS NOT NULL {#is_not_null}

- [Nullable](../../sql-reference/data-types/nullable.md)型の値の場合、`IS NOT NULL`演算子は次のように返します:
  - 値が`NULL`であれば`0`。
  - それ以外の場合は`1`。
- その他の値に対しては、`IS NOT NULL`演算子は常に`1`を返します。

<!-- -->

```sql
SELECT * FROM t_null WHERE y IS NOT NULL
```

```text
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns)設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1`のとき、関数は列全体のデータを読み込むのではなく、[null](../../sql-reference/data-types/nullable.md#finding-null)サブカラムのみを読み取ります。クエリ`SELECT n IS NOT NULL FROM table`は`SELECT NOT n.null FROM TABLE`に変換されます。
