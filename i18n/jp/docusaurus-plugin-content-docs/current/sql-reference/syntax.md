---
description: '構文に関するドキュメント'
displayed_sidebar: 'sqlreference'
sidebar_label: '構文'
sidebar_position: 2
slug: /sql-reference/syntax
title: '構文'
---

このセクションでは、ClickHouseのSQL構文について見ていきます。  
ClickHouseはSQLに基づいた構文を使用しますが、いくつかの拡張機能や最適化を提供しています。

## クエリ解析 {#query-parsing}

ClickHouseには2種類のパーサーがあります：
- _完全SQLパーサー_（再帰的下降パーサー）。
- _データフォーマットパーサー_（高速ストリームパーサー）。

完全SQLパーサーは、`INSERT` クエリを除いてすべてのケースで使用され、`INSERT` クエリは両方のパーサーを使用します。

以下のクエリを見てみましょう：

```sql
INSERT INTO t VALUES (1, 'Hello, world'), (2, 'abc'), (3, 'def')
```

前述のように、`INSERT` クエリは両方のパーサーを利用します。  
`INSERT INTO t VALUES` の断片は完全パーサーによって解析され、  
データ `(1, 'Hello, world'), (2, 'abc'), (3, 'def')` はデータフォーマットパーサー、または高速ストリームパーサーによって解析されます。

<details>
<summary>完全パーサーを有効にする</summary>

