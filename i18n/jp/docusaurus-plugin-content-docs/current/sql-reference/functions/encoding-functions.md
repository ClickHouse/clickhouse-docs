---
description: 'エンコーディング関数のドキュメント'
sidebar_label: 'エンコーディング'
sidebar_position: 65
slug: /sql-reference/functions/encoding-functions
title: 'エンコーディング関数'
---


# エンコーディング関数

## char {#char}

渡された引数の数を文字列の長さとして返し、各バイトは対応する引数の値を持ちます。数値型の複数の引数を受け入れます。引数の値がUInt8データ型の範囲外である場合は、丸めやオーバーフローが発生する可能性がある中でUInt8に変換されます。

**構文**

```sql
char(number_1, [number_2, ..., number_n]);
```

**引数**

- `number_1, number_2, ..., number_n` — 整数として解釈される数値引数。型: [Int](../data-types/int-uint.md), [Float](../data-types/float.md).

**返される値**

- 指定されたバイトの文字列。[String](../data-types/string.md).

**例**

クエリ:

```sql
SELECT char(104.1, 101, 108.9, 108.9, 111) AS hello;
```

結果:

```text
┌─hello─┐
│ hello │
└───────┘
```

対応するバイトを渡すことによって、任意のエンコーディングの文字列を構築できます。以下はUTF-8の例です：

クエリ:

```sql
SELECT char(0xD0, 0xBF, 0xD1, 0x80, 0xD0, 0xB8, 0xD0, 0xB2, 0xD0, 0xB5, 0xD1, 0x82) AS hello;
```

結果:

```text
┌─hello──┐
│ привет │
└────────┘
```

クエリ:

```sql
SELECT char(0xE4, 0xBD, 0xA0, 0xE5, 0xA5, 0xBD) AS hello;
```

結果:

```text
┌─hello─┐
│ 你好  │
└───────┘
```

## hex {#hex}

引数の16進数表現を含む文字列を返します。

別名: `HEX`.

**構文**

```sql
hex(arg)
```

この関数は大文字 'A-F' を使用し、接頭辞（`0x`のような）や接尾辞（`h`のような）は使用しません。

整数の引数に対して、最も重要な桁から最も重要でない桁までの16進数の桁 ("ニブル") を印刷します（ビッグエンディアンまたは「人間が読みやすい」順）。最も重要な非ゼロバイトから始まり（先頭のゼロバイトは省略されますが）、先頭の桁が0であってもすべてのバイトの二桁が常に印刷されます。

[Date](../data-types/date.md)および[DateTime](../data-types/datetime.md)型の値は、対応する整数（Epochからの日数およびUnixタイムスタンプの値）としてフォーマットされます。

[String](../data-types/string.md)および[FixedString](../data-types/fixedstring.md)に対して、すべてのバイトは単に2つの16進数でエンコードされます。ゼロバイトは省略されません。

[Float](../data-types/float.md)および[Decimal](../data-types/decimal.md)型の値は、メモリ内での表現としてエンコードされます。リトルエンディアンアーキテクチャをサポートしているため、リトルエンディアンでエンコードされます。先頭や末尾のゼロバイトは省略されません。

[UUID](../data-types/uuid.md)型の値は、ビッグエンディアン順の文字列としてエンコードされます。

**引数**

- `arg` — 16進数に変換する値。型: [String](../data-types/string.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md), [Decimal](../data-types/decimal.md), [Date](../data-types/date.md)または[DateTime](../data-types/datetime.md).

**返される値**

- 引数の16進数表現を含む文字列。[String](../data-types/string.md).

**例**

クエリ:

```sql
SELECT hex(1);
```

結果:

```text
01
```

クエリ:

```sql
SELECT hex(toFloat32(number)) AS hex_presentation FROM numbers(15, 2);
```

結果:

```text
┌─hex_presentation─┐
│ 00007041         │
│ 00008041         │
└──────────────────┘
```

クエリ:

```sql
SELECT hex(toFloat64(number)) AS hex_presentation FROM numbers(15, 2);
```

