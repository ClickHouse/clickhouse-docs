---
description: 'Syntaxのドキュメント'
displayed_sidebar: 'sqlreference'
sidebar_label: '構文'
sidebar_position: 2
slug: '/sql-reference/syntax'
title: 'Syntax'
---



このセクションでは、ClickHouseのSQL構文を見ていきます。 
ClickHouseはSQLに基づく構文を使用しますが、多くの拡張と最適化を提供しています。

## クエリ解析 {#query-parsing}

ClickHouseには2種類のパーサーがあります：
- _完全SQLパーサー_（再帰的下降パーサー）。
- _データフォーマットパーサー_（高速ストリームパーサー）。

完全SQLパーサーは、`INSERT` クエリ以外のすべてのケースで使用され、`INSERT` クエリでは両方のパーサーが使用されます。 

以下のクエリを見てみましょう：

```sql
INSERT INTO t VALUES (1, 'Hello, world'), (2, 'abc'), (3, 'def')
```

すでに述べたように、`INSERT` クエリは両方のパーサーを利用します。 
`INSERT INTO t VALUES` フラグメントは完全パーサーによって解析され、 
データ `(1, 'Hello, world'), (2, 'abc'), (3, 'def')` はデータフォーマットパーサー、または高速ストリームパーサーによって解析されます。

<details>
<summary>完全パーサーの有効化</summary>

