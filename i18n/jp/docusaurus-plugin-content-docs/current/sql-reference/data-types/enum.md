---
description: 'ClickHouseにおけるEnumデータ型のドキュメンテーションで、名前付き定数値のセットを表現します'
sidebar_label: 'Enum'
sidebar_position: 20
slug: /sql-reference/data-types/enum
title: 'Enum'
---


# Enum

名前付き値からなる列挙型です。

名前付き値は、`'string' = integer` のペアまたは `'string'` の名前として宣言できます。ClickHouseは数値のみを保存しますが、名前を通じて値に対する操作をサポートしています。

ClickHouseは以下をサポートしています：

- 8ビット `Enum`。`[-128, 127]` の範囲で最大256の値を含むことができます。
- 16ビット `Enum`。`[-32768, 32767]` の範囲で最大65536の値を含むことができます。

ClickHouseはデータが挿入されるときに `Enum` の型を自動的に選択します。また、ストレージサイズを保証するために `Enum8` または `Enum16` 型を使用することもできます。

## 使用例 {#usage-examples}

ここでは、`Enum8('hello' = 1, 'world' = 2)` 型のカラムを持つテーブルを作成します：

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

同様に、数字を省略することもできます。ClickHouseは連続番号を自動的に割り当てます。デフォルトでは、番号は1から始まります。

```sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

最初の名前に対して合法的な開始番号を指定することもできます。

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
サーバー上の例外:
Code: 69. DB::Exception: 値 -129 は Enum8 の範囲を超えています。
```

カラム `x` には、型定義にリストされている値：`'hello'` または `'world'` のみを保存できます。他の値を保存しようとすると、ClickHouseは例外をスローします。この `Enum` の8ビットサイズは自動的に選択されます。

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
クライアント上の例外:
Code: 49. DB::Exception: Unknown element 'a' for type Enum('hello' = 1, 'world' = 2)
```

テーブルからデータをクエリすると、ClickHouseは `Enum` の文字列値を出力します。

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

行の数値的な等価物を表示する必要がある場合は、`Enum` の値を整数型にキャストする必要があります。

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

## 一般的なルールと使用法 {#general-rules-and-usage}

各値は、`Enum8` に対しては `-128 ... 127` の範囲または `Enum16` に対しては `-32768 ... 32767` の範囲内で番号が割り当てられます。すべての文字列と数字は異なっている必要があります。空の文字列は許可されます。この型が指定されている場合（テーブル定義内）、番号は任意の順序であることができます。ただし、順序は重要ではありません。

`Enum` の文字列や数値は、[NULL](../../sql-reference/syntax.md) ではありえません。

`Enum` は [Nullable](../../sql-reference/data-types/nullable.md) 型に含めることができます。したがって、以下のクエリを使用してテーブルを作成すると、

```sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

`'hello'` と `'world'` に加えて、`NULL` も保存できます。

```sql
INSERT INTO t_enum_nullable Values('hello'),('world'),(NULL)
```

RAMでは、`Enum` カラムは対応する数値（Int8またはInt16）と同じ方法で保存されます。

テキスト形式で読み取ると、ClickHouseは値を文字列として解析し、Enum値のセットから対応する文字列を探します。見つからない場合は、例外がスローされます。テキスト形式で読み取る場合、文字列が読み込まれ、対応する数値が検索されます。見つからない場合は、例外がスローされます。
バイナリ形式での読み書きでは、Int8およびInt16データ型の場合と同じ動作をします。
暗黙的なデフォルト値は、最も小さい番号の値です。

`ORDER BY`、`GROUP BY`、`IN`、`DISTINCT` などの操作では、Enumは対応する数値と同じように動作します。例えば、ORDER BYでは数値的にソートされます。等号および比較演算子は、Enumに対しても、基礎となる数値に対しても同じように機能します。

Enum値は数値と比較することはできません。Enumは定数文字列と比較できます。比較する文字列がEnumの有効な値でない場合は、例外がスローされます。IN演算子は、左側にEnum、右側に文字列のセットがあるときにサポートされています。文字列は対応するEnumの値です。

ほとんどの数値および文字列の操作はEnum値に対して定義されていません。例えば、Enumに数値を加えたり、Enumに文字列を連結したりすることはできません。
ただし、Enumにはその文字列値を返す自然な `toString` 関数があります。

Enum値は、`toT` 関数を使用して数値型に変換することも可能です。ここで T は数値型です。TがEnumの基礎となる数値型に対応する場合、この変換はゼロコストです。
Enum型は、値のセットの変更のみであればALTERを使用してコストなしで変更することが可能です。ALTERを使用してEnumのメンバーを追加および削除することもでき（削除は、削除された値がテーブルで使用されたことがない場合に限って安全です）、以前に定義されたEnumメンバーの数値を変更すると例外がスローされます。

ALTERを使用すると、Enum8をEnum16に、またその逆に変更することが可能です。これはInt8をInt16に変更するのと同様です。
