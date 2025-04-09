---
slug: '/sql-reference/functions/encoding-functions'
sidebar_position: 65
sidebar_label: 'エンコーディング'
---


# エンコーディング関数

## char {#char}

渡された引数の数と同じ長さの文字列を返し、それぞれのバイトは対応する引数の値を持ちます。複数の数値型の引数を受け取ります。引数の値がUInt8データ型の範囲外の場合は、丸めやオーバーフローの可能性があるUInt8に変換されます。

**構文**

``` sql
char(number_1, [number_2, ..., number_n]);
```

**引数**

- `number_1, number_2, ..., number_n` — 整数として解釈される数値型の引数。タイプ: [Int](../data-types/int-uint.md), [Float](../data-types/float.md)。

**返される値**

- 指定されたバイトの文字列。 [String](../data-types/string.md)。

**例**

クエリ:

``` sql
SELECT char(104.1, 101, 108.9, 108.9, 111) AS hello;
```

結果:

``` text
┌─hello─┐
│ hello │
└───────┘
```

対応するバイトを渡すことで任意のエンコーディングの文字列を構築できます。以下はUTF-8の例です。

クエリ:

``` sql
SELECT char(0xD0, 0xBF, 0xD1, 0x80, 0xD0, 0xB8, 0xD0, 0xB2, 0xD0, 0xB5, 0xD1, 0x82) AS hello;
```

結果:

``` text
┌─hello──┐
│ привет │
└────────┘
```

クエリ:

``` sql
SELECT char(0xE4, 0xBD, 0xA0, 0xE5, 0xA5, 0xBD) AS hello;
```

結果:

``` text
┌─hello─┐
│ 你好  │
└───────┘
```

## hex {#hex}

引数の16進数表現を含む文字列を返します。

エイリアス: `HEX`。

**構文**

``` sql
hex(arg)
```

この関数は大文字の `A-F` を使用し、プレフィックス（例えば `0x`）やサフィックス（例えば `h`）は使いません。

整数引数に対しては、最も重要な桁から最も重要でない桁（ビッグエンディアンまたは「人間可読」順）に向かって16進数の数字（「ニブル」）を表示します。最も重要な非ゼロバイトから始まり（先頭のゼロバイトは省略されます）ますが、常に各バイトの両方の数字を表示します。

[Date](../data-types/date.md) および [DateTime](../data-types/datetime.md) 型の値は、対応する整数としてフォーマットされます（Dateの場合のエポックからの日数およびDateTimeの場合のUnixタイムスタンプの値）。

[String](../data-types/string.md) および [FixedString](../data-types/fixedstring.md) の場合、すべてのバイトは単に2つの16進数としてエンコードされます。ゼロバイトは省略されません。

[Float](../data-types/float.md) および [Decimal](../data-types/decimal.md) 型の値は、メモリ内の表現としてエンコードされます。リトルエンディアンアーキテクチャをサポートしているため、リトルエンディアンでエンコードされます。先頭/末尾のゼロバイトは省略されません。

[UUID](../data-types/uuid.md) 型の値はビッグエンディアン順で文字列としてエンコードされます。

**引数**

- `arg` — 16進数に変換する値。タイプ: [String](../data-types/string.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md), [Decimal](../data-types/decimal.md), [Date](../data-types/date.md) または [DateTime](../data-types/datetime.md)。

**返される値**

- 引数の16進数表現を持つ文字列。 [String](../data-types/string.md)。

**例**

クエリ:

``` sql
SELECT hex(1);
```

結果:

``` text
01
```

クエリ:

``` sql
SELECT hex(toFloat32(number)) AS hex_presentation FROM numbers(15, 2);
```

結果:

``` text
┌─hex_presentation─┐
│ 00007041         │
│ 00008041         │
└──────────────────┘
```

クエリ:

``` sql
SELECT hex(toFloat64(number)) AS hex_presentation FROM numbers(15, 2);
```

結果:

``` text
┌─hex_presentation─┐
│ 0000000000002E40 │
│ 0000000000003040 │
└──────────────────┘
```

クエリ:

``` sql
SELECT lower(hex(toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0'))) as uuid_hex;
```

結果:

``` text
┌─uuid_hex─────────────────────────┐
│ 61f0c4045cb311e7907ba6006ad3dba0 │
└──────────────────────────────────┘
```

## unhex {#unhex}

