---
description: 'SELECT クエリのドキュメント'
sidebar_label: 'SELECT'
sidebar_position: 32
slug: /sql-reference/statements/select/
title: 'SELECT クエリ'
doc_type: 'reference'
---

# SELECT クエリ \\{#select-query\\}

`SELECT` クエリはデータの取得を行います。デフォルトでは、要求されたデータはクライアントに返されますが、[INSERT INTO](../../../sql-reference/statements/insert-into.md) と組み合わせることで、別のテーブルに渡すこともできます。

## 構文 \\{#syntax\\}

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
[INTO OUTFILE filename [TRUNCATE] [COMPRESSION type [LEVEL level]] ]
[FORMAT format]
```

すべての句は省略可能ですが、`SELECT`の直後に記述する式のリストは必須です。詳細は[以下](#select-clause)で説明します。

各省略可能な句の詳細は、実行される順序と同じ順序で以下の個別のセクションで説明されています:

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

## SELECT句 \\{#select-clause\\}

`SELECT`句で指定された[式](/sql-reference/syntax#expressions)は、上記で説明したすべての句の操作が完了した後に計算されます。これらの式は、結果の各行に対して個別に適用されるかのように動作します。`SELECT`句の式に集約関数が含まれている場合、ClickHouseは[GROUP BY](/sql-reference/statements/select/group-by)集約の際に、集約関数とその引数として使用される式を処理します。

結果にすべての列を含める場合は、アスタリスク(`*`)記号を使用します。例:`SELECT * FROM ...`

### 動的列選択 \\{#dynamic-column-selection\\}

動的列選択(COLUMNS式とも呼ばれます)を使用すると、[re2](<https://en.wikipedia.org/wiki/RE2_(software)>)正規表現によって結果内の一部の列を照合できます。

```sql
COLUMNS('regexp')
```

例えば、次のテーブルを考えてみます:

```sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

次のクエリは、名前に`a`記号を含むすべての列からデータを選択します。

```sql
SELECT COLUMNS('a') FROM col_names
```

```text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

選択された列はアルファベット順では返されません。

クエリ内で複数の`COLUMNS`式を使用し、それらに関数を適用できます。

例:

```sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

```text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

`COLUMNS`式によって返される各列は、個別の引数として関数に渡されます。また、関数がサポートしている場合は、他の引数を関数に渡すこともできます。関数を使用する際は注意が必要です。関数が渡された引数の数をサポートしていない場合、ClickHouseは例外をスローします。

例:

```sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

```text
Received exception from server (version 19.14.1):
Code: 42. DB::Exception: Received from localhost:9000. DB::Exception: Number of arguments for function plus does not match: passed 3, should be 2.
```

この例では、`COLUMNS('a')`は2つの列`aa`と`ab`を返します。`COLUMNS('c')`は`bc`列を返します。`+`演算子は3つの引数に適用できないため、ClickHouseは関連するメッセージとともに例外をスローします。

`COLUMNS`式に一致した列は、異なるデータ型を持つことができます。`COLUMNS`がどの列にも一致せず、`SELECT`内の唯一の式である場合、ClickHouseは例外をスローします。

### アスタリスク \\{#asterisk\\}

式の代わりに、クエリの任意の部分にアスタリスクを配置できます。クエリが解析されると、アスタリスクはすべてのテーブル列のリストに展開されます(`MATERIALIZED`列と`ALIAS`列を除く)。アスタリスクの使用が正当化されるケースはわずかです:

- テーブルダンプを作成する場合
- システムテーブルなど、少数の列しか含まないテーブルの場合
- テーブルにどの列があるかの情報を取得する場合。この場合は`LIMIT 1`を設定します。ただし、`DESC TABLE`クエリを使用する方が適切です
- `PREWHERE`を使用して少数の列に対して強力なフィルタリングを行う場合
- サブクエリ内(外部クエリに不要な列はサブクエリから除外されるため)

その他のすべてのケースでは、アスタリスクの使用は推奨されません。列指向DBMSの利点ではなく欠点のみをもたらすためです。言い換えれば、アスタリスクの使用は推奨されません。

### 極値 \\{#extreme-values\\}

結果に加えて、結果列の最小値と最大値を取得することもできます。これを行うには、**extremes**設定を1に設定します。最小値と最大値は、数値型、日付、および日時に対して計算されます。その他の列については、デフォルト値が出力されます。


