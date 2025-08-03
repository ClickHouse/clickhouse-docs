---
description: 'Documentation for the Enum data type in ClickHouse, which represents
  a set of named constant values'
sidebar_label: 'Enum'
sidebar_position: 20
slug: '/sql-reference/data-types/enum'
title: 'Enum'
---




# Enum

名前付き値で構成される列挙型です。

名前付き値は、`'string' = integer` のペアまたは `'string'` 名前として宣言できます。ClickHouseは数字のみを格納しますが、値の名前を介して操作をサポートしています。

ClickHouseは以下をサポートしています：

- 8ビット `Enum`。`[-128, 127]` の範囲で最大256の値を列挙できます。
- 16ビット `Enum`。`[-32768, 32767]` の範囲で最大65536の値を列挙できます。

ClickHouseはデータが挿入されるときに自動的に `Enum` のタイプを選択します。ストレージのサイズを確実にするために、`Enum8` または `Enum16` タイプを使用することもできます。

## Usage Examples {#usage-examples}

ここでは、`Enum8('hello' = 1, 'world' = 2)` タイプのカラムを持つテーブルを作成します：

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

同様に、数字を省略することもできます。ClickHouseが自動的に連続した数字を割り当てます。数字はデフォルトで1から割り当てられます。

```sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

最初の名前に対する合法的な開始番号を指定することもできます。

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world')
)
ENGINE = TinyLog
```

```sql
CREATE TABLE t_enum
(
    x Enum8('hello' = -129, 'world')
)
ENGINE = TinyLog
```

```text
Exception on server:
Code: 69. DB::Exception: Value -129 for element 'hello' exceeds range of Enum8.
```

カラム `x` には、タイプ定義でリストされている値 `'hello'` または `'world'` のみが格納できます。他の値を保存しようとすると、ClickHouseは例外を発生させます。この `Enum` の8ビットサイズは自動的に選択されます。

```sql
INSERT INTO t_enum VALUES ('hello'), ('world'), ('hello')
```

```text
Ok.
```

```sql
INSERT INTO t_enum values('a')
```

```text
Exception on client:
Code: 49. DB::Exception: Unknown element 'a' for type Enum('hello' = 1, 'world' = 2)
```

テーブルからデータをクエリすると、ClickHouseは `Enum` から文字列値を出力します。

```sql
SELECT * FROM t_enum
```

```text
┌─x─────┐
│ hello │
│ world │
│ hello │
└───────┘
```

行の数値の等価物を表示する必要がある場合は、`Enum` 値を整数タイプにキャストする必要があります。

```sql
SELECT CAST(x, 'Int8') FROM t_enum
```

```text
┌─CAST(x, 'Int8')─┐
│               1 │
│               2 │
│               1 │
└─────────────────┘
```

クエリ内でEnum値を作成するには、`CAST` を使用する必要があります。

```sql
SELECT toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))
```

```text
┌─toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))─┐
│ Enum8('a' = 1, 'b' = 2)                             │
└─────────────────────────────────────────────────────┘
```

## General Rules and Usage {#general-rules-and-usage}

各値には、`Enum8` の範囲 `-128 ... 127` または `Enum16` の範囲 `-32768 ... 32767` の番号が割り当てられます。すべての文字列と数値は異なる必要があります。空の文字列は許可されています。この型が指定された場合（テーブル定義内）、番号は任意の順序であってもかまいません。ただし、順序は重要ではありません。

`Enum` の文字列または数値の値は [NULL](../../sql-reference/syntax.md) であることはできません。

`Enum` は [Nullable](../../sql-reference/data-types/nullable.md) 型に含めることができます。したがって、次のクエリを使用してテーブルを作成すると、

```sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

`'hello'` と `'world'` だけでなく、`NULL` も格納できます。

```sql
INSERT INTO t_enum_nullable Values('hello'),('world'),(NULL)
```

RAM内では、`Enum` カラムは対応する数値の `Int8` または `Int16` と同じ方法で格納されます。

テキスト形式で読み込むと、ClickHouseは値を文字列として解析し、Enum値のセットから対応する文字列を検索します。見つからない場合は、例外がスローされます。テキスト形式で読み込むと、文字列が読み取られ、それに対応する数値が検索されます。見つからない場合は、例外がスローされます。
テキスト形式で書き込む場合、対応する文字列として値が書き込まれます。カラムデータにガーベッジ（有効なセットの中にない数字）が含まれている場合、例外がスローされます。バイナリ形式で読み書きするときも、Int8およびInt16データ型と同じように動作します。
暗黙のデフォルト値は、最も番号の低い値です。

`ORDER BY`、`GROUP BY`、`IN`、`DISTINCT` などでは、Enumは対応する数字と同様に動作します。たとえば、ORDER BYは数値的にソートされます。等価性および比較演算子は、Enumに対しても対応する数値と同様に動作します。

Enum値は数字と比較できません。Enumは定数文字列と比較できます。比較対象の文字列がEnumの有効な値でない場合、例外がスローされます。IN演算子は、左側にEnum、右側に文字列のセットがある場合にサポートされています。文字列は対応するEnumの値です。

ほとんどの数値および文字列操作はEnum値には定義されていません。たとえば、Enumに数字を加算したり、Enumに文字列を連結したりすることはできません。
ただし、Enumはその文字列値を返す自然な `toString` 関数を持っています。

Enum値は `toT` 関数を使用して数値型に変換可能で、Tは数値型です。TがEnumの基になる数値型と一致する場合、この変換はコストがかかりません。
Enum型はALTERを使用してコストなしで変更できます。値のセットが変更される場合のみ可能です。ALTERを使用してEnumのメンバーを追加および削除することもできます（削除は、削除された値がテーブルで使用されたことがない場合のみ安全です）。以前に定義されたEnumメンバーの数値を変更すると、例外がスローされます。

ALTERを使用して、Enum8をEnum16に、またはその逆に変更することが可能です。これは、Int8をInt16に変更するのと同様です。
