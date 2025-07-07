---
'description': 'SELECT クエリのドキュメント'
'sidebar_label': 'SELECT'
'sidebar_position': 32
'slug': '/sql-reference/statements/select/'
'title': 'SELECT クエリ'
---




# SELECT クエリ

`SELECT` クエリはデータの取得を行います。デフォルトでは、要求されたデータがクライアントに返されますが、[INSERT INTO](../../../sql-reference/statements/insert-into.md)と組み合わせることで、別のテーブルに転送することもできます。

## 構文 {#syntax}

```sql
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

すべての句はオプションですが、`SELECT` の直後に必要な表現のリストは必須であり、これは以下で詳しく説明します [below](#select-clause)。

各オプション句の詳細は、実行される順序で以下のセクションに記載されています：

- [WITH 句](../../../sql-reference/statements/select/with.md)
- [SELECT 句](#select-clause)
- [DISTINCT 句](../../../sql-reference/statements/select/distinct.md)
- [FROM 句](../../../sql-reference/statements/select/from.md)
- [SAMPLE 句](../../../sql-reference/statements/select/sample.md)
- [JOIN 句](../../../sql-reference/statements/select/join.md)
- [PREWHERE 句](../../../sql-reference/statements/select/prewhere.md)
- [WHERE 句](../../../sql-reference/statements/select/where.md)
- [WINDOW 句](../../../sql-reference/window-functions/index.md)
- [GROUP BY 句](/sql-reference/statements/select/group-by)
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

`SELECT` 句で指定された[表現](/sql-reference/syntax#expressions)は、上述のすべての操作が完了した後に計算されます。これらの表現は、結果の各行に適用されるかのように機能します。`SELECT` 句に集約関数が含まれている場合、ClickHouse は集約関数およびその引数として使用される表現を[GROUP BY](/sql-reference/statements/select/group-by)集約中に処理します。

結果にすべてのカラムを含めたい場合は、アスタリスク（`*`）を使用します。例えば、`SELECT * FROM ...` とします。

### 動的カラム選択 {#dynamic-column-selection}

動的カラム選択（COLUMNS 表現とも呼ばれます）を使用すると、結果の一部のカラムを [re2](https://en.wikipedia.org/wiki/RE2_(software)) 正規表現と一致させることができます。

```sql
COLUMNS('regexp')
```

例えば、次のテーブルを考えてみます。

```sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

以下のクエリは、名前に `a` シンボルを含むすべてのカラムからデータを選択します。

```sql
SELECT COLUMNS('a') FROM col_names
```

```text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

選択されたカラムはアルファベット順には返されません。

クエリ内で複数の `COLUMNS` 表現を使用し、それに関数を適用することも可能です。

例えば：

```sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

```text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

`COLUMNS` 表現によって返される各カラムは、個別の引数として関数に渡されます。また、関数がサポートしていれば、他の引数も渡すことが可能です。関数を使用する際は注意してください。渡した引数の数に関して関数がサポートしていない場合、ClickHouse は例外をスローします。

例えば：

```sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

```text
Received exception from server (version 19.14.1):
Code: 42. DB::Exception: Received from localhost:9000. DB::Exception: Number of arguments for function plus does not match: passed 3, should be 2.
```

この例では、`COLUMNS('a')` は 2 つのカラム `aa` と `ab` を返します。`COLUMNS('c')` は `bc` カラムを返します。`+` 演算子は 3 つの引数には適用できないため、ClickHouse は関連メッセージと共に例外をスローします。

`COLUMNS` 表現と一致したカラムは異なるデータ型を持つ可能性があります。`COLUMNS` が一致するカラムを見つけられず、唯一の `SELECT` 表現である場合、ClickHouse は例外をスローします。

### アスタリスク {#asterisk}

クエリの任意の部分にアスタリスクを式の代わりに置くことができます。クエリが分析されると、アスタリスクはすべてのテーブルカラムのリストに展開されます（`MATERIALIZED` および `ALIAS` カラムを除く）。アスタリスクを使用することが正当化されるケースはほとんどありません：

- テーブルダンプを作成する場合。
- システムテーブルのように、カラムが少ない場合。
- テーブル内のカラムが何であるかを知るための情報を取得するため。この時は `LIMIT 1` を設定します。しかし、`DESC TABLE` クエリを使用する方が良いです。
- `PREWHERE` を使用して少数のカラムに強いフィルタリングがある場合。
- サブクエリにおいて（外部クエリに必要のないカラムはサブクエリから除外されるため）。

