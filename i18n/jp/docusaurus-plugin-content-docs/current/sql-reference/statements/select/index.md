---
description: 'SELECT クエリに関するドキュメント'
sidebar_label: 'SELECT'
sidebar_position: 32
slug: /sql-reference/statements/select/
title: 'SELECT クエリ'
doc_type: 'reference'
---

# SELECT クエリ

`SELECT` クエリはデータの取得を行います。通常、要求されたデータはクライアントに返されますが、[INSERT INTO](../../../sql-reference/statements/insert-into.md) と組み合わせることで、結果を別のテーブルに書き込むこともできます。

## 構文

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

`SELECT` の直後に必須となる式のリストを除き、すべての句は省略可能です。`SELECT` 直後に記述する式リストについては[後述](#select-clause)で詳しく説明します。

各オプション句の詳細については、それぞれ別セクションで説明しており、実行される順序と同じ順で以下に列挙しています。

* [WITH 句](../../../sql-reference/statements/select/with.md)
* [SELECT 句](#select-clause)
* [DISTINCT 句](../../../sql-reference/statements/select/distinct.md)
* [FROM 句](../../../sql-reference/statements/select/from.md)
* [SAMPLE 句](../../../sql-reference/statements/select/sample.md)
* [JOIN 句](../../../sql-reference/statements/select/join.md)
* [PREWHERE 句](../../../sql-reference/statements/select/prewhere.md)
* [WHERE 句](../../../sql-reference/statements/select/where.md)
* [WINDOW 句](../../../sql-reference/window-functions/index.md)
* [GROUP BY 句](/sql-reference/statements/select/group-by)
* [LIMIT BY 句](../../../sql-reference/statements/select/limit-by.md)
* [HAVING 句](../../../sql-reference/statements/select/having.md)
* [QUALIFY 句](../../../sql-reference/statements/select/qualify.md)
* [LIMIT 句](../../../sql-reference/statements/select/limit.md)
* [OFFSET 句](../../../sql-reference/statements/select/offset.md)
* [UNION 句](../../../sql-reference/statements/select/union.md)
* [INTERSECT 句](../../../sql-reference/statements/select/intersect.md)
* [EXCEPT 句](../../../sql-reference/statements/select/except.md)
* [INTO OUTFILE 句](../../../sql-reference/statements/select/into-outfile.md)
* [FORMAT 句](../../../sql-reference/statements/select/format.md)


## SELECT 句 \{#select-clause\}

`SELECT` 句で指定された[式](/sql-reference/syntax#expressions)は、前述の句で説明したすべての処理が完了した後に計算されます。これらの式は、結果セットの各行に対して個別に適用されるかのように評価されます。`SELECT` 句内の式に集約関数が含まれている場合、ClickHouse は [GROUP BY](/sql-reference/statements/select/group-by) 句による集約の過程で、集約関数とその引数として使用される式を処理します。

すべてのカラムを結果に含めたい場合は、アスタリスク（`*`）記号を使用します。例えば、`SELECT * FROM ...` のようにします。

### 動的なカラム選択

動的なカラム選択（`COLUMNS` 式とも呼ばれます）を使用すると、[re2](https://en.wikipedia.org/wiki/RE2_\(software\)) 正規表現にマッチするカラムを結果セットから動的に選択できます。

```sql
COLUMNS('regexp')
```

例えば、次の表を考えてみましょう。

```sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

次のクエリは、名前に `a` という文字を含むすべての列からデータを選択します。

```sql
SELECT COLUMNS('a') FROM col_names
```

```text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

選択された列はアルファベット順ではない順序で返されます。

1つのクエリ内で複数の `COLUMNS` 式を使用し、それらに関数を適用できます。

例：

```sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

```text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

`COLUMNS` 式によって返される各列は、関数に個別の引数として渡されます。関数がそれをサポートしている場合は、他の引数も関数に渡すことができます。関数を使用する際は注意してください。渡した引数の数を関数がサポートしていない場合、ClickHouse は例外をスローします。

例えば:

```sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

```text
サーバーから例外を受信しました (バージョン 19.14.1):
Code: 42. DB::Exception: Received from localhost:9000. DB::Exception: 関数 plus の引数の数が一致しません: 3個が渡されましたが、2個である必要があります。
```

この例では、`COLUMNS('a')` は 2 つのカラム `aa` と `ab` を返します。`COLUMNS('c')` は `bc` カラムを返します。`+` 演算子は 3 つの引数には適用できないため、ClickHouse は対応するメッセージとともに例外をスローします。

`COLUMNS` 式に一致したカラムは、異なるデータ型を持つ場合があります。`COLUMNS` がどのカラムにも一致せず、かつ `SELECT` 内で唯一の式である場合、ClickHouse は例外をスローします。


### アスタリスク \{#asterisk\}

クエリ内の任意の箇所で、式の代わりにアスタリスクを使用できます。クエリが解析されると、アスタリスクはすべてのテーブル列のリスト（`MATERIALIZED` 列と `ALIAS` 列を除く）に展開されます。アスタリスクの使用が妥当と言えるケースは、次のような場合に限られます。

- テーブルダンプを作成するとき。
- システムテーブルなど、列数が少ないテーブルの場合。
- テーブルにどの列が存在するかを確認したい場合。このときは `LIMIT 1` を指定します。ただし、`DESC TABLE` クエリを使用する方が望ましいです。
- 少数の列に対して `PREWHERE` による厳しいフィルタリングが行われている場合。
- サブクエリ内（外側のクエリで不要な列はサブクエリから除外されるため）。

それ以外のすべての場合、アスタリスクを使用することは推奨しません。アスタリスクを使用すると、カラム型 DBMS の利点ではなく欠点のみを被ることになるためです。言い換えると、アスタリスクの使用は推奨されません。

### 極値 \{#extreme-values\}

結果に加えて、結果列に対する最小値および最大値も取得できます。これを行うには、**extremes** 設定を 1 にします。最小値と最大値は、数値型、日付、および日時型に対して計算されます。その他の列については、デフォルト値が出力されます。

最小値と最大値を表す 2 行が追加で計算されます。これらの追加 2 行は、他の行とは分離されて、`XML`、`JSON*`、`TabSeparated*`、`CSV*`、`Vertical`、`Template` および `Pretty*` [形式](../../../interfaces/formats.md)で出力されます。その他の形式では出力されません。

`JSON*` および `XML` 形式では、極値は独立した `extremes` フィールド内に出力されます。`TabSeparated*`、`CSV*` および `Vertical` 形式では、この行はメイン結果の後に、`totals` が存在する場合はその後に出力されます。その前には（他のデータの後に）空行が 1 行入ります。`Pretty*` 形式では、この行はメイン結果の後に、`totals` が存在する場合はその後に、別テーブルとして出力されます。`Template` 形式では、極値は指定されたテンプレートに従って出力されます。

極値は、`LIMIT` の前、ただし `LIMIT BY` の後の行に対して計算されます。ただし、`LIMIT offset, size` を使用する場合、`offset` より前の行も `extremes` に含まれます。ストリーミングリクエストでは、`LIMIT` を通過した少数の行が結果に含まれる場合もあります。

### 注意事項 \{#notes\}

クエリの任意の箇所でエイリアス（`AS` で指定する別名）を使用できます。

`GROUP BY`、`ORDER BY`、`LIMIT BY` 句では、位置指定引数をサポートします。これを有効にするには、[enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) 設定を有効化します。すると、例えば `ORDER BY 1,2` は、テーブル内の行を第1列、その後第2列でソートします。

## 実装の詳細 \{#implementation-details\}

クエリで `DISTINCT`、`GROUP BY`、`ORDER BY` 句および `IN` と `JOIN` のサブクエリを省略した場合、そのクエリは完全にストリーミング処理され、RAM の使用量は O(1) に抑えられます。そうでない場合、適切な制限を指定しないと、クエリが大量の RAM を消費する可能性があります。

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

詳細については「Settings」セクションを参照してください。外部ソート（一時テーブルをディスクに保存）および外部集約を使用することが可能です。

## SELECT 修飾子 \{#select-modifiers\}

`SELECT` クエリでは、次の修飾子を使用できます。

| Modifier                            | Description                                                                                                                                                                                                                                                                                                                                                                              |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`APPLY`](./apply_modifier.md)     | クエリの外側のテーブル式が返す各行に対して、ある関数を呼び出せるようにします。                                                                                                                                                                                                                                                                                                            |
| [`EXCEPT`](./except_modifier.md)   | 結果から除外する 1 つ以上の列名を指定します。一致するすべての列名は出力から省略されます。                                                                                                                                                                                                                                                                                                 |
| [`REPLACE`](./replace_modifier.md) | 1 つ以上の[式エイリアス](/sql-reference/syntax#expression-aliases) を指定します。各エイリアスは、`SELECT *` 文の列名のいずれかと一致している必要があります。出力列リストでは、エイリアスに一致する列が、その `REPLACE` で指定された式に置き換えられます。この修飾子は列の名前や順序は変更しませんが、値および値の型を変更することがあります。 |

### 修飾子の組み合わせ

各修飾子は個別にも、組み合わせて使うこともできます。

**例:**

同じ修飾子を複数回使用する例。

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


## SELECT クエリでの SETTINGS

`SELECT` クエリ内で、必要な設定を直接指定できます。設定値はこのクエリに対してのみ適用され、クエリの実行後はデフォルト値または以前の値にリセットされます。

設定を行う他の方法については[こちら](/operations/settings/overview)を参照してください。

ブール型の設定を true にする場合は、値の代入を省略することで短縮構文を使用できます。設定名だけが指定された場合、自動的に `1` (true) に設定されます。

**例**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
