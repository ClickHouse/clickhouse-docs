---
description: 'ハッシュ関数のドキュメント'
sidebar_label: 'ハッシュ'
sidebar_position: 85
slug: '/sql-reference/functions/hash-functions'
title: 'ハッシュ関数'
---





# ハッシュ関数

ハッシュ関数は要素の決定論的な擬似ランダムシャッフルに使用できます。

Simhashはハッシュ関数であり、近い（類似の）引数に対して近接したハッシュ値を返します。

ほとんどのハッシュ関数は、任意の数の引数を任意の型で受け入れます。

:::note
NULLのハッシュはNULLです。Nullableカラムの非NULLのハッシュを取得するには、タプルでラップします：
```sql
SELECT cityHash64(tuple(NULL))
```
:::

:::note
テーブルの全ての内容のハッシュを計算するには、`sum(cityHash64(tuple(*)))`（または他のハッシュ関数）を使用します。`tuple`はNULL値を持つ行がスキップされないことを保証します。`sum`は行の順序が重要でないことを保証します。
:::
## halfMD5 {#halfmd5}

[すべての入力パラメータを文字列として解釈](/sql-reference/functions/type-conversion-functions#reinterpretasstring)し、それぞれのために[MD5](https://en.wikipedia.org/wiki/MD5)ハッシュ値を計算します。次にハッシュを組み合わせ、結果の文字列の最初の8バイトを取得し、それらをビッグエンディアンバイトオーダーの`UInt64`として解釈します。

```sql
halfMD5(par1, ...)
```

この関数は比較的遅く（1秒あたりプロセッサコアごとに500万の短い文字列）、[sipHash64](#siphash64)関数を使用することを検討してください。

**引数**

この関数は任意の数の入力パラメータを受け取ります。引数は[サポートされているデータ型](../data-types/index.md)のいずれかであることができます。一部のデータ型では、引数の型が異なっていても、同じ値に対してハッシュ関数の計算値が同じになることがあります（サイズが異なる整数、同じデータを持つ名前付きおよび名前なしの`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型）。

**返される値**

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

文字列からMD4を計算し、結果のバイトセットをFixedString(16)として返します。
## MD5 {#md5}

文字列からMD5を計算し、結果のバイトセットをFixedString(16)として返します。
特にMD5が必要ない場合は、適切な128ビットの暗号ハッシュが必要な場合は、代わりに'sipHash128'関数を使用してください。
md5sumユーティリティが出力するのと同じ結果を得るには、lower(hex(MD5(s)))を使用します。
## RIPEMD160 {#ripemd160}

[RIPEMD-160](https://en.wikipedia.org/wiki/RIPEMD)ハッシュ値を生成します。

**構文**

```sql
RIPEMD160(input)
```

**パラメータ**

- `input`: 入力文字列。[String](../data-types/string.md)

**返される値**

- 160ビットの`RIPEMD-160`ハッシュ値で、[FixedString(20)](../data-types/fixedstring.md)型です。

**例**

[hex](../functions/encoding-functions.md/#hex)関数を使用して、結果を16進エンコードされた文字列として表現します。

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

これは暗号学的ハッシュ関数です。これは、[MD5](#md5)ハッシュ関数の少なくとも3倍の速度で動作します。

この関数は、すべての入力パラメータを文字列として[解釈](/sql-reference/functions/type-conversion-functions#reinterpretasstring)し、それぞれのためにハッシュ値を計算します。次に、次のアルゴリズムでハッシュを組み合わせます：

1. 最初と2番目のハッシュ値を連結して配列にし、それをハッシュ化します。
2. 以前に計算されたハッシュ値と3番目の入力パラメータのハッシュを、同様の方法でハッシュ化します。
3. この計算は、元の入力の残りのハッシュ値すべてに対して繰り返されます。

**引数**

この関数は、任意の[サポートされているデータ型](../data-types/index.md)の任意の数の入力パラメータを受け取ります。

**返される値**

[UInt64](../data-types/int-uint.md)データ型のハッシュ値。

計算されたハッシュ値は、異なる引数型の同じ入力値に対して等しくなる可能性があります。これは、異なるサイズの整数型、同じデータを持つ名前付きおよび名前なしの`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型に影響します。

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

[sipHash64](#siphash64)と同じですが、固定キーを使用せずに明示的なキー引数も取ります。

**構文**

```sql
sipHash64Keyed((k0, k1), par1,...)
```

**引数**

[sipHash64](#siphash64)と同じですが、最初の引数は、キーを表す2つのUInt64値のタプルです。

**返される値**

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

[sipHash64](#siphash64)のように、128ビットのハッシュ値を生成します。すなわち、最終的なxor-folding状態が128ビットまで行われます。

:::note
この128ビットのバリアントは、参照実装とは異なり、より弱いです。
このバージョンは、作成時にSipHashの公式な128ビット拡張が存在しなかったため存在します。
新しいプロジェクトは、おそらく[sipHash128Reference](#siphash128reference)を使用すべきです。
:::

**構文**

```sql
sipHash128(par1,...)
```

**引数**

[sipHash64](#siphash64)と同じです。

**返される値**

128ビットの`SipHash`ハッシュ値で、[FixedString(16)](../data-types/fixedstring.md)型です。

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

[sipHash128](#siphash128)と同じですが、固定キーを使用せずに明示的なキー引数も取ります。

:::note
この128ビットのバリアントは、参照実装とは異なり、より弱いです。
このバージョンは、作成時にSipHashの公式な128ビット拡張が存在しなかったため存在します。
新しいプロジェクトは、おそらく[sipHash128ReferenceKeyed](#siphash128referencekeyed)を使用すべきです。
:::

**構文**

```sql
sipHash128Keyed((k0, k1), par1,...)
```

**引数**

[sipHash128](#siphash128)と同じですが、最初の引数はキーを表す2つのUInt64値のタプルです。

**返される値**

128ビットの`SipHash`ハッシュ値で、[FixedString(16)](../data-types/fixedstring.md)型です。

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

[sipHash128](#siphash128)と同じですが、SipHash初版の作者からの128ビットアルゴリズムを実装します。

**構文**

```sql
sipHash128Reference(par1,...)
```

**引数**

[sipHash128](#siphash128)と同じです。

**返される値**

128ビットの`SipHash`ハッシュ値で、[FixedString(16)](../data-types/fixedstring.md)型です。

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

[sipHash128Reference](#siphash128reference)と同じですが、固定キーを使用せずに明示的なキー引数も取ります。

**構文**

```sql
sipHash128ReferenceKeyed((k0, k1), par1,...)
```

**引数**

[sipHash128Reference](#siphash128reference)と同じですが、最初の引数はキーを表す2つのUInt64値のタプルです。

**返される値**

128ビットの`SipHash`ハッシュ値で、[FixedString(16)](../data-types/fixedstring.md)型です。

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

これは、高速な非暗号的ハッシュ関数です。文字列パラメータに対してはCityHashアルゴリズムを使用し、他のデータ型のパラメータに対しては実装特有の高速な非暗号的ハッシュ関数を使用します。この関数は、CityHashコンビネーターを使用して最終結果を取得します。

Googleは、CityHashがClickHouseに追加された後にアルゴリズムを変更しました。言い換えれば、ClickHouseのcityHash64とGoogleのアップストリームのCityHashは、現在異なる結果を生み出します。ClickHouseのcityHash64は、CityHash v1.0.2に相当します。

**引数**

この関数は、任意の数の入力パラメータを受け取ります。引数は[サポートされているデータ型](../data-types/index.md)のいずれかであることができます。一部のデータ型では、引数の型が異なっていても、同じ値に対してハッシュ関数の計算値が同じになることがあります（サイズが異なる整数、同じデータを持つ名前付きおよび名前なしの`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型）。

**返される値**

[UInt64](../data-types/int-uint.md)データ型のハッシュ値。

**例**

呼び出し例：

```sql
SELECT cityHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS CityHash, toTypeName(CityHash) AS type;
```

```response
┌─────────────CityHash─┬─type───┐
│ 12072650598913549138 │ UInt64 │
└──────────────────────┴────────┘
```

次の例は、行の順序を考慮してテーブル全体のチェックサムを計算する方法を示しています：

```sql
SELECT groupBitXor(cityHash64(*)) FROM table
```
## intHash32 {#inthash32}

任意のタイプの整数から32ビットのハッシュコードを計算します。
これは、数値に対して、平均的な品質の比較的高速な非暗号的ハッシュ関数です。

**構文**

```sql
intHash32(int)
```

**引数**

- `int` — ハッシュ化する整数。[ (U)Int*](../data-types/int-uint.md)。

**返される値**

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

任意のタイプの整数から64ビットのハッシュコードを計算します。
これは、数値に対して、平均的な品質の比較的高速な非暗号的ハッシュ関数です。
これは[intHash32](#inthash32)よりも早く動作します。

**構文**

```sql
intHash64(int)
```

**引数**

- `int` — ハッシュ化する整数。[ (U)Int*](../data-types/int-uint.md)。

**返される値**

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

文字列からSHA-1、SHA-224、SHA-256、SHA-512、SHA-512-256ハッシュを計算し、結果のバイトセットを[FixedString](../data-types/fixedstring.md)として返します。

**構文**

```sql
SHA1('s')
...
SHA512('s')
```

この関数は比較的遅く動作します（SHA-1はプロセッサコアあたり1秒あたり約500万の短い文字列を処理し、SHA-224およびSHA-256は約220万を処理します）。
特定のハッシュ関数が必要で、選択できない場合にのみこの関数を使用することをお勧めします。
これらのケースでも、`SELECT`クエリで適用するのではなく、オフラインで関数を適用し、値をテーブルに挿入する際に事前計算することをお勧めします。

**引数**

- `s` — SHAハッシュ計算のための入力文字列。[String](../data-types/string.md)。

**返される値**

- SHAハッシュは、16進未エンコードのFixedStringとして返されます。SHA-1はFixedString(20)、SHA-224はFixedString(28)、SHA-256はFixedString(32)、SHA-512はFixedString(64)として返されます。[FixedString](../data-types/fixedstring.md)。

**例**

[hex](../functions/encoding-functions.md/#hex)関数を使用して、結果を16進エンコードされた文字列として表現します。

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

BLAKE3ハッシュ文字列を計算し、結果のバイトセットを[FixedString](../data-types/fixedstring.md)として返します。

**構文**

```sql
BLAKE3('s')
```

この暗号化ハッシュ関数は、BLAKE3 RustライブラリでClickHouseに統合されています。この関数は比較的高速で、SHA-2と比較して約2倍のパフォーマンスを示しますが、SHA-256と同じ長さのハッシュを生成します。

**引数**

- s - BLAKE3ハッシュ計算のための入力文字列。[String](../data-types/string.md)。

**返される値**

- BLAKE3ハッシュは、FixedString(32)型のバイト配列として返されます。[FixedString](../data-types/fixedstring.md)。

**例**

[hex](../functions/encoding-functions.md/#hex)関数を使用して、結果を16進エンコードされた文字列として表現します。

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

URLから取得した文字列のための、高速で適度な品質の非暗号的ハッシュ関数です。Normalizationの種類を用いています。
`URLHash(s)` – 末尾に1つのトレーリングシンボル`/`,`?`または`#`がある場合、それを除去した文字列からハッシュを計算します。
`URLHash(s, N)` – URL階層内のNレベルまでの文字列からハッシュを計算し、末尾に1つのトレーリングシンボル`/`,`?`または`#`がある場合、それを除去します。
レベルはURLHierarchyと同じです。
## farmFingerprint64 {#farmfingerprint64}
## farmHash64 {#farmhash64}

64ビットの[FarmHash](https://github.com/google/farmhash)またはFingerprint値を生成します。`farmFingerprint64`が安定で移植性のある値には推奨されます。

```sql
farmFingerprint64(par1, ...)
farmHash64(par1, ...)
```

これらの関数はそれぞれ、すべての[利用可能なメソッド](https://github.com/google/farmhash/blob/master/src/farmhash.h)から`Fingerprint64`と`Hash64`メソッドを使用しています。

**引数**

この関数は、任意の数の入力パラメータを受け取ります。引数は[サポートされているデータ型](../data-types/index.md)のいずれかであることができます。一部のデータ型では、引数の型が異なっていても、同じ値に対してハッシュ関数の計算値が同じになることがあります（サイズが異なる整数、同じデータを持つ名前付きおよび名前なしの`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型）。

**返される値**

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

[文字列](http://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/String.java#l1452),
[Byte](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Byte.java#l405),
[Short](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Short.java#l410),
[Integer](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Integer.java#l959),
[Long](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Long.java#l1060)からJavaHashを計算します。
このハッシュ関数は、速くもなく、品質も良くありません。このアルゴリズムが他のシステムですでに使用されている場合、まったく同じ結果を計算するためだけに使用される理由があります。

Javaは符号付き整数のハッシュ計算のみをサポートしているため、符号なしの整数のハッシュを計算する場合は、適切な符号付きClickHouse型にキャストする必要があります。

**構文**

```sql
SELECT javaHash('')
```

**返される値**

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

文字列から[JavaHash](http://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/String.java#l1452)を計算し、UTF-16LEエンコーディングのバイトを表していると仮定します。

**構文**

```sql
javaHashUTF16LE(stringUtf16le)
```

**引数**

- `stringUtf16le` — UTF-16LEエンコーディングの文字列。

**返される値**

`Int32`データ型のハッシュ値。

**例**

UTF-16LEエンコーディングされた文字列を使用した正しいクエリ。

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

これは単に[JavaHash](#javahash)で符号ビットがゼロ化されたものです。この関数は、バージョン3.0より前の[Apache Hive](https://en.wikipedia.org/wiki/Apache_Hive)で使用されます。このハッシュ関数は速くもなく、品質が良くもありません。このアルゴリズムが他のシステムですでに使用されている場合、まったく同じ結果を計算するためだけに使用される理由があります。

**返される値**

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

この関数は、任意の数の入力パラメータを受け取ります。引数は[サポートされているデータ型](../data-types/index.md)のいずれかであることができます。一部のデータ型では、引数の型が異なっていても、同じ値に対してハッシュ関数の計算値が同じになることがあります（サイズが異なる整数、同じデータを持つ名前付きおよび名前なしの`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型）。

**返される値**

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
2つの引数を受け入れます：UInt64型のキーとバケットの数。Int32を返します。詳細については、リンクを参照してください：[JumpConsistentHash](https://arxiv.org/pdf/1406.2294.pdf)
## kostikConsistentHash {#kostikconsistenthash}

Konstantin 'kostik' OblakovによるO(1)時間および空間の一貫したハッシュアルゴリズム。以前の`yandexConsistentHash`。

**構文**

```sql
kostikConsistentHash(input, n)
```

エイリアス：`yandexConsistentHash`（後方互換性のために残されました）。

**パラメータ**

- `input`: UInt64型のキー[UInt64](../data-types/int-uint.md)。
- `n`: バケットの数。[UInt16](../data-types/int-uint.md)。

**返される値**

[UInt16](../data-types/int-uint.md)データ型のハッシュ値。

**実装の詳細**

n &lt;= 32768の場合にのみ効率的です。

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

[MurmurHash2](https://github.com/aappleby/smhasher)ハッシュ値を生成します。

```sql
murmurHash2_32(par1, ...)
murmurHash2_64(par1, ...)
```

**引数**

両方の関数は、任意の数の入力パラメータを受け取ります。引数は[サポートされているデータ型](../data-types/index.md)のいずれかであることができます。一部のデータ型では、引数の型が異なっていても、同じ値に対してハッシュ関数の計算値が同じになることがあります（サイズが異なる整数、同じデータを持つ名前付きおよび名前なしの`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型）。

**返される値**

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

64ビットの[MurmurHash2](https://github.com/aappleby/smhasher)ハッシュ値を、[gcc](https://github.com/gcc-mirror/gcc/blob/41d6b10e96a1de98e90a7c0378437c3255814b16/libstdc%2B%2B-v3/include/bits/functional_hash.h#L191)と同じハッシュシードを使用して計算します。ClangとGCCビルド間で移植可能です。

**構文**

```sql
gccMurmurHash(par1, ...)
```

**引数**

- `par1, ...` — [サポートされているデータ型](/sql-reference/data-types)のいずれかである任意の数の引数。

**返される値**

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

32ビットの[MurmurHash2](https://github.com/aappleby/smhasher)ハッシュ値を計算します。Kafkaと同じハッシュシードを使用します。そして、最高ビットを無視して[Default Partitioner](https://github.com/apache/kafka/blob/139f7709bd3f5926901a21e55043388728ccca78/clients/src/main/java/org/apache/kafka/clients/producer/internals/BuiltInPartitioner.java#L328)と互換性を持たせます。

**構文**

```sql
MurmurHash(par1, ...)
```

**引数**

- `par1, ...` — [サポートされているデータ型](/sql-reference/data-types)のいずれかである任意の数の引数。

**返される値**

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

両方の関数は、任意の数の入力パラメータを受け取ります。引数は[サポートされているデータ型](../data-types/index.md)のいずれかであることができます。一部のデータ型では、引数の型が異なっていても、同じ値に対してハッシュ関数の計算値が同じになることがあります（サイズが異なる整数、同じデータを持つ名前付きおよび名前なしの`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型）。

**返される値**

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

- `expr` — [式](/sql-reference/syntax#expressions)のリスト。[String](../data-types/string.md)。

**返される値**

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

- `expr` — 任意のデータ型の[式](/sql-reference/syntax#expressions)のリスト。

**返される値**

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

文字列から`xxHash`を計算します。32ビットと64ビットの2種類を提案します。

```sql
SELECT xxHash32('')

または

SELECT xxHash64('')
```

**返される値**

- ハッシュ値。[UInt32/64](../data-types/int-uint.md)。

:::note
戻り値の型は、`xxHash32`が`UInt32`、`xxHash64`が`UInt64`になります。
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

**参考**

- [xxHash](http://cyan4973.github.io/xxHash/).
## ngramSimHash {#ngramsimhash}

ASCII文字列を`ngramsize`記号のn-gramsに分割し、n-gram `simhash`を返します。大文字と小文字を区別します。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)での半重複文字列の検出に使用できます。計算された2つの文字列の`simhashes`のハミング距離が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
ngramSimHash(string[, ngramsize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-gramのサイズ。オプション。値は1から25の任意の数。デフォルト値は3。[UInt8](../data-types/int-uint.md)。

**返される値**

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

ASCII文字列を`ngramsize`記号のn-gramsに分割し、n-gram `simhash`を返します。大文字と小文字を区別しません。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)での半重複文字列の検出に使用できます。計算された2つの文字列の`simhashes`のハミング距離が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
ngramSimHashCaseInsensitive(string[, ngramsize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-gramのサイズ。オプション。値は1から25の任意の数。デフォルト値は3。[UInt8](../data-types/int-uint.md)。

**返される値**

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

UTF-8文字列を`ngramsize`記号のn-gramsに分割し、n-gram `simhash`を返します。大文字と小文字を区別します。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)での半重複文字列の検出に使用できます。計算された2つの文字列の`simhashes`のハミング距離が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
ngramSimHashUTF8(string[, ngramsize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-gramのサイズ。オプション。値は1から25の任意の数。デフォルト値は3。[UInt8](../data-types/int-uint.md)。

**返される値**

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

UTF-8 文字列を `ngramsize` シンボルの n-グラムに分割し、n-グラムの `simhash` を返します。大文字と小文字を区別しません。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance) を使用した半複製文字列の検出に使用できます。2つの文字列の計算された `simhashes` の [Hamming Distance](https://en.wikipedia.org/wiki/Hamming_distance) が小さいほど、これらの文字列は同じである可能性が高くなります。

**構文**

```sql
ngramSimHashCaseInsensitiveUTF8(string[, ngramsize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。

**返される値**

- ハッシュ値。[UInt64](../data-types/int-uint.md)。

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

ASCII 文字列を `shinglesize` 単語の部分（シングル）に分割し、単語シングルの `simhash` を返します。大文字と小文字を区別します。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance) を使用した半複製文字列の検出に使用できます。2つの文字列の計算された `simhashes` の [Hamming Distance](https://en.wikipedia.org/wiki/Hamming_distance) が小さいほど、これらの文字列は同じである可能性が高くなります。

**構文**

```sql
wordShingleSimHash(string[, shinglesize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。

**返される値**

- ハッシュ値。[UInt64](../data-types/int-uint.md)。

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

ASCII 文字列を `shinglesize` 単語の部分（シングル）に分割し、単語シングルの `simhash` を返します。大文字と小文字を区別しません。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance) を使用した半複製文字列の検出に使用できます。2つの文字列の計算された `simhashes` の [Hamming Distance](https://en.wikipedia.org/wiki/Hamming_distance) が小さいほど、これらの文字列は同じである可能性が高くなります。

**構文**

```sql
wordShingleSimHashCaseInsensitive(string[, shinglesize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。

**返される値**

- ハッシュ値。[UInt64](../data-types/int-uint.md)。

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

UTF-8 文字列を `shinglesize` 単語の部分（シングル）に分割し、単語シングルの `simhash` を返します。大文字と小文字を区別します。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance) を使用した半複製文字列の検出に使用できます。2つの文字列の計算された `simhashes` の [Hamming Distance](https://en.wikipedia.org/wiki/Hamming_distance) が小さいほど、これらの文字列は同じである可能性が高くなります。

**構文**

```sql
wordShingleSimHashUTF8(string[, shinglesize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。

**返される値**

- ハッシュ値。[UInt64](../data-types/int-uint.md)。

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

UTF-8 文字列を `shinglesize` 単語の部分（シングル）に分割し、単語シングルの `simhash` を返します。大文字と小文字を区別しません。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance) を使用した半複製文字列の検出に使用できます。2つの文字列の計算された `simhashes` の [Hamming Distance](https://en.wikipedia.org/wiki/Hamming_distance) が小さいほど、これらの文字列は同じである可能性が高くなります。

**構文**

```sql
wordShingleSimHashCaseInsensitiveUTF8(string[, shinglesize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。

**返される値**

- ハッシュ値。[UInt64](../data-types/int-uint.md)。

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

64 ビットの [wyHash64](https://github.com/wangyi-fudan/wyhash) ハッシュ値を生成します。

**構文**

```sql
wyHash64(string)
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。

**返される値**

- ハッシュ値。[UInt64](../data-types/int-uint.md)。

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

ASCII 文字列を `ngramsize` シンボルの n-グラムに分割し、各 n-グラムのハッシュ値を計算します。最小ハッシュを計算するために `hashnum` 最小ハッシュを使用し、最大ハッシュを計算するために `hashnum` 最大ハッシュを使用します。これらのハッシュを含むタプルを返します。大文字と小文字を区別します。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance) を使用した半複製文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが両方の文字列で同じであれば、これらの文字列は同じであると考えます。

**構文**

```sql
ngramMinHash(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュを含むタプル — 最小と最大。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

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

ASCII 文字列を `ngramsize` シンボルの n-グラムに分割し、各 n-グラムのハッシュ値を計算します。最小ハッシュを計算するために `hashnum` 最小ハッシュを使用し、最大ハッシュを計算するために `hashnum` 最大ハッシュを使用します。これらのハッシュを含むタプルを返します。大文字と小文字を区別しません。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance) を使用した半複製文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが両方の文字列で同じであれば、これらの文字列は同じであると考えます。

**構文**

```sql
ngramMinHashCaseInsensitive(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュを含むタプル — 最小と最大。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

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

UTF-8 文字列を n-グラムの `ngramsize` シンボルに分割し、各 n-グラムのハッシュ値を計算します。最小ハッシュを計算するために `hashnum` 最小ハッシュを使用し、最大ハッシュを計算するために `hashnum` 最大ハッシュを使用します。これらのハッシュを含むタプルを返します。大文字と小文字を区別します。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance) を使用した半複製文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが両方の文字列で同じであれば、これらの文字列は同じであると考えます。

**構文**

```sql
ngramMinHashUTF8(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュを含むタプル — 最小と最大。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

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

UTF-8 文字列を `ngramsize` シンボルの n-グラムに分割し、各 n-グラムのハッシュ値を計算します。最小ハッシュを計算するために `hashnum` 最小ハッシュを使用し、最大ハッシュを計算するために `hashnum` 最大ハッシュを使用します。これらのハッシュを含むタプルを返します。大文字と小文字を区別しません。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance) を使用した半複製文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが両方の文字列で同じであれば、これらの文字列は同じであると考えます。

**構文**

```sql
ngramMinHashCaseInsensitiveUTF8(string [, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュを含むタプル — 最小と最大。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

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

ASCII 文字列を `ngramsize` シンボルの n-グラムに分割し、同じ入力で [ngramMinHash](#ngramminhash) 関数によって計算された最小ハッシュおよび最大ハッシュの n-グラムを返します。大文字と小文字を区別します。

**構文**

```sql
ngramMinHashArg(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md)。

**返される値**

- `hashnum` n-グラムを含む2つのタプルを持つタプル。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**例**

クエリ:

```sql
SELECT ngramMinHashArg('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('ous','ick','lic','Hou','kHo','use'),('Hou','lic','ick','ous','ckH','Cli')) │
└───────────────────────────────────────────────────────────────────────────────┘
```
## ngramMinHashArgCaseInsensitive {#ngramminhashargcaseinsensitive}

ASCII 文字列を `ngramsize` シンボルの n-グラムに分割し、同じ入力で [ngramMinHashCaseInsensitive](#ngramminhashcaseinsensitive) 関数によって計算された最小ハッシュおよび最大ハッシュの n-グラムを返します。大文字と小文字を区別しません。

**構文**

```sql
ngramMinHashArgCaseInsensitive(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md)。

**返される値**

- `hashnum` n-グラムを含む2つのタプルを持つタプル。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**例**

クエリ:

```sql
SELECT ngramMinHashArgCaseInsensitive('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('ous','ick','lic','kHo','use','Cli'),('kHo','lic','ick','ous','ckH','Hou')) │
└───────────────────────────────────────────────────────────────────────────────┘
```
## ngramMinHashArgUTF8 {#ngramminhashargutf8}

UTF-8 文字列を `ngramsize` シンボルの n-グラムに分割し、同じ入力で [ngramMinHashUTF8](#ngramminhashutf8) 関数によって計算された最小ハッシュおよび最大ハッシュの n-グラムを返します。大文字と小文字を区別します。

**構文**

```sql
ngramMinHashArgUTF8(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md)。

**返される値**

- `hashnum` n-グラムを含む2つのタプルを持つタプル。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**例**

クエリ:

```sql
SELECT ngramMinHashArgUTF8('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('ous','ick','lic','Hou','kHo','use'),('kHo','Hou','lic','ick','ous','ckH')) │
└───────────────────────────────────────────────────────────────────────────────┘
```
## ngramMinHashArgCaseInsensitiveUTF8 {#ngramminhashargcaseinsensitiveutf8}

UTF-8 文字列を `ngramsize` シンボルの n-グラムに分割し、同じ入力で [ngramMinHashCaseInsensitiveUTF8](#ngramminhashcaseinsensitiveutf8) 関数によって計算された最小ハッシュおよび最大ハッシュの n-グラムを返します。大文字と小文字を区別しません。

**構文**

```sql
ngramMinHashArgCaseInsensitiveUTF8(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md)。

**返される値**

- `hashnum` n-グラムを含む2つのタプルを持つタプル。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**例**

クエリ:

```sql
SELECT ngramMinHashArgCaseInsensitiveUTF8('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('ckH','ous','ick','lic','kHo','use'),('kHo','lic','ick','ous','ckH','Hou')) │
└───────────────────────────────────────────────────────────────────────────────┘
```
## wordShingleMinHash {#wordshingleminhash}

ASCII 文字列を `shinglesize` 単語の部分（シングル）に分割し、各単語シングルのハッシュ値を計算します。最小ハッシュを計算するために `hashnum` 最小ハッシュを使用し、最大ハッシュを計算するために `hashnum` 最大ハッシュを使用します。これらのハッシュを含むタプルを返します。大文字と小文字を区別します。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance) を使用した半複製文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが両方の文字列で同じであれば、これらの文字列は同じであると考えます。

**構文**

```sql
wordShingleMinHash(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュを含むタプル — 最小と最大。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

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

ASCII 文字列を `shinglesize` 単語の部分（シングル）に分割し、各単語シングルのハッシュ値を計算します。最小ハッシュを計算するために `hashnum` 最小ハッシュを使用し、最大ハッシュを計算するために `hashnum` 最大ハッシュを使用します。これらのハッシュを含むタプルを返します。大文字と小文字を区別しません。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance) を使用した半複製文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが両方の文字列で同じであれば、これらの文字列は同じであると考えます。

**構文**

```sql
wordShingleMinHashCaseInsensitive(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュを含むタプル — 最小と最大。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

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

UTF-8 文字列を `shinglesize` 単語の部分（シングル）に分割し、各単語シングルのハッシュ値を計算します。最小ハッシュを計算するために `hashnum` 最小ハッシュを使用し、最大ハッシュを計算するために `hashnum` 最大ハッシュを使用します。これらのハッシュを含むタプルを返します。大文字と小文字を区別します。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance) を使用した半複製文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが両方の文字列で同じであれば、これらの文字列は同じであると考えます。

**構文**

```sql
wordShingleMinHashUTF8(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュを含むタプル — 最小と最大。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

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

UTF-8 文字列を `shinglesize` 単語の部分（シングル）に分割し、各単語シングルのハッシュ値を計算します。最小ハッシュを計算するために `hashnum` 最小ハッシュを使用し、最大ハッシュを計算するために `hashnum` 最大ハッシュを使用します。これらのハッシュを含むタプルを返します。大文字と小文字を区別しません。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance) を使用した半複製文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが両方の文字列で同じであれば、これらの文字列は同じであると考えます。

**構文**

```sql
wordShingleMinHashCaseInsensitiveUTF8(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。オプション。可能な値：`1` から `25` までの任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md)。

**返される値**

- 2つのハッシュを含むタプル — 最小と最大。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

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
## wordShingleMinHashArgCaseInsensitiveUTF8 {#wordshingleminhashargcaseinsensitiveutf8}

UTF-8文字列を`shinglesize`の単語の部分（シングル）に分割し、同じ入力で[wordShingleMinHashCaseInsensitiveUTF8](#wordshingleminhashcaseinsensitiveutf8)関数によって計算された最小および最大の単語ハッシュを返します。大文字と小文字を区別しません。

**構文**

```sql
wordShingleMinHashArgCaseInsensitiveUTF8(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1`から`25`までの任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。オプション。可能な値：`1`から`25`までの任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md)。

**返される値**

- `hashnum` 個の単語シングルを含む2つのタプルのタプル。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

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

数値を[Sqid](https://sqids.org/)としてエンコードします。これはYouTubeのようなID文字列です。
出力のアルファベットは`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`です。
この関数はハッシュ作成には使用しないでください。生成されたIDは元の数値にデコード可能です。

**構文**

```sql
sqidEncode(number1, ...)
```

エイリアス: `sqid`

**引数**

- UInt8、UInt16、UInt32、またはUInt64の数の可変数。

**返される値**

sqidの[String](../data-types/string.md)。

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

[Sqid](https://sqids.org/)を元の数値にデコードします。
入力文字列が有効なsqidでない場合、空の配列を返します。

**構文**

```sql
sqidDecode(sqid)
```

**引数**

- sqid - [String](../data-types/string.md)

**返される値**

数値に変換されたsqid [Array(UInt64)](../data-types/array.md)。

**例**

```sql
SELECT sqidDecode('gXHfJ1C6dN');
```

```response
┌─sqidDecode('gXHfJ1C6dN')─┐
│ [1,2,3,4,5]              │
└──────────────────────────┘
```
## keccak256 {#keccak256}

Keccak-256ハッシュ文字列を計算し、結果のバイトセットを[FixedString](../data-types/fixedstring.md)として返します。

**構文**

```sql
keccak256('s')
```

この暗号化ハッシュ関数は[EVMベースのブロックチェーン](https://ethereum.github.io/yellowpaper/paper.pdf)で多く使用されます。

**引数**

- s - Keccak-256ハッシュ計算のための入力文字列。[String](../data-types/string.md)。

**返される値**

- 固定長32バイトの配列としてのKeccak-256ハッシュ。[FixedString](../data-types/fixedstring.md)。

**例**

[hex](../functions/encoding-functions.md/#hex)関数を使用して結果を16進数エンコードされた文字列としてフォーマットします。

クエリ:
```sql
select hex(keccak256('hello'))
```

結果:
```sql
   ┌─hex(keccak256('hello'))──────────────────────────────────────────┐
1. │ 1C8AFF950685C2ED4BC3174F3472287B56D9517B9C948127319A09A7A36DEAC8 │
   └──────────────────────────────────────────────────────────────────┘
```
