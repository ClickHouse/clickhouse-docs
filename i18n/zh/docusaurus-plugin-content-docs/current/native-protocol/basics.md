---
slug: /native-protocol/basics
sidebar_position: 1
---


# 基础

:::note
客户端协议参考正在进行中。

大多数示例仅在 Go 中提供。
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

本文档描述了 ClickHouse TCP 客户端的二进制协议。

## Varint {#varint}

对于长度、数据包代码和其他情况，使用 *无符号 varint* 编码。使用 [binary.PutUvarint](https://pkg.go.dev/encoding/binary#PutUvarint) 和 [binary.ReadUvarint](https://pkg.go.dev/encoding/binary#ReadUvarint)。

:::note
*有符号* varint 不被使用。
:::

## 字符串 {#string}

可变长度字符串编码为 *(长度, 值)*，其中 *长度* 是 [varint](#varint)，*值* 是 utf8 字符串。

:::important
验证长度以防止 OOM：

`0 ≤ len < MAX`
:::

<Tabs>
<TabItem value="encode" label="编码">

```go
s := "Hello, world!"

// 以 uvarint 写入字符串长度。
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

// 检查 n 以防止 OOM 或在 make() 中的运行时异常。
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
ClickHouse 使用 **小端字节序** 处理固定大小的整数。
:::

### Int32 {#int32}
```go
v := int32(1000)

// 编码。
buf := make([]byte, 8)
binary.LittleEndian.PutUint32(buf, uint32(v))

// 解码。
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

## 布尔值 {#boolean}

布尔值由单个字节表示，`1` 为 `true`，`0` 为 `false`。
