---
'slug': '/native-protocol/hash'
'sidebar_position': 5
'title': 'CityHash'
'description': 'Native protocol hash'
---




# CityHash

ClickHouseは **以前の** [GoogleのCityHash](https://github.com/google/cityhash) のバージョンの1つを使用しています。

:::info
CityHashはClickHouseに追加した後、アルゴリズムが変更されました。

CityHashのドキュメントでは、ユーザーは特定のハッシュ値に依存せず、それをどこにも保存したりシャーディングキーとして使用したりしないべきと明記されています。

しかし、この関数をユーザーに公開したため、CityHashのバージョンを固定する必要がありました（1.0.2に）。現在、SQLで利用可能なCityHash関数の動作が変更されないことを保証します。

— Alexey Milovidov
:::

:::note 注

Googleの現在のCityHashのバージョンは、ClickHouseの`cityHash64`バリアントとは [異なります](https://github.com/ClickHouse/ClickHouse/issues/8354)。

GoogleのCityHash値を取得するために`farmHash64`を使用しないでください！[FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html)はCityHashの後継ですが、完全には互換性がありません。

| 文字列                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

また、[Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html)を参照すると、作成の背景や説明について詳しい情報を得ることができます。TL;DR **非暗号化** ハッシュで、[MurmurHash](http://en.wikipedia.org/wiki/MurmurHash) よりも速いですが、より複雑です。

## 実装 {#implementations}

### Go {#go}

両方のバリアントを実装した [go-faster/city](https://github.com/go-faster/city) Goパッケージを使用できます。
