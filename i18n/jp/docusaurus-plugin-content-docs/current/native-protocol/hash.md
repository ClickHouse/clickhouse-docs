---
slug: /native-protocol/hash
sidebar_position: 5
title: 'CityHash'
description: 'ネイティブプロトコルハッシュ'
doc_type: 'reference'
keywords: ['CityHash', 'ネイティブプロトコルハッシュ', 'ハッシュ関数', 'Google CityHash', 'プロトコルハッシュ']
---



# CityHash

ClickHouse は [Google 製の CityHash](https://github.com/google/cityhash) の **以前のバージョンの一つ** を使用しています。

:::info
CityHash は、ClickHouse に組み込んだ後にアルゴリズムが変更されました。

CityHash のドキュメントには、特定のハッシュ値に依存したり、それをどこかに保存したり、シャーディングキーとして使用したりすべきではない、と明記されています。

しかし、この関数をユーザーに公開してしまったため、ClickHouse では CityHash のバージョンを 1.0.2 に固定する必要がありました。現在、SQL で利用可能な CityHash 関数の動作が変わらないことを保証しています。

— Alexey Milovidov
:::

:::note 注意

現在の Google の CityHash のバージョンは、ClickHouse の `cityHash64` バリアントとは[異なります](https://github.com/ClickHouse/ClickHouse/issues/8354)。

Google の CityHash の値を得るために `farmHash64` を使用しないでください。[FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) は CityHash の後継ですが、完全な互換性はありません。

| String                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

また、CityHash の説明および作成の背景については [Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) も参照してください。要するに、[MurmurHash](http://en.wikipedia.org/wiki/MurmurHash) よりも高速だが、より複雑な **非暗号学的** ハッシュです。



## 実装 {#implementations}

### Go {#go}

両方のバリアントを実装している [go-faster/city](https://github.com/go-faster/city) Go パッケージを使用できます。
