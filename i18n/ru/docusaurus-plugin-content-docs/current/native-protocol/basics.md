---
slug: /native-protocol/basics
sidebar_position: 1
---


# Основы

:::note
Справка по клиентскому протоколу в процессе разработки.

Большинство примеров только на Go.
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Этот документ описывает бинарный протокол для TCP-клиентов ClickHouse.

## Varint {#varint}

Для длины, кодов пакетов и других случаев используется кодирование *беззнакового varint*.
Используйте [binary.PutUvarint](https://pkg.go.dev/encoding/binary#PutUvarint) и [binary.ReadUvarint](https://pkg.go.dev/encoding/binary#ReadUvarint).

:::note
*Знаковый* varint не используется.
:::

## Строка {#string}

Строки переменной длины кодируются как *(длина, значение)*, где *длина* - это [varint](#varint), а *значение* - это строка в кодировке utf8.

:::important
Проверьте длину, чтобы избежать OOM:

`0 ≤ len < MAX`
:::

<Tabs>
<TabItem value="encode" label="Кодировать">

```go
s := "Привет, мир!"

// Запись длины строки как uvarint.
buf := make([]byte, binary.MaxVarintLen64)
n := binary.PutUvarint(buf, uint64(len(s)))
buf = buf[:n]

// Запись значения строки.
buf = append(buf, s...)
```

</TabItem>
<TabItem value="decode" label="Декодировать">

```go
r := bytes.NewReader([]byte{
    0xd, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c,
    0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
})

// Чтение длины.
n, err := binary.ReadUvarint(r)
if err != nil {
	panic(err)
}

// Проверьте n, чтобы избежать OOM или исключения во время выполнения в make().
const maxSize = 1024 * 1024 * 10 // 10 МБ
if n > maxSize || n < 0 {
    panic("недопустимое значение n")
}

buf := make([]byte, n)
if _, err := io.ReadFull(r, buf); err != nil {
	panic(err)
}

fmt.Println(string(buf))
// Привет, мир!
```

</TabItem>
</Tabs>

<Tabs>
<TabItem value="hexdump" label="Шестнадцатеричный дамп">

```hexdump
00000000  0d 48 65 6c 6c 6f 2c 20  77 6f 72 6c 64 21        |.Hello, world!|
```

</TabItem>
<TabItem value="base64" label="Base64">

```text
DUhlbGxvLCB3b3JsZCE
```

</TabItem>
<TabItem value="go" label="Go">

```go
data := []byte{
    0xd, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c,
    0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
}
```

</TabItem>
</Tabs>

## Целые числа {#integers}

:::tip
ClickHouse использует **младший порядок байтов (Little Endian)** для целых чисел фиксированного размера.
:::

### Int32 {#int32}
```go
v := int32(1000)

// Кодирование.
buf := make([]byte, 8)
binary.LittleEndian.PutUint32(buf, uint32(v))

// Декодирование.
d := int32(binary.LittleEndian.Uint32(buf))
fmt.Println(d) // 1000
```

<Tabs>
<TabItem value="hexdump" label="Шестнадцатеричный дамп">

```hexdump
00000000  e8 03 00 00 00 00 00 00                           |........|
```

</TabItem>
<TabItem value="base64" label="Base64">

```text
6AMAAAAAAAA
```

</TabItem>
</Tabs>

## Булевы значения {#boolean}

Булевы значения представлены одним байтом, `1` - это `true`, а `0` - это `false`.
