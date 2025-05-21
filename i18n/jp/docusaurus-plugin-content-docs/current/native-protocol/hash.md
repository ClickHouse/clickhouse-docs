---
slug: /native-protocol/hash
sidebar_position: 5
title: 'CityHash'
description: 'ネイティブプロトコルハッシュ'
---


# CityHash

ClickHouseは、**以前の** [GoogleのCityHash](https://github.com/google/cityhash)のバージョンの1つを使用しています。

:::info
CityHashは、ClickHouseに追加した後にアルゴリズムが変更されました。

CityHashのドキュメントでは、ユーザーは特定のハッシュ値に依存しないべきであり、それをどこにも保存したり、シャーディングキーとして使用したりしないべきであると具体的に述べています。

しかし、この関数をユーザーに公開したため、私たちはCityHashのバージョンを固定する必要がありました（1.0.2に）。現在、SQLで利用可能なCityHash関数の動作が変更されないことを保証します。

— Alexey Milovidov
:::

:::note 注

現在のGoogleのCityHashは、ClickHouseの `cityHash64` バリアントとは [異なります](https://github.com/ClickHouse/ClickHouse/issues/8354)。

GoogleのCityHash値を取得するために `farmHash64` を使用しないでください！[FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) はCityHashの後継ですが、完全には互換性がありません。

| 文字列                                                      | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

また、[Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html)も参照してください。CityHashの作成に至った理由と説明が記載されています。要約すると、**暗号化されていない**ハッシュで、[MurmurHash](http://en.wikipedia.org/wiki/MurmurHash)よりも高速ですが、より複雑です。

## 実装 {#implementations}

### Go {#go}

両方のバリアントを実装した [go-faster/city](https://github.com/go-faster/city) Goパッケージを使用できます。
