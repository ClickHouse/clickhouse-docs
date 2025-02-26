---
slug: /native-protocol/hash
sidebar_position: 5
---

# CityHash

ClickHouseは**以前の**バージョンの[CityHash from Google](https://github.com/google/cityhash)を使用しています。

:::info
CityHashは、ClickHouseに追加した後にアルゴリズムを変更しました。

CityHashのドキュメントには、ユーザーが特定のハッシュ値に依存せず、どこにも保存せず、シャーディングキーとして使用しないべきであると明記されています。

しかし、私たちはこの関数をユーザーに公開したため、CityHashのバージョンを固定する必要がありました（1.0.2）。現在、SQLで利用可能なCityHash関数の動作は変わらないことを保証します。

— Alexey Milovidov
:::

:::note 注

GoogleのCityHashの現在のバージョンは、ClickHouseの`cityHash64`バリアントとは[異なります](https://github.com/ClickHouse/ClickHouse/issues/8354)。

GoogleのCityHash値を取得するために`farmHash64`を使用しないでください！[FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html)はCityHashの後継ですが、完全に互換性があるわけではありません。

| 文字列                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `モスクワ`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `C++なしで大きなシステムを書くことはできるの？  -ポール・グリック` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

また、[Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html)も参照してください。これは作成の説明と理由について説明しています。要点としては、**非暗号化**のハッシュで、[MurmurHash](http://en.wikipedia.org/wiki/MurmurHash)よりも高速ですが、より複雑です。

## 実装 {#implementations}

### Go {#go}

両方のバリアントを実装している[go-faster/city](https://github.com/go-faster/city) Goパッケージを使用することができます。
