---
'description': 'Syntaxに関するドキュメント'
'displayed_sidebar': 'sqlreference'
'sidebar_label': '構文'
'sidebar_position': 2
'slug': '/sql-reference/syntax'
'title': '構文'
'doc_type': 'reference'
---

このセクションでは、ClickHouseのSQL構文について見ていきます。  
ClickHouseはSQLに基づいた構文を使用していますが、多くの拡張機能と最適化を提供しています。

## クエリ解析 {#query-parsing}

ClickHouseには2つのタイプのパーサーがあります：
- _フルSQLパーサー_（再帰的下りパーサー）。
- _データフォーマットパーサー_（高速ストリームパーサー）。

フルSQLパーサーは、`INSERT`クエリ以外のすべての場合に使用され、`INSERT`クエリでは両方のパーサーが使用されます。

以下のクエリを見てみましょう：

```sql
INSERT INTO t VALUES (1, 'Hello, world'), (2, 'abc'), (3, 'def')
```

すでに述べたように、`INSERT`クエリは両方のパーサーを利用します。  
`INSERT INTO t VALUES`の部分はフルパーサーによって解析され、  
データ`(1, 'Hello, world'), (2, 'abc'), (3, 'def')`はデータフォーマットパーサー、または高速ストリームパーサーによって解析されます。

<details>
<summary>フルパーサーの有効化</summary>

