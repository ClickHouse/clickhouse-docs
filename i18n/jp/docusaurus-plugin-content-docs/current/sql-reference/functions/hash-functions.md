---
slug: '/sql-reference/functions/hash-functions'
sidebar_position: 85
sidebar_label: 'ハッシュ'
---

# ハッシュ関数

ハッシュ関数は、要素の決定論的擬似ランダムシャッフルに使用できます。

Simhashは、近い（類似の）引数に対して近似のハッシュ値を返すハッシュ関数です。
## halfMD5 {#halfmd5}

[すべての入力パラメータを文字列として解釈し](/sql-reference/functions/type-conversion-functions#reinterpretasstring)、それぞれの[MD5](https://en.wikipedia.org/wiki/MD5)ハッシュ値を計算します。次に、ハッシュを結合し、結果的な文字列のハッシュの最初の8バイトを取得し、それをビッグエンディアンのバイト順で`UInt64`として解釈します。

```sql
halfMD5(par1, ...)
```

この関数は比較的遅く（1秒あたりプロセッサコアごとに500万の短い文字列）、[sipHash64](#siphash64)関数を代わりに使用することを検討してください。

**引数**

この関数は可変数の入力パラメータを受け取ります。引数は[サポートされるデータ型](../data-types/index.md)のいずれかであることができます。いくつかのデータ型では、引数の型が異なっていても、同じ値に対してハッシュ関数の計算結果が同じになることがあります（異なるサイズの整数、同じデータを持つ命名された`Tuple`と非命名の`Tuple`、同じデータを持つ`Map`と対応する`Array(Tuple(key, value))`型）。

**返り値**

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

文字列からMD4を計算し、結果となるバイトセットをFixedString(16)として返します。
## MD5 {#md5}

文字列からMD5を計算し、結果となるバイトセットをFixedString(16)として返します。特にMD5が必要でない場合は、適切な暗号化128ビットハッシュとして'sipHash128'関数を代わりに使用してください。md5sumユーティリティから出力されるのと同じ結果を得るには、lower(hex(MD5(s)))を使用します。
## RIPEMD160 {#ripemd160}

[RIPEMD-160](https://en.wikipedia.org/wiki/RIPEMD)ハッシュ値を生成します。

**構文**

```sql
RIPEMD160(input)
```

**パラメータ**

- `input`: 入力文字列。[String](../data-types/string.md)

**返り値**

- タイプ[FixedString(20)](../data-types/fixedstring.md)の160ビット`RIPEMD-160`ハッシュ値。

**例**

[hex](../functions/encoding-functions.md/#hex)関数を使用して、結果を16進エンコードされた文字列として表現します。

クエリ:

```sql
SELECT HEX(RIPEMD160('The quick brown fox jumps over the lazy dog'));
```

```response
┌─HEX(RIPEMD160('The quick brown fox jumps over the lazy dog'))─┐
│ 37F332F68DB77BD9D7EDD4969571AD671CF9DD3B                      │
└───────────────────────────────────────────────────────────────┘
```
## sipHash64 {#siphash64}

64ビット[強力なSipHash](https://en.wikipedia.org/wiki/SipHash)ハッシュ値を生成します。

```sql
sipHash64(par1,...)
```

これは暗号化ハッシュ関数です。[MD5](#md5)ハッシュ関数よりも少なくとも3倍速く動作します。

この関数は[すべての入力パラメータを文字列として解釈します](/sql-reference/functions/type-conversion-functions#reinterpretasstring)およびそれぞれのハッシュ値を計算します。その後、次のアルゴリズムによってハッシュを結合します。

1. 最初のハッシュ値と2番目のハッシュ値が配列に連結され、それがハッシュされます。
2. 前に計算されたハッシュ値と3番目の入力パラメータのハッシュが同様にハッシュされます。
3. この計算は元の入力のすべての残りのハッシュ値に対して繰り返されます。

**引数**

この関数は、[サポートされるデータ型](../data-types/index.md)の任意の可変数の入力パラメータを受け取ります。

**返り値**

[UInt64](../data-types/int-uint.md)データ型のハッシュ値。

計算されたハッシュ値は、異なる引数の型の同じ入力値に対して等しい場合があることに注意が必要です。これは、異なるサイズの整数型、同じデータを持つ命名および非命名の`Tuple`、同じデータを持つ`Map`および対応する`Array(Tuple(key, value))`型に影響を与えます。

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

[sipHash64](#siphash64)と同様ですが、固定キーを使用せず、明示的なキー引数を受け取ります。

**構文**

```sql
sipHash64Keyed((k0, k1), par1,...)
```

**引数**

[sipHash64](#siphash64)と同様ですが、最初の引数はキーを表す2つのUInt64値のタプルです。

**返り値**

[UInt64](../data-types/int-uint.md)データ型のハッシュ値。

**例**

クエリ:

```sql
SELECT sipHash64Keyed((506097522914230528, 1084818905618843912), array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS SipHash, toTypeName(SipHash) AS type;
```

```response
┌─────────────SipHash─┬─type───┐
│ 8017656310194184311 │ UInt64 │
└─────────────────────┴────────┘
```
## sipHash128 {#siphash128}

[sipHash64](#siphash64)のように、128ビットのハッシュ値を生成します。最終的なxor-folding状態は128ビットまで行います。

:::note
この128ビットのバリアントは、リファレンス実装とは異なり、より弱いです。このバージョンは、執筆時にSipHashの公式128ビット拡張が存在しなかったために存在します。新しいプロジェクトは、[sipHash128Reference](#siphash128reference)を使用することを検討するべきです。
:::

**構文**

```sql
sipHash128(par1,...)
```

**引数**

[sipHash64](#siphash64)と同様。

**返り値**

[FixedString(16)](../data-types/fixedstring.md)型の128ビット`SipHash`ハッシュ値。

**例**

クエリ:

```sql
SELECT hex(sipHash128('foo', '\x01', 3));
```

結果:

```response
┌─hex(sipHash128('foo', '', 3))────┐
│ 9DE516A64A414D4B1B609415E4523F24 │
└──────────────────────────────────┘
```
## sipHash128Keyed {#siphash128keyed}

[sipHash128](#siphash128)と同様ですが、固定キーを使用せず、明示的なキー引数を受け取ります。

:::note
この128ビットのバリアントは、リファレンス実装とは異なり、より弱いです。このバージョンは、執筆時にSipHashの公式128ビット拡張が存在しなかったために存在します。新しいプロジェクトは、[sipHash128ReferenceKeyed](#siphash128referencekeyed)を使用することを検討するべきです。
:::

**構文**

```sql
sipHash128Keyed((k0, k1), par1,...)
```

**引数**

[sipHash128](#siphash128)と同様ですが、最初の引数はキーを表す2つのUInt64値のタプルです。

**返り値**

[FixedString(16)](../data-types/fixedstring.md)型の128ビット`SipHash`ハッシュ値。

**例**

クエリ:

```sql
SELECT hex(sipHash128Keyed((506097522914230528, 1084818905618843912),'foo', '\x01', 3));
```

結果:

```response
┌─hex(sipHash128Keyed((506097522914230528, 1084818905618843912), 'foo', '', 3))─┐
│ B8467F65C8B4CFD9A5F8BD733917D9BF                                              │
└───────────────────────────────────────────────────────────────────────────────┘
```
## sipHash128Reference {#siphash128reference}

[sipHash128](#siphash128)と同様ですが、SipHashの元の著者からの128ビットアルゴリズムを実装しています。

**構文**

```sql
sipHash128Reference(par1,...)
```

**引数**

[sipHash128](#siphash128)と同様。

**返り値**

[FixedString(16)](../data-types/fixedstring.md)型の128ビット`SipHash`ハッシュ値。

**例**

クエリ:

```sql
SELECT hex(sipHash128Reference('foo', '\x01', 3));
```

結果:

```response
┌─hex(sipHash128Reference('foo', '', 3))─┐
│ 4D1BE1A22D7F5933C0873E1698426260       │
└────────────────────────────────────────┘
```
## sipHash128ReferenceKeyed {#siphash128referencekeyed}

[sipHash128Reference](#siphash128reference)と同様ですが、固定キーを使用せず、明示的なキー引数を受け取ります。

**構文**

```sql
sipHash128ReferenceKeyed((k0, k1), par1,...)
```

**引数**

[sipHash128Reference](#siphash128reference)と同様ですが、最初の引数はキーを表す2つのUInt64値のタプルです。

**返り値**

[FixedString(16)](../data-types/fixedstring.md)型の128ビット`SipHash`ハッシュ値。

**例**

クエリ:

```sql
SELECT hex(sipHash128ReferenceKeyed((506097522914230528, 1084818905618843912),'foo', '\x01', 3));
```

結果:

```response
┌─hex(sipHash128ReferenceKeyed((506097522914230528, 1084818905618843912), 'foo', '', 3))─┐
│ 630133C9722DC08646156B8130C4CDC8                                                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
## cityHash64 {#cityhash64}

64ビット[CityHash](https://github.com/google/cityhash)ハッシュ値を生成します。

```sql
cityHash64(par1,...)
```

これは、非常に速い非暗号化ハッシュ関数です。文字列パラメータにはCityHashアルゴリズムを使用し、他のデータ型のパラメータには実装固有の高速非暗号化ハッシュ関数を使用します。この関数はCityHashの組み合わせメソッドを使用して最終結果を得ます。

Googleは、ClickHouseに追加された後にCityHashのアルゴリズムを変更しました。言い換えれば、ClickHouseのcityHash64とGoogleのアップストリームCityHashは現在異なる結果を生成します。ClickHouseのcityHash64はCityHash v1.0.2に対応しています。

**引数**

この関数は可変数の入力パラメータを受け取ります。引数は[サポートされるデータ型](../data-types/index.md)のいずれかであることができます。いくつかのデータ型では、引数の型が異なっていても、同じ値に対してハッシュ関数の計算結果が同じになることがあります（異なるサイズの整数、同じデータを持つ命名された`Tuple`と非命名の`Tuple`、同じデータを持つ`Map`と対応する`Array(Tuple(key, value))`型）。

**返り値**

[UInt64](../data-types/int-uint.md)データ型のハッシュ値。

**例**

コールの例:

```sql
SELECT cityHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS CityHash, toTypeName(CityHash) AS type;
```

```response
┌─────────────CityHash─┬─type───┐
│ 12072650598913549138 │ UInt64 │
└──────────────────────┴────────┘
```

次の例は、行の順序まで正確に全テーブルのチェックサムを計算する方法を示しています。

```sql
SELECT groupBitXor(cityHash64(*)) FROM table
```
## intHash32 {#inthash32}

任意の整数型の32ビットハッシュコードを計算します。
これは、数値に対して平均的な品質の比較的高速な非暗号化ハッシュ関数です。

**構文**

```sql
intHash32(int)
```

**引数**

- `int` — ハッシュする整数です。[（U）Int*](../data-types/int-uint.md)。

**返り値**

- 32ビットハッシュコード。[UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT intHash32(42);
```

結果:

```response
┌─intHash32(42)─┐
│    1228623923 │
└───────────────┘
```
## intHash64 {#inthash64}

任意の整数型の64ビットハッシュコードを計算します。
これは、数値に対して平均的な品質の比較的高速な非暗号化ハッシュ関数です。
これは[intHash32](#inthash32)よりも速く動作します。

**構文**

```sql
intHash64(int)
```

**引数**

- `int` — ハッシュする整数です。[（U）Int*](../data-types/int-uint.md)。

**返り値**

- 64ビットハッシュコード。[UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT intHash64(42);
```

結果:

```response
┌────────intHash64(42)─┐
│ 11490350930367293593 │
└──────────────────────┘
```
## SHA1, SHA224, SHA256, SHA512, SHA512_256 {#sha1-sha224-sha256-sha512-sha512_256}

文字列からSHA-1、SHA-224、SHA-256、SHA-512、SHA-512-256ハッシュを計算し、結果となるバイトセットを[FixedString](../data-types/fixedstring.md)として返します。

**構文**

```sql
SHA1('s')
...
SHA512('s')
```

この関数はかなり遅く動作します（SHA-1はプロセッサコアごとに1秒あたり約500万の短い文字列を処理し、SHA-224とSHA-256は約220万を処理します）。特定のハッシュ関数が必要で、選択できない場合を除いて、この関数の使用をお勧めします。それでもこれらのケースでは、`SELECT`クエリで適用するのではなく、オフラインでこの関数を適用し、テーブルに挿入する際に値を事前に計算することをお勧めします。

**引数**

- `s` — SHAハッシュ計算のための入力文字列。[String](../data-types/string.md)。

**返り値**

- SHAハッシュとして16進未エンコードのFixedStringとして返されます。SHA-1はFixedString(20)、SHA-224はFixedString(28)、SHA-256はFixedString(32)、SHA-512はFixedString(64)として返されます。[FixedString](../data-types/fixedstring.md)。

**例**

[hex](../functions/encoding-functions.md/#hex)関数を使用して、結果を16進エンコードされた文字列として表現します。

クエリ:

```sql
SELECT hex(SHA1('abc'));
```

結果:

```response
┌─hex(SHA1('abc'))─────────────────────────┐
│ A9993E364706816ABA3E25717850C26C9CD0D89D │
└──────────────────────────────────────────┘
```
## BLAKE3 {#blake3}

BLAKE3ハッシュ文字列を計算し、結果となるバイトセットを[FixedString](../data-types/fixedstring.md)として返します。

**構文**

```sql
BLAKE3('s')
```

この暗号化ハッシュ関数は、BLAKE3 RustライブラリでClickHouseに統合されています。この関数はかなり速く、SHA-2と同じ長さのハッシュを生成しながら、SHA-2よりも約2倍のパフォーマンスを示します。

**引数**

- s - BLAKE3ハッシュ計算のための入力文字列。[String](../data-types/string.md)。

**返り値**

- BLAKE3ハッシュとしてタイプFixedString(32)のバイト配列。[FixedString](../data-types/fixedstring.md)。

**例**

[hex](../functions/encoding-functions.md/#hex)関数を使用して、結果を16進エンコードされた文字列として表現します。

クエリ:
```sql
SELECT hex(BLAKE3('ABC'))
```

結果:
```sql
┌─hex(BLAKE3('ABC'))───────────────────────────────────────────────┐
│ D1717274597CF0289694F75D96D444B992A096F1AFD8E7BBFA6EBB1D360FEDFC │
└──────────────────────────────────────────────────────────────────┘
```
## URLHash(url[, N]) {#urlhashurl-n}

URLから得られた文字列に対して、いくつかのタイプの正規化を使用した高速で適度な品質の非暗号化ハッシュ関数です。
`URLHash(s)` – 終わりに`/`,`?`または`#`のいずれかのトレーリングシンボルがある場合、それを除去して文字列からハッシュを計算します。
`URLHash(s, N)` – トレーリングシンボルがある場合、NレベルのURL階層までの文字列からハッシュを計算します。
階層はURLHierarchyと同じです。
## farmFingerprint64 {#farmfingerprint64}
## farmHash64 {#farmhash64}

64ビット[FarmHash](https://github.com/google/farmhash)またはフィンガープリント値を生成します。`farmFingerprint64`は安定して移植可能な値のため好まれます。

```sql
farmFingerprint64(par1, ...)
farmHash64(par1, ...)
```

これらの関数は、それぞれ[利用可能なメソッド](https://github.com/google/farmhash/blob/master/src/farmhash.h)から`Fingerprint64`および`Hash64`メソッドを使用します。

**引数**

この関数は可変数の入力パラメータを受け取ります。引数は[サポートされるデータ型](../data-types/index.md)のいずれかであることができます。いくつかのデータ型では、引数の型が異なっていても、同じ値に対してハッシュ関数の計算結果が同じになることがあります（異なるサイズの整数、同じデータを持つ命名された`Tuple`と非命名の`Tuple`、同じデータを持つ`Map`と対応する`Array(Tuple(key, value))`型）。

**返り値**

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
[バイト](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Byte.java#l405),
[ショート](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Short.java#l410),
[整数](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Integer.java#l959),
[ロング](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Long.java#l1060)からJavaHashを計算します。
このハッシュ関数は速くもなく、良い品質を持っているわけでもありません。使用する唯一の理由は、このアルゴリズムが他のシステムで既に使用されている場合で、正確に同じ結果を計算する必要がある場合です。

Javaは符号付き整数のハッシュ計算のみをサポートしているため、符号なし整数のハッシュを計算する場合は、適切な符号付きClickHouse型にキャストする必要があります。

**構文**

```sql
SELECT javaHash('')
```

**返り値**

`Int32`データ型のハッシュ値。

**例**

クエリ:

```sql
SELECT javaHash(toInt32(123));
```

結果:

```response
┌─javaHash(toInt32(123))─┐
│               123      │
└────────────────────────┘
```

クエリ:

```sql
SELECT javaHash('Hello, world!');
```

結果:

```response
┌─javaHash('Hello, world!')─┐
│               -1880044555 │
└───────────────────────────┘
```
## javaHashUTF16LE {#javahashutf16le}

UTF-16LEエンコーディングで表される文字列から[JavaHash](http://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/String.java#l1452)を計算します。

**構文**

```sql
javaHashUTF16LE(stringUtf16le)
```

**引数**

- `stringUtf16le` — UTF-16LEエンコーディングの文字列。

**返り値**

`Int32`データ型のハッシュ値。

**例**

UTF-16LEエンコードされた文字列を持つ正しいクエリ。

クエリ:

```sql
SELECT javaHashUTF16LE(convertCharset('test', 'utf-8', 'utf-16le'));
```

結果:

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

これは、符号ビットをゼロにした[JavaHash](#javahash)に過ぎません。この関数は[Apache Hive](https://en.wikipedia.org/wiki/Apache_Hive)バージョン3.0より前で使用されます。このハッシュ関数は速くもなく、良い品質を持っているわけでもありません。使用する唯一の理由は、このアルゴリズムが他のシステムで既に使用されている場合で、正確に同じ結果を計算する必要がある場合です。

**返り値**

- `hiveHash`ハッシュ値。[Int32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT hiveHash('Hello, world!');
```

結果:

```response
┌─hiveHash('Hello, world!')─┐
│                 267439093 │
└───────────────────────────┘
```
## metroHash64 {#metrohash64}

64ビット[MetroHash](http://www.jandrewrogers.com/2015/05/27/metrohash/)ハッシュ値を生成します。

```sql
metroHash64(par1, ...)
```

**引数**

この関数は可変数の入力パラメータを受け取ります。引数は[サポートされるデータ型](../data-types/index.md)のいずれかであることができます。いくつかのデータ型では、引数の型が異なっていても、同じ値に対してハッシュ関数の計算結果が同じになることがあります（異なるサイズの整数、同じデータを持つ命名された`Tuple`と非命名の`Tuple`、同じデータを持つ`Map`と対応する`Array(Tuple(key, value))`型）。

**返り値**

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
2つの引数を受け入れます: UInt64型のキーとバケットの数。Int32を返します。
詳細については、次のリンクを参照してください: [JumpConsistentHash](https://arxiv.org/pdf/1406.2294.pdf)
## kostikConsistentHash {#kostikconsistenthash}

Konstantin 'kostik' OblakovによるO(1)時間とスペースの一貫したハッシュアルゴリズム。以前は`yandexConsistentHash`でした。

**構文**

```sql
kostikConsistentHash(input, n)
```

エイリアス: `yandexConsistentHash`（後方互換性のために残されています）。

**パラメータ**

- `input`: UInt64型のキー [UInt64](../data-types/int-uint.md)。
- `n`: バケットの数。[UInt16](../data-types/int-uint.md)。

**返り値**

- [UInt16](../data-types/int-uint.md)データ型のハッシュ値。

**実装の詳細**

n &lt;= 32768の場合にのみ効率的です。

**例**

クエリ:

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

両方の関数は、可変数の入力パラメータを受け取ります。引数は[サポートされるデータ型](../data-types/index.md)のいずれかであることができます。いくつかのデータ型では、引数の型が異なっていても、同じ値に対してハッシュ関数の計算結果が同じになることがあります（異なるサイズの整数、同じデータを持つ命名された`Tuple`と非命名の`Tuple`、同じデータを持つ`Map`と対応する`Array(Tuple(key, value))`型）。

**返り値**

- `murmurHash2_32`関数は[UInt32](../data-types/int-uint.md)データ型のハッシュ値を返します。
- `murmurHash2_64`関数は[UInt64](../data-types/int-uint.md)データ型のハッシュ値を返します。

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

64ビット[MurmurHash2](https://github.com/aappleby/smhasher)ハッシュ値を、[gcc](https://github.com/gcc-mirror/gcc/blob/41d6b10e96a1de98e90a7c0378437c3255814b16/libstdc%2B%2B-v3/include/bits/functional_hash.h#L191)と同じハッシュシードを使用して計算します。ClangおよびGCCビルド間でポータブルです。

**構文**

```sql
gccMurmurHash(par1, ...)
```

**引数**

- `par1, ...` — 任意の[サポートされるデータ型](https://sql-reference/data-types)の可変数のパラメータ。

**返り値**

- 計算されたハッシュ値。[UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
    gccMurmurHash(1, 2, 3) AS res1,
    gccMurmurHash(('a', [1, 2, 3], 4, (4, ['foo', 'bar'], 1, (1, 2)))) AS res2
```

結果:

```response
┌─────────────────res1─┬────────────────res2─┐
│ 12384823029245979431 │ 1188926775431157506 │
└──────────────────────┴─────────────────────┘
```
## kafkaMurmurHash {#kafkamurmurhash}

32ビット[MurmurHash2](https://github.com/aappleby/smhasher)ハッシュ値を[Kafka](https://github.com/apache/kafka/blob/461c5cfe056db0951d9b74f5adc45973670404d7/clients/src/main/java/org/apache/kafka/common/utils/Utils.java#L482)と同じハッシュシードを使用して計算し、[Default Partitioner](https://github.com/apache/kafka/blob/139f7709bd3f5926901a21e55043388728ccca78/clients/src/main/java/org/apache/kafka/clients/producer/internals/BuiltInPartitioner.java#L328)と互換性を持たせるために最高ビットを除外します。

**構文**

```sql
MurmurHash(par1, ...)
```

**引数**

- `par1, ...` — 任意の[サポートされるデータ型](../sql-reference/data-types)の可変数のパラメータ。

**返り値**

- 計算されたハッシュ値。[UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
    kafkaMurmurHash('foobar') AS res1,
    kafkaMurmurHash(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS res2
```

結果:

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

両方の関数は、可変数の入力パラメータを受け取ります。引数は[サポートされるデータ型](../data-types/index.md)のいずれかであることができます。いくつかのデータ型では、引数の型が異なっていても、同じ値に対してハッシュ関数の計算結果が同じになることがあります（異なるサイズの整数、同じデータを持つ命名された`Tuple`と非命名の`Tuple`、同じデータを持つ`Map`と対応する`Array(Tuple(key, value))`型）。

**返り値**

- `murmurHash3_32`関数は[UInt32](../data-types/int-uint.md)データ型のハッシュ値を返します。
- `murmurHash3_64`関数は[UInt64](../data-types/int-uint.md)データ型のハッシュ値を返します。

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

128ビット[MurmurHash3](https://github.com/aappleby/smhasher)ハッシュ値を生成します。

**構文**

```sql
murmurHash3_128(expr)
```

**引数**

- `expr` — [式のリスト](/sql-reference/syntax#expressions)。[String](../data-types/string.md)。

**返り値**

128ビット`MurmurHash3`ハッシュ値。[FixedString(16)](../data-types/fixedstring.md)。

**例**

クエリ:

```sql
SELECT hex(murmurHash3_128('foo', 'foo', 'foo'));
```

結果:

```response
┌─hex(murmurHash3_128('foo', 'foo', 'foo'))─┐
│ F8F7AD9B6CD4CF117A71E277E2EC2931          │
└───────────────────────────────────────────┘
```
## xxh3 {#xxh3}

64ビット[xxh3](https://github.com/Cyan4973/xxHash)ハッシュ値を生成します。

**構文**

```sql
xxh3(expr)
```

**引数**

- `expr` — 任意のデータ型の[式のリスト](/sql-reference/syntax#expressions)。

**返り値**

64ビット`xxh3`ハッシュ値。[UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT xxh3('Hello', 'world')
```

結果:

```response
┌─xxh3('Hello', 'world')─┐
│    5607458076371731292 │
└────────────────────────┘
```
## xxHash32, xxHash64 {#xxhash32-xxhash64}

文字列から`xxHash`を計算します。32ビットと64ビットの2つのフレーバーがあります。

```sql
SELECT xxHash32('')

OR

SELECT xxHash64('')
```

**返り値**

- ハッシュ値。[UInt32/64](../data-types/int-uint.md)。

:::note
返り値の型は、`xxHash32`の場合は`UInt32`、`xxHash64`の場合は`UInt64`になります。
:::

**例**

クエリ:

```sql
SELECT xxHash32('Hello, world!');
```

結果:

```response
┌─xxHash32('Hello, world!')─┐
│                 834093149 │
└───────────────────────────┘
```

**見よ**

- [xxHash](http://cyan4973.github.io/xxHash/).
## ngramSimHash {#ngramsimhash}

ASCII文字列を`ngramsize`シンボルのn-グラムに分割し、n-グラム`simhash`を返します。ケースに敏感です。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を使用して、半複製文字列の検出に使用できます。計算された2つの文字列の`simhashes`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
ngramSimHash(string[, ngramsize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。オプション。可能な値: `1`から`25`までの任意の数。デフォルト値: `3`。[UInt8](../data-types/int-uint.md)。

**返り値**

- ハッシュ値。[UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT ngramSimHash('ClickHouse') AS Hash;
```

結果:

```response
┌───────Hash─┐
│ 1627567969 │
└────────────┘
```
## ngramSimHashCaseInsensitive {#ngramsimhashcaseinsensitive}

ASCII文字列を`ngramsize`シンボルのn-グラムに分割し、n-グラム`simhash`を返します。ケースに無関係です。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を使用して、半複製文字列の検出に使用できます。計算された2つの文字列の`simhashes`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
ngramSimHashCaseInsensitive(string[, ngramsize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。オプション。可能な値: `1`から`25`までの任意の数。デフォルト値: `3`。[UInt8](../data-types/int-uint.md)。

**返り値**

- ハッシュ値。[UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT ngramSimHashCaseInsensitive('ClickHouse') AS Hash;
```

結果:

```response
┌──────Hash─┐
│ 562180645 │
└───────────┘
```
## ngramSimHashUTF8 {#ngramsimhashutf8}

UTF-8文字列を`ngramsize`シンボルのn-グラムに分割し、n-グラム`simhash`を返します。ケースに敏感です。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を使用して、半複製文字列の検出に使用できます。計算された2つの文字列の`simhashes`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
ngramSimHashUTF8(string[, ngramsize])
```

**引数**

- `string` — 文字列。[String](../data-types/string.md)。
- `ngramsize` — n-グラムのサイズ。オプション。可能な値: `1`から`25`までの任意の数。デフォルト値: `3`。[UInt8](../data-types/int-uint.md)。

**返り値**

- ハッシュ値。[UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT ngramSimHashUTF8('ClickHouse') AS Hash;
```

結果:

```response
┌───────Hash─┐
│ 1628157797 │
└────────────┘
```
```yaml
title: 'ngramSimHashCaseInsensitiveUTF8'
sidebar_label: 'ngramSimHashCaseInsensitiveUTF8'
keywords: ['ngram', 'simhash', 'utf8']
description: 'UTF-8文字列をn-グラムに分割し、n-グラムのsimhashを返します（大文字と小文字を区別しません）。'
```

## ngramSimHashCaseInsensitiveUTF8 {#ngramsimhashcaseinsensitiveutf8}

UTF-8文字列を`ngramsize`シンボルのn-グラムに分割し、n-グラムの`simhash`を返します。大文字と小文字を区別しません。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を使った半重複文字列の検出に使用できます。計算された2つの文字列の`simhashes`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
ngramSimHashCaseInsensitiveUTF8(string[, ngramsize])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md).

**返される値**

- ハッシュ値。 [UInt64](../data-types/int-uint.md).

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

```yaml
title: 'wordShingleSimHash'
sidebar_label: 'wordShingleSimHash'
keywords: ['word', 'shingle', 'simhash']
description: 'ASCII文字列を単語の部分（シングル）に分割し、単語シングルのsimhashを返します（大文字と小文字を区別します）。'
```

## wordShingleSimHash {#wordshinglesimhash}

ASCII文字列を`shinglesize`単語の部分（シングル）に分割し、単語シングルの`simhash`を返します。大文字と小文字を区別します。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を使った半重複文字列の検出に使用できます。計算された2つの文字列の`simhashes`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
wordShingleSimHash(string[, shinglesize])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md).

**返される値**

- ハッシュ値。 [UInt64](../data-types/int-uint.md).

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

```yaml
title: 'wordShingleSimHashCaseInsensitive'
sidebar_label: 'wordShingleSimHashCaseInsensitive'
keywords: ['word', 'shingle', 'simhash']
description: 'ASCII文字列を単語の部分（シングル）に分割し、単語シングルのsimhashを返します（大文字と小文字を区別しません）。'
```

## wordShingleSimHashCaseInsensitive {#wordshinglesimhashcaseinsensitive}

ASCII文字列を`shinglesize`単語の部分（シングル）に分割し、単語シングルの`simhash`を返します。大文字と小文字を区別しません。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を使った半重複文字列の検出に使用できます。計算された2つの文字列の`simhashes`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
wordShingleSimHashCaseInsensitive(string[, shinglesize])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).

**返される値**

- ハッシュ値。 [UInt64](../data-types/int-uint.md).

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

```yaml
title: 'wordShingleSimHashUTF8'
sidebar_label: 'wordShingleSimHashUTF8'
keywords: ['word', 'shingle', 'simhash']
description: 'UTF-8文字列を単語の部分（シングル）に分割し、単語シングルのsimhashを返します（大文字と小文字を区別します）。'
```

## wordShingleSimHashUTF8 {#wordshinglesimhashutf8}

UTF-8文字列を`shinglesize`単語の部分（シングル）に分割し、単語シングルの`simhash`を返します。大文字と小文字を区別します。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を使った半重複文字列の検出に使用できます。計算された2つの文字列の`simhashes`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
wordShingleSimHashUTF8(string[, shinglesize])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).

**返される値**

- ハッシュ値。 [UInt64](../data-types/int-uint.md).

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

```yaml
title: 'wordShingleSimHashCaseInsensitiveUTF8'
sidebar_label: 'wordShingleSimHashCaseInsensitiveUTF8'
keywords: ['word', 'shingle', 'simhash']
description: 'UTF-8文字列を単語の部分（シングル）に分割し、単語シングルのsimhashを返します（大文字と小文字を区別しません）。'
```

## wordShingleSimHashCaseInsensitiveUTF8 {#wordshinglesimhashcaseinsensitiveutf8}

UTF-8文字列を`shinglesize`単語の部分（シングル）に分割し、単語シングルの`simhash`を返します。大文字と小文字を区別しません。

[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)を使った半重複文字列の検出に使用できます。計算された2つの文字列の`simhashes`の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)が小さいほど、これらの文字列が同じである可能性が高くなります。

**構文**

```sql
wordShingleSimHashCaseInsensitiveUTF8(string[, shinglesize])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).

**返される値**

- ハッシュ値。 [UInt64](../data-types/int-uint.md).

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

```yaml
title: 'wyHash64'
sidebar_label: 'wyHash64'
keywords: ['wyhash', 'hash', '64-bit']
description: '64ビットのwyHash64ハッシュ値を生成します。'
```

## wyHash64 {#wyhash64}

64ビットの[wyHash64](https://github.com/wangyi-fudan/wyhash)ハッシュ値を生成します。

**構文**

```sql
wyHash64(string)
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).

**返される値**

- ハッシュ値。 [UInt64](../data-types/int-uint.md).

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

```yaml
title: 'ngramMinHash'
sidebar_label: 'ngramMinHash'
keywords: ['ngram', 'minhash', 'hash']
description: 'ASCII文字列をn-グラムに分割し、各n-グラムのハッシュ値を計算します。'
```

## ngramMinHash {#ngramminhash}

ASCII文字列を`ngramsize`シンボルのn-グラムに分割し、各n-グラムのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュのタプルを返します。大文字と小文字を区別します。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使った半重複文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが2つの文字列で同じ場合、それらの文字列は同じであると考えます。

**構文**

```sql
ngramMinHash(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md).
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md).

**返される値**

- 最小と最大の2つのハッシュを持つタプル。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

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

```yaml
title: 'ngramMinHashCaseInsensitive'
sidebar_label: 'ngramMinHashCaseInsensitive'
keywords: ['ngram', 'minhash', 'hash']
description: 'ASCII文字列をn-グラムに分割し、各n-グラムのハッシュ値を計算します（大文字と小文字を区別しません）。'
```

## ngramMinHashCaseInsensitive {#ngramminhashcaseinsensitive}

ASCII文字列を`ngramsize`シンボルのn-グラムに分割し、各n-グラムのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュのタプルを返します。大文字と小文字を区別しません。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使った半重複文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが2つの文字列で同じ場合、それらの文字列は同じであると考えます。

**構文**

```sql
ngramMinHashCaseInsensitive(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md).

**返される値**

- 最小と最大の2つのハッシュを持つタプル。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

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

```yaml
title: 'ngramMinHashUTF8'
sidebar_label: 'ngramMinHashUTF8'
keywords: ['ngram', 'minhash', 'hash']
description: 'UTF-8文字列をn-グラムに分割し、各n-グラムのハッシュ値を計算します。'
```

## ngramMinHashUTF8 {#ngramminhashutf8}

UTF-8文字列を`ngramsize`シンボルのn-グラムに分割し、各n-グラムのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュのタプルを返します。大文字と小文字を区別します。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使った半重複文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが2つの文字列で同じ場合、それらの文字列は同じであると考えます。

**構文**

```sql
ngramMinHashUTF8(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md).

**返される値**

- 最小と最大の2つのハッシュを持つタプル。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

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

```yaml
title: 'ngramMinHashCaseInsensitiveUTF8'
sidebar_label: 'ngramMinHashCaseInsensitiveUTF8'
keywords: ['ngram', 'minhash', 'hash']
description: 'UTF-8文字列をn-グラムに分割し、各n-グラムのハッシュ値を計算します（大文字と小文字を区別しません）。'
```

## ngramMinHashCaseInsensitiveUTF8 {#ngramminhashcaseinsensitiveutf8}

UTF-8文字列を`ngramsize`シンボルのn-グラムに分割し、各n-グラムのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュのタプルを返します。大文字と小文字を区別しません。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使った半重複文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが2つの文字列で同じ場合、それらの文字列は同じであると考えます。

**構文**

```sql
ngramMinHashCaseInsensitiveUTF8(string [, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md).

**返される値**

- 最小と最大の2つのハッシュを持つタプル。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

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

```yaml
title: 'ngramMinHashArg'
sidebar_label: 'ngramMinHashArg'
keywords: ['ngram', 'arg', 'hash']
description: 'ASCII文字列をn-グラムに分割し、同じ入力で[ngramMinHash](#ngramminhash)関数で計算された最小および最大ハッシュ付きのn-グラムを返します。'
```

## ngramMinHashArg {#ngramminhasharg}

ASCII文字列を`ngramsize`シンボルのn-グラムに分割し、同じ入力で[ngramMinHash](#ngramminhash)関数で計算された最小および最大ハッシュ付きのn-グラムを返します。大文字と小文字を区別します。

**構文**

```sql
ngramMinHashArg(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md).

**返される値**

- `hashnum` n-グラムを持つ2つのタプルを持つタプル。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md))).

**例**

クエリ:

```sql
SELECT ngramMinHashArg('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple───────────────────────────────────────────────────┐
│ (('ous','ick','lic','Hou','kHo','use'),('Hou','lic','ick','ous','ckH','Cli')) │
└─────────────────────────────────────────────────────────┘
```

```yaml
title: 'ngramMinHashArgCaseInsensitive'
sidebar_label: 'ngramMinHashArgCaseInsensitive'
keywords: ['ngram', 'arg', 'hash']
description: 'ASCII文字列をn-グラムに分割し、同じ入力で[ngramMinHashCaseInsensitive](#ngramminhashcaseinsensitive)関数で計算された最小および最大ハッシュ付きのn-グラムを返します（大文字と小文字を区別しません）。'
```

## ngramMinHashArgCaseInsensitive {#ngramminhashargcaseinsensitive}

ASCII文字列を`ngramsize`シンボルのn-グラムに分割し、同じ入力で[ngramMinHashCaseInsensitive](#ngramminhashcaseinsensitive)関数で計算された最小および最大ハッシュ付きのn-グラムを返します。大文字と小文字を区別しません。

**構文**

```sql
ngramMinHashArgCaseInsensitive(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md).

**返される値**

- `hashnum` n-グラムを持つ2つのタプルを持つタプル。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md))).

**例**

クエリ:

```sql
SELECT ngramMinHashArgCaseInsensitive('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple───────────────────────────────────────────────────┐
│ (('ous','ick','lic','kHo','use','Cli'),('kHo','lic','ick','ous','ckH','Hou')) │
└─────────────────────────────────────────────────────────┘
```

```yaml
title: 'ngramMinHashArgUTF8'
sidebar_label: 'ngramMinHashArgUTF8'
keywords: ['ngram', 'arg', 'hash']
description: 'UTF-8文字列をn-グラムに分割し、同じ入力で[ngramMinHashUTF8](#ngramminhashutf8)関数で計算された最小および最大ハッシュ付きのn-グラムを返します（大文字と小文字を区別します）。'
```

## ngramMinHashArgUTF8 {#ngramminhashargutf8}

UTF-8文字列を`ngramsize`シンボルのn-グラムに分割し、同じ入力で[ngramMinHashUTF8](#ngramminhashutf8)関数で計算された最小および最大ハッシュ付きのn-グラムを返します。大文字と小文字を区別します。

**構文**

```sql
ngramMinHashArgUTF8(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md).

**返される値**

- `hashnum` n-グラムを持つ2つのタプルを持つタプル。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md))).

**例**

クエリ:

```sql
SELECT ngramMinHashArgUTF8('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple───────────────────────────────────────────────────┐
│ (('ous','ick','lic','Hou','kHo','use'),('kHo','Hou','lic','ick','ous','ckH')) │
└─────────────────────────────────────────────────────────┘
```

```yaml
title: 'ngramMinHashArgCaseInsensitiveUTF8'
sidebar_label: 'ngramMinHashArgCaseInsensitiveUTF8'
keywords: ['ngram', 'arg', 'hash']
description: 'UTF-8文字列をn-グラムに分割し、同じ入力で[ngramMinHashCaseInsensitiveUTF8](#ngramminhashcaseinsensitiveutf8)関数で計算された最小および最大ハッシュ付きのn-グラムを返します（大文字と小文字を区別しません）。'
```

## ngramMinHashArgCaseInsensitiveUTF8 {#ngramminhashargcaseinsensitiveutf8}

UTF-8文字列を`ngramsize`シンボルのn-グラムに分割し、同じ入力で[ngramMinHashCaseInsensitiveUTF8](#ngramminhashcaseinsensitiveutf8)関数で計算された最小および最大ハッシュ付きのn-グラムを返します。大文字と小文字を区別しません。

**構文**

```sql
ngramMinHashArgCaseInsensitiveUTF8(string[, ngramsize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `ngramsize` — n-グラムのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md).

**返される値**

- `hashnum` n-グラムを持つ2つのタプルを持つタプル。[Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md))).

**例**

クエリ:

```sql
SELECT ngramMinHashArgCaseInsensitiveUTF8('ClickHouse') AS Tuple;
```

結果:

```response
┌─Tuple───────────────────────────────────────────────────┐
│ (('ckH','ous','ick','lic','kHo','use'),('kHo','lic','ick','ous','ckH','Hou')) │
└─────────────────────────────────────────────────────────┘
```

```yaml
title: 'wordShingleMinHash'
sidebar_label: 'wordShingleMinHash'
keywords: ['word', 'shingle', 'minhash']
description: 'ASCII文字列を単語の部分（シングル）に分割し、各単語シングルのハッシュ値を計算します。'
```

## wordShingleMinHash {#wordshingleminhash}

ASCII文字列を単語の部分（シングル）に分割し、各単語シングルのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュのタプルを返します。大文字と小文字を区別します。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使った半重複文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが2つの文字列で同じ場合、それらの文字列は同じであると考えます。

**構文**

```sql
wordShingleMinHash(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md).

**返される値**

- 最小と最大の2つのハッシュを持つタプル。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

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

```yaml
title: 'wordShingleMinHashCaseInsensitive'
sidebar_label: 'wordShingleMinHashCaseInsensitive'
keywords: ['word', 'shingle', 'minhash']
description: 'ASCII文字列を単語の部分（シングル）に分割し、各単語シングルのハッシュ値を計算します（大文字と小文字を区別しません）。'
```

## wordShingleMinHashCaseInsensitive {#wordshingleminhashcaseinsensitive}

ASCII文字列を単語の部分（シングル）に分割し、各単語シングルのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュのタプルを返します。大文字と小文字を区別しません。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使った半重複文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが2つの文字列で同じ場合、それらの文字列は同じであると考えます。

**構文**

```sql
wordShingleMinHashCaseInsensitive(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md).

**返される値**

- 最小と最大の2つのハッシュを持つタプル。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

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

```yaml
title: 'wordShingleMinHashUTF8'
sidebar_label: 'wordShingleMinHashUTF8'
keywords: ['word', 'shingle', 'minhash']
description: 'UTF-8文字列を単語の部分（シングル）に分割し、各単語シングルのハッシュ値を計算します。'
```

## wordShingleMinHashUTF8 {#wordshingleminhashutf8}

UTF-8文字列を単語の部分（シングル）に分割し、各単語シングルのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュのタプルを返します。大文字と小文字を区別します。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使った半重複文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが2つの文字列で同じ場合、それらの文字列は同じであると考えます。

**構文**

```sql
wordShingleMinHashUTF8(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md).

**返される値**

- 最小と最大の2つのハッシュを持つタプル。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

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

```yaml
title: 'wordShingleMinHashCaseInsensitiveUTF8'
sidebar_label: 'wordShingleMinHashCaseInsensitiveUTF8'
keywords: ['word', 'shingle', 'minhash']
description: 'UTF-8文字列を単語の部分（シングル）に分割し、各単語シングルのハッシュ値を計算します（大文字と小文字を区別しません）。'
```

## wordShingleMinHashCaseInsensitiveUTF8 {#wordshingleminhashcaseinsensitiveutf8}

UTF-8文字列を単語の部分（シングル）に分割し、各単語シングルのハッシュ値を計算します。`hashnum`最小ハッシュを使用して最小ハッシュを計算し、`hashnum`最大ハッシュを使用して最大ハッシュを計算します。これらのハッシュのタプルを返します。大文字と小文字を区別しません。

[tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)を使った半重複文字列の検出に使用できます。2つの文字列に対して：返されたハッシュの1つが2つの文字列で同じ場合、それらの文字列は同じであると考えます。

**構文**

```sql
wordShingleMinHashCaseInsensitiveUTF8(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md).
- `shinglesize` — 単語シングルのサイズ。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。[UInt8](../data-types/int-uint.md).
- `hashnum` — 結果を計算するために使用される最小ハッシュと最大ハッシュの数。オプション。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。[UInt8](../data-types/int-uint.md).

**返される値**

- 最小と最大の2つのハッシュを持つタプル。[Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

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

UTF-8文字列を`shinglesize`単語ごとの部分（シングル）に分割し、同じ入力の[wordShingleMinHashCaseInsensitiveUTF8](#wordshingleminhashcaseinsensitiveutf8)関数で計算された最小および最大の単語ハッシュを持つシングルを返します。大文字と小文字は区別されません。

**構文**

```sql
wordShingleMinHashArgCaseInsensitiveUTF8(string[, shinglesize, hashnum])
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md)。
- `shinglesize` — 単語シングルのサイズ。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 結果を計算するために使用される最小および最大ハッシュの数。省略可能。可能な値：`1`から`25`の任意の数。デフォルト値：`6`。 [UInt8](../data-types/int-uint.md)。

**返される値**

- `hashnum`の単語シングルそれぞれを持つ2つのタプルのタプル。 [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

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

数値を[Youtbe](https://sqids.org/)のようなID文字列としてエンコードします。
出力アルファベットは`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`です。
この関数をハッシュ化に使用しないでください - 生成されたIDは元の数値にデコードできます。

**構文**

```sql
sqidEncode(number1, ...)
```

エイリアス: `sqid`

**引数**

- UInt8、UInt16、UInt32またはUInt64の数値の可変数。

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
