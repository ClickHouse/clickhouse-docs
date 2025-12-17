---
description: 'ClickHouse における Enum データ型に関するドキュメント。名前付き定数値の集合を表します'
sidebar_label: 'Enum'
sidebar_position: 20
slug: /sql-reference/data-types/enum
title: 'Enum'
doc_type: 'reference'
---

# Enum {#enum}

名前付きの値から構成される列挙型です。

名前付きの値は、`'string' = integer` のペア、または `'string'` の名前として宣言できます。ClickHouse では数値のみを保存しますが、名前を使って値に対する操作を行えます。

ClickHouse は次の Enum 型をサポートします。

* 8 ビットの `Enum`。`[-128, 127]` の範囲で列挙される最大 256 個の値を含めることができます。
* 16 ビットの `Enum`。`[-32768, 32767]` の範囲で列挙される最大 65536 個の値を含めることができます。

ClickHouse は、データ挿入時に自動的に `Enum` の型を選択します。格納に必要なサイズを明確にするために、`Enum8` や `Enum16` 型を使用することもできます。

## 使用例 {#usage-examples}

ここでは、`Enum8('hello' = 1, 'world' = 2)` 型の列を持つテーブルを作成します。

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

同様に、番号は省略できます。ClickHouse が自動的に連番を割り当てます。デフォルトでは 1 から割り当てられます。

```sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

ファーストネームに対して有効な開始番号を指定することもできます。

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

カラム `x` には、型定義で列挙された値である `'hello'` または `'world'` しか保存できません。これ以外の値を保存しようとすると、ClickHouse は例外を発生させます。この `Enum` のサイズとして 8 ビットが自動的に選択されます。

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

テーブルをクエリすると、ClickHouse は `Enum` の文字列値を返します。

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

行に対応する数値を確認する必要がある場合は、`Enum` 型の値を整数型にキャストする必要があります。

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

クエリ内で Enum 型の値を作成するには、`CAST` も使用する必要があります。

```sql
SELECT toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))
```

```text
┌─toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))─┐
│ Enum8('a' = 1, 'b' = 2)                             │
└─────────────────────────────────────────────────────┘
```

## 一般的な規則と使用方法 {#general-rules-and-usage}

各値には、`Enum8` の場合は `-128 ... 127` の範囲、`Enum16` の場合は `-32768 ... 32767` の範囲の数値が割り当てられます。すべての文字列および数値は相互に異なっていなければなりません。空文字列も許可されます。この型が（テーブル定義で）指定されている場合、数値は任意の順序でかまいません。ただし、その順序に意味はありません。

`Enum` 内の文字列値および数値値はどちらも [NULL](../../sql-reference/syntax.md) にすることはできません。

`Enum` は [Nullable](../../sql-reference/data-types/nullable.md) 型に含めることができます。そのため、次のクエリを使用してテーブルを作成する場合

```sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

`'hello'` と `'world'` だけでなく、`NULL` も格納できます。

```sql
INSERT INTO t_enum_nullable VALUES('hello'),('world'),(NULL)
```

RAM 上では、`Enum` カラムは対応する数値表現の `Int8` または `Int16` と同じ方法で格納されます。

テキスト形式で読み込むとき、ClickHouse は値を文字列としてパースし、Enum の値集合から対応する文字列を検索します。見つからない場合は例外がスローされます。テキスト形式で出力された文字列を読み込む際には、その文字列を読み取り、対応する数値表現を検索します。見つからなければ例外がスローされます。
テキスト形式で書き込むときは、対応する文字列として値を書き込みます。カラムデータに不正な値（有効な集合に含まれない数値）が含まれている場合は、例外がスローされます。バイナリ形式での読み書きでは、`Int8` および `Int16` データ型の場合と同様に動作します。
暗黙のデフォルト値は、最も小さい数値を持つ値です。

`ORDER BY`、`GROUP BY`、`IN`、`DISTINCT` などの処理時には、Enum は対応する数値と同じように振る舞います。たとえば、`ORDER BY` はそれらを数値としてソートします。等価演算子および比較演算子は、Enum に対しても基になる数値に対するときと同じように動作します。

Enum 値は数値と比較することはできません。Enum は定数文字列と比較することができます。比較対象の文字列が Enum にとって有効な値でない場合は、例外がスローされます。`IN` 演算子は、左辺が Enum、右辺が文字列の集合である場合にサポートされます。これらの文字列は対応する Enum の値です。

ほとんどの数値演算および文字列演算は Enum 値に対しては定義されていません。たとえば Enum に数値を加算する、あるいは Enum に文字列を連結するといった操作です。
しかし、Enum には自然な形で `toString` 関数が定義されており、その文字列値を返します。

Enum 値は、`toT` 関数を使って数値型に変換することもできます。ここで T は数値型です。T が Enum の基になる数値型に対応する場合、この変換はゼロコストです。
Enum 型は、値の集合だけが変更される場合には、ALTER を使ってコストなしに変更できます。ALTER を用いて Enum のメンバーを追加および削除することが可能です（削除は、その値がテーブル内で一度も使用されていない場合にのみ安全です）。安全策として、すでに定義済みの Enum メンバーの数値を変更しようとすると例外がスローされます。

ALTER を使用することで、`Enum8` を `Enum16` に、あるいはその逆に変更することができます。これは `Int8` を `Int16` に変更する場合と同様です。
