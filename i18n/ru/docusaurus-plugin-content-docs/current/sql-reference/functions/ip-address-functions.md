---
description: 'Документация для функций работы с IPv4 и IPv6 адресами'
sidebar_label: 'IP адреса'
sidebar_position: 95
slug: /sql-reference/functions/ip-address-functions
title: 'Функции для работы с IPv4 и IPv6 адресами'
---


# Функции для работы с IPv4 и IPv6 адресами

## IPv4NumToString {#IPv4NumToString}

Принимает число UInt32. Интерпретирует его как адрес IPv4 в формате big endian. Возвращает строку, содержащую соответствующий адрес IPv4 в формате A.B.C.d (числа, разделенные точками, в десятичном виде).

Псевдоним: `INET_NTOA`.

## IPv4StringToNum {#IPv4StringToNum}

Обратная функция для [IPv4NumToString](#IPv4NumToString). Если адрес IPv4 имеет недопустимый формат, генерируется исключение.

Псевдоним: `INET_ATON`.

## IPv4StringToNumOrDefault(s) {#ipv4stringtonumordefaults}

Такое же, как `IPv4StringToNum`, но если адрес IPv4 имеет недопустимый формат, возвращает 0.

## IPv4StringToNumOrNull(s) {#ipv4stringtonumornulls}

Такое же, как `IPv4StringToNum`, но если адрес IPv4 имеет недопустимый формат, возвращает null.

## IPv4NumToStringClassC(num) {#ipv4numtostringclasscnum}

Похоже на IPv4NumToString, но использует xxx вместо последнего октета.

Пример:

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

Поскольку использование 'xxx' является весьма необычным, это может быть изменено в будущем. Мы рекомендуем вам не полагаться на точный формат этого фрагмента.

### IPv6NumToString(x) {#ipv6numtostringx}

Принимает значение FixedString(16), содержащее адрес IPv6 в двоичном формате. Возвращает строку, содержащую этот адрес в текстовом формате. 
IPv6-адреса, сопоставленные с IPv4, выводятся в формате ::ffff:111.222.33.44.

Псевдоним: `INET6_NTOA`.

Примеры:

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

Обратная функция для [IPv6NumToString](#ipv6numtostringx). Если адрес IPv6 имеет недопустимый формат, генерируется исключение.

Если входная строка содержит действительный адрес IPv4, возвращает его эквивалент IPv6.
HEX может быть как в верхнем, так и в нижнем регистре.

Псевдоним: `INET6_ATON`.

**Синтаксис**

```sql
IPv6StringToNum(string)
```

**Аргумент**

- `string` — IP адрес. [String](../data-types/string.md).

**Возвращаемое значение**

- Адрес IPv6 в двоичном формате. [FixedString(16)](../data-types/fixedstring.md).

**Пример**

Запрос:

```sql
SELECT addr, cutIPv6(IPv6StringToNum(addr), 0, 0) FROM (SELECT ['notaddress', '127.0.0.1', '1111::ffff'] AS addr) ARRAY JOIN addr;
```

Результат:

```text
┌─addr───────┬─cutIPv6(IPv6StringToNum(addr), 0, 0)─┐
│ notaddress │ ::                                   │
│ 127.0.0.1  │ ::ffff:127.0.0.1                     │
│ 1111::ffff │ 1111::ffff                           │
└────────────┴──────────────────────────────────────┘
```

**Смотрите также**

- [cutIPv6](#cutipv6x-bytestocutforipv6-bytestocutforipv4).

## IPv6StringToNumOrDefault(s) {#ipv6stringtonumordefaults}

Такое же, как `IPv6StringToNum`, но если адрес IPv6 имеет недопустимый формат, возвращает 0.

## IPv6StringToNumOrNull(s) {#ipv6stringtonumornulls}

Такое же, как `IPv6StringToNum`, но если адрес IPv6 имеет недопустимый формат, возвращает null.

## IPv4ToIPv6(x) {#ipv4toipv6x}

Принимает число `UInt32`. Интерпретирует его как адрес IPv4 в [big endian](https://en.wikipedia.org/wiki/Endianness). Возвращает значение `FixedString(16)`, содержащее адрес IPv6 в двоичном формате. Примеры:

```sql
SELECT IPv6NumToString(IPv4ToIPv6(IPv4StringToNum('192.168.0.1'))) AS addr;
```

```text
┌─addr───────────────┐
│ ::ffff:192.168.0.1 │
└────────────────────┘
```

## cutIPv6(x, bytesToCutForIPv6, bytesToCutForIPv4) {#cutipv6x-bytestocutforipv6-bytestocutforipv4}

Принимает значение FixedString(16), содержащее адрес IPv6 в двоичном формате. Возвращает строку, содержащую адрес с указанным количеством удаленных байтов в текстовом формате. Например:

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

Принимает адрес IPv4 и значение UInt8, содержащее [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing). Возвращает кортеж из двух адресов IPv4, содержащих нижний и верхний диапазоны подсети.

```sql
SELECT IPv4CIDRToRange(toIPv4('192.168.5.2'), 16);
```

```text
┌─IPv4CIDRToRange(toIPv4('192.168.5.2'), 16)─┐
│ ('192.168.0.0','192.168.255.255')          │
└────────────────────────────────────────────┘
```

## IPv6CIDRToRange(ipv6, Cidr) {#ipv6cidrtorangeipv6-cidr}

Принимает адрес IPv6 и значение UInt8, содержащее CIDR. Возвращает кортеж из двух адресов IPv6, содержащих нижний и верхний диапазоны подсети.

```sql
SELECT IPv6CIDRToRange(toIPv6('2001:0db8:0000:85a3:0000:0000:ac1f:8001'), 32);
```

```text
┌─IPv6CIDRToRange(toIPv6('2001:0db8:0000:85a3:0000:0000:ac1f:8001'), 32)─┐
│ ('2001:db8::','2001:db8:ffff:ffff:ffff:ffff:ffff:ffff')                │
└────────────────────────────────────────────────────────────────────────┘
```

## toIPv4 {#toipv4}

Как [`IPv4StringToNum`](#IPv4StringToNum), но принимает строку формата IPv4 адреса и возвращает значение типа [IPv4](../data-types/ipv4.md).

**Синтаксис**

```sql
toIPv4(string)
```

**Аргументы**

- `string` — IPv4 адрес. [String](../data-types/string.md).

**Возвращаемое значение**

- `string`, преобразованный в адрес IPv4. [IPv4](../data-types/ipv4.md).

**Примеры**

Запрос:

```sql
SELECT toIPv4('171.225.130.45');
```

Результат:

```text
┌─toIPv4('171.225.130.45')─┐
│ 171.225.130.45           │
└──────────────────────────┘
```

Запрос:

```sql
WITH
    '171.225.130.45' as IPv4_string
SELECT
    hex(IPv4StringToNum(IPv4_string)),
    hex(toIPv4(IPv4_string))
```

Результат:

```text
┌─hex(IPv4StringToNum(IPv4_string))─┬─hex(toIPv4(IPv4_string))─┐
│ ABE1822D                          │ ABE1822D                 │
└───────────────────────────────────┴──────────────────────────┘
```

## toIPv4OrDefault {#toipv4ordefault}

Такое же, как `toIPv4`, но если адрес IPv4 имеет недопустимый формат, возвращает `0.0.0.0` (0 IPv4) или указанный по умолчанию IPv4.

**Синтаксис**

```sql
toIPv4OrDefault(string[, default])
```

**Аргументы**

- `value` — IP адрес. [String](../data-types/string.md).
- `default` (необязательный) — Значение, которое нужно вернуть, если `string` имеет недопустимый формат. [IPv4](../data-types/ipv4.md).

**Возвращаемое значение**

- `string`, преобразованный в текущий адрес IPv4. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
WITH
    '::ffff:127.0.0.1' AS valid_IPv6_string,
    'fe80:2030:31:24' AS invalid_IPv6_string
SELECT
    toIPv4OrDefault(valid_IPv6_string) AS valid,
    toIPv4OrDefault(invalid_IPv6_string) AS default,
    toIPv4OrDefault(invalid_IPv6_string, toIPv4('1.1.1.1')) AS provided_default;
```

Результат:

```text
┌─valid───┬─default─┬─provided_default─┐
│ 0.0.0.0 │ 0.0.0.0 │ 1.1.1.1          │
└─────────┴─────────┴──────────────────┘
```

## toIPv4OrNull {#toipv4ornull}

Такое же, как [`toIPv4`](#toipv4), но если адрес IPv4 имеет недопустимый формат, возвращает null.

**Синтаксис**

```sql
toIPv4OrNull(string)
```

**Аргументы**

- `string` — IP адрес. [String](../data-types/string.md).

**Возвращаемое значение**

- `string`, преобразованный в текущий адрес IPv4, или null, если `string` — недопустимый адрес. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
WITH 'fe80:2030:31:24' AS invalid_IPv6_string
SELECT toIPv4OrNull(invalid_IPv6_string);
```

Результат:

```text
┌─toIPv4OrNull(invalid_IPv6_string)─┐
│ ᴺᵁᴸᴸ                              │
└───────────────────────────────────┘
```

## toIPv4OrZero {#toipv4orzero}

Такое же, как [`toIPv4`](#toipv4), но если адрес IPv4 имеет недопустимый формат, возвращает `0.0.0.0`.

**Синтаксис**

```sql
toIPv4OrZero(string)
```

**Аргументы**

- `string` — IP адрес. [String](../data-types/string.md).

**Возвращаемое значение**

- `string`, преобразованный в текущий адрес IPv4, или `0.0.0.0`, если `string` — недопустимый адрес. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
WITH 'Not an IP address' AS invalid_IPv6_string
SELECT toIPv4OrZero(invalid_IPv6_string);
```

Результат:

```text
┌─toIPv4OrZero(invalid_IPv6_string)─┐
│ 0.0.0.0                           │
└───────────────────────────────────┘
```

## toIPv6 {#toipv6}

Преобразует строку или форму UInt128 адреса IPv6 в тип [IPv6](../data-types/ipv6.md). Для строк, если адрес IPv6 имеет недопустимый формат, возвращает пустое значение. 
Аналогично функции [IPv6StringToNum](#ipv6stringtonum), которая преобразует адрес IPv6 в двоичный формат.

Если входная строка содержит действительный адрес IPv4, то возвращается эквивалент IPv6 адреса IPv4.

**Синтаксис**

```sql
toIPv6(string)
toIPv6(UInt128)
```

**Аргумент**

- `string` или `UInt128` — IP адрес. [String](../data-types/string.md).

**Возвращаемое значение**

- IP адрес. [IPv6](../data-types/ipv6.md).

**Примеры**

Запрос:

```sql
WITH '2001:438:ffff::407d:1bc1' AS IPv6_string
SELECT
    hex(IPv6StringToNum(IPv6_string)),
    hex(toIPv6(IPv6_string));
```

Результат:

```text
┌─hex(IPv6StringToNum(IPv6_string))─┬─hex(toIPv6(IPv6_string))─────────┐
│ 20010438FFFF000000000000407D1BC1  │ 20010438FFFF000000000000407D1BC1 │
└───────────────────────────────────┴──────────────────────────────────┘
```

Запрос:

```sql
SELECT toIPv6('127.0.0.1');
```

Результат:

```text
┌─toIPv6('127.0.0.1')─┐
│ ::ffff:127.0.0.1    │
└─────────────────────┘
```

## toIPv6OrDefault {#toipv6ordefault}

Такое же, как [`toIPv6`](#toipv6), но если адрес IPv6 имеет недопустимый формат, возвращает `::` (0 IPv6) или указанный адрес IPv6 по умолчанию.

**Синтаксис**

```sql
toIPv6OrDefault(string[, default])
```

**Аргумент**

- `string` — IP адрес. [String](../data-types/string.md).
- `default` (необязательный) — Значение, которое нужно вернуть, если `string` имеет недопустимый формат. [IPv6](../data-types/ipv6.md).

**Возвращаемое значение**

- Адрес IPv6 [IPv6](../data-types/ipv6.md), в противном случае `::` или предоставленный необязательный по умолчанию, если `string` имеет недопустимый формат.

**Пример**

Запрос:

```sql
WITH
    '127.0.0.1' AS valid_IPv4_string,
    '127.0.0.1.6' AS invalid_IPv4_string
SELECT
    toIPv6OrDefault(valid_IPv4_string) AS valid,
    toIPv6OrDefault(invalid_IPv4_string) AS default,
    toIPv6OrDefault(invalid_IPv4_string, toIPv6('1.1.1.1')) AS provided_default
```

Результат:

```text
┌─valid────────────┬─default─┬─provided_default─┐
│ ::ffff:127.0.0.1 │ ::      │ ::ffff:1.1.1.1   │
└──────────────────┴─────────┴──────────────────┘
```

## toIPv6OrNull {#toipv6ornull}

Такое же, как [`toIPv6`](#toipv6), но если адрес IPv6 имеет недопустимый формат, возвращает null.

**Синтаксис**

```sql
toIPv6OrNull(string)
```

**Аргумент**

- `string` — IP адрес. [String](../data-types/string.md).

**Возвращаемое значение**

- IP адрес. [IPv6](../data-types/ipv6.md), или null, если `string` имеет недопустимый формат.

**Пример**

Запрос:

```sql
WITH '127.0.0.1.6' AS invalid_IPv4_string
SELECT toIPv6OrNull(invalid_IPv4_string);
```

Результат:

```text
┌─toIPv6OrNull(invalid_IPv4_string)─┐
│ ᴺᵁᴸᴸ                              │
└───────────────────────────────────┘
```

## toIPv6OrZero {#toipv6orzero}

Такое же, как [`toIPv6`](#toipv6), но если адрес IPv6 имеет недопустимый формат, возвращает `::`.

**Синтаксис**

```sql
toIPv6OrZero(string)
```

**Аргумент**

- `string` — IP адрес. [String](../data-types/string.md).

**Возвращаемое значение**

- IP адрес. [IPv6](../data-types/ipv6.md), или `::`, если `string` имеет недопустимый формат.

**Пример**

Запрос:

```sql
WITH '127.0.0.1.6' AS invalid_IPv4_string
SELECT toIPv6OrZero(invalid_IPv4_string);
```

Результат:

```text
┌─toIPv6OrZero(invalid_IPv6_string)─┐
│ ::                                │
└───────────────────────────────────┘
```

## IPv6StringToNumOrDefault(s) {#ipv6stringtonumordefaults-1}

Такое же, как `toIPv6`, но если адрес IPv6 имеет недопустимый формат, возвращает 0.

## IPv6StringToNumOrNull(s) {#ipv6stringtonumornulls-1}

Такое же, как `toIPv6`, но если адрес IPv6 имеет недопустимый формат, возвращает null.

## isIPv4String {#isipv4string}

Определяет, является ли входная строка адресом IPv4. Если `string` является адресом IPv6, возвращает `0`.

**Синтаксис**

```sql
isIPv4String(string)
```

**Аргументы**

- `string` — IP адрес. [String](../data-types/string.md).

**Возвращаемое значение**

- `1`, если `string` является адресом IPv4, `0` в противном случае. [UInt8](../data-types/int-uint.md).

**Примеры**

Запрос:

```sql
SELECT addr, isIPv4String(addr) FROM ( SELECT ['0.0.0.0', '127.0.0.1', '::ffff:127.0.0.1'] AS addr ) ARRAY JOIN addr;
```

Результат:

```text
┌─addr─────────────┬─isIPv4String(addr)─┐
│ 0.0.0.0          │                  1 │
│ 127.0.0.1        │                  1 │
│ ::ffff:127.0.0.1 │                  0 │
└──────────────────┴────────────────────┘
```

## isIPv6String {#isipv6string}

Определяет, является ли входная строка адресом IPv6. Если `string` является адресом IPv4, возвращает `0`.

**Синтаксис**

```sql
isIPv6String(string)
```

**Аргументы**

- `string` — IP адрес. [String](../data-types/string.md).

**Возвращаемое значение**

- `1`, если `string` является адресом IPv6, `0` в противном случае. [UInt8](../data-types/int-uint.md).

**Примеры**

Запрос:

```sql
SELECT addr, isIPv6String(addr) FROM ( SELECT ['::', '1111::ffff', '::ffff:127.0.0.1', '127.0.0.1'] AS addr ) ARRAY JOIN addr;
```

Результат:

```text
┌─addr─────────────┬─isIPv6String(addr)─┐
│ ::               │                  1 │
│ 1111::ffff       │                  1 │
│ ::ffff:127.0.0.1 │                  1 │
│ 127.0.0.1        │                  0 │
└──────────────────┴────────────────────┘
```

## isIPAddressInRange {#isipaddressinrange}

Определяет, содержится ли IP адрес в сети, представленной в нотации [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing). Возвращает `1`, если это правда, или `0` в противном случае.

**Синтаксис**

```sql
isIPAddressInRange(address, prefix)
```

Эта функция принимает как IPv4, так и IPv6 адреса (и сети), представленные как строки. Она возвращает `0`, если версия IP адреса и CIDR не совпадают.

**Аргументы**

- `address` — адрес IPv4 или IPv6. [String](../data-types/string.md).
- `prefix` — сетевой префикс IPv4 или IPv6 в CIDR. [String](../data-types/string.md).

**Возвращаемое значение**

- `1` или `0`. [UInt8](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT isIPAddressInRange('127.0.0.1', '127.0.0.0/8');
```

Результат:

```text
┌─isIPAddressInRange('127.0.0.1', '127.0.0.0/8')─┐
│                                              1 │
└────────────────────────────────────────────────┘
```

Запрос:

```sql
SELECT isIPAddressInRange('127.0.0.1', 'ffff::/16');
```

Результат:

```text
┌─isIPAddressInRange('127.0.0.1', 'ffff::/16')─┐
│                                            0 │
└──────────────────────────────────────────────┘
```

Запрос:

```sql
SELECT isIPAddressInRange('::ffff:192.168.0.1', '::ffff:192.168.0.4/128');
```

Результат:

```text
┌─isIPAddressInRange('::ffff:192.168.0.1', '::ffff:192.168.0.4/128')─┐
│                                                                  0 │
└────────────────────────────────────────────────────────────────────┘
```
