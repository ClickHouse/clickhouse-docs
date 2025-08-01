---
description: 'Documentation for Functions for Working with IPv4 and IPv6 Addresses'
sidebar_label: 'IP Addresses'
sidebar_position: 95
slug: '/sql-reference/functions/ip-address-functions'
title: 'Functions for Working with IPv4 and IPv6 Addresses'
---





# IPv4 および IPv6 アドレスを操作するための関数

## IPv4NumToString {#IPv4NumToString}

UInt32 の数値を受け取ります。これをビッグエンディアンの IPv4 アドレスとして解釈します。対応する IPv4 アドレスを A.B.C.d 形式（小数形式のドット区切りの数値）で含む文字列を返します。

エイリアス: `INET_NTOA`.

## IPv4StringToNum {#IPv4StringToNum}

[IPv4NumToString](#IPv4NumToString) の逆の関数です。IPv4 アドレスの形式が無効な場合、例外をスローします。

エイリアス: `INET_ATON`.

## IPv4StringToNumOrDefault(s) {#ipv4stringtonumordefaults}

`IPv4StringToNum` と同様ですが、IPv4 アドレスの形式が無効な場合は 0 を返します。

## IPv4StringToNumOrNull(s) {#ipv4stringtonumornulls}

`IPv4StringToNum` と同様ですが、IPv4 アドレスの形式が無効な場合は null を返します。

## IPv4NumToStringClassC(num) {#ipv4numtostringclasscnum}

IPv4NumToString に似ていますが、最後のオクテットの代わりに xxx を使用します。

例:

```sql
SELECT
    IPv4NumToStringClassC(ClientIP) AS k,
    count() AS c
FROM test.hits
GROUP BY k
ORDER BY c DESC
LIMIT 10
```

```text
┌─k──────────────┬─────c─┐
│ 83.149.9.xxx   │ 26238 │
│ 217.118.81.xxx │ 26074 │
│ 213.87.129.xxx │ 25481 │
│ 83.149.8.xxx   │ 24984 │
│ 217.118.83.xxx │ 22797 │
│ 78.25.120.xxx  │ 22354 │
│ 213.87.131.xxx │ 21285 │
│ 78.25.121.xxx  │ 20887 │
│ 188.162.65.xxx │ 19694 │
│ 83.149.48.xxx  │ 17406 │
└────────────────┴───────┘
```

'xxx' を使用することは非常に珍しいため、今後変更される可能性があります。このフラグメントの正確な形式に依存しないことをお勧めします。

### IPv6NumToString(x) {#ipv6numtostringx}

バイナリ形式の IPv6 アドレスを含む FixedString(16) 値を受け取ります。このアドレスをテキスト形式で含む文字列を返します。IPv6 マップされた IPv4 アドレスは形式 ::ffff:111.222.33.44 で出力されます。

エイリアス: `INET6_NTOA`.

例:

```sql
SELECT IPv6NumToString(toFixedString(unhex('2A0206B8000000000000000000000011'), 16)) AS addr;
```

```text
┌─addr─────────┐
│ 2a02:6b8::11 │
└──────────────┘
```

```sql
SELECT
    IPv6NumToString(ClientIP6 AS k),
    count() AS c
FROM hits_all
WHERE EventDate = today() AND substring(ClientIP6, 1, 12) != unhex('00000000000000000000FFFF')
GROUP BY k
ORDER BY c DESC
LIMIT 10
```

```text
┌─IPv6NumToString(ClientIP6)──────────────┬─────c─┐
│ 2a02:2168:aaa:bbbb::2                   │ 24695 │
│ 2a02:2698:abcd:abcd:abcd:abcd:8888:5555 │ 22408 │
│ 2a02:6b8:0:fff::ff                      │ 16389 │
│ 2a01:4f8:111:6666::2                    │ 16016 │
│ 2a02:2168:888:222::1                    │ 15896 │
│ 2a01:7e00::ffff:ffff:ffff:222           │ 14774 │
│ 2a02:8109:eee:ee:eeee:eeee:eeee:eeee    │ 14443 │
│ 2a02:810b:8888:888:8888:8888:8888:8888  │ 14345 │
│ 2a02:6b8:0:444:4444:4444:4444:4444      │ 14279 │
│ 2a01:7e00::ffff:ffff:ffff:ffff          │ 13880 │
└─────────────────────────────────────────┴───────┘
```

```sql
SELECT
    IPv6NumToString(ClientIP6 AS k),
    count() AS c
FROM hits_all
WHERE EventDate = today()
GROUP BY k
ORDER BY c DESC
LIMIT 10
```

```text
┌─IPv6NumToString(ClientIP6)─┬──────c─┐
│ ::ffff:94.26.111.111       │ 747440 │
│ ::ffff:37.143.222.4        │ 529483 │
│ ::ffff:5.166.111.99        │ 317707 │
│ ::ffff:46.38.11.77         │ 263086 │
│ ::ffff:79.105.111.111      │ 186611 │
│ ::ffff:93.92.111.88        │ 176773 │
│ ::ffff:84.53.111.33        │ 158709 │
│ ::ffff:217.118.11.22       │ 154004 │
│ ::ffff:217.118.11.33       │ 148449 │
│ ::ffff:217.118.11.44       │ 148243 │
└────────────────────────────┴────────┘
```

## IPv6StringToNum {#ipv6stringtonum}

[IPv6NumToString](#ipv6numtostringx) の逆の関数です。IPv6 アドレスの形式が無効な場合、例外をスローします。

入力文字列が有効な IPv4 アドレスを含む場合、その IPv6 同等物を返します。HEX は大文字または小文字を使用できます。

エイリアス: `INET6_ATON`.

**構文**

```sql
IPv6StringToNum(string)
```

**引数**

- `string` — IP アドレス。 [String](../data-types/string.md).

**返される値**

- バイナリ形式の IPv6 アドレス。 [FixedString(16)](../data-types/fixedstring.md).

**例**

クエリ:

```sql
SELECT addr, cutIPv6(IPv6StringToNum(addr), 0, 0) FROM (SELECT ['notaddress', '127.0.0.1', '1111::ffff'] AS addr) ARRAY JOIN addr;
```

結果:

```text
┌─addr───────┬─cutIPv6(IPv6StringToNum(addr), 0, 0)─┐
│ notaddress │ ::                                   │
│ 127.0.0.1  │ ::ffff:127.0.0.1                     │
│ 1111::ffff │ 1111::ffff                           │
└────────────┴──────────────────────────────────────┘
```

**関連項目**

- [cutIPv6](#cutipv6x-bytestocutforipv6-bytestocutforipv4).

## IPv6StringToNumOrDefault(s) {#ipv6stringtonumordefaults}

`IPv6StringToNum` と同様ですが、IPv6 アドレスの形式が無効な場合は 0 を返します。

## IPv6StringToNumOrNull(s) {#ipv6stringtonumornulls}

`IPv6StringToNum` と同様ですが、IPv6 アドレスの形式が無効な場合は null を返します。

## IPv4ToIPv6(x) {#ipv4toipv6x}

`UInt32` の数値を受け取ります。これを[ビッグエンディアン](https://en.wikipedia.org/wiki/Endianness) の IPv4 アドレスとして解釈します。バイナリ形式の IPv6 アドレスを含む `FixedString(16)` 値を返します。例:

```sql
SELECT IPv6NumToString(IPv4ToIPv6(IPv4StringToNum('192.168.0.1'))) AS addr;
```

```text
┌─addr───────────────┐
│ ::ffff:192.168.0.1 │
└────────────────────┘
```

## cutIPv6(x, bytesToCutForIPv6, bytesToCutForIPv4) {#cutipv6x-bytestocutforipv6-bytestocutforipv4}

バイナリ形式の IPv6 アドレスを含む FixedString(16) 値を受け取ります。指定されたバイト数を削除したアドレスをテキスト形式で含む文字列を返します。例えば:

```sql
WITH
    IPv6StringToNum('2001:0DB8:AC10:FE01:FEED:BABE:CAFE:F00D') AS ipv6,
    IPv4ToIPv6(IPv4StringToNum('192.168.0.1')) AS ipv4
SELECT
    cutIPv6(ipv6, 2, 0),
    cutIPv6(ipv4, 0, 2)
```

```text
┌─cutIPv6(ipv6, 2, 0)─────────────────┬─cutIPv6(ipv4, 0, 2)─┐
│ 2001:db8:ac10:fe01:feed:babe:cafe:0 │ ::ffff:192.168.0.0  │
└─────────────────────────────────────┴─────────────────────┘
```

## IPv4CIDRToRange(ipv4, Cidr), {#ipv4cidrtorangeipv4-cidr}

IPv4 および [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) を含む UInt8 値を受け取ります。サブネットの下限と上限の範囲を含む 2 つの IPv4 を持つタプルを返します。

```sql
SELECT IPv4CIDRToRange(toIPv4('192.168.5.2'), 16);
```

```text
┌─IPv4CIDRToRange(toIPv4('192.168.5.2'), 16)─┐
│ ('192.168.0.0','192.168.255.255')          │
└────────────────────────────────────────────┘
```

## IPv6CIDRToRange(ipv6, Cidr), {#ipv6cidrtorangeipv6-cidr}

IPv6 および CIDR を含む UInt8 値を受け取ります。サブネットの下限と上限の範囲を持つ 2 つの IPv6 を含むタプルを返します。

```sql
SELECT IPv6CIDRToRange(toIPv6('2001:0db8:0000:85a3:0000:0000:ac1f:8001'), 32);
```

```text
┌─IPv6CIDRToRange(toIPv6('2001:0db8:0000:85a3:0000:0000:ac1f:8001'), 32)─┐
│ ('2001:db8::','2001:db8:ffff:ffff:ffff:ffff:ffff:ffff')                │
└────────────────────────────────────────────────────────────────────────┘
```

## toIPv4 {#toipv4}

文字列または UInt32 形式の IPv4 アドレスを [IPv4](../data-types/ipv4.md) タイプに変換します。
[`IPv4StringToNum`](#IPv4StringToNum) および [IPv4NumToString](#IPv4NumToString) 関数に似ていますが、文字列と符号なし整数データ型の両方を入力引数としてサポートします。

**構文**

```sql
toIPv4(x)
```

**引数**

- `x` — IPv4 アドレス。 [`String`](../data-types/string.md), [`UInt8/16/32`](../data-types/int-uint.md).

**返される値**

- IPv4 アドレス。 [IPv4](../data-types/ipv4.md).

**例**

クエリ:

```sql
SELECT toIPv4('171.225.130.45');
```

結果:

```text
┌─toIPv4('171.225.130.45')─┐
│ 171.225.130.45           │
└──────────────────────────┘
```

クエリ:

```sql
WITH
    '171.225.130.45' as IPv4_string
SELECT
    hex(IPv4StringToNum(IPv4_string)),
    hex(toIPv4(IPv4_string))
```

結果:

```text
┌─hex(IPv4StringToNum(IPv4_string))─┬─hex(toIPv4(IPv4_string))─┐
│ ABE1822D                          │ ABE1822D                 │
└───────────────────────────────────┴──────────────────────────┘
```

クエリ:

```sql
SELECT toIPv4(2130706433);
```

結果:

```text
┌─toIPv4(2130706433)─┐
│ 127.0.0.1          │
└────────────────────┘
```

## toIPv4OrDefault {#toipv4ordefault}

`toIPv4` と同様ですが、IPv4 アドレスの形式が無効な場合は `0.0.0.0` (0 IPv4)、または提供された IPv4 デフォルトを返します。

**構文**

```sql
toIPv4OrDefault(string[, default])
```

**引数**

- `value` — IP アドレス。 [String](../data-types/string.md).
- `default` (オプション) — `string` の形式が無効な場合に返される値。 [IPv4](../data-types/ipv4.md).

**返される値**

- `string` が現在の IPv4 アドレスに変換されます。 [String](../data-types/string.md).

**例**

クエリ:

```sql
WITH
    '::ffff:127.0.0.1' AS valid_IPv6_string,
    'fe80:2030:31:24' AS invalid_IPv6_string
SELECT
    toIPv4OrDefault(valid_IPv6_string) AS valid,
    toIPv4OrDefault(invalid_IPv6_string) AS default,
    toIPv4OrDefault(invalid_IPv6_string, toIPv4('1.1.1.1')) AS provided_default;
```

結果:

```response
┌─valid───┬─default─┬─provided_default─┐
│ 0.0.0.0 │ 0.0.0.0 │ 1.1.1.1          │
└─────────┴─────────┴──────────────────┘
```

## toIPv4OrNull {#toipv4ornull}

[`toIPv4`](#toipv4) と同様ですが、IPv4 アドレスの形式が無効な場合は null を返します。

**構文**

```sql
toIPv4OrNull(string)
```

**引数**

- `string` — IP アドレス。 [String](../data-types/string.md).

**返される値**

- `string` が現在の IPv4 アドレスに変換されます。無効なアドレスの場合は null になります。 [String](../data-types/string.md).

**例**

クエリ:

```sql
WITH 'fe80:2030:31:24' AS invalid_IPv6_string
SELECT toIPv4OrNull(invalid_IPv6_string);
```

結果:

```text
┌─toIPv4OrNull(invalid_IPv6_string)─┐
│ ᴺᵁᴸᴸ                              │
└───────────────────────────────────┘
```

## toIPv4OrZero {#toipv4orzero}

[`toIPv4`](#toipv4) と同様ですが、IPv4 アドレスの形式が無効な場合は `0.0.0.0` を返します。

**構文**

```sql
toIPv4OrZero(string)
```

**引数**

- `string` — IP アドレス。 [String](../data-types/string.md).

**返される値**

- `string` が現在の IPv4 アドレスに変換されます。無効なアドレスの場合は `0.0.0.0` になります。 [String](../data-types/string.md).

**例**

クエリ:

```sql
WITH 'Not an IP address' AS invalid_IPv6_string
SELECT toIPv4OrZero(invalid_IPv6_string);
```

結果:

```text
┌─toIPv4OrZero(invalid_IPv6_string)─┐
│ 0.0.0.0                           │
└───────────────────────────────────┘
```

## toIPv6 {#toipv6}

文字列または UInt128 形式の IPv6 アドレスを [IPv6](../data-types/ipv6.md) タイプに変換します。文字列の場合、IPv6 アドレスの形式が無効な場合は空の値を返します。
[IPv6StringToNum](#ipv6stringtonum) および [IPv6NumToString](#ipv6numtostringx) 関数に似ており、IPv6 アドレスをバイナリ形式（つまり、`FixedString(16)`）に変換します。

入力文字列に有効な IPv4 アドレスが含まれている場合、その IPv6 同等物が返されます。

**構文**

```sql
toIPv6(string)
toIPv6(UInt128)
```

**引数**

- `x` — IP アドレス。 [`String`](../data-types/string.md) または [`UInt128`](../data-types/int-uint.md).

**返される値**

- IP アドレス。 [IPv6](../data-types/ipv6.md).

**例**

クエリ:

```sql
WITH '2001:438:ffff::407d:1bc1' AS IPv6_string
SELECT
    hex(IPv6StringToNum(IPv6_string)),
    hex(toIPv6(IPv6_string));
```

結果:

```text
┌─hex(IPv6StringToNum(IPv6_string))─┬─hex(toIPv6(IPv6_string))─────────┐
│ 20010438FFFF000000000000407D1BC1  │ 20010438FFFF000000000000407D1BC1 │
└───────────────────────────────────┴──────────────────────────────────┘
```

クエリ:

```sql
SELECT toIPv6('127.0.0.1');
```

結果:

```text
┌─toIPv6('127.0.0.1')─┐
│ ::ffff:127.0.0.1    │
└─────────────────────┘
```

## toIPv6OrDefault {#toipv6ordefault}

[`toIPv6`](#toipv6) と同様ですが、IPv6 アドレスの形式が無効な場合は `::` (0 IPv6) または提供された IPv6 デフォルトを返します。

**構文**

```sql
toIPv6OrDefault(string[, default])
```

**引数**

- `string` — IP アドレス。 [String](../data-types/string.md).
- `default` (オプション) — `string` の形式が無効な場合に返される値。 [IPv6](../data-types/ipv6.md).

**返される値**

- IPv6 アドレス [IPv6](../data-types/ipv6.md)、そうでない場合は `::` またはオプションの提供されたデフォルトが返されます。

**例**

クエリ:

```sql
WITH
    '127.0.0.1' AS valid_IPv4_string,
    '127.0.0.1.6' AS invalid_IPv4_string
SELECT
    toIPv6OrDefault(valid_IPv4_string) AS valid,
    toIPv6OrDefault(invalid_IPv4_string) AS default,
    toIPv6OrDefault(invalid_IPv4_string, toIPv6('1.1.1.1')) AS provided_default
```

結果:

```text
┌─valid────────────┬─default─┬─provided_default─┐
│ ::ffff:127.0.0.1 │ ::      │ ::ffff:1.1.1.1   │
└──────────────────┴─────────┴──────────────────┘
```

## toIPv6OrNull {#toipv6ornull}

[`toIPv6`](#toipv6) と同様ですが、IPv6 アドレスの形式が無効な場合は null を返します。

**構文**

```sql
toIPv6OrNull(string)
```

**引数**

- `string` — IP アドレス。 [String](../data-types/string.md).

**返される値**

- IP アドレス。 [IPv6](../data-types/ipv6.md)。無効な形式の場合は null を返します。

**例**

クエリ:

```sql
WITH '127.0.0.1.6' AS invalid_IPv4_string
SELECT toIPv6OrNull(invalid_IPv4_string);
```

結果:

```text
┌─toIPv6OrNull(invalid_IPv4_string)─┐
│ ᴺᵁᴸᴸ                              │
└───────────────────────────────────┘
```

## toIPv6OrZero {#toipv6orzero}

[`toIPv6`](#toipv6) と同様ですが、IPv6 アドレスの形式が無効な場合は `::` を返します。

**構文**

```sql
toIPv6OrZero(string)
```

**引数**

- `string` — IP アドレス。 [String](../data-types/string.md).

**返される値**

- IP アドレス。 [IPv6](../data-types/ipv6.md)。無効な形式の場合は `::` を返します。

**例**

クエリ:

```sql
WITH '127.0.0.1.6' AS invalid_IPv4_string
SELECT toIPv6OrZero(invalid_IPv4_string);
```

結果:

```text
┌─toIPv6OrZero(invalid_IPv4_string)─┐
│ ::                                │
└───────────────────────────────────┘
```

## IPv6StringToNumOrDefault(s) {#ipv6stringtonumordefaults-1}

`toIPv6` と同様ですが、IPv6 アドレスの形式が無効な場合は 0 を返します。

## IPv6StringToNumOrNull(s) {#ipv6stringtonumornulls-1}

`toIPv6` と同様ですが、IPv6 アドレスの形式が無効な場合は null を返します。

## isIPv4String {#isipv4string}

入力された文字列が IPv4 アドレスであるかどうかを判定します。`string` が IPv6 アドレスの場合、`0` を返します。

**構文**

```sql
isIPv4String(string)
```

**引数**

- `string` — IP アドレス。 [String](../data-types/string.md).

**返される値**

- `string` が IPv4 アドレスであれば `1`、そうでなければ `0`。 [UInt8](../data-types/int-uint.md).

**例**

クエリ:

```sql
SELECT addr, isIPv4String(addr) FROM ( SELECT ['0.0.0.0', '127.0.0.1', '::ffff:127.0.0.1'] AS addr ) ARRAY JOIN addr;
```

結果:

```text
┌─addr─────────────┬─isIPv4String(addr)─┐
│ 0.0.0.0          │                  1 │
│ 127.0.0.1        │                  1 │
│ ::ffff:127.0.0.1 │                  0 │
└──────────────────┴────────────────────┘
```

## isIPv6String {#isipv6string}

入力された文字列が IPv6 アドレスであるかどうかを判定します。`string` が IPv4 アドレスの場合、`0` を返します。

**構文**

```sql
isIPv6String(string)
```

**引数**

- `string` — IP アドレス。 [String](../data-types/string.md).

**返される値**

- `string` が IPv6 アドレスであれば `1`、そうでなければ `0`。 [UInt8](../data-types/int-uint.md).

**例**

クエリ:

```sql
SELECT addr, isIPv6String(addr) FROM ( SELECT ['::', '1111::ffff', '::ffff:127.0.0.1', '127.0.0.1'] AS addr ) ARRAY JOIN addr;
```

結果:

```text
┌─addr─────────────┬─isIPv6String(addr)─┐
│ ::               │                  1 │
│ 1111::ffff       │                  1 │
│ ::ffff:127.0.0.1 │                  1 │
│ 127.0.0.1        │                  0 │
└──────────────────┴────────────────────┘
```

## isIPAddressInRange {#isipaddressinrange}

IP アドレスが [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) 表記で表されるネットワークに含まれているかを判定します。真の場合は `1` を、それ以外は `0` を返します。

**構文**

```sql
isIPAddressInRange(address, prefix)
```

この関数は、文字列として表される IPv4 および IPv6 アドレス（およびネットワーク）の両方を受け付けます。アドレスの IP バージョンと CIDR が一致しない場合は `0` を返します。

**引数**

- `address` — IPv4 または IPv6 アドレス。 [String](../data-types/string.md)、 [IPv4](../data-types/ipv4.md)、 [IPv6](../data-types/ipv6.md)、 `Nullable(String)`, `Nullable(IPv4)` および `Nullable(IPv6)`。
- `prefix` — CIDR 形式の IPv4 または IPv6 ネットワークプレフィックス。 [String](../data-types/string.md).

**返される値**

- `1` または `0`。 [UInt8](../data-types/int-uint.md).

**例**

クエリ:

```sql
SELECT isIPAddressInRange('127.0.0.1', '127.0.0.0/8');
```

結果:

```text
┌─isIPAddressInRange('127.0.0.1', '127.0.0.0/8')─┐
│                                              1 │
└────────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT isIPAddressInRange('127.0.0.1', 'ffff::/16');
```

結果:

```text
┌─isIPAddressInRange('127.0.0.1', 'ffff::/16')─┐
│                                            0 │
└──────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT isIPAddressInRange('::ffff:192.168.0.1', '::ffff:192.168.0.4/128');
```

結果:

```text
┌─isIPAddressInRange('::ffff:192.168.0.1', '::ffff:192.168.0.4/128')─┐
│                                                                  0 │
└────────────────────────────────────────────────────────────────────┘
```
