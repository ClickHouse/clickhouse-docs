---
slug: /native-protocol/basics
sidebar_position: 1
title: '基础知识'
description: 'Native 协议基础知识'
keywords: ['native protocol', 'TCP protocol', 'protocol basics', 'binary protocol', 'client-server communication']
doc_type: 'guide'
---



# 基础

:::note
客户端协议参考文档仍在编写中。

目前大部分示例仅提供 Go 版本。
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

本文档介绍 ClickHouse TCP 客户端的二进制协议。


## 变长整数（Varint） {#varint}

对于长度、数据包代码等场景，使用 _无符号变长整数（unsigned varint）_ 编码。
使用 [binary.PutUvarint](https://pkg.go.dev/encoding/binary#PutUvarint) 和 [binary.ReadUvarint](https://pkg.go.dev/encoding/binary#ReadUvarint)。

:::note
不使用 _有符号_ 变长整数。
:::


## 字符串 {#string}

可变长度字符串编码为 _(length, value)_ 格式,其中 _length_ 为 [varint](#varint),_value_ 为 UTF-8 字符串。

:::important
验证长度以防止内存溢出(OOM):

`0 ≤ len < MAX`
:::

<Tabs>
<TabItem value="encode" label="编码">

```go
s := "Hello, world!"

// 将字符串长度写入为 uvarint。
buf := make([]byte, binary.MaxVarintLen64)
n := binary.PutUvarint(buf, uint64(len(s)))
buf = buf[:n]

// 写入字符串值。
buf = append(buf, s...)
```

</TabItem>
<TabItem value="decode" label="解码">

```go
r := bytes.NewReader([]byte{
    0xd, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c,
    0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
})

// 读取长度。
n, err := binary.ReadUvarint(r)
if err != nil {
        panic(err)
}

// 检查 n 以防止 OOM 或 make() 中的运行时异常。
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
<TabItem value="hexdump" label="十六进制转储">

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


## 整数 {#integers}

:::tip
ClickHouse 对固定大小的整数使用**小端序（Little Endian）**。
:::

### Int32 {#int32}

```go
v := int32(1000)

// 编码
buf := make([]byte, 8)
binary.LittleEndian.PutUint32(buf, uint32(v))

// 解码
d := int32(binary.LittleEndian.Uint32(buf))
fmt.Println(d) // 1000
```

<Tabs>
<TabItem value="hexdump" label="十六进制转储">

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

布尔值用单字节表示，`1` 表示 `true`，`0` 表示 `false`。