[hex](#hex) の逆の操作を行います。引数内の各ペアの16進数の桁を数値として解釈し、数値で表されるバイトに変換します。返される値はバイナリ文字列（BLOB）です。

結果を数値に変換したい場合は、[reverse](../../sql-reference/functions/string-functions.md#reverse) および [reinterpretAs&lt;Type&gt;](/sql-reference/functions/type-conversion-functions) 関数を使用できます。

:::note
`unhex`が `clickhouse-client` 内から呼び出されると、バイナリ文字列はUTF-8を使用して表示されます。
:::

エイリアス: `UNHEX`。

**構文**

``` sql
unhex(arg)
```

**引数**

- `arg` — 任意の数の16進数の桁を含む文字列。 [String](../data-types/string.md), [FixedString](../data-types/fixedstring.md)。

大文字と小文字の `A-F` の両方をサポートします。16進数の桁の数は偶数である必要はありません。奇数の場合、最後の桁は `00-0F` バイトの最も重要度の低い半分として解釈されます。引数の文字列に16進数の桁以外のものが含まれている場合は、いくつかの実装依存の結果が返されます（例外はスローされません）。数値引数に対して、unhex() による hex(N) の逆は実行されません。

**返される値**

- バイナリ文字列（BLOB）。 [String](../data-types/string.md)。

**例**

クエリ:
``` sql
SELECT unhex('303132'), UNHEX('4D7953514C');
```

結果:
``` text
┌─unhex('303132')─┬─unhex('4D7953514C')─┐
│ 012             │ MySQL               │
└─────────────────┴─────────────────────┘
```

クエリ:

``` sql
SELECT reinterpretAsUInt64(reverse(unhex('FFF'))) AS num;
```

結果:

``` text
┌──num─┐
│ 4095 │
└──────┘
```

## bin {#bin}

引数の2進数表現を含む文字列を返します。

**構文**

``` sql
bin(arg)
```

エイリアス: `BIN`。

整数引数については、最も重要な桁から最も重要でない桁（ビッグエンディアンまたは「人間可読」順）に向かって2進数の数字を印刷します。最も重要な非ゼロバイトから始まります（先頭のゼロバイトは省略されます）が、先頭の数字がゼロの場合でも各バイトの8桁は常に表示されます。

[Date](../data-types/date.md) および [DateTime](../data-types/datetime.md) 型の値は、対応する整数としてフォーマットされます（`Date`の場合のエポックからの日数および`DateTime`の場合のUnixタイムスタンプの値）。

[String](../data-types/string.md) および [FixedString](../data-types/fixedstring.md) の場合、すべてのバイトは単に8の2進数としてエンコードされます。ゼロバイトは省略されません。

[Float](../data-types/float.md) および [Decimal](../data-types/decimal.md) 型の値は、メモリ内の表現としてエンコードされます。リトルエンディアンアーキテクチャをサポートしているため、リトルエンディアンでエンコードされます。先頭/末尾のゼロバイトは省略されません。

[UUID](../data-types/uuid.md) 型の値はビッグエンディアン順で文字列としてエンコードされます。

**引数**

- `arg` — バイナリに変換する値。 [String](../data-types/string.md), [FixedString](../data-types/fixedstring.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md), [Decimal](../data-types/decimal.md), [Date](../data-types/date.md) または [DateTime](../data-types/datetime.md)。

**返される値**

- 引数の2進数表現を持つ文字列。 [String](../data-types/string.md)。

**例**

クエリ:

``` sql
SELECT bin(14);
```

結果:

``` text
┌─bin(14)──┐
│ 00001110 │
└──────────┘
```

クエリ:

``` sql
SELECT bin(toFloat32(number)) AS bin_presentation FROM numbers(15, 2);
```

結果:

``` text
┌─bin_presentation─────────────────┐
│ 00000000000000000111000001000001 │
│ 00000000000000001000000001000001 │
└──────────────────────────────────┘
```

クエリ:

``` sql
SELECT bin(toFloat64(number)) AS bin_presentation FROM numbers(15, 2);
```

結果:

``` text
┌─bin_presentation─────────────────────────────────────────────────┐
│ 0000000000000000000000000000000000000000000000000010111001000000 │
│ 0000000000000000000000000000000000000000000000000011000001000000 │
└──────────────────────────────────────────────────────────────────┘
```

クエリ:

``` sql
SELECT bin(toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0')) as bin_uuid;
```

結果:

``` text
┌─bin_uuid─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 01100001111100001100010000000100010111001011001100010001111001111001000001111011101001100000000001101010110100111101101110100000 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## unbin {#unbin}

引数内の各ペアの2進数の桁を数値として解釈し、それを数値で表されるバイトに変換します。この関数は[bin](#bin)の逆の操作を実行します。

**構文**

``` sql
unbin(arg)
```

エイリアス: `UNBIN`。

数値引数に対して `unbin()` は `bin()` の逆を返しません。結果を数値に変換したい場合は、[reverse](../../sql-reference/functions/string-functions.md#reverse) および [reinterpretAs&lt;Type&gt;](/sql-reference/functions/type-conversion-functions#reinterpret) 関数を使用できます。

:::note
`unbin` が `clickhouse-client` 内から呼び出されると、バイナリ文字列はUTF-8を使用して表示されます。
:::

2進数の桁 `0` と `1` をサポートします。2進数の桁の数は8の倍数である必要はありません。引数の文字列に2進数以外の桁が含まれている場合は、いくつかの実装依存の結果が返されます（例外はスローされません）。

**引数**

- `arg` — 任意の数の2進数の桁を含む文字列。 [String](../data-types/string.md)。

**返される値**

- バイナリ文字列（BLOB）。 [String](../data-types/string.md)。

**例**

クエリ:

``` sql
SELECT UNBIN('001100000011000100110010'), UNBIN('0100110101111001010100110101000101001100');
```

結果:

``` text
┌─unbin('001100000011000100110010')─┬─unbin('0100110101111001010100110101000101001100')─┐
│ 012                               │ MySQL                                             │
└───────────────────────────────────┴───────────────────────────────────────────────────┘
```

クエリ:

``` sql
SELECT reinterpretAsUInt64(reverse(unbin('1110'))) AS num;
```

結果:

``` text
┌─num─┐
│  14 │
└─────┘
```

## bitmaskToList(num) {#bitmasktolistnum}

整数を受け入れます。合計がソース値になる二の冪のリストを含む文字列を返します。それらはテキスト形式でコンマ区切り（スペースなし）で、昇順になります。

## bitmaskToArray(num) {#bitmasktoarraynum}

整数を受け入れます。合計がソース値になる二の冪のリストを含む`UInt64`の配列を返します。配列内の数値は昇順です。

## bitPositionsToArray(num) {#bitpositionstoarraynum}

整数を受け入れ、符号なし整数に変換します。引数のビットの位置のリストを持つ`UInt64`配列を返します。値が `1` に等しいビットの位置を昇順で取得します。

**構文**

```sql
bitPositionsToArray(arg)
```

**引数**

- `arg` — 整数値。 [Int/UInt](../data-types/int-uint.md)。

**返される値**

- `1` に等しいビットの位置のリストを含む配列、昇順。 [Array](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**例**

クエリ:

``` sql
SELECT bitPositionsToArray(toInt8(1)) AS bit_positions;
```

結果:

``` text
┌─bit_positions─┐
│ [0]           │
└───────────────┘
```

クエリ:

``` sql
SELECT bitPositionsToArray(toInt8(-1)) AS bit_positions;
```

結果:

``` text
┌─bit_positions─────┐
│ [0,1,2,3,4,5,6,7] │
└───────────────────┘
```

## mortonEncode {#mortonencode}

符号なし整数のリストに対してモートンエンコーディング（ZCurve）を計算します。

この関数には次の2つの動作モードがあります:
- シンプルモード
- 拡張モード

### シンプルモード {#simple-mode}

最大8つの符号なし整数を引数として受け取り、`UInt64` コードを生成します。

**構文**

```sql
mortonEncode(args)
```

**パラメータ**

- `args`: 最大8つの [符号なし整数](../data-types/int-uint.md) または先述のタイプのカラム。

**返される値**

- `UInt64` コード。 [UInt64](../data-types/int-uint.md)

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

範囲マスク（[tuple](../data-types/tuple.md)）を最初の引数として受け取り、最大8つの [符号なし整数](../data-types/int-uint.md) を他の引数として受け取ります。

マスク内の各数値は範囲の拡張量を設定します:<br/>
1 - 拡張なし<br/>
2 - 2倍の拡張<br/>
3 - 3倍の拡張<br/>
...<br/>
最大8倍に拡張できます。<br/>

**構文**

```sql
mortonEncode(range_mask, args)
```

**パラメータ**
- `range_mask`: 1-8の整数。
- `args`: 最大8つの [符号なし整数](../data-types/int-uint.md) または先述のタイプのカラム。

注意: `args`にカラムを使用する際に、提供される`range_mask`タプルは定数である必要があります。

**返される値**

- `UInt64` コード。 [UInt64](../data-types/int-uint.md)


**例**

範囲の拡張は、非常に異なる範囲（またはカーディナリティ）を持つ引数に対して類似の分布が必要な場合に有効です。
例えば: 'IPアドレス' (0...FFFFFFFF) と '国コード' (0...FF)。

クエリ:

```sql
SELECT mortonEncode((1,2), 1024, 16);
```

結果:

```response
1572864
```

注意: タプルのサイズは他の引数の数と等しくする必要があります。

**例**

1つの引数に対するモートンエンコーディングは常にその引数自身です:

クエリ:

```sql
SELECT mortonEncode(1);
```

結果:

```response
1
```

**例**

1つの引数を拡張することも可能です:

クエリ:

```sql
SELECT mortonEncode(tuple(2), 128);
```

結果:

```response
32768
```

**例**

カラム名を関数に使用することもできます。

まず、テーブルを作成してデータを挿入します。

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
定数の代わりにカラム名を `mortonEncode` の引数として使用します。

クエリ:

```sql
SELECT mortonEncode(n1, n2, n3, n4, n5, n6, n7, n8) FROM morton_numbers;
```

結果:

```response
2155374165
```

**実装の詳細**

モートンコードに罰することができる情報は、[UInt64](../data-types/int-uint.md) が持つビット数に制限されています。2つの引数は最大でそれぞれ2^32 (64/2) の範囲内になります。3つの引数はそれぞれ最大で2^21 (64/3) の範囲になります。すべてのオーバーフローはゼロに切り詰められます。

## mortonDecode {#mortondecode}

モートンエンコーディング (ZCurve) をデコードして、対応する符号なし整数のタプルに戻します。

`mortonEncode` 関数と同様に、この関数にも2つの動作モードがあります:
- シンプルモード
- 拡張モード

### シンプルモード {#simple-mode-1}

結果のタプルサイズを最初の引数として受け取り、コードを第2引数として受け取ります。

**構文**

```sql
mortonDecode(tuple_size, code)
```

**パラメータ**
- `tuple_size`: 8を超えない整数値。
- `code`: [UInt64](../data-types/int-uint.md) コード。

**返される値**

- 指定したサイズの [tuple](../data-types/tuple.md)。 [UInt64](../data-types/int-uint.md)

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

範囲マスク（タプル）を最初の引数として受け取り、コードを第2引数として受け取ります。
マスク内の各数値は範囲の縮小量を設定します:<br/>
1 - 縮小なし<br/>
2 - 2倍の縮小<br/>
3 - 3倍の縮小<br/>
...<br/>
最大で8倍の縮小が可能です。<br/>

範囲の拡張は、非常に異なる範囲（またはカーディナリティ）を持つ引数に対して類似の分布が必要な場合に有効です。
例えば: 'IPアドレス' (0...FFFFFFFF) と '国コード' (0...FF)。
エンコード関数同様、これは最大8つの数値に制限されます。

**例**

1つの引数のモートンコードは常にその引数自身です（タプルとして）。

クエリ:

```sql
SELECT mortonDecode(1, 1);
```

結果:

```response
["1"]
```

**例**

タプルでビットシフトを指定された単一引数は、適切に右シフトされます。

クエリ:

```sql
SELECT mortonDecode(tuple(2), 32768);
```

結果:

```response
["128"]
```

**例**

この関数は、コードのカラムを第2引数として受け取ります。

まず、テーブルを作成して挿入データします。

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
定数の代わりにカラム名を `mortonDecode` の引数として使用します。

クエリ:

```sql
select untuple(mortonDecode(8, mortonEncode(n1, n2, n3, n4, n5, n6, n7, n8))) from morton_numbers;
```

結果:

```response
1	2	3	4	5	6	7	8
```

## hilbertEncode {#hilbertencode}

符号なし整数のリストに対してヒルベルト曲線のコードを計算します。

この関数には次の2つの動作モードがあります:
- シンプル
- 拡張

### シンプルモード {#simple-mode-2}

シンプル: 最大2つの符号なし整数を引数として受け取り、`UInt64` コードを生成します。

**構文**

```sql
hilbertEncode(args)
```

**パラメータ**

- `args`: 最大2つの [符号なし整数](../../sql-reference/data-types/int-uint.md) または先述のタイプのカラム。

**返される値**

- `UInt64` コード

タイプ: [UInt64](../../sql-reference/data-types/int-uint.md)

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

範囲マスク（[tuple](../../sql-reference/data-types/tuple.md)）を最初の引数として受け取り、最大2つの [符号なし整数](../../sql-reference/data-types/int-uint.md) を他の引数として受け取ります。

マスク内の各数値は、対応する引数が左にシフトされるビット数を設定し、引数をその範囲内で拡大します。

**構文**

```sql
hilbertEncode(range_mask, args)
```

**パラメータ**
- `range_mask`: （[tuple](../../sql-reference/data-types/tuple.md)）
- `args`: 最大2つの [符号なし整数](../../sql-reference/data-types/int-uint.md) または先述のタイプのカラム。

注意: `args`にカラムを使用する際に、提供される`range_mask`タプルは定数である必要があります。

**返される値**

- `UInt64` コード

タイプ: [UInt64](../../sql-reference/data-types/int-uint.md)


**例**

範囲の拡張は、非常に異なる範囲（またはカーディナリティ）を持つ引数に対して類似の分布が必要な場合に有効です。
例えば: 'IPアドレス' (0...FFFFFFFF) と '国コード' (0...FF)。

クエリ:

```sql
SELECT hilbertEncode((10,6), 1024, 16);
```

結果:

```response
4031541586602
```

注意: タプルのサイズは他の引数の数と等しくする必要があります。

**例**

単一の引数をタプルなしで提供した場合、この関数はその引数自身をヒルベルトインデックスとして返します。マッピングが不要です。

クエリ:

```sql
SELECT hilbertEncode(1);
```

結果:

```response
1
```

**例**

もし単一の引数がビットシフトを指定するタプルと共に提供された場合、関数は指定されたビット数だけ引数を左にシフトします。

クエリ:

```sql
SELECT hilbertEncode(tuple(2), 128);
```

結果:

```response
512
```

**例**

この関数はカラムを引数として受け取ることもできます：

まずテーブルを作成してデータを挿入します。

```sql
create table hilbert_numbers(
    n1 UInt32,
    n2 UInt32
)
Engine=MergeTree()
ORDER BY n1 SETTINGS index_granularity = 8192, index_granularity_bytes = '10Mi';
insert into hilbert_numbers (*) values(1,2);
```
定数の代わりにカラム名を `hilbertEncode` の引数として使用します。

クエリ:

```sql
SELECT hilbertEncode(n1, n2) FROM hilbert_numbers;
```

結果:

```response
13
```

**実装の詳細**

ヒルベルトコードに詰め込むことができる情報は、[UInt64](../../sql-reference/data-types/int-uint.md) が持つビット数で制限されます。2つの引数はそれぞれ最大2^32 (64/2) の範囲内になります。すべてのオーバーフローはゼロに切り詰められます。

## hilbertDecode {#hilbertdecode}

ヒルベルト曲線インデックスをデコードして、座標を表す符号なし整数のタプルに戻します。

`hilbertEncode` 関数と同様に、この関数にも2つの動作モードがあります:
- シンプルモード
- 拡張モード

### シンプルモード {#simple-mode-3}

最大2つの符号なし整数を引数として受け取り、`UInt64` コードを生成します。

**構文**

```sql
hilbertDecode(tuple_size, code)
```

**パラメータ**
- `tuple_size`: 2を超えない整数値。
- `code`: [UInt64](../../sql-reference/data-types/int-uint.md) コード。

**返される値**

- 指定したサイズの [tuple](../../sql-reference/data-types/tuple.md)。

タイプ: [UInt64](../../sql-reference/data-types/int-uint.md)

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

範囲マスク（タプル）を最初の引数として受け取り、最大2つの符号なし整数を他の引数として受け取ります。
マスク内の各数値は、対応する引数が左にシフトされるビット数を設定し、引数をその範囲内で拡大します。

範囲の拡張は、非常に異なる範囲（またはカーディナリティ）を持つ引数に対して類似の分布が必要な場合に有効です。
例えば: 'IPアドレス' (0...FFFFFFFF) と '国コード' (0...FF)。
エンコード関数同様、これは最大8つの数値に制限されます。

**例**

ヒルベルトコードは単一引数には常にその引数自身（タプルとして）です。

クエリ:

```sql
SELECT hilbertDecode(1, 1);
```

結果:

```response
["1"]
```

**例**

タプルでビットシフトを指定された単一引数は、適切に右シフトされます。

クエリ:

```sql
SELECT hilbertDecode(tuple(2), 32768);
```

結果:

```response
["128"]
```

**例**

この関数は、コードのカラムを第2引数として受け取ります。

まず、テーブルを作成してデータを挿入します。

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
定数の代わりにカラム名を `hilbertDecode` の引数として使用します。

クエリ:

```sql
select untuple(hilbertDecode(2, hilbertEncode(n1, n2))) from hilbert_numbers;
```

結果:

```response
1	2
```
