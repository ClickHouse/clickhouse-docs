---
slug: /native-protocol/basics
sidebar_position: 1
title: 'Основы'
description: 'Основы нативного протокола'
---


# Основы

:::note
Справочник по клиентскому протоколу в процессе написания.

Большинство примеров только на Go.
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Этот документ описывает бинарный протокол для TCP-клиентов ClickHouse.

## Varint {#varint}

Для длин, кодов пакетов и других случаев используется *беззнаковое varint* кодирование.
Используйте [binary.PutUvarint](https://pkg.go.dev/encoding/binary#PutUvarint) и [binary.ReadUvarint](https://pkg.go.dev/encoding/binary#ReadUvarint).

:::note
*Знаковое* varint не используется.
:::

## String {#string}

Строки переменной длины кодируются как *(длина, значение)*, где *длина* — это [varint](#varint), а *значение* — это строка в utf8.

:::important
Проверяйте длину, чтобы предотвратить OOM:

`0 ≤ len < MAX`
:::

<Tabs>
<TabItem value="encode" label="Кодировать">

```go
s := "Hello, world!"

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

// Проверка n для предотвращения OOM или исключения времени выполнения в make().
const maxSize = 1024 * 1024 * 10 // 10 МБ
if n > maxSize || n < 0 {
    panic("недействительное n")
}

buf := make([]byte, n)
if _, err := io.ReadFull(r, buf); err != nil {
        panic(err)
}

fmt.Println(string(buf))
// Hello, world!
```

</TabItem>
</Tabs>

<Tabs>
<TabItem value="hexdump" label="Hex дамп">

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

## Integers {#integers}

:::tip
ClickHouse использует **Little Endian** для целых чисел фиксированного размера.
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
<TabItem value="hexdump" label="Hex дамп">

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

## Boolean {#boolean}

Булевы значения представлены одним байтом, `1` — это `true`, а `0` — это `false`.
