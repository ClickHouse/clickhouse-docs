---
slug: /native-protocol/basics
sidebar_position: 1
title: '基本'
description: 'ネイティブプロトコルの基本'
keywords: ['native protocol', 'TCP protocol', 'protocol basics', 'binary protocol', 'client-server communication']
doc_type: 'guide'
---



# 基本事項

:::note
クライアントプロトコルのリファレンスは作成中です。

サンプルのほとんどは Go のみで提供されています。
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

このドキュメントでは、ClickHouse の TCP クライアント向けのバイナリプロトコルについて説明します。


## Varint {#varint}

長さ、パケットコード、その他のケースでは、_unsigned varint_ エンコーディングが使用されます。
[binary.PutUvarint](https://pkg.go.dev/encoding/binary#PutUvarint) および [binary.ReadUvarint](https://pkg.go.dev/encoding/binary#ReadUvarint) を使用してください。

:::note
_Signed_ varint は使用されません。
:::


## 文字列 {#string}

可変長文字列は _(length, value)_ としてエンコードされます。ここで _length_ は [varint](#varint)、_value_ は UTF-8 文字列です。

:::important
OOM を防ぐために長さを検証してください:

`0 ≤ len < MAX`
:::

<Tabs>
<TabItem value="encode" label="エンコード">

```go
s := "Hello, world!"

// 文字列の長さを uvarint として書き込む
buf := make([]byte, binary.MaxVarintLen64)
n := binary.PutUvarint(buf, uint64(len(s)))
buf = buf[:n]

// 文字列の値を書き込む
buf = append(buf, s...)
```

</TabItem>
<TabItem value="decode" label="デコード">

```go
r := bytes.NewReader([]byte{
    0xd, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c,
    0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
})

// 長さを読み取る
n, err := binary.ReadUvarint(r)
if err != nil {
        panic(err)
}

// make() での OOM または実行時例外を防ぐために n をチェックする
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
<TabItem value="hexdump" label="16進ダンプ">

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


## 整数型 {#integers}

:::tip
ClickHouseは固定サイズの整数型に**リトルエンディアン**を使用します。
:::

### Int32 {#int32}

```go
v := int32(1000)

// エンコード
buf := make([]byte, 8)
binary.LittleEndian.PutUint32(buf, uint32(v))

// デコード
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


## Boolean（ブール型） {#boolean}

ブール値は1バイトで表現され、`1`が`true`、`0`が`false`です。