データの完全パーサーを有効にするには、[`input_format_values_interpret_expressions`](../operations/settings/settings-formats.md#input_format_values_interpret_expressions) 設定を使用します。 

前述の設定が `1` に設定されている場合、 
ClickHouseは最初に高速ストリームパーサーを使って値を解析しようとします。 
失敗した場合、ClickHouseはデータに対して完全パーサーを使用し、SQLの [式](#expressions) のように扱います。
</details>

データは任意の形式を持つことができます。 
クエリが受信されると、サーバーはリクエストの [max_query_size](../operations/settings/settings.md#max_query_size) バイトをRAM内で計算し（デフォルトは1 MB）、残りはストリームパースされます。
これは、大きな `INSERT` クエリに関する問題を回避するためです。これはClickHouseにデータを挿入する推奨方法です。

`INSERT` クエリで[`Values`](../interfaces/formats.md/#data-format-values)フォーマットを使用する際、 
データが `SELECT` クエリの式と同様に解析されているように見えるかもしれませんが、実際はそうではありません。 
`Values` フォーマットははるかに制限があります。

このセクションの残りは完全パーサーについてカバーしています。

:::note
フォーマットパーサーに関する詳細は、[フォーマット](../interfaces/formats.md)セクションを参照してください。
:::

## 空白 {#spaces}

- 構文構造間には任意の数の空白記号を置くことができます（クエリの先頭と末尾を含む）。 
- 空白記号には、スペース、タブ、改行、CR、フォームフィードが含まれます。

## コメント {#comments}

ClickHouseはSQLスタイルコメントとCスタイルコメントの両方をサポートしています：

- SQLスタイルコメントは `--`、`#!` または `# ` で始まり、行の終わりまで続きます。 `--` および `#!` の後のスペースは省略可能です。
- Cスタイルコメントは `/*` から `*/` までの範囲であり、複数行です。スペースは必要ありません。 

## キーワード {#keywords}

ClickHouseのキーワードは、コンテキストに応じて _大文字と小文字を区別する_ または _大文字と小文字を区別しない_ ことがあります。

キーワードは **大文字と小文字を区別しません**。 SQL標準に対応する場合、例えば、 `SELECT`、`select`、および `SeLeCt` はすべて有効です。
一部の一般的なDBMS（MySQLまたはPostgres）での実装の場合も同様です。例えば、 `DateTime` は `datetime` と同じです。

:::note
データ型名が大文字と小文字を区別するかどうかは、[system.data_type_families](/operations/system-tables/data_type_families)テーブルで確認できます。
:::

標準SQLとは対照的に、他のすべてのキーワード（関数名を含む）は **大文字と小文字を区別します**。

さらに、キーワードは予約済みではありません。 
それは、その対応するコンテキストでのみそのように扱われます。 
同じ名前の [識別子](#identifiers) を使用する場合は、二重引用符またはバッククオートで囲む必要があります。 

例えば、次のクエリは、有効な場合 `table_name` に `"FROM"` という名前のカラムがある場合が有効です：

```sql
SELECT "FROM" FROM table_name
```

## 識別子 {#identifiers}

識別子は次のとおりです：

- クラスター、データベース、テーブル、パーティション、およびカラム名。
- [関数](#functions)。
- [データタイプ](../sql-reference/data-types/index.md)。
- [式のエイリアス](#expression-aliases)。

識別子は引用符付きまたは非引用符であることができ、後者が好まれます。

非引用符付き識別子は、正規表現 `^[a-zA-Z_][0-9a-zA-Z_]*$` に一致する必要があり、[キーワード](#keywords) と同じではあってはいけません。
有効および無効な識別子の例を以下の表に示します：

| 有効な識別子                               | 無効な識別子                     |
|--------------------------------------------|----------------------------------|
| `xyz`、`_internal`、`Id_with_underscores_123_` | `1x`、`tom@gmail.com`、`äußerst_schön` |


キーワードと同じ識別子を使用したい場合や、識別子内で他の記号を使用したい場合は、二重引用符またはバッククオートで引用してください。例： `"id"`、 `` `id` ``。

:::note
引用された識別子のエスケープに適用されるのと同じ規則が文字列リテラルにも適用されます。詳細は[文字列](#string)を参照してください。
:::

## リテラル {#literals}

ClickHouseにおけるリテラルは、クエリ内で直接表現される値です。
言い換えれば、それはクエリ実行中に変更されない固定値です。

リテラルは次のものを含むことができます：
- [文字列](#string)
- [数値](#numeric)
- [コンパウンド](#compound)
- [`NULL`](#null)
- [Heredocs](#heredoc)（カスタム文字列リテラル）

各々について、以下のセクションで詳しく見ていきます。

### 文字列 {#string}

文字列リテラルはシングルクォートで囲む必要があります。ダブルクォートはサポートされていません。

エスケープは次のいずれかで機能します：

- 前置きシングルクォートを使用し、その場合、シングルクォート文字 `'`（およびこのキャラクターのみ）を `''` としてエスケープすることができるか、または
- 前置きバックスラッシュを使用し、以下の表に示すサポートされているエスケープシーケンスを使用します。

:::note
バックスラッシュは特別な意味を失い、リスト以下の文字以外の文字の前にある場合は文字通りに解釈されます。
:::

| サポートされているエスケープ              | 説明                                                             |
|-------------------------------------------|------------------------------------------------------------------|
| `\xHH`                                    | 8ビットのキャラクター仕様で、続く任意の数の16進数（H）。                 | 
| `\N`                                      | 予約語で、何もしません（例えば `SELECT 'a\Nb'` は `ab` を返します）               |
| `\a`                                      | アラート                                                           |
| `\b`                                      | バックスペース                                                    |
| `\e`                                      | エスケープ文字                                                    |
| `\f`                                      | フォームフィード                                                  |
| `\n`                                      | 改行                                                             |
| `\r`                                      | キャリッジリターン                                              |
| `\t`                                      | 水平タブ                                                        |
| `\v`                                      | 垂直タブ                                                        |
| `\0`                                      | ヌル文字                                                        |
| `\\`                                      | バックスラッシュ                                                |
| `\'`（または ` '' `）                     | シングルクォート                                                |
| `\"`                                      | ダブルクォート                                                |
| `` ` ``                                   | バックティック                                                  |
| `\/`                                      | スラッシュ                                                      |
| `\=`                                      | イコールサイン                                                  |
| ASCII制御文字（c &lt;= 31）。              |                                                              |

:::note
文字列リテラル内では、`'` および `\` をエスケープコード `\'`（または `''`）および `\\` を使用してエスケープする必要があります。
:::

### 数値 {#numeric}

数値リテラルは次のように解析されます：

- 最初に、64ビット符号付き数値として、[strtoull](https://en.cppreference.com/w/cpp/string/byte/strtoul) 関数を使用します。
- 失敗した場合、64ビット符号なし数値として、[strtoll](https://en.cppreference.com/w/cpp/string/byte/strtol) 関数を使用します。
- 失敗した場合、浮動小数点数として、[strtod](https://en.cppreference.com/w/cpp/string/byte/strtof) 関数を使用します。
- それ以外の場合、エラーが返されます。

リテラル値は、その値が収まる最も小さな型にキャストされます。
例えば：
- `1` は `UInt8` として解析され、
- `256` は `UInt16` として解析されます。

詳細については、[データタイプ](../sql-reference/data-types/index.md)を参照してください。

数値リテラル内のアンダースコア `_` は無視され、可読性を向上させるために使用できます。

次の数値リテラルがサポートされています：

| 数値リテラル                                   | 例                                       |
|-----------------------------------------------|-----------------------------------------|
| **整数**                                      | `1`、`10_000_000`、`18446744073709551615`、`01` |
| **小数**                                      | `0.1`                                   |
| **指数表記**                                  | `1e100`、`-1e-100`                      |
| **浮動小数点数**                              | `123.456`、`inf`、`nan`                 |
| **16進数**                                    | `0xc0fe`                                |
| **SQL標準互換の16進文字列**                   | `x'c0fe'`                               |
| **2進数**                                    | `0b1101`                                |
| **SQL標準互換の2進文字列**                   | `b'1101'`                               |

:::note
偶数リテラルは、誤解を避けるためのサポートはありません。
:::

### コンパウンド {#compound}

配列は角括弧 `[1, 2, 3]` で構築され、タプルは丸括弧 `(1, 'Hello, world!', 2)` で構築されます。
技術的には、これらはリテラルではなく、それぞれ配列作成演算子およびタプル作成演算子を持つ式です。
配列は少なくとも1つのアイテムを含む必要があり、タプルは少なくとも2つのアイテムを持つ必要があります。

:::note
`SELECT` クエリの `IN` 句にタプルが現れる場合は、別のケースがあります。 
クエリ結果にはタプルを含めることができますが、タプルをデータベースに保存することはできません（[Memory](../engines/table-engines/special/memory.md)エンジンを使用するテーブルを除く）。
:::

### NULL {#null}

`NULL` は値が欠落していることを示すために使用されます。 
テーブルフィールドに `NULL` を格納するには、その型が [Nullable](../sql-reference/data-types/nullable.md) 型である必要があります。

:::note
`NULL` に関しては以下の点に注意する必要があります：

- データ形式（入力または出力）によって、`NULL` は異なる表現を持つ場合があります。詳細については、[データフォーマット](/interfaces/formats)を参照してください。
- `NULL` 処理は微妙です。例えば、比較演算子の引数のいずれかが `NULL` の場合、この演算の結果も `NULL` になります。掛け算、足し算、およびその他の演算についても同様です。各演算のドキュメントを読むことをお勧めします。
- クエリでは、[`IS NULL`](/sql-reference/functions/functions-for-nulls#isnull) および [`IS NOT NULL`](/sql-reference/functions/functions-for-nulls#isnotnull) 演算子や、関連する関数 `isNull` および `isNotNull` を使用して `NULL` を確認できます。
:::

### Heredoc {#heredoc}

[heredoc](https://en.wikipedia.org/wiki/Here_document) は、元のフォーマットを維持しながら文字列（しばしば複数行）を定義する方法です。 
heredocはカスタム文字列リテラルとして、2つの `$` シンボルの間に配置されます。

たとえば：

```sql
SELECT $heredoc$SHOW CREATE VIEW my_view$heredoc$;

┌─'SHOW CREATE VIEW my_view'─┐
│ SHOW CREATE VIEW my_view   │
└────────────────────────────┘
```

:::note
- 2つのheredocの間の値は「そのまま」処理されます。
:::

:::tip
- SQL、HTML、またはXMLコードなどのスニペットを埋め込むためにheredocを使用できます。
:::

## クエリパラメータの定義と使用 {#defining-and-using-query-parameters}

クエリパラメータを使用すると、具体的な識別子の代わりに抽象的なプレースホルダーを含む汎用クエリを記述できます。 
クエリパラメータを含むクエリが実行されると、すべてのプレースホルダーが解決され、実際のクエリパラメータの値に置き換えられます。

クエリパラメータを定義する方法は2つあります：

- `SET param_<name>=<value>`
- `--param_<name>='<value>'`

2番目のバリアントを使用する場合、コマンドラインで `clickhouse-client` への引数として渡されます。
- `<name>` はクエリパラメータの名前です。
- `<value>` はその値です。

クエリパラメータは、`{<name>: <datatype>}` を使用してクエリ内で参照でき、ここで `<name>` はクエリパラメータ名、`<datatype>` は変換されるデータ型です。

<details>
<summary>SETコマンドを使用した例</summary>

例えば、次のSQLでは、異なるデータ型を持つ `a`、`b`、`c`、および `d` という名前のパラメータを定義します：

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

13    str    2022-08-04 18:30:53    {'10':[11,12],'13':[14,15]}
```
</details>

<details>
<summary>clickhouse-clientを使用した例</summary>

`clickhouse-client` を使用する場合、パラメータは `--param_name=value` として指定されます。たとえば、次のパラメータは名前 `message` を持ち、`String` として取得されます：

```bash
clickhouse-client --param_message='hello' --query="SELECT {message: String}"

hello
```

クエリパラメータがデータベース、テーブル、関数、または他の識別子の名前を表す場合は、その型に `Identifier` を使用します。たとえば、次のクエリは `uk_price_paid` という名前のテーブルから行を返します：

```sql
SET param_mytablename = "uk_price_paid";
SELECT * FROM {mytablename:Identifier};
```
</details>

:::note
クエリパラメータは、任意のSQLクエリの任意の場所で使用できる一般的なテキスト置換ではありません。 
主に識別子やリテラルの代わりに `SELECT` 文内で機能するように設計されています。
:::

## 関数 {#functions}

関数呼び出しは、ラウンドブラケット内に引数（空の場合もある）を持つ識別子のように書かれます。 
標準SQLとは異なり、ブラケットは空の引数リストの場合でも必要です。 
例えば：

```sql
now()
```

また次のものもあります：
- [通常の関数](/sql-reference/functions/overview)。
- [集約関数](/sql-reference/aggregate-functions)。

一部の集約関数はブラケット内に2つの引数リストを含むことができます。たとえば：

```sql
quantile (0.9)(x) 
```

これらの集約関数は「パラメトリック」関数と呼ばれ、最初のリストの引数は「パラメーター」と呼ばれます。

:::note
パラメータなしの集約関数の構文は、通常の関数と同じです。
:::

## 演算子 {#operators}

演算子はクエリ解析中に対応する関数に変換され、その優先順位と結合性が考慮されます。

たとえば、次の式 

```text
1 + 2 * 3 + 4
```

は次のように変換されます 

```text
plus(plus(1, multiply(2, 3)), 4)`
```

## データタイプとデータベーステーブルエンジン {#data-types-and-database-table-engines}

データタイプとテーブルエンジンは、`CREATE` クエリ内で識別子または関数と同じ方法で書かれます。 
つまり、ブラケット内に引数リストを含む場合と含まない場合があります。

詳細については、以下のセクションを参照してください：
- [データタイプ](/sql-reference/data-types/index.md)
- [テーブルエンジン](/engines/table-engines/index.md)
- [CREATE](/sql-reference/statements/create/index.md)。

## 式 {#expressions}

式は以下のいずれかであることができます：
- 関数
- 識別子
- リテラル
- 演算子の適用
- 括弧内の式
- サブクエリ
- またはアスタリスク。

式は [エイリアス](#expression-aliases) を含むこともできます。

式のリストは、1つ以上の式がカンマで区切られたものです。
関数と演算子は、引数として式を持つことができます。

## 式のエイリアス {#expression-aliases}

エイリアスは、クエリ内の [式](#expressions) に対するユーザー定義名です。

```sql
expr AS alias
```

上記の構文の部分については、以下に説明します。

| 構文の部分 | 説明                                                                                                                                         | 例                                                                  | 注意                                                                                                                                          |
|------------|---------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `AS`       | エイリアスを定義するためのキーワード。`SELECT` 句内でテーブル名やカラム名のエイリアスを定義する際に `AS` キーワードを使用せずに定義できます。| `SELECT table_name_alias.column_name FROM table_name table_name_alias。` | [CAST](/sql-reference/functions/type-conversion-functions#cast) 関数内では、`AS` キーワードは別の意味を持ちます。関数の説明を参照してください。 |
| `expr`     | ClickHouseがサポートする任意の式。                                                                                                         | `SELECT column_name * 2 AS double FROM some_table`                   |                                                                                                                                                |
| `alias`    | `expr` のための名前。エイリアスは [識別子](#identifiers) 構文に従う必要があります。                                                           | `SELECT "table t".column_name FROM table_name AS "table t"`。         |                                                                                                                                              |

### 使用に関する注意事項 {#notes-on-usage}

- エイリアスはクエリまたはサブクエリのグローバルであり、クエリの任意の部分で任意の式のエイリアスを定義できます。例えば：

```sql
SELECT (1 AS n) + 2, n`.
```

- エイリアスはサブクエリ間およびサブクエリ内では表示されません。たとえば、次のクエリを実行すると、ClickHouseは `Unknown identifier: num` という例外を生成します：

```sql
SELECT (SELECT sum(b.a) + num FROM b) - a.a AS num FROM a`
```

- サブクエリの `SELECT` 句で結果カラムのためのエイリアスが定義されると、これらのカラムは外部クエリで可視となります。たとえば：

```sql
SELECT n + m FROM (SELECT 1 AS n, 2 AS m)`.
```

- カラムまたはテーブル名と同じエイリアスには注意が必要です。以下の例を考えてみましょう：

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

Received exception from server (version 18.14.17):
Code: 184. DB::Exception: Received from localhost:9000, 127.0.0.1. DB::Exception: Aggregate function sum(b) is found inside another aggregate function in query.
```

前述の例では、`t` テーブルを `b` カラムで宣言しました。 
その後、データを選択する際に、`sum(b) AS b` エイリアスを定義しました。 
エイリアスはグローバルであるため、 
ClickHouseは指示 `argMax(a, b)` の中のリテラル `b` を `sum(b)` の式に置き換えました。 
この置き換えが例外を引き起こしました。

:::note
このデフォルトの動作は、[prefer_column_name_to_alias](/operations/settings/settings#prefer_column_name_to_alias)を `1` に設定することで変更できます。
:::

## アスタリスク {#asterisk}

`SELECT` クエリでは、アスタリスクが式の代わりとして置き換えられます。 
詳細については、[SELECT](/sql-reference/statements/select/index.md#asterisk)セクションを参照してください。
