---
slug: /native-protocol/basics
sidebar_position: 1
title: 'Основы'
description: 'Основы нативного протокола'
keywords: ['нативный протокол', 'TCP-протокол', 'основы протокола', 'двоичный протокол', 'взаимодействие клиент-сервер']
doc_type: 'guide'
---



# Основы

:::note
Справочник по клиентскому протоколу пока в разработке.

Большинство примеров приведены только на Go.
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Данный документ описывает двоичный протокол для TCP‑клиентов ClickHouse.


## Varint {#varint}

Для длин, кодов пакетов и в других случаях используется кодирование _unsigned varint_.
Используйте [binary.PutUvarint](https://pkg.go.dev/encoding/binary#PutUvarint) и [binary.ReadUvarint](https://pkg.go.dev/encoding/binary#ReadUvarint).

:::note
_Signed_ varint не используется.
:::


## Строка {#string}

Строки переменной длины кодируются как _(length, value)_, где _length_ — это [varint](#varint), а _value_ — строка в кодировке UTF-8.

:::important
Проверяйте длину для предотвращения исчерпания памяти (OOM):

`0 ≤ len < MAX`
:::

<Tabs>
<TabItem value="encode" label="Кодирование">

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
<TabItem value="decode" label="Декодирование">

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
    panic("invalid n")
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
ClickHouse использует порядок байтов **Little Endian** для целых чисел фиксированного размера.
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


## Boolean {#boolean}

Логические значения представлены одним байтом: `1` соответствует `true`, а `0` — `false`.
