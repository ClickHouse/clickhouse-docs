---
'slug': '/native-protocol/hash'
'sidebar_position': 5
'title': 'CityHash'
'description': 'Native protocol hash'
---




# CityHash

ClickHouse 使用 **之前的** 版本的 [Google CityHash](https://github.com/google/cityhash)。

:::info
在我们将 CityHash 添加到 ClickHouse 后，CityHash 改变了算法。

CityHash 文档特别注意用户不应依赖于特定的哈希值，并且不应将其保存在任何地方或用作分片键。

但由于我们向用户暴露了此功能，我们必须固定 CityHash 的版本（为 1.0.2）。现在我们保证，SQL 中可用的 CityHash 函数的行为不会改变。

— Alexey Milovidov
:::

:::note 注意

当前版本的 Google CityHash [与](https://github.com/ClickHouse/ClickHouse/issues/8354) ClickHouse 的 `cityHash64` 变体不同。

不要使用 `farmHash64` 来获取 Google 的 CityHash 值！ [FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) 是 CityHash 的后继者，但它们并不完全兼容。

| 字符串                                                      | ClickHouse64         | CityHash64          | FarmHash64           |
|-----------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                  | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

另请参见 [Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) 以了解创建背后的描述和理由。TL;DR **非加密** 哈希，速度比 [MurmurHash](http://en.wikipedia.org/wiki/MurmurHash) 更快，但更复杂。

## 实现 {#implementations}

### Go {#go}

您可以使用 [go-faster/city](https://github.com/go-faster/city) Go 包，它实现了两种变体。
