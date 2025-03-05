---
slug: /sql-reference/functions/hash-functions
sidebar_position: 85
sidebar_label: Hash
---

# ハッシュ関数

ハッシュ関数は、要素の決定論的擬似ランダムシャッフルに使用できます。

Simhashは、近い（類似の）引数に対して近似したハッシュ値を返すハッシュ関数です。
## halfMD5 {#halfmd5}

[解釈する](../functions/type-conversion-functions.md/#type_conversion_functions-reinterpretAsString)すべての入力パラメータを文字列として、各文字列の[MD5](https://en.wikipedia.org/wiki/MD5)ハッシュ値を計算します。その後、ハッシュを結合し、結果の文字列のハッシュの最初の8バイトを取得し、それをビッグエンディアンのバイトオーダーで`UInt64`として解釈します。

```sql
halfMD5(par1, ...)
```

この関数は比較的遅く（プロセッサコアあたり5百万の短い文字列）、[sipHash64](#siphash64)関数の使用を検討してください。

**引数**

この関数は、可変数の入力パラメータを受け取ります。引数は、[サポートされているデータ型](../data-types/index.md)のいずれでもかまいません。いくつかのデータ型の場合、引数の型が異なっていても、同じ値に対して計算されたハッシュ関数の値は同じになることがあります（異なるサイズの整数、同じデータを持つ名前付きおよび名前のない`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型）。

**戻り値**

[UInt64](../data-types/int-uint.md)データ型のハッシュ値。

**例**

```sql
SELECT halfMD5(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS halfMD5hash, toTypeName(halfMD5hash) AS type;
```

```response
┌────────halfMD5hash─┬─type───┐
│ 186182704141653334 │ UInt64 │
└────────────────────┴────────┘
```
## MD4 {#md4}

文字列からMD4を計算し、結果のバイトのセットをFixedString(16)として返します。
## MD5 {#md5}

文字列からMD5を計算し、結果のバイトのセットをFixedString(16)として返します。
特にMD5が必要ないが、適切なクリプトグラフィック128ビットハッシュが必要な場合は、代わりに'sipHash128'関数を使用してください。
md5sumユーティリティによって出力されるのと同じ結果を得たい場合は、lower(hex(MD5(s)))を使用します。
## RIPEMD160 {#ripemd160}

[RIPEMD-160](https://en.wikipedia.org/wiki/RIPEMD)ハッシュ値を生成します。

**構文**

```sql
RIPEMD160(input)
```

**パラメータ**

- `input`: 入力文字列。[String](../data-types/string.md)

**戻り値**

- 160ビットの`RIPEMD-160`ハッシュ値タイプ[FixedString(20)](../data-types/fixedstring.md)。

**例**

結果を16進エンコードされた文字列として表現するために、[hex](../functions/encoding-functions.md/#hex)関数を使用します。

クエリ：

```sql
SELECT HEX(RIPEMD160('The quick brown fox jumps over the lazy dog'));
```

```response
┌─HEX(RIPEMD160('The quick brown fox jumps over the lazy dog'))─┐
│ 37F332F68DB77BD9D7EDD4969571AD671CF9DD3B                      │
└───────────────────────────────────────────────────────────────┘
```
## sipHash64 {#siphash64}

64ビットの[SipHash](https://en.wikipedia.org/wiki/SipHash)ハッシュ値を生成します。

```sql
sipHash64(par1,...)
```

これはクリプトグラフィックハッシュ関数です。[MD5](#md5)ハッシュ関数よりも少なくとも3倍速く動作します。

この関数は、すべての入力パラメータを文字列として[解釈し](../functions/type-conversion-functions.md/#type_conversion_functions-reinterpretAsString)、各々のハッシュ値を計算します。次に、ジ以下のアルゴリズムでハッシュを組み合わせます：

1. 最初のハッシュ値と2番目のハッシュ値を結合して、配列としてハッシュします。
2. 以前に計算されたハッシュ値と3番目の入力パラメータのハッシュを同様にハッシュします。
3. この計算は、元の入力の残りのハッシュ値すべてに対して繰り返されます。

**引数**

この関数は、任意の[サポートされているデータ型](../data-types/index.md)の可変数の入力パラメータを受け取ります。

**戻り値**

[UInt64](../data-types/int-uint.md)データ型のハッシュ値。

同じ入力値の異なる引数型に対して、計算されたハッシュ値が等しくなることがあります。これは、異なるサイズの整数型や、同じデータを持つ名前付きおよび名前のない`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型に影響します。

**例**

```sql
SELECT sipHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS SipHash, toTypeName(SipHash) AS type;
```

```response
┌──────────────SipHash─┬─type───┐
│ 11400366955626497465 │ UInt64 │
└──────────────────────┴────────┘
```
## sipHash64Keyed {#siphash64keyed}

[sipHash64](#siphash64)と同様ですが、固定キーを使用せずに明示的なキー引数を取ります。

**構文**

```sql
sipHash64Keyed((k0, k1), par1,...)
```

**引数**

[sipHash64](#siphash64)と同様ですが、最初の引数はキーを表す2つのUInt64値のタプルです。

**戻り値**

[UInt64](../data-types/int-uint.md)データ型のハッシュ値。

**例**

クエリ：

```sql
SELECT sipHash64Keyed((506097522914230528, 1084818905618843912), array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS SipHash, toTypeName(SipHash) AS type;
```

```response
┌─────────────SipHash─┬─type───┐
│ 8017656310194184311 │ UInt64 │
└─────────────────────┴────────┘
```
## sipHash128 {#siphash128}

[sipHash64](#siphash64)のようですが、128ビットのハッシュ値を生成します。つまり、最終的なxorフォールディング状態は128ビットまで行われます。

:::note
この128ビットバリアントはリファレンス実装とは異なり、より弱いです。
このバージョンは、執筆時にSipHashの公式128ビット拡張がなかったため存在します。
新しいプロジェクトでは[sipHash128Reference](#siphash128reference)を使用するのが望ましいでしょう。
:::

**構文**

```sql
sipHash128(par1,...)
```

**引数**

[sipHash64](#siphash64)と同様です。

**戻り値**

[FixedString(16)](../data-types/fixedstring.md)型の128ビット`SipHash`ハッシュ値。

**例**

クエリ：

```sql
SELECT hex(sipHash128('foo', '\x01', 3));
```

結果：

```response
┌─hex(sipHash128('foo', '', 3))────┐
│ 9DE516A64A414D4B1B609415E4523F24 │
└──────────────────────────────────┘
```
## sipHash128Keyed {#siphash128keyed}

[sipHash128](#siphash128)と同様ですが、固定キーを使用せずに明示的なキー引数を取ります。

:::note
この128ビットバリアントはリファレンス実装とは異なり、より弱いです。
このバージョンは、執筆時にSipHashの公式128ビット拡張がなかったため存在します。
新しいプロジェクトでは[sipHash128ReferenceKeyed](#siphash128referencekeyed)を使用するのが望ましいでしょう。
:::

**構文**

```sql
sipHash128Keyed((k0, k1), par1,...)
```

**引数**

[sipHash128](#siphash128)と同様ですが、最初の引数はキーを表す2つのUInt64値のタプルです。

**戻り値**

[FixedString(16)](../data-types/fixedstring.md)型の128ビット`SipHash`ハッシュ値。

**例**

クエリ：

```sql
SELECT hex(sipHash128Keyed((506097522914230528, 1084818905618843912),'foo', '\x01', 3));
```

結果：

```response
┌─hex(sipHash128Keyed((506097522914230528, 1084818905618843912), 'foo', '', 3))─┐
│ B8467F65C8B4CFD9A5F8BD733917D9BF                                              │
└───────────────────────────────────────────────────────────────────────────────┘
```
## sipHash128Reference {#siphash128reference}

[sipHash128](#siphash128)のようですが、SipHashの原作者による128ビットアルゴリズムを実装しています。

**構文**

```sql
sipHash128Reference(par1,...)
```

**引数**

[sipHash128](#siphash128)と同様です。

**戻り値**

[FixedString(16)](../data-types/fixedstring.md)型の128ビット`SipHash`ハッシュ値。

**例**

クエリ：

```sql
SELECT hex(sipHash128Reference('foo', '\x01', 3));
```

結果：

```response
┌─hex(sipHash128Reference('foo', '', 3))─┐
│ 4D1BE1A22D7F5933C0873E1698426260       │
└────────────────────────────────────────┘
```
## sipHash128ReferenceKeyed {#siphash128referencekeyed}

[sipHash128Reference](#siphash128reference)と同様ですが、固定キーを使用せずに明示的なキー引数を取ります。

**構文**

```sql
sipHash128ReferenceKeyed((k0, k1), par1,...)
```

**引数**

[sipHash128Reference](#siphash128reference)と同様ですが、最初の引数はキーを表す2つのUInt64値のタプルです。

**戻り値**

[FixedString(16)](../data-types/fixedstring.md)型の128ビット`SipHash`ハッシュ値。

**例**

クエリ：

```sql
SELECT hex(sipHash128ReferenceKeyed((506097522914230528, 1084818905618843912),'foo', '\x01', 3));
```

結果：

```response
┌─hex(sipHash128ReferenceKeyed((506097522914230528, 1084818905618843912), 'foo', '', 3))─┐
│ 630133C9722DC08646156B8130C4CDC8                                                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
## cityHash64 {#cityhash64}

64ビットの[CityHash](https://github.com/google/cityhash)ハッシュ値を生成します。

```sql
cityHash64(par1,...)
```

これは高速な非クリプトグラフィックハッシュ関数です。文字列パラメータに対してCityHashアルゴリズムを使用し、他のデータ型のパラメータに対しては実装固有の高速な非クリプトグラフィックハッシュ関数を使用します。この関数は、CityHashコンビネーターを使用して最終的な結果を取得します。

Googleは、CityHashをClickHouseに追加した後にそのアルゴリズムを変更しました。言い換えれば、ClickHouseのcityHash64とGoogleのアップストリームのCityHashは現在異なる結果を生成します。ClickHouseのcityHash64はCityHash v1.0.2に対応しています。

**引数**

この関数は、可変数の入力パラメータを受け取ります。引数は、[サポートされているデータ型](../data-types/index.md)のいずれでもかまいません。いくつかのデータ型の場合、引数の型が異なっていても、同じ値に対して計算されたハッシュ関数の値は同じになることがあります（異なるサイズの整数、同じデータを持つ名前付きおよび名前のない`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型）。

**戻り値**

[UInt64](../data-types/int-uint.md)データ型のハッシュ値。

**例**

コール例：

```sql
SELECT cityHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS CityHash, toTypeName(CityHash) AS type;
```

```response
┌─────────────CityHash─┬─type───┐
│ 12072650598913549138 │ UInt64 │
└──────────────────────┴────────┘
```

次の例は、行の順序までの精度でテーブル全体のチェックサムを計算する方法を示しています：

```sql
SELECT groupBitXor(cityHash64(*)) FROM table
```
## intHash32 {#inthash32}

任意の整数から32ビットのハッシュコードを計算します。
これは、数値に対する速度の比較的速い非クリプトグラフィックハッシュ関数です。

**構文**

```sql
intHash32(int)
```

**引数**

- `int` — ハッシュ化する整数。[(U)Int*](../data-types/int-uint.md)。

**戻り値**

- 32ビットのハッシュコード。[UInt32](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT intHash32(42);
```

結果：

```response
┌─intHash32(42)─┐
│    1228623923 │
└───────────────┘
```
## intHash64 {#inthash64}

任意の整数から64ビットのハッシュコードを計算します。
これは、数値に対する速度の比較的速い非クリプトグラフィックハッシュ関数です。
これは[intHash32](#inthash32)よりも速く動作します。

**構文**

```sql
intHash64(int)
```

**引数**

- `int` — ハッシュ化する整数。[(U)Int*](../data-types/int-uint.md)。

**戻り値**

- 64ビットのハッシュコード。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT intHash64(42);
```

結果：

```response
┌────────intHash64(42)─┐
│ 11490350930367293593 │
└──────────────────────┘
```
## SHA1, SHA224, SHA256, SHA512, SHA512_256 {#sha1-sha224-sha256-sha512-sha512_256}

文字列からSHA-1、SHA-224、SHA-256、SHA-512、SHA-512-256ハッシュを計算し、結果のバイトのセットを[FixedString](../data-types/fixedstring.md)として返します。

**構文**

```sql
SHA1('s')
...
SHA512('s')
```

この関数は比較的遅く動作します（SHA-1はプロセッサコアあたり約5百万の短い文字列を処理し、SHA-224およびSHA-256は約2.2百万を処理します）。
特定のハッシュ関数が必要であり、それを選択できない場合のみ、この関数の使用をお勧めします。
これらのケースでも、関数をオフラインで適用し、テーブルに挿入する際に値を事前に計算することをお勧めします。`SELECT`クエリ内で適用するのではなく。

**引数**

- `s` — SHAハッシュ計算のための入力文字列。[String](../data-types/string.md)。

**戻り値**

- SHAハッシュを16進未エンコードされたFixedStringとして返します。SHA-1はFixedString(20)、SHA-224はFixedString(28)、SHA-256はFixedString(32)、SHA-512はFixedString(64)として返されます。[FixedString](../data-types/fixedstring.md)。

**例**

結果を16進エンコードされた文字列として表現するために、[hex](../functions/encoding-functions.md/#hex)関数を使用します。

クエリ：

```sql
SELECT hex(SHA1('abc'));
```

結果：

```response
┌─hex(SHA1('abc'))─────────────────────────┐
│ A9993E364706816ABA3E25717850C26C9CD0D89D │
└──────────────────────────────────────────┘
```
## BLAKE3 {#blake3}

BLAKE3ハッシュ文字列を計算し、結果のバイトのセットを[FixedString](../data-types/fixedstring.md)として返します。

**構文**

```sql
BLAKE3('s')
```

このクリプトグラフィックハッシュ関数は、BLAKE3 Rustライブラリと共にClickHouseに統合されています。この関数は比較的速く、SHA-2と比べて約2倍のパフォーマンスを示し、SHA-256と同じ長さのハッシュを生成します。

**引数**

- s - BLAKE3ハッシュ計算のための入力文字列。[String](../data-types/string.md)。

**戻り値**

- BLAKE3ハッシュをFixedString(32)型のバイト配列として返します。[FixedString](../data-types/fixedstring.md)。

**例**

結果を16進エンコードされた文字列として表現するために、[hex](../functions/encoding-functions.md/#hex)関数を使用します。

クエリ：
```sql
SELECT hex(BLAKE3('ABC'))
```

結果：
```sql
┌─hex(BLAKE3('ABC'))───────────────────────────────────────────────┐
│ D1717274597CF0289694F75D96D444B992A096F1AFD8E7BBFA6EBB1D360FEDFC │
└──────────────────────────────────────────────────────────────────┘
```
## URLHash(url\[, N\]) {#urlhashurl-n}

URLから取得した文字列のための、高速で適度な品質の非クリプトグラフィックハッシュ関数です。いくつかの種類の正規化が行われます。
`URLHash(s)` – 末尾にある場合、末尾の分離記号`/`,`?`または`#`なしで文字列からハッシュを計算します。
`URLHash(s, N)` – NレベルまでのURL階層の文字列から、末尾にある場合、末尾の分離記号`/`,`?`または`#`なしでハッシュを計算します。
レベルはURLHierarchyと同じです。
## farmFingerprint64 {#farmfingerprint64}
## farmHash64 {#farmhash64}

64ビットの[FarmHash](https://github.com/google/farmhash)またはフィンガープリント値を生成します。`farmFingerprint64`は安定したポータブル値のために推奨されます。

```sql
farmFingerprint64(par1, ...)
farmHash64(par1, ...)
```

これらの関数は、それぞれすべての[利用可能なメソッド](https://github.com/google/farmhash/blob/master/src/farmhash.h)から`Fingerprint64`および`Hash64`メソッドを使用します。

**引数**

この関数は、可変数の入力パラメータを受け取ります。引数は、[サポートされているデータ型](../data-types/index.md)のいずれでもかまいません。いくつかのデータ型の場合、引数の型が異なっていても、同じ値に対して計算されたハッシュ関数の値は同じになることがあります（異なるサイズの整数、同じデータを持つ名前付きおよび名前のない`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型）。

**戻り値**

[UInt64](../data-types/int-uint.md)データ型のハッシュ値。

**例**

```sql
SELECT farmHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS FarmHash, toTypeName(FarmHash) AS type;
```

```response
┌─────────────FarmHash─┬─type───┐
│ 17790458267262532859 │ UInt64 │
└──────────────────────┴────────┘
```
## javaHash {#javahash}

文字列から[JavaHash](http://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/String.java#l1452),
[Byte](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Byte.java#l405),
[Short](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Short.java#l410),
[Integer](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Integer.java#l959),
[Long](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Long.java#l1060)から計算します。
このハッシュ関数は高速でも質も良くありません。このアルゴリズムが別のシステムですでに使用されていて、まったく同じ結果を計算しなければならない場合にのみ使用する理由があります。

Javaは符号付き整数のハッシュの計算しかサポートしていないため、符号なし整数のハッシュを計算する場合は、適切な符号付きClickHouse型にキャストする必要があります。

**構文**

```sql
SELECT javaHash('')
```

**戻り値**

`Int32`データ型のハッシュ値。

**例**

クエリ：

```sql
SELECT javaHash(toInt32(123));
```

結果：

```response
┌─javaHash(toInt32(123))─┐
│               123      │
└────────────────────────┘
```

クエリ：

```sql
SELECT javaHash('Hello, world!');
```

結果：

```response
┌─javaHash('Hello, world!')─┐
│               -1880044555 │
└───────────────────────────┘
```
## javaHashUTF16LE {#javahashutf16le}

UTF-16LEエンコーディングで表現された文字列から[JavaHash](http://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/String.java#l1452)を計算します。

**構文**

```sql
javaHashUTF16LE(stringUtf16le)
```

**引数**

- `stringUtf16le` — UTF-16LEエンコーディングの文字列。

**戻り値**

`Int32`データ型のハッシュ値。

**例**

UTF-16LEエンコードされた文字列を使用した正しいクエリ。

クエリ：

```sql
SELECT javaHashUTF16LE(convertCharset('test', 'utf-8', 'utf-16le'));
```

結果：

```response
┌─javaHashUTF16LE(convertCharset('test', 'utf-8', 'utf-16le'))─┐
│                                                      3556498 │
└──────────────────────────────────────────────────────────────┘
```
## hiveHash {#hivehash}

文字列から`HiveHash`を計算します。

```sql
SELECT hiveHash('')
```

これは、ゼロの符号ビットでの[JavaHash](#javahash)です。この関数は[Apache Hive](https://en.wikipedia.org/wiki/Apache_Hive)の3.0以前のバージョンで使用されます。このハッシュ関数は高速でも質も良くありません。このアルゴリズムが別のシステムで使用されていて、まったく同じ結果を計算しなければならない場合にのみ使用されます。

**戻り値**

- `hiveHash`ハッシュ値。[Int32](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT hiveHash('Hello, world!');
```

結果：

```response
┌─hiveHash('Hello, world!')─┐
│                 267439093 │
└───────────────────────────┘
```
## metroHash64 {#metrohash64}

64ビットの[MetroHash](http://www.jandrewrogers.com/2015/05/27/metrohash/)ハッシュ値を生成します。

```sql
metroHash64(par1, ...)
```

**引数**

この関数は、可変数の入力パラメータを受け取ります。引数は、[サポートされているデータ型](../data-types/index.md)のいずれでもかまいません。いくつかのデータ型の場合、引数の型が異なっていても、同じ値に対して計算されたハッシュ関数の値は同じになることがあります（異なるサイズの整数、同じデータを持つ名前付きおよび名前のない`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型）。

**戻り値**

[UInt64](../data-types/int-uint.md)データ型のハッシュ値。

**例**

```sql
SELECT metroHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS MetroHash, toTypeName(MetroHash) AS type;
```

```response
┌────────────MetroHash─┬─type───┐
│ 14235658766382344533 │ UInt64 │
└──────────────────────┴────────┘
```
## jumpConsistentHash {#jumpconsistenthash}

UInt64からJumpConsistentHashを計算します。
2つの引数を受け付けます：UInt64型のキーとバケツの数。Int32を返します。
詳細については、リンクを参照してください：[JumpConsistentHash](https://arxiv.org/pdf/1406.2294.pdf)
## kostikConsistentHash {#kostikconsistenthash}

Konstantin 'kostik' OblakovによるO(1)タイムおよびスペース一貫性ハッシュアルゴリズム。以前の`yandexConsistentHash`です。

**構文**

```sql
kostikConsistentHash(input, n)
```

エイリアス：`yandexConsistentHash`（後方互換性のために残されています）。

**パラメーター**

- `input`: UInt64型のキー [UInt64](../data-types/int-uint.md)。
- `n`: バケツの数。[UInt16](../data-types/int-uint.md)。

**戻り値**

- [UInt16](../data-types/int-uint.md)データ型のハッシュ値。

**実装の詳細**

n &lt;= 32768のときに効率的です。

**例**

クエリ：

```sql
SELECT kostikConsistentHash(16045690984833335023, 2);
```

```response
┌─kostikConsistentHash(16045690984833335023, 2)─┐
│                                             1 │
└───────────────────────────────────────────────┘
```
## murmurHash2_32, murmurHash2_64 {#murmurhash2_32-murmurhash2_64}

[МurmurHash2](https://github.com/aappleby/smhasher)ハッシュ値を生成します。

```sql
murmurHash2_32(par1, ...)
murmurHash2_64(par1, ...)
```

**引数**

両方の関数は可変数の入力パラメータを受け取ります。引数は、[サポートされているデータ型](../data-types/index.md)のいずれでもかまいません。いくつかのデータ型の場合、引数の型が異なっていても、同じ値に対して計算されたハッシュ関数の値は同じになることがあります（異なるサイズの整数、同じデータを持つ名前付きおよび名前のない`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型）。

**戻り値**

- `murmurHash2_32`関数は、[UInt32](../data-types/int-uint.md)データ型のハッシュ値を返します。
- `murmurHash2_64`関数は、[UInt64](../data-types/int-uint.md)データ型のハッシュ値を返します。

**例**

```sql
SELECT murmurHash2_64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS MurmurHash2, toTypeName(MurmurHash2) AS type;
```

```response
┌──────────MurmurHash2─┬─type───┐
│ 11832096901709403633 │ UInt64 │
└──────────────────────┴────────┘
```
## gccMurmurHash {#gccmurmurhash}

64ビットの[MurmurHash2](https://github.com/aappleby/smhasher)ハッシュ値を計算します。これは[GCC](https://github.com/gcc-mirror/gcc/blob/41d6b10e96a1de98e90a7c0378437c3255814b16/libstdc%2B%2B-v3/include/bits/functional_hash.h#L191)と同じハッシュシードを使用しています。ClangとGCCのビルド間で移植可能です。

**構文**

```sql
gccMurmurHash(par1, ...)
```

**引数**

- `par1, ...` — サポートされているデータ型のいずれでもかまいません。[データ型](../data-types/index.md/#data_types)。

**戻り値**

- 計算されたハッシュ値。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT
    gccMurmurHash(1, 2, 3) AS res1,
    gccMurmurHash(('a', [1, 2, 3], 4, (4, ['foo', 'bar'], 1, (1, 2)))) AS res2
```

結果：

```response
┌─────────────────res1─┬────────────────res2─┐
│ 12384823029245979431 │ 1188926775431157506 │
└──────────────────────┴─────────────────────┘
```
## kafkaMurmurHash {#kafkamurmurhash}

32ビットの[MurmurHash2](https://github.com/aappleby/smhasher)ハッシュ値を計算します。Kafkaと同じハッシュシードを使用し、最高のビットを削除して[Default Partitioner](https://github.com/apache/kafka/blob/139f7709bd3f5926901a21e55043388728ccca78/clients/src/main/java/org/apache/kafka/clients/producer/internals/BuiltInPartitioner.java#L328)と互換性があります。

**構文**

```sql
MurmurHash(par1, ...)
```

**引数**

- `par1, ...` — サポートされているデータ型のいずれでもかまいません。[データ型](../data-types/index.md/#data_types)。

**戻り値**

- 計算されたハッシュ値。[UInt32](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT
    kafkaMurmurHash('foobar') AS res1,
    kafkaMurmurHash(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS res2
```

結果：

```response
┌───────res1─┬─────res2─┐
│ 1357151166 │ 85479775 │
└────────────┴──────────┘
```
## murmurHash3_32, murmurHash3_64 {#murmurhash3_32-murmurhash3_64}

[MurmurHash3](https://github.com/aappleby/smhasher)ハッシュ値を生成します。

```sql
murmurHash3_32(par1, ...)
murmurHash3_64(par1, ...)
```

**引数**

両方の関数は可変数の入力パラメータを受け取ります。引数は、[サポートされているデータ型](../data-types/index.md)のいずれでもかまいません。いくつかのデータ型の場合、引数の型が異なっていても、同じ値に対して計算されたハッシュ関数の値は同じになることがあります（異なるサイズの整数、同じデータを持つ名前付きおよび名前のない`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型）。

**戻り値**

- `murmurHash3_32`関数は、[UInt32](../data-types/int-uint.md)データ型のハッシュ値を返します。
- `murmurHash3_64`関数は、[UInt64](../data-types/int-uint.md)データ型のハッシュ値を返します。

**例**

```sql
SELECT murmurHash3_32(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS MurmurHash3, toTypeName(MurmurHash3) AS type;
```

```response
┌─MurmurHash3─┬─type───┐
│     2152717 │ UInt32 │
└─────────────┴────────┘
```
## murmurHash3_128 {#murmurhash3_128}

128ビットの[MurmurHash3](https://github.com/aappleby/smhasher)ハッシュ値を生成します。

**構文**

```sql
murmurHash3_128(expr)
```

**引数**

- `expr` — [式](../syntax.md/#syntax-expressions)のリスト。[String](../data-types/string.md)。

**戻り値**

128ビットの`MurmurHash3`ハッシュ値。[FixedString(16)](../data-types/fixedstring.md)。

**例**

クエリ：

```sql
SELECT hex(murmurHash3_128('foo', 'foo', 'foo'));
```

結果：

```response
┌─hex(murmurHash3_128('foo', 'foo', 'foo'))─┐
│ F8F7AD9B6CD4CF117A71E277E2EC2931          │
└───────────────────────────────────────────┘
```
## xxh3 {#xxh3}

64ビットの[xxh3](https://github.com/Cyan4973/xxHash)ハッシュ値を生成します。

**構文**

```sql
xxh3(expr)
```

**引数**

- `expr` — いかなるデータ型の[式](../syntax.md/#syntax-expressions)。

**戻り値**

64ビットの`xxh3`ハッシュ値。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT xxh3('Hello', 'world')
```

結果：

```response
┌─xxh3('Hello', 'world')─┐
│    5607458076371731292 │
└────────────────────────┘
```
## xxHash32, xxHash64 {#xxhash32-xxhash64}

文字列から`xxHash`を計算します。32ビットまたは64ビットの2つのバリエーションがあります。

```sql
SELECT xxHash32('')

OR

SELECT xxHash64('')
```

**戻り値**

- ハッシュ値。[UInt32/64](../data-types/int-uint.md)。

:::note
xxHash32に対する戻り値の型は`UInt32`、xxHash64に対するものは`UInt64`となります。
:::

**例**

クエリ：

```sql
SELECT xxHash32('Hello, world!');
```

結果：

```response
┌─xxHash32('Hello, world!')─┐
│                 834093149 │
└───────────────────────────┘
```

**参照**

- [xxHash](http://cyan4973.github.io/xxHash/).
## ngramSimHash {#ngramsimhash}

ASCII文字列を`ngramsize`シンボルのn-gramに分割し、n-gramの`simhash`を返します。大文字と小文字を区別します。

これは、[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を用いた半複製文字列の検出に使用できます。計算された2つの文字列の`simhash`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
ngramSimHash(string[, ngramsize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-gramのサイズ。オプション。可能な値：`1`から`25`までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。

**戻り値**

- ハッシュ値。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT ngramSimHash('ClickHouse') AS Hash;
```

結果：

```response
┌───────Hash─┐
│ 1627567969 │
└────────────┘
```
## ngramSimHashCaseInsensitive {#ngramsimhashcaseinsensitive}

ASCII文字列を`ngramsize`シンボルのn-gramに分割し、n-gramの`simhash`を返します。大文字と小文字を区別しません。

これは、[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を用いた半複製文字列の検出に使用できます。計算された2つの文字列の`simhash`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
ngramSimHashCaseInsensitive(string[, ngramsize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-gramのサイズ。オプション。可能な値：`1`から`25`までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。

**戻り値**

- ハッシュ値。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT ngramSimHashCaseInsensitive('ClickHouse') AS Hash;
```

結果：

```response
┌──────Hash─┐
│ 562180645 │
└───────────┘
```
## ngramSimHashUTF8 {#ngramsimhashutf8}

UTF-8文字列を`ngramsize`シンボルのn-gramに分割し、n-gramの`simhash`を返します。大文字と小文字を区別します。

これは、[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を用いた半複製文字列の検出に使用できます。計算された2つの文字列の`simhash`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
ngramSimHashUTF8(string[, ngramsize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-gramのサイズ。オプション。可能な値：`1`から`25`までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。

**戻り値**

- ハッシュ値。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT ngramSimHashUTF8('ClickHouse') AS Hash;
```

結果：

```response
┌───────Hash─┐
│ 1628157797 │
└────────────┘
```
## ngramSimHashCaseInsensitiveUTF8 {#ngramsimhashcaseinsensitiveutf8}

UTF-8文字列を`ngramsize`シンボルのn-グラムに分割し、n-グラムの`simhash`を返します。大文字と小文字を区別しません。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を使用して、半重複文字列の検出に使用できます。計算された2つの文字列の`simhashes`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
ngramSimHashCaseInsensitiveUTF8(string[, ngramsize])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- ハッシュ値。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT ngramSimHashCaseInsensitiveUTF8('ClickHouse') AS Hash;
```

結果:

```response
┌───────Hash─┐
│ 1636742693 │
└────────────┘
```
## wordShingleSimHash {#wordshinglesimhash}

ASCII文字列を`shinglesize`単語のパーツ（シングル）に分割し、単語シングルの`simhash`を返します。大文字と小文字を区別します。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を使用して、半重複文字列の検出に使用できます。計算された2つの文字列の`simhashes`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
wordShingleSimHash(string[, shinglesize])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- ハッシュ値。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT wordShingleSimHash('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Hash;
```

結果:

```response
┌───────Hash─┐
│ 2328277067 │
└────────────┘
```
## wordShingleSimHashCaseInsensitive {#wordshinglesimhashcaseinsensitive}

ASCII文字列を`shinglesize`単語のパーツ（シングル）に分割し、単語シングルの`simhash`を返します。大文字と小文字を区別しません。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を使用して、半重複文字列の検出に使用できます。計算された2つの文字列の`simhashes`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
wordShingleSimHashCaseInsensitive(string[, shinglesize])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- ハッシュ値。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT wordShingleSimHashCaseInsensitive('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Hash;
```

結果:

```response
┌───────Hash─┐
│ 2194812424 │
└────────────┘
```
## wordShingleSimHashUTF8 {#wordshinglesimhashutf8}

UTF-8文字列を`shinglesize`単語のパーツ（シングル）に分割し、単語シングルの`simhash`を返します。大文字と小文字を区別します。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を使用して、半重複文字列の検出に使用できます。計算された2つの文字列の`simhashes`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
wordShingleSimHashUTF8(string[, shinglesize])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- ハッシュ値。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT wordShingleSimHashUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Hash;
```

結果:

```response
┌───────Hash─┐
│ 2328277067 │
└────────────┘
```
## wordShingleSimHashCaseInsensitiveUTF8 {#wordshinglesimhashcaseinsensitiveutf8}

UTF-8文字列を`shinglesize`単語のパーツ（シングル）に分割し、単語シングルの`simhash`を返します。大文字と小文字を区別しません。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を使用して、半重複文字列の検出に使用できます。計算された2つの文字列の`simhashes`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
wordShingleSimHashCaseInsensitiveUTF8(string[, shinglesize])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- ハッシュ値。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT wordShingleSimHashCaseInsensitiveUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Hash;
```

結果:

```response
┌───────Hash─┐
│ 2194812424 │
└────────────┘
```
## wyHash64 {#wyhash64}

64ビットの[wyHash64](https://github.com/wangyi-fudan/wyhash)ハッシュ値を生成します。

**構文**

```sql
wyHash64(string)
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。

**返される値**

- ハッシュ値。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT wyHash64('ClickHouse') AS Hash;
```

結果:

```response
┌─────────────────Hash─┐
│ 12336419557878201794 │
└──────────────────────┘
```
## ngramMinHash {#ngramminhash}

ASCII文字列を`ngramsize`シンボルのn-グラムに分割し、各n-グラムのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュを含むタプルを返します。大文字と小文字を区別します。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使用して、半重複文字列の検出に使用できます。2つの文字列の場合: 返されたハッシュのいずれかが両方の文字列に対して同じであれば、それらの文字列は同じであると見なします。

**構文**

```sql
ngramMinHash(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュ（最小と最大）を含むタプル。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**例**

クエリ:

```sql
SELECT ngramMinHash('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple──────────────────────────────────────┐
│ (18333312859352735453,9054248444481805918) │
└────────────────────────────────────────────┘
```
## ngramMinHashCaseInsensitive {#ngramminhashcaseinsensitive}

ASCII文字列を`ngramsize`シンボルのn-グラムに分割し、各n-グラムのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュを含むタプルを返します。大文字と小文字を区別しません。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使用して、半重複文字列の検出に使用できます。2つの文字列の場合: 返されたハッシュのいずれかが両方の文字列に対して同じであれば、それらの文字列は同じであると見なします。

**構文**

```sql
ngramMinHashCaseInsensitive(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュ（最小と最大）を含むタプル。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**例**

クエリ:

```sql
SELECT ngramMinHashCaseInsensitive('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple──────────────────────────────────────┐
│ (2106263556442004574,13203602793651726206) │
└────────────────────────────────────────────┘
```
## ngramMinHashUTF8 {#ngramminhashutf8}

UTF-8文字列を`ngramsize`シンボルのn-グラムに分割し、各n-グラムのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュを含むタプルを返します。大文字と小文字を区別します。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使用して、半重複文字列の検出に使用できます。2つの文字列の場合: 返されたハッシュのいずれかが両方の文字列に対して同じであれば、それらの文字列は同じであると見なします。

**構文**

```sql
ngramMinHashUTF8(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュ（最小と最大）を含むタプル。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**例**

クエリ:

```sql
SELECT ngramMinHashUTF8('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple──────────────────────────────────────┐
│ (18333312859352735453,6742163577938632877) │
└────────────────────────────────────────────┘
```
## ngramMinHashCaseInsensitiveUTF8 {#ngramminhashcaseinsensitiveutf8}

UTF-8文字列を`ngramsize`シンボルのn-グラムに分割し、各n-グラムのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュを含むタプルを返します。大文字と小文字を区別しません。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使用して、半重複文字列の検出に使用できます。2つの文字列の場合: 返されたハッシュのいずれかが両方の文字列に対して同じであれば、それらの文字列は同じであると見なします。

**構文**

```sql
ngramMinHashCaseInsensitiveUTF8(string [, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュ（最小と最大）を含むタプル。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**例**

クエリ:

```sql
SELECT ngramMinHashCaseInsensitiveUTF8('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple───────────────────────────────────────┐
│ (12493625717655877135,13203602793651726206) │
└─────────────────────────────────────────────┘
```
## ngramMinHashArg {#ngramminhasharg}

ASCII文字列を`ngramsize`シンボルのn-グラムに分割し、[ngramMinHash](#ngramminhash)関数で同じ入力を使用して計算された最小ハッシュおよび最大ハッシュを持つn-グラムを返します。大文字と小文字を区別します。

**構文**

```sql
ngramMinHashArg(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのタプルが含まれるタプル — 各`hashnum`のn-グラム。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**例**

クエリ:

```sql
SELECT ngramMinHashArg('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────────┐
│ (('ous','ick','lic','Hou','kHo','use'),('Hou','lic','ick','ous','ckH','Cli')) │
└─────────────────────────────────────────────────────────────────────────────────┘
```
## ngramMinHashArgCaseInsensitive {#ngramminhashargcaseinsensitive}

ASCII文字列を`ngramsize`シンボルのn-グラムに分割し、[ngramMinHashCaseInsensitive](#ngramminhashcaseinsensitive)関数で同じ入力を使用して計算された最小ハッシュおよび最大ハッシュを持つn-グラムを返します。大文字と小文字を区別しません。

**構文**

```sql
ngramMinHashArgCaseInsensitive(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのタプルが含まれるタプル — 各`hashnum`のn-グラム。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**例**

クエリ:

```sql
SELECT ngramMinHashArgCaseInsensitive('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple────────────────────────────────────────────────────────────────────────────┐
│ (('ous','ick','lic','kHo','use','Cli'),('kHo','lic','ick','ous','ckH','Hou')) │
└─────────────────────────────────────────────────────────────────────────────────┘
```
## ngramMinHashArgUTF8 {#ngramminhashargutf8}

UTF-8文字列を`ngramsize`シンボルのn-グラムに分割し、[ngramMinHashUTF8](#ngramminhashutf8)関数で同じ入力を使用して計算された最小ハッシュおよび最大ハッシュを持つn-グラムを返します。大文字と小文字を区別します。

**構文**

```sql
ngramMinHashArgUTF8(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのタプルが含まれるタプル — 各`hashnum`のn-グラム。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**例**

クエリ:

```sql
SELECT ngramMinHashArgUTF8('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────────┐
│ (('ous','ick','lic','Hou','kHo','use'),('kHo','Hou','lic','ick','ous','ckH')) │
└─────────────────────────────────────────────────────────────────────────────────┘
```
## ngramMinHashArgCaseInsensitiveUTF8 {#ngramminhashargcaseinsensitiveutf8}

UTF-8文字列を`ngramsize`シンボルのn-グラムに分割し、[ngramMinHashCaseInsensitiveUTF8](#ngramminhashcaseinsensitiveutf8)関数で同じ入力を使用して計算された最小ハッシュおよび最大ハッシュを持つn-グラムを返します。大文字と小文字を区別しません。

**構文**

```sql
ngramMinHashArgCaseInsensitiveUTF8(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのタプルが含まれるタプル — 各`hashnum`のn-グラム。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**例**

クエリ:

```sql
SELECT ngramMinHashArgCaseInsensitiveUTF8('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple────────────────────────────────────────────────────────────────────────────┐
│ (('ckH','ous','ick','lic','kHo','use'),('kHo','lic','ick','ous','ckH','Hou')) │
└─────────────────────────────────────────────────────────────────────────────────┘
```
## wordShingleMinHash {#wordshingleminhash}

ASCII文字列を`shinglesize`単語のパーツ（シングル）に分割し、各単語シングルのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュを含むタプルを返します。大文字と小文字を区別します。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使用して、半重複文字列の検出に使用できます。2つの文字列の場合: 返されたハッシュのいずれかが両方の文字列に対して同じであれば、それらの文字列は同じであると見なします。

**構文**

```sql
wordShingleMinHash(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュ（最小と最大）を含むタプル。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**例**

クエリ:

```sql
SELECT wordShingleMinHash('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Tuple;
```

結果:

```response
┌─Tuple──────────────────────────────────────┐
│ (16452112859864147620,5844417301642981317) │
└────────────────────────────────────────────┘
```
## wordShingleMinHashCaseInsensitive {#wordshingleminhashcaseinsensitive}

ASCII文字列を`shinglesize`単語のパーツ（シングル）に分割し、各単語シングルのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュを含むタプルを返します。大文字と小文字を区別しません。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使用して、半重複文字列の検出に使用できます。2つの文字列の場合: 返されたハッシュのいずれかが両方の文字列に対して同じであれば、それらの文字列は同じであると見なします。

**構文**

```sql
wordShingleMinHashCaseInsensitive(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュ（最小と最大）を含むタプル。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**例**

クエリ:

```sql
SELECT wordShingleMinHashCaseInsensitive('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Tuple;
```

結果:

```response
┌─Tuple─────────────────────────────────────┐
│ (3065874883688416519,1634050779997673240) │
└───────────────────────────────────────────┘
```
## wordShingleMinHashUTF8 {#wordshingleminhashutf8}

UTF-8文字列を`shinglesize`単語のパーツ（シングル）に分割し、各単語シングルのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュを含むタプルを返します。大文字と小文字を区別します。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使用して、半重複文字列の検出に使用できます。2つの文字列の場合: 返されたハッシュのいずれかが両方の文字列に対して同じであれば、それらの文字列は同じであると見なします。

**構文**

```sql
wordShingleMinHashUTF8(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュ（最小と最大）を含むタプル。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**例**

クエリ:

```sql
SELECT wordShingleMinHashUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Tuple;
```

結果:

```response
┌─Tuple──────────────────────────────────────┐
│ (16452112859864147620,5844417301642981317) │
└────────────────────────────────────────────┘
```
## wordShingleMinHashCaseInsensitiveUTF8 {#wordshingleminhashcaseinsensitiveutf8}

UTF-8文字列を`shinglesize`単語のパーツ（シングル）に分割し、各単語シングルのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュを含むタプルを返します。大文字と小文字を区別しません。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使用して、半重複文字列の検出に使用できます。2つの文字列の場合: 返されたハッシュのいずれかが両方の文字列に対して同じであれば、それらの文字列は同じであると見なします。

**構文**

```sql
wordShingleMinHashCaseInsensitiveUTF8(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュ（最小と最大）を含むタプル。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**例**

クエリ:

```sql
SELECT wordShingleMinHashCaseInsensitiveUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Tuple;
```

結果:

```response
┌─Tuple─────────────────────────────────────┐
│ (3065874883688416519,1634050779997673240) │
└───────────────────────────────────────────┘
```
## wordShingleMinHashArg {#wordshingleminhasharg}

ASCII文字列を`shinglesize`単語のパーツ（シングル）に分割し、[wordshingleMinHash](#wordshingleminhash)関数で同じ入力を使用して計算された最小ハッシュおよび最大ハッシュを持つシングルを返します。大文字と小文字を区別します。

**構文**

```sql
wordShingleMinHashArg(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのタプルが含まれるタプル — 各`hashnum`の単語シングル。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**例**

クエリ:

```sql
SELECT wordShingleMinHashArg('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).', 1, 3) AS Tuple;
```

結果:

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('OLAP','database','analytical'),('online','oriented','processing')) │
└─────────────────────────────────────────────────────────────────────────────┘
```
## wordShingleMinHashArgCaseInsensitive {#wordshingleminhashargcaseinsensitive}

ASCII文字列を`shinglesize`単語のパーツ（シングル）に分割し、[wordShingleMinHashCaseInsensitive](#wordshingleminhashcaseinsensitive)関数で同じ入力を使用して計算された最小ハッシュおよび最大ハッシュを持つシングルを返します。大文字と小文字を区別しません。

**構文**

```sql
wordShingleMinHashArgCaseInsensitive(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのタプルが含まれるタプル — 各`hashnum`の単語シングル。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**例**

クエリ:

```sql
SELECT wordShingleMinHashArgCaseInsensitive('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).', 1, 3) AS Tuple;
```

結果:

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────────┐
│ (('queries','database','analytical'),('oriented','processing','DBMS')) │
└─────────────────────────────────────────────────────────────────────────────────┘
```
## wordShingleMinHashArgUTF8 {#wordshingleminhashargutf8}

UTF-8文字列を`shinglesize`単語のパーツ（シングル）に分割し、[wordShingleMinHashUTF8](#wordshingleminhashutf8)関数で同じ入力を使用して計算された最小ハッシュおよび最大ハッシュを持つシングルを返します。大文字と小文字を区別します。

**構文**

```sql
wordShingleMinHashArgUTF8(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのタプルが含まれるタプル — 各`hashnum`の単語シングル。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**例**

クエリ:

```sql
SELECT wordShingleMinHashArgUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).', 1, 3) AS Tuple;
```

結果:

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('OLAP','database','analytical'),('online','oriented','processing')) │
└─────────────────────────────────────────────────────────────────────────────┘
```
## wordShingleMinHashArgCaseInsensitiveUTF8 {#wordshingleminhashargcaseinsensitiveutf8}

UTF-8 文字列を `shinglesize` 単語ごとの部分（シングル）に分割し、同じ入力に対して [wordShingleMinHashCaseInsensitiveUTF8](#wordshingleminhashcaseinsensitiveutf8) 関数によって計算された最小および最大の単語ハッシュを持つシングルを返します。大文字と小文字を区別しません。

**構文**

```sql
wordShingleMinHashArgCaseInsensitiveUTF8(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `shinglesize` — 単語のシングルのサイズ。任意。可能な値: `1` から `25` の任意の数。デフォルト値: `3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。任意。可能な値: `1` から `25` の任意の数。デフォルト値: `6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- `hashnum` の単語シングルのタプルが2つ含まれるタプル。 [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**例**

クエリ:

```sql
SELECT wordShingleMinHashArgCaseInsensitiveUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).', 1, 3) AS Tuple;
```

結果:

```response
┌─Tuple──────────────────────────────────────────────────────────────────┐
│ (('queries','database','analytical'),('oriented','processing','DBMS')) │
└────────────────────────────────────────────────────────────────────────┘
```

## sqidEncode {#sqidencode}

数値を [Sqid](https://sqids.org/) というYouTubeのようなID文字列にエンコードします。  
出力アルファベットは `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789` です。  
この関数をハッシュ化に使用しないでください — 生成されたIDは元の数値にデコードできます。

**構文**

```sql
sqidEncode(number1, ...)
```

エイリアス: `sqid`

**引数**

- 可変個の UInt8, UInt16, UInt32 または UInt64 の数値。

**返される値**

sqid の [String](../data-types/string.md)。

**例**

```sql
SELECT sqidEncode(1, 2, 3, 4, 5);
```

```response
┌─sqidEncode(1, 2, 3, 4, 5)─┐
│ gXHfJ1C6dN                │
└───────────────────────────┘
```

## sqidDecode {#sqiddecode}

[Sqid](https://sqids.org/) を元の数値にデコードします。  
入力文字列が有効な sqid でない場合は空の配列を返します。

**構文**

```sql
sqidDecode(sqid)
```

**引数**

- sqid - [String](../data-types/string.md)

**返される値**

数値に変換された sqid [Array(UInt64)](../data-types/array.md)。

**例**

```sql
SELECT sqidDecode('gXHfJ1C6dN');
```

```response
┌─sqidDecode('gXHfJ1C6dN')─┐
│ [1,2,3,4,5]              │
└──────────────────────────┘
```
