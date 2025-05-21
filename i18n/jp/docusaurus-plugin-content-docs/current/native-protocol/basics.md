---
slug: /native-protocol/basics
sidebar_position: 1
title: '基本'
description: 'ネイティブプロトコルの基本'
---


# 基本

:::note
クライアントプロトコルリファレンスは進行中です。

ほとんどの例はGoのみです。
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

この文書は、ClickHouse TCP クライアントのバイナリプロトコルについて説明します。

## Varint {#varint}

長さ、パケットコード、およびその他のケースには *unsigned varint* エンコーディングが使用されます。
[ binary.PutUvarint](https://pkg.go.dev/encoding/binary#PutUvarint) と [binary.ReadUvarint](https://pkg.go.dev/encoding/binary#ReadUvarint) を使用します。

:::note
*Signed* varint は使用されません。
:::

## 文字列 {#string}

可変長文字列は *(長さ, 値)* としてエンコードされます。ここで *長さ* は [varint](#varint) で、*値* はUTF-8文字列です。

:::important
OOMを防ぐために長さを検証してください：

`0 ≤ len < MAX`
:::

<Tabs>
<TabItem value="encode" label="エンコード">

```go
s := "こんにちは、世界！"

// 文字列の長さをuvarintとして書き込みます。
buf := make([]byte, binary.MaxVarintLen64)
n := binary.PutUvarint(buf, uint64(len(s)))
buf = buf[:n]

// 文字列の値を書き込みます。
buf = append(buf, s...)
```

</TabItem>
<TabItem value="decode" label="デコード">

```go
r := bytes.NewReader([]byte{
    0xd, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c,
    0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
})

// 長さを読み取ります。
n, err := binary.ReadUvarint(r)
if err != nil {
        panic(err)
}

// OOMまたはmake()でのランタイム例外を防ぐためにnを確認します。
const maxSize = 1024 * 1024 * 10 // 10 MB
if n > maxSize || n < 0 {
    panic("無効なn")
}

buf := make([]byte, n)
if _, err := io.ReadFull(r, buf); err != nil {
        panic(err)
}

fmt.Println(string(buf))
// こんにちは、世界！
```

</TabItem>
</Tabs>

<Tabs>
<TabItem value="hexdump" label="16進ダンプ">

```hexdump
00000000  0d 48 65 6c 6c 6f 2c 20  77 6f 72 6c 64 21        |.こんにちは、世界！|
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

## 整数 {#integers}

:::tip
ClickHouseは **リトルエンディアン** を使用して固定サイズの整数を処理します。
:::

### Int32 {#int32}
```go
v := int32(1000)

// エンコード。
buf := make([]byte, 8)
binary.LittleEndian.PutUint32(buf, uint32(v))

// デコード。
d := int32(binary.LittleEndian.Uint32(buf))
fmt.Println(d) // 1000
```

<Tabs>
<TabItem value="hexdump" label="16進ダンプ">

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

## ブール値 {#boolean}

ブール値は1バイトで表され、`1`は`true`で、`0`は`false`です。
