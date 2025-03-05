---
slug: /sql-reference/syntax
sidebar_position: 2
sidebar_label: 構文
title: 構文
displayed_sidebar: sqlreference
---

このセクションでは、ClickHouseのSQL構文について見ていきます。  
ClickHouseは、SQLに基づいた構文を使用しますが、多くの拡張や最適化を提供します。

## クエリのパース {#query-parsing}

ClickHouseには2種類のパーサーがあります:
- _フルSQLパーサー_（再帰下降パーサー）。
- _データフォーマットパーサー_（高速ストリームパーサー）。

フルSQLパーサーは、`INSERT`クエリ以外のすべての場合に使用されます。`INSERT`クエリは両方のパーサーを使用します。

以下のクエリを見てみましょう：

``` sql
INSERT INTO t VALUES (1, 'Hello, world'), (2, 'abc'), (3, 'def')
```

すでに述べたように、`INSERT`クエリは両方のパーサーを利用します。  
`INSERT INTO t VALUES`のフラグメントはフルパーサーによって解析され、  
データ`(1, 'Hello, world'), (2, 'abc'), (3, 'def')`はデータフォーマットパーサー、つまり高速ストリームパーサーによって解析されます。

<details>
<summary>フルパーサーを有効にする</summary>

データに対してフルパーサーを有効にするには、[`input_format_values_interpret_expressions`](../operations/settings/settings-formats.md#input_format_values_interpret_expressions)設定を使用できます。

前述の設定が`1`に設定されている場合、  
ClickHouseはまず高速ストリームパーサーを使用して値を解析しようとします。  
失敗した場合、ClickHouseはデータに対してフルパーサーを使用し、SQLの[式](#expressions)として扱います。
</details>

データは任意のフォーマットを持つことができます。  
クエリを受信すると、サーバーは要求の最大[max_query_size](../operations/settings/settings.md#max_query_size)バイトをRAM内で計算します  
（デフォルトでは1MB）し、それ以外はストリーム解析されます。  
これは、大きな`INSERT`クエリに関する問題を回避するためであり、これはClickHouseにデータを挿入する推奨される方法です。

`INSERT`クエリで[`Values`](../interfaces/formats.md/#data-format-values)フォーマットを使用する場合、  
データが`SELECT`クエリの式と同様に解析されるように見えるかもしれませんが、実際にはそうではありません。  
`Values`フォーマットははるかに制限されています。

このセクションの残りはフルパーサーについて説明します。

:::note
フォーマットパーサーに関する詳細は、[フォーマット](../interfaces/formats.md)セクションを参照してください。
:::

## 空白 {#spaces}

- 構文構成要素の間には任意の数の空白記号を入れることができます（クエリの始まりと終わりを含む）。  
- 空白記号には、スペース、タブ、改行、CR、およびフォームフィードが含まれます。

## コメント {#comments}

ClickHouseは、SQLスタイルとCスタイルの両方のコメントをサポートしています：

- SQLスタイルのコメントは`--`、`#!`または`# `で始まり、行の終わりまで続きます。`--`および`#!`の後のスペースは省略できます。
- Cスタイルのコメントは`/*`から`*/`までの範囲を持ち、複数行が可能です。スペースは必須ではありません。

## キーワード {#keywords}

ClickHouseのキーワードは、文脈に応じて _大文字と小文字を区別する_ または _区別しない_ ことがあります。

キーワードは次の場合に**大文字と小文字を区別しません**：

- SQL標準。例えば、`SELECT`、`select`、および`SeLeCt`はすべて有効です。
- 一部の人気のDBMS（MySQLやPostgres）の実装。例えば、`DateTime`は`datetime`と同じです。

:::note
データ型名が大文字と小文字を区別するかどうかは、[system.data_type_families](../operations/system-tables/data_type_families.md#system_tables-data_type_families)テーブルで確認できます。
:::

標準SQLとは対照的に、他のすべてのキーワード（関数名を含む）は**大文字と小文字を区別します**。

さらに、キーワードは予約されていません。  
それらは、対応する文脈でのみそのように扱われます。  
キーワードと同じ名前の[識別子](#identifiers)を使用する場合、ダブルクオートまたはバッククオートで囲んでください。  

例えば、以下のクエリは、テーブル`table_name`に名前が`"FROM"`のカラムがある場合、有効です：

```sql
SELECT "FROM" FROM table_name
```

## 識別子 {#identifiers}

識別子は以下です：

- クラスター、データベース、テーブル、パーティション、およびカラム名。
- [関数](#functions)。
- [データ型](../sql-reference/data-types/index.md)。
- [式のエイリアス](#expression-aliases)。

識別子は引用符付きまたは非引用符付きのどちらでも構いませんが、後者が推奨されます。

非引用符付きの識別子は、正規表現`^[a-zA-Z_][0-9a-zA-Z_]*$`に一致する必要があり、[キーワード](#keywords)と等しくなってはいけません。  
以下の表には有効な識別子と無効な識別子の例を示します：

| 有効な識別子                                  | 無効な識別子                           |
|------------------------------------------------|----------------------------------------|
| `xyz`, `_internal`, `Id_with_underscores_123_` | `1x`, `tom@gmail.com`, `äußerst_schön` |

キーワードと同じ識別子や他の記号を使用したい場合は、ダブルクオートまたはバッククオートを使用して引用してください。例えば、`"id"`、`` `id` ``のように。

:::note
引用された識別子内のエスケープに適用されるのと同じルールが、文字列リテラルにも適用されます。詳細は[文字列](#string)を参照してください。
:::

## リテラル {#literals}

ClickHouseにおけるリテラルとは、クエリ内で直接表現される値のことです。  
言い換えれば、クエリの実行中に変更されない固定値です。

リテラルは以下のものになり得ます：
- [文字列](#string)
- [数値](#numeric)
- [複合型](#compound)
- [`NULL`](#null)
- [Heredocs](#heredoc)（カスタム文字列リテラル）

それぞれの詳細については、以下のセクションで見ていきます。

### 文字列 {#string}

文字列リテラルはシングルクオートで囲む必要があります。ダブルクオートはサポートされていません。

エスケープは次のいずれかによって行います：

- シングルクオートの前にシングルクオートを置くことで、シングルクオート文字`'`（この文字だけ）を`''`としてエスケープできる、または
- 前にバックスラッシュを使用し、以下のテーブルに示したサポートされているエスケープシーケンスを使用します。

:::note
バックスラッシュは特別な意味を失い、以下のリストにない文字の前にある場合は文字通り解釈されます。
:::

| サポートされているエスケープ                 | 説明                                                             |
|-------------------------------------|---------------------------------------------------------------------|
| `\xHH`                              | 任意の数の16進数（H）に続く8ビット文字の指定。                       | 
| `\N`                                | 予約語で、何も行わない（例: `SELECT 'a\Nb'`は`ab`を返します）          |
| `\a`                                | アラート                                                         |
| `\b`                                | バックスペース                                                     |
| `\e`                                | エスケープ文字                                                   |
| `\f`                                | フォームフィード                                                  |
| `\n`                                | 改行                                                           |
| `\r`                                | キャリッジリターン                                               |
| `\t`                                | 水平タブ                                                       |
| `\v`                                | 垂直タブ                                                         |
| `\0`                                | ヌル文字                                                       |
| `\\`                               | バックスラッシュ                                                  |
| `\'`（または` '' `）                  | シングルクオート                                                 |
| `\"`                                | ダブルクオート                                                  |
| `` ` ``                             | バックティック                                                   |
| `\/`                                | スラッシュ                                                      |
| `\=`                                | 等号                                                          |
| ASCII制御文字（c &lt;= 31）。   |                                                                     |

:::note
文字列リテラル内では、少なくとも`'`と`\`をエスケープコード`\'`（または:`''`）、および`\\`を使用してエスケープする必要があります。
:::

### 数値 {#numeric}

数値リテラルは次のように解析されます：

- 最初に、64ビットの符号付き整数として[ストトゥール](https://en.cppreference.com/w/cpp/string/byte/strtoul)関数を使用して解析されます。
- 失敗した場合、64ビットの符号なし整数として[ストトゥール](https://en.cppreference.com/w/cpp/string/byte/strtol)関数を使用して解析されます。
- さらに失敗した場合、浮動小数点数として[ストトゥ](https://en.cppreference.com/w/cpp/string/byte/strtof)関数を使用して解析されます。
- それ以外の場合、エラーが返されます。

リテラル値は、その値が収まる最小の型にキャストされます。  
例えば：
- `1`は`UInt8`として解析される。
- `256`は`UInt16`として解析される。

詳細については、[データ型](../sql-reference/data-types/index.md)を参照してください。

数値リテラル内のアンダースコア`_`は無視され、より読みやすくするために使用できます。

サポートされている数値リテラルは以下の通りです：

| 数値リテラル                           | 例                                         |
|-------------------------------------------|---------------------------------------------|
| **整数**                              | `1`, `10_000_000`, `18446744073709551615`, `01` |
| **10進数**                          | `0.1`                                       |
| **指数表記**                       | `1e100`, `-1e-100`                          |
| **浮動小数点数**                 | `123.456`, `inf`, `nan`                     |
| **16進数**                         | `0xc0fe`                                    |
| **SQL標準互換の16進数文字列**   | `x'c0fe'`                                   |
| **2進数**                           | `0b1101`                                    |
| **SQL標準互換の2進数文字列**   | `b'1101'`                                   |

:::note
偶数リテラルは、解釈の誤りを避けるためにサポートされていません。
:::

### 複合型 {#compound}

配列は角括弧`[1, 2, 3]`で構成されます。タプルは丸括弧`(1, 'Hello, world!', 2)`で構成されます。  
厳密には、これらはリテラルではなく、配列作成演算子とタプル作成演算子を用いた式です。  
配列は少なくとも1つのアイテムで構成され、タプルは少なくとも2つのアイテムを持たなければなりません。

:::note
`SELECT`クエリの`IN`句にタプルが出現する場合は、別のケースがあります。  
クエリ結果にはタプルが含まれることがありますが、タプルはデータベースに保存することはできません（[Memory](../engines/table-engines/special/memory.md)エンジンを使用するテーブルを除く）。
:::

### NULL {#null}

`NULL`は値が欠落していることを示すために使用されます。  
テーブルフィールドに`NULL`を格納するには、そのフィールドが[Nullable](../sql-reference/data-types/nullable.md)型でなければなりません。

:::note
`NULL`に関して以下の点に注意してください：

- データフォーマット（入力または出力）に応じて、`NULL`は異なる表現を持つ場合があります。詳細については、[データフォーマット](../interfaces/formats.md#formats)を参照してください。
- `NULL`処理は微妙です。例えば、比較演算の引数のうち1つ以上が`NULL`である場合、その演算の結果も`NULL`になります。同様に、乗算、加算、他の演算についても当てはまります。それぞれの演算についてのドキュメントを読むことをお勧めします。
- クエリ内で`NULL`を確認するには、[`IS NULL`](../sql-reference/operators/index.md#is-null)および[`IS NOT NULL`](../sql-reference/operators/index.md#is-not-null)演算子や、関連関数`isNull`、`isNotNull`を使用できます。
:::

### Heredoc {#heredoc}

[Heredoc](https://en.wikipedia.org/wiki/Here_document)は、元の形式を維持しながら文字列（しばしばマルチライン）を定義する方法です。  
Heredocは、2つの`$`シンボルの間に置かれたカスタム文字列リテラルとして定義されます。

例えば：

```sql
SELECT $heredoc$SHOW CREATE VIEW my_view$heredoc$;

┌─'SHOW CREATE VIEW my_view'─┐
│ SHOW CREATE VIEW my_view   │
└────────────────────────────┘
```

:::note
- 2つのheredocの間の値は「そのまま」の形で処理されます。
:::

:::tip
- Heredocを使用して、SQL、HTML、XMLコードなどのスニペットを埋め込むことができます。
:::

## クエリパラメータの定義と使用 {#defining-and-using-query-parameters}

クエリパラメータを使用すると、具体的な識別子の代わりに抽象的なプレースホルダーを含む汎用クエリを書くことができます。  
クエリパラメータを使用したクエリが実行されると、すべてのプレースホルダーは解決され、実際のクエリパラメータの値に置き換えられます。

クエリパラメータを定義する方法は2つあります：

- `SET param_<name>=<value>`
- `--param_<name>='<value>'`

2番目のバリアントを使用する場合は、コマンドラインで`clickhouse-client`に引数として渡されます。  
- `<name>`はクエリパラメータの名前です。
- `<value>`はその値です。

クエリパラメータは、`{<name>: <datatype>}`を使用することでクエリ内で参照できます。ここで、`<name>`はクエリパラメータの名前で、`<datatype>`は変換されるデータ型です。

<details>
<summary>SETコマンドの例</summary>

例えば、次のSQLは、異なるデータ型を持つ`a`、`b`、`c`、および`d`という名前のパラメータを定義します：

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
<summary>clickhouse-clientの例</summary>

`clickhouse-client`を使用している場合、パラメータは`--param_name=value`として指定されます。例えば、次のパラメータは`message`という名前を持ち、`String`として取得されます：

```bash
clickhouse-client --param_message='hello' --query="SELECT {message: String}"

hello
```

クエリパラメータがデータベース、テーブル、関数、または他の識別子の名前を表す場合、その型として`Identifier`を使用します。例えば、以下のクエリは、`uk_price_paid`という名前のテーブルから行を取得します：

```sql
SET param_mytablename = "uk_price_paid";
SELECT * FROM {mytablename:Identifier};
```
</details>

:::note
クエリパラメータは、任意のSQLクエリの任意の場所で使用できる一般的なテキスト置換ではありません。  
主に、識別子やリテラルの代わりに`SELECT`ステートメントで機能するように設計されています。
:::

## 関数 {#functions}

関数呼び出しは、識別子のように書き、丸括弧内に引数リスト（場合によっては空）を持ちます。  
標準SQLと対照的に、引数リストが空の場合でも括弧は必須です。  
例えば： 

```sql
now()
```

他にも：
- [標準関数](/sql-reference/functions/overview)。
- [集約関数](/sql-reference/aggregate-functions)。

一部の集約関数は、括弧内に2つの引数リストを持つことができます。例えば： 

```sql
quantile (0.9)(x) 
```

これらの集約関数は「パラメトリック」関数と呼ばれ、最初のリストの引数は「パラメーター」と呼ばれます。

:::note
パラメーターなしの集約関数の構文は、通常の関数と同じです。
:::

## 演算子 {#operators}

演算子は、クエリパース中にその優先順位や結合性を考慮して対応する関数に変換されます。

例えば、以下の式 

```text
1 + 2 * 3 + 4
```

は次のように変換されます 

```
plus(plus(1, multiply(2, 3)), 4)`
```

## データ型とデータベーステーブルエンジン {#data-types-and-database-table-engines}

`CREATE`クエリ内のデータ型とテーブルエンジンは、識別子や関数と同じ方法で書かれます。  
言い換えれば、引数リストを括弧の中に含む場合もあれば、含まない場合もあります。

詳細については、以下のセクションを参照してください：
- [データ型](/sql-reference/data-types/index.md)
- [テーブルエンジン](/engines/table-engines/index.md)
- [CREATE](/sql-reference/statements/create/index.md)。

## 式 {#expressions}

式は次のいずれかである可能性があります：  
- 関数
- 識別子
- リテラル
- 演算子の適用
- 括弧内の式
- サブクエリ
- またはアスタリスク。

式には、[エイリアス](#expression-aliases)も含まれる場合があります。

式のリストは、カンマで区切られた1つ以上の式です。関数や演算子は、引数として式を持つことができます。

## 式のエイリアス {#expression-aliases}

エイリアスは、クエリ内の[式](#expressions)に対するユーザー定義の名前です。

``` sql
expr AS alias
```

上記の構文の部分は以下のように説明されます。

| 構文の部分 | 説明                                                                                                                                      | 例                                                                   | 注記                                                                                                                                      |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `AS`           | エイリアスを定義するためのキーワードです。エイリアスは、`SELECT`句内のテーブル名またはカラム名に対して、`AS`キーワードを使用せずに定義できます。| `SELECT table_name_alias.column_name FROM table_name table_name_alias`. | [CAST](./functions/type-conversion-functions.md#castx-t)関数において、`AS`キーワードは別の意味を持ちます。関数の説明を参照してください。 |
| `expr`         | ClickHouseがサポートする任意の式です。                                                                                                          | `SELECT column_name * 2 AS double FROM some_table`                  |                                                                                                                                          |
| `alias`        | `expr`の名前です。エイリアスは[識別子](#identifiers)の構文に従う必要があります。                                                                           | `SELECT "table t".column_name FROM table_name AS "table t"`.        |                                                                                                                                          |

### 使用に関する注記 {#notes-on-usage}

- エイリアスはクエリまたはサブクエリ全体に対してグローバルであり、クエリの任意の部分で任意の式に対してエイリアスを定義できます。例えば：

```sql
SELECT (1 AS n) + 2, n`.
```

- エイリアスはサブクエリおよびサブクエリ間では表示されません。例えば、以下のクエリを実行すると、ClickHouseは例外`Unknown identifier: num`を生成します：

```sql
`SELECT (SELECT sum(b.a) + num FROM b) - a.a AS num FROM a`
```

- サブクエリの`SELECT`句で結果列のためにエイリアスが定義されている場合、これらの列は外部クエリで可視化されます。例えば：

```sql
SELECT n + m FROM (SELECT 1 AS n, 2 AS m)`.
```

- カラム名やテーブル名と同じエイリアスに注意してください。次の例を考えてみましょう：

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

前の例では、テーブル`t`をカラム`b`で宣言しました。  
その後、データを選択する際に、`sum(b) AS b`エイリアスを定義しました。  
エイリアスはグローバルであるため、ClickHouseは式`argMax(a, b)`内のリテラル`b`を式`sum(b)`に置き換えました。  
この置換により例外が発生しました。

:::note
このデフォルトの動作は、[prefer_column_name_to_alias](/operations/settings/settings#prefer_column_name_to_alias)を`1`に設定することで変更できます。
:::

## アスタリスク {#asterisk}

`SELECT`クエリでは、アスタリスクが式に置き換えられることがあります。  
詳細については、[SELECT](/sql-reference/statements/select/index.md#asterisk)セクションを参照してください。
