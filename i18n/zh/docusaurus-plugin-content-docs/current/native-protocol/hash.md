---
'slug': '/native-protocol/hash'
'sidebar_position': 5
'title': 'CityHash'
'description': '本地协议哈希'
---


# CityHash

ClickHouse 使用 **之前的一个** 版本的 [CityHash from Google](https://github.com/google/cityhash)。

:::info
CityHash 在我们将其添加到 ClickHouse 之后更改了算法。

CityHash 文档特别指出，用户不应依赖特定的哈希值，不应将其保存或用作分片键。

但是由于我们将此功能暴露给用户，我们不得不修复 CityHash 的版本（为 1.0.2）。现在我们保证在 SQL 中可用的 CityHash 函数的行为不会更改。

— Alexey Milovidov
:::

:::note 注意

谷歌的 CityHash 当前版本与 ClickHouse 的 `cityHash64` 变体 [不同](https://github.com/ClickHouse/ClickHouse/issues/8354)。

不要使用 `farmHash64` 来获取谷歌的 CityHash 值！ [FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) 是 CityHash 的继任者，但它们并不完全兼容。

| 字符串                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

另见 [Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) 了解创建的描述和原因。简而言之，这是一个 **非加密** 哈希，比 [MurmurHash](http://en.wikipedia.org/wiki/MurmurHash) 更快，但更复杂。

## 实现 {#implementations}

### Go {#go}

您可以使用 [go-faster/city](https://github.com/go-faster/city) Go 包，它实现了两种变体。
