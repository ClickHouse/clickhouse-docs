---
slug: /native-protocol/basics
sidebar_position: 1
title: 'Основы'
description: 'Основы нативного протокола'
keywords: ['нативный протокол', 'протокол TCP', 'основы протокола', 'двоичный протокол', 'клиент-серверное взаимодействие']
doc_type: 'guide'
---

# Основы {#basics}

:::note
Справочник по клиентскому протоколу находится в разработке.

Большинство примеров приведено только на Go.
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Этот документ описывает бинарный протокол для TCP‑клиентов ClickHouse.

## Varint {#varint}

Для длин, кодов пакетов и в других случаях используется кодирование в формате *unsigned varint*.
Используйте [binary.PutUvarint](https://pkg.go.dev/encoding/binary#PutUvarint) и [binary.ReadUvarint](https://pkg.go.dev/encoding/binary#ReadUvarint).

:::note
*Signed* varint не используется.
:::

## Строка {#string}

Строки переменной длины кодируются как *(длина, значение)*, где *длина* — это [varint](#varint), а *значение* — строка в кодировке UTF-8.

:::important
Проверяйте длину, чтобы избежать OOM:

`0 ≤ len < MAX`
:::

<Tabs>
<TabItem value="encode" label="Кодирование">

```go
s := "Hello, world!"

// Записываем длину строки как uvarint.
buf := make([]byte, binary.MaxVarintLen64)
n := binary.PutUvarint(buf, uint64(len(s)))
buf = buf[:n]

// Записываем значение строки.
buf = append(buf, s...)
```

</TabItem>
<TabItem value="decode" label="Декодирование">

```go
r := bytes.NewReader([]byte{
    0xd, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c,
    0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
})

// Читаем длину.
n, err := binary.ReadUvarint(r)
if err != nil {
        panic(err)
}

// Проверяем n, чтобы предотвратить OOM или исключение времени выполнения в make().
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
ClickHouse использует **Little Endian** для целых чисел фиксированной длины.
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
  <TabItem value="hexdump" label="Hex-дамп">
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

Булевы значения представлены одним байтом: значение `1` соответствует `true`, а `0` — `false`.