最小値と最大値を表す2行が追加で計算されます。これらの追加行は、`XML`、`JSON*`、`TabSeparated*`、`CSV*`、`Vertical`、`Template`、および`Pretty*`[フォーマット](../../../interfaces/formats.md)において、他の行とは別に出力されます。その他のフォーマットでは出力されません。

`JSON*`および`XML`フォーマットでは、極値は独立した'extremes'フィールドに出力されます。`TabSeparated*`、`CSV*`、および`Vertical`フォーマットでは、この行はメイン結果の後に出力され、'totals'が存在する場合はその後に配置されます。この行の前には(他のデータの後に)空行が挿入されます。`Pretty*`フォーマットでは、この行はメイン結果の後に独立したテーブルとして出力され、'totals'が存在する場合はその後に配置されます。`Template`フォーマットでは、極値は指定されたテンプレートに従って出力されます。

極値は`LIMIT`の前、ただし`LIMIT BY`の後の行に対して計算されます。ただし、`LIMIT offset, size`を使用する場合、`offset`より前の行も`extremes`に含まれます。ストリームリクエストでは、結果に`LIMIT`を通過した少数の行が含まれる場合があります。

### 注意事項 \\{#notes\\}

クエリのあらゆる部分でシノニム(`AS`エイリアス)を使用できます。

`GROUP BY`、`ORDER BY`、および`LIMIT BY`句は位置引数をサポートできます。これを有効にするには、[enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)設定をオンにします。例えば、`ORDER BY 1,2`とすると、テーブルの行が第1列、次に第2列でソートされます。

## 実装の詳細 \\{#implementation-details\\}

クエリが `DISTINCT`、`GROUP BY`、`ORDER BY` 句、および `IN` と `JOIN` サブクエリを省略している場合、クエリは完全にストリーム処理され、O(1) の RAM 量を使用します。それ以外の場合、適切な制限が指定されていないと、クエリは大量の RAM を消費する可能性があります:

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

詳細については、「設定」のセクションを参照してください。外部ソート(一時テーブルをディスクに保存)および外部集約を使用することができます。

## SELECT修飾子 \\{#select-modifiers\\}

`SELECT`クエリでは以下の修飾子を使用できます。

| 修飾子                           | 説明                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`APPLY`](./apply_modifier.md)     | クエリの外部テーブル式によって返される各行に対して関数を呼び出すことができます。                                                                                                                                                                                                                                                                                                        |
| [`EXCEPT`](./except_modifier.md)   | 結果から除外する1つ以上のカラム名を指定します。一致するすべてのカラム名が出力から省略されます。                                                                                                                                                                                                                                                                                            |
| [`REPLACE`](./replace_modifier.md) | 1つ以上の[式エイリアス](/sql-reference/syntax#expression-aliases)を指定します。各エイリアスは`SELECT *`文のカラム名と一致する必要があります。出力カラムリストでは、エイリアスと一致するカラムがその`REPLACE`内の式に置き換えられます。この修飾子はカラムの名前や順序を変更しませんが、値と値の型を変更することができます。 |

### 修飾子の組み合わせ \\{#modifier-combinations\\}

各修飾子を個別に使用することも、組み合わせて使用することもできます。

**例:**

同じ修飾子を複数回使用する場合:

```sql
SELECT COLUMNS('[jk]') APPLY(toString) APPLY(length) APPLY(max) FROM columns_transformers;
```

```response
┌─max(length(toString(j)))─┬─max(length(toString(k)))─┐
│                        2 │                        3 │
└──────────────────────────┴──────────────────────────┘
```

単一のクエリで複数の修飾子を使用する場合:

```sql
SELECT * REPLACE(i + 1 AS i) EXCEPT (j) APPLY(sum) from columns_transformers;
```

```response
┌─sum(plus(i, 1))─┬─sum(k)─┐
│             222 │    347 │
└─────────────────┴────────┘
```

## SELECTクエリでのSETTINGS \\{#settings-in-select-query\\}

`SELECT`クエリ内で必要な設定を直接指定できます。設定値はこのクエリにのみ適用され、クエリ実行後はデフォルト値または以前の値にリセットされます。

設定を行う他の方法については[こちら](/operations/settings/overview)を参照してください。

ブール型の設定をtrueに設定する場合、値の割り当てを省略した簡略構文を使用できます。設定名のみを指定すると、自動的に`1`(true)に設定されます。

**例**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