結果:

```text
┌─hex_presentation─┐
│ 0000000000002E40 │
│ 0000000000003040 │
└──────────────────┘
```

クエリ:

```sql
SELECT lower(hex(toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0'))) as uuid_hex
```

結果:

```text
┌─uuid_hex─────────────────────────┐
│ 61f0c4045cb311e7907ba6006ad3dba0 │
└──────────────────────────────────┘
```

## unhex {#unhex}

[hex](#hex)の逆の操作を行います。引数内の各ペアの16進数の桁を数値として解釈し、それをその数値で表されるバイトに変換します。返される値はバイナリ文字列（BLOB）です。

結果を数値に変換したい場合は、[reverse](../../sql-reference/functions/string-functions.md#reverse)および[reinterpretAs&lt;Type&gt;](/sql-reference/functions/type-conversion-functions)関数を使用できます。

:::note
`unhex`が`clickhouse-client`内から呼び出された場合、バイナリ文字列はUTF-8で表示されます。
:::

別名: `UNHEX`.

**構文**

```sql
unhex(arg)
```

**引数**

- `arg` — 任意の数の16進数の桁を含む文字列。[String](../data-types/string.md), [FixedString](../data-types/fixedstring.md).

大文字と小文字の'A-F'の両方をサポートします。16進数の桁の数は偶数である必要はありません。奇数の場合、最後の桁は`00-0F`バイトの最下位半分として解釈されます。引数の文字列に16進数以外の文字が含まれている場合、実装に依存した結果が返されます（例外はスローされません）。数値の引数の場合、unhex()によってhex(N)の逆は行われません。

**返される値**

- バイナリ文字列（BLOB）。[String](../data-types/string.md).

**例**

クエリ:
```sql
SELECT unhex('303132'), UNHEX('4D7953514C');
```

結果:
```text
┌─unhex('303132')─┬─unhex('4D7953514C')─┐
│ 012             │ MySQL               │
└─────────────────┴─────────────────────┘
```

クエリ:

```sql
SELECT reinterpretAsUInt64(reverse(unhex('FFF'))) AS num;
```

結果:

```text
┌──num─┐
│ 4095 │
└──────┘
```

## bin {#bin}

引数の2進数表現を含む文字列を返します。

**構文**

```sql
bin(arg)
```

別名: `BIN`.

整数の引数に対して、それは最も重要な桁から最も重要でない桁までの2進数の桁を印刷します（ビッグエンディアンまたは「人間が読みやすい」順）。最も重要な非ゼロバイトから始まり（先頭のゼロバイトは省略されますが）、すべてのバイトの8桁は常に印刷されます。

[Date](../data-types/date.md)および[DateTime](../data-types/datetime.md)型の値は、対応する整数（Epochからの日数およびUnixタイムスタンプの値）としてフォーマットされます。

[String](../data-types/string.md)および[FixedString](../data-types/fixedstring.md)に対して、すべてのバイトは単に8つの2進数としてエンコードされます。ゼロバイトは省略されません。

[Float](../data-types/float.md)および[Decimal](../data-types/decimal.md)型の値は、メモリ内での表現としてエンコードされます。リトルエンディアンアーキテクチャをサポートしているため、リトルエンディアンでエンコードされます。先頭や末尾のゼロバイトは省略されません。

[UUID](../data-types/uuid.md)型の値は、ビッグエンディアン順の文字列としてエンコードされます。

**引数**

- `arg` — バイナリに変換する値。 [String](../data-types/string.md), [FixedString](../data-types/fixedstring.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md), [Decimal](../data-types/decimal.md), [Date](../data-types/date.md), または [DateTime](../data-types/datetime.md).

**返される値**

- 引数のバイナリ表現を含む文字列。[String](../data-types/string.md).

**例**

クエリ:

```sql
SELECT bin(14);
```

結果:

```text
┌─bin(14)──┐
│ 00001110 │
└──────────┘
```

クエリ:

```sql
SELECT bin(toFloat32(number)) AS bin_presentation FROM numbers(15, 2);
```

結果:

```text
┌─bin_presentation─────────────────┐
│ 00000000000000000111000001000001 │
│ 00000000000000001000000001000001 │
└──────────────────────────────────┘
```

クエリ:

```sql
SELECT bin(toFloat64(number)) AS bin_presentation FROM numbers(15, 2);
```

結果:

```text
┌─bin_presentation─────────────────────────────────────────────────┐
│ 0000000000000000000000000000000000000000000000000010111001000000 │
│ 0000000000000000000000000000000000000000000000000011000001000000 │
└──────────────────────────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT bin(toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0')) as bin_uuid
```

結果:

```text
┌─bin_uuid─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 01100001111100001100010000000100010111001011001100010001111001111001000001111011101001100000000001101010110100111101101110100000 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## unbin {#unbin}

引数内の各ペアのバイナリ桁を数値として解釈し、それをその数値で表されるバイトに変換します。この関数は[bin](#bin)の逆の操作を実行します。

**構文**

```sql
unbin(arg)
```

別名: `UNBIN`.

数値の引数に対して`unbin()`は`bin()`の逆を返しません。結果を数値に変換したい場合は、[reverse](../../sql-reference/functions/string-functions.md#reverse)および[reinterpretAs&lt;Type&gt;](/sql-reference/functions/type-conversion-functions#reinterpret)関数を使用できます。

:::note
`unbin`が`clickhouse-client`内から呼び出された場合、バイナリ文字列はUTF-8で表示されます。
:::

バイナリ桁「0」と「1」をサポートします。バイナリ桁の数は8の倍数である必要はありません。引数の文字列にバイナリ桁以外の文字が含まれている場合、実装依存の結果が返されます（例外はスローされません）。

**引数**

- `arg` — 任意の数のバイナリ桁を含む文字列。[String](../data-types/string.md).

**返される値**

- バイナリ文字列（BLOB）。[String](../data-types/string.md).

**例**

クエリ:

```sql
SELECT UNBIN('001100000011000100110010'), UNBIN('0100110101111001010100110101000101001100');
```

結果:

```text
┌─unbin('001100000011000100110010')─┬─unbin('0100110101111001010100110101000101001100')─┐
│ 012                               │ MySQL                                             │
└───────────────────────────────────┴───────────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT reinterpretAsUInt64(reverse(unbin('1110'))) AS num;
```

結果:

```text
┌─num─┐
│  14 │
└─────┘
```

## bitmaskToList(num) {#bitmasktolistnum}

整数を受け入れます。合計が元の数になるすべての2の電源のリストを含む文字列を返します。それらはテキスト形式で、カンマで区切られ、スペースなしに昇順で表示されます。

## bitmaskToArray(num) {#bitmasktoarraynum}

整数を受け入れます。合計が元の数になるすべての2の電源を含むUInt64の配列を返します。配列内の数字は昇順です。

## bitPositionsToArray(num) {#bitpositionstoarraynum}

整数を受け入れ、符号なし整数に変換します。引数`arg`のビットが`1`に等しい位置のリストを含む`UInt64`の配列を昇順で返します。

**構文**

```sql
bitPositionsToArray(arg)
```

**引数**

- `arg` — 整数値。[Int/UInt](../data-types/int-uint.md).

**返される値**

- `1`に等しいビットの位置のリストを含む配列、昇順。[Array](../data-types/array.md)([UInt64](../data-types/int-uint.md)).

**例**

クエリ:

```sql
SELECT bitPositionsToArray(toInt8(1)) AS bit_positions;
```

結果:

```text
┌─bit_positions─┐
│ [0]           │
└───────────────┘
```

クエリ:

```sql
SELECT bitPositionsToArray(toInt8(-1)) AS bit_positions;
```

結果:

```text
┌─bit_positions─────┐
│ [0,1,2,3,4,5,6,7] │
└───────────────────┘
```

## mortonEncode {#mortonencode}

符号なし整数のリストのモートンエンコーディング（ZCurve）を計算します。

この関数には2つの動作モードがあります：
- シンプル
- 拡張

### シンプルモード {#simple-mode}

最大8つの符号なし整数を引数として受け入れ、UInt64コードを生成します。

**構文**

```sql
mortonEncode(args)
```

**パラメータ**

- `args`: 最大8つの[符号なし整数](../data-types/int-uint.md)または上述の型のカラム。

**返される値**

- UInt64コード。[UInt64](../data-types/int-uint.md)

**例**

クエリ:

```sql
SELECT mortonEncode(1, 2, 3);
```
結果:

```response
53
```

### 拡張モード {#expanded-mode}

範囲マスク（[タプル](../data-types/tuple.md)）を最初の引数として受け入れ、その後最大8つの[符号なし整数](../data-types/int-uint.md)を引数として受け入れます。

マスク内の各数は範囲拡張の量を設定します：<br/>
1 - 拡張なし<br/>
2 - 2倍の拡張<br/>
3 - 3倍の拡張<br/>
...<br/>
最大8倍の拡張<br/>

**構文**

```sql
mortonEncode(range_mask, args)
```

**パラメータ**
- `range_mask`: 1-8.
- `args`: 最大8つの[符号なし整数](../data-types/int-uint.md)または上述の型のカラム。

注意: `args`にカラムを使用する場合、提供される`range_mask`タプルは定数である必要があります。

**返される値**

- UInt64コード。[UInt64](../data-types/int-uint.md)

**例**

範囲の拡張は、非常に異なる範囲（または基数）を持つ引数に対して類似の分布が必要な場合に有益です。
たとえば： 'IPアドレス' (0...FFFFFFFF) と '国コード' (0...FF)。

クエリ:

```sql
SELECT mortonEncode((1,2), 1024, 16);
```

結果:

```response
1572864
```

注意: タプルのサイズは他の引数の数と等しくなければなりません。

**例**

モートンエンコーディングの1つの引数は常にその引数自身です：

クエリ:

```sql
SELECT mortonEncode(1);
```

結果:

```response
1
```

**例**

1つの引数を拡張することも可能です：

クエリ:

```sql
SELECT mortonEncode(tuple(2), 128);
```

結果:

```response
32768
```

**例**

カラム名を使用して関数を呼び出すこともできます。

クエリ:

最初にテーブルを作成し、データを挿入します。

```sql
create table morton_numbers(
    n1 UInt32,
    n2 UInt32,
    n3 UInt16,
    n4 UInt16,
    n5 UInt8,
    n6 UInt8,
    n7 UInt8,
    n8 UInt8
)
Engine=MergeTree()
ORDER BY n1 SETTINGS index_granularity = 8192, index_granularity_bytes = '10Mi';
insert into morton_numbers (*) values(1,2,3,4,5,6,7,8);
```
定数の代わりにカラム名を引数として`mortonEncode`に使用します。

クエリ:

```sql
SELECT mortonEncode(n1, n2, n3, n4, n5, n6, n7, n8) FROM morton_numbers;
```

結果:

```response
2155374165
```

**実装の詳細**

モートンコードに収めることができるビット情報は[UInt64](../data-types/int-uint.md)に収められています。2つの引数の場合は、それぞれの範囲が最大2^32 (64/2) になります。3つの引数の場合は最大2^21 (64/3) になります。そのため、すべてのオーバーフローはゼロに制限されます。

## mortonDecode {#mortondecode}

モートンエンコーディング（ZCurve）をデコードして、対応する符号なし整数のタプルに戻します。

`mortonEncode`関数と同様に、この関数も2つの動作モードがあります：
- シンプル
- 拡張

### シンプルモード {#simple-mode-1}

結果のタプルサイズを最初の引数として受け入れ、コードを第2引数として受け入れます。

**構文**

```sql
mortonDecode(tuple_size, code)
```

**パラメータ**
- `tuple_size`: 8を超えない整数値。
- `code`: [UInt64](../data-types/int-uint.md)コード。

**返される値**

- 指定されたサイズの[タプル](../data-types/tuple.md)。[UInt64](../data-types/int-uint.md)

**例**

クエリ:

```sql
SELECT mortonDecode(3, 53);
```

結果:

```response
["1","2","3"]
```

### 拡張モード {#expanded-mode-1}

範囲マスク（タプル）を最初の引数として受け入れ、コードを第2引数として受け入れます。
マスク内の各数は、それぞれの引数が左にシフトされるビットの数を設定します。これは、引数の範囲内で引数をスケーリングします。

範囲拡張は、非常に異なる範囲（または基数）を持つ引数に対して類似の分布が必要な場合に有益です。
たとえば： 'IPアドレス' (0...FFFFFFFF) と '国コード' (0...FF)。
エンコード関数と同様に、最大8つの数字に制限されています。

**例**

1つの引数のモートンコードは常にその引数自身（タプルとして）です。

クエリ:

```sql
SELECT mortonDecode(1, 1);
```

結果:

```response
["1"]
```

**例**

タプルを指定した1つの引数は、対応するように右シフトされます。

クエリ:

```sql
SELECT mortonDecode(tuple(2), 32768);
```

結果:

```response
["128"]
```

**例**

関数は、コードのカラムを第2引数として受け入れます：

最初にテーブルを作成し、データを挿入します。

クエリ:
```sql
create table morton_numbers(
    n1 UInt32,
    n2 UInt32,
    n3 UInt16,
    n4 UInt16,
    n5 UInt8,
    n6 UInt8,
    n7 UInt8,
    n8 UInt8
)
Engine=MergeTree()
ORDER BY n1 SETTINGS index_granularity = 8192, index_granularity_bytes = '10Mi';
insert into morton_numbers (*) values(1,2,3,4,5,6,7,8);
```
定数の代わりにカラム名を引数として`mortonDecode`に使用します。

クエリ:

```sql
select untuple(mortonDecode(8, mortonEncode(n1, n2, n3, n4, n5, n6, n7, n8))) from morton_numbers;
```

結果:

```response
1    2    3    4    5    6    7    8
```

## hilbertEncode {#hilbertencode}

符号なし整数のリストのヒルバート曲線のコードを計算します。

この関数には2つの動作モードがあります：
- シンプル
- 拡張

### シンプルモード {#simple-mode-2}

シンプル: 最大2つの符号なし整数を引数として受け入れ、UInt64コードを生成します。

**構文**

```sql
hilbertEncode(args)
```

**パラメータ**

- `args`: 最大2つの[符号なし整数](../../sql-reference/data-types/int-uint.md)または上述の型のカラム。

**返される値**

- UInt64コード

型: [UInt64](../../sql-reference/data-types/int-uint.md)

**例**

クエリ:

```sql
SELECT hilbertEncode(3, 4);
```
結果:

```response
31
```

### 拡張モード {#expanded-mode-2}

範囲マスク（[タプル](../../sql-reference/data-types/tuple.md)）を最初の引数として受け入れ、最大2つの[符号なし整数](../../sql-reference/data-types/int-uint.md)を他の引数として受け入れます。

マスク内の各数は、対応する引数が左にシフトされるビットの数を設定します。これにより、引数がその範囲内でスケーリングされます。

**構文**

```sql
hilbertEncode(range_mask, args)
```

**パラメータ**
- `range_mask`: （[タプル](../../sql-reference/data-types/tuple.md)）
- `args`: 最大2つの[符号なし整数](../../sql-reference/data-types/int-uint.md)または上述の型のカラム。

注意: `args`にカラムを使用する場合、提供される`range_mask`タプルは定数である必要があります。

**返される値**

- UInt64コード

型: [UInt64](../../sql-reference/data-types/int-uint.md)

**例**

範囲の拡張は、非常に異なる範囲（または基数）を持つ引数に対して類似の分布が必要な場合に有益です。
たとえば： 'IPアドレス' (0...FFFFFFFF) と '国コード' (0...FF)。

クエリ:

```sql
SELECT hilbertEncode((10,6), 1024, 16);
```

結果:

```response
4031541586602
```

注意: タプルのサイズは他の引数の数と等しくなければなりません。

**例**

単一の引数でタプルなしの場合、関数は引数自身をヒルバートインデックスとして返します。これは次元マッピングが必要ないためです。

クエリ:

```sql
SELECT hilbertEncode(1);
```

結果:

```response
1
```

**例**

タプルを指定した単一の引数もシフトされます。

クエリ:

```sql
SELECT hilbertEncode(tuple(2), 128);
```

結果:

```response
512
```

**例**

関数はカラムも引数として受け入れます。

クエリ:

最初にテーブルを作成し、データを挿入します。

```sql
create table hilbert_numbers(
    n1 UInt32,
    n2 UInt32
)
Engine=MergeTree()
ORDER BY n1 SETTINGS index_granularity = 8192, index_granularity_bytes = '10Mi';
insert into hilbert_numbers (*) values(1,2);
```
定数の代わりにカラム名を引数として`hilbertEncode`に使用します。

クエリ:

```sql
SELECT hilbertEncode(n1, n2) FROM hilbert_numbers;
```

結果:

```response
13
```

**実装の詳細**

ヒルバートコードに収めることができるビット情報は[UInt64](../../sql-reference/data-types/int-uint.md)に収められています。2つの引数の場合は、それぞれの範囲が最大2^32 (64/2) になります。すべてのオーバーフローはゼロに制限されます。

## hilbertDecode {#hilbertdecode}

ヒルバート曲線インデックスを符号なし整数のタプルにデコードし、マルチ次元空間の座標を表します。

`hilbertEncode`関数と同様に、この関数にも2つの動作モードがあります：
- シンプル
- 拡張

### シンプルモード {#simple-mode-3}

最大2つの符号なし整数を引数として受け入れ、UInt64コードを生成します。

**構文**

```sql
hilbertDecode(tuple_size, code)
```

**パラメータ**
- `tuple_size`: 2を超えない整数値。
- `code`: [UInt64](../../sql-reference/data-types/int-uint.md)コード。

**返される値**

- 指定されたサイズの[タプル](../../sql-reference/data-types/tuple.md)。

型: [UInt64](../../sql-reference/data-types/int-uint.md)

**例**

クエリ:

```sql
SELECT hilbertDecode(2, 31);
```

結果:

```response
["3", "4"]
```

### 拡張モード {#expanded-mode-3}

範囲マスク（タプル）を最初の引数として受け入れ、最大2つの符号なし整数を他の引数として受け入れます。
マスク内の各数は、対応する引数が左にシフトされるビットの数を設定します。これにより、引数がその範囲内でスケーリングされます。

範囲拡張は、非常に異なる範囲（または基数）を持つ引数に対して類似の分布が必要な場合に有益です。
たとえば： 'IPアドレス' (0...FFFFFFFF) と '国コード' (0...FF)。
エンコード関数と同様に、最大8つの数字に制限されています。

**例**

ヒルバートコードの1つの引数は常にその引数自身（タプルとして）です。

クエリ:

```sql
SELECT hilbertDecode(1, 1);
```

結果:

```response
["1"]
```

**例**

タプルを指定した単一の引数は、対応するように右シフトされます。

クエリ:

```sql
SELECT hilbertDecode(tuple(2), 32768);
```

結果:

```response
["128"]
```

**例**

関数はカラムも引数として受け入れます：

最初にテーブルを作成し、データを挿入します。

クエリ:
```sql
create table hilbert_numbers(
    n1 UInt32,
    n2 UInt32
)
Engine=MergeTree()
ORDER BY n1 SETTINGS index_granularity = 8192, index_granularity_bytes = '10Mi';
insert into hilbert_numbers (*) values(1,2);
```
カラム名を引数として`hilbertDecode`に使用します。

クエリ:

```sql
select untuple(hilbertDecode(2, hilbertEncode(n1, n2))) from hilbert_numbers;
```

結果:

```response
1    2
```