それ以外の場合は、アスタリスクの使用をお勧めしません。なぜなら、アスタリスクを使用することで、列指向 DBMS の利点ではなく欠点をもたらすからです。言い換えれば、アスタリスクの使用は推奨されません。

### 極端な値 {#extreme-values}

結果に加えて、結果カラムの最小値および最大値も取得できます。これを行うには、**extremes** 設定を 1 に設定します。最小値と最大値は、数値型、日付、および日時の型に対して計算されます。他のカラムに対しては、デフォルト値が出力されます。

追加の 2 行が計算されます - それぞれ最小値と最大値です。これらの追加の 2 行は `XML`、`JSON*`、`TabSeparated*`、`CSV*`、`Vertical`、`Template`、および `Pretty*` [形式](../../../interfaces/formats.md)で、他の行とは別に出力されます。他の形式では出力されません。

`JSON*` および `XML` 形式では、極端な値が別の 'extremes' フィールドに出力されます。`TabSeparated*`、`CSV*` および `Vertical` 形式では、行は主な結果の後に続き、存在する場合は 'totals' の後に続きます。それは（他のデータの後に）空の行に先行します。`Pretty*` 形式では、その行は主な結果の後に別のテーブルとして出力され、存在する場合は `totals` の後に続きます。`Template` 形式では、極端な値は指定されたテンプレートに従って出力されます。

極端な値は `LIMIT` 前に行に対して計算されますが、`LIMIT BY` の後です。ただし、`LIMIT offset, size` を使用する場合、`offset` 前の行も `extremes` に含まれます。ストリームリクエストでは、結果は `LIMIT` を通過した少数の行も含む可能性があります。

### 注意事項 {#notes}

クエリの任意の部分で同義語（`AS` エイリアス）を使用できます。

`GROUP BY`、`ORDER BY`、および `LIMIT BY` 句は位置引数をサポートできます。これを有効にするには、[enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) 設定をオンにします。例えば、`ORDER BY 1,2` はテーブル内の最初のカラム、次に第二のカラムで行をソートします。

## 実装の詳細 {#implementation-details}

クエリが `DISTINCT`、`GROUP BY` および `ORDER BY` 句、および `IN` と `JOIN` サブクエリを省略した場合、クエリは完全にストリーム処理され、O(1) の RAM を使用します。それ以外の場合、適切な制限が指定されていないと、クエリは大量の RAM を消費する可能性があります：

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

詳しくは、「設定」をご覧ください。外部ソート（ディスクに一時テーブルを保存）や外部集約も使用できます。

## SELECT 修飾子 {#select-modifiers}

`SELECT` クエリで次の修飾子を使用できます。

### APPLY {#apply}

クエリの外部テーブル表現によって返される各行に対して、関数を呼び出すことを許可します。

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

結果から除外する 1 つ以上のカラム名を指定します。一致するすべてのカラム名が出力から省略されます。

**構文：**

```sql
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

1 つ以上の[表現エイリアス](/sql-reference/syntax#expression-aliases)を指定します。各エイリアスは `SELECT *` ステートメントのカラム名と一致する必要があります。出力カラムリストでは、そのエイリアスと一致するカラムが、その `REPLACE` で指定された表現に置き換えられます。

この修飾子はカラムの名前や順序を変更しません。しかし、値や値の型を変更することができます。

**構文：**

```sql
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

各修飾子を別々に使用するか、組み合わせて使用することができます。

**例：**

同じ修飾子を複数回使用しています。

```sql
SELECT COLUMNS('[jk]') APPLY(toString) APPLY(length) APPLY(max) from columns_transformers;
```

```response
┌─max(length(toString(j)))─┬─max(length(toString(k)))─┐
│                        2 │                        3 │
└──────────────────────────┴──────────────────────────┘
```

単一のクエリで複数の修飾子を使用します。

```sql
SELECT * REPLACE(i + 1 AS i) EXCEPT (j) APPLY(sum) from columns_transformers;
```

```response
┌─sum(plus(i, 1))─┬─sum(k)─┐
│             222 │    347 │
└─────────────────┴────────┘
```

## SELECT クエリ内の SETTINGS {#settings-in-select-query}

`SELECT` クエリ内で必要な設定を指定できます。設定値はこのクエリにのみ適用され、クエリの実行後にデフォルトまたは前の値にリセットされます。

他の方法で設定を行う方法は[こちら](/operations/settings/overview)をご覧ください。

**例**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
