---
slug: /sql-reference/functions/encoding-functions
sidebar_position: 65
sidebar_label: エンコーディング
---


# エンコーディング関数

## char {#char}

渡された引数の数としての長さを持つ文字列を返し、各バイトは対応する引数の値を持ちます。数値型の複数の引数を受け入れます。引数の値がUInt8データ型の範囲外の場合は、丸めやオーバーフローの可能性を伴いながらUInt8に変換されます。

**構文**

``` sql
char(number_1, [number_2, ..., number_n]);
```

**引数**

- `number_1, number_2, ..., number_n` — 整数として解釈される数値引数。型: [Int](../data-types/int-uint.md), [Float](../data-types/float.md)。

**戻り値**

- 指定されたバイトの文字列。[String](../data-types/string.md)。

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

対応するバイトを渡すことで任意のエンコーディングの文字列を構築できます。ここではUTF-8の例を示します:

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

関数は大文字の`A-F`を使用し、プレフィックス（`0x`など）やサフィックス（`h`など）を使用しません。

整数引数の場合、最上位から最下位へ（ビッグエンディアンまたは「人間が読みやすい」順序）でヒックスデジット（"nibbles"）が印刷されます。最上位のゼロでないバイトから始まり（先頭のゼロバイトは省略）、先頭の桁がゼロであっても各バイトの両方の桁を常に印刷します。

[Date](../data-types/date.md)および[DateTime](../data-types/datetime.md)型の値は、対応する整数（Dateの場合はエポックからの日数、DateTimeの場合はUnixタイムスタンプの値）としてフォーマットされます。

[String](../data-types/string.md)および[FixedString](../data-types/fixedstring.md)の場合、すべてのバイトは単純に2つの16進数としてエンコードされます。ゼロバイトは省略されません。

[Float](../data-types/float.md)および[Decimal](../data-types/decimal.md)型の値は、メモリ上の表現としてエンコードされます。リトルエンディアンアーキテクチャをサポートしているため、リトルエンディアンでエンコードされます。ゼロの先頭/末尾バイトは省略されません。

[UUID](../data-types/uuid.md)型の値はビッグエンディアン順序の文字列としてエンコードされます。

**引数**

- `arg` — 16進数に変換する値。型: [String](../data-types/string.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md), [Decimal](../data-types/decimal.md), [Date](../data-types/date.md)または[DateTime](../data-types/datetime.md)。

**戻り値**

