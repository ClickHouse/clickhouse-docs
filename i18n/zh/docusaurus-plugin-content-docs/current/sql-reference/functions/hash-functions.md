
---
slug: /sql-reference/functions/hash-functions
sidebar_position: 85
sidebar_label: Hash
---

# Hash 函数

哈希函数可用于元素的确定性伪随机混洗。

Simhash 是一种哈希函数，对于相似的参数返回接近的哈希值。
## halfMD5 {#halfmd5}

[将所有输入参数解读](https://clickhouse.com/sql-reference/functions/type-conversion-functions#reinterpretasstring)为字符串，并计算每个字符串的 [MD5](https://en.wikipedia.org/wiki/MD5) 哈希值。然后组合这些哈希值，取结果字符串哈希的前 8 字节，并将其解释为大端字节序的 `UInt64`。

```sql
halfMD5(par1, ...)
```

该函数相对较慢（每秒每处理器核心只能处理 500 万个短字符串）。考虑使用 [sipHash64](#siphash64) 函数。

**参数**

此函数接受可变数量的输入参数。参数可以是任何经过[支持的数据类型](../data-types/index.md)。对于某些数据类型，即使参数的类型不同（不同大小的整数、相同数据的有名和无名的 `Tuple`、相同数据的 `Map` 和对应的 `Array(Tuple(key, value))` 类型），哈希函数计算的值可能也会相同。

**返回值**

返回一个 [UInt64](../data-types/int-uint.md) 数据类型的哈希值。

**示例**

```sql
SELECT halfMD5(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS halfMD5hash, toTypeName(halfMD5hash) AS type;
```

```response
┌────────halfMD5hash─┬─type───┐
│ 186182704141653334 │ UInt64 │
└────────────────────┴────────┘
```
## MD4 {#md4}

计算字符串的 MD4，并将结果字节集返回为 FixedString(16)。
## MD5 {#md5}

计算字符串的 MD5，并将结果字节集返回为 FixedString(16)。如果你并不特别需要 MD5，但需要一个合适的 128 位加密哈希，则应使用 `sipHash128` 函数。如果你想要与 `md5sum` 工具输出相同的结果，请使用 lower(hex(MD5(s)))。
## RIPEMD160 {#ripemd160}

生成 [RIPEMD-160](https://en.wikipedia.org/wiki/RIPEMD) 哈希值。

**语法**

```sql
RIPEMD160(input)
```

**参数**

- `input`：输入字符串。[String](../data-types/string.md)

**返回值**

- 160 位 `RIPEMD-160` 哈希值，类型为 [FixedString(20)](../data-types/fixedstring.md)。

**示例**

使用 [hex](../functions/encoding-functions.md/#hex) 函数将结果表示为十六进制编码字符串。

查询：

```sql
SELECT HEX(RIPEMD160('The quick brown fox jumps over the lazy dog'));
```

```response
┌─HEX(RIPEMD160('The quick brown fox jumps over the lazy dog'))─┐
│ 37F332F68DB77BD9D7EDD4969571AD671CF9DD3B                      │
└───────────────────────────────────────────────────────────────┘
```
## sipHash64 {#siphash64}

生成 64 位 [SipHash](https://en.wikipedia.org/wiki/SipHash) 哈希值。

```sql
sipHash64(par1,...)
```

这是一种加密哈希函数。它的工作速度至少是 [MD5](#md5) 哈希函数的三倍。

该函数 [将输入参数解读](https://clickhouse.com/sql-reference/functions/type-conversion-functions#reinterpretasstring)为字符串，并计算每个参数的哈希值。然后通过以下算法组合哈希值：

1. 第一个和第二个哈希值连接到一个数组中并进行哈希。
2. 之前计算的哈希值与第三个输入参数的哈希值以类似的方式进行哈希。
3. 这个计算将对所有剩余的原始输入哈希值重复进行。

**参数**

该函数接受可变数量的输入参数，参数可以是任何经过[支持的数据类型](../data-types/index.md)。

**返回值**

返回一个 [UInt64](../data-types/int-uint.md) 数据类型的哈希值。

请注意，对于不同参数类型的相同输入值，计算得出的哈希值可能会相等。例如不同大小的整数类型、有名和无名的 `Tuple` 具有相同数据、`Map` 和相应的 `Array(Tuple(key, value))` 类型具有相同数据都会受到影响。

**示例**

```sql
SELECT sipHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS SipHash, toTypeName(SipHash) AS type;
```

```response
┌──────────────SipHash─┬─type───┐
│ 11400366955626497465 │ UInt64 │
└──────────────────────┴────────┘
```
## sipHash64Keyed {#siphash64keyed}

与 [sipHash64](#siphash64) 相同，但额外接受一个显式的密钥参数，而不是使用固定密钥。

**语法**

```sql
sipHash64Keyed((k0, k1), par1,...)
```

**参数**

与 [sipHash64](#siphash64) 相同，但第一个参数是包含两个 UInt64 值的元组，代表密钥。

**返回值**

返回一个 [UInt64](../data-types/int-uint.md) 数据类型的哈希值。

**示例**

查询：

```sql
SELECT sipHash64Keyed((506097522914230528, 1084818905618843912), array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS SipHash, toTypeName(SipHash) AS type;
```

```response
┌─────────────SipHash─┬─type───┐
│ 8017656310194184311 │ UInt64 │
└─────────────────────┴────────┘
```
## sipHash128 {#siphash128}

与 [sipHash64](#siphash64) 类似，但生成 128 位哈希值，即最终的 xor-folding 状态处理至 128 位。

:::note
这种 128 位变体与参考实现不同，它较弱。这种版本存在的原因是，在撰写时，没有官方的 128 位 SipHash 扩展。新的项目可能应使用 [sipHash128Reference](#siphash128reference)。
:::

**语法**

```sql
sipHash128(par1,...)
```

**参数**

与 [sipHash64](#siphash64) 相同。

**返回值**

返回类型为 [FixedString(16)](../data-types/fixedstring.md) 的 128 位 `SipHash` 哈希值。

**示例**

查询：

```sql
SELECT hex(sipHash128('foo', '\x01', 3));
```

结果：

```response
┌─hex(sipHash128('foo', '', 3))────┐
│ 9DE516A64A414D4B1B609415E4523F24 │
└──────────────────────────────────┘
```
## sipHash128Keyed {#siphash128keyed}

与 [sipHash128](#siphash128) 类似，但额外接受一个显式的密钥参数，而不是使用固定密钥。

:::note
这种 128 位变体与参考实现不同，它较弱。这种版本存在的原因是，在撰写时，没有官方的 128 位 SipHash 扩展。新的项目可能应使用 [sipHash128ReferenceKeyed](#siphash128referencekeyed)。
:::

**语法**

```sql
sipHash128Keyed((k0, k1), par1,...)
```

**参数**

与 [sipHash128](#siphash128) 相同，但第一个参数是包含两个 UInt64 值的元组，代表密钥。

**返回值**

返回一个 128 位 `SipHash` 哈希值，类型为 [FixedString(16)](../data-types/fixedstring.md)。

**示例**

查询：

```sql
SELECT hex(sipHash128Keyed((506097522914230528, 1084818905618843912),'foo', '\x01', 3));
```

结果：

```response
┌─hex(sipHash128Keyed((506097522914230528, 1084818905618843912), 'foo', '', 3))─┐
│ B8467F65C8B4CFD9A5F8BD733917D9BF                                              │
└───────────────────────────────────────────────────────────────────────────────┘
```
## sipHash128Reference {#siphash128reference}

与 [sipHash128](#siphash128) 类似，但实现了原始 SipHash 作者的 128 位算法。

**语法**

```sql
sipHash128Reference(par1,...)
```

**参数**

与 [sipHash128](#siphash128) 相同。

**返回值**

返回一个 128 位 `SipHash` 哈希值，类型为 [FixedString(16)](../data-types/fixedstring.md)。

**示例**

查询：

```sql
SELECT hex(sipHash128Reference('foo', '\x01', 3));
```

结果：

```response
┌─hex(sipHash128Reference('foo', '', 3))─┐
│ 4D1BE1A22D7F5933C0873E1698426260       │
└────────────────────────────────────────┘
```
## sipHash128ReferenceKeyed {#siphash128referencekeyed}

与 [sipHash128Reference](#siphash128reference) 类似，但额外接受一个显式的密钥参数，而不是使用固定密钥。

**语法**

```sql
sipHash128ReferenceKeyed((k0, k1), par1,...)
```

**参数**

与 [sipHash128Reference](#siphash128reference) 相同，但第一个参数是包含两个 UInt64 值的元组，代表密钥。

**返回值**

返回一个 128 位 `SipHash` 哈希值，类型为 [FixedString(16)](../data-types/fixedstring.md)。

**示例**

查询：

```sql
SELECT hex(sipHash128ReferenceKeyed((506097522914230528, 1084818905618843912),'foo', '\x01', 3));
```

结果：

```response
┌─hex(sipHash128ReferenceKeyed((506097522914230528, 1084818905618843912), 'foo', '', 3))─┐
│ 630133C9722DC08646156B8130C4CDC8                                                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
## cityHash64 {#cityhash64}

生成 64 位 [CityHash](https://github.com/google/cityhash) 哈希值。

```sql
cityHash64(par1,...)
```

这是一种快速的非加密哈希函数。对于字符串参数，它使用 CityHash 算法，对于其它数据类型的参数，使用实现特定的快速非加密哈希函数。该函数使用 CityHash 组合器获得最终结果。

请注意，谷歌在将 CityHash 添加到 ClickHouse 之后更改了 CityHash 的算法。换句话说，ClickHouse 的 cityHash64 和 Google 上游的 CityHash 现在生成不同的结果。ClickHouse cityHash64 对应于 CityHash v1.0.2。

**参数**

该函数接受可变数量的输入参数。参数可以是任何经过[支持的数据类型](../data-types/index.md)。对于某些数据类型，即使参数的类型不同（不同大小的整数、相同数据的有名和无名的 `Tuple`、相同数据的 `Map` 和对应的 `Array(Tuple(key, value))` 类型），哈希函数计算的值也可能相同。

**返回值**

返回一个 [UInt64](../data-types/int-uint.md) 数据类型的哈希值。

**示例**

调用示例：

```sql
SELECT cityHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS CityHash, toTypeName(CityHash) AS type;
```

```response
┌─────────────CityHash─┬─type───┐
│ 12072650598913549138 │ UInt64 │
└──────────────────────┴────────┘
```

以下示例演示如何计算整个表的校验和，精确到行顺序：

```sql
SELECT groupBitXor(cityHash64(*)) FROM table
```
## intHash32 {#inthash32}

从任意类型的整数计算 32 位哈希码。这是一种相对较快的非加密哈希函数，质量平均。

**语法**

```sql
intHash32(int)
```

**参数**

- `int` — 要哈希的整数。[(U)Int*](../data-types/int-uint.md)。

**返回值**

- 32 位哈希码。[UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT intHash32(42);
```

结果：

```response
┌─intHash32(42)─┐
│    1228623923 │
└───────────────┘
```
## intHash64 {#inthash64}

从任意类型的整数计算 64 位哈希码。这是一种相对较快的非加密哈希函数，质量平均。它的速度快于 [intHash32](#inthash32)。

**语法**

```sql
intHash64(int)
```

**参数**

- `int` — 要哈希的整数。[(U)Int*](../data-types/int-uint.md)。

**返回值**

- 64 位哈希码。[UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT intHash64(42);
```

结果：

```response
┌────────intHash64(42)─┐
│ 11490350930367293593 │
└──────────────────────┘
```
## SHA1, SHA224, SHA256, SHA512, SHA512_256 {#sha1-sha224-sha256-sha512-sha512_256}

从字符串计算 SHA-1、SHA-224、SHA-256、SHA-512、SHA-512-256 哈希，并将结果字节集返回为 [FixedString](../data-types/fixedstring.md)。

**语法**

```sql
SHA1('s')
...
SHA512('s')
```

该函数的工作速度相对较慢（SHA-1 每秒每处理器核心处理大约 500 万个短字符串，而 SHA-224 和 SHA-256 每秒大约处理 220 万个）。我们建议仅在需要特定哈希函数而无法选择时使用此函数。即使在这些情况下，我们也建议在插入时离线应用函数，预先计算值，而不是在 `SELECT` 查询中应用。

**参数**

- `s` — 用于 SHA 哈希计算的输入字符串。[String](../data-types/string.md)。

**返回值**

- SHA 哈希值，作为未编码的十六进制 FixedString。SHA-1 返回为 FixedString(20)，SHA-224 返回为 FixedString(28)，SHA-256 返回为 FixedString(32)，SHA-512 返回为 FixedString(64)。 [FixedString](../data-types/fixedstring.md)。

**示例**

使用 [hex](../functions/encoding-functions.md/#hex) 函数将结果表示为十六进制编码字符串。

查询：

```sql
SELECT hex(SHA1('abc'));
```

结果：

```response
┌─hex(SHA1('abc'))─────────────────────────┐
│ A9993E364706816ABA3E25717850C26C9CD0D89D │
└──────────────────────────────────────────┘
```
## BLAKE3 {#blake3}

计算 BLAKE3 哈希字符串，并将结果字节集返回为 [FixedString](../data-types/fixedstring.md)。

**语法**

```sql
BLAKE3('s')
```

该加密哈希函数与 BLAKE3 Rust 库集成在 ClickHouse 中。该函数相当快，性能比 SHA-2 快约两倍，同时生成与 SHA-256 相同长度的哈希。

**参数**

- s - 用于 BLAKE3 哈希计算的输入字符串。[String](../data-types/string.md)。

**返回值**

- 作为 FixedString(32) 的 BLAKE3 哈希。[FixedString](../data-types/fixedstring.md)。

**示例**

使用 [hex](../functions/encoding-functions.md/#hex) 函数将结果表示为十六进制编码字符串。

查询：
```sql
SELECT hex(BLAKE3('ABC'))
```

结果：
```sql
┌─hex(BLAKE3('ABC'))───────────────────────────────────────────────┐
│ D1717274597CF0289694F75D96D444B992A096F1AFD8E7BBFA6EBB1D360FEDFC │
└──────────────────────────────────────────────────────────────────┘
```
## URLHash(url\[, N\]) {#urlhashurl-n}

一种快速、质量良好的非加密哈希函数，用于从 URL 获得的字符串，使用某种类型的规范化。  
`URLHash(s)` – 从字符串计算哈希，若最后存在 `/`、`?` 或 `#` 之一则不包括它们。  
`URLHash(s, N)` – 从字符串计算哈希，计算到 URL 层级的 N 级，而不包括最后存在的 `/`、`?` 或 `#` 之一。层级与 URLHierarchy 相同。

## farmFingerprint64 {#farmfingerprint64}
## farmHash64 {#farmhash64}

生成 64 位 [FarmHash](https://github.com/google/farmhash) 或 Fingerprint 值。`farmFingerprint64` 是优选的稳定和可移植值。

```sql
farmFingerprint64(par1, ...)
farmHash64(par1, ...)
```

这些函数分别使用来自所有[可用方法](https://github.com/google/farmhash/blob/master/src/farmhash.h)的 `Fingerprint64` 和 `Hash64` 方法。

**参数**

该函数接受可变数量的输入参数。参数可以是任何经过[支持的数据类型](../data-types/index.md)。对于某些数据类型，即使参数的类型不同（不同大小的整数、相同数据的有名和无名的 `Tuple`、相同数据的 `Map` 和对应的 `Array(Tuple(key, value))` 类型），哈希函数计算的值也可能相同。

**返回值**

返回一个 [UInt64](../data-types/int-uint.md) 数据类型的哈希值。

**示例**

```sql
SELECT farmHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS FarmHash, toTypeName(FarmHash) AS type;
```

```response
┌─────────────FarmHash─┬─type───┐
│ 17790458267262532859 │ UInt64 │
└──────────────────────┴────────┘
```
## javaHash {#javahash}

计算来自 [string](http://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/String.java#l1452)、[Byte](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Byte.java#l405)、[Short](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Short.java#l410)、[Integer](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Integer.java#l959)、[Long](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Long.java#l1060) 的 JavaHash。这个哈希函数既不快也不具备良好的质量。使用它的唯一原因是当另一个系统已经使用此算法，并且您必须准确计算相同的结果。

请注意，Java 仅支持计算有符号整数哈希，因此如果您想计算无符号整数哈希，则必须将其转换为适当的有符号 ClickHouse 类型。

**语法**

```sql
SELECT javaHash('')
```

**返回值**

一个 `Int32` 数据类型的哈希值。

**示例**

查询：

```sql
SELECT javaHash(toInt32(123));
```

结果：

```response
┌─javaHash(toInt32(123))─┐
│               123      │
└────────────────────────┘
```

查询：

```sql
SELECT javaHash('Hello, world!');
```

结果：

```response
┌─javaHash('Hello, world!')─┐
│               -1880044555 │
└───────────────────────────┘
```
## javaHashUTF16LE {#javahashutf16le}

从字符串中计算 [JavaHash](http://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/String.java#l1452)，假设它包含表示 UTF-16LE 编码字符串的字节。

**语法**

```sql
javaHashUTF16LE(stringUtf16le)
```

**参数**

- `stringUtf16le` — UTF-16LE 编码的字符串。

**返回值**

一个 `Int32` 数据类型的哈希值。

**示例**

正确查询 UTF-16LE 编码字符串。

查询：

```sql
SELECT javaHashUTF16LE(convertCharset('test', 'utf-8', 'utf-16le'));
```

结果：

```response
┌─javaHashUTF16LE(convertCharset('test', 'utf-8', 'utf-16le'))─┐
│                                                      3556498 │
└──────────────────────────────────────────────────────────────┘
```
## hiveHash {#hivehash}

从字符串计算 `HiveHash`。

```sql
SELECT hiveHash('')
```

这只是将符号位清零的 [JavaHash](#javahash)。此函数在 [Apache Hive](https://en.wikipedia.org/wiki/Apache_Hive) 版本 3.0 之前使用。这个哈希函数既不快也不具备良好的质量。使用它的唯一原因是当另一个系统已经使用此算法，并且您必须准确计算相同的结果。

**返回值**

- `hiveHash` 哈希值。[Int32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT hiveHash('Hello, world!');
```

结果：

```response
┌─hiveHash('Hello, world!')─┐
│                 267439093 │
└───────────────────────────┘
```
## metroHash64 {#metrohash64}

生成 64 位 [MetroHash](http://www.jandrewrogers.com/2015/05/27/metrohash/) 哈希值。

```sql
metroHash64(par1, ...)
```

**参数**

该函数接受可变数量的输入参数。参数可以是任何经过[支持的数据类型](../data-types/index.md)。对于某些数据类型，即使参数的类型不同（不同大小的整数、相同数据的有名和无名的 `Tuple`、相同数据的 `Map` 和对应的 `Array(Tuple(key, value))` 类型），哈希函数计算的值也可能相同。

**返回值**

返回一个 [UInt64](../data-types/int-uint.md) 数据类型的哈希值。

**示例**

```sql
SELECT metroHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS MetroHash, toTypeName(MetroHash) AS type;
```

```response
┌────────────MetroHash─┬─type───┐
│ 14235658766382344533 │ UInt64 │
└──────────────────────┴────────┘
```
## jumpConsistentHash {#jumpconsistenthash}

计算来自 UInt64 的 JumpConsistentHash。接受两个参数：一个 UInt64 类型的键和桶的数量。返回 Int32。有关更多信息，请参见链接：[JumpConsistentHash](https://arxiv.org/pdf/1406.2294.pdf)
## kostikConsistentHash {#kostikconsistenthash}

Konstantin 'kostik' Oblakov 提出的 O(1) 时间和空间一致哈希算法。之前称为 `yandexConsistentHash`。

**语法**

```sql
kostikConsistentHash(input, n)
```

别名：`yandexConsistentHash`（为向后兼容而保留）。

**参数**

- `input`：一个 UInt64 类型的键 [UInt64](../data-types/int-uint.md)。
- `n`：桶的数量。[UInt16](../data-types/int-uint.md)。

**返回值**

- 一个 [UInt16](../data-types/int-uint.md) 数据类型的哈希值。

**实现细节**

当 n &lt;= 32768 时，它是有效的。

**示例**

查询：

```sql
SELECT kostikConsistentHash(16045690984833335023, 2);
```

```response
┌─kostikConsistentHash(16045690984833335023, 2)─┐
│                                             1 │
└───────────────────────────────────────────────┘
```
## murmurHash2_32, murmurHash2_64 {#murmurhash2_32-murmurhash2_64}

生成 [MurmurHash2](https://github.com/aappleby/smhasher) 哈希值。

```sql
murmurHash2_32(par1, ...)
murmurHash2_64(par1, ...)
```

**参数**

两个函数都接受可变数量的输入参数。参数可以是任何经过[支持的数据类型](../data-types/index.md)。对于某些数据类型，即使参数的类型不同（不同大小的整数、相同数据的有名和无名的 `Tuple`、相同数据的 `Map` 和对应的 `Array(Tuple(key, value))` 类型），哈希函数计算的值也可能相同。

**返回值**

- `murmurHash2_32` 函数返回类型为 [UInt32](../data-types/int-uint.md) 的哈希值。
- `murmurHash2_64` 函数返回类型为 [UInt64](../data-types/int-uint.md) 的哈希值。

**示例**

```sql
SELECT murmurHash2_64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS MurmurHash2, toTypeName(MurmurHash2) AS type;
```

```response
┌──────────MurmurHash2─┬─type───┐
│ 11832096901709403633 │ UInt64 │
└──────────────────────┴────────┘
```
## gccMurmurHash {#gccmurmurhash}

使用与 [gcc](https://github.com/gcc-mirror/gcc/blob/41d6b10e96a1de98e90a7c0378437c3255814b16/libstdc%2B%2B-v3/include/bits/functional_hash.h#L191) 相同的哈希种子计算 64 位 [MurmurHash2](https://github.com/aappleby/smhasher) 哈希值。它在 Clang 和 GCC 构建之间是可移植的。

**语法**

```sql
gccMurmurHash(par1, ...)
```

**参数**

- `par1, ...` — 可变数量的参数，可以是任何经过[支持的数据类型](/sql-reference/data-types)。

**返回值**

- 计算出的哈希值。[UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
    gccMurmurHash(1, 2, 3) AS res1,
    gccMurmurHash(('a', [1, 2, 3], 4, (4, ['foo', 'bar'], 1, (1, 2)))) AS res2
```

结果：

```response
┌─────────────────res1─┬────────────────res2─┐
│ 12384823029245979431 │ 1188926775431157506 │
└──────────────────────┴─────────────────────┘
```
## kafkaMurmurHash {#kafkamurmurhash}

使用与 [Kafka](https://github.com/apache/kafka/blob/461c5cfe056db0951d9b74f5adc45973670404d7/clients/src/main/java/org/apache/kafka/common/utils/Utils.java#L482) 相同的哈希种子计算 32 位 [MurmurHash2](https://github.com/aappleby/smhasher) 哈希值，并且不包括最高位，以与 [Default Partitioner](https://github.com/apache/kafka/blob/139f7709bd3f5926901a21e55043388728ccca78/clients/src/main/java/org/apache/kafka/clients/producer/internals/BuiltInPartitioner.java#L328) 兼容。

**语法**

```sql
MurmurHash(par1, ...)
```

**参数**

- `par1, ...` — 可变数量的参数，可以是任何经过[支持的数据类型](/sql-reference/data-types)。

**返回值**

- 计算出的哈希值。[UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
    kafkaMurmurHash('foobar') AS res1,
    kafkaMurmurHash(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS res2
```

结果：

```response
┌───────res1─┬─────res2─┐
│ 1357151166 │ 85479775 │
└────────────┴──────────┘
```
## murmurHash3_32, murmurHash3_64 {#murmurhash3_32-murmurhash3_64}

生成 [MurmurHash3](https://github.com/aappleby/smhasher) 哈希值。

```sql
murmurHash3_32(par1, ...)
murmurHash3_64(par1, ...)
```

**参数**

两个函数都接受可变数量的输入参数。参数可以是任何经过[支持的数据类型](../data-types/index.md)。对于某些数据类型，即使参数的类型不同（不同大小的整数、相同数据的有名和无名的 `Tuple`、相同数据的 `Map` 和对应的 `Array(Tuple(key, value))` 类型），哈希函数计算的值也可能相同。

**返回值**

- `murmurHash3_32` 函数返回类型为 [UInt32](../data-types/int-uint.md) 的哈希值。
- `murmurHash3_64` 函数返回类型为 [UInt64](../data-types/int-uint.md) 的哈希值。

**示例**

```sql
SELECT murmurHash3_32(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS MurmurHash3, toTypeName(MurmurHash3) AS type;
```

```response
┌─MurmurHash3─┬─type───┐
│     2152717 │ UInt32 │
└─────────────┴────────┘
```
## murmurHash3_128 {#murmurhash3_128}

生成 128 位 [MurmurHash3](https://github.com/aappleby/smhasher) 哈希值。

**语法**

```sql
murmurHash3_128(expr)
```

**参数**

- `expr` — 一系列 [表达式](/sql-reference/syntax#expressions)。 [String](../data-types/string.md)。

**返回值**

返回一个 128 位 `MurmurHash3` 哈希值。[FixedString(16)](../data-types/fixedstring.md)。

**示例**

查询：

```sql
SELECT hex(murmurHash3_128('foo', 'foo', 'foo'));
```

结果：

```response
┌─hex(murmurHash3_128('foo', 'foo', 'foo'))─┐
│ F8F7AD9B6CD4CF117A71E277E2EC2931          │
└───────────────────────────────────────────┘
```
## xxh3 {#xxh3}

生成 64 位 [xxh3](https://github.com/Cyan4973/xxHash) 哈希值。

**语法**

```sql
xxh3(expr)
```

**参数**

- `expr` — 一系列 [表达式](/sql-reference/syntax#expressions) 的任何数据类型。

**返回值**

返回一个 64 位 `xxh3` 哈希值。[UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT xxh3('Hello', 'world')
```

结果：

```response
┌─xxh3('Hello', 'world')─┐
│    5607458076371731292 │
└────────────────────────┘
```
## xxHash32, xxHash64 {#xxhash32-xxhash64}

从字符串计算 `xxHash`。提供两种形式，32 位和 64 位。

```sql
SELECT xxHash32('')

OR

SELECT xxHash64('')
```

**返回值**

- 哈希值。[UInt32/64](../data-types/int-uint.md)。

:::note
返回类型对于 `xxHash32` 将是 `UInt32`，而对于 `xxHash64` 将是 `UInt64`。
:::

**示例**

查询：

```sql
SELECT xxHash32('Hello, world!');
```

结果：

```response
┌─xxHash32('Hello, world!')─┐
│                 834093149 │
└───────────────────────────┘
```

**参见**

- [xxHash](http://cyan4973.github.io/xxHash/).
## ngramSimHash {#ngramsimhash}

将 ASCII 字符串拆分为 `ngramsize` 符号的 n-gram，并返回 n-gram `simhash`。区分大小写。

可用于检测[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance) 所示的半重复字符串。计算出的两个字符串的 `simhashes` 的汉明距离越小，这些字符串越可能相同。

**语法**

```sql
ngramSimHash(string[, ngramsize])
```

**参数**

- `string` — 字符串。[String](../data-types/string.md)。
- `ngramsize` — n-gram 的大小。可选。可能值：`1` 到 `25` 之间的任意数字。默认值：`3`。[UInt8](../data-types/int-uint.md)。

**返回值**

- 哈希值。[UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT ngramSimHash('ClickHouse') AS Hash;
```

结果：

```response
┌───────Hash─┐
│ 1627567969 │
└────────────┘
```
## ngramSimHashCaseInsensitive {#ngramsimhashcaseinsensitive}

将 ASCII 字符串拆分为 `ngramsize` 符号的 n-gram，并返回 n-gram `simhash`。不区分大小写。

可用于检测[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance) 所示的半重复字符串。计算出的两个字符串的 `simhashes` 的汉明距离越小，这些字符串越可能相同。

**语法**

```sql
ngramSimHashCaseInsensitive(string[, ngramsize])
```

**参数**

- `string` — 字符串。[String](../data-types/string.md)。
- `ngramsize` — n-gram 的大小。可选。可能值：`1` 到 `25` 之间的任意数字。默认值：`3`。[UInt8](../data-types/int-uint.md)。

**返回值**

- 哈希值。[UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT ngramSimHashCaseInsensitive('ClickHouse') AS Hash;
```

结果：

```response
┌──────Hash─┐
│ 562180645 │
└───────────┘
```
## ngramSimHashUTF8 {#ngramsimhashutf8}

将 UTF-8 字符串拆分为 `ngramsize` 符号的 n-gram，并返回 n-gram `simhash`。区分大小写。

可用于检测[bitHammingDistance](../functions/bit-functions.md/#bithammingdistance) 所示的半重复字符串。计算出的两个字符串的 `simhashes` 的汉明距离越小，这些字符串越可能相同。

**语法**

```sql
ngramSimHashUTF8(string[, ngramsize])
```

**参数**

- `string` — 字符串。[String](../data-types/string.md)。
- `ngramsize` — n-gram 的大小。可选。可能值：`1` 到 `25` 之间的任意数字。默认值：`3`。[UInt8](../data-types/int-uint.md)。

**返回值**

- 哈希值。[UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT ngramSimHashUTF8('ClickHouse') AS Hash;
```

结果：

```response
┌───────Hash─┐
│ 1628157797 │
└────────────┘
```

## ngramSimHashCaseInsensitiveUTF8 {#ngramsimhashcaseinsensitiveutf8}

将一个 UTF-8 字符串分割为 `ngramsize` 符号的 n-gram，并返回 n-gram 的 `simhash`。不区分大小写。

可以用于检测半重复字符串，使用 [bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)。计算出的两个字符串的 `simhashes` 之间的 [汉明距离](https://en.wikipedia.org/wiki/Hamming_distance) 越小，这两个字符串相同的可能性就越大。

**语法**

```sql
ngramSimHashCaseInsensitiveUTF8(string[, ngramsize])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `ngramsize` — n-gram 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 哈希值。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT ngramSimHashCaseInsensitiveUTF8('ClickHouse') AS Hash;
```

结果：

```response
┌───────Hash─┐
│ 1636742693 │
└────────────┘
```

## wordShingleSimHash {#wordshinglesimhash}

将一个 ASCII 字符串分割为 `shinglesize` 个单词的部分（shingles），并返回单词 shingle 的 `simhash`。区分大小写。

可以用于检测半重复字符串，使用 [bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)。计算出的两个字符串的 `simhashes` 之间的 [汉明距离](https://en.wikipedia.org/wiki/Hamming_distance) 越小，这两个字符串相同的可能性就越大。

**语法**

```sql
wordShingleSimHash(string[, shinglesize])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `shinglesize` — 单词 shingle 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 哈希值。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT wordShingleSimHash('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Hash;
```

结果：

```response
┌───────Hash─┐
│ 2328277067 │
└────────────┘
```

## wordShingleSimHashCaseInsensitive {#wordshinglesimhashcaseinsensitive}

将一个 ASCII 字符串分割为 `shinglesize` 个单词的部分（shingles），并返回单词 shingle 的 `simhash`。不区分大小写。

可以用于检测半重复字符串，使用 [bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)。计算出的两个字符串的 `simhashes` 之间的 [汉明距离](https://en.wikipedia.org/wiki/Hamming_distance) 越小，这两个字符串相同的可能性就越大。

**语法**

```sql
wordShingleSimHashCaseInsensitive(string[, shinglesize])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `shinglesize` — 单词 shingle 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 哈希值。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT wordShingleSimHashCaseInsensitive('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Hash;
```

结果：

```response
┌───────Hash─┐
│ 2194812424 │
└────────────┘
```

## wordShingleSimHashUTF8 {#wordshinglesimhashutf8}

将一个 UTF-8 字符串分割为 `shinglesize` 个单词的部分（shingles），并返回单词 shingle 的 `simhash`。区分大小写。

可以用于检测半重复字符串，使用 [bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)。计算出的两个字符串的 `simhashes` 之间的 [汉明距离](https://en.wikipedia.org/wiki/Hamming_distance) 越小，这两个字符串相同的可能性就越大。

**语法**

```sql
wordShingleSimHashUTF8(string[, shinglesize])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `shinglesize` — 单词 shingle 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 哈希值。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT wordShingleSimHashUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Hash;
```

结果：

```response
┌───────Hash─┐
│ 2328277067 │
└────────────┘
```

## wordShingleSimHashCaseInsensitiveUTF8 {#wordshinglesimhashcaseinsensitiveutf8}

将一个 UTF-8 字符串分割为 `shinglesize` 个单词的部分（shingles），并返回单词 shingle 的 `simhash`。不区分大小写。

可以用于检测半重复字符串，使用 [bitHammingDistance](../functions/bit-functions.md/#bithammingdistance)。计算出的两个字符串的 `simhashes` 之间的 [汉明距离](https://en.wikipedia.org/wiki/Hamming_distance) 越小，这两个字符串相同的可能性就越大。

**语法**

```sql
wordShingleSimHashCaseInsensitiveUTF8(string[, shinglesize])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `shinglesize` — 单词 shingle 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 哈希值。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT wordShingleSimHashCaseInsensitiveUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Hash;
```

结果：

```response
┌───────Hash─┐
│ 2194812424 │
└────────────┘
```

## wyHash64 {#wyhash64}

生成一个 64 位的 [wyHash64](https://github.com/wangyi-fudan/wyhash) 哈希值。

**语法**

```sql
wyHash64(string)
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。

**返回值**

- 哈希值。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT wyHash64('ClickHouse') AS Hash;
```

结果：

```response
┌─────────────────Hash─┐
│ 12336419557878201794 │
└──────────────────────┘
```

## ngramMinHash {#ngramminhash}

将一个 ASCII 字符串分割为 `ngramsize` 符号的 n-grams，并为每个 n-gram 计算哈希值。使用 `hashnum` 个最小哈希计算最小哈希，并使用 `hashnum` 个最大哈希计算最大哈希。返回包含这些哈希的元组。区分大小写。

可以用于检测半重复字符串，使用 [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)。对于两个字符串：如果返回的哈希中的一个在两个字符串中相同，则认为这两个字符串是相同的。

**语法**

```sql
ngramMinHash(string[, ngramsize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `ngramsize` — n-gram 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个哈希的元组 — 最小和最大。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**示例**

查询：

```sql
SELECT ngramMinHash('ClickHouse') AS Tuple;
```

结果：

```response
┌─Tuple──────────────────────────────────────┐
│ (18333312859352735453,9054248444481805918) │
└────────────────────────────────────────────┘
```

## ngramMinHashCaseInsensitive {#ngramminhashcaseinsensitive}

将一个 ASCII 字符串分割为 `ngramsize` 符号的 n-grams，并为每个 n-gram 计算哈希值。使用 `hashnum` 个最小哈希计算最小哈希，并使用 `hashnum` 个最大哈希计算最大哈希。返回包含这些哈希的元组。忽略大小写。

可以用于检测半重复字符串，使用 [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)。对于两个字符串：如果返回的哈希中的一个在两个字符串中相同，则认为这两个字符串是相同的。

**语法**

```sql
ngramMinHashCaseInsensitive(string[, ngramsize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `ngramsize` — n-gram 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个哈希的元组 — 最小和最大。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**示例**

查询：

```sql
SELECT ngramMinHashCaseInsensitive('ClickHouse') AS Tuple;
```

结果：

```response
┌─Tuple──────────────────────────────────────┐
│ (2106263556442004574,13203602793651726206) │
└────────────────────────────────────────────┘
```

## ngramMinHashUTF8 {#ngramminhashutf8}

将一个 UTF-8 字符串分割为 `ngramsize` 符号的 n-grams，并为每个 n-gram 计算哈希值。使用 `hashnum` 个最小哈希计算最小哈希，并使用 `hashnum` 个最大哈希计算最大哈希。返回包含这些哈希的元组。区分大小写。

可以用于检测半重复字符串，使用 [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)。对于两个字符串：如果返回的哈希中的一个在两个字符串中相同，则认为这两个字符串是相同的。

**语法**

```sql
ngramMinHashUTF8(string[, ngramsize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `ngramsize` — n-gram 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个哈希的元组 — 最小和最大。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**示例**

查询：

```sql
SELECT ngramMinHashUTF8('ClickHouse') AS Tuple;
```

结果：

```response
┌─Tuple──────────────────────────────────────┐
│ (18333312859352735453,6742163577938632877) │
└────────────────────────────────────────────┘
```

## ngramMinHashCaseInsensitiveUTF8 {#ngramminhashcaseinsensitiveutf8}

将一个 UTF-8 字符串分割为 `ngramsize` 符号的 n-grams，并为每个 n-gram 计算哈希值。使用 `hashnum` 个最小哈希计算最小哈希，并使用 `hashnum` 个最大哈希计算最大哈希。返回包含这些哈希的元组。忽略大小写。

可以用于检测半重复字符串，使用 [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)。对于两个字符串：如果返回的哈希中的一个在两个字符串中相同，则认为这两个字符串是相同的。

**语法**

```sql
ngramMinHashCaseInsensitiveUTF8(string [, ngramsize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `ngramsize` — n-gram 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个哈希的元组 — 最小和最大。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**示例**

查询：

```sql
SELECT ngramMinHashCaseInsensitiveUTF8('ClickHouse') AS Tuple;
```

结果：

```response
┌─Tuple───────────────────────────────────────┐
│ (12493625717655877135,13203602793651726206) │
└─────────────────────────────────────────────┘
```

## ngramMinHashArg {#ngramminhasharg}

将一个 ASCII 字符串分割为 `ngramsize` 符号的 n-grams，并返回通过 [ngramMinHash](#ngramminhash) 函数计算出的具有相同输入的最小和最大哈希的 n-grams。区分大小写。

**语法**

```sql
ngramMinHashArg(string[, ngramsize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `ngramsize` — n-gram 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个元组的元组，分别包含 `hashnum` 个 n-grams。 [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**示例**

查询：

```sql
SELECT ngramMinHashArg('ClickHouse') AS Tuple;
```

结果：

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('ous','ick','lic','Hou','kHo','use'),('Hou','lic','ick','ous','ckH','Cli')) │
└───────────────────────────────────────────────────────────────────────────────┘
```

## ngramMinHashArgCaseInsensitive {#ngramminhashargcaseinsensitive}

将一个 ASCII 字符串分割为 `ngramsize` 符号的 n-grams，并返回通过 [ngramMinHashCaseInsensitive](#ngramminhashcaseinsensitive) 函数计算出的具有相同输入的最小和最大哈希的 n-grams。忽略大小写。

**语法**

```sql
ngramMinHashArgCaseInsensitive(string[, ngramsize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `ngramsize` — n-gram 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个元组的元组，分别包含 `hashnum` 个 n-grams。 [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**示例**

查询：

```sql
SELECT ngramMinHashArgCaseInsensitive('ClickHouse') AS Tuple;
```

结果：

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('ous','ick','lic','kHo','use','Cli'),('kHo','lic','ick','ous','ckH','Hou')) │
└───────────────────────────────────────────────────────────────────────────────┘
```

## ngramMinHashArgUTF8 {#ngramminhashargutf8}

将一个 UTF-8 字符串分割为 `ngramsize` 符号的 n-grams，并返回通过 [ngramMinHashUTF8](#ngramminhashutf8) 函数计算出的具有相同输入的最小和最大哈希的 n-grams。区分大小写。

**语法**

```sql
ngramMinHashArgUTF8(string[, ngramsize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `ngramsize` — n-gram 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个元组的元组，分别包含 `hashnum` 个 n-grams。 [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**示例**

查询：

```sql
SELECT ngramMinHashArgUTF8('ClickHouse') AS Tuple;
```

结果：

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('ous','ick','lic','Hou','kHo','use'),('kHo','Hou','lic','ick','ous','ckH')) │
└───────────────────────────────────────────────────────────────────────────────┘
```

## ngramMinHashArgCaseInsensitiveUTF8 {#ngramminhashargcaseinsensitiveutf8}

将一个 UTF-8 字符串分割为 `ngramsize` 符号的 n-grams，并返回通过 [ngramMinHashCaseInsensitiveUTF8](#ngramminhashcaseinsensitiveutf8) 函数计算出的具有相同输入的最小和最大哈希的 n-grams。忽略大小写。

**语法**

```sql
ngramMinHashArgCaseInsensitiveUTF8(string[, ngramsize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `ngramsize` — n-gram 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个元组的元组，分别包含 `hashnum` 个 n-grams。 [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**示例**

查询：

```sql
SELECT ngramMinHashArgCaseInsensitiveUTF8('ClickHouse') AS Tuple;
```

结果：

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('ckH','ous','ick','lic','kHo','use'),('kHo','lic','ick','ous','ckH','Hou')) │
└───────────────────────────────────────────────────────────────────────────────┘
```

## wordShingleMinHash {#wordshingleminhash}

将一个 ASCII 字符串分割为 `shinglesize` 个单词的部分（shingles），并为每个单词 shingle 计算哈希值。使用 `hashnum` 个最小哈希计算最小哈希，并使用 `hashnum` 个最大哈希计算最大哈希。返回包含这些哈希的元组。区分大小写。

可以用于检测半重复字符串，使用 [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)。对于两个字符串：如果返回的哈希中的一个在两个字符串中相同，则认为这两个字符串是相同的。

**语法**

```sql
wordShingleMinHash(string[, shinglesize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `shinglesize` — 单词 shingle 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个哈希的元组 — 最小和最大。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**示例**

查询：

```sql
SELECT wordShingleMinHash('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Tuple;
```

结果：

```response
┌─Tuple──────────────────────────────────────┐
│ (16452112859864147620,5844417301642981317) │
└────────────────────────────────────────────┘
```

## wordShingleMinHashCaseInsensitive {#wordshingleminhashcaseinsensitive}

将一个 ASCII 字符串分割为 `shinglesize` 个单词的部分（shingles），并为每个单词 shingle 计算哈希值。使用 `hashnum` 个最小哈希计算最小哈希，并使用 `hashnum` 个最大哈希计算最大哈希。返回包含这些哈希的元组。忽略大小写。

可以用于检测半重复字符串，使用 [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)。对于两个字符串：如果返回的哈希中的一个在两个字符串中相同，则认为这两个字符串是相同的。

**语法**

```sql
wordShingleMinHashCaseInsensitive(string[, shinglesize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `shinglesize` — 单词 shingle 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个哈希的元组 — 最小和最大。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**示例**

查询：

```sql
SELECT wordShingleMinHashCaseInsensitive('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Tuple;
```

结果：

```response
┌─Tuple─────────────────────────────────────┐
│ (3065874883688416519,1634050779997673240) │
└───────────────────────────────────────────┘
```

## wordShingleMinHashUTF8 {#wordshingleminhashutf8}

将一个 UTF-8 字符串分割为 `shinglesize` 个单词的部分（shingles），并为每个单词 shingle 计算哈希值。使用 `hashnum` 个最小哈希计算最小哈希，并使用 `hashnum` 个最大哈希计算最大哈希。返回包含这些哈希的元组。区分大小写。

可以用于检测半重复字符串，使用 [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)。对于两个字符串：如果返回的哈希中的一个在两个字符串中相同，则认为这两个字符串是相同的。

**语法**

```sql
wordShingleMinHashUTF8(string[, shinglesize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `shinglesize` — 单词 shingle 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个哈希的元组 — 最小和最大。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**示例**

查询：

```sql
SELECT wordShingleMinHashUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Tuple;
```

结果：

```response
┌─Tuple──────────────────────────────────────┐
│ (16452112859864147620,5844417301642981317) │
└────────────────────────────────────────────┘
```

## wordShingleMinHashCaseInsensitiveUTF8 {#wordshingleminhashcaseinsensitiveutf8}

将一个 UTF-8 字符串分割为 `shinglesize` 个单词的部分（shingles），并为每个单词 shingle 计算哈希值。使用 `hashnum` 个最小哈希计算最小哈希，并使用 `hashnum` 个最大哈希计算最大哈希。返回包含这些哈希的元组。忽略大小写。

可以用于检测半重复字符串，使用 [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance)。对于两个字符串：如果返回的哈希中的一个在两个字符串中相同，则认为这两个字符串是相同的。

**语法**

```sql
wordShingleMinHashCaseInsensitiveUTF8(string[, shinglesize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `shinglesize` — 单词 shingle 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个哈希的元组 — 最小和最大。 [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md))。

**示例**

查询：

```sql
SELECT wordShingleMinHashCaseInsensitiveUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Tuple;
```

结果：

```response
┌─Tuple─────────────────────────────────────┐
│ (3065874883688416519,1634050779997673240) │
└───────────────────────────────────────────┘
```

## wordShingleMinHashArg {#wordshingleminhasharg}

将一个 ASCII 字符串分割为 `shinglesize` 个单词的部分（shingles），并返回通过 [wordshingleMinHash](#wordshingleminhash) 函数计算出的具有相同输入的最小和最大单词哈希的 shingles。区分大小写。

**语法**

```sql
wordShingleMinHashArg(string[, shinglesize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `shinglesize` — 单词 shingle 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个元组的元组，分别包含 `hashnum` 个单词 shingles。 [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**示例**

查询：

```sql
SELECT wordShingleMinHashArg('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).', 1, 3) AS Tuple;
```

结果：

```response
┌─Tuple─────────────────────────────────────────────────────────────────┐
│ (('OLAP','database','analytical'),('online','oriented','processing')) │
└───────────────────────────────────────────────────────────────────────┘
```

## wordShingleMinHashArgCaseInsensitive {#wordshingleminhashargcaseinsensitive}

将一个 ASCII 字符串分割为 `shinglesize` 个单词的部分（shingles），并返回通过 [wordShingleMinHashCaseInsensitive](#wordshingleminhashcaseinsensitive) 函数计算出的具有相同输入的最小和最大单词哈希的 shingles。忽略大小写。

**语法**

```sql
wordShingleMinHashArgCaseInsensitive(string[, shinglesize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `shinglesize` — 单词 shingle 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个元组的元组，分别包含 `hashnum` 个单词 shingles。 [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**示例**

查询：

```sql
SELECT wordShingleMinHashArgCaseInsensitive('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).', 1, 3) AS Tuple;
```

结果：

```response
┌─Tuple──────────────────────────────────────────────────────────────────┐
│ (('queries','database','analytical'),('oriented','processing','DBMS')) │
└────────────────────────────────────────────────────────────────────────┘
```

## wordShingleMinHashArgUTF8 {#wordshingleminhashargutf8}

将一个 UTF-8 字符串分割为 `shinglesize` 个单词的部分（shingles），并返回通过 [wordShingleMinHashUTF8](#wordshingleminhashutf8) 函数计算出的具有相同输入的最小和最大单词哈希的 shingles。区分大小写。

**语法**

```sql
wordShingleMinHashArgUTF8(string[, shinglesize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `shinglesize` — 单词 shingle 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 包含两个元组的元组，分别包含 `hashnum` 个单词 shingles。 [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**示例**

查询：

```sql
SELECT wordShingleMinHashArgUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).', 1, 3) AS Tuple;
```

结果：

```response
┌─Tuple─────────────────────────────────────────────────────────────────┐
│ (('OLAP','database','analytical'),('online','oriented','processing')) │
└───────────────────────────────────────────────────────────────────────┘
```
## wordShingleMinHashArgCaseInsensitiveUTF8 {#wordshingleminhashargcaseinsensitiveutf8}

将 UTF-8 字符串分割为每个 `shinglesize` 个单词的部分（shingles），并返回通过相同输入计算的最小和最大单词哈希值，这些哈希值是通过 [wordShingleMinHashCaseInsensitiveUTF8](#wordshingleminhashcaseinsensitiveutf8) 函数得出的。忽略大小写。

**语法**

```sql
wordShingleMinHashArgCaseInsensitiveUTF8(string[, shinglesize, hashnum])
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md)。
- `shinglesize` — 单词 shingles 的大小。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`3`。 [UInt8](../data-types/int-uint.md)。
- `hashnum` — 用于计算结果的最小和最大哈希的数量。可选。可能的值：从 `1` 到 `25` 的任何数字。默认值：`6`。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 元组，包含两个各自有 `hashnum` 个单词 shingle 的元组。 [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md)))。

**示例**

查询：

```sql
SELECT wordShingleMinHashArgCaseInsensitiveUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).', 1, 3) AS Tuple;
```

结果：

```response
┌─Tuple──────────────────────────────────────────────────────────────────┐
│ (('queries','database','analytical'),('oriented','processing','DBMS')) │
└────────────────────────────────────────────────────────────────────────┘
```
## sqidEncode {#sqidencode}

将数字编码为 [Sqid](https://sqids.org/)，这是类似于 YouTube 的 ID 字符串。
输出字母表为 `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`。
请勿将此函数用于哈希 - 生成的 ID 可解码回原始数字。

**语法**

```sql
sqidEncode(number1, ...)
```

别名：`sqid`

**参数**

- 可变数量的 UInt8、UInt16、UInt32 或 UInt64 数字。

**返回值**

一个 sqid [String](../data-types/string.md)。

**示例**

```sql
SELECT sqidEncode(1, 2, 3, 4, 5);
```

```response
┌─sqidEncode(1, 2, 3, 4, 5)─┐
│ gXHfJ1C6dN                │
└───────────────────────────┘
```
## sqidDecode {#sqiddecode}

将 [Sqid](https://sqids.org/) 解码回其原始数字。
如果输入字符串不是有效的 sqid，则返回空数组。

**语法**

```sql
sqidDecode(sqid)
```

**参数**

- 一个 sqid - [String](../data-types/string.md)

**返回值**

将 sqid 转换为数字的 [Array(UInt64)](../data-types/array.md)。

**示例**

```sql
SELECT sqidDecode('gXHfJ1C6dN');
```

```response
┌─sqidDecode('gXHfJ1C6dN')─┐
│ [1,2,3,4,5]              │
└──────────────────────────┘
```
