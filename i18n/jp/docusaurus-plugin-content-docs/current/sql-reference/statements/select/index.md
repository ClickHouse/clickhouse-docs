---
'description': 'SELECT クエリのドキュメント'
'sidebar_label': 'SELECT'
'sidebar_position': 32
'slug': '/sql-reference/statements/select/'
'title': 'SELECT クエリ'
'doc_type': 'reference'
---


# SELECT クエリ

`SELECT` クエリはデータ取得を行います。デフォルトでは、要求されたデータはクライアントに返されますが、[INSERT INTO](../../../sql-reference/statements/insert-into.md) と併用することで、別のテーブルに転送することも可能です。

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

すべての句は任意ですが、`SELECT` の直後に必要な式のリストは、以下で詳しく説明されます [下記](#select-clause)。

各オプショナル句の詳細は別のセクションで説明されており、実行される順序でリストされています：

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

[式](/sql-reference/syntax#expressions) は `SELECT` 句に指定され、上記で説明された句のすべての操作が完了した後に計算されます。これらの式は、結果の別々の行に適用されるかのように機能します。`SELECT` 句の式に集計関数が含まれている場合、ClickHouse は [GROUP BY](/sql-reference/statements/select/group-by) 集計の際に集計関数とその引数として使用される式を処理します。

結果にすべてのカラムを含めたい場合は、アスタリスク（`*`）シンボルを使用します。たとえば、`SELECT * FROM ...` のようにします。

### 動的カラム選択 {#dynamic-column-selection}

動的カラム選択（COLUMNS 表現とも呼ばれます）では、（re2）正規表現を使用して結果内のカラムの一部と一致させることができます。

```sql
COLUMNS('regexp')
```

たとえば、次のテーブルを考えます。

```sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

次のクエリは、名前に `a` シンボルを含むすべてのカラムからデータを選択します。

```sql
SELECT COLUMNS('a') FROM col_names
```

```text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

選択されたカラムは、アルファベット順では返されません。

クエリ内で複数の `COLUMNS` 表現を使用し、関数を適用することもできます。

例えば：

```sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

```text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

`COLUMNS` 表現によって返される各カラムは、別々の引数として関数に渡されます。また、関数がそれをサポートしている場合に限り、他の引数を関数に渡すこともできます。関数を使用する際は注意が必要です。関数が渡した引数の数をサポートしていない場合、ClickHouse は例外をスローします。

たとえば：

```sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

```text
Received exception from server (version 19.14.1):
Code: 42. DB::Exception: Received from localhost:9000. DB::Exception: Number of arguments for function plus does not match: passed 3, should be 2.
```

この例では、`COLUMNS('a')` はカラム `aa` および `ab` を返し、`COLUMNS('c')` は `bc` カラムを返します。`+` 演算子は 3 引数には適用できないため、ClickHouse は関連するメッセージを伴って例外をスローします。

`COLUMNS` 表現に一致したカラムは、異なるデータ型を持つことがあります。`COLUMNS` に一致するカラムがない場合、 `SELECT` の唯一の式であれば、ClickHouse は例外をスローします。

### アスタリスク {#asterisk}

クエリの任意の部分に式の代わりにアスタリスクを置くことができます。クエリが分析されると、アスタリスクはすべてのテーブルカラムのリスト（`MATERIALIZED` および `ALIAS` カラムを除く）に展開されます。アスタリスクを使用することが正当化されるケースはごくわずかです：

- テーブルダンプを作成する場合。
- システムテーブルのようにカラムがごく少数のテーブルの場合。
- テーブルにどのカラムが含まれているかを取得する場合。この場合、`LIMIT 1` を設定します。しかし、`DESC TABLE` クエリを使用する方が望ましいです。
- `PREWHERE` を使用して小数のカラムに対して強いフィルタリングが行われる場合。
- サブクエリ内（外部クエリに不要なカラムはサブクエリから除外されるため）。

その他のすべてのケースでは、アスタリスクの使用を推奨しません。なぜなら、アスタリスクは列指向DBMSの欠点をもたらすだけで、利点を得ることはできないからです。言い換えれば、アスタリスクの使用は推奨されません。

### 極端値 {#extreme-values}

結果に加えて、結果のカラムの最小値および最大値も取得できます。これを行うには、**extremes** 設定を 1 に設定します。最小値および最大値は、数値型、日付、および日時を持つ日付に対して計算されます。他のカラムについては、デフォルト値が出力されます。

さらに 2 行（最小値と最大値）が計算され、これらの追加の 2 行は `XML`、`JSON*`、`TabSeparated*`、`CSV*`、`Vertical`、`Template` および `Pretty*` [形式](../../../interfaces/formats.md)で出力され、他の行とは別に出力されます。他の形式では出力されません。

`JSON*` および `XML` 形式では、極端値は別の 'extremes' フィールドに出力されます。`TabSeparated*`、`CSV*` および `Vertical` 形式では、行は主要な結果の後、もしあれば 'totals' の後に来ます。これは他のデータの後に空の行によって前置されます。`Pretty*` 形式では、行は主要結果の後、もしあれば `totals` の後に別のテーブルとして出力されます。`Template` 形式では、極端値は指定されたテンプレートに従って出力されます。

極端値は、`LIMIT` の前に計算されますが、`LIMIT BY` の後に計算されます。ただし、`LIMIT offset, size` を使用する場合、`offset` の前の行は `extremes` に含まれます。ストリームリクエストでは、結果に `LIMIT` を通過した少量の行も含まれることがあります。

### 注意事項 {#notes}

クエリの任意の部分で同義語（`AS` エイリアス）を使用できます。

`GROUP BY`、`ORDER BY`、および `LIMIT BY` 句は位置引数をサポートします。これを有効にするには、[enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) 設定をオンにします。すると、たとえば、`ORDER BY 1,2` はテーブル内の行を最初のカラム、次に第二のカラムで並べ替えます。

## 実装の詳細 {#implementation-details}

クエリが `DISTINCT`、`GROUP BY`、`ORDER BY` 句、`IN` および `JOIN` サブクエリを省略すると、クエリは完全にストリーム処理され、O(1) の RAM を使用します。さもなければ、適切な制限が指定されていない場合、クエリが多くの RAM を消費する可能性があります：

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

詳細については、「設定」セクションを参照してください。外部ソート（一時テーブルをディスクに保存すること）および外部集約を使用することも可能です。

## SELECT 修飾子 {#select-modifiers}

`SELECT` クエリで次の修飾子を使用できます。

| 修飾子                              | 説明                                                                                                                                                                                                                                                                                                                                                                              |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`APPLY`](./apply_modifier.md)     | クエリの外部テーブル式によって返された各行に対して関数を呼び出すことを可能にします。                                                                                                                                                                                                                                                                                        |
| [`EXCEPT`](./except_modifier.md)   | 結果から除外するカラムの名前を一つ以上指定します。すべての一致するカラム名は出力から省略されます。                                                                                                                                                                                                                                                            |
| [`REPLACE`](./replace_modifier.md) | 一つ以上の[式エイリアス](/sql-reference/syntax#expression-aliases)を指定します。各エイリアスは `SELECT *` 文のカラム名と一致する必要があります。出力カラムリストでは、エイリアスに一致するカラムはその `REPLACE` の式によって置き換えられます。この修飾子はカラムの名前や順序を変えることはありません。ただし、値や値の型を変えることはできます。 |

### 修飾子の組み合わせ {#modifier-combinations}

各修飾子を個別に使用することも、組み合わせて使用することもできます。

**例：**

同じ修飾子を複数回使用する。

```sql
SELECT COLUMNS('[jk]') APPLY(toString) APPLY(length) APPLY(max) FROM columns_transformers;
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

## SELECT クエリでの SETTINGS {#settings-in-select-query}

必要な設定を `SELECT` クエリの中で直接指定できます。設定値はこのクエリにのみ適用され、クエリが実行された後にデフォルトまたは以前の値にリセットされます。

その他の設定方法については、[こちら](/operations/settings/overview)を参照してください。

真偽値の設定は、値の割り当てを省略する短縮構文を使用できます。設定名のみが指定される場合、自動的に `1`（真）に設定されます。

**例**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
