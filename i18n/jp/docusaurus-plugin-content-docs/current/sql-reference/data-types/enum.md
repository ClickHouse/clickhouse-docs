---
'description': 'ClickHouse における Enum データ型のドキュメントで、名前付き定数値のセットを表します'
'sidebar_label': 'Enum'
'sidebar_position': 20
'slug': '/sql-reference/data-types/enum'
'title': 'Enum'
'doc_type': 'reference'
---


# Enum

名前付き値で構成される列挙型です。

名前付き値は、`'string' = integer` のペアまたは `'string'` の名前として宣言できます。ClickHouse は数値のみを保存しますが、名前を通じて値との操作をサポートします。

ClickHouse は以下をサポートしています：

- 8ビット `Enum`。最大 256 の値を `[-128, 127]` の範囲で列挙できます。
- 16ビット `Enum`。最大 65536 の値を `[-32768, 32767]` の範囲で列挙できます。

ClickHouse はデータが挿入されるときに `Enum` の型を自動的に選択します。また、ストレージサイズを確実にするために `Enum8` または `Enum16` 型を使用することもできます。

## 使用例 {#usage-examples}

ここでは、`Enum8('hello' = 1, 'world' = 2)` 型のカラムを持つテーブルを作成します：

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

同様に、数値を省略することもできます。ClickHouse は連続する数値を自動的に割り当てます。デフォルトでは、数値は 1 から開始されます。

```sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

また、最初の名前に対して合法的な開始数を指定することもできます。

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

カラム `x` は、型定義にリストされた値 `'hello'` または `'world'` のみを格納できます。他の値を保存しようとすると、ClickHouse は例外を発生させます。この `Enum` の 8 ビットサイズは自動的に選ばれます。

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

テーブルからデータをクエリすると、ClickHouse は `Enum` からの文字列値を出力します。

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

行の数値の等価を見たい場合は、`Enum` 値を整数型にキャストする必要があります。

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

クエリで `Enum` 値を作成するには、`CAST` を使用する必要があります。

```sql
SELECT toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))
```

```text
┌─toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))─┐
│ Enum8('a' = 1, 'b' = 2)                             │
└─────────────────────────────────────────────────────┘
```

## 一般的なルールと使用法 {#general-rules-and-usage}

各値は、`Enum8` の範囲 `-128 ... 127` または `Enum16` の範囲 `-32768 ... 32767` で数値が割り当てられます。すべての文字列と数値は異なっている必要があります。空の文字列は許可されています。この型が指定されている場合（テーブル定義内で）、数値は任意の順序で配置できます。ただし、順序は問題になりません。

`Enum` の文字列または数値は [NULL](../../sql-reference/syntax.md) にはできません。

`Enum` は [Nullable](../../sql-reference/data-types/nullable.md) 型に含まれることができます。したがって、次のクエリを使用してテーブルを作成すると

```sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

`'hello'` や `'world'` のほかに `NULL` も格納できます。

```sql
INSERT INTO t_enum_nullable VALUES('hello'),('world'),(NULL)
```

RAM 内では、`Enum` カラムは対応する数値の `Int8` または `Int16` と同じように保存されます。

テキスト形式で読み込むと、ClickHouse は値を文字列として解析し、Enum の値のセットから対応する文字列を検索します。見つからない場合は、例外がスローされます。テキスト形式で読み込むと、文字列が読み取られ、対応する数値が検索されます。見つからない場合は、例外がスローされます。
テキスト形式で書き込むと、対応する文字列として値が書き込まれます。カラムデータにゴミ（有効なセットからの数値でないもの）が含まれている場合は、例外がスローされます。バイナリ形式で読み書きする際は、Int8 および Int16 データ型と同様に動作します。
暗黙のデフォルト値は、最も低い数値の値です。

`ORDER BY`、`GROUP BY`、`IN`、`DISTINCT` などの操作中、Enum は対応する数値と同じように振舞います。たとえば、ORDER BY は数値的にソートします。等価および比較演算子は、Enum に関しても基盤となる数値と同じように機能します。

Enum 値は数値と比較できません。Enum は定数文字列と比較できます。比較される文字列が Enum の有効な値でない場合は、例外がスローされます。IN 演算子は Enum の左側と文字列のセットの右側でサポートされています。文字列は対応する Enum の値です。

多数の数値および文字列演算は、Enum 値に対して未定義です。たとえば、Enum に数値を加えたり、文字列を Enum に連結したりすることはできません。
ただし、Enum にはその文字列値を返す自然な `toString` 関数があります。

Enum 値は `toT` 関数を使用して数値型に変換することもでき、ここで T は数値型です。T が Enum の基盤となる数値型に対応する場合、この変換はコストがかかりません。
ALTER を使用して、値のセットが変更されるだけで Enum 型をコストなしで変更できます。ALTER を使用して、Enum のメンバーを追加または削除することができます（削除は、削除された値がテーブルで一度も使用されていない場合に限り安全です）。安全策として、以前に定義された Enum メンバーの数値値を変更すると例外がスローされます。

ALTER を使用して、Enum8 を Enum16 に、またはその逆に変更することが可能で、Int8 を Int16 に変更するのと同様です。
