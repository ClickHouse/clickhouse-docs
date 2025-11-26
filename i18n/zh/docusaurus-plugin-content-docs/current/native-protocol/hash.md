---
slug: /native-protocol/hash
sidebar_position: 5
title: 'CityHash'
description: '原生协议散列'
doc_type: 'reference'
keywords: ['CityHash', '原生协议散列', '哈希函数', 'Google CityHash', '协议散列']
---



# CityHash

ClickHouse 使用的是 [Google 的 CityHash](https://github.com/google/cityhash) 的**一个较早版本**。

:::info
在我们将 CityHash 引入 ClickHouse 之后，CityHash 更改了算法。

CityHash 的文档明确指出，用户不应依赖具体的哈希值，也不应将其保存到任何地方或用作分片键。

但由于我们将此函数暴露给用户使用，因此必须将 CityHash 的版本固定为 1.0.2。现在我们保证，SQL 中可用的 CityHash 函数的行为将不会改变。

— Alexey Milovidov
:::

:::note 注意

当前 Google 的 CityHash 版本与 ClickHouse 的 `cityHash64` 变体[不同](https://github.com/ClickHouse/ClickHouse/issues/8354)。

不要使用 `farmHash64` 来获取 Google CityHash 的值！[FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) 是 CityHash 的后继者，但它们并不完全兼容。

| 字符串                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

另请参阅 [Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html)，了解其设计说明和创建动机。简而言之：这是一种**非加密**哈希，比 [MurmurHash](http://en.wikipedia.org/wiki/MurmurHash) 更快，但实现更复杂。



## 实现 {#implementations}

### Go {#go}

可以使用 [go-faster/city](https://github.com/go-faster/city) 这个 Go 包，该包实现了这两种变体。
