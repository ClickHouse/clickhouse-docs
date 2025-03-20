---
slug: /sql-reference/functions/hash-functions
sidebar_position: 85
sidebar_label: Hash
---

# Хеш-функции

Хеш-функции могут использоваться для детерминированной псевдослучайной перетасовки элементов.

Simhash — это хеш-функция, которая возвращает близкие значения хеша для близких (похожих) аргументов.
## halfMD5 {#halfmd5}

[Интерпретирует](/sql-reference/functions/type-conversion-functions#reinterpretasstring) все входные параметры как строки и вычисляет значение хеша [MD5](https://en.wikipedia.org/wiki/MD5) для каждого из них. Затем комбинирует хеши, берет первые 8 байтов хеша результирующей строки и интерпретирует их как `UInt64` в порядке байтов big-endian.

```sql
halfMD5(par1, ...)
```

Функция относительно медленная (5 миллионов коротких строк в секунду на один процессорный ядро).
Рекомендуется использовать функцию [sipHash64](#siphash64) вместо нее.

**Аргументы**

Функция принимает переменное количество входных параметров. Аргументы могут быть любого из [поддерживаемых типов данных](../data-types/index.md). Для некоторых типов данных вычисленное значение хеш-функции может быть одинаковым для одних и тех же значений, даже если типы аргументов различаются (целые числа разных размеров, именованные и неименованные `Tuple` с одинаковыми данными, `Map` и соответствующий тип `Array(Tuple(key, value))` с одинаковыми данными).

**Возвращаемое значение**

Значение хеша типа [UInt64](../data-types/int-uint.md).

**Пример**

```sql
SELECT halfMD5(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS halfMD5hash, toTypeName(halfMD5hash) AS type;
```

```response
┌────────halfMD5hash─┬─type───┐
│ 186182704141653334 │ UInt64 │
└────────────────────┴────────┘
```
## MD4 {#md4}

Вычисляет MD4 из строки и возвращает результирующий набор байтов как FixedString(16).
## MD5 {#md5}

Вычисляет MD5 из строки и возвращает результирующий набор байтов как FixedString(16).
Если вам не нужен MD5 в частности, но вам нужна приличная криптографическая 128-битная хеш-функция, используйте функцию 'sipHash128' вместо этого.
Если вы хотите получить такой же результат, как выход, генерируемый утилитой md5sum, используйте lower(hex(MD5(s))).
## RIPEMD160 {#ripemd160}

Генерирует значение хеша [RIPEMD-160](https://en.wikipedia.org/wiki/RIPEMD).

**Синтаксис**

```sql
RIPEMD160(input)
```

**Параметры**

- `input`: Входная строка. [String](../data-types/string.md)

**Возвращаемое значение**

- 160-битное значение хеша `RIPEMD-160` типа [FixedString(20)](../data-types/fixedstring.md).

**Пример**

Используйте функцию [hex](../functions/encoding-functions.md/#hex), чтобы представить результат в виде шестнадцатеричной строки.

Запрос:

```sql
SELECT HEX(RIPEMD160('Скоро весна, а у меня опять нет весны.'));
```

```response
┌─HEX(RIPEMD160('Скоро весна, а у меня опять нет весны.'))─┐
│ 37F332F68DB77BD9D7EDD4969571AD671CF9DD3B                      │
└───────────────────────────────────────────────────────────────┘
```
## sipHash64 {#siphash64}

Генерирует 64-битное значение хеша [SipHash](https://en.wikipedia.org/wiki/SipHash).

```sql
sipHash64(par1,...)
```

Это криптографическая хеш-функция. Она работает как минимум в три раза быстрее, чем хеш-функция [MD5](#md5).

Функция [интерпретирует](/sql-reference/functions/type-conversion-functions#reinterpretasstring) все входные параметры как строки и вычисляет значение хеша для каждого из них. Затем она комбинирует хеши по следующему алгоритму:

1. Первое и второе значения хеша конкатенируются в массив, который затем хешируется.
2. Предварительно вычисленное значение хеша и хеш третьего входного параметра хешируются аналогичным образом.
3. Этот расчет повторяется для всех оставшихся значений хеша из оригинального входа.

**Аргументы**

Функция принимает переменное количество входных параметров любого из [поддерживаемых типов данных](../data-types/index.md).

**Возвращаемое значение**

Значение хеша типа [UInt64](../data-types/int-uint.md).

Обратите внимание, что вычисленные значения хеша могут быть равными для одних и тех же входных значений различных типов аргументов. Это влияет на, например, целочисленные типы разных размеров, именованные и неименованные `Tuple` с одними и теми же данными, `Map` и соответствующий тип `Array(Tuple(key, value))` с одинаковыми данными.

**Пример**

```sql
SELECT sipHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS SipHash, toTypeName(SipHash) AS type;
```

```response
┌──────────────SipHash─┬─type───┐
│ 11400366955626497465 │ UInt64 │
└──────────────────────┴────────┘
```
## sipHash64Keyed {#siphash64keyed}

То же самое, что и [sipHash64](#siphash64), но дополнительно принимает явный аргумент ключа вместо использования фиксированного ключа.

**Синтаксис**

```sql
sipHash64Keyed((k0, k1), par1,...)
```

**Аргументы**

То же самое, что и [sipHash64](#siphash64), но первый аргумент — это кортеж из двух значений UInt64, представляющих ключ.

**Возвращаемое значение**

Значение хеша типа [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT sipHash64Keyed((506097522914230528, 1084818905618843912), array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS SipHash, toTypeName(SipHash) AS type;
```

```response
┌─────────────SipHash─┬─type───┐
│ 8017656310194184311 │ UInt64 │
└─────────────────────┴────────┘
```
## sipHash128 {#siphash128}

Как [sipHash64](#siphash64), но генерирует 128-битное значение хеша, т.е. финальное состояние xor-folding выполняется до 128 бит.

:::note
Этот 128-битный вариант отличается от эталонной реализации и является более слабым.
Эта версия существует, потому что на момент ее написания не было официального 128-битного расширения для SipHash.
Новым проектам, вероятно, следует использовать [sipHash128Reference](#siphash128reference).
:::

**Синтаксис**

```sql
sipHash128(par1,...)
```

**Аргументы**

То же самое, что для [sipHash64](#siphash64).

**Возвращаемое значение**

128-битное значение хеша `SipHash` типа [FixedString(16)](../data-types/fixedstring.md).

**Пример**

Запрос:

```sql
SELECT hex(sipHash128('foo', '\x01', 3));
```

Результат:

```response
┌─hex(sipHash128('foo', '', 3))────┐
│ 9DE516A64A414D4B1B609415E4523F24 │
└──────────────────────────────────┘
```
## sipHash128Keyed {#siphash128keyed}

То же самое, что и [sipHash128](#siphash128), но дополнительно принимает явный аргумент ключа вместо использования фиксированного ключа.

:::note
Этот 128-битный вариант отличается от эталонной реализации и является более слабым.
Эта версия существует, потому что на момент ее написания не было официального 128-битного расширения для SipHash.
Новым проектам, вероятно, следует использовать [sipHash128ReferenceKeyed](#siphash128referencekeyed).
:::

**Синтаксис**

```sql
sipHash128Keyed((k0, k1), par1,...)
```

**Аргументы**

То же самое, что и [sipHash128](#siphash128), но первый аргумент — это кортеж из двух значений UInt64, представляющих ключ.

**Возвращаемое значение**

128-битное значение хеша `SipHash` типа [FixedString(16)](../data-types/fixedstring.md).

**Пример**

Запрос:

```sql
SELECT hex(sipHash128Keyed((506097522914230528, 1084818905618843912),'foo', '\x01', 3));
```

Результат:

```response
┌─hex(sipHash128Keyed((506097522914230528, 1084818905618843912), 'foo', '', 3))─┐
│ B8467F65C8B4CFD9A5F8BD733917D9BF                                              │
└───────────────────────────────────────────────────────────────────────────────┘
```
## sipHash128Reference {#siphash128reference}

Как [sipHash128](#siphash128), но реализует 128-битный алгоритм от оригинальных авторов SipHash.

**Синтаксис**

```sql
sipHash128Reference(par1,...)
```

**Аргументы**

То же самое, что и для [sipHash128](#siphash128).

**Возвращаемое значение**

128-битное значение хеша `SipHash` типа [FixedString(16)](../data-types/fixedstring.md).

**Пример**

Запрос:

```sql
SELECT hex(sipHash128Reference('foo', '\x01', 3));
```

Результат:

```response
┌─hex(sipHash128Reference('foo', '', 3))─┐
│ 4D1BE1A22D7F5933C0873E1698426260       │
└────────────────────────────────────────┘
```
## sipHash128ReferenceKeyed {#siphash128referencekeyed}

То же самое, что и [sipHash128Reference](#siphash128reference), но дополнительно принимает явный аргумент ключа вместо использования фиксированного ключа.

**Синтаксис**

```sql
sipHash128ReferenceKeyed((k0, k1), par1,...)
```

**Аргументы**

То же самое, что и [sipHash128Reference](#siphash128reference), но первый аргумент — это кортеж из двух значений UInt64, представляющих ключ.

**Возвращаемое значение**

128-битное значение хеша `SipHash` типа [FixedString(16)](../data-types/fixedstring.md).

**Пример**

Запрос:

```sql
SELECT hex(sipHash128ReferenceKeyed((506097522914230528, 1084818905618843912),'foo', '\x01', 3));
```

Результат:

```response
┌─hex(sipHash128ReferenceKeyed((506097522914230528, 1084818905618843912), 'foo', '', 3))─┐
│ 630133C9722DC08646156B8130C4CDC8                                                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
## cityHash64 {#cityhash64}

Генерирует 64-битное значение хеша [CityHash](https://github.com/google/cityhash).

```sql
cityHash64(par1,...)
```

Это быстрое некриптографическое значение хеша. Он использует алгоритм CityHash для строковых параметров и конкретно реализованный быстрый некриптографический хеш для параметров с другими типами данных. Функция использует комбинированный CityHash для получения окончательных результатов.

Обратите внимание, что Google изменил алгоритм CityHash после того, как его добавили в ClickHouse. Другими словами, cityHash64 ClickHouse и upstream CityHash Google теперь производят разные результаты. cityHash64 ClickHouse соответствует CityHash v1.0.2.

**Аргументы**

Функция принимает переменное количество входных параметров. Аргументы могут быть любого из [поддерживаемых типов данных](../data-types/index.md). Для некоторых типов данных вычисленное значение хеш-функции может быть одинаковым для одних и тех же значений, даже если типы аргументов различаются (целые числа различных размеров, именованные и неименованные `Tuple` с одинаковыми данными, `Map` и соответствующий тип `Array(Tuple(key, value))` с одинаковыми данными).

**Возвращаемое значение**

Значение хеша типа [UInt64](../data-types/int-uint.md).

**Примеры**

Пример вызова:

```sql
SELECT cityHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS CityHash, toTypeName(CityHash) AS type;
```

```response
┌─────────────CityHash─┬─type───┐
│ 12072650598913549138 │ UInt64 │
└──────────────────────┴────────┘
```

Следующий пример показывает, как вычислить контрольную сумму всей таблицы с точностью до порядка строк:

```sql
SELECT groupBitXor(cityHash64(*)) FROM table
```
## intHash32 {#inthash32}

Вычисляет 32-битный код хеша из любого типа целого числа.
Это относительно быстрая некриптографическая хеш-функция среднего качества для чисел.

**Синтаксис**

```sql
intHash32(int)
```

**Аргументы**

- `int` — Целое число для хеширования. [(U)Int*](../data-types/int-uint.md).

**Возвращаемое значение**

- 32-битный код хеша. [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT intHash32(42);
```

Результат:

```response
┌─intHash32(42)─┐
│    1228623923 │
└───────────────┘
```
## intHash64 {#inthash64}

Вычисляет 64-битный код хеша из любого типа целого числа.
Это относительно быстрая некриптографическая хеш-функция среднего качества для чисел.
Она работает быстрее, чем [intHash32](#inthash32).

**Синтаксис**

```sql
intHash64(int)
```

**Аргументы**

- `int` — Целое число для хеширования. [(U)Int*](../data-types/int-uint.md).

**Возвращаемое значение**

- 64-битный код хеша. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT intHash64(42);
```

Результат:

```response
┌────────intHash64(42)─┐
│ 11490350930367293593 │
└──────────────────────┘
```
## SHA1, SHA224, SHA256, SHA512, SHA512_256 {#sha1-sha224-sha256-sha512-sha512_256}

Вычисляет SHA-1, SHA-224, SHA-256, SHA-512, SHA-512-256 хеш из строки и возвращает результирующий набор байтов как [FixedString](../data-types/fixedstring.md).

**Синтаксис**

```sql
SHA1('s')
...
SHA512('s')
```

Функция работает довольно медленно (SHA-1 обрабатывает около 5 миллионов коротких строк в секунду на одно процессорное ядро, в то время как SHA-224 и SHA-256 обрабатывают около 2.2 миллиона).
Рекомендуется использовать эту функцию только в случаях, когда вам нужна конкретная хеш-функция и вы не можете ее выбрать.
Даже в этих случаях мы рекомендуем применять функцию офлайн и предвычислять значения при их вставке в таблицу, вместо применения в `SELECT` запросах.

**Аргументы**

- `s` — Входная строка для вычисления SHA хеша. [String](../data-types/string.md).

**Возвращаемое значение**

- SHA хеш в виде шестнадцатеричной неподеленной FixedString. SHA-1 возвращает как FixedString(20), SHA-224 как FixedString(28), SHA-256 — FixedString(32), SHA-512 — FixedString(64). [FixedString](../data-types/fixedstring.md).

**Пример**

Используйте функцию [hex](../functions/encoding-functions.md/#hex), чтобы представить результат в виде шестнадцатеричной строки.

Запрос:

```sql
SELECT hex(SHA1('abc'));
```

Результат:

```response
┌─hex(SHA1('abc'))─────────────────────────┐
│ A9993E364706816ABA3E25717850C26C9CD0D89D │
└──────────────────────────────────────────┘
```
## BLAKE3 {#blake3}

Вычисляет хеш-строку BLAKE3 и возвращает результирующий набор байтов как [FixedString](../data-types/fixedstring.md).

**Синтаксис**

```sql
BLAKE3('s')
```

Эта криптографическая хеш-функция интегрирована в ClickHouse с библиотекой BLAKE3 на Rust. Функция довольно быстрая и демонстрирует примерно в два раза большую производительность по сравнению с SHA-2, при этом генерируя хеши того же размера, что и SHA-256.

**Аргументы**

- s - входная строка для вычисления хеша BLAKE3. [String](../data-types/string.md).

**Возвращаемое значение**

- Хеш BLAKE3 в виде массива байтов с типом FixedString(32). [FixedString](../data-types/fixedstring.md).

**Пример**

Используйте функцию [hex](../functions/encoding-functions.md/#hex), чтобы представить результат в виде шестнадцатеричной строки.

Запрос:
```sql
SELECT hex(BLAKE3('ABC'))
```

Результат:
```sql
┌─hex(BLAKE3('ABC'))───────────────────────────────────────────────┐
│ D1717274597CF0289694F75D96D444B992A096F1AFD8E7BBFA6EBB1D360FEDFC │
└──────────────────────────────────────────────────────────────────┘
```
## URLHash(url\[, N\]) {#urlhashurl-n}

Быстрая, приемлемого качества некриптографическая хеш-функция для строки, полученной из URL с использованием некоторого типа нормализации.
`URLHash(s)` – вычисляет хеш из строки без одного из завершающих символов `/`,`?` или `#` на конце, если они присутствуют.
`URLHash(s, N)` – вычисляет хеш из строки до уровня N в иерархии URL, без одного из завершающих символов `/`,`?` или `#` на конце, если они присутствуют.
Уровни такие же, как в URLHierarchy.
## farmFingerprint64 {#farmfingerprint64}
## farmHash64 {#farmhash64}

Генерирует 64-битное значение [FarmHash](https://github.com/google/farmhash) или Fingerprint. Для стабильного и переносимого значения предпочтителен `farmFingerprint64`.

```sql
farmFingerprint64(par1, ...)
farmHash64(par1, ...)
```

Эти функции используют методы `Fingerprint64` и `Hash64` соответственно из всех [доступных методов](https://github.com/google/farmhash/blob/master/src/farmhash.h).

**Аргументы**

Функция принимает переменное количество входных параметров. Аргументы могут быть любого из [поддерживаемых типов данных](../data-types/index.md). Для некоторых типов данных вычисленное значение хеш-функции может быть одинаковым для одних и тех же значений, даже если типы аргументов различаются (целые числа разных размеров, именованные и неименованные `Tuple` с одинаковыми данными, `Map` и соответствующий тип `Array(Tuple(key, value))` с одинаковыми данными).

**Возвращаемое значение**

Значение хеша типа [UInt64](../data-types/int-uint.md).

**Пример**

```sql
SELECT farmHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS FarmHash, toTypeName(FarmHash) AS type;
```

```response
┌─────────────FarmHash─┬─type───┐
│ 17790458267262532859 │ UInt64 │
└──────────────────────┴────────┘
```
## javaHash {#javahash}

Вычисляет JavaHash из [строки](http://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/String.java#l1452),
[Byte](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Byte.java#l405),
[Short](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Short.java#l410),
[Integer](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Integer.java#l959),
[Long](https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/Long.java#l1060).
Эта хеш-функция не быстрая и не имеет хорошего качества. Единственная причина для ее использования — это когда этот алгоритм уже используется в другой системе, и вам нужно вычислить точно такой же результат.

Обратите внимание, что Java поддерживает вычисление только хеша для знаковых целых чисел, поэтому если вам нужно вычислить хеш для беззнаковых целых чисел, вы должны привести их к соответствующим знаковым типам ClickHouse.

**Синтаксис**

```sql
SELECT javaHash('')
```

**Возвращаемое значение**

Значение хеша типа `Int32`.

**Пример**

Запрос:

```sql
SELECT javaHash(toInt32(123));
```

Результат:

```response
┌─javaHash(toInt32(123))─┐
│               123      │
└────────────────────────┘
```

Запрос:

```sql
SELECT javaHash('Hello, world!');
```

Результат:

```response
┌─javaHash('Hello, world!')─┐
│               -1880044555 │
└───────────────────────────┘
```
## javaHashUTF16LE {#javahashutf16le}

Вычисляет [JavaHash](http://hg.openjdk.java.net/jdk8u/jdk8u/jdk/file/478a4add975b/src/share/classes/java/lang/String.java#l1452) из строки, предполагая, что она содержит байты, представляющие строку в кодировке UTF-16LE.

**Синтаксис**

```sql
javaHashUTF16LE(stringUtf16le)
```

**Аргументы**

- `stringUtf16le` — строка в кодировке UTF-16LE.

**Возвращаемое значение**

Значение хеша типа `Int32`.

**Пример**

Правильный запрос со строкой в кодировке UTF-16LE.

Запрос:

```sql
SELECT javaHashUTF16LE(convertCharset('test', 'utf-8', 'utf-16le'));
```

Результат:

```response
┌─javaHashUTF16LE(convertCharset('test', 'utf-8', 'utf-16le'))─┐
│                                                      3556498 │
└──────────────────────────────────────────────────────────────┘
```
## hiveHash {#hivehash}

Вычисляет `HiveHash` из строки.

```sql
SELECT hiveHash('')
```

Это просто [JavaHash](#javahash) с обнуленным знаком. Эта функция используется в [Apache Hive](https://en.wikipedia.org/wiki/Apache_Hive) для версий до 3.0. Эта хеш-функция не быстрая и не имеет хорошего качества. Единственная причина для ее использования — это когда этот алгоритм уже используется в другой системе, и вам нужно вычислить точно такой же результат.

**Возвращаемое значение**

- значение хеша `hiveHash`. [Int32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT hiveHash('Hello, world!');
```

Результат:

```response
┌─hiveHash('Hello, world!')─┐
│                 267439093 │
└───────────────────────────┘
```
## metroHash64 {#metrohash64}

Генерирует 64-битное значение [MetroHash](http://www.jandrewrogers.com/2015/05/27/metrohash/) хеш.

```sql
metroHash64(par1, ...)
```

**Аргументы**

Функция принимает переменное количество входных параметров. Аргументы могут быть любого из [поддерживаемых типов данных](../data-types/index.md). Для некоторых типов данных вычисленное значение хеш-функции может быть одинаковым для одних и тех же значений, даже если типы аргументов различаются (целые числа разных размеров, именованные и неименованные `Tuple` с одинаковыми данными, `Map` и соответствующий тип `Array(Tuple(key, value))` с одинаковыми данными).

**Возвращаемое значение**

Значение хеша типа [UInt64](../data-types/int-uint.md).

**Пример**

```sql
SELECT metroHash64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS MetroHash, toTypeName(MetroHash) AS type;
```

```response
┌────────────MetroHash─┬─type───┐
│ 14235658766382344533 │ UInt64 │
└──────────────────────┴────────┘
```
## jumpConsistentHash {#jumpconsistenthash}

Вычисляет JumpConsistentHash из UInt64.
Принимает два аргумента: ключ типа UInt64 и количество бакетов. Возвращает Int32.
Для получения дополнительной информации см. ссылку: [JumpConsistentHash](https://arxiv.org/pdf/1406.2294.pdf)
## kostikConsistentHash {#kostikconsistenthash}

Алгоритм согласованного хеширования с O(1) по времени и пространству от Константина "kostik" Облакова. Ранее `yandexConsistentHash`.

**Синтаксис**

```sql
kostikConsistentHash(input, n)
```

Псевдоним: `yandexConsistentHash` (оставлен для обратной совместимости).

**Параметры**

- `input`: Ключ типа UInt64 [UInt64](../data-types/int-uint.md).
- `n`: Количество бакетов. [UInt16](../data-types/int-uint.md).

**Возвращаемое значение**

- Значение типа [UInt16](../data-types/int-uint.md) хеша.

**Детали реализации**

Это эффективно только если n &lt;= 32768.

**Пример**

Запрос:

```sql
SELECT kostikConsistentHash(16045690984833335023, 2);
```

```response
┌─kostikConsistentHash(16045690984833335023, 2)─┐
│                                             1 │
└───────────────────────────────────────────────┘
```
## murmurHash2_32, murmurHash2_64 {#murmurhash2_32-murmurhash2_64}

Генерирует значение [MurmurHash2](https://github.com/aappleby/smhasher) хеша.

```sql
murmurHash2_32(par1, ...)
murmurHash2_64(par1, ...)
```

**Аргументы**

Обе функции принимают переменное количество входных параметров. Аргументы могут быть любого из [поддерживаемых типов данных](../data-types/index.md). Для некоторых типов данных вычисленное значение хеш-функции может быть одинаковым для одних и тех же значений, даже если типы аргументов различаются (целые числа разных размеров, именованные и неименованные `Tuple` с одинаковыми данными, `Map` и соответствующий тип `Array(Tuple(key, value))` с одинаковыми данными).

**Возвращаемое значение**

- Функция `murmurHash2_32` возвращает значение хеша, имеющее тип [UInt32](../data-types/int-uint.md).
- Функция `murmurHash2_64` возвращает значение хеша, имеющее тип [UInt64](../data-types/int-uint.md).

**Пример**

```sql
SELECT murmurHash2_64(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS MurmurHash2, toTypeName(MurmurHash2) AS type;
```

```response
┌──────────MurmurHash2─┬─type───┐
│ 11832096901709403633 │ UInt64 │
└──────────────────────┴────────┘
```
## gccMurmurHash {#gccmurmurhash}

Вычисляет 64-битное значение [MurmurHash2](https://github.com/aappleby/smhasher) хеша с использованием того же семени хеша, что и [gcc](https://github.com/gcc-mirror/gcc/blob/41d6b10e96a1de98e90a7c0378437c3255814b16/libstdc%2B%2B-v3/include/bits/functional_hash.h#L191). Он совместим между сборками Clang и GCC.

**Синтаксис**

```sql
gccMurmurHash(par1, ...)
```

**Аргументы**

- `par1, ...` — Переменное количество параметров, которые могут быть любым из [поддерживаемых типов данных](/sql-reference/data-types).

**Возвращаемое значение**

- Вычисленное значение хеша. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT
    gccMurmurHash(1, 2, 3) AS res1,
    gccMurmurHash(('a', [1, 2, 3], 4, (4, ['foo', 'bar'], 1, (1, 2)))) AS res2
```

Результат:

```response
┌─────────────────res1─┬────────────────res2─┐
│ 12384823029245979431 │ 1188926775431157506 │
└──────────────────────┴─────────────────────┘
```
## kafkaMurmurHash {#kafkamurmurhash}

Вычисляет 32-битное значение [MurmurHash2](https://github.com/aappleby/smhasher) хеша с использованием того же семени хеша, что и [Kafka](https://github.com/apache/kafka/blob/461c5cfe056db0951d9b74f5adc45973670404d7/clients/src/main/java/org/apache/kafka/common/utils/Utils.java#L482) и без самого высокого бита, чтобы быть совместимым с [Default Partitioner](https://github.com/apache/kafka/blob/139f7709bd3f5926901a21e55043388728ccca78/clients/src/main/java/org/apache/kafka/clients/producer/internals/BuiltInPartitioner.java#L328).

**Синтаксис**

```sql
MurmurHash(par1, ...)
```

**Аргументы**

- `par1, ...` — Переменное количество параметров, которые могут быть любым из [поддерживаемых типов данных](/sql-reference/data-types).

**Возвращаемое значение**

- Вычисленное значение хеша. [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT
    kafkaMurmurHash('foobar') AS res1,
    kafkaMurmurHash(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS res2
```

Результат:

```response
┌───────res1─┬─────res2─┐
│ 1357151166 │ 85479775 │
└────────────┴──────────┘
```
## murmurHash3_32, murmurHash3_64 {#murmurhash3_32-murmurhash3_64}

Генерирует значение [MurmurHash3](https://github.com/aappleby/smhasher) хеша.

```sql
murmurHash3_32(par1, ...)
murmurHash3_64(par1, ...)
```

**Аргументы**

Обе функции принимают переменное количество входных параметров. Аргументы могут быть любого из [поддерживаемых типов данных](../data-types/index.md). Для некоторых типов данных вычисленное значение хеш-функции может быть одинаковым для одних и тех же значений, даже если типы аргументов различаются (целые числа разных размеров, именованные и неименованные `Tuple` с одинаковыми данными, `Map` и соответствующий тип `Array(Tuple(key, value))` с одинаковыми данными).

**Возвращаемое значение**

- Функция `murmurHash3_32` возвращает значение хеша типа [UInt32](../data-types/int-uint.md).
- Функция `murmurHash3_64` возвращает значение хеша типа [UInt64](../data-types/int-uint.md).

**Пример**

```sql
SELECT murmurHash3_32(array('e','x','a'), 'mple', 10, toDateTime('2019-06-15 23:00:00')) AS MurmurHash3, toTypeName(MurmurHash3) AS type;
```

```response
┌─MurmurHash3─┬─type───┐
│     2152717 │ UInt32 │
└─────────────┴────────┘
```
## murmurHash3_128 {#murmurhash3_128}

Генерирует 128-битное значение [MurmurHash3](https://github.com/aappleby/smhasher) хеша.

**Синтаксис**

```sql
murmurHash3_128(expr)
```

**Аргументы**

- `expr` — Список [выражений](/sql-reference/syntax#expressions). [String](../data-types/string.md).

**Возвращаемое значение**

128-битное значение хеша `MurmurHash3`. [FixedString(16)](../data-types/fixedstring.md).

**Пример**

Запрос:

```sql
SELECT hex(murmurHash3_128('foo', 'foo', 'foo'));
```

Результат:

```response
┌─hex(murmurHash3_128('foo', 'foo', 'foo'))─┐
│ F8F7AD9B6CD4CF117A71E277E2EC2931          │
└───────────────────────────────────────────┘
```
## xxh3 {#xxh3}

Генерирует 64-битное значение [xxh3](https://github.com/Cyan4973/xxHash) хеша.

**Синтаксис**

```sql
xxh3(expr)
```

**Аргументы**

- `expr` — Список [выражений](/sql-reference/syntax#expressions) любого типа данных.

**Возвращаемое значение**

64-битное значение хеша `xxh3`. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT xxh3('Hello', 'world')
```

Результат:

```response
┌─xxh3('Hello', 'world')─┐
│    5607458076371731292 │
└────────────────────────┘
```
## xxHash32, xxHash64 {#xxhash32-xxhash64}

Вычисляет `xxHash` из строки. Он предлагается в двух вариантах: 32 и 64 бита.

```sql
SELECT xxHash32('')

ИЛИ

SELECT xxHash64('')
```

**Возвращаемое значение**

- Значение хеша. [UInt32/64](../data-types/int-uint.md).

:::note
Тип возвращаемого значения будет `UInt32` для `xxHash32` и `UInt64` для `xxHash64`.
:::

**Пример**

Запрос:

```sql
SELECT xxHash32('Hello, world!');
```

Результат:

```response
┌─xxHash32('Hello, world!')─┐
│                 834093149 │
└───────────────────────────┘
```

**См. также**

- [xxHash](http://cyan4973.github.io/xxHash/).
## ngramSimHash {#ngramsimhash}

Разбивает строку ASCII на n-граммы размером `ngramsize` символов и возвращает n-грамму `simhash`. Чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [bitHammingDistance](../functions/bit-functions.md/#bithammingdistance). Чем меньше [расстояние Хэмминга](https://en.wikipedia.org/wiki/Hamming_distance) между вычисленными `simhash` двух строк, тем более вероятно, что эти строки одинаковые.

**Синтаксис**

```sql
ngramSimHash(string[, ngramsize])
```

**Аргументы**

- `string` — строка. [String](../data-types/string.md).
- `ngramsize` — Размер n-граммы. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Значение хеша. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT ngramSimHash('ClickHouse') AS Hash;
```

Результат:

```response
┌───────Hash─┐
│ 1627567969 │
└────────────┘
```
## ngramSimHashCaseInsensitive {#ngramsimhashcaseinsensitive}

Разбивает строку ASCII на n-граммы размером `ngramsize` символов и возвращает n-грамму `simhash`. Не чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [bitHammingDistance](../functions/bit-functions.md/#bithammingdistance). Чем меньше [расстояние Хэмминга](https://en.wikipedia.org/wiki/Hamming_distance) между вычисленными `simhash` двух строк, тем более вероятно, что эти строки одинаковые.

**Синтаксис**

```sql
ngramSimHashCaseInsensitive(string[, ngramsize])
```

**Аргументы**

- `string` — строка. [String](../data-types/string.md).
- `ngramsize` — Размер n-граммы. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Значение хеша. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT ngramSimHashCaseInsensitive('ClickHouse') AS Hash;
```

Результат:

```response
┌──────Hash─┐
│ 562180645 │
└───────────┘
```
## ngramSimHashUTF8 {#ngramsimhashutf8}

Разбивает строку UTF-8 на n-граммы размером `ngramsize` символов и возвращает n-грамму `simhash`. Чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [bitHammingDistance](../functions/bit-functions.md/#bithammingdistance). Чем меньше [расстояние Хэмминга](https://en.wikipedia.org/wiki/Hamming_distance) между вычисленными `simhash` двух строк, тем более вероятно, что эти строки одинаковые.

**Синтаксис**

```sql
ngramSimHashUTF8(string[, ngramsize])
```

**Аргументы**

- `string` — строка. [String](../data-types/string.md).
- `ngramsize` — Размер n-граммы. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Значение хеша. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT ngramSimHashUTF8('ClickHouse') AS Hash;
```

Результат:

```response
┌───────Hash─┐
│ 1628157797 │
└────────────┘
```

## ngramSimHashCaseInsensitiveUTF8 {#ngramsimhashcaseinsensitiveutf8}

Разделяет строку UTF-8 на n-граммы размером `ngramsize` символов и возвращает n-граммный `simhash`. Не чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [bitHammingDistance](../functions/bit-functions.md/#bithammingdistance). Чем меньше [расстояние Хэмминга](https://en.wikipedia.org/wiki/Hamming_distance) между рассчитанными `simhashes` двух строк, тем больше вероятность, что эти строки совпадают.

**Синтаксис**

```sql
ngramSimHashCaseInsensitiveUTF8(string[, ngramsize])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `ngramsize` — Размер n-граммы. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Хэш-значение. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT ngramSimHashCaseInsensitiveUTF8('ClickHouse') AS Hash;
```

Результат:

```response
┌───────Hash─┐
│ 1636742693 │
└────────────┘
```
## wordShingleSimHash {#wordshinglesimhash}

Разделяет строку ASCII на части (шинглы) размером `shinglesize` слов и возвращает хэш шингла. Чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [bitHammingDistance](../functions/bit-functions.md/#bithammingdistance). Чем меньше [расстояние Хэмминга](https://en.wikipedia.org/wiki/Hamming_distance) между рассчитанными `simhashes` двух строк, тем больше вероятность, что эти строки совпадают.

**Синтаксис**

```sql
wordShingleSimHash(string[, shinglesize])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `shinglesize` — Размер слова шингла. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Хэш-значение. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT wordShingleSimHash('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Hash;
```

Результат:

```response
┌───────Hash─┐
│ 2328277067 │
└────────────┘
```
## wordShingleSimHashCaseInsensitive {#wordshinglesimhashcaseinsensitive}

Разделяет строку ASCII на части (шинглы) размером `shinglesize` слов и возвращает хэш шингла. Не чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [bitHammingDistance](../functions/bit-functions.md/#bithammingdistance). Чем меньше [расстояние Хэмминга](https://en.wikipedia.org/wiki/Hamming_distance) между рассчитанными `simhashes` двух строк, тем больше вероятность, что эти строки совпадают.

**Синтаксис**

```sql
wordShingleSimHashCaseInsensitive(string[, shinglesize])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `shinglesize` — Размер слова шингла. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Хэш-значение. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT wordShingleSimHashCaseInsensitive('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Hash;
```

Результат:

```response
┌───────Hash─┐
│ 2194812424 │
└────────────┘
```
## wordShingleSimHashUTF8 {#wordshinglesimhashutf8}

Разделяет строку UTF-8 на части (шинглы) размером `shinglesize` слов и возвращает хэш шингла. Чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [bitHammingDistance](../functions/bit-functions.md/#bithammingdistance). Чем меньше [расстояние Хэмминга](https://en.wikipedia.org/wiki/Hamming_distance) между рассчитанными `simhashes` двух строк, тем больше вероятность, что эти строки совпадают.

**Синтаксис**

```sql
wordShingleSimHashUTF8(string[, shinglesize])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `shinglesize` — Размер слова шингла. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Хэш-значение. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT wordShingleSimHashUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Hash;
```

Результат:

```response
┌───────Hash─┐
│ 2328277067 │
└────────────┘
```
## wordShingleSimHashCaseInsensitiveUTF8 {#wordshinglesimhashcaseinsensitiveutf8}

Разделяет строку UTF-8 на части (шинглы) размером `shinglesize` слов и возвращает хэш шингла. Не чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [bitHammingDistance](../functions/bit-functions.md/#bithammingdistance). Чем меньше [расстояние Хэмминга](https://en.wikipedia.org/wiki/Hamming_distance) между рассчитанными `simhashes` двух строк, тем больше вероятность, что эти строки совпадают.

**Синтаксис**

```sql
wordShingleSimHashCaseInsensitiveUTF8(string[, shinglesize])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `shinglesize` — Размер слова шингла. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Хэш-значение. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT wordShingleSimHashCaseInsensitiveUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Hash;
```

Результат:

```response
┌───────Hash─┐
│ 2194812424 │
└────────────┘
```
## wyHash64 {#wyhash64}

Создает 64-битное [wyHash64](https://github.com/wangyi-fudan/wyhash) хэш-значение.

**Синтаксис**

```sql
wyHash64(string)
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).

**Возвращаемое значение**

- Хэш-значение. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT wyHash64('ClickHouse') AS Hash;
```

Результат:

```response
┌─────────────────Hash─┐
│ 12336419557878201794 │
└──────────────────────┘
```
## ngramMinHash {#ngramminhash}

Разделяет строку ASCII на n-граммы размером `ngramsize` символов и вычисляет хэш-значения для каждой n-граммы. Использует `hashnum` минимальных хэшей для вычисления минимального хэша и `hashnum` максимальных хэшей для вычисления максимального хэша. Возвращает кортеж с этими хэшами. Чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance). Для двух строк: если один из возвращенных хэшей одинаков для обеих строк, мы считаем, что эти строки совпадают.

**Синтаксис**

```sql
ngramMinHash(string[, ngramsize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `ngramsize` — Размер n-граммы. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя хэшами — минимальный и максимальный. [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

**Пример**

Запрос:

```sql
SELECT ngramMinHash('ClickHouse') AS Tuple;
```

Результат:

```response
┌─Tuple──────────────────────────────────────┐
│ (18333312859352735453,9054248444481805918) │
└────────────────────────────────────────────┘
```
## ngramMinHashCaseInsensitive {#ngramminhashcaseinsensitive}

Разделяет строку ASCII на n-граммы размером `ngramsize` символов и вычисляет хэш-значения для каждой n-граммы. Использует `hashnum` минимальных хэшей для вычисления минимального хэша и `hashnum` максимальных хэшей для вычисления максимального хэша. Возвращает кортеж с этими хэшами. Не чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance). Для двух строк: если один из возвращенных хэшей одинаков для обеих строк, мы считаем, что эти строки совпадают.

**Синтаксис**

```sql
ngramMinHashCaseInsensitive(string[, ngramsize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `ngramsize` — Размер n-граммы. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя хэшами — минимальный и максимальный. [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

**Пример**

Запрос:

```sql
SELECT ngramMinHashCaseInsensitive('ClickHouse') AS Tuple;
```

Результат:

```response
┌─Tuple──────────────────────────────────────┐
│ (2106263556442004574,13203602793651726206) │
└────────────────────────────────────────────┘
```
## ngramMinHashUTF8 {#ngramminhashutf8}

Разделяет строку UTF-8 на n-граммы размером `ngramsize` символов и вычисляет хэш-значения для каждой n-граммы. Использует `hashnum` минимальных хэшей для вычисления минимального хэша и `hashnum` максимальных хэшей для вычисления максимального хэша. Возвращает кортеж с этими хэшами. Чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance). Для двух строк: если один из возвращенных хэшей одинаков для обеих строк, мы считаем, что эти строки совпадают.

**Синтаксис**

```sql
ngramMinHashUTF8(string[, ngramsize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `ngramsize` — Размер n-граммы. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя хэшами — минимальный и максимальный. [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

**Пример**

Запрос:

```sql
SELECT ngramMinHashUTF8('ClickHouse') AS Tuple;
```

Результат:

```response
┌─Tuple──────────────────────────────────────┐
│ (18333312859352735453,6742163577938632877) │
└────────────────────────────────────────────┘
```
## ngramMinHashCaseInsensitiveUTF8 {#ngramminhashcaseinsensitiveutf8}

Разделяет строку UTF-8 на n-граммы размером `ngramsize` символов и вычисляет хэш-значения для каждой n-граммы. Использует `hashnum` минимальных хэшей для вычисления минимального хэша и `hashnum` максимальных хэшей для вычисления максимального хэша. Возвращает кортеж с этими хэшами. Не чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance). Для двух строк: если один из возвращенных хэшей одинаков для обеих строк, мы считаем, что эти строки совпадают.

**Синтаксис**

```sql
ngramMinHashCaseInsensitiveUTF8(string [, ngramsize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `ngramsize` — Размер n-граммы. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя хэшами — минимальный и максимальный. [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

**Пример**

Запрос:

```sql
SELECT ngramMinHashCaseInsensitiveUTF8('ClickHouse') AS Tuple;
```

Результат:

```response
┌─Tuple───────────────────────────────────────┐
│ (12493625717655877135,13203602793651726206) │
└─────────────────────────────────────────────┘
```
## ngramMinHashArg {#ngramminhasharg}

Разделяет строку ASCII на n-граммы размером `ngramsize` символов и возвращает n-граммы с минимальными и максимальными хэшами, рассчитанными функцией [ngramMinHash](#ngramminhash) с теми же входными данными. Чувствителен к регистру.

**Синтаксис**

```sql
ngramMinHashArg(string[, ngramsize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `ngramsize` — Размер n-граммы. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя кортежами, каждый из которых содержит по `hashnum` n-грамм. [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md))).

**Пример**

Запрос:

```sql
SELECT ngramMinHashArg('ClickHouse') AS Tuple;
```

Результат:

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('ous','ick','lic','Hou','kHo','use'),('Hou','lic','ick','ous','ckH','Cli')) │
└───────────────────────────────────────────────────────────────────────────────┘
```
## ngramMinHashArgCaseInsensitive {#ngramminhashargcaseinsensitive}

Разделяет строку ASCII на n-граммы размером `ngramsize` символов и возвращает n-граммы с минимальными и максимальными хэшами, рассчитанными функцией [ngramMinHashCaseInsensitive](#ngramminhashcaseinsensitive) с теми же входными данными. Не чувствителен к регистру.

**Синтаксис**

```sql
ngramMinHashArgCaseInsensitive(string[, ngramsize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `ngramsize` — Размер n-граммы. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя кортежами, каждый из которых содержит по `hashnum` n-грамм. [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md))).

**Пример**

Запрос:

```sql
SELECT ngramMinHashArgCaseInsensitive('ClickHouse') AS Tuple;
```

Результат:

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('ous','ick','lic','kHo','use','Cli'),('kHo','lic','ick','ous','ckH','Hou')) │
└───────────────────────────────────────────────────────────────────────────────┘
```
## ngramMinHashArgUTF8 {#ngramminhashargutf8}

Разделяет строку UTF-8 на n-граммы размером `ngramsize` символов и возвращает n-граммы с минимальными и максимальными хэшами, рассчитанными функцией [ngramMinHashUTF8](#ngramminhashutf8) с теми же входными данными. Чувствителен к регистру.

**Синтаксис**

```sql
ngramMinHashArgUTF8(string[, ngramsize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `ngramsize` — Размер n-граммы. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя кортежами, каждый из которых содержит по `hashnum` n-грамм. [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md))).

**Пример**

Запрос:

```sql
SELECT ngramMinHashArgUTF8('ClickHouse') AS Tuple;
```

Результат:

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('ous','ick','lic','Hou','kHo','use'),('kHo','Hou','lic','ick','ous','ckH')) │
└───────────────────────────────────────────────────────────────────────────────┘
```
## ngramMinHashArgCaseInsensitiveUTF8 {#ngramminhashargcaseinsensitiveutf8}

Разделяет строку UTF-8 на n-граммы размером `ngramsize` символов и возвращает n-граммы с минимальными и максимальными хэшами, рассчитанными функцией [ngramMinHashCaseInsensitiveUTF8](#ngramminhashcaseinsensitiveutf8) с теми же входными данными. Не чувствителен к регистру.

**Синтаксис**

```sql
ngramMinHashArgCaseInsensitiveUTF8(string[, ngramsize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `ngramsize` — Размер n-граммы. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя кортежами, каждый из которых содержит по `hashnum` n-грамм. [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md))).

**Пример**

Запрос:

```sql
SELECT ngramMinHashArgCaseInsensitiveUTF8('ClickHouse') AS Tuple;
```

Результат:

```response
┌─Tuple─────────────────────────────────────────────────────────────────────────┐
│ (('ckH','ous','ick','lic','kHo','use'),('kHo','lic','ick','ous','ckH','Hou')) │
└───────────────────────────────────────────────────────────────────────────────┘
```
## wordShingleMinHash {#wordshingleminhash}

Разделяет строку ASCII на части (шинглы) размером `shinglesize` слов и вычисляет хэш-значения для каждого слова шингла. Использует `hashnum` минимальных хэшей для вычисления минимального хэша и `hashnum` максимальных хэшей для вычисления максимального хэша. Возвращает кортеж с этими хэшами. Чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance). Для двух строк: если один из возвращенных хэшей одинаков для обеих строк, мы считаем, что эти строки совпадают.

**Синтаксис**

```sql
wordShingleMinHash(string[, shinglesize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `shinglesize` — Размер слова шингла. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя хэшами — минимальный и максимальный. [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

**Пример**

Запрос:

```sql
SELECT wordShingleMinHash('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Tuple;
```

Результат:

```response
┌─Tuple──────────────────────────────────────┐
│ (16452112859864147620,5844417301642981317) │
└────────────────────────────────────────────┘
```
## wordShingleMinHashCaseInsensitive {#wordshingleminhashcaseinsensitive}

Разделяет строку ASCII на части (шинглы) размером `shinglesize` слов и вычисляет хэш-значения для каждого слова шингла. Использует `hashnum` минимальных хэшей для вычисления минимального хэша и `hashnum` максимальных хэшей для вычисления максимального хэша. Возвращает кортеж с этими хэшами. Не чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance). Для двух строк: если один из возвращенных хэшей одинаков для обеих строк, мы считаем, что эти строки совпадают.

**Синтаксис**

```sql
wordShingleMinHashCaseInsensitive(string[, shinglesize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `shinglesize` — Размер слова шингла. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя хэшами — минимальный и максимальный. [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

**Пример**

Запрос:

```sql
SELECT wordShingleMinHashCaseInsensitive('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Tuple;
```

Результат:

```response
┌─Tuple─────────────────────────────────────┐
│ (3065874883688416519,1634050779997673240) │
└───────────────────────────────────────────┘
```
## wordShingleMinHashUTF8 {#wordshingleminhashutf8}

Разделяет строку UTF-8 на части (шинглы) размером `shinglesize` слов и вычисляет хэш-значения для каждого слова шингла. Использует `hashnum` минимальных хэшей для вычисления минимального хэша и `hashnum` максимальных хэшей для вычисления максимального хэша. Возвращает кортеж с этими хэшами. Чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance). Для двух строк: если один из возвращенных хэшей одинаков для обеих строк, мы считаем, что эти строки совпадают.

**Синтаксис**

```sql
wordShingleMinHashUTF8(string[, shinglesize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `shinglesize` — Размер слова шингла. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя хэшами — минимальный и максимальный. [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

**Пример**

Запрос:

```sql
SELECT wordShingleMinHashUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Tuple;
```

Результат:

```response
┌─Tuple──────────────────────────────────────┐
│ (16452112859864147620,5844417301642981317) │
└────────────────────────────────────────────┘
```
## wordShingleMinHashCaseInsensitiveUTF8 {#wordshingleminhashcaseinsensitiveutf8}

Разделяет строку UTF-8 на части (шинглы) размером `shinglesize` слов и вычисляет хэш-значения для каждого слова шингла. Использует `hashnum` минимальных хэшей для вычисления минимального хэша и `hashnum` максимальных хэшей для вычисления максимального хэша. Возвращает кортеж с этими хэшами. Не чувствителен к регистру.

Может использоваться для обнаружения полудубликатов строк с помощью [tupleHammingDistance](../functions/tuple-functions.md/#tuplehammingdistance). Для двух строк: если один из возвращенных хэшей одинаков для обеих строк, мы считаем, что эти строки совпадают.

**Синтаксис**

```sql
wordShingleMinHashCaseInsensitiveUTF8(string[, shinglesize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `shinglesize` — Размер слова шингла. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя хэшами — минимальный и максимальный. [Tuple](../data-types/tuple.md)([UInt64](../data-types/int-uint.md), [UInt64](../data-types/int-uint.md)).

**Пример**

Запрос:

```sql
SELECT wordShingleMinHashCaseInsensitiveUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).') AS Tuple;
```

Результат:

```response
┌─Tuple─────────────────────────────────────┐
│ (3065874883688416519,1634050779997673240) │
└───────────────────────────────────────────┘
```
## wordShingleMinHashArg {#wordshingleminhasharg}

Разделяет строку ASCII на части (шинглы) размером `shinglesize` слов и возвращает шинглы с минимальными и максимальными хэшами, рассчитанными функцией [wordshingleMinHash](#wordshingleminhash) с теми же входными данными. Чувствителен к регистру.

**Синтаксис**

```sql
wordShingleMinHashArg(string[, shinglesize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `shinglesize` — Размер слова шингла. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя кортежами, каждый из которых содержит по `hashnum` слов шинглов. [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md))).

**Пример**

Запрос:

```sql
SELECT wordShingleMinHashArg('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).', 1, 3) AS Tuple;
```

Результат:

```response
┌─Tuple─────────────────────────────────────────────────────────────────┐
│ (('OLAP','database','analytical'),('online','oriented','processing')) │
└───────────────────────────────────────────────────────────────────────┘
```
## wordShingleMinHashArgCaseInsensitive {#wordshingleminhashargcaseinsensitive}

Разделяет строку ASCII на части (шинглы) размером `shinglesize` слов и возвращает шинглы с минимальными и максимальными хэшами, рассчитанными функцией [wordShingleMinHashCaseInsensitive](#wordshingleminhashcaseinsensitive) с теми же входными данными. Не чувствителен к регистру.

**Синтаксис**

```sql
wordShingleMinHashArgCaseInsensitive(string[, shinglesize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `shinglesize` — Размер слова шингла. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя кортежами, каждый из которых содержит по `hashnum` слов шинглов. [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md))).

**Пример**

Запрос:

```sql
SELECT wordShingleMinHashArgCaseInsensitive('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).', 1, 3) AS Tuple;
```

Результат:

```response
┌─Tuple──────────────────────────────────────────────────────────────────┐
│ (('queries','database','analytical'),('oriented','processing','DBMS')) │
└────────────────────────────────────────────────────────────────────────┘
```
## wordShingleMinHashArgUTF8 {#wordshingleminhashargutf8}

Разделяет строку UTF-8 на части (шинглы) размером `shinglesize` слов и возвращает шинглы с минимальными и максимальными хэшами, рассчитанными функцией [wordShingleMinHashUTF8](#wordshingleminhashutf8) с теми же входными данными. Чувствителен к регистру.

**Синтаксис**

```sql
wordShingleMinHashArgUTF8(string[, shinglesize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `shinglesize` — Размер слова шингла. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хэшей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж с двумя кортежами, каждый из которых содержит по `hashnum` слов шинглов. [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md))).

**Пример**

Запрос:

```sql
SELECT wordShingleMinHashArgUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).', 1, 3) AS Tuple;
```

Результат:

```response
┌─Tuple─────────────────────────────────────────────────────────────────┐
│ (('OLAP','database','analytical'),('online','oriented','processing')) │
└───────────────────────────────────────────────────────────────────────┘
```
## wordShingleMinHashArgCaseInsensitiveUTF8 {#wordshingleminhashargcaseinsensitiveutf8}

Разделяет строку UTF-8 на части (шинглы) по `shinglesize` слов и возвращает шинглы с минимальными и максимальными хешами слов, рассчитанными с помощью функции [wordShingleMinHashCaseInsensitiveUTF8](#wordshingleminhashcaseinsensitiveutf8) с тем же вводом. Регистронезависимая.

**Синтаксис**

```sql
wordShingleMinHashArgCaseInsensitiveUTF8(string[, shinglesize, hashnum])
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md).
- `shinglesize` — Размер шингла слова. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `3`. [UInt8](../data-types/int-uint.md).
- `hashnum` — Количество минимальных и максимальных хешей, используемых для вычисления результата. Необязательный. Возможные значения: любое число от `1` до `25`. Значение по умолчанию: `6`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Кортеж из двух кортежей с `hashnum` шинглами слов каждый. [Tuple](../data-types/tuple.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md)), [Tuple](../data-types/tuple.md)([String](../data-types/string.md))).

**Пример**

Запрос:

```sql
SELECT wordShingleMinHashArgCaseInsensitiveUTF8('ClickHouse® is a column-oriented database management system (DBMS) for online analytical processing of queries (OLAP).', 1, 3) AS Tuple;
```

Результат:

```response
┌─Tuple──────────────────────────────────────────────────────────────────┐
│ (('queries','database','analytical'),('oriented','processing','DBMS')) │
└────────────────────────────────────────────────────────────────────────┘
```
## sqidEncode {#sqidencode}

Кодирует числа в [Sqid](https://sqids.org/), который представляет собой строку ID, подобную YouTube.
Выходной алфавит: `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`.
Не используйте эту функцию для хеширования - сгенерированные идентификаторы могут быть декодированы обратно в оригинальные числа.

**Синтаксис**

```sql
sqidEncode(number1, ...)
```

Псевдоним: `sqid`

**Аргументы**

- Произвольное количество чисел UInt8, UInt16, UInt32 или UInt64.

**Возвращаемое значение**

Строка sqid [String](../data-types/string.md).

**Пример**

```sql
SELECT sqidEncode(1, 2, 3, 4, 5);
```

```response
┌─sqidEncode(1, 2, 3, 4, 5)─┐
│ gXHfJ1C6dN                │
└───────────────────────────┘
```
## sqidDecode {#sqiddecode}

Декодирует [Sqid](https://sqids.org/) обратно в оригинальные числа.
Возвращает пустой массив, если входная строка не является действительным sqid.

**Синтаксис**

```sql
sqidDecode(sqid)
```

**Аргументы**

- Sqid - [String](../data-types/string.md)

**Возвращаемое значение**

Sqid, преобразованный в числа [Array(UInt64)](../data-types/array.md).

**Пример**

```sql
SELECT sqidDecode('gXHfJ1C6dN');
```

```response
┌─sqidDecode('gXHfJ1C6dN')─┐
│ [1,2,3,4,5]              │
└──────────────────────────┘
```
