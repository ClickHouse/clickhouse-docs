---
'slug': '/native-protocol/hash'
'sidebar_position': 5
'title': 'CityHash'
'description': '原生协议哈希'
'doc_type': 'reference'
---


# CityHash

ClickHouse 使用 **先前的** 版本 [CityHash from Google](https://github.com/google/cityhash)。

:::info
CityHash 在我们将其添加到 ClickHouse 后更改了算法。

CityHash 文档特别指出，用户不应该依赖特定的哈希值，并且不应该将其保存在任何地方或用作分片键。

但是，由于我们将该功能开放给用户，因此我们必须固定 CityHash 的版本（为 1.0.2）。现在，我们保证 SQL 中可用的 CityHash 函数的行为不会改变。

— Alexey Milovidov
:::

:::note 注意

谷歌的 CityHash 当前版本 [与](https://github.com/ClickHouse/ClickHouse/issues/8354) ClickHouse 的 `cityHash64` 变体不同。

不要使用 `farmHash64` 来获取谷歌的 CityHash 值！[FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) 是 CityHash 的 successor，但它们并不完全兼容。

| 字符串                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

另请参见 [Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) 获取描述和创建原因。TL;DR **非加密** 哈希比 [MurmurHash](http://en.wikipedia.org/wiki/MurmurHash) 更快，但更复杂。

## 实现 {#implementations}

### Go {#go}

您可以使用 [go-faster/city](https://github.com/go-faster/city) Go 包，该包实现了两种变体。
