---
slug: '/sql-reference/statements/select/'
sidebar_position: 32
sidebar_label: 'SELECT'
keywords: ['SELECT', 'ClickHouse', SQL']
description: 'ClickHouseのSELECTクエリに関する詳細情報'

---


# SELECT クエリ

`SELECT` クエリはデータの取得を行います。デフォルトでは、要求されたデータはクライアントに返されますが、[INSERT INTO](../../../sql-reference/statements/insert-into.md) と組み合わせることで、異なるテーブルへ転送することも可能です。

## 構文 {#syntax}

``` sql
[WITH expr_list(subquery)]
SELECT [DISTINCT [ON (column1, column2, ...)]] expr_list
[FROM [db.]table | (subquery) | table_function] [FINAL]
[SAMPLE sample_coeff]
[ARRAY JOIN ...]
[GLOBAL] [ANY|ALL|ASOF] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI] JOIN (subquery)|table [(alias1 [, alias2 ...])] (ON <expr_list>)|(USING <column_list>)
[PREWHERE expr]
[WHERE expr]
[GROUP BY expr_list] [WITH ROLLUP|WITH CUBE] [WITH TOTALS]
[HAVING expr]
[WINDOW window_expr_list]
[QUALIFY expr]
[ORDER BY expr_list] [WITH FILL] [FROM expr] [TO expr] [STEP expr] [INTERPOLATE [(expr_list)]]
[LIMIT [offset_value, ]n BY columns]
[LIMIT [n, ]m] [WITH TIES]
[SETTINGS ...]
[UNION  ...]
[INTO OUTFILE filename [COMPRESSION type [LEVEL level]] ]
[FORMAT format]
```

全ての構文はオプションですが、`SELECT` 直後の表現リストは必須であり、詳細については [以下](#select-clause) で説明します。

各オプショナルな句の詳細は別々のセクションで扱い、実行順にリストされています。

- [WITH句](../../../sql-reference/statements/select/with.md)
- [SELECT句](#select-clause)
- [DISTINCT句](../../../sql-reference/statements/select/distinct.md)
- [FROM句](../../../sql-reference/statements/select/from.md)
- [SAMPLE句](../../../sql-reference/statements/select/sample.md)
- [JOIN句](../../../sql-reference/statements/select/join.md)
- [PREWHERE句](../../../sql-reference/statements/select/prewhere.md)
- [WHERE句](../../../sql-reference/statements/select/where.md)
- [WINDOW句](../../../sql-reference/window-functions/index.md)
- [GROUP BY句](/sql-reference/statements/select/group-by)
- [LIMIT BY句](../../../sql-reference/statements/select/limit-by.md)
- [HAVING句](../../../sql-reference/statements/select/having.md)
- [QUALIFY句](../../../sql-reference/statements/select/qualify.md)
- [LIMIT句](../../../sql-reference/statements/select/limit.md)
- [OFFSET句](../../../sql-reference/statements/select/offset.md)
- [UNION句](../../../sql-reference/statements/select/union.md)
- [INTERSECT句](../../../sql-reference/statements/select/intersect.md)
- [EXCEPT句](../../../sql-reference/statements/select/except.md)
- [INTO OUTFILE句](../../../sql-reference/statements/select/into-outfile.md)
- [FORMAT句](../../../sql-reference/statements/select/format.md)

## SELECT 句 {#select-clause}

[表現](/sql-reference/syntax#expressions)は、`SELECT` 句で指定され、上記の構文での全ての操作が終了した後に計算されます。これらの表現は、結果のそれぞれの行に適用されるかのように動作します。`SELECT` 句の表現に集約関数が含まれている場合、ClickHouseは [GROUP BY](/sql-reference/statements/select/group-by) 集約中に集約関数とその引数として使用される表現を処理します。

結果に全てのカラムを含めたい場合は、アスタリスク（`*`）を使用してください。例えば、`SELECT * FROM ...` と記述します。

### 動的カラム選択 {#dynamic-column-selection}

動的カラム選択（COLUMNS式とも呼ばれます）は、結果の特定のカラムを[re2](https://en.wikipedia.org/wiki/RE2_(software))正規表現に一致させることができます。

``` sql
COLUMNS('regexp')
```

例えば、次のようなテーブルを考えます：

``` sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

以下のクエリは、名前に `a` シンボルを含む全てのカラムからデータを選択します。

``` sql
SELECT COLUMNS('a') FROM col_names
```

``` text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

選択されたカラムはアルファベット順では返されません。

複数の `COLUMNS` 式をクエリ内で使用し、それに対して関数を適用することができます。

例えば：

``` sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

``` text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

`COLUMNS` 式によって返される各カラムは、関数の別々の引数として渡されます。また、関数がサポートしている場合は他の引数も関数に渡すことができます。関数を使用する際は注意してください。もし渡した引数の数が関数がサポートする数と一致しない場合、ClickHouseは例外をスローします。

例えば：

``` sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

``` text
Received exception from server (version 19.14.1):
Code: 42. DB::Exception: Received from localhost:9000. DB::Exception: Number of arguments for function plus does not match: passed 3, should be 2.
```

この例では、`COLUMNS('a')` が2つのカラム `aa` と `ab` を返し、`COLUMNS('c')` が `bc` カラムを返します。`+` 演算子は3つの引数には適用できないため、ClickHouseは関連するメッセージを伴って例外をスローします。

`COLUMNS` 式に一致したカラムは異なるデータ型を持つことがあります。もし `COLUMNS` がどのカラムにも一致せず、`SELECT` の唯一の表現である場合、ClickHouseは例外をスローします。

### アスタリスク {#asterisk}

クエリの任意の部分に表現の代わりにアスタリスクを置くことができます。クエリが解析されると、アスタリスクは全テーブルカラムのリストに展開されます（`MATERIALIZED` および `ALIAS` カラムを除く）。アスタリスクを使用する場合が正当化されるのはほんの数ケースです：

- テーブルダンプを作成する場合。
- システムテーブルのようにカラムが少ないテーブルの場合。
- テーブル内のカラムについての情報を取得する場合。この場合は `LIMIT 1` を設定します。しかし、`DESC TABLE` クエリを使用する方が良いです。
- `PREWHERE`を使用して少数のカラムに強いフィルタをかける場合。
- サブクエリ内において（外部クエリに必要でないカラムがサブクエリから除外されるため）。

その他のすべてのケースでは、アスタリスクの使用は推奨されません。アスタリスクを使うことは、カラム指向DBMSの利点ではなく欠点だけをもたらすからです。言い換えれば、アスタリスクの使用は推奨されません。

### 極値 {#extreme-values}

結果に加えて、結果カラムの最小値と最大値も取得できます。これを行うには、**extremes** 設定を 1 に設定します。最小値と最大値は数値型、日付、および時刻付きの日付に対して計算されます。他のカラムに対しては、デフォルトの値が出力されます。

追加で2行（それぞれ最小値と最大値）が計算されます。これらの追加行は、`XML`、`JSON*`、`TabSeparated*`、`CSV*`、`Vertical`、`Template` および `Pretty*` [形式](../../../interfaces/formats.md)で出力され、他の行とは別に出力されます。他のフォーマットでは出力されません。

`JSON*` および `XML` フォーマットでは、極値は別の 'extremes' フィールドに出力されます。`TabSeparated*`、`CSV*` および `Vertical` フォーマットでは、行は主な結果の後に、そして 'totals' が存在する場合はその後に来ます。その前に空の行（他のデータの後）が置かれます。`Pretty*` フォーマットでは、行は主な結果の後に別のテーブルとして出力され、もし存在すれば `totals` の後に表示されます。`Template` フォーマットでは、極値は指定されたテンプレートに従って出力されます。

極値は `LIMIT` の前、ただし `LIMIT BY` の後に計算されます。しかし、`LIMIT offset, size` を使用する場合、`offset` 前の行も `extremes` に含まれます。ストリームリクエストでは、結果には `LIMIT` を通過した少数の行も含まれることがあります。

### 注意事項 {#notes}

クエリの任意の部分で同義語（`AS` エイリアス）を使用できます。

`GROUP BY`、`ORDER BY`、および `LIMIT BY` 句は位置引数をサポートできます。これを有効にするには、[enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) 設定をオンにします。例えば、`ORDER BY 1,2` と記述すると、テーブルの行が最初のカラムで、次に2番目のカラムでソートされます。

## 実装の詳細 {#implementation-details}

クエリが `DISTINCT`、`GROUP BY`、および `ORDER BY` 句及び `IN` と `JOIN` のサブクエリを省略する場合、クエリは完全にストリーム処理され、O(1) のRAMを使用します。さもなくば、適切な制限が指定されていない場合、クエリは多くのRAMを消費する可能性があります：

- `max_memory_usage`
- `max_rows_to_group_by`
- `max_rows_to_sort`
- `max_rows_in_distinct`
- `max_bytes_in_distinct`
- `max_rows_in_set`
- `max_bytes_in_set`
- `max_rows_in_join`
- `max_bytes_in_join`
- `max_bytes_before_external_sort`
- `max_bytes_ratio_before_external_sort`
- `max_bytes_before_external_group_by`
- `max_bytes_ratio_before_external_group_by`

詳細については、「設定」セクションを参照してください。外部ソート（ディスクに一時テーブルを保存すること）や外部集計を使用することも可能です。

## SELECT 修飾子 {#select-modifiers}

`SELECT` クエリで以下の修飾子を使用できます。

### APPLY {#apply}

クエリの外部テーブル式から返された各行に対して関数を適用できるようにします。

**構文:**

```sql
SELECT <expr> APPLY( <func> ) FROM [db.]table_name
```

**例:**

```sql
CREATE TABLE columns_transformers (i Int64, j Int16, k Int64) ENGINE = MergeTree ORDER by (i);
INSERT INTO columns_transformers VALUES (100, 10, 324), (120, 8, 23);
SELECT * APPLY(sum) FROM columns_transformers;
```

```response
┌─sum(i)─┬─sum(j)─┬─sum(k)─┐
│    220 │     18 │    347 │
└────────┴────────┴────────┘
```

### EXCEPT {#except}

結果から除外する1つ以上のカラム名を指定します。全ての一致するカラム名が出力から除外されます。

**構文:**

``` sql
SELECT <expr> EXCEPT ( col_name1 [, col_name2, col_name3, ...] ) FROM [db.]table_name
```

**例:**

```sql
SELECT * EXCEPT (i) from columns_transformers;
```

```response
┌──j─┬───k─┐
│ 10 │ 324 │
│  8 │  23 │
└────┴─────┘
```

### REPLACE {#replace}

1つ以上の[表現エイリアス](/sql-reference/syntax#expression-aliases)を指定します。各エイリアスは `SELECT *` ステートメントのカラム名と一致しなければなりません。出力カラムリストでは、一致するエイリアスのカラムがその `REPLACE` 内の表現に置き換えられます。

この修飾子はカラムの名前や順序を変更するものではありませんが、値や値の型を変更することが可能です。

**構文:**

``` sql
SELECT <expr> REPLACE( <expr> AS col_name) from [db.]table_name
```

**例:**

```sql
SELECT * REPLACE(i + 1 AS i) from columns_transformers;
```

```response
┌───i─┬──j─┬───k─┐
│ 101 │ 10 │ 324 │
│ 121 │  8 │  23 │
└─────┴────┴─────┘
```

### 修飾子の組み合わせ {#modifier-combinations}

各修飾子を個別に使用したり、組み合わせて使用できます。

**例:**

同じ修飾子を複数回使用する。

```sql
SELECT COLUMNS('[jk]') APPLY(toString) APPLY(length) APPLY(max) from columns_transformers;
```

```response
┌─max(length(toString(j)))─┬─max(length(toString(k)))─┐
│                        2 │                        3 │
└──────────────────────────┴──────────────────────────┘
```

単一のクエリで複数の修飾子を使用する。

```sql
SELECT * REPLACE(i + 1 AS i) EXCEPT (j) APPLY(sum) from columns_transformers;
```

```response
┌─sum(plus(i, 1))─┬─sum(k)─┐
│             222 │    347 │
└─────────────────┴────────┘
```

## SELECTクエリにおけるSETTINGS {#settings-in-select-query}

`SELECT` クエリ内で必要な設定を指定できます。設定値はこのクエリにのみ適用され、クエリの実行後にデフォルトまたは前の値にリセットされます。

設定を行う他の方法については [こちら](/operations/settings/overview) を参照してください。

**例**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
