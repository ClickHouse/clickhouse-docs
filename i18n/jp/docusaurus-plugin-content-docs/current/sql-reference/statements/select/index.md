---
slug: /sql-reference/statements/select/
sidebar_position: 32
sidebar_label: SELECT
---


# SELECT クエリ

`SELECT` クエリはデータの取得を行います。デフォルトでは、リクエストされたデータがクライアントに返されますが、[INSERT INTO](../../../sql-reference/statements/insert-into.md)と共に使用することで、異なるテーブルに転送することができます。

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

すべての句はオプションですが、`SELECT` の直後に必要な表現のリストは必須です。詳細は[下](#select-clause)で説明します。

各オプションの詳細は別々のセクションで説明されており、実行される順番でリストされています：

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

## SELECT句 {#select-clause}

`SELECT`句に指定された[表現](/sql-reference/syntax#expressions)は、上記で説明したすべての操作が終了した後に計算されます。これらの表現は、結果の個々の行に適用されるかのように機能します。`SELECT`句の表現に集約関数が含まれている場合、ClickHouseは[GROUP BY](/sql-reference/statements/select/group-by)の集約中に集約関数とその引数として使用される表現を処理します。

すべてのカラムを結果に含めたい場合は、アスタリスク (`*`) 記号を使用します。例えば、`SELECT * FROM ...`。

### 動的カラム選択 {#dynamic-column-selection}

動的カラム選択（COLUMNS表現とも呼ばれる）は、結果のいくつかのカラムを[re2](https://en.wikipedia.org/wiki/RE2_(software))正規表現と一致させることができます。

``` sql
COLUMNS('regexp')
```

例えば、次のテーブルを考えてみましょう。

``` sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

次のクエリは、名前に `a` シンボルを含むすべてのカラムからデータを選択します。

``` sql
SELECT COLUMNS('a') FROM col_names
```

``` text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

選択されたカラムはアルファベット順では返されません。

クエリ中で複数の`COLUMNS`表現を使用して、そこに関数を適用することもできます。

例えば：

``` sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

``` text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

`COLUMNS`表現によって返される各カラムは、別々の引数として関数に渡されます。また、関数がサポートしている場合、他の引数を関数に渡すこともできます。関数を使用する際は注意が必要です。関数が渡された引数の数をサポートしていない場合、ClickHouseは例外をスローします。

例えば：

``` sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

``` text
Received exception from server (version 19.14.1):
Code: 42. DB::Exception: Received from localhost:9000. DB::Exception: Number of arguments for function plus does not match: passed 3, should be 2.
```

この例では、`COLUMNS('a')`は2つのカラム、`aa`と`ab`を返し、`COLUMNS('c')`は`bc`カラムを返します。`+`演算子は3つの引数には適用できないので、ClickHouseは適切なメッセージを含む例外をスローします。

`COLUMNS`表現と一致するカラムは異なるデータ型を持つことがあります。`COLUMNS`が一致するカラムを持たない場合、かつそのカラムが`SELECT`の唯一の表現である場合、ClickHouseは例外をスローします。

### アスタリスク {#asterisk}

クエリの任意の部分にアスタリスクを表現の代わりに置くことができます。クエリが分析されると、アスタリスクはすべてのテーブルカラムのリストに展開されます（`MATERIALIZED`および`ALIAS`カラムを除く）。アスタリスクの使用が正当化されるケースはごくわずかです：

- テーブルダンプを作成する時。
- システムテーブルのようにカラムが少数のテーブルの場合。
- テーブルにどのカラムがあるかの情報を取得する場合。この場合、`LIMIT 1`を設定します。しかし、`DESC TABLE`クエリを使用する方が良いです。
- `PREWHERE`を使用して少数のカラムに対して強いフィルタリングを行う時。
- サブクエリ内で（外部クエリに必要ないカラムがサブクエリから除外されるため）。

その他のすべてのケースでは、アスタリスクの使用を推奨しません。なぜなら、アスタリスクを使用すると、列指向DBMSの欠点だけが得られ、利点が失われるからです。言い換えれば、アスタリスクの使用は推奨されません。

### 極端な値 {#extreme-values}

結果に加えて、結果カラムの最小値と最大値を取得することもできます。これを行うには、**extremes**設定を1に設定します。最小値と最大値は数値型、日付、および日時付き日付に対して計算されます。他のカラムについては、デフォルト値が出力されます。

さらに二つの行が計算され、最小値と最大値がそれぞれ示されます。これらの余分な2行は、他の行とは別に`XML`、`JSON*`、`TabSeparated*`、`CSV*`、`Vertical`、`Template`、および`Pretty*`の[フォーマット](../../../interfaces/formats.md)で出力されます。他のフォーマットには出力されません。

`JSON*`および`XML`フォーマットでは、極端な値が別の'extremes'フィールドに出力されます。`TabSeparated*`、`CSV*`、および`Vertical`フォーマットでは、行はメイン結果の後、'totals'が存在する場合はその後に来ます。その前には他のデータの後に空の行が挿入されます。`Pretty*`フォーマットでは、行はメイン結果の後、`totals`が存在する場合はその後に別のテーブルとして出力されます。`Template`フォーマットでは、極端な値が指定されたテンプレートに従って出力されます。

極端な値は、`LIMIT`の前に計算されますが、`LIMIT BY`の後に計算されます。ただし、`LIMIT offset, size`が使用される場合、`offset`の前の行は`extremes`にも含められます。ストリームリクエストでは、`LIMIT`を通過した少量の行が結果に含まれることもあります。

### 注意点 {#notes}

クエリの任意の部分で同義語（`AS`エイリアス）を使用できます。

`GROUP BY`、`ORDER BY`、および `LIMIT BY`句は位置引数をサポートします。これを有効にするには、[enable_positional_arguments](../../../operations/settings/settings.md#enable-positional-arguments)設定をオンにしてください。例えば、`ORDER BY 1,2`はテーブルの行を最初のカラム、次に二番目のカラムでソートします。

## 実装の詳細 {#implementation-details}

クエリが `DISTINCT`、`GROUP BY`、および `ORDER BY`句、`IN`、および `JOIN`のサブクエリを省略している場合、クエリは完全にストリーム処理され、O(1)のRAM量を使用します。そうでなければ、適切な制限が指定されないと、クエリが多くのRAMを消費する可能性があります：

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

詳細については、「設定」セクションを参照してください。外部ソート（テンポラリーテーブルをディスクに保存）および外部集計を使用することが可能です。

## SELECT修飾子 {#select-modifiers}

`SELECT`クエリに以下の修飾子を使用できます。

### APPLY {#apply}

クエリの外部テーブル表現によって返された各行に対して関数を呼び出すことを許可します。

**構文：**

```sql
SELECT <expr> APPLY( <func> ) FROM [db.]table_name
```

**例：**

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

結果から除外する1つ以上のカラムの名前を指定します。すべての一致するカラム名は出力から除外されます。

**構文：**

``` sql
SELECT <expr> EXCEPT ( col_name1 [, col_name2, col_name3, ...] ) FROM [db.]table_name
```

**例：**

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

1つ以上の[表現エイリアス](../../../sql-reference/syntax.md#syntax-expression_aliases)を指定します。各エイリアスは`SELECT *`文のカラム名と一致する必要があります。出力のカラムリストでは、エイリアスに一致するカラムがその`REPLACE`内の表現に置き換えられます。

この修飾子はカラムの名前や順序を変更しません。しかし、値や値の型を変更することはできます。

**構文：**

``` sql
SELECT <expr> REPLACE( <expr> AS col_name) from [db.]table_name
```

**例：**

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

各修飾子を単独で使用することも、組み合わせて使用することもできます。

**例：**

同じ修飾子を複数回使用する。

```sql
SELECT COLUMNS('[jk]') APPLY(toString) APPLY(length) APPLY(max) from columns_transformers;
```

```response
┌─max(length(toString(j)))─┬─max(length(toString(k)))─┐
│                        2 │                        3 │
└──────────────────────────┴──────────────────────────┘
```

1つのクエリで複数の修飾子を使用する。

```sql
SELECT * REPLACE(i + 1 AS i) EXCEPT (j) APPLY(sum) from columns_transformers;
```

```response
┌─sum(plus(i, 1))─┬─sum(k)─┐
│             222 │    347 │
└─────────────────┴────────┘
```

## SELECTクエリのSETTINGS {#settings-in-select-query}

必要な設定を`SELECT`クエリ内で指定できます。設定値はこのクエリにのみ適用され、クエリの実行後にデフォルトまたは前の値にリセットされます。

他の設定方法については、[こちら]( /operations/settings/overview)をご覧ください。

**例**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
