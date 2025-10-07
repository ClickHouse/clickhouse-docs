---
'slug': '/native-protocol/basics'
'sidebar_position': 1
'title': 'Основы'
'description': 'Основы нативного протокола'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Основы

:::note
Справка по клиентскому протоколу в процессе разработки.

Большинство примеров только на Go.
:::

Этот документ описывает бинарный протокол для TCP-клиентов ClickHouse.

## Varint {#varint}

Для длин, кодов пакетов и других случаев используется *беззнаковая varint* кодировка.
Используйте [binary.PutUvarint](https://pkg.go.dev/encoding/binary#PutUvarint) и [binary.ReadUvarint](https://pkg.go.dev/encoding/binary#ReadUvarint).

:::note
*Знаковая* varint не используется.
:::

## Строка {#string}

Строки переменной длины кодируются как *(длина, значение)*, где *длина* — это [varint](#varint), а *значение* — это строка в кодировке utf8.

:::important
Проверьте длину, чтобы предотвратить OOM:

`0 ≤ len < MAX`
:::

<Tabs>
<TabItem value="encode" label="Кодировать">

```go
s := "Hello, world!"

// Writing string length as uvarint.
buf := make([]byte, binary.MaxVarintLen64)
n := binary.PutUvarint(buf, uint64(len(s)))
buf = buf[:n]

// Writing string value.
buf = append(buf, s...)
```

</TabItem>
<TabItem value="decode" label="Декодировать">

```go
r := bytes.NewReader([]byte{
    0xd, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c,
    0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
})

// Read length.
n, err := binary.ReadUvarint(r)
if err != nil {
        panic(err)
}

// Check n to prevent OOM or runtime exception in make().
const maxSize = 1024 * 1024 * 10 // 10 MB
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

## Целые числа {#integers}

:::tip
ClickHouse использует **Младший порядок** для целых чисел фиксированного размера.
:::

### Int32 {#int32}
```go
v := int32(1000)

// Encode.
buf := make([]byte, 8)
binary.LittleEndian.PutUint32(buf, uint32(v))

// Decode.
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

## Логическое значение {#boolean}

Логические значения представлены одним байтом, `1` — это `true`, а `0` — это `false`.