- 引数の16進数表現を持つ文字列。[String](../data-types/string.md)。

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
SELECT lower(hex(toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0'))) as uuid_hex
```

結果:

``` text
┌─uuid_hex─────────────────────────┐
│ 61f0c4045cb311e7907ba6006ad3dba0 │
└──────────────────────────────────┘
```


## unhex {#unhex}

[hex](#hex)の逆の操作を行います。引数内の各16進数の桁を数値として解釈し、その数値が表すバイトに変換します。返り値はバイナリ文字列（BLOB）です。

結果を数値に変換したい場合は、[reverse](../../sql-reference/functions/string-functions.md#reverse)および[reinterpretAs&lt;Type&gt;](../../sql-reference/functions/type-conversion-functions.md#type-conversion-functions)関数を使用できます。

:::note
`unhex`が`clickhouse-client`内で呼び出されると、バイナリ文字列はUTF-8を使用して表示されます。
:::

エイリアス: `UNHEX`.

**構文**

``` sql
unhex(arg)
```

**引数**

- `arg` — 任意の数の16進数の桁を含む文字列。[String](../data-types/string.md), [FixedString](../data-types/fixedstring.md)。

大文字と小文字の`A-F`の両方をサポートします。16進数の桁の数は偶数である必要はありません。奇数の場合、最終桁は`00-0F`バイトの最下位半分として解釈されます。引数文字列に16進数以外の文字が含まれている場合、実装依存の結果が返されます（例外はスローされません）。数値引数に対しては、unhex()によるhex(N)の逆は行われません。

**戻り値**

- バイナリ文字列（BLOB）。[String](../data-types/string.md)。

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

引数のバイナリ表現を含む文字列を返します。

**構文**

``` sql
bin(arg)
```

エイリアス: `BIN`。

整数引数の場合、最上位から最下位へ（ビッグエンディアンまたは「人間が読みやすい」順序）でビンデジットが印刷されます。最上位のゼロでないバイトから始まり（先頭のゼロバイトは省略）、先頭の桁がゼロの場合でも各バイトの8桁を常に印刷します。

[Date](../data-types/date.md)および[DateTime](../data-types/datetime.md)型の値は、対応する整数（`Date`の場合はエポックからの日数、`DateTime`の場合はUnixタイムスタンプの値）としてフォーマットされます。

[String](../data-types/string.md)および[FixedString](../data-types/fixedstring.md)の場合、すべてのバイトは単純に8つのバイナリ数としてエンコードされます。ゼロバイトは省略されません。

[Float](../data-types/float.md)および[Decimal](../data-types/decimal.md)型の値は、メモリ上での表現としてエンコードされます。リトルエンディアンアーキテクチャをサポートしているため、リトルエンディアンでエンコードされます。ゼロの先頭/末尾バイトは省略されません。

[UUID](../data-types/uuid.md)型の値はビッグエンディアン順序の文字列としてエンコードされます。

**引数**

- `arg` — バイナリに変換する値。[String](../data-types/string.md), [FixedString](../data-types/fixedstring.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md), [Decimal](../data-types/decimal.md), [Date](../data-types/date.md),または[DateTime](../data-types/datetime.md)。

**戻り値**

- 引数のバイナリ表現を持つ文字列。[String](../data-types/string.md)。

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
SELECT bin(toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0')) as bin_uuid
```

結果:

``` text
┌─bin_uuid─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 01100001111100001100010000000100010111001011001100010001111001111001000001111011101001100000000001101010110100111101101110100000 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## unbin {#unbin}

引数内の各バイナリデジットのペアを数値として解釈し、その数値が表すバイトに変換します。この関数は[bin](#bin)の逆の操作を行います。

**構文**

``` sql
unbin(arg)
```

エイリアス: `UNBIN`.

数値引数については`unbin()`は`bin()`の逆を返しません。結果を数値に変換したい場合は、[reverse](../../sql-reference/functions/string-functions.md#reverse)および[reinterpretAs&lt;Type&gt;](../../sql-reference/functions/type-conversion-functions.md#reinterpretasuint8163264)関数を使用できます。

:::note
`unbin`が`clickhouse-client`内で呼び出されると、バイナリ文字列はUTF-8を使用して表示されます。
:::

バイナリデジット`0`および`1`をサポートします。バイナリデジットの数は8の倍数である必要はありません。引数文字列にバイナリデジット以外のものが含まれている場合、実装依存の結果が返されます（例外はスローされません）。

**引数**

- `arg` — 任意の数のバイナリデジットを含む文字列。[String](../data-types/string.md)。

**戻り値**

- バイナリ文字列（BLOB）。[String](../data-types/string.md)。

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

整数を受け取ります。合計するとソース番号になる2の累乗のリストを含む文字列を返します。テキスト形式でカンマ区切りで、昇順で並べられます。

## bitmaskToArray(num) {#bitmasktoarraynum}

整数を受け取ります。合計するとソース番号になる2の累乗のリストを含むUInt64数の配列を返します。配列内の数字は昇順で並べられます。

## bitPositionsToArray(num) {#bitpositionstoarraynum}

整数を受け取りunsigned整数に変換します。引数のビットが`1`である位置のリストを含む`UInt64`数の配列を返します。

**構文**

```sql
bitPositionsToArray(arg)
```

**引数**

- `arg` — 整数値。[Int/UInt](../data-types/int-uint.md)。

**戻り値**

- ビットの位置のリストを含む配列、昇順。[Array](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

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

関数には2つの動作モードがあります:
- シンプル
- 拡張

### シンプルモード {#simple-mode}

最大8つの符号なし整数を引数として受け取り、UInt64コードを生成します。

**構文**

```sql
mortonEncode(args)
```

**パラメータ**

- `args`: 最大8つの[符号なし整数](../data-types/int-uint.md)または前述の型のカラム。

**戻り値**

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

範囲マスク（[tuple](../data-types/tuple.md)）を最初の引数として受け取り、最大8つの[符号なし整数](../data-types/int-uint.md)を他の引数として受け取ります。

マスク内の各数値が範囲拡張の量を構成します:<br/>
1 - 拡張なし<br/>
2 - 2倍の拡張<br/>
3 - 3倍の拡張<br/>
...<br/>
最大8倍の拡張。<br/>

**構文**

```sql
mortonEncode(range_mask, args)
```

**パラメータ**
- `range_mask`: 1-8。
- `args`: 最大8つの[符号なし整数](../data-types/int-uint.md)または前述の型のカラム。

注意: `args`にカラムを使用する場合、提供される`range_mask`タプルは依然として定数でなければなりません。

**戻り値**

- UInt64コード。[UInt64](../data-types/int-uint.md)


**例**

範囲拡張は、異なる範囲（または基数）を持つ引数に対して類似の分布が必要な場合に有益です。
例えば: 'IPアドレス'（0...FFFFFFFF）および '国コード'（0...FF）。

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

1つの引数のモートンエンコーディングは常にその引数自体です:

クエリ:

```sql
SELECT mortonEncode(1);
```

結果:

```response
1
```

**例**

1つの引数も拡張することができます:

クエリ:

```sql
SELECT mortonEncode(tuple(2), 128);
```

結果:

```response
32768
```

**例**

関数内でカラム名を使用することもできます。

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
定数の代わりにカラム名を使用して`mortonEncode`の引数とします。

クエリ:

```sql
SELECT mortonEncode(n1, n2, n3, n4, n5, n6, n7, n8) FROM morton_numbers;
```

結果:

```response
2155374165
```

**実装の詳細**

ご注意ください。モートンコードにフィットできるビット数は[UInt64](../data-types/int-uint.md)が持つものに限定されます。2つの引数はそれぞれ最大2^32（64/2）の範囲を持ち、3つの引数はそれぞれ最大2^21（64/3）の範囲を持ちます。すべてのオーバーフローはゼロに制限されます。

## mortonDecode {#mortondecode}

モートンエンコーディング（ZCurve）をデコードし、対応する符号なし整数のタプルに戻します。

`mortonEncode`関数と同様に、この関数には2つの動作モードがあります:
- シンプル
- 拡張

### シンプルモード {#simple-mode-1}

結果のタプルサイズを最初の引数として受け取り、コードを第二引数として受け取ります。

**構文**

```sql
mortonDecode(tuple_size, code)
```

**パラメータ**
- `tuple_size`: 8を超えない整数値。
- `code`: [UInt64](../data-types/int-uint.md)コード。

**戻り値**

- 指定されたサイズの[tuple](../data-types/tuple.md)。[UInt64](../data-types/int-uint.md)

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

範囲マスク（タプル）を最初の引数として受け取り、コードを第二引数として受け取ります。
マスク内の各数値が、対応する引数が左にシフトされるビット数を指定します。<br/>
1 - 縮小なし<br/>
2 - 2倍の縮小<br/>
3 - 3倍の縮小<br/>
...<br/>
最大8倍の縮小。<br/>

範囲拡張は、異なる範囲（または基数）を持つ引数に対して類似の分布が必要な場合に有益です。
例えば: 'IPアドレス'（0...FFFFFFFF）および '国コード'（0...FF）。
エンコード関数と同様に、これは最大8つの数に制限されます。

**例**

1つの引数のヒルバートコードは常にその引数自体です（タプルとして）。

クエリ:

```sql
SELECT mortonDecode(1, 1);
```

結果:

```response
["1"]
```

**例**

タプルを指定した単一引数は、対応するビットシフトによって右シフトされます。

クエリ:

```sql
SELECT mortonDecode(tuple(2), 32768);
```

結果:

```response
["128"]
```

**例**

この関数は、コードのカラムを第二引数として受け入れることができます。

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
定数の代わりにカラム名を使用して`mortonDecode`の引数とします。

クエリ:

```sql
select untuple(mortonDecode(8, mortonEncode(n1, n2, n3, n4, n5, n6, n7, n8))) from morton_numbers;
```

結果:

```response
1	2	3	4	5	6	7	8
```

## hilbertEncode {#hilbertencode}

符号なし整数のリストに対してヒルバートカーブのコードを計算します。

関数には2つの動作モードがあります:
- シンプル
- 拡張

### シンプルモード {#simple-mode-2}

最大2つの符号なし整数を引数として受け取り、UInt64コードを生成します。

**構文**

```sql
hilbertEncode(args)
```

**パラメータ**

- `args`: 最大2つの[符号なし整数](../../sql-reference/data-types/int-uint.md)または前述の型のカラム。

**戻り値**

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

範囲マスク（[tuple](../../sql-reference/data-types/tuple.md)）を最初の引数として受け取り、最大2つの[符号なし整数](../../sql-reference/data-types/int-uint.md)を他の引数として受け取ります。

マスク内の各数値が、対応する引数が左にシフトされるビット数を構成します。

**構文**

```sql
hilbertEncode(range_mask, args)
```

**パラメータ**
- `range_mask`: （[tuple](../../sql-reference/data-types/tuple.md)）
- `args`: 最大2つの[符号なし整数](../../sql-reference/data-types/int-uint.md)または前述の型のカラム。

注意: `args`にカラムを使用する場合、提供される`range_mask`タプルは依然として定数でなければなりません。

**戻り値**

- UInt64コード

型: [UInt64](../../sql-reference/data-types/int-uint.md)


**例**

範囲拡張は、異なる範囲（または基数）を持つ引数に対して類似の分布が必要な場合に有益です。
例えば: 'IPアドレス'（0...FFFFFFFF）および '国コード'（0...FF）。

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

単一引数では、タプルなしでの処理を行った場合、関数は引数自体をヒルバートインデックスとして返します。

クエリ:

```sql
SELECT hilbertEncode(1);
```

結果:

```response
1
```

**例**

単一引数もタプルを指定した場合、指定されたビット数だけ左にシフトされます。

クエリ:

```sql
SELECT hilbertEncode(tuple(2), 128);
```

結果:

```response
512
```

**例**

この関数もカラムを引数として受け入れます：

まずテーブルを作成し、データを挿入します。

```sql
create table hilbert_numbers(
    n1 UInt32,
    n2 UInt32
)
Engine=MergeTree()
ORDER BY n1 SETTINGS index_granularity = 8192, index_granularity_bytes = '10Mi';
insert into hilbert_numbers (*) values(1,2);
```
定数の代わりにカラム名を使用して`hilbertEncode`に対する引数とします。

クエリ:

```sql
SELECT hilbertEncode(n1, n2) FROM hilbert_numbers;
```

結果:

```response
13
```

**実装の詳細**

ご注意ください。ヒルバートコードにフィットできるビット数は[UInt64](../../sql-reference/data-types/int-uint.md)が持つものに限定されます。2つの引数はそれぞれ最大2^32（64/2）の範囲を持ち、すべてのオーバーフローはゼロに制限されます。

## hilbertDecode {#hilbertdecode}

ヒルバートカーブのインデックスをデコードし、マルチ次元空間内の座標を表す符号なし整数のタプルに戻します。

`hilbertEncode`関数と同様に、この関数には2つの動作モードがあります:
- シンプル
- 拡張

### シンプルモード {#simple-mode-3}

最大2つの符号なし整数を引数として受け取り、UInt64コードを生成します。

**構文**

```sql
hilbertDecode(tuple_size, code)
```

**パラメータ**
- `tuple_size`: 2を超えない整数値。
- `code`: [UInt64](../../sql-reference/data-types/int-uint.md)コード。

**戻り値**

- 指定されたサイズの[tuple](../../sql-reference/data-types/tuple.md)。

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

範囲マスク（タプル）を最初の引数として受け取り、最大2つの符号なし整数を他の引数として受け取ります。
マスク内の各数値が、対応する引数が左にシフトされるビット数を構成します。

範囲拡張は、異なる範囲（または基数）を持つ引数に対して類似の分布が必要な場合に有益です。
例えば: 'IPアドレス'（0...FFFFFFFF）および '国コード'（0...FF）。
エンコード関数と同様に、これは最大8つの数に制限されます。

**例**

ヒルバートコードとして1つの引数を提供した場合、その引数自体がタプルとして返されます。

クエリ:

```sql
SELECT hilbertDecode(1, 1);
```

結果:

```response
["1"]
```

**例**

1つの引数を指定し、タプル内の指定されたビットシフトを含む場合、その引数は指定されたビット数だけ右シフトされます。

クエリ:

```sql
SELECT hilbertDecode(tuple(2), 32768);
```

結果:

```response
["128"]
```

**例**

関数は、コードのカラムを第二引数として受け取ることもできます。

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
定数の代わりにカラム名を使用して`hilbertDecode`の引数とします。

クエリ:

```sql
select untuple(hilbertDecode(2, hilbertEncode(n1, n2))) from hilbert_numbers;
```

結果:

```response
1	2
```