データに対して完全パーサーを有効にするには、 [`input_format_values_interpret_expressions`](../operations/settings/settings-formats.md#input_format_values_interpret_expressions) 設定を使用します。 

前述の設定が `1` に設定されている場合、  
ClickHouseは最初に値を高速ストリームパーサーで解析しようとします。  
失敗した場合、ClickHouseはデータに対して完全パーサーを使用し、SQLの [式](#expressions) のように扱います。
</details>

データは任意のフォーマットを持つことができます。  
クエリを受信すると、サーバーはRAM内でリクエストの[ max_query_size](../operations/settings/settings.md#max_query_size) バイトを計算します  
（デフォルトでは1 MB）、それ以外はストリーム解析されます。  
これは大きな `INSERT` クエリに関する問題を回避するためであり、ClickHouseにデータを挿入する推奨方法です。

`INSERT` クエリで [`Values`](../interfaces/formats.md/#data-format-values)フォーマットを使用する場合、  
データは `SELECT` クエリの式と同様に解析されるように見えますが、実際にはそうではありません。  
`Values` フォーマットははるかに制限されています。

このセクションの残りは完全パーサーについて説明します。

:::note
フォーマットパーサーに関する詳細は、[フォーマット](../interfaces/formats.md)セクションを参照してください。
:::

## 空白 {#spaces}

- 構文構造の間（クエリの開始と終了を含む）には、任意の数の空白記号を含めることができます。  
- 空白記号にはスペース、タブ、改行、CR、およびフォームフィードが含まれます。

## コメント {#comments}

ClickHouseはSQLスタイルコメントとCスタイルコメントの両方をサポートしています：

- SQLスタイルコメントは `--`、`#!`、または `# ` で始まり、行の終わりまで続きます。 `--` および `#!` の後のスペースは省略できます。
- Cスタイルコメントは `/*` から `*/` までの間で、多行にもできます。スペースは必要ありません。

## キーワード {#keywords}

ClickHouseのキーワードは、文脈によって _大文字と小文字を区別する_ または _区別しない_ ことがあります。

キーワードは**大文字と小文字を区別しません**が、以下に該当する場合：

- SQL標準。たとえば、`SELECT`、`select`、および `SeLeCt` はすべて有効です。
- 一部の一般的なDBMSの実装（MySQLやPostgres）。たとえば、`DateTime` は `datetime` と同じです。

:::note
データ型名が大文字と小文字を区別するかどうかは、[system.data_type_families](/operations/system-tables/data_type_families) テーブルで確認できます。
:::

標準SQLとは異なり、他のすべてのキーワード（関数名を含む）は**大文字と小文字を区別します**。

さらに、キーワードは予約されていません。  
それらは対応する文脈内でのみそのように扱われます。  
キーワードと同じ名前の [識別子](#identifiers) を使用する場合は、ダブルクォートまたはバックティックで囲む必要があります。

たとえば、次のクエリは、テーブル`table_name` に `"FROM"` という名前のカラムがある場合は有効です：

```sql
SELECT "FROM" FROM table_name
```

## 識別子 {#identifiers}

識別子は以下を指します：

- クラスター、データベース、テーブル、パーティション、カラムの名前。
- [関数](#functions)。
- [データ型](../sql-reference/data-types/index.md)。
- [式エイリアス](#expression-aliases)。

識別子は引用符付きまたは非引用符付きのどちらでも可能ですが、後者が推奨されます。

非引用符付きの識別子は正規表現 `^[a-zA-Z_][0-9a-zA-Z_]*$` に一致し、[キーワード](#keywords)と等しくなることはできません。  
以下の表は、有効および無効な識別子の例を示します：

| 有効な識別子                              | 無効な識別子                    |
|------------------------------------------|----------------------------------|
| `xyz`、`_internal`、`Id_with_underscores_123_` | `1x`、`tom@gmail.com`、`äußerst_schön` |

キーワードと同じ識別子を使用したい場合や、識別子内で他の記号を使用したい場合は、ダブルクォートまたはバックティックを使用して引用してください。  
例： `"id"`、`` `id` ``。

:::note
引用された識別子のエスケープに適用されるのと同じルールが、文字リテラルにも適用されます。 詳細は、[String](#string)を参照してください。
:::

## リテラル {#literals}

ClickHouseにおけるリテラルは、クエリ内で直接表現される値です。  
言い換えれば、これはクエリ実行中に変更されない固定値です。

リテラルは以下のように分類されます：
- [文字列](#string)
- [数値](#numeric)
- [複合](#compound)
- [`NULL`](#null)
- [Heredocs](#heredoc)（カスタム文字列リテラル）

それぞれの詳細は以下のセクションで見ていきます。

### 文字列 {#string}

文字列リテラルはシングルクォートで囲む必要があります。ダブルクォートはサポートされていません。

エスケープは次の方法で機能します：

- 先行するシングルクォートを使用して、シングルクォート文字 `'` （およびこの文字のみ）を `''` としてエスケープするか、または
- 先行するバックスラッシュを使用し、以下の表にリストされたサポートされるエスケープシーケンスを利用します。

:::note
バックスラッシュは特殊な意味を失い、以下にリストされていない文字の前にある場合は文字通り解釈されます。
:::

| サポートされるエスケープ               | 説明                                                                    |
|---------------------------------------|-------------------------------------------------------------------------|
| `\xHH`                               | 任意の数の16進数の桁（H）に続く8ビット文字の指定。                       | 
| `\N`                                 | 予約語で、何もしません（例： `SELECT 'a\Nb'` は `ab` を返します）      |
| `\a`                                 | アラート                                                               |
| `\b`                                 | バックスペース                                                         |
| `\e`                                 | エスケープ文字                                                        |
| `\f`                                 | フォームフィード                                                       |
| `\n`                                 | 改行                                                                  |
| `\r`                                 | キャリッジリターン                                                    |
| `\t`                                 | 水平タブ                                                              |
| `\v`                                 | 垂直タブ                                                              |
| `\0`                                 | ヌル文字                                                              |
| `\\`                                 | バックスラッシュ                                                      |
| `\'`（または ` '' `）                | シングルクォート                                                      |
| `\"`                                 | ダブルクォート                                                        |
| `` ` ``                              | バックティック                                                        |
| `\/`                                 | スラッシュ                                                            |
| `\=`                                 | 等号                                                                  |
| ASCII制御文字（c &lt;= 31）          |                                                                        |

:::note
文字列リテラルでは、少なくとも `'` と `\` をエスケープコード `\'` （または `''`）および `\\` を使用してエスケープする必要があります。
:::

### 数値 {#numeric}

数値リテラルは以下のように解析されます：

- まず64ビット符号付き整数として、[strtoull](https://en.cppreference.com/w/cpp/string/byte/strtoul) 関数を使用します。
- 失敗した場合は、64ビット符号なし整数として、[strtoll](https://en.cppreference.com/w/cpp/string/byte/strtol) 関数を使用します。
- さらに失敗した場合は、浮動小数点数として[ strtod](https://en.cppreference.com/w/cpp/string/byte/strtof) 関数を使用します。
- それ以外の場合は、エラーが返されます。

リテラル値は、値が収まる最も小さな型にキャストされます。  
たとえば：
- `1` は `UInt8` として解析されます。
- `256` は `UInt16` として解析されます。 

詳細については、[データ型](../sql-reference/data-types/index.md)を参照してください。

数値リテラル内のアンダースコア `_` は無視され、可読性を向上させるために使用できます。

サポートされる数値リテラルは以下の通りです：

| 数値リテラル                           | 例                                             |
|----------------------------------------|-------------------------------------------------|
| **整数**                               | `1`、`10_000_000`、`18446744073709551615`、`01` |
| **小数**                               | `0.1`                                          |
| **指数表記**                           | `1e100`、`-1e-100`                             |
| **浮動小数点数**                       | `123.456`、`inf`、`nan`                        |
| **16進数**                             | `0xc0fe`                                       |
| **SQL標準互換の16進数文字列**         | `x'c0fe'`                                      |
| **2進数**                              | `0b1101`                                       |
| **SQL標準互換の2進数文字列**          | `b'1101'`                                      |

:::note
偶数リテラルは解釈の誤解を避けるためにサポートされていません。
:::

### 複合 {#compound}

配列は角括弧で構成され、`[1, 2, 3]` と表現します。タプルは丸括弧で構成され、`(1, 'Hello, world!', 2)` と表現します。  
技術的にはこれらはリテラルではなく、配列作成演算子およびタプル作成演算子による式です。  
配列は少なくとも1つのアイテムを含む必要があり、タプルは少なくとも2つのアイテムを持つ必要があります。

:::note
タプルが `SELECT` クエリの `IN` 句に出現する場合、別のケースがあります。  
クエリ結果にはタプルが含まれる可能性がありますが、タプルはデータベースに保存できません（[Memory](../engines/table-engines/special/memory.md) エンジンを使用するテーブルを除く）。
:::

### NULL {#null}

`NULL` は値が欠けていることを示すために使用されます。  
テーブルフィールドに `NULL` を格納するには、そのフィールドが [Nullable](../sql-reference/data-types/nullable.md) 型でなければなりません。

:::note
`NULL` に関して注意すべき点は以下の通りです：

- データフォーマット（入力または出力）によって、`NULL` は異なる表現を持つことがあります。詳細については、[データフォーマット](/interfaces/formats) を参照してください。
- `NULL` の処理は微妙です。たとえば、比較演算の引数のいずれかが `NULL` の場合、この演算の結果も `NULL` になります。乗算、加算、その他の演算でも同様です。各演算のドキュメントを読むことをお勧めします。
- クエリ内で、`NULL` を `[IS NULL](/sql-reference/functions/functions-for-nulls#isnull)` および `[IS NOT NULL](/sql-reference/functions/functions-for-nulls#isnotnull)` 演算子や関連関数 `isNull` と `isNotNull` を使用して確認できます。
:::

### Heredoc {#heredoc}

[Heredoc](https://en.wikipedia.org/wiki/Here_document) は、元のフォーマットを維持しながら文字列（しばしば複数行）を定義する方法です。  
Heredoc は、2つの `$` シンボルの間に配置されたカスタム文字列リテラルとして定義されます。

例：

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
- Heredocを使用して、SQL、HTML、XMLコードのスニペットなどを埋め込むことができます。
:::

## クエリパラメータの定義と使用 {#defining-and-using-query-parameters}

クエリパラメータを使用することで、具体的な識別子の代わりに抽象的なプレースホルダーを含む一般的なクエリを書くことができます。  
クエリパラメータを含むクエリが実行されると、すべてのプレースホルダーが解決され、実際のクエリパラメータ値で置き換えられます。

クエリパラメータを定義する方法は2つあります：

- `SET param_<name>=<value>`
- `--param_<name>='<value>'`

2番目のバリアントを使用する場合、これはコマンドラインで `clickhouse-client` に引数として渡されます。  
- `<name>` はクエリパラメータの名前です。
- `<value>` はその値です。

クエリパラメータは、 `{<name>: <datatype>}` を使用してクエリ内で参照できます。  
ここで、`<name>` はクエリパラメータの名前、`<datatype>` は変換されるデータ型です。

<details>
<summary>SETコマンドの例</summary>

たとえば、以下のSQLは、異なるデータ型を持つ `a`、`b`、`c`、および `d` という名前のパラメータを定義します：

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
<summary>clickhouse-clientの例</summary>

`clickhouse-client`を使用している場合、パラメータは `--param_name=value` として指定されます。  
たとえば、次のパラメータは `message` という名前で、`String` として取得されます：

```bash
clickhouse-client --param_message='hello' --query="SELECT {message: String}"

hello
```

クエリパラメータがデータベース、テーブル、関数、またはその他の識別子の名前を表している場合は、 `Identifier` をその型として使用します。  
たとえば、以下のクエリは、テーブル `uk_price_paid` から行を返します：

```sql
SET param_mytablename = "uk_price_paid";
SELECT * FROM {mytablename:Identifier};
```
</details>

:::note
クエリパラメータは、任意のSQLクエリ内の任意の場所で使用できる一般的なテキスト置換ではありません。  
主に、識別子やリテラルの代わりに `SELECT` 文で機能するように設計されています。
:::

## 関数 {#functions}

関数呼び出しは、引数のリスト（空の場合も含む）を括弧内に持つ識別子のように記述されます。  
標準SQLとは異なり、括弧は空の引数リストの場合でも必須です。  
たとえば：

```sql
now()
```

他に以下のものがあります：
- [通常の関数](/sql-reference/functions/overview)。
- [集約関数](/sql-reference/aggregate-functions)。

一部の集約関数は、括弧内に2つの引数リストを含むことができます。  
たとえば：

```sql
quantile (0.9)(x) 
```

これらの集約関数は「パラメトリック」関数と呼ばれ、最初のリストの引数は「パラメーター」と呼ばれます。

:::note
パラメーターがない集約関数の構文は、通常の関数と同じです。
:::

## 演算子 {#operators}

演算子は、クエリ解析中にその優先順位と結合性を考慮して、対応する関数に変換されます。

たとえば、式 

```text
1 + 2 * 3 + 4
```

は以下に変換されます：

```text
plus(plus(1, multiply(2, 3)), 4)`
```

## データ型とデータベーステーブルエンジン {#data-types-and-database-table-engines}

`CREATE` クエリ内のデータ型とテーブルエンジンは、識別子や関数と同様の書き方をします。  
つまり、括弧内に引数リストを含む場合もありますし、含まない場合もあります。

詳細については、以下のセクションを参照してください：
- [データ型](/sql-reference/data-types/index.md)
- [テーブルエンジン](/engines/table-engines/index.md)
- [CREATE](/sql-reference/statements/create/index.md)。

## 式 {#expressions}

式は以下のいずれかです：
- 関数
- 識別子
- リテラル
- 演算子の適用
- 括弧内の式
- サブクエリ
- またはアスタリスク。

式は [エイリアス](#expression-aliases) を含むこともできます。

式のリストは、1つ以上の式をカンマで区切ったものです。  
関数や演算子は、引数に式を持つこともできます。

## 式エイリアス {#expression-aliases}

エイリアスは、クエリ内の[式](#expressions)のユーザー定義名です。

```sql
expr AS alias
```

上記の構文の各部分は以下のように説明されます。

| 構文の部分 | 説明                                                                                                                                             | 例                                                                     | ノート                                                                                                                                                |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `AS`       | エイリアスを定義するためのキーワード。  `SELECT` 句内で、テーブル名やカラム名にエイリアスを定義する際は `AS` キーワードを使用せずに定義可能です。                    | `SELECT table_name_alias.column_name FROM table_name table_name_alias`. | [CAST](/sql-reference/functions/type-conversion-functions#cast) 関数では、 `AS` キーワードは別の意味を持ちます。関数の説明を参照してください。    |
| `expr`     | ClickHouseでサポートされている任意の式。                                                                                                         | `SELECT column_name * 2 AS double FROM some_table`                     |                                                                                                                                                      |
| `alias`    | `expr` の名前です。エイリアスは [識別子](#identifiers) の構文に従う必要があります。                                                                                    | `SELECT "table t".column_name FROM table_name AS "table t"`.          |                                                                                                                                                      |

### 使用に関するノート {#notes-on-usage}

- エイリアスは、クエリまたはサブクエリ全体に対してグローバルであり、構文の任意の部分で任意の式にエイリアスを定義できます。  
  例：

```sql
SELECT (1 AS n) + 2, n`.
```

- エイリアスはサブクエリやサブクエリ間では見えません。  
  たとえば、次のクエリを実行すると、ClickHouseは `Unknown identifier: num` という例外を生成します：

```sql
`SELECT (SELECT sum(b.a) + num FROM b) - a.a AS num FROM a`
```

- サブクエリの `SELECT` 句で結果カラムのエイリアスが定義されている場合、これらのカラムは外部クエリで見えます。  
  例：

```sql
SELECT n + m FROM (SELECT 1 AS n, 2 AS m)`.
```

- カラムやテーブル名と同じ名前のエイリアスには注意が必要です。次の例を考えてみましょう：

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

前述の例では、カラム `b` を持つテーブル `t` を宣言しました。  
次に、データを選択する際に、`sum(b) AS b` というエイリアスを定義しました。  
エイリアスがグローバルであるため、ClickHouseは式 `argMax(a, b)` 内のリテラル `b` を式 `sum(b)` で置き換えました。  
この置換が例外を引き起こしました。

:::note
このデフォルトの動作は、[prefer_column_name_to_alias](/operations/settings/settings#prefer_column_name_to_alias) を `1` に設定することで変更できます。
:::

## アスタリスク {#asterisk}

`SELECT` クエリ内では、アスタリスクが式の代わりになることがあります。  
詳細については、[SELECT](/sql-reference/statements/select/index.md#asterisk) セクションを参照してください。
