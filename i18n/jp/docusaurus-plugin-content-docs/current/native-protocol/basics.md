---
slug: /native-protocol/basics
sidebar_position: 1
title: '基礎'
description: 'ネイティブプロトコルの基礎'
keywords: ['ネイティブプロトコル', 'TCPプロトコル', 'プロトコルの基礎', 'バイナリプロトコル', 'クライアント／サーバー通信']
doc_type: 'guide'
---

# 基本 \\{#basics\\}

:::note
クライアントプロトコルのリファレンスは現在作成中です。

ほとんどのサンプルコードは Go のみで提供されています。
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

このドキュメントでは、ClickHouse の TCP クライアント向けバイナリプロトコルについて説明します。

## Varint \\{#varint\\}

長さやパケットコードなどには、*unsigned varint* エンコード方式が使われます。
[binary.PutUvarint](https://pkg.go.dev/encoding/binary#PutUvarint) と [binary.ReadUvarint](https://pkg.go.dev/encoding/binary#ReadUvarint) を使用してください。

:::note
*signed* varint は使用されません。
:::

## String \\{#string\\}

可変長文字列は *(length, value)* という形式でエンコードされます。ここで *length* は [varint](#varint)、*value* は UTF-8 文字列です。

:::important
OOM によるメモリ枯渇を防ぐため、length を必ず検証すること:

`0 ≤ len < MAX`
:::

<Tabs>
<TabItem value="encode" label="Encode">

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
<TabItem value="decode" label="Decode">

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
<TabItem value="hexdump" label="Hex dump">

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

## 整数 \\{#integers\\}

:::tip
ClickHouse は固定サイズの整数に **リトルエンディアン (Little Endian)** を使用します。
:::

### Int32 \\{#int32\\}

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
  <TabItem value="hexdump" label="Hexダンプ">
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

## Boolean \\{#boolean\\}

Boolean 型は 1 バイトで表現され、`1` は `true`、`0` は `false` を表します。
