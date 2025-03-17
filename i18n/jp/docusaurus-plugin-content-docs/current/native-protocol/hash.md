---
slug: /native-protocol/hash
sidebar_position: 5
---


# CityHash

ClickHouseは **以前の** バージョンの [CityHash from Google](https://github.com/google/cityhash) を使用しています。

:::info
CityHashは、私たちがClickHouseに追加した後にアルゴリズムが変更されました。

CityHashのドキュメントでは、ユーザーは特定のハッシュ値に依存すべきではなく、どこにも保存したりシャーディングキーとして使用したりするべきではないと明記しています。

しかし、この関数をユーザーに公開したため、CityHashのバージョンを固定する必要がありました（1.0.2に）。現在、SQLで利用可能なCityHash関数の動作が変わらないことを保証します。

— Alexey Milovidov
:::

:::note Note

GoogleのCityHashの現在のバージョンは [ClickHouseの`cityHash64`バリアントと異なります](https://github.com/ClickHouse/ClickHouse/issues/8354)。

GoogleのCityHash値を取得するために `farmHash64` を使用しないでください！ [FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) はCityHashの後継ですが、完全には互換性がありません。

| 文字列                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `C++なしで大規模なシステムを書くことはどうできますか？  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

また、[Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) を参照して、その説明や作成の理由を確認してください。TL;DR **非暗号化** ハッシュで、[MurmurHash](http://en.wikipedia.org/wiki/MurmurHash) よりも高速ですが、より複雑です。

## 実装 {#implementations}

### Go {#go}

両方のバリアントを実装している [go-faster/city](https://github.com/go-faster/city) Goパッケージを使用できます。
