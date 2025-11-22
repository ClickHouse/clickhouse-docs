---
description: 'ClickHouse における Enum データ型のドキュメント。Enum データ型は、名前付き定数値の集合を表します'
sidebar_label: 'Enum'
sidebar_position: 20
slug: /sql-reference/data-types/enum
title: 'Enum'
doc_type: 'reference'
---



# Enum

名前付き値で構成される列挙型です。

名前付き値は、`'string' = integer` のペア、または `'string'` という名前として宣言できます。ClickHouse は数値のみを保存しますが、名前を通じて値を扱う操作をサポートします。

ClickHouse では次の型をサポートします。

- 8 ビットの `Enum`。`[-128, 127]` の範囲で列挙された最大 256 個の値を含めることができます。
- 16 ビットの `Enum`。`[-32768, 32767]` の範囲で列挙された最大 65536 個の値を含めることができます。

ClickHouse は、データの挿入時に自動的に `Enum` の型を選択します。格納に必要なサイズを明確にするために、`Enum8` または `Enum16` 型を明示的に使用することもできます。



## 使用例 {#usage-examples}

ここでは、`Enum8('hello' = 1, 'world' = 2)` 型のカラムを持つテーブルを作成します:

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

同様に、数値を省略することもできます。ClickHouseは連続した数値を自動的に割り当てます。デフォルトでは、数値は1から開始されます。

```sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

最初の要素に対して有効な開始番号を指定することもできます。

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

カラム `x` は、型定義にリストされている値のみを格納できます: `'hello'` または `'world'`。他の値を保存しようとすると、ClickHouseは例外を発生させます。この `Enum` の8ビットサイズは自動的に選択されます。

```sql
INSERT INTO t_enum VALUES ('hello'), ('world'), ('hello')
```

```text
Ok.
```

```sql
INSERT INTO t_enum VALUES('a')
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

行の数値相当を確認する必要がある場合は、`Enum` 値を整数型にキャストする必要があります。

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


## 一般的なルールと使用方法 {#general-rules-and-usage}

各値には、`Enum8`の場合は`-128 ... 127`の範囲、`Enum16`の場合は`-32768 ... 32767`の範囲の数値が割り当てられます。すべての文字列と数値は一意である必要があります。空文字列は許可されます。このデータ型を(テーブル定義で)指定する場合、数値は任意の順序で指定できます。ただし、順序は重要ではありません。

`Enum`内の文字列値も数値も[NULL](../../sql-reference/syntax.md)にすることはできません。

`Enum`は[Nullable](../../sql-reference/data-types/nullable.md)型に含めることができます。したがって、次のクエリを使用してテーブルを作成した場合

```sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

`'hello'`と`'world'`だけでなく、`NULL`も格納できます。

```sql
INSERT INTO t_enum_nullable VALUES('hello'),('world'),(NULL)
```

RAM内では、`Enum`カラムは対応する数値の`Int8`または`Int16`と同じ方法で格納されます。

テキスト形式で読み取る場合、ClickHouseは値を文字列として解析し、Enum値のセットから対応する文字列を検索します。見つからない場合は例外がスローされます。テキスト形式で読み取る場合、文字列が読み取られ、対応する数値が検索されます。見つからない場合は例外がスローされます。
テキスト形式で書き込む場合、値は対応する文字列として書き込まれます。カラムデータに不正な値(有効なセットに含まれない数値)が含まれている場合、例外がスローされます。バイナリ形式で読み書きする場合、Int8およびInt16データ型と同じ方法で動作します。
暗黙的なデフォルト値は、最小の数値を持つ値です。

`ORDER BY`、`GROUP BY`、`IN`、`DISTINCT`などの処理では、Enumは対応する数値と同じように動作します。たとえば、ORDER BYは数値順にソートします。等価演算子と比較演算子は、基礎となる数値と同じようにEnumに対して機能します。

Enum値は数値と比較できません。Enumは定数文字列と比較できます。比較対象の文字列がEnumの有効な値でない場合、例外がスローされます。IN演算子は、左辺にEnumを、右辺に文字列のセットを指定することでサポートされます。文字列は対応するEnumの値です。

ほとんどの数値演算と文字列演算は、Enum値に対して定義されていません。たとえば、Enumに数値を加算したり、Enumに文字列を連結したりすることはできません。
ただし、Enumには文字列値を返すネイティブな`toString`関数があります。

Enum値は、`toT`関数を使用して数値型に変換することもできます。ここでTは数値型です。Tがenumの基礎となる数値型に対応する場合、この変換はゼロコストです。
Enum型は、値のセットのみが変更される場合、ALTERを使用してコストなしで変更できます。ALTERを使用してEnumのメンバーを追加および削除することが可能です(削除は、削除される値がテーブルで一度も使用されていない場合にのみ安全です)。安全策として、以前に定義されたEnumメンバーの数値を変更すると例外がスローされます。

ALTERを使用すると、Int8をInt16に変更するのと同様に、Enum8をEnum16に、またはその逆に変更することが可能です。
