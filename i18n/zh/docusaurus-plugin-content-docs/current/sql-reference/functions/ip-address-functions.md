---
'description': '处理IPv4和IPv6地址的函数的文档'
'sidebar_label': 'IP地址'
'sidebar_position': 95
'slug': '/sql-reference/functions/ip-address-functions'
'title': '处理IPv4和IPv6地址的函数'
---


# 处理 IPv4 和 IPv6 地址的函数

## IPv4NumToString {#IPv4NumToString}

接收一个 UInt32 数字，将其解释为一个大端格式的 IPv4 地址。返回一个字符串，包含与之对应的 IPv4 地址，格式为 A.B.C.d（以点分隔的十进制数字）。

别名： `INET_NTOA`。

## IPv4StringToNum {#IPv4StringToNum}

[IPv4NumToString](#IPv4NumToString) 的反向函数。如果 IPv4 地址格式无效，则抛出异常。

别名： `INET_ATON`。

## IPv4StringToNumOrDefault(s) {#ipv4stringtonumordefaults}

与 `IPv4StringToNum` 相同，但如果 IPv4 地址格式无效，则返回 0。

## IPv4StringToNumOrNull(s) {#ipv4stringtonumornulls}

与 `IPv4StringToNum` 相同，但如果 IPv4 地址格式无效，则返回 null。

## IPv4NumToStringClassC(num) {#ipv4numtostringclasscnum}

类似于 IPv4NumToString，但使用 xxx 替代最后一个八位字节。

示例：

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

由于使用 'xxx' 是极其不寻常的，未来可能会有所更改。我们建议您不要依赖此片段的确切格式。

### IPv6NumToString(x) {#ipv6numtostringx}

接受一个包含 IPv6 地址的 FixedString(16) 值，格式为二进制。返回一个字符串，包含该地址的文本格式。
IPv6 映射的 IPv4 地址以格式 ::ffff:111.222.33.44 输出。

别名： `INET6_NTOA`。

示例：

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

[IPv6NumToString](#ipv6numtostringx) 的反向函数。如果 IPv6 地址格式无效，则抛出异常。

如果输入字符串包含有效的 IPv4 地址，则返回其 IPv6 等效地址。
HEX 可以是大写或小写。

别名： `INET6_ATON`。

**语法**

```sql
IPv6StringToNum(string)
```

**参数**

- `string` — IP 地址。 [String](../data-types/string.md)。

**返回值**

- IPv6 地址，格式为二进制。 [FixedString(16)](../data-types/fixedstring.md)。

**示例**

查询：

```sql
SELECT addr, cutIPv6(IPv6StringToNum(addr), 0, 0) FROM (SELECT ['notaddress', '127.0.0.1', '1111::ffff'] AS addr) ARRAY JOIN addr;
```

结果：

```text
┌─addr───────┬─cutIPv6(IPv6StringToNum(addr), 0, 0)─┐
│ notaddress │ ::                                   │
│ 127.0.0.1  │ ::ffff:127.0.0.1                     │
│ 1111::ffff │ 1111::ffff                           │
└────────────┴──────────────────────────────────────┘
```

**参见**

- [cutIPv6](#cutipv6x-bytestocutforipv6-bytestocutforipv4)。

## IPv6StringToNumOrDefault(s) {#ipv6stringtonumordefaults}

与 `IPv6StringToNum` 相同，但如果 IPv6 地址格式无效，则返回 0。

## IPv6StringToNumOrNull(s) {#ipv6stringtonumornulls}

与 `IPv6StringToNum` 相同，但如果 IPv6 地址格式无效，则返回 null。

## IPv4ToIPv6(x) {#ipv4toipv6x}

接受一个 `UInt32` 数字。将其解释为一个大端格式的 IPv4 地址 [big endian](https://en.wikipedia.org/wiki/Endianness)。返回一个包含 IPv6 地址的 `FixedString(16)` 值，其格式为二进制。示例：

```sql
SELECT IPv6NumToString(IPv4ToIPv6(IPv4StringToNum('192.168.0.1'))) AS addr;
```

```text
┌─addr───────────────┐
│ ::ffff:192.168.0.1 │
└────────────────────┘
```

## cutIPv6(x, bytesToCutForIPv6, bytesToCutForIPv4) {#cutipv6x-bytestocutforipv6-bytestocutforipv4}

接受一个包含 IPv6 地址的 FixedString(16) 值，格式为二进制。返回一个字符串，包含以文本格式删除指定字节数后的地址。例如：

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

## IPv4CIDRToRange(ipv4, Cidr) {#ipv4cidrtorangeipv4-cidr}

接收一个 IPv4 和一个 UInt8 值，包含 [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)。返回一个元组，包含两个 IPv4 地址，分别表示子网的下限和上限范围。

```sql
SELECT IPv4CIDRToRange(toIPv4('192.168.5.2'), 16);
```

```text
┌─IPv4CIDRToRange(toIPv4('192.168.5.2'), 16)─┐
│ ('192.168.0.0','192.168.255.255')          │
└────────────────────────────────────────────┘
```

## IPv6CIDRToRange(ipv6, Cidr) {#ipv6cidrtorangeipv6-cidr}

接收一个 IPv6 和一个 UInt8 值，包含 CIDR。返回一个元组，包含两个 IPv6 地址，分别表示子网的下限和上限范围。

```sql
SELECT IPv6CIDRToRange(toIPv6('2001:0db8:0000:85a3:0000:0000:ac1f:8001'), 32);
```

```text
┌─IPv6CIDRToRange(toIPv6('2001:0db8:0000:85a3:0000:0000:ac1f:8001'), 32)─┐
│ ('2001:db8::','2001:db8:ffff:ffff:ffff:ffff:ffff:ffff')                │
└────────────────────────────────────────────────────────────────────────┘
```

## toIPv4 {#toipv4}

将字符串或 UInt32 格式的 IPv4 地址转换为 [IPv4](../data-types/ipv4.md) 类型。
类似于 [`IPv4StringToNum`](#IPv4StringToNum) 和 [IPv4NumToString](#IPv4NumToString) 函数，但支持字符串和无符号整数数据类型的输入参数。

**语法**

```sql
toIPv4(x)
```

**参数**

- `x` — IPv4 地址。 [`String`](../data-types/string.md)、[`UInt8/16/32`](../data-types/int-uint.md)。

**返回值**

- IPv4 地址。 [IPv4](../data-types/ipv4.md)。

**示例**

查询：

```sql
SELECT toIPv4('171.225.130.45');
```

结果：

```text
┌─toIPv4('171.225.130.45')─┐
│ 171.225.130.45           │
└──────────────────────────┘
```

查询：

```sql
WITH
    '171.225.130.45' as IPv4_string
SELECT
    hex(IPv4StringToNum(IPv4_string)),
    hex(toIPv4(IPv4_string))
```

结果：

```text
┌─hex(IPv4StringToNum(IPv4_string))─┬─hex(toIPv4(IPv4_string))─┐
│ ABE1822D                          │ ABE1822D                 │
└───────────────────────────────────┴──────────────────────────┘
```

查询：

```sql
SELECT toIPv4(2130706433);
```

结果：

```text
┌─toIPv4(2130706433)─┐
│ 127.0.0.1          │
└────────────────────┘
```

## toIPv4OrDefault {#toipv4ordefault}

与 `toIPv4` 相同，但如果 IPv4 地址格式无效，则返回 `0.0.0.0` （0 IPv4）或提供的 IPv4 默认值。

**语法**

```sql
toIPv4OrDefault(string[, default])
```

**参数**

- `value` — IP 地址。 [String](../data-types/string.md)。
- `default`（可选）— 如果 `string` 格式无效时要返回的值。 [IPv4](../data-types/ipv4.md)。

**返回值**

- `string` 转换为当前 IPv4 地址。 [String](../data-types/string.md)。

**示例**

查询：

```sql
WITH
    '::ffff:127.0.0.1' AS valid_IPv6_string,
    'fe80:2030:31:24' AS invalid_IPv6_string
SELECT
    toIPv4OrDefault(valid_IPv6_string) AS valid,
    toIPv4OrDefault(invalid_IPv6_string) AS default,
    toIPv4OrDefault(invalid_IPv6_string, toIPv4('1.1.1.1')) AS provided_default;
```

结果：

```response
┌─valid───┬─default─┬─provided_default─┐
│ 0.0.0.0 │ 0.0.0.0 │ 1.1.1.1          │
└─────────┴─────────┴──────────────────┘
```

## toIPv4OrNull {#toipv4ornull}

与 [`toIPv4`](#toipv4) 相同，但如果 IPv4 地址格式无效，则返回 null。

**语法**

```sql
toIPv4OrNull(string)
```

**参数**

- `string` — IP 地址。 [String](../data-types/string.md)。

**返回值**

- `string` 转换为当前 IPv4 地址，如果 `string` 是无效地址，则返回 null。 [String](../data-types/string.md)。

**示例**

查询：

```sql
WITH 'fe80:2030:31:24' AS invalid_IPv6_string
SELECT toIPv4OrNull(invalid_IPv6_string);
```

结果：

```text
┌─toIPv4OrNull(invalid_IPv6_string)─┐
│ ᴺᵁᴸᴸ                              │
└───────────────────────────────────┘
```

## toIPv4OrZero {#toipv4orzero}

与 [`toIPv4`](#toipv4) 相同，但如果 IPv4 地址格式无效，则返回 `0.0.0.0`。

**语法**

```sql
toIPv4OrZero(string)
```

**参数**

- `string` — IP 地址。 [String](../data-types/string.md)。

**返回值**

- `string` 转换为当前 IPv4 地址，如果 `string` 是无效地址，则返回 `0.0.0.0` 。 [String](../data-types/string.md)。

**示例**

查询：

```sql
WITH 'Not an IP address' AS invalid_IPv6_string
SELECT toIPv4OrZero(invalid_IPv6_string);
```

结果：

```text
┌─toIPv4OrZero(invalid_IPv6_string)─┐
│ 0.0.0.0                           │
└───────────────────────────────────┘
```

## toIPv6 {#toipv6}

将字符串或 UInt128 格式的 IPv6 地址转换为 [IPv6](../data-types/ipv6.md) 类型。对于字符串，如果 IPv6 地址格式无效，则返回空值。
类似于 [IPv6StringToNum](#ipv6stringtonum) 和 [IPv6NumToString](#ipv6numtostringx) 函数，这些函数可以在二进制格式（即 `FixedString(16)`）之间转换 IPv6 地址。

如果输入字符串包含有效的 IPv4 地址，则返回其 IPv6 等效地址。

**语法**

```sql
toIPv6(string)
toIPv6(UInt128)
```

**参数**

- `x` — IP 地址。 [`String`](../data-types/string.md) 或 [`UInt128`](../data-types/int-uint.md)。

**返回值**

- IP 地址。 [IPv6](../data-types/ipv6.md)。

**示例**

查询：

```sql
WITH '2001:438:ffff::407d:1bc1' AS IPv6_string
SELECT
    hex(IPv6StringToNum(IPv6_string)),
    hex(toIPv6(IPv6_string));
```

结果：

```text
┌─hex(IPv6StringToNum(IPv6_string))─┬─hex(toIPv6(IPv6_string))─────────┐
│ 20010438FFFF000000000000407D1BC1  │ 20010438FFFF000000000000407D1BC1 │
└───────────────────────────────────┴──────────────────────────────────┘
```

查询：

```sql
SELECT toIPv6('127.0.0.1');
```

结果：

```text
┌─toIPv6('127.0.0.1')─┐
│ ::ffff:127.0.0.1    │
└─────────────────────┘
```

## toIPv6OrDefault {#toipv6ordefault}

与 [`toIPv6`](#toipv6) 相同，但如果 IPv6 地址格式无效，则返回 `::`（0 IPv6）或提供的 IPv6 默认值。

**语法**

```sql
toIPv6OrDefault(string[, default])
```

**参数**

- `string` — IP 地址。 [String](../data-types/string.md)。
- `default`（可选）— 如果 `string` 格式无效时要返回的值。 [IPv6](../data-types/ipv6.md)。

**返回值**

- IPv6 地址 [IPv6](../data-types/ipv6.md)，否则如果 `string` 格式无效则返回 `::` 或提供的可选默认值。

**示例**

查询：

```sql
WITH
    '127.0.0.1' AS valid_IPv4_string,
    '127.0.0.1.6' AS invalid_IPv4_string
SELECT
    toIPv6OrDefault(valid_IPv4_string) AS valid,
    toIPv6OrDefault(invalid_IPv4_string) AS default,
    toIPv6OrDefault(invalid_IPv4_string, toIPv6('1.1.1.1')) AS provided_default
```

结果：

```text
┌─valid────────────┬─default─┬─provided_default─┐
│ ::ffff:127.0.0.1 │ ::      │ ::ffff:1.1.1.1   │
└──────────────────┴─────────┴──────────────────┘
```

## toIPv6OrNull {#toipv6ornull}

与 [`toIPv6`](#to_ipv6) 相同，但如果 IPv6 地址格式无效，则返回 null。

**语法**

```sql
toIPv6OrNull(string)
```

**参数**

- `string` — IP 地址。 [String](../data-types/string.md)。

**返回值**

- IP 地址。 [IPv6](../data-types/ipv6.md)，如果 `string` 不是有效格式，则返回 null。

**示例**

查询：

```sql
WITH '127.0.0.1.6' AS invalid_IPv4_string
SELECT toIPv6OrNull(invalid_IPv4_string);
```

结果：

```text
┌─toIPv6OrNull(invalid_IPv4_string)─┐
│ ᴺᵁᴸᴸ                              │
└───────────────────────────────────┘
```

## toIPv6OrZero {#toipv6orzero}

与 [`toIPv6`](#toipv6) 相同，但如果 IPv6 地址格式无效，则返回 `::`。

**语法**

```sql
toIPv6OrZero(string)
```

**参数**

- `string` — IP 地址。 [String](../data-types/string.md)。

**返回值**

- IP 地址。 [IPv6](../data-types/ipv6.md)，如果 `string` 不是有效格式，则返回 `::`。

**示例**

查询：

```sql
WITH '127.0.0.1.6' AS invalid_IPv4_string
SELECT toIPv6OrZero(invalid_IPv4_string);
```

结果：

```text
┌─toIPv6OrZero(invalid_IPv4_string)─┐
│ ::                                │
└───────────────────────────────────┘
```

## IPv6StringToNumOrDefault(s) {#ipv6stringtonumordefaults-1}

与 `toIPv6` 相同，但如果 IPv6 地址格式无效，则返回 0。

## IPv6StringToNumOrNull(s) {#ipv6stringtonumornulls-1}

与 `toIPv6` 相同，但如果 IPv6 地址格式无效，则返回 null。

## isIPv4String {#isipv4string}

判断输入字符串是否为 IPv4 地址。如果 `string` 为 IPv6 地址，则返回 `0`。

**语法**

```sql
isIPv4String(string)
```

**参数**

- `string` — IP 地址。 [String](../data-types/string.md)。

**返回值**

- 如果 `string` 是 IPv4 地址，则返回 `1`，否则返回 `0`。 [UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT addr, isIPv4String(addr) FROM ( SELECT ['0.0.0.0', '127.0.0.1', '::ffff:127.0.0.1'] AS addr ) ARRAY JOIN addr;
```

结果：

```text
┌─addr─────────────┬─isIPv4String(addr)─┐
│ 0.0.0.0          │                  1 │
│ 127.0.0.1        │                  1 │
│ ::ffff:127.0.0.1 │                  0 │
└──────────────────┴────────────────────┘
```

## isIPv6String {#isipv6string}

判断输入字符串是否为 IPv6 地址。如果 `string` 为 IPv4 地址，则返回 `0`。

**语法**

```sql
isIPv6String(string)
```

**参数**

- `string` — IP 地址。 [String](../data-types/string.md)。

**返回值**

- 如果 `string` 是 IPv6 地址，则返回 `1`，否则返回 `0`。 [UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT addr, isIPv6String(addr) FROM ( SELECT ['::', '1111::ffff', '::ffff:127.0.0.1', '127.0.0.1'] AS addr ) ARRAY JOIN addr;
```

结果：

```text
┌─addr─────────────┬─isIPv6String(addr)─┐
│ ::               │                  1 │
│ 1111::ffff       │                  1 │
│ ::ffff:127.0.0.1 │                  1 │
│ 127.0.0.1        │                  0 │
└──────────────────┴────────────────────┘
```

## isIPAddressInRange {#isipaddressinrange}

判断一个 IP 地址是否包含在以 [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) 表示的网络中。如果为真，则返回 `1`，否则返回 `0`。

**语法**

```sql
isIPAddressInRange(address, prefix)
```

该函数接受以字符串表示的 IPv4 和 IPv6 地址（以及网络）。如果 IP 地址的版本与 CIDR 不匹配，则返回 `0`。

**参数**

- `address` — IPv4 或 IPv6 地址。 [String](../data-types/string.md)、[IPv4](../data-types/ipv4.md)、[IPv6](../data-types/ipv6.md)、`Nullable(String)`、`Nullable(IPv4)` 和 `Nullable(IPv6)`。
- `prefix` — 以 CIDR 表示的 IPv4 或 IPv6 网络前缀。 [String](../data-types/string.md)。

**返回值**

- `1` 或 `0`。 [UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT isIPAddressInRange('127.0.0.1', '127.0.0.0/8');
```

结果：

```text
┌─isIPAddressInRange('127.0.0.1', '127.0.0.0/8')─┐
│                                              1 │
└────────────────────────────────────────────────┘
```

查询：

```sql
SELECT isIPAddressInRange('127.0.0.1', 'ffff::/16');
```

结果：

```text
┌─isIPAddressInRange('127.0.0.1', 'ffff::/16')─┐
│                                            0 │
└──────────────────────────────────────────────┘
```

查询：

```sql
SELECT isIPAddressInRange('::ffff:192.168.0.1', '::ffff:192.168.0.4/128');
```

结果：

```text
┌─isIPAddressInRange('::ffff:192.168.0.1', '::ffff:192.168.0.4/128')─┐
│                                                                  0 │
└────────────────────────────────────────────────────────────────────┘
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
