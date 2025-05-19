description: 'Документация для функций работы с IPv4 и IPv6 адресами'
sidebar_label: 'IP адреса'
sidebar_position: 95
slug: /sql-reference/functions/ip-address-functions
title: 'Функции для работы с IPv4 и IPv6 адресами'
```


# Функции для работы с IPv4 и IPv6 адресами

## IPv4NumToString {#IPv4NumToString}

Принимает число типа UInt32. Интерпретирует его как IPv4 адрес в формате big endian. Возвращает строку, содержащую соответствующий IPv4 адрес в формате A.B.C.d (числа, разделенные точками, в десятичном формате).

Псевдоним: `INET_NTOA`.

## IPv4StringToNum {#IPv4StringToNum}

Обратная функция к [IPv4NumToString](#IPv4NumToString). Если IPv4 адрес имеет неверный формат, выбрасывает исключение.

Псевдоним: `INET_ATON`.

## IPv4StringToNumOrDefault(s) {#ipv4stringtonumordefaults}

То же, что и `IPv4StringToNum`, но если IPv4 адрес имеет неверный формат, возвращает 0.

## IPv4StringToNumOrNull(s) {#ipv4stringtonumornulls}

То же, что и `IPv4StringToNum`, но если IPv4 адрес имеет неверный формат, возвращает null.

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

Так как использование 'xxx' является весьма необычным, это может измениться в будущем. Мы рекомендуем вам не полагаться на точный формат этого фрагмента.

### IPv6NumToString(x) {#ipv6numtostringx}

Принимает значение типа FixedString(16), содержащее IPv6 адрес в бинарном формате. Возвращает строку, содержащую этот адрес в текстовом формате.
IPv6-зMapped IPv4 адреса выводятся в формате ::ffff:111.222.33.44.

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

Обратная функция к [IPv6NumToString](#ipv6numtostringx). Если IPv6 адрес имеет неверный формат, выбрасывает исключение.

Если входная строка содержит валидный IPv4 адрес, возвращает его IPv6 эквивалент.
HEX может быть заглавным или строчным.

Псевдоним: `INET6_ATON`.

**Синтаксис**

```sql
IPv6StringToNum(string)
```

**Аргумент**

- `string` — IP адрес. [Строка](../data-types/string.md).

**Возвращаемое значение**

- IPv6 адрес в бинарном формате. [FixedString(16)](../data-types/fixedstring.md).

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

**См. также**

- [cutIPv6](#cutipv6x-bytestocutforipv6-bytestocutforipv4).

## IPv6StringToNumOrDefault(s) {#ipv6stringtonumordefaults}

То же, что и `IPv6StringToNum`, но если IPv6 адрес имеет неверный формат, возвращает 0.

## IPv6StringToNumOrNull(s) {#ipv6stringtonumornulls}

То же, что и `IPv6StringToNum`, но если IPv6 адрес имеет неверный формат, возвращает null.

## IPv4ToIPv6(x) {#ipv4toipv6x}

Принимает число типа `UInt32`. Интерпретирует его как IPv4 адрес в [big endian](https://en.wikipedia.org/wiki/Endianness). Возвращает значение `FixedString(16)`, содержащее IPv6 адрес в бинарном формате. Примеры:

```sql
SELECT IPv6NumToString(IPv4ToIPv6(IPv4StringToNum('192.168.0.1'))) AS addr;
```

```text
┌─addr───────────────┐
│ ::ffff:192.168.0.1 │
└────────────────────┘
```

## cutIPv6(x, bytesToCutForIPv6, bytesToCutForIPv4) {#cutipv6x-bytestocutforipv6-bytestocutforipv4}

Принимает значение типа FixedString(16), содержащее IPv6 адрес в бинарном формате. Возвращает строку, содержащую адрес с удаленным указанным количеством байтов в текстовом формате. Например:

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

Принимает IPv4 и значение UInt8, содержащее [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing). Возвращает кортеж из двух IPv4, содержащих нижнюю и верхнюю границы подсети.

```sql
SELECT IPv4CIDRToRange(toIPv4('192.168.5.2'), 16);
```

```text
┌─IPv4CIDRToRange(toIPv4('192.168.5.2'), 16)─┐
│ ('192.168.0.0','192.168.255.255')          │
└────────────────────────────────────────────┘
```

## IPv6CIDRToRange(ipv6, Cidr), {#ipv6cidrtorangeipv6-cidr}

Принимает IPv6 и значение UInt8, содержащее CIDR. Возвращает кортеж из двух IPv6, содержащих нижнюю и верхнюю границы подсети.

```sql
SELECT IPv6CIDRToRange(toIPv6('2001:0db8:0000:85a3:0000:0000:ac1f:8001'), 32);
```

```text
┌─IPv6CIDRToRange(toIPv6('2001:0db8:0000:85a3:0000:0000:ac1f:8001'), 32)─┐
│ ('2001:db8::','2001:db8:ffff:ffff:ffff:ffff:ffff:ffff')                │
└────────────────────────────────────────────────────────────────────────┘
```

## toIPv4 {#toipv4}

Конвертирует строку или число UInt32 в тип [IPv4](../data-types/ipv4.md).
Похоже на функции [`IPv4StringToNum`](#IPv4StringToNum) и [IPv4NumToString](#IPv4NumToString), но поддерживает как строковые, так и беззнаковые целые типы данных в качестве входных аргументов.

**Синтаксис**

```sql
toIPv4(x)
```

**Аргументы**

- `x` — IPv4 адрес. [`Строка`](../data-types/string.md), [`UInt8/16/32`](../data-types/int-uint.md).

**Возвращаемое значение**

- IPv4 адрес. [IPv4](../data-types/ipv4.md).

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

Запрос:

```sql
SELECT toIPv4(2130706433);
```

Результат:

```text
┌─toIPv4(2130706433)─┐
│ 127.0.0.1          │
└────────────────────┘
```

## toIPv4OrDefault {#toipv4ordefault}

То же, что и `toIPv4`, но если IPv4 адрес имеет неверный формат, возвращает `0.0.0.0` (0 IPv4) или указанный IPv4 по умолчанию.

**Синтаксис**

```sql
toIPv4OrDefault(string[, default])
```

**Аргументы**

- `value` — IP адрес. [Строка](../data-types/string.md).
- `default` (необязательно) — Значение, возвращаемое если `string` имеет неверный формат. [IPv4](../data-types/ipv4.md).

**Возвращаемое значение**

- `string`, преобразованная в текущий IPv4 адрес. [Строка](../data-types/string.md).

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

```response
┌─valid───┬─default─┬─provided_default─┐
│ 0.0.0.0 │ 0.0.0.0 │ 1.1.1.1          │
└─────────┴─────────┴──────────────────┘
```

## toIPv4OrNull {#toipv4ornull}

То же, что и [`toIPv4`](#toipv4), но если IPv4 адрес имеет неверный формат, возвращает null.

**Синтаксис**

```sql
toIPv4OrNull(string)
```

**Аргументы**

- `string` — IP адрес. [Строка](../data-types/string.md).

**Возвращаемое значение**

- `string`, преобразованная в текущий IPv4 адрес, или null, если `string` является недействительным адресом. [Строка](../data-types/string.md).

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

То же, что и [`toIPv4`](#toipv4), но если IPv4 адрес имеет неверный формат, возвращает `0.0.0.0`.

**Синтаксис**

```sql
toIPv4OrZero(string)
```

**Аргументы**

- `string` — IP адрес. [Строка](../data-types/string.md).

**Возвращаемое значение**

- `string`, преобразованная в текущий IPv4 адрес, или `0.0.0.0`, если `string` является недействительным адресом. [Строка](../data-types/string.md).

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

Конвертирует строку или UInt128 в тип [IPv6](../data-types/ipv6.md). Для строк, если IPv6 адрес имеет неверный формат, возвращает пустое значение.
Похоже на функции [IPv6StringToNum](#ipv6stringtonum) и [IPv6NumToString](#ipv6numtostringx), которые преобразуют IPv6 адрес в бинарный формат (т.е. `FixedString(16)`).

Если входная строка содержит валидный IPv4 адрес, возвращается его IPv6 эквивалент.

**Синтаксис**

```sql
toIPv6(string)
toIPv6(UInt128)
```

**Аргумент**

- `x` — IP адрес. [`Строка`](../data-types/string.md) или [`UInt128`](../data-types/int-uint.md).

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

То же, что и [`toIPv6`](#toipv6), но если IPv6 адрес имеет неверный формат, возвращает `::` (0 IPv6) или указанный IPv6 по умолчанию.

**Синтаксис**

```sql
toIPv6OrDefault(string[, default])
```

**Аргумент**

- `string` — IP адрес. [Строка](../data-types/string.md).
- `default` (необязательно) — Значение, возвращаемое если `string` имеет неверный формат. [IPv6](../data-types/ipv6.md).

**Возвращаемое значение**

- IPv6 адрес [IPv6](../data-types/ipv6.md), иначе `::` или указанное значение по умолчанию, если `string` имеет неверный формат.

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

То же, что и [`toIPv6`](#toipv6), но если IPv6 адрес имеет неверный формат, возвращает null.

**Синтаксис**

```sql
toIPv6OrNull(string)
```

**Аргумент**

- `string` — IP адрес. [Строка](../data-types/string.md).

**Возвращаемое значение**

- IP адрес. [IPv6](../data-types/ipv6.md), или null, если `string` не имеет корректного формата.

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

То же, что и [`toIPv6`](#toipv6), но если IPv6 адрес имеет неверный формат, возвращает `::`.

**Синтаксис**

```sql
toIPv6OrZero(string)
```

**Аргумент**

- `string` — IP адрес. [Строка](../data-types/string.md).

**Возвращаемое значение**

- IP адрес. [IPv6](../data-types/ipv6.md), или `::`, если `string` не имеет корректного формата.

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

То же, что и `toIPv6`, но если IPv6 адрес имеет неверный формат, возвращает 0.

## IPv6StringToNumOrNull(s) {#ipv6stringtonumornulls-1}

То же, что и `toIPv6`, но если IPv6 адрес имеет неверный формат, возвращает null.

## isIPv4String {#isipv4string}

Определяет, является ли входная строка IPv4 адресом. Если `string` является IPv6 адресом, возвращает `0`.

**Синтаксис**

```sql
isIPv4String(string)
```

**Аргументы**

- `string` — IP адрес. [Строка](../data-types/string.md).

**Возвращаемое значение**

- `1`, если `string` является IPv4 адресом, `0` в противном случае. [UInt8](../data-types/int-uint.md).

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

Определяет, является ли входная строка IPv6 адресом. Если `string` является IPv4 адресом, возвращает `0`.

**Синтаксис**

```sql
isIPv6String(string)
```

**Аргументы**

- `string` — IP адрес. [Строка](../data-types/string.md).

**Возвращаемое значение**

- `1`, если `string` является IPv6 адресом, `0` в противном случае. [UInt8](../data-types/int-uint.md).

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

Определяет, содержится ли IP адрес в сети, представленной в нотации [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing). Возвращает `1`, если это так, или `0` в противном случае.

**Синтаксис**

```sql
isIPAddressInRange(address, prefix)
```

Эта функция принимает как IPv4, так и IPv6 адреса (и сети), представленные в виде строк. Возвращает `0`, если версия IP адреса и CIDR не совпадают.

**Аргументы**

- `address` — IPv4 или IPv6 адрес. [Строка](../data-types/string.md), [IPv4](../data-types/ipv4.md), [IPv6](../data-types/ipv6.md), `Nullable(String)`, `Nullable(IPv4)` и `Nullable(IPv6)`.
- `prefix` — IPv4 или IPv6 сетевой префикс в CIDR. [Строка](../data-types/string.md).

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
