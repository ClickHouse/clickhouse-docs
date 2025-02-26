---
slug: /sql-reference/data-types/enum
sidebar_position: 20
sidebar_label: Enum
---

# Enum

名前付き値の列挙型です。

名前付き値は、`'string' = integer` のペアまたは `'string'` の名前として宣言できます。ClickHouseは数値のみを保存しますが、名前を通じて値に対する操作をサポートしています。

ClickHouseは以下をサポートします：

- 8ビットの `Enum`。 これは `[-128, 127]` の範囲で最大256の値を持つことができます。
- 16ビットの `Enum`。 これは `[-32768, 32767]` の範囲で最大65536の値を持つことができます。

ClickHouseはデータが挿入されるときに自動的に `Enum` のタイプを選択します。また、ストレージのサイズを確実にするために `Enum8` または `Enum16` 型を使用することもできます。

## 使用例 {#usage-examples}

ここでは、`Enum8('hello' = 1, 'world' = 2)` 型のカラムを持つテーブルを作成します：

``` sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

同様に、数字を省略することもできます。ClickHouseは連続した数字を自動的に割り当てます。デフォルトでは、1から数字が割り当てられます。

``` sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

最初の名前のために合法的な開始番号を指定することもできます。

``` sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world')
)
ENGINE = TinyLog
```

``` sql
CREATE TABLE t_enum
(
    x Enum8('hello' = -129, 'world')
)
ENGINE = TinyLog
```

``` text
サーバーでの例外:
コード: 69. DB::Exception: 要素 'hello' の値 -129 は Enum8 の範囲を超えています。
```

カラム `x` は、型定義に記載されている値 `'hello'` または `'world'` のみを保存できます。他の値を保存しようとすると、ClickHouseは例外を発生させます。この `Enum` の8ビットサイズは自動的に選択されます。

``` sql
INSERT INTO t_enum VALUES ('hello'), ('world'), ('hello')
```

``` text
Ok.
```

``` sql
INSERT INTO t_enum values('a')
```

``` text
クライアントでの例外:
コード: 49. DB::Exception: 種類 Enum('hello' = 1, 'world' = 2) に対して不明な要素 'a' です
```

テーブルからデータをクエリすると、ClickHouseは `Enum` から文字列値を出力します。

``` sql
SELECT * FROM t_enum
```

``` text
┌─x─────┐
│ hello │
│ world │
│ hello │
└───────┘
```

行の数値の同等物を見たい場合は、`Enum` 値を整数型にキャストする必要があります。

``` sql
SELECT CAST(x, 'Int8') FROM t_enum
```

``` text
┌─CAST(x, 'Int8')─┐
│               1 │
│               2 │
│               1 │
└─────────────────┘
```

クエリ内で `Enum` 値を作成する場合も、`CAST` を使用する必要があります。

``` sql
SELECT toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))
```

``` text
┌─toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))─┐
│ Enum8('a' = 1, 'b' = 2)                             │
└─────────────────────────────────────────────────────┘
```

## 一般的なルールと使用法 {#general-rules-and-usage}

各値には、`Enum8` の範囲 `-128 ... 127` または `Enum16` の範囲 `-32768 ... 32767` で番号が割り当てられます。すべての文字列と数字は異なる必要があります。空の文字列は許可されています。この型が指定されている場合（テーブル定義内）、数値は任意の順序で構いません。ただし、順序は問題になりません。

`Enum` 内の文字列または数値は [NULL](../../sql-reference/syntax.md) にはできません。

`Enum` は [Nullable](../../sql-reference/data-types/nullable.md) 型に含めることができます。したがって、クエリを使用してテーブルを作成すると、

``` sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

`'hello'` と `'world'` だけでなく `NULL` も格納できます。

``` sql
INSERT INTO t_enum_nullable Values('hello'),('world'),(NULL)
```

RAM内では、`Enum` カラムは対応する数値の `Int8` または `Int16` と同じように保存されます。

テキスト形式で読み込むと、ClickHouseは値を文字列として解析し、Enum値のセットから対応する文字列を検索します。見つからない場合、例外が発生します。テキスト形式で読み込むと、文字列が読み込まれ、対応する数値がルックアップされます。見つからない場合は例外が発生します。テキスト形式で書き込むと、対応する文字列として値が書き込まれます。カラムデータにゴミ（有効なセットに含まれない数値）が含まれている場合、例外が発生します。バイナリ形式での読み書き時は、Int8 および Int16 データ型と同じように動作します。
暗黙的なデフォルト値は、最小の番号の値です。

`ORDER BY`、`GROUP BY`、`IN`、`DISTINCT` などの間では、Enums は対応する数値と同じように振る舞います。たとえば、ORDER BY は数値的にソートします。等号および比較演算子は、Enums の値に対しても基になる数値と同じように機能します。

Enum値は数値と比較できません。Enumsは定数文字列と比較できます。比較対象の文字列がEnum の有効値でない場合、例外が発生します。IN 演算子は、左側にEnum、右側に文字列のセットを指定することでサポートされています。文字列は対応するEnumの値です。

ほとんどの数値および文字列操作は、Enum値に対して定義されていません。たとえば、Enumに数値を加えたり、Enumに文字列を連結したりすることです。
ただし、Enumにはその文字列値を返す自然な `toString` 関数があります。

Enum値は、`toT` 関数を使用して数値型に変換することもできます。ここで T は数値型です。T が enum の基になる数値型と対応している場合、この変換はゼロコストです。
ALTER を使用して、値のセットだけが変更される場合は、Enum型をコストなしで変更できます。ALTER を使用してEnumのメンバーを追加または削除することが可能です（削除は、削除された値がテーブルで一度も使用されなかった場合のみ安全です）。保護策として、以前に定義されたEnumメンバーの数値値を変更することは例外を発生させます。

ALTER を使用すると、Enum8をEnum16に、またその逆に変更できます。これは、Int8をInt16に変更するのと同様です。
