---
slug: /native-protocol/hash
sidebar_position: 5
title: 'CityHash'
description: 'ネイティブプロトコル用ハッシュ'
doc_type: 'reference'
keywords: ['CityHash', 'native protocol hash', 'hash function', 'Google CityHash', 'protocol hashing']
---



# CityHash

ClickHouse は [Google の CityHash](https://github.com/google/cityhash) の **過去のバージョンの 1 つ** を使用しています。

:::info
CityHash は、ClickHouse に組み込んだ後にアルゴリズムが変更されました。

CityHash のドキュメントでは、特定のハッシュ値に依存したり、それをどこかに保存したり、シャーディングキーとして使用したりすべきではないと明記されています。

しかし、ClickHouse ではこの関数をユーザー向けに公開しているため、CityHash のバージョン（1.0.2）を固定する必要がありました。そのため、現在 SQL で利用可能な CityHash 関数の動作は今後も変わらないことを保証しています。

— Alexey Milovidov
:::

:::note Note

現在の Google の CityHash のバージョンは、ClickHouse の `cityHash64` 変種とは[異なります](https://github.com/ClickHouse/ClickHouse/issues/8354)。

Google の CityHash の値を取得するために `farmHash64` を使用しないでください。[FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) は CityHash の後継ですが、完全な互換性はありません。

| String                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

また、CityHash の概要とその設計上の背景については [Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) も参照してください。要約すると、これは **非暗号学的** ハッシュであり、[MurmurHash](http://en.wikipedia.org/wiki/MurmurHash) より高速ですが、より複雑です。



## 実装 {#implementations}

### Go {#go}

両方のバリアントを実装している [go-faster/city](https://github.com/go-faster/city) Go パッケージを使用できます。
