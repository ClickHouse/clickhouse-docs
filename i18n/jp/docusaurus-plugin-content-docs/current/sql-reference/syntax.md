---
slug: '/sql-reference/syntax'
sidebar_position: 2
sidebar_label: '構文'
title: '構文'
displayed_sidebar: sqlreference
---

このセクションでは、ClickHouseのSQL構文について見ていきます。  
ClickHouseはSQLに基づいた構文を使用していますが、いくつかの拡張や最適化を提供しています。

## クエリ解析 {#query-parsing}

ClickHouseには2種類のパーサーがあります：
- _フルSQLパーサー_（再帰下降パーサー）。
- _データフォーマットパーサー_（高速ストリームパーサー）。

フルSQLパーサーは、`INSERT` クエリを除くすべてのケースで使用され、`INSERT` クエリでは両方のパーサーが使用されます。

以下のクエリを見てみましょう：

``` sql
INSERT INTO t VALUES (1, 'Hello, world'), (2, 'abc'), (3, 'def')
```

前述の通り、`INSERT` クエリでは両方のパーサーが利用されます。  
`INSERT INTO t VALUES` の部分はフルパーサーによって解析され、  
データ `(1, 'Hello, world'), (2, 'abc'), (3, 'def')` はデータフォーマットパーサー、または高速ストリームパーサーによって解析されます。

<details>
<summary>フルパーサーの有効化</summary>

