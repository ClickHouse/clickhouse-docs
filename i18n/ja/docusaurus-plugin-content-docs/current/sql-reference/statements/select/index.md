---
slug: /sql-reference/statements/select/
sidebar_position: 32
sidebar_label: SELECT
---

# SELECT クエリ

`SELECT` クエリはデータの取得を行います。デフォルトでは、要求されたデータがクライアントに返されますが、[INSERT INTO](../../../sql-reference/statements/insert-into.md)と組み合わせることで、異なるテーブルに転送することも可能です。

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

すべての句はオプションですが、`SELECT` の直後にある式のリストは必須であり、詳細は[以下](#select-clause)で説明します。

各オプション句の詳細は、個別のセクションで説明されており、実行される順序に従ってリストされています：

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

`SELECT` 句で指定された[式](../../../sql-reference/syntax.md#syntax-expressions)は、上記の句で説明されたすべての操作が終了した後に計算されます。これらの式は、結果の別々の行に適用されるかのように機能します。`SELECT` 句の式に集約関数が含まれる場合、ClickHouseは集約関数とその引数として使用される式を[GROUP BY](../../../sql-reference/statements/select/group-by.md) 集約中に処理します。

結果にすべてのカラムを含めたい場合は、アスタリスク (`*`) シンボルを使用します。たとえば、`SELECT * FROM ...`。

### 動的カラム選択 {#dynamic-column-selection}

動的カラム選択（COLUMNS式とも呼ばれる）は、結果のいくつかのカラムを[re2](https://en.wikipedia.org/wiki/RE2_(software)) 正規表現と一致させることができます。

``` sql
COLUMNS('regexp')
```

たとえば、次のようなテーブルを考えてみましょう。

``` sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

以下のクエリは、名前に `a` シンボルを含むすべてのカラムからデータを選択します。

``` sql
SELECT COLUMNS('a') FROM col_names
```

``` text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

選択されたカラムはアルファベット順では返されません。

クエリ内で複数の `COLUMNS` 式を使用し、それに関数を適用することができます。

たとえば：

``` sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

``` text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

`COLUMNS` 式によって返される各カラムは、別の引数として関数に渡されます。また、関数がサポートしている場合は、他の引数を関数に渡すこともできます。関数を使用する際は注意が必要です。関数が渡された引数の数をサポートしていない場合、ClickHouseは例外をスローします。

例えば：

``` sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

``` text
サーバーから例外が受信されました (バージョン 19.14.1):
コード: 42. DB::Exception: localhost:9000 から受信しました。DB::Exception: 関数 plus の引数の数が一致しません: 渡された数は 3、必要な数は 2 です。
```

この例では、`COLUMNS('a')` は `aa` と `ab` の2つのカラムを返します。`COLUMNS('c')` は `bc` カラムを返します。`+` 演算子は3つの引数に適用できないため、ClickHouseは関連メッセージとともに例外をスローします。

`COLUMNS` 式に一致したカラムは異なるデータ型を持つことがあります。`COLUMNS` がカラムと一致せず、`SELECT` の唯一の式である場合、ClickHouseは例外をスローします。

### アスタリスク {#asterisk}

クエリの任意の部分に式の代わりにアスタリスクを置くことができます。クエリが分析されると、アスタリスクはすべてのテーブルカラムのリストに展開されます（`MATERIALIZED` および `ALIAS` カラムは除外されます）。アスタリスクを使用する正当なケースは以下の通りです：

- テーブルダンプを作成する時。
- システムテーブルのようにカラムがごく少数のテーブルの場合。
- テーブル内のカラム情報を取得する場合。この場合は `LIMIT 1` を設定します。ただし、`DESC TABLE` クエリを使用する方が良い。
- `PREWHERE` を使用して少数のカラムに対して強いフィルタリングを行う場合。
- サブクエリにおいて（外部クエリに必要ないカラムがサブクエリから除外されるため）。

それ以外のケースでは、アスタリスクの使用はお勧めしません。なぜなら、それは列指向DBMSの利点ではなく欠点をもたらすだけだからです。言い換えれば、アスタリスクの使用は推奨されません。

### 極値 {#extreme-values}

結果に加えて、結果のカラムに対する最小値および最大値も取得できます。これを行うには、**extremes** 設定を 1 に設定します。最小値と最大値は、数値型、日付型、および日時を持つデータに対して計算されます。他のカラムについては、デフォルト値が出力されます。

追加で2行、最小値と最大値が計算されます。これらの追加の2行は、`XML`、`JSON*`、`TabSeparated*`、`CSV*`、`Vertical`、`Template`、および `Pretty*` [形式](../../../interfaces/formats.md)で、他の行とは別に出力されます。他の形式では出力されません。

`JSON*` および `XML` 形式では、極値は 'extremes' フィールドに出力されます。`TabSeparated*`、`CSV*`、および `Vertical` 形式では、その行は主結果の後に出力され、'totals' が存在する場合はその後に来ます。空の行（他のデータの後に）に続きます。`Pretty*` 形式では、その行は主結果の後に別のテーブルとして出力され、'totals' が存在する場合はその後に出力されます。`Template` 形式では、極値が指定されたテンプレートに従って出力されます。

極値は `LIMIT` の前に計算されますが、`LIMIT BY` の後に計算されます。ただし、`LIMIT offset, size` を使用する場合、`offset` の前の行も `extremes` に含まれます。ストリーム要求では、結果に `LIMIT` を通過した少数の行が含まれることもあります。

### 注意事項 {#notes}

クエリの任意の部分で同義語（`AS` 別名）を使用できます。

`GROUP BY`、`ORDER BY`、および `LIMIT BY` 句は位置引数をサポートできます。これを有効にするには、[enable_positional_arguments](../../../operations/settings/settings.md#enable-positional-arguments) 設定をオンにします。たとえば、`ORDER BY 1,2` はテーブルの行を最初に1番目のカラムで、次に2番目のカラムでソートします。

## 実装の詳細 {#implementation-details}

クエリが `DISTINCT`、`GROUP BY`、および `ORDER BY` 句、ならびに `IN` および `JOIN` サブクエリを省略する場合、クエリは完全にストリーム処理され、O(1) のRAM量を使用します。それ以外の場合、適切な制限が指定されていないと、クエリが大量のRAMを消費する可能性があります：

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

詳細については、「設定」セクションを参照してください。外部ソート（ディスクに一時テーブルを保存すること）および外部集約を使用することも可能です。

## SELECT 修飾子 {#select-modifiers}

`SELECT` クエリで以下の修飾子を使用できます。

### APPLY {#apply}

クエリの外部テーブル式によって返される各行に対していくつかの関数を呼び出すことを許可します。

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

結果から除外する1つ以上のカラムの名前を指定します。すべての一致するカラム名は出力から省かれます。

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

1つ以上の[式の別名](../../../sql-reference/syntax.md#syntax-expression_aliases)を指定します。各別名は `SELECT *` ステートメントのカラム名と一致しなければなりません。出力カラムリストでは、別名と一致するカラムがその `REPLACE` の式によって置き換えられます。

この修飾子はカラムの名前や順序を変更することはありません。ただし、値と値の型を変更することができます。

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

各修飾子を個別に使用することも、組み合わせて使用することもできます。

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

単一のクエリ内で複数の修飾子を使用する。

```sql
SELECT * REPLACE(i + 1 AS i) EXCEPT (j) APPLY(sum) from columns_transformers;
```

```response
┌─sum(plus(i, 1))─┬─sum(k)─┐
│             222 │    347 │
└─────────────────┴────────┘
```

## SELECT クエリの SETTINGS {#settings-in-select-query}

必要な設定を `SELECT` クエリ内で指定することができます。設定値は、このクエリにのみ適用され、クエリの実行後にはデフォルトまたは前の値にリセットされます。

他の方法で設定を行うには[こちら](../../../operations/settings/overview)を参照してください。

**例**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
