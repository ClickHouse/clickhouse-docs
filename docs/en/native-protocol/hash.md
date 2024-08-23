---
slug: /en/native-protocol/hash
sidebar_position: 5
---

# CityHash

ClickHouse uses **one of previous** versions of [CityHash from Google](https://github.com/google/cityhash).

:::info
CityHash has changed the algorithm after we have added it into ClickHouse.

CityHash documentation specifically notes that the user should not rely to specific hash values and should not save it anywhere or use it as sharding key.

But as we exposed this function to the user, we had to fix the version of CityHash (to 1.0.2). And now we guarantee that the behaviour of CityHash functions available in SQL will not change.

— Alexey Milovidov
:::

:::note Note

Current version of Google's CityHash [differs](https://github.com/ClickHouse/ClickHouse/issues/8354) from ClickHouse `cityHash64` variant.

Don't use `farmHash64` to get Google's CityHash value! [FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) is a successor to CityHash, but they are not fully compatible.

| String                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

Also see [Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) for description and
reasoning behind creation. TL;DR **non-cryptographic** hash that is faster than [MurmurHash](http://en.wikipedia.org/wiki/MurmurHash), but more complex.

## Implementations

### Go

You can use [go-faster/city](https://github.com/go-faster/city) Go package that implements both variants.
