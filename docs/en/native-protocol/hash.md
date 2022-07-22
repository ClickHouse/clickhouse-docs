---
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

:::danger Note

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

#### Benchmarks

```
goos: linux
goarch: amd64
pkg: github.com/go-faster/city
cpu: AMD Ryzen 9 5950X 16-Core Processor
BenchmarkClickHouse128/16     2213.98 MB/s
BenchmarkClickHouse128/64     4712.24 MB/s
BenchmarkClickHouse128/256    7561.58 MB/s
BenchmarkClickHouse128/1024  10158.98 MB/s
BenchmarkClickHouse64        10379.89 MB/s
BenchmarkCityHash32           3140.54 MB/s
BenchmarkCityHash64           9508.45 MB/s
BenchmarkCityHash128          9304.27 MB/s
BenchmarkCityHash64Small      2700.84 MB/s
BenchmarkCityHash128Small     1175.65 MB/s
```


## Examples

Let's take 64-bit hash from `Moscow` string.

```sql
:) SELECT cityHash64('Moscow')
12507901496292878638
```

```go
s := []byte("Moscow")
fmt.Print("ClickHouse: ")
fmt.Println(city.CH64(s))
fmt.Print("CityHash:   ")
fmt.Println(city.Hash64(s))
// Output:
// ClickHouse: 12507901496292878638
// CityHash:   5992710078453357409
```

You can use [test data corpus](https://github.com/go-faster/city/blob/main/_testdata/data.json) to check your implementation of ClickHouse CityHash variant if needed.

```json
{
  "Seed": {
    "Low": 5577006791947779410,
    "High": 8674665223082153551
  },
  "entries": [
    {
      "Input": "Moscow",
      "City32": 431367057,
      "City64": 5992710078453357409,
      "City128": {
        "Low": 10019773792274861915,
        "High": 12276543986707912152
      },
      "City128Seed": {
        "Low": 13396466470330251720,
        "High": 5508504338941663328
      },
      "ClickHouse64": 12507901496292878638,
      "ClickHouse128": {
        "Low": 3377444358654451565,
        "High": 2499202049363713365
      },
      "ClickHouse128Seed": {
        "Low": 568168482305327346,
        "High": 1719721512326527886
      }
    }
  ]
}
```
