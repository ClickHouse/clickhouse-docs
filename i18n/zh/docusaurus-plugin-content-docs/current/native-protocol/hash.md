---
slug: /native-protocol/hash
sidebar_position: 5
title: 'CityHash'
description: '原生协议哈希'
doc_type: 'reference'
keywords: ['CityHash', 'native protocol hash', 'hash function', 'Google CityHash', 'protocol hashing']
---



# CityHash

ClickHouse 使用的是 Google [CityHash](https://github.com/google/cityhash) 的**较早版本之一**。

:::info
在我们将 CityHash 引入 ClickHouse 之后，CityHash 修改了其算法。

CityHash 文档中特别说明，用户不应依赖具体的哈希值，也不应将其持久化保存或用作分片键。

但由于我们向用户公开了这个函数，我们必须将 CityHash 的版本固定为 1.0.2。现在我们保证，在 SQL 中可用的 CityHash 函数的行为不会发生变化。

— Alexey Milovidov
:::

:::note Note

当前 Google 的 CityHash 版本与 ClickHouse 的 `cityHash64` 变体[有所不同](https://github.com/ClickHouse/ClickHouse/issues/8354)。

不要使用 `farmHash64` 来获取 Google CityHash 的值！[FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) 是 CityHash 的后继者，但二者并不完全兼容。

| String                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

另请参阅 [Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html)，了解其设计说明及创建原因。简而言之，这是一个比 [MurmurHash](http://en.wikipedia.org/wiki/MurmurHash) 更快但也更复杂的**非加密**哈希算法。



## 实现 {#implementations}

### Go {#go}

您可以使用 [go-faster/city](https://github.com/go-faster/city) Go 包，它实现了这两种变体。
