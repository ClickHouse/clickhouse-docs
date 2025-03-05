---
slug: /sql-reference/statements/select/
sidebar_position: 32
sidebar_label: SELECT
---


# SELECT クエリ

`SELECT` クエリはデータの取得を行います。デフォルトでは、要求されたデータがクライアントに返されますが、[INSERT INTO](../../../sql-reference/statements/insert-into.md) と組み合わせることで、別のテーブルに転送できます。

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

すべての句はオプションですが、`SELECT` のすぐ後に必要な式のリストは必須で、詳細は [以下](#select-clause) で説明します。

各オプション句の詳細は、別のセクションで説明されており、実行される順序でリストされています。

- [WITH 句](../../../sql-reference/statements/select/with.md)
- [SELECT 句](#select-clause)
- [DISTINCT 句](../../../sql-reference/statements/select/distinct.md)
- [FROM 句](../../../sql-reference/statements/select/from.md)
- [SAMPLE 句](../../../sql-reference/statements/select/sample.md)
- [JOIN 句](../../../sql-reference/statements/select/join.md)
- [PREWHERE 句](../../../sql-reference/statements/select/prewhere.md)
- [WHERE 句](../../../sql-reference/statements/select/where.md)
- [WINDOW 句](../../../sql-reference/window-functions/index.md)
- [GROUP BY 句](../../../sql-reference/statements/select/group-by.md)
- [LIMIT BY 句](../../../sql-reference/statements/select/limit-by.md)
- [HAVING 句](../../../sql-reference/statements/select/having.md)
- [QUALIFY 句](../../../sql-reference/statements/select/qualify.md)
- [LIMIT 句](../../../sql-reference/statements/select/limit.md)
- [OFFSET 句](../../../sql-reference/statements/select/offset.md)
- [UNION 句](../../../sql-reference/statements/select/union.md)
- [INTERSECT 句](../../../sql-reference/statements/select/intersect.md)
- [EXCEPT 句](../../../sql-reference/statements/select/except.md)
- [INTO OUTFILE 句](../../../sql-reference/statements/select/into-outfile.md)
- [FORMAT 句](../../../sql-reference/statements/select/format.md)

## SELECT 句 {#select-clause}

`SELECT` 句に指定された[式](../../../sql-reference/syntax.md#syntax-expressions)は、上記のすべての操作が完了した後に計算されます。これらの式は結果の各行に適用されるかのように機能します。`SELECT` 句の式に集約関数が含まれている場合、ClickHouse は[GROUP BY](../../../sql-reference/statements/select/group-by.md)集約中に集約関数とその引数として使用される式を処理します。

結果にすべてのカラムを含めたい場合は、アスタリスク (`*`) シンボルを使用します。例えば、`SELECT * FROM ...` です。

### 動的カラム選択 {#dynamic-column-selection}

動的カラム選択（COLUMNS 表現とも呼ばれる）を使用すると、結果の中で特定のカラムが [re2](https://en.wikipedia.org/wiki/RE2_(software)) 正規表現に一致するようにマッチさせることができます。

``` sql
COLUMNS('regexp')
```

例えば、次のテーブルを考えます：

``` sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

次のクエリでは、名前に `a` シンボルを含むすべてのカラムからデータを選択します。

``` sql
SELECT COLUMNS('a') FROM col_names
```

``` text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

選択されたカラムはアルファベット順で返されるわけではありません。

クエリ内で複数の `COLUMNS` 表現を使用し、それに関数を適用することができます。

例えば：

``` sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

``` text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

`COLUMNS` 表現によって返される各カラムは、関数の個別の引数として渡されます。また、関数がサポートする場合は他の引数を関数に渡すこともできます。関数を使用する際には注意が必要です。渡した引数の数にあわせて関数がサポートしない場合、ClickHouse は例外を投げます。

例えば：

``` sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

``` text
サーバーからの例外を受信しました (バージョン 19.14.1):
コード: 42. DB::Exception: localhost:9000 から受信。DB::Exception: 関数 plus の引数の数が一致しません: 3 が渡されました。2 でなければなりません。
```

この例では、`COLUMNS('a')` は 2 つのカラム（`aa` と `ab`）を返し、`COLUMNS('c')` は `bc` カラムを返します。`+` 演算子は 3 つの引数には適用できないため、ClickHouse は適切なメッセージ付きの例外を投げます。

`COLUMNS` 表現と一致したカラムは異なるデータ型を持つことができます。`COLUMNS` がどのカラムとも一致せず、`SELECT` の唯一の式である場合、ClickHouse は例外を投げます。

### アスタリスク {#asterisk}

クエリの任意の部分で表現の代わりにアスタリスクを置くことができます。クエリが分析されると、アスタリスクはすべてのテーブルカラムのリスト（`MATERIALIZED` および `ALIAS` カラムは除外）に展開されます。アスタリスクを使用することが正当化されるのは、以下の少数のケースのみです：

- テーブルダンプを作成する場合。
- システムテーブルのようにカラムが少数のテーブルの場合。
- テーブルにどのカラムがあるかの情報を取得する場合。この場合、`LIMIT 1` に設定します。しかし、`DESC TABLE` クエリを使用する方が良いです。
- `PREWHERE` を使用して少数のカラムに対して強いフィルタリングがある場合。
- サブクエリの場合（外部クエリに必要ないカラムがサブクエリから除外されるため）。

他のすべてのケースでは、アスタリスクの使用は推奨されません。なぜなら、それは列指向DBMSの利点ではなく欠点を与えるからです。言い換えれば、アスタリスクを使用することは推奨されません。

### 極値 {#extreme-values}

結果に加えて、結果カラムの最小値と最大値も取得できます。これを行うには、**extremes**設定を1に設定します。最小値と最大値は数値型、日付、および日付と時刻の組み合わせに対して計算されます。他のカラムについては、デフォルト値が出力されます。

追加の2行が計算され、最小値と最大値です。これらの追加の2行は、`XML`、`JSON*`、`TabSeparated*`、`CSV*`、`Vertical`、`Template` および `Pretty*` [フォーマット](../../../interfaces/formats.md)で出力され、他の行とは区別されます。その他のフォーマットには出力されません。

`JSON*` および `XML` フォーマットでは、極値は別の「extremes」フィールドに出力されます。`TabSeparated*`、`CSV*` および `Vertical` フォーマットでは、行は主な結果の後と「totals」の後に含まれ、他のデータの後に空の行に先行されます。`Pretty*` フォーマットでは、行は主な結果の後に別のテーブルとして出力され、「totals」がある場合はその後になります。`Template` フォーマットでは、極値は指定されたテンプレートに従って出力されます。

極値は `LIMIT` 前の行に対して計算されますが、`LIMIT BY` の後です。しかし、`LIMIT offset, size` を使用する際には、`offset` 前の行が `extremes` に含まれます。ストリームリクエストでは、`LIMIT` を通過した少数の行が結果に含まれる場合があります。

### 注記 {#notes}

クエリの任意の部分で同義語（`AS` エイリアス）を使用できます。

`GROUP BY`、`ORDER BY`、および `LIMIT BY` 句は位置引数をサポートできます。これを有効にするには、[enable_positional_arguments](../../../operations/settings/settings.md#enable-positional-arguments) 設定を切り替えます。その後、例えば、 `ORDER BY 1,2` はテーブルの最初の列で行をソートし、次に2番目の列でソートします。

## 実装の詳細 {#implementation-details}

クエリが `DISTINCT`、`GROUP BY`、`ORDER BY` 句と `IN` や `JOIN` サブクエリを省略する場合、クエリは完全にストリーム処理され、O(1) のRAM量を使用します。そうでない場合、適切な制限が指定されていない場合、クエリは大量のRAMを消費する可能性があります：

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

詳細については、「設定」セクションを参照してください。外部ソート（ディスクに一時テーブルを保存）や外部集約を使用することも可能です。

## SELECT 修飾子 {#select-modifiers}

`SELECT` クエリで以下の修飾子を使用できます。

### APPLY {#apply}

クエリの外部テーブル表現によって返された各行に関数を呼び出すことを許可します。

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

結果から除外する1つ以上のカラムの名前を指定します。すべての一致するカラム名は出力から省略されます。

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

1つ以上の[式エイリアス](../../../sql-reference/syntax.md#syntax-expression_aliases)を指定します。各エイリアスは `SELECT *` ステートメントのカラム名に一致する必要があります。出力カラムリストでは、エイリアスに一致するカラムが `REPLACE` 内の式に置き換えられます。

この修飾子は、カラムの名前や順序を変更しません。しかし、値および値の型を変更することはできます。

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

各修飾子を個別に使用することも、それらを組み合わせることもできます。

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

単一のクエリ内で複数の修飾子を使用する。

```sql
SELECT * REPLACE(i + 1 AS i) EXCEPT (j) APPLY(sum) from columns_transformers;
```

```response
┌─sum(plus(i, 1))─┬─sum(k)─┐
│             222 │    347 │
└─────────────────┴────────┘
```

## SELECT クエリにおける SETTINGS {#settings-in-select-query}

必要な設定を `SELECT` クエリ内に直接指定できます。設定値はこのクエリにのみ適用され、クエリが実行された後にデフォルトまたは以前の値にリセットされます。

設定のその他の方法については[こちら](operations/settings/overview)をご覧ください。

**例**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
