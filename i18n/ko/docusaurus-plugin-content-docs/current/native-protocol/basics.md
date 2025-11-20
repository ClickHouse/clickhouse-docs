---
'slug': '/native-protocol/basics'
'sidebar_position': 1
'title': '기본 사항'
'description': '네이티브 프로토콜 기본 사항'
'keywords':
- 'native protocol'
- 'TCP protocol'
- 'protocol basics'
- 'binary protocol'
- 'client-server communication'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 기본 사항

:::note
클라이언트 프로토콜 참조가 진행 중입니다.

대부분의 예시는 Go에만 있습니다.
:::

이 문서에서는 ClickHouse TCP 클라이언트를 위한 이진 프로토콜을 설명합니다.

## Varint {#varint}

길이, 패킷 코드 및 기타 경우에 대해 *unsigned varint* 인코딩이 사용됩니다. 
[binary.PutUvarint](https://pkg.go.dev/encoding/binary#PutUvarint) 및 [binary.ReadUvarint](https://pkg.go.dev/encoding/binary#ReadUvarint)를 사용하십시오.

:::note
*Signed* varint는 사용되지 않습니다.
:::

## 문자열 {#string}

가변 길이 문자열은 *(길이, 값)* 형태로 인코딩되며, 여기서 *길이*는 [varint](#varint)이고 *값*은 utf8 문자열입니다.

:::important
OOM을 방지하기 위해 길이를 검증하십시오:

`0 ≤ len < MAX`
:::

<Tabs>
<TabItem value="encode" label="인코딩">

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
<TabItem value="decode" label="디코딩">

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
<TabItem value="hexdump" label="16진수 덤프">

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

## 정수 {#integers}

:::tip
ClickHouse는 고정 크기 정수에 대해 **리틀 엔디안**을 사용합니다.
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
<TabItem value="hexdump" label="16진수 덤프">

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

## 불린 {#boolean}

불린은 단일 바이트로 표현되며, `1`은 `true`이고 `0`은 `false`입니다.
