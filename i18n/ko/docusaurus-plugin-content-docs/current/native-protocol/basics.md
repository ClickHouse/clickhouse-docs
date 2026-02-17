---
slug: /native-protocol/basics
sidebar_position: 1
title: '기본 사항'
description: '네이티브 프로토콜 기본 사항'
keywords: ['네이티브 프로토콜', 'TCP 프로토콜', '프로토콜 기본 개념', '바이너리 프로토콜', '클라이언트-서버 통신']
doc_type: 'guide'
---

# 기본 사항 \{#basics\}

:::note
클라이언트 프로토콜 참조 문서는 준비 중입니다.

예제는 대부분 Go로만 제공됩니다.
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

이 문서는 ClickHouse TCP 클라이언트에서 사용하는 이진 프로토콜을 설명합니다.


## Varint \{#varint\}

길이, 패킷 코드 등에는 *unsigned varint* 인코딩을 사용합니다.
[binary.PutUvarint](https://pkg.go.dev/encoding/binary#PutUvarint) 및 [binary.ReadUvarint](https://pkg.go.dev/encoding/binary#ReadUvarint)를 사용합니다.

:::note
*Signed* varint는 사용하지 않습니다.
:::

## String \{#string\}

가변 길이 문자열은 *(length, value)* 형태로 인코딩되며, 여기서 *length*는 [varint](#varint)이고 *value*는 UTF-8 문자열입니다.

:::important
OOM(Out Of Memory)을 방지하기 위해 length를 검증해야 합니다:

`0 ≤ len < MAX`
:::

<Tabs>
<TabItem value="encode" label="인코딩">

```go
s := "Hello, world!"

// 문자열 길이를 uvarint로 기록합니다.
buf := make([]byte, binary.MaxVarintLen64)
n := binary.PutUvarint(buf, uint64(len(s)))
buf = buf[:n]

// 문자열 값을 기록합니다.
buf = append(buf, s...)
```

</TabItem>
<TabItem value="decode" label="디코딩">

```go
r := bytes.NewReader([]byte{
    0xd, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c,
    0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
})

// 길이를 읽습니다.
n, err := binary.ReadUvarint(r)
if err != nil {
        panic(err)
}

// OOM 또는 make()에서의 런타임 예외를 방지하기 위해 n을 검사합니다.
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

## 정수 \{#integers\}

:::tip
ClickHouse는 고정 크기 정수 타입에 **리틀 엔디언(Little Endian)**을 사용합니다.
:::

### Int32 \{#int32\}

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
  <TabItem value="hexdump" label="헥사 덤프">
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


## Boolean \{#boolean\}

Boolean 값은 1바이트로 표현되며, `1`은 `true`, `0`은 `false`를 나타냅니다.