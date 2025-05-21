---
description: 'SELECTクエリのドキュメント'
sidebar_label: 'SELECT'
sidebar_position: 32
slug: /sql-reference/statements/select/
title: 'SELECTクエリ'
---


# SELECTクエリ

`SELECT`クエリはデータの取得を行います。デフォルトでは、要求されたデータがクライアントに返されますが、[INSERT INTO](../../../sql-reference/statements/insert-into.md)と組み合わせることで、別のテーブルに転送することも可能です。

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

すべての句はオプションですが、`SELECT`の直後に必要な式のリストは必須で、詳細は[以下](#select-clause)に記載されています。

各オプションの特定の詳細は、実行される順番にリストされた別のセクションで扱われます:

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

`SELECT`句で指定された[式](/sql-reference/syntax#expressions)は、上記のすべての句の操作が完了した後に計算されます。これらの式は、結果の個別の行に適用されるかのように機能します。`SELECT`句に集約関数が含まれている場合、ClickHouseは[GROUP BY](/sql-reference/statements/select/group-by)集約の際に集約関数とその引数として使用される式を処理します。

結果にすべてのカラムを含める場合は、アスタリスク（`*`）を使います。例えば、`SELECT * FROM ...`のようにします。

### 動的カラム選択 {#dynamic-column-selection}

動的カラム選択（COLUMNS式とも呼ばれます）は、結果のいくつかのカラムを[re2](https://en.wikipedia.org/wiki/RE2_(software))正規表現と一致させることを可能にします。

```sql
COLUMNS('regexp')
```

例えば、次のテーブルを考えてみます。

```sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

以下のクエリは、名前に`a`の文字を含むすべてのカラムからデータを選択します。

```sql
SELECT COLUMNS('a') FROM col_names
```

```text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

選択されたカラムはアルファベット順では返されません。

クエリ内で複数の`COLUMNS`式を使用し、それに関数を適用することもできます。

例えば：

```sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

```text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

`COLUMNS`式で返された各カラムは、個別の引数として関数に渡されます。また、関数がサポートしている場合は、他の引数を渡すこともできます。関数を使用する際は注意が必要です。渡した引数の数が関数でサポートされていない場合、ClickHouseは例外をスローします。

例えば：

```sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

```text
サーバーからの例外を受信しました (バージョン 19.14.1):
コード: 42. DB::Exception: localhost:9000から受信しました。DB::Exception: 関数plusの引数の数が一致しません: 3を渡しましたが、2である必要があります。
```

この例では、`COLUMNS('a')`は2つのカラムを返します：`aa`および`ab`。`COLUMNS('c')`は`bc`カラムを返します。`+`演算子は3つの引数には適用できないため、ClickHouseは関連するメッセージを含む例外をスローします。

`COLUMNS`式に一致したカラムは異なるデータ型を持つことができます。`COLUMNS`が一致するカラムを持たず、かつ`SELECT`内で唯一の式の場合、ClickHouseは例外をスローします。

### アスタリスク {#asterisk}

クエリのいずれかの部分に式の代わりにアスタリスクを置くことができます。クエリが分析されると、アスタリスクはすべてのテーブルカラムのリスト（`MATERIALIZED`および`ALIAS`カラムを除く）に展開されます。アスタリスクを使用することが正当化されるのは、いくつかのケースだけです：

- テーブルダンプを作成するとき。
- システムテーブルなど、カラムがわずかしか含まれていないテーブルの場合。
- テーブル内のカラムが何であるかの情報を取得するとき。この場合、`LIMIT 1`を設定します。しかし、`DESC TABLE`クエリを使用する方が良いです。
- `PREWHERE`で少数のカラムに対して強力なフィルタリングがあるとき。
- サブクエリ内（外部クエリに必要のないカラムがサブクエリから除外されるため）。

その他のすべてのケースでは、アスタリスクの使用は推奨されません。というのも、これにより列指向DBMSの欠点のみが与えられ、利点が得られないからです。言い換えれば、アスタリスクの使用は推奨されません。

### 極値 {#extreme-values}

結果に加えて、結果カラムの最小値と最大値も取得できます。これを行うには、**extremes**設定を1に設定します。最小値と最大値は数値型、日付、および時刻付きの日付について計算されます。他のカラムについては、デフォルト値が出力されます。

追加の二行が計算されます - それぞれ最小値と最大値です。これらの追加の二行は、`XML`、`JSON*`、`TabSeparated*`、`CSV*`、`Vertical`、`Template`および`Pretty*`の[形式](../../../interfaces/formats.md)で出力され、他の行とは別に出力されます。他の形式では出力されません。

`JSON*`および`XML`形式では、極値は別の'extremes'フィールドに出力されます。`TabSeparated*`、`CSV*`、`Vertical`形式では、行は主な結果の後、存在する場合は'totals'の後に来ます。その他のデータの後に空の行が前置されます。`Pretty*`形式では、その行は主な結果の後、存在する場合は'totals'の後に別のテーブルとして出力されます。`Template`形式では、極値は指定されたテンプレートに従って出力されます。

極値は`LIMIT`の前に行に対して計算されますが、`LIMIT BY`の後に計算されます。ただし、`LIMIT offset, size`を使用する場合、`offset`の前の行も`extremes`に含まれます。ストリームリクエストでは、結果に`LIMIT`を通過した少数の行が含まれることがあります。

### 注意事項 {#notes}

クエリの任意の部分で同義語（`AS`エイリアス）を使用できます。

`GROUP BY`、`ORDER BY`、および`LIMIT BY`句は位置引数をサポートできます。これを有効にするには、[enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)設定をオンにします。すると、例えば`ORDER BY 1,2`はテーブルの行を最初のカラム、その後の第二のカラムでソートします。

## 実装の詳細 {#implementation-details}

クエリが`DISTINCT`、`GROUP BY`および`ORDER BY`句、および`IN`および`JOIN`サブクエリを省略する場合、そのクエリは完全にストリーム処理され、O(1)のRAM量を使用します。そうでなければ、適切な制限が指定されていない場合に、クエリはRAMを大量に消費する可能性があります：

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

詳細については、「設定」セクションを参照してください。外部ソーティング（ディスクへの一時テーブルの保存）や外部集約を使用することも可能です。

## SELECT修飾子 {#select-modifiers}

`SELECT`クエリで以下の修飾子を使用することができます。

### APPLY {#apply}

クエリの外部テーブル式によって返された各行に対していくつかの関数を呼び出すことを可能にします。

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

結果から除外する1つ以上のカラム名を指定します。すべての一致するカラム名は出力から省略されます。

**構文:**

```sql
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

1つ以上の[式エイリアス](/sql-reference/syntax#expression-aliases)を指定します。各エイリアスは`SELECT *`ステートメントのカラム名と一致しなければなりません。出力カラムリストでは、エイリアスに一致するカラムはその`REPLACE`における式によって置き換えられます。

この修飾子はカラムの名前や順序を変更しません。ただし、値や値の型を変更することはできます。

**構文:**

```sql
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

各修飾子を単独で使用することも、組み合わせて使用することもできます。

**例:**

同じ修飾子を複数回使用する場合。

```sql
SELECT COLUMNS('[jk]') APPLY(toString) APPLY(length) APPLY(max) from columns_transformers;
```

```response
┌─max(length(toString(j)))─┬─max(length(toString(k)))─┐
│                        2 │                        3 │
└──────────────────────────┴──────────────────────────┘
```

単一のクエリ内で複数の修飾子を使用する場合。

```sql
SELECT * REPLACE(i + 1 AS i) EXCEPT (j) APPLY(sum) from columns_transformers;
```

```response
┌─sum(plus(i, 1))─┬─sum(k)─┐
│             222 │    347 │
└─────────────────┴────────┘
```

## SELECTクエリにおけるSETTINGS {#settings-in-select-query}

必要な設定を`SELECT`クエリ内で直接指定することができます。設定値はこのクエリにのみ適用され、クエリが実行された後、デフォルトまたは前の値にリセットされます。

設定を行う他の方法については、[こちら](/operations/settings/overview)を参照してください。

**例**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
