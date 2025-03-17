---
slug: /native-protocol/hash
sidebar_position: 5
---


# CityHash

ClickHouse使用的是 **以前的** 版本的 [CityHash from Google](https://github.com/google/cityhash)。

:::info
CityHash 在我们将其添加到 ClickHouse 之后改变了算法。

CityHash 文档特别说明用户不应依赖特定的哈希值，也不应将其保存或用作分片键。

但是，由于我们向用户暴露了此功能，我们必须锁定 CityHash 的版本（为 1.0.2）。现在我们保证 SQL 中可用的 CityHash 函数的行为不会改变。

— Alexey Milovidov
:::

:::note 注意

谷歌当前版本的 CityHash [与](https://github.com/ClickHouse/ClickHouse/issues/8354) ClickHouse 的 `cityHash64` 变种不同。

不要使用 `farmHash64` 来获取谷歌的 CityHash 值！[FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) 是 CityHash 的后继，但它们并不完全兼容。

| 字符串                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `如何在没有 C++ 的情况下写出一个大系统？  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

另请参见 [Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) 以获取描述和创建背后的理由。TL;DR **非加密** 哈希，比 [MurmurHash](http://en.wikipedia.org/wiki/MurmurHash) 更快，但更复杂。

## 实现 {#implementations}

### Go {#go}

您可以使用 [go-faster/city](https://github.com/go-faster/city) Go 包，它实现了两种变体。
