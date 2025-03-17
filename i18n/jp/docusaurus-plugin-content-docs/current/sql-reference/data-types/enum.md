---
slug: /sql-reference/data-types/enum
sidebar_position: 20
sidebar_label: Enum
---


# Enum

名前付き値からなる列挙型。

名前付き値は、`'string' = integer` ペアまたは `'string'` 名として宣言できます。ClickHouse は数値のみを保存しますが、名前を通じて値との操作をサポートします。

ClickHouse は以下をサポートします：

- 8ビット `Enum`。`[-128, 127]` の範囲で最大256の値を含むことができます。
- 16ビット `Enum`。`[-32768, 32767]` の範囲で最大65536の値を含むことができます。

ClickHouse はデータが挿入される際に自動的に `Enum` の型を選択します。ストレージのサイズを確実にするために、`Enum8` または `Enum16` 型を使用することもできます。

## 使用例 {#usage-examples}

ここでは、`Enum8('hello' = 1, 'world' = 2)` 型のカラムを持つテーブルを作成します：

``` sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

同様に、数値を省略することもできます。ClickHouse は自動的に連続した数値を割り当てます。デフォルトでは、数値は1から始まります。

``` sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

最初の名前のために合法的な開始数を指定することもできます。

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
Exception on server:
Code: 69. DB::Exception: Value -129 for element 'hello' exceeds range of Enum8.
```

カラム `x` は型定義にリストされている値、すなわち `'hello'` または `'world'` のみを保存できます。他の値を保存しようとすると、ClickHouse は例外をスローします。この `Enum` の8ビットサイズは自動的に選択されます。

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
Exception on client:
Code: 49. DB::Exception: Unknown element 'a' for type Enum('hello' = 1, 'world' = 2)
```

テーブルからデータをクエリすると、ClickHouse は `Enum` から文字列値を出力します。

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

行の数値等価を表示する必要がある場合は、`Enum` 値を整数型にキャストする必要があります。

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

クエリで `Enum` 値を作成するには、`CAST` を使用する必要があります。

``` sql
SELECT toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))
```

``` text
┌─toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))─┐
│ Enum8('a' = 1, 'b' = 2)                             │
└─────────────────────────────────────────────────────┘
```

## 一般的なルールと使用法 {#general-rules-and-usage}

各値には `Enum8` の範囲 `-128 ... 127` または `Enum16` の範囲 `-32768 ... 32767` の数値が割り当てられます。すべての文字列と数値は異なる必要があります。空文字列は許可されています。この型が指定されている場合（テーブル定義内）、数値は任意の順序であってもかまいません。ただし、順序は重要ではありません。

`Enum` 内の文字列または数値は [NULL](../../sql-reference/syntax.md) にはできません。

`Enum` は [Nullable](../../sql-reference/data-types/nullable.md) 型に含めることができます。したがって、次のクエリを使用してテーブルを作成すると、

``` sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

`'hello'` と `'world'` だけでなく、`NULL` も保存できます。

``` sql
INSERT INTO t_enum_nullable Values('hello'),('world'),(NULL)
```

RAM内では、`Enum` カラムは対応する数値の `Int8` または `Int16` のように保存されます。

テキスト形式で読み取ると、ClickHouse は値を文字列として解析し、`Enum` 値のセットから対応する文字列を検索します。見つからない場合は、例外がスローされます。テキスト形式で読み取った場合、文字列が読み取られ、対応する数値が参照されます。見つからない場合は例外がスローされます。
テキスト形式で書き込む際には、対応する文字列として値が書き込まれます。カラムデータに無効な数値（有効なセットに含まれない数値）が含まれている場合、例外がスローされます。バイナリ形式で読み書きする際は、Int8 および Int16 データ型に対して動作するのと同様に機能します。
暗黙的なデフォルト値は最低の数値を持つ値です。

`ORDER BY`、`GROUP BY`、`IN`、`DISTINCT` などの操作中、Enums は対応する数値と同じように動作します。例えば、`ORDER BY` は数値的にソートします。等価演算子と比較演算子は、Enums に対しても基礎となる数値値と同様に動作します。

Enum 値は数値と比較できません。Enums は定数文字列と比較できます。比較対象の文字列が有効な Enum の値でない場合、例外がスローされます。`IN` 演算子は、左側に Enum、右側に文字列のセットを持つことがサポートされています。文字列は対応する Enum の値です。

ほとんどの数値および文字列操作は Enum 値に対して定義されていません。例えば、Enum に数値を加算したり、Enum に文字列を連結したりすることです。
ただし、Enum にはその文字列値を返す自然な `toString` 関数があります。

Enum 値は `toT` 関数を使用して数値型に変換可能です。ここで T は数値型です。T が Enum の基となる数値型に対応する場合、この変換にはコストがかかりません。
Enum 型は ALTER を使用してコストなしで変更可能であり、ただし値のセットが変更される場合のみです。ALTER を使用して Enum のメンバーを追加および削除することが可能です（削除は、削除された値がテーブルで一度も使用されていない場合のみ安全です）。保護として、以前に定義された Enum メンバーの数値を変更すると、例外がスローされます。

ALTER を使用すると、Enum8 を Enum16 に、またはその逆に変更することが可能です。これは Int8 を Int16 に変更するのと同様です。