データに対してフルパーサーを有効にするには、[`input_format_values_interpret_expressions`](../operations/settings/settings-formats.md#input_format_values_interpret_expressions) 設定を使用します。

上記の設定が `1` に設定されていると、  
ClickHouseはまず高速ストリームパーサーで値を解析しようとします。  
失敗した場合は、データのフルパーサーを使用して、それをSQLの [式](#expressions) として扱います。
</details>

データは任意の形式を持つことができます。  
クエリを受信すると、サーバーはRAM内でリクエストの [max_query_size](../operations/settings/settings.md#max_query_size) バイトを超えないように計算し（デフォルトでは1 MB）、残りはストリーム解析されます。  
これは、ClickHouseにデータを挿入する推奨方式である大きな `INSERT` クエリの問題を回避するために行われます。

`INSERT` クエリで [`Values`](../interfaces/formats.md/#data-format-values) フォーマットを使用する場合、  
データは `SELECT` クエリの式と同じように解析されるように見えるかもしれませんが、そうではありません。  
`Values` フォーマットは非常に制限されています。

このセクションの残りはフルパーサーについて説明します。

:::note
フォーマットパーサーに関する詳細は、[フォーマット](../interfaces/formats.md) セクションを参照してください。
:::

## スペース {#spaces}

- 構文構成要素の間には任意の数のスペース記号を置くことができます（クエリの開始と終了を含む）。  
- スペース記号にはスペース、タブ、改行、CR、およびフォームフィードが含まれます。

## コメント {#comments}

ClickHouseはSQLスタイルとCスタイルのコメントの両方をサポートしています：

- SQLスタイルのコメントは `--`、 `#!` または `# ` で始まり、行の終わりまで続きます。 `--` と `#!` の後のスペースは省略可能です。
- Cスタイルのコメントは `/*` から `*/` までであり、複数行にわたることができます。スペースは必須ではありません。

## キーワード {#keywords}

ClickHouseのキーワードは、文脈に応じて _大文字小文字を区別する_ か _大文字小文字を区別しない_ かのどちらかです。

キーワードは以下に該当する場合 **大文字小文字を区別しません**：

- SQL標準。例えば、`SELECT`、`select`、`SeLeCt` はすべて有効です。
- 一部の有名なDBMS（MySQLやPostgres）の実装。例えば、`DateTime` は `datetime` と同じです。

:::note
データ型名が大文字小文字を区別するかどうかは、[system.data_type_families](/operations/system-tables/data_type_families) テーブルで確認できます。
:::

標準SQLとは対照的に、その他のすべてのキーワード（関数名を含む）は **大文字小文字を区別します**。

さらに、キーワードは予約されていません。  
これは、対応する文脈でのみそのように扱われます。  
キーワードと同じ名前の [識別子](#identifiers) を使用する場合は、それらを二重引用符またはバッククオートで囲んでください。

例えば、以下のクエリは、テーブル `table_name` に `"FROM"` という名前のカラムがある場合、有効です：

```sql
SELECT "FROM" FROM table_name
```

## 識別子 {#identifiers}

識別子は次のものを指します：

- クラスター、データベース、テーブル、パーティション、およびカラムの名前。
- [関数](#functions)。
- [データ型](../sql-reference/data-types/index.md)。
- [式のエイリアス](#expression-aliases)。

識別子は引用符の有無にかかわらず使用できますが、後者の方が推奨されます。

非引用識別子は、正規表現 `^[a-zA-Z_][0-9a-zA-Z_]*$` に一致し、[キーワード](#keywords) と等しくなってはいけません。  
以下の表には、有効な識別子と無効な識別子の例が含まれています：

| 有効な識別子                              | 無効な識別子                    |
|-------------------------------------------|---------------------------------|
| `xyz`, `_internal`, `Id_with_underscores_123_` | `1x`, `tom@gmail.com`, `äußerst_schön` |

キーワードと同じ識別子やその他の記号を識別子として使用したい場合は、二重引用符やバッククオートで引用します。例えば、 `"id"` や `` `id` `` のように。

:::note
引用された識別子のエスケープに関するルールは、文字列リテラルにも同様に適用されます。詳細は [String](#string) を参照してください。
:::

## リテラル {#literals}

ClickHouseにおけるリテラルは、クエリ内に直接表現された値です。  
言い換えれば、クエリ実行中に変化しない固定値のことです。

リテラルには次のものがあります：
- [文字列](#string)
- [数値](#numeric)
- [複合](#compound)
- [`NULL`](#null)
- [ヒアドキュメント](#heredoc)（カスタム文字列リテラル）

それぞれの詳細については、以下のセクションで見ていきます。

### 文字列 {#string}

文字列リテラルは単一引用符で囲む必要があります。二重引用符はサポートされていません。

エスケープは以下のように機能します：

- 先行する単一引用符を使い、単一引用符文字 `'`（この文字のみ）を `''` としてエスケープするか、または
- 先行するバックスラッシュを使い、以下のテーブルに示されたエスケープシーケンスを使用します。

:::note
バックスラッシュは特別な意味を失い、以下のリストに載っていない文字の前にある場合はリテラルとして解釈されます。
:::

| サポートされるエスケープ                    | 説明                                                      |
|------------------------------------------|----------------------------------------------------------|
| `\xHH`                                   | 任意の数の16進数字（H）に続く8ビット文字指定。            | 
| `\N`                                     | 予約済み、何もしない（例： `SELECT 'a\Nb'` は `ab` を返す） |
| `\a`                                     | アラート                                                |
| `\b`                                     | バックスペース                                          |
| `\e`                                     | エスケープ文字                                         |
| `\f`                                     | フォームフィード                                        |
| `\n`                                     | 改行                                                  |
| `\r`                                     | キャリッジリターン                                     |
| `\t`                                     | 水平タブ                                              |
| `\v`                                     | 垂直タブ                                              |
| `\0`                                     | ヌル文字                                              |
| `\\`                                    | バックスラッシュ                                       |
| `\'`（または ` '' `）                    | 単一引用符                                            |
| `\"`                                   | 二重引用符                                            |
| `` ` ``                                | バックティック                                         |
| `\/`                                    | スラッシュ                                            |
| `\=`                                    | 等号                                                  |
| ASCII制御文字（c &lt;= 31）。        |                                                      |

:::note
文字列リテラルでは、`'` と `\` をエスケープするために、エスケープコード `\'`（または： `''`）および `\\` を使用する必要があります。
:::

### 数値 {#numeric}

数値リテラルは以下のように解析されます：

- 最初に、64ビット符号付き整数として、[strtoull](https://en.cppreference.com/w/cpp/string/byte/strtoul) 関数を使用して解析されます。
- 失敗した場合は、64ビット符号なし整数として、[strtoll](https://en.cppreference.com/w/cpp/string/byte/strtol) 関数を使用して解析されます。
- それでも失敗した場合は、浮動小数点数として、[strtod](https://en.cppreference.com/w/cpp/string/byte/strtof) 関数を使用して解析されます。
- それ以外の場合はエラーが返されます。

リテラル値は、その値が収まる最小の型にキャストされます。  
例えば：
- `1` は `UInt8` として解析されます。
- `256` は `UInt16` として解析されます。

詳細については、[データ型](../sql-reference/data-types/index.md)を参照してください。

数値リテラルの内部のアンダースコア `_` は無視され、読みやすさを向上させるために使用できます。

以下の数値リテラルがサポートされています：

| 数値リテラル                              | 例                                             |
|-------------------------------------------|-------------------------------------------------|
| **整数**                                  | `1`、`10_000_000`、`18446744073709551615`、`01` |
| **小数**                                  | `0.1`                                          |
| **指数表記**                              | `1e100`、`-1e-100`                              |
| **浮動小数点数**                          | `123.456`、`inf`、`nan`                         |
| **16進数**                                | `0xc0fe`                                       |
| **SQL標準互換の16進数文字列**            | `x'c0fe'`                                      |
| **2進数**                                 | `0b1101`                                       |
| **SQL標準互換の2進数文字列**             | `b'1101'`                                       |

:::note
偶数リテラルは解釈の誤解を避けるためにサポートされていません。
:::

### 複合 {#compound}

配列は角括弧 `[1, 2, 3]` で構成され、タプルは丸括弧 `(1, 'Hello, world!', 2)` で構成されます。  
技術的には、これらはリテラルではなく、配列生成演算子とタプル生成演算子による式です。  
配列は少なくとも1つのアイテムで構成され、タプルは少なくとも2つのアイテムを持たなければなりません。

:::note
`SELECT` クエリの `IN` 句にタプルが出現する場合には別のケースがあります。  
クエリ結果にはタプルが含まれることがありますが、タプルをデータベースに保存することはできません（[Memory](../engines/table-engines/special/memory.md) エンジンを使用するテーブルを除く）。
:::

### NULL {#null}

`NULL` は値が欠損していることを示すために使用されます。  
テーブルフィールドに `NULL` を格納するには、そのフィールドは [Nullable](../sql-reference/data-types/nullable.md) 型でなければなりません。

:::note
`NULL` に関して留意すべき点は以下の通りです：

- データフォーマット（入力または出力）によって、`NULL` の表現が異なる場合があります。詳細は [データフォーマット](/interfaces/formats) を参照してください。
- `NULL` の処理はニュアンスがあります。例えば、比較演算の引数のうち少なくとも1つが `NULL` である場合、この演算の結果も `NULL` になります。乗算、加算、および他の演算にも同様のことが適用されます。各演算のドキュメントを読むことをお勧めします。
- クエリでは、[`IS NULL`](/sql-reference/functions/functions-for-nulls#isnull) および [`IS NOT NULL`](/sql-reference/functions/functions-for-nulls#isnotnull) 演算子と関連関数 `isNull` および `isNotNull` を使用して `NULL` をチェックできます。
:::

### ヒアドキュメント {#heredoc}

[ヒアドキュメント](https://en.wikipedia.org/wiki/Here_document) は、元のフォーマットを保持しながら文字列（通常は複数行）を定義する方法です。  
ヒアドキュメントは、2つの `$` シンボルの間に配置したカスタム文字列リテラルとして定義されます。

例えば：

```sql
SELECT $heredoc$SHOW CREATE VIEW my_view$heredoc$;

┌─'SHOW CREATE VIEW my_view'─┐
│ SHOW CREATE VIEW my_view   │
└────────────────────────────┘
```

:::note
- 2つのヒアドキュメントの間の値は「そのまま」処理されます。
:::

:::tip
- SQL、HTML、XMLコードなどのスニペットを埋め込むためにヒアドキュメントを使用できます。
:::

## クエリパラメータの定義と使用 {#defining-and-using-query-parameters}

クエリパラメータを使用すると、具体的な識別子の代わりに抽象的なプレースホルダーを含む汎用的なクエリを書けます。  
クエリパラメータを含むクエリが実行されると、  
すべてのプレースホルダーが解決され、実際のクエリパラメータの値に置き換えられます。

クエリパラメータを定義する方法は2つあります：

- `SET param_<name>=<value>`
- `--param_<name>='<value>'`

2番目の形式を使用する場合、それはコマンドラインで `clickhouse-client` に引数として渡されます。ここで：
- `<name>` はクエリパラメータの名前です。
- `<value>` はその値です。

クエリパラメータは、`{<name>: <datatype>}` を使用してクエリ内で参照できます。ここで `<name>` はクエリパラメータの名前で、 `<datatype>` は変換されるデータ型です。

<details>
<summary>SETコマンドによる例</summary>

例えば、次のSQLは `a`、 `b`、 `c`、および `d` という名前の異なるデータ型のパラメータを定義します：

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
<summary>clickhouse-clientによる例</summary>

`clickhouse-client` を使用している場合、パラメータは `--param_name=value` として指定されます。例えば、次のパラメータは名前が `message` で、 `String` として取得されます：

```bash
clickhouse-client --param_message='hello' --query="SELECT {message: String}"

hello
```

クエリパラメータがデータベース、テーブル、関数、またはその他の識別子の名前を表す場合は、その型として `Identifier` を使用します。例えば、次のクエリは `uk_price_paid` という名前のテーブルから行を返します：

```sql
SET param_mytablename = "uk_price_paid";
SELECT * FROM {mytablename:Identifier};
```
</details>

:::note
クエリパラメータは、任意のSQLクエリの任意の場所で使用できる一般的なテキスト置換ではありません。  
主に識別子やリテラルの代わりに `SELECT` 文で機能するように設計されています。
:::

## 関数 {#functions}

関数呼び出しは、識別子に続けて、丸括弧内に引数のリスト（空である可能性もあります）を用いて記述します。  
標準SQLとは対照的に、空の引数リストに対しても括弧が必要です。  
例えば：

```sql
now()
```

以下のものもあります：
- [通常の関数](/sql-reference/functions/overview)。
- [集約関数](/sql-reference/aggregate-functions)。

一部の集約関数は、括弧内に2つの引数リストを含むことができます。 例えば：

```sql
quantile (0.9)(x) 
```

これらの集約関数は「パラメトリック」関数と呼ばれ、  
最初のリスト内の引数は「パラメータ」と呼ばれます。

:::note
パラメータなしの集約関数の構文は通常の関数と同じです。
:::

## 演算子 {#operators}

演算子は、クエリ解析中に対応する関数に変換され、その優先度と結合性が考慮されます。

例えば、式 

```text
1 + 2 * 3 + 4
```

は 

```
plus(plus(1, multiply(2, 3)), 4)`
```

に変換されます。

## データ型とデータベーステーブルエンジン {#data-types-and-database-table-engines}

データ型とテーブルエンジンは、 `CREATE` クエリ内で識別子や関数と同じ形で記述されます。  
言い換えれば、それらは括弧内に引数リストを含むことも含まないこともあります。

詳細については、以下のセクションを参照してください：
- [データ型](/sql-reference/data-types/index.md)
- [テーブルエンジン](/engines/table-engines/index.md)
- [CREATE](/sql-reference/statements/create/index.md)。

## 式 {#expressions}

式は次のようになります：
- 関数
- 識別子
- リテラル
- 演算子の適用
- 丸括弧内の式
- サブクエリ
- またはアスタリスク。

式は [エイリアス](#expression-aliases) を含むこともできます。

式のリストは、1つ以上の式がカンマで区切られたものです。  
関数や演算子は、引数として式を持つことができます。

## 式のエイリアス {#expression-aliases}

エイリアスは、クエリ内の [式](#expressions) に対してユーザー定義の名前です。

``` sql
expr AS alias
```

上記の構文の各部分は以下の通りです。

| 構文の部分 | 説明                                                                                                                                  | 例                                                        | メモ                                                                                                                                           |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `AS`      | エイリアスを定義するためのキーワード。`SELECT` 句でテーブル名やカラム名にエイリアスを定義することができ、`AS` キーワードを使用しなくてもよい。 | `SELECT table_name_alias.column_name FROM table_name table_name_alias` | [CAST](/sql-reference/functions/type-conversion-functions#cast) 関数では、`AS` キーワードは別の意味を持ちます。関数の説明を参照してください。  |
| `expr`    | ClickHouseがサポートする任意の式。                                                                                                      | `SELECT column_name * 2 AS double FROM some_table`         |                                                                                                                                                 |
| `alias`   | `expr` の名前。エイリアスは [識別子](#identifiers) 構文に従う必要があります。                                                                        | `SELECT "table t".column_name FROM table_name AS "table t"` |                                                                                                                                                 |

### 使用に関するメモ {#notes-on-usage}

- エイリアスはクエリまたはサブクエリに対してグローバルであり、クエリの任意の部分で任意の式にエイリアスを定義できます。例えば：

```sql
SELECT (1 AS n) + 2, n`.
```

- エイリアスはサブクエリ内やサブクエリ間では可視ではありません。例えば、次のクエリを実行すると、ClickHouseは `Unknown identifier: num` 構文例外を生成します：

```sql
`SELECT (SELECT sum(b.a) + num FROM b) - a.a AS num FROM a`
```

- サブクエリの `SELECT` 句で結果カラムのためにエイリアスが定義されている場合、これらのカラムは外部クエリで可視です。例えば：

```sql
SELECT n + m FROM (SELECT 1 AS n, 2 AS m)`.
```

- カラム名やテーブル名と同じエイリアスには注意が必要です。次の例を考えてみましょう：

``` sql
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

前の例では、 `b` という名前のカラムを持つテーブル `t` を宣言しました。  
その後、データを選択する際に `sum(b) AS b` エイリアスを定義しました。  
エイリアスはグローバルなため、ClickHouseは式 `argMax(a, b)` の中のリテラル `b` を式 `sum(b)` に置き換えました。  
この置き換えが例外を引き起こしました。

:::note
このデフォルトの動作は、[prefer_column_name_to_alias](/operations/settings/settings#prefer_column_name_to_alias) を `1` に設定することで変更できます。
:::

## アスタリスク {#asterisk}

`SELECT` クエリでは、アスタリスクが式の代わりに使われます。  
詳細は [SELECT](/sql-reference/statements/select/index.md#asterisk) セクションを参照してください。
