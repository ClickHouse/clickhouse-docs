---
slug: /sql-reference/syntax
sidebar_position: 2
sidebar_label: 構文
title: 構文
displayed_sidebar: sqlreference
---

このセクションでは、ClickHouseのSQL構文について見ていきます。  
ClickHouseはSQLに基づく構文を使用していますが、いくつかの拡張や最適化を提供しています。

## クエリ解析 {#query-parsing}

ClickHouseには2種類のパーサーがあります：
- _フルSQLパーサー_（再帰下降パーサー）。
- _データフォーマットパーサー_（高速ストリームパーサー）。

フルSQLパーサーは、`INSERT`クエリ以外のすべての場合で使用され、`INSERT`クエリは両方のパーサーを使用します。

以下のクエリを見てみましょう：

```sql
INSERT INTO t VALUES (1, 'Hello, world'), (2, 'abc'), (3, 'def')
```

すでに述べたように、`INSERT`クエリは両方のパーサーを利用しています。  
`INSERT INTO t VALUES`の部分はフルパーサーによって解析され、  
データ`(1, 'Hello, world'), (2, 'abc'), (3, 'def')`はデータフォーマットパーサー、つまり高速ストリームパーサーによって解析されます。

<details>
<summary>フルパーサーの有効化</summary>

データに対してフルパーサーを有効にするには、 [`input_format_values_interpret_expressions`](../operations/settings/settings-formats.md#input_format_values_interpret_expressions) 設定を使用します。  

前述の設定が `1` に設定されている場合、  
ClickHouseは最初に値を高速ストリームパーサーで解析しようとします。  
失敗した場合、ClickHouseはデータのためにフルパーサーを使用し、SQLの [式](#expressions) のように扱います。
</details>

データは任意のフォーマットを持つことができます。  
クエリが受信されると、サーバーはRAM内でリクエストの最大[max_query_size](../operations/settings/settings.md#max_query_size)バイトを計算します  
（デフォルトでは1MB）し、それ以外の部分はストリーム解析されます。  
これは大きな `INSERT` クエリに問題が発生するのを避けるためであり、ClickHouseにデータを挿入するための推奨される方法です。

[`Values`](../interfaces/formats.md/#data-format-values) フォーマットを使用した `INSERT` クエリでは、  
データが `SELECT` クエリの式と同じように解析されるように見えるかもしれませんが、実際にはそうではありません。  
`Values` フォーマットは非常に制限されています。

このセクションの残りの部分はフルパーサーについて扱います。

:::note
フォーマットパーサーに関する詳細情報は、[フォーマット](../interfaces/formats.md)セクションを参照してください。
:::

## スペース {#spaces}

- 構文構造の間には、任意の数のスペース記号を挿入できます（クエリの開始と終了を含む）。  
- スペース記号には、空白、タブ、改行、CR、フォームフィードが含まれます。

## コメント {#comments}

ClickHouseはSQLスタイルとCスタイルのコメントの両方をサポートしています：

- SQLスタイルのコメントは `--`, `#!` または `# ` で始まり、行の終わりまで続きます。 `--` と `#!` の後の空白は省略可能です。
- Cスタイルのコメントは `/*` から `*/` で、複数行に渡ることができます。 空白も必要ありません。

## キーワード {#keywords}

ClickHouseのキーワードは、コンテキストに応じて _大文字小文字を区別する_ か _区別しない_ のいずれかです。

キーワードは **大文字小文字を区別しない** です：

- SQL標準に対応する場合。 例えば、 `SELECT`、`select`、`SeLeCt` はすべて有効です。
- 一部の人気DBMS（MySQLやPostgres）での実装。 例えば、 `DateTime` は `datetime` と同じです。

:::note
データ型名が大文字小文字を区別するかどうかは、 [system.data_type_families](../operations/system-tables/data_type_families.md#system_tables-data_type_families) テーブルで確認できます。
:::

標準SQLとは対照的に、他のすべてのキーワード（関数名を含む）は **大文字小文字を区別する** です。

さらに、キーワードは予約語ではありません。  
それらは対応するコンテキストでのみそのように扱われます。  
キーワードと同じ名前の[識別子](#identifiers)を使用する場合は、ダブルクォーテーションまたはバックティックで囲んでください。

例えば、以下のクエリは、 `table_name` が `"FROM"` という名前のカラムを持っている場合に有効です：

```sql
SELECT "FROM" FROM table_name
```

## 識別子 {#identifiers}

識別子は次のようなものです：

- クラスター、データベース、テーブル、パーティション、およびカラム名。
- [関数](#functions)。
- [データ型](../sql-reference/data-types/index.md)。
- [式のエイリアス](#expression-aliases)。

識別子は引用符付きまたは引用符なしの形式で使用できますが、後者が好まれます。

引用符なしの識別子は、正規表現 `^[a-zA-Z_][0-9a-zA-Z_]*$` に一致しなければならず、[キーワード](#keywords)と等しくなってはいけません。  
以下の表は、有効な識別子と無効な識別子の例を示しています：

| 有効な識別子                              | 無効な識別子                            |
|--------------------------------------------|------------------------------------------|
| `xyz`, `_internal`, `Id_with_underscores_123_` | `1x`, `tom@gmail.com`, `äußerst_schön` |

キーワードと同じ識別子を使用したい場合や、他の記号を識別子に使用したい場合は、ダブルクォーテーションまたはバックティックで囲んでください。例えば、 `"id"`、 `` `id` `` のように。

:::note
引用符付き識別子のエスケープに適用されるルールは、文字列リテラルにも適用されます。 詳細については、[文字列](#string)を参照してください。
:::

## リテラル {#literals}

ClickHouseにおけるリテラルは、クエリ内で直接表現される値です。  
言い換えれば、クエリ実行中に変化しない固定値です。

リテラルとしては次のものがあります：
- [文字列](#string)
- [数値](#numeric)
- [複合型](#compound)
- [`NULL`](#null)
- [Heredocs](#heredoc) （カスタム文字列リテラル）

これらそれぞれについて、以下のセクションで詳しく見ていきます。

### 文字列 {#string}

文字列リテラルは単一引用符で囲む必要があります。ダブルクォーテーションはサポートされていません。

エスケープは次のように機能します：

- 先頭に単一引用符が付く場合、単一引用符文字 `'`（この文字のみ）は `''` としてエスケープできます。または、  
- 前にバックスラッシュを付けて、以下の表に記載されたサポートされているエスケープシーケンスを使用します。

:::note
バックスラッシュは、その後に他の文字が続く場合に特別な意味を失い、文字通りに解釈されます。
:::

| サポートされるエスケープ               | 説明                                                                        |
|----------------------------------------|----------------------------------------------------------------------------|
| `\xHH`                                 | 8ビットキャラクター指定の後に任意の数の16進数が続く。                         | 
| `\N`                                   | 予約されており、何もしない（例: `SELECT 'a\Nb'` は `ab` を返す）             |
| `\a`                                   | アラート                                                                    |
| `\b`                                   | バックスペース                                                              |
| `\e`                                   | エスケープ文字                                                             |
| `\f`                                   | フォームフィード                                                            |
| `\n`                                   | 改行                                                                       |
| `\r`                                   | キャリッジリターン                                                         |
| `\t`                                   | 水平タブ                                                                   |
| `\v`                                   | 垂直タブ                                                                   |
| `\0`                                   | NULL文字                                                                  |
| `\\`                                   | バックスラッシュ                                                            |
| `\'`（または ` '' `）                  | 単一引用符                                                                 |
| `\"`                                   | ダブルクォーテーション                                                       |
| `` ` ``                                | バックティック                                                              |
| `\/`                                   | スラッシュ                                                                  |
| `\=`                                   | イコール符号                                                              |
| ASCII制御文字（c &lt;= 31）             |                                                                             |

:::note
文字列リテラルでは、少なくとも `'` と `\` をエスケープする必要があり、エスケープコード `\'`（または: `''`）と `\\` を使用します。
:::

### 数値 {#numeric}

数値リテラルは次のように解析されます：

- 最初に、64ビット符号付き整数として、[strtoull](https://en.cppreference.com/w/cpp/string/byte/strtoul) 関数を使用して解析されます。
- 失敗した場合、64ビット符号なし整数として、[strtoll](https://en.cppreference.com/w/cpp/string/byte/strtol) 関数を使用します。
- さらに失敗した場合、浮動小数点数として、[strtod](https://en.cppreference.com/w/cpp/string/byte/strtof) 関数を使用します。
- それ以外の場合、エラーが返されます。

リテラル値は、値が収まる最小の型にキャストされます。  
例えば：
- `1` は `UInt8` として解析されます。
- `256` は `UInt16` として解析されます。

詳細については、[データ型](../sql-reference/data-types/index.md)を参照してください。

数値リテラル内のアンダースコア `_` は無視され、可読性を向上させるために使用できます。

サポートされる数値リテラルは次のとおりです：

| 数値リテラル                               | 例                                           |
|-------------------------------------------|----------------------------------------------|
| **整数**                                  | `1`, `10_000_000`, `18446744073709551615`, `01` |
| **小数**                                  | `0.1`                                        |
| **指数表記**                              | `1e100`, `-1e-100`                          |
| **浮動小数点数**                          | `123.456`, `inf`, `nan`                     |
| **16進数**                                | `0xc0fe`                                     |
| **SQL標準互換の16進数文字列**             | `x'c0fe'`                                    |
| **2進数**                                | `0b1101`                                     |
| **SQL標準互換の2進数文字列**              | `b'1101'`                                    |

:::note
偶数リテラルは、誤って解釈されるのを避けるためにサポートされていません。
:::

### 複合型 {#compound}

配列は角括弧で構築されます `[1, 2, 3]`。 タプルは括弧で構築されます `(1, 'Hello, world!', 2)`。  
技術的には、これらはリテラルではなく、配列作成演算子およびタプル作成演算子を使用した式です。  
配列には少なくとも1つの項目が含まれる必要があり、タプルには少なくとも2つの項目が必要です。

:::note
タプルが `SELECT` クエリの `IN` 節に表示される場合に別のケースがあります。  
クエリ結果にはタプルが含まれますが、タプルをデータベースに保存することはできません（[Memory](../engines/table-engines/special/memory.md) エンジンを使用したテーブルを除く）。
:::

### NULL {#null}

`NULL`は、値が欠けていることを示すために使用されます。  
テーブルフィールドに `NULL` を保存するには、そのフィールドが[Nullable](../sql-reference/data-types/nullable.md)型である必要があります。

:::note
`NULL` に関して注意すべき点：

- データフォーマット（入力または出力）によって、 `NULL` は異なる表現を持つことがあります。 詳細は [データフォーマット](../interfaces/formats.md#formats) を参照してください。
- `NULL`の処理は微妙であり、例えば、比較演算の引数のどちらかが `NULL` の場合、その演算の結果も `NULL` になります。 同様に、乗算、加算、その他の演算にも当てはまります。 各演算のドキュメントを読むことをお勧めします。
- クエリでは、 [`IS NULL`](../sql-reference/operators/index.md#is-null) および [`IS NOT NULL`](../sql-reference/operators/index.md#is-not-null) 演算子や、関連する関数 `isNull` および `isNotNull` を使用して `NULL` を確認できます。
:::

### Heredoc {#heredoc}

[heredoc](https://en.wikipedia.org/wiki/Here_document) は、元のフォーマットを維持しながら文字列（しばしば複数行）を定義する方法です。  
Heredocはカスタム文字列リテラルとして定義され、2つの `$` シンボルの間に配置されます。

例えば：

```sql
SELECT $heredoc$SHOW CREATE VIEW my_view$heredoc$;

┌─'SHOW CREATE VIEW my_view'─┐
│ SHOW CREATE VIEW my_view   │
└────────────────────────────┘
```

:::note
- 2つのheredocの間にある値は「そのまま」で処理されます。
:::

:::tip
- Heredocを使用してSQL、HTML、XMLコードなどのスニペットを埋め込むことができます。
:::

## クエリパラメータの定義と利用 {#defining-and-using-query-parameters}

クエリパラメータを使用すると、具体的な識別子の代わりに抽象的なプレースホルダーを含む一般的なクエリを書くことができます。  
クエリパラメータを含むクエリが実行されると、すべてのプレースホルダーが解決されて実際のクエリパラメータの値に置き換えられます。

クエリパラメータを定義する方法は2つあります：

- `SET param_<name>=<value>`
- `--param_<name>='<value>'`

2番目のバリアントを使用する場合、これはコマンドラインの `clickhouse-client` に引数として渡されます。  
- `<name>` はクエリパラメータの名前です。
- `<value>` はその値です。

クエリパラメータは、`{<name>: <datatype>}`を使用してクエリ内で参照できます。 `<name>` はクエリパラメータの名前で、 `<datatype>` は変換されるデータ型です。

<details>
<summary>SETコマンドの例</summary>

例えば、以下のSQLでは `a`、`b`、`c`、`d` という名前のパラメータを定義しています - 各パラメータは異なるデータ型を持っています：

```sql
SET param_a = 13;
SET param_b = 'str';
SET param_c = '2022-08-04 18:30:53';
SET param_d = {'10': [11, 12], '13': [14, 15]};

SELECT
   {a: UInt32},
   {b: String},
   {c: DateTime},
   {d: Map(String, Array(UInt8))};

13	str	2022-08-04 18:30:53	{'10':[11,12],'13':[14,15]}
```
</details>

<details>
<summary>clickhouse-clientを使用した例</summary>

`clickhouse-client` を使用している場合、パラメータは `--param_name=value` の形式で指定されます。 例えば、以下のパラメータは名前 `message` を持ち、 `String` として取得されます：

```bash
clickhouse-client --param_message='hello' --query="SELECT {message: String}"

hello
```

クエリパラメータがデータベース、テーブル、関数、またはその他の識別子の名前を表す場合、型として `Identifier` を使用してください。 例えば、以下のクエリは `uk_price_paid` という名前のテーブルから行を返します：

```sql
SET param_mytablename = "uk_price_paid";
SELECT * FROM {mytablename:Identifier};
```
</details>

:::note
クエリパラメータは、任意のSQLクエリ内の任意の場所で使用できる一般的なテキスト置換ではありません。  
主に識別子やリテラルの代わりに `SELECT` 文で機能するように設計されています。
:::

## 関数 {#functions}

関数呼び出しは、識別子のように書かれ、丸括弧内に引数リスト（空の場合も可能）を持ちます。  
標準SQLとは異なり、括弧は必要であり、空の引数リストの場合にも必要です。  
例えば：

```sql
now()
```

また以下もあります：
- [通常の関数](../sql-reference/functions/overview)。
- [集約関数](../sql-reference/aggregate-functions/index.md)。

一部の集約関数は、引数のリストを2つ括弧内に持つことができます。例えば：

```sql
quantile (0.9)(x)
```

これらの集約関数は「パラメトリック」関数と呼ばれ、最初のリストの引数は「パラメータ」と呼ばれます。

:::note
パラメータなしの集約関数の構文は、通常の関数と同じです。
:::

## 演算子 {#operators}

演算子はクエリ解析時にその優先順位と左結合性を考慮して、それぞれの関数に変換されます。

例えば、式 

```text
1 + 2 * 3 + 4
```

は次のように変換されます：

```
plus(plus(1, multiply(2, 3)), 4)`
```

## データ型とデータベーステーブルエンジン {#data-types-and-database-table-engines}

データ型とテーブルエンジンは `CREATE` クエリで、識別子や関数と同じように記述されます。  
つまり、引数リストを括弧で含むことも含まないこともできます。

詳細については、以下のセクションを参照してください：
- [データ型](/sql-reference/data-types/index.md)
- [テーブルエンジン](/engines/table-engines/index.md)
- [CREATE](/sql-reference/statements/create/index.md)。

## 式 {#expressions}

式は次のようなものになります：
- 関数
- 識別子
- リテラル
- 演算子の適用
- 括弧内の式
- サブクエリ
- またはアスタリスク。

[エイリアス](#expression-aliases)を含むこともできます。

式のリストは、1つ以上の式をカンマで区切ったものです。  
関数や演算子は、引数として式を持つことができます。

## 式のエイリアス {#expression-aliases}

エイリアスは、クエリ内の[式](#expressions)に対するユーザー定義の名前です。

```sql
expr AS alias
```

上記の構文の部分は以下のように説明されます。

| 構文の部分 | 説明                                                                                                                                          | 例                                                                   | 注意事項                                                                                                                                                  |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `AS`       | エイリアスを定義するためのキーワード。 `SELECT` 句でテーブル名またはカラム名のエイリアスを `AS` キーワードを使用せずに定義できます。         | `SELECT table_name_alias.column_name FROM table_name table_name_alias` | [CAST](./functions/type-conversion-functions.md#castx-t) 関数では、 `AS` キーワードは別の意味を持ちます。関数の説明を参照してください。 |
| `expr`     | ClickHouseによってサポートされる任意の式。                                                                                                       | `SELECT column_name * 2 AS double FROM some_table`                    |                                                                                                                                                          |
| `alias`    | `expr` の名前。エイリアスは[識別子](#identifiers)構文に従っている必要があります。                                                                  | `SELECT "table t".column_name FROM table_name AS "table t"`          |                                                                                                                                                          |

### 使用に関する注意 {#notes-on-usage}

- エイリアスはクエリまたはサブクエリに対してグローバルであり、クエリ内の任意の部分で任意の式のエイリアスを定義できます。 例：

```sql
SELECT (1 AS n) + 2, n`.
```

- エイリアスはサブクエリ内やサブクエリ間では表示されません。 例えば、次のクエリを実行すると、ClickHouseは例外 `Unknown identifier: num` を生成します：

```sql
`SELECT (SELECT sum(b.a) + num FROM b) - a.a AS num FROM a`
```

- サブクエリの `SELECT` 句で結果のカラムにエイリアスが定義されている場合、これらのカラムは外部のクエリで見ることができます。 例：

```sql
SELECT n + m FROM (SELECT 1 AS n, 2 AS m)`.
```

- カラム名やテーブル名と同じエイリアスには注意してください。 次の例を見てみましょう：

```sql
CREATE TABLE t
(
    a Int,
    b Int
)
ENGINE = TinyLog();

SELECT
    argMax(a, b),
    sum(b) AS b
FROM t;

受信した例外（バージョン 18.14.17）：
Code: 184。 DB::Exception: localhost:9000から受信しました。DB::Exception: 集約関数 sum(b) がクエリ内の別の集約関数内に見つかりました。
```

前の例では、`t` というテーブルを `b` カラムを持って宣言しました。  
その後、データを選択する際に `sum(b) AS b` エイリアスを定義しました。  
エイリアスがグローバルであるため、ClickHouseは `argMax(a, b)` の `b` 式内のリテラルを `sum(b)` の式に置き換えました。  
この置き換えが例外を引き起こしました。

:::note
このデフォルトの動作は、[prefer_column_name_to_alias](../operations/settings/settings.md#prefer-column-name-to-alias) を `1` に設定することで変更できます。
:::

## アスタリスク {#asterisk}

`SELECT` クエリでは、アスタリスクで式を置き換えることができます。  
詳細については、[SELECT](/sql-reference/statements/select/index.md#asterisk) セクションを参照してください。