データに対してフルパーサーを有効にするには、[`input_format_values_interpret_expressions`](../operations/settings/settings-formats.md#input_format_values_interpret_expressions)設定を使用します。

前述の設定が`1`に設定されている場合、  
ClickHouseは最初に値を高速ストリームパーサーで解析しようとします。  
もし失敗した場合、ClickHouseはデータに対してフルパーサーを使用し、SQLの[式](#expressions)のように扱います。
</details>

データは任意のフォーマットを持つことができます。  
クエリを受け取ると、サーバーはリクエストのメモリ内の[http://max_query_size](../operations/settings/settings.md#max_query_size)バイトを計算し（デフォルトは1 MB）、残りはストリームパースされます。  
これは、ClickHouseにデータを挿入する推奨方法である大きな`INSERT`クエリの問題を回避するためのものです。

`INSERT`クエリで[`Values`](../interfaces/formats.md/#data-format-values)フォーマットを使用する場合、  
データが`SELECT`クエリの式と同じように解析されるように見えるかもしれませんが、これは事実ではありません。  
`Values`フォーマットははるかに制限されています。

このセクションの残りはフルパーサーについて扱います。

:::note
フォーマットパーサーに関する詳細情報は、[フォーマット](../interfaces/formats.md)セクションを参照してください。
:::

## スペース {#spaces}

- 構文構成要素間には任意の数のスペース記号を置くことができます（クエリの始めと終わりを含む）。  
- スペース記号にはスペース、タブ、改行、CR、フォームフィードが含まれます。

## コメント {#comments}

ClickHouseはSQLスタイルおよびCスタイルのコメントの両方をサポートしています：

- SQLスタイルのコメントは`--`、`#!`または`# `で始まり、行の最後まで続きます。`--`と`#!`の後のスペースは省略可能です。
- Cスタイルのコメントは`/*`から`*/`までの間にあり、複数行にわたることができます。スペースは必要ありません。

## キーワード {#keywords}

ClickHouseのキーワードは、コンテキストによって_ケースセンシティブ_または_ケースインセンシティブ_のいずれかです。

キーワードは次の場合に**ケースインセンシティブ**です：

- SQL標準の場合。たとえば、`SELECT`、`select`、および`SeLeCt`はすべて有効です。
- 一部の一般的なDBMS（MySQLまたはPostgres）での実装。たとえば、`DateTime`は`datetime`と同じです。

:::note
データ型名がケースセンシティブであるかどうかは、[system.data_type_families](/operations/system-tables/data_type_families)テーブルで確認できます。
:::

標準SQLとは対照的に、他のすべてのキーワード（関数名を含む）は**ケースセンシティブ**です。

さらに、キーワードは予約語ではありません。  
それらは対応するコンテキスト内でのみそのように扱われます。  
キーワードと同じ名前の[識別子](#identifiers)を使用する場合は、二重引用符またはバッククォートで囲んでください。

たとえば、次のクエリは、`table_name`というテーブルに`"FROM"`という名前のカラムがある場合に有効です：

```sql
SELECT "FROM" FROM table_name
```

## 識別子 {#identifiers}

識別子は次のものを指します：

- クラスター、データベース、テーブル、パーティション、およびカラム名。
- [関数](#functions)。
- [データ型](../sql-reference/data-types/index.md)。
- [式エイリアス](#expression-aliases)。

識別子は引用符を使うことも、使用しないこともできますが、後者が好まれます。

引用符を使わない識別子は、正規表現`^[a-zA-Z_][0-9a-zA-Z_]*$`に一致し、[キーワード](#keywords)と同じであってはいけません。  
以下の表には、有効な識別子と無効な識別子の例が示されています：

| 有効な識別子                                  | 無効な識別子                          |
|------------------------------------------------|----------------------------------------|
| `xyz`、`_internal`、`Id_with_underscores_123_` | `1x`、`tom@gmail.com`、`äußerst_schön` |

キーワードと同じ識別子や、他の記号を識別子に使用したい場合は、二重引用符またはバッククォートで囲んでください。たとえば、`"id"`、`` `id` ``。

:::note
引用符を使用した識別子のエスケープに適用されるのと同じルールが文字列リテラルにも適用されます。詳細は[文字列](#string)を参照してください。
:::

## リテラル {#literals}

ClickHouseにおいて、リテラルはクエリ内で直接表現される値です。  
言い換えれば、クエリの実行中に変わらない固定値です。

リテラルには次の種類があります：
- [文字列](#string)
- [数値](#numeric)
- [複合](#compound)
- [`NULL`](#null)
- [ヒアドキュメント](#heredoc)（カスタム文字列リテラル）

これらの詳細については、以下のセクションで見ていきます。

### 文字列 {#string}

文字列リテラルはシングルクオートで囲む必要があります。ダブルクオートはサポートされていません。

エスケープは次のように動作します：
- シングルクオート文字`'`（この文字だけ）をエスケープするために前置きのシングルクオートを使用するか、または
- 次の表に記載されているサポートされたエスケープシーケンスを使用するための前置きのバックスラッシュを使用します。

:::note
バックスラッシュは、その後に続く文字が以下に記載されている文字以外の場合は特別な意味を失います。即ち、文字通りに解釈されます。
:::

| サポートされたエスケープ                | 説明                                                                      |
|-----------------------------------------|---------------------------------------------------------------------------|
| `\xHH`                                  | 任意の数の16進数の数字（H）に続く8ビット文字指定。                                      |
| `\N`                                    | 予約されており、何もしない（例：`SELECT 'a\Nb'`は`ab`を返します）                      |
| `\a`                                    | アラート                                                                  |
| `\b`                                    | バックスペース                                                            |
| `\e`                                    | エスケープ文字                                                           |
| `\f`                                    | フォームフィード                                                          |
| `\n`                                    | 改行                                                                    |
| `\r`                                    | キャリッジリターン                                                       |
| `\t`                                    | 水平タブ                                                               |
| `\v`                                    | 垂直タブ                                                               |
| `\0`                                    | NULL文字                                                               |
| `\\`                                    | バックスラッシュ                                                           |
| `\'`（または` '' `）                     | シングルクオート                                                        |
| `\"`                                    | ダブルクオート                                                          |
| `` ` ``                                 | バッククォート                                                          |
| `\/`                                    | フォワードスラッシュ                                                     |
| `\=`                                    | 等号                                                                    |
| ASCIIコントロール文字（c &lt;= 31）      |                                                                           |

:::note
文字列リテラル内では、少なくとも`'`と`\`をエスケープする必要があります。エスケープコードは`\'`（または：`''`）と`\\`です。
:::

### 数値 {#numeric}

数値リテラルは次のように解析されます：

- まず64ビット符号付き数値として、[strtoull](https://en.cppreference.com/w/cpp/string/byte/strtoul)関数を使用して解析されます。
- 失敗した場合は、64ビット符号なし数値として、[strtoll](https://en.cppreference.com/w/cpp/string/byte/strtol)関数を使用して解析されます。
- それでも失敗した場合は、浮動小数点数として、[strtod](https://en.cppreference.com/w/cpp/string/byte/strtof)関数を使用して解析されます。
- それ以外の場合は、エラーが返されます。

リテラル値は、その値が収まる最小の型にキャストされます。  
たとえば：
- `1`は`UInt8`として解析されます。
- `256`は`UInt16`として解析されます。

詳細については[データ型](../sql-reference/data-types/index.md)を参照してください。

数値リテラル内のアンダースコア`_`は無視され、可読性を向上させるために使用できます。

サポートされている数値リテラルは次の通りです：

| 数値リテラル                              | 例                                             |
|-------------------------------------------|-------------------------------------------------|
| **整数**                                  | `1`、`10_000_000`、`18446744073709551615`、`01` |
| **小数**                                  | `0.1`                                          |
| **指数表記**                              | `1e100`、`-1e-100`                             |
| **浮動小数点数**                          | `123.456`、`inf`、`nan`                        |
| **16進数**                                | `0xc0fe`                                       |
| **SQL標準互換の16進数文字列**              | `x'c0fe'`                                      |
| **2進数**                                 | `0b1101`                                       |
| **SQL標準互換の2進数文字列**               | `b'1101'`                                      |

:::note
偶数リテラルは、意図しない解釈のエラーを避けるためにサポートされていません。
:::

### 複合 {#compound}

配列は角括弧`[1, 2, 3]`で構成されます。タプルは丸括弧`(1, 'Hello, world!', 2)`で構成されます。  
技術的には、これらはリテラルではなく、それぞれ配列作成演算子とタプル作成演算子を持つ式です。  
配列は少なくとも1つのアイテムを含む必要があり、タプルは少なくとも2つのアイテムを持つ必要があります。

:::note
タプルが`SELECT`クエリの`IN`句に出現する場合、別のケースがあります。  
クエリ結果にはタプルが含まれますが、タプルはデータベースに保存できません（[Memory](../engines/table-engines/special/memory.md)エンジンを使用するテーブルを除く）。
:::

### NULL {#null}

`NULL`は値が欠けていることを示すために使用されます。  
テーブルフィールドに`NULL`を保存するには、その型は[Nullable](../sql-reference/data-types/nullable.md)型でなければなりません。

:::note
`NULL`について次のことに留意してください：

- データフォーマット（入力または出力）によって、`NULL`は異なる表現を持つ場合があります。詳細については[data formats](/interfaces/formats)を参照してください。
- `NULL`処理は微妙です。たとえば、比較演算の引数のうち少なくとも1つが`NULL`である場合、この演算の結果も`NULL`になります。同様のことが乗算、加算、および他の演算にも当てはまります。各演算のドキュメントを読むことをお勧めします。
- クエリ内で、[`IS NULL`](/sql-reference/functions/functions-for-nulls#isNull)及び[`IS NOT NULL`](/sql-reference/functions/functions-for-nulls#isNotNull)演算子と関連する関数`isNull`および`isNotNull`を使用して`NULL`をチェックできます。
:::

### ヒアドキュメント {#heredoc}

[ヒアドキュメント](https://en.wikipedia.org/wiki/Here_document)は、オリジナルのフォーマットを維持しつつ、文字列（通常は複数行）を定義する方法です。  
ヒアドキュメントは、2つの`$`記号の間に配置されたカスタム文字列リテラルとして定義されます。

例えば：

```sql
SELECT $heredoc$SHOW CREATE VIEW my_view$heredoc$;

┌─'SHOW CREATE VIEW my_view'─┐
│ SHOW CREATE VIEW my_view   │
└────────────────────────────┘
```

:::note
- 2つのヒアドキュメント間の値は"そのまま"処理されます。
:::

:::tip
- ヒアドキュメントを使用して、SQL、HTML、またはXMLコードのスニペットを埋め込むことができます。
:::

## クエリパラメータの定義と使用 {#defining-and-using-query-parameters}

クエリパラメータを使用することにより、具体的な識別子の代わりに抽象的なプレースホルダーを含む一般的なクエリを書くことができます。  
クエリパラメータを含むクエリが実行されると、すべてのプレースホルダーが解決され、実際のクエリパラメータの値に置き換えられます。

クエリパラメータを定義する方法は2つあります：

- `SET param_<name>=<value>`
- `--param_<name>='<value>'`

第2の変種を使用する場合、それはコマンドラインで`clickhouse-client`に渡されます。  
ここで：
- `<name>`はクエリパラメータの名前です。
- `<value>`はその値です。

クエリパラメータは、`{<name>: <datatype>}`を使用してクエリ内で参照でき、`<name>`はクエリパラメータの名前で、`<datatype>`はそれが変換されるデータ型です。

<details>
<summary>SETコマンドの例</summary>

たとえば、以下のSQLは、異なるデータ型を持つ`a`、`b`、`c`、および`d`という名前のパラメータを定義します：

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

`clickhouse-client`を使用している場合、パラメータは`--param_name=value`として指定されます。たとえば、次のパラメータは`message`という名前で、`String`として取得されます：

```bash
clickhouse-client --param_message='hello' --query="SELECT {message: String}"

hello
```

クエリパラメータがデータベース、テーブル、関数または他の識別子の名前を表す場合、その型として`Identifier`を使用します。  
たとえば、次のクエリは、`uk_price_paid`という名前のテーブルから行を返します：

```sql
SET param_mytablename = "uk_price_paid";
SELECT * FROM {mytablename:Identifier};
```
</details>

:::note
クエリパラメータは、任意のSQLクエリの任意の場所で使用できる一般的なテキスト置換ではありません。  
主に識別子またはリテラルの代替として`SELECT`文で機能するように設計されています。
:::

## 関数 {#functions}

関数呼び出しは、引数（空である可能性もある）を持つ識別子のように書かれます。  
標準SQLとは異なり、引数リストが空の場合でも括弧は必須です。  
例えば：

```sql
now()
```

また、以下があります：
- [通常の関数](/sql-reference/functions/overview)。
- [集約関数](/sql-reference/aggregate-functions)。

一部の集約関数は、括弧内に2つの引数リストを含むことができます。たとえば：

```sql
quantile (0.9)(x) 
```

これらの集約関数は「パラメトリック」関数と呼ばれ、最初のリストの引数は「パラメータ」と呼ばれます。

:::note
パラメータなしの集約関数の構文は、通常の関数と同じです。
:::

## 演算子 {#operators}

演算子は、クエリ解析中に対応する関数に変換され、その優先順位と結合性を考慮されます。

たとえば、式

```text
1 + 2 * 3 + 4
```

は次のように変換されます：

```text
plus(plus(1, multiply(2, 3)), 4)`
```

## データ型とデータベーステーブルエンジン {#data-types-and-database-table-engines}

`CREATE`クエリ内のデータ型とテーブルエンジンは、識別子または関数のように書かれます。  
言い換えれば、それらは括弧内の引数リストを含む場合と含まない場合があります。

詳細については以下のセクションを参照してください：
- [データ型](/sql-reference/data-types/index.md)
- [テーブルエンジン](/engines/table-engines/index.md)
- [CREATE](/sql-reference/statements/create/index.md)。

## 式 {#expressions}

式は次のいずれかであることができます：
- 関数
- 識別子
- リテラル
- 演算子の適用
- 括弧内の式
- サブクエリ
- アスタリスク

それは[エイリアス](#expression-aliases)を含むこともできます。

式のリストは、カンマで区切られた1つ以上の式です。  
関数や演算子も、引数として式を持つことができます。

定数式は、クエリ分析の際に結果が既知の式、すなわち実行前の式です。  
たとえば、リテラル上の式は定数式です。

## 式エイリアス {#expression-aliases}

エイリアスは、クエリ内の[式](#expressions)のユーザー定義名です。

```sql
expr AS alias
```

上記の構文の部分については以下で説明します。

| 構文の部分  | 説明                                                                                                                                  | 例                                                                  | メモ                                                                                                                                         |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `AS`        | エイリアスを定義するためのキーワード。`SELECT`句内でテーブル名またはカラム名のエイリアスを定義する際に`AS`キーワードを使用しなくてもよい。 | `SELECT table_name_alias.column_name FROM table_name table_name_alias.` | [CAST](/sql-reference/functions/type-conversion-functions#cast)関数内で、`AS`キーワードは別の意味を持つ。関数の説明を参照。         |
| `expr`      | ClickHouseがサポートする任意の式。                                                                                                    | `SELECT column_name * 2 AS double FROM some_table`                  |                                                                                                                                             |
| `alias`     | `expr`のための名前。エイリアスは[識別子](#identifiers)の構文に従う必要がある。                                                                | `SELECT "table t".column_name FROM table_name AS "table t"`         |                                                                                                                                             |

### 使用に関するノート {#notes-on-usage}

- エイリアスはクエリまたはサブクエリに対してグローバルであり、クエリの任意の部分で任意の式のエイリアスを定義できます。たとえば：

```sql
SELECT (1 AS n) + 2, n`.
```

- エイリアスはサブクエリ内およびサブクエリ間では表示されません。たとえば、次のクエリを実行すると、ClickHouseは`Unknown identifier: num`という例外を生成します：

```sql
`SELECT (SELECT sum(b.a) + num FROM b) - a.a AS num FROM a`
```

- サブクエリの`SELECT`句で結果のカラムにエイリアスが定義されている場合、これらのカラムは外側のクエリで表示されます。たとえば：

```sql
SELECT n + m FROM (SELECT 1 AS n, 2 AS m)`.
```

- カラム名やテーブル名と同じエイリアスに注意してください。次の例を考えてみましょう：

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

前の例では、カラム`b`を持つテーブル`t`を宣言しました。  
その後、データを選択する際に、`sum(b) AS b`というエイリアスを定義しました。  
エイリアスはグローバルであるため、ClickHouseは式`argMax(a, b)`内のリテラル`b`を式`sum(b)`に置き換えました。  
この置き換えが例外を引き起こしました。

:::note
このデフォルトの動作は、[prefer_column_name_to_alias](/operations/settings/settings#prefer_column_name_to_alias)を`1`に設定することによって変更できます。
:::

## アスタリスク {#asterisk}

`SELECT`クエリ内では、アスタリスクが式の代わりに使用できます。  
詳細については、[SELECT](/sql-reference/statements/select/index.md#asterisk)セクションを参照してください。
