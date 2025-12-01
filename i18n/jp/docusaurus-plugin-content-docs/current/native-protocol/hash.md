---
slug: /native-protocol/hash
sidebar_position: 5
title: 'CityHash'
description: 'ネイティブプロトコル用ハッシュ'
doc_type: 'reference'
keywords: ['CityHash', 'ネイティブプロトコル用ハッシュ', 'ハッシュ関数', 'Google CityHash', 'プロトコルハッシュ']
---



# CityHash {#cityhash}

ClickHouse は [Google 製 CityHash](https://github.com/google/cityhash) の **以前のバージョンの 1 つ**を使用しています。

:::info
CityHash は、ClickHouse に組み込んだ後でアルゴリズムが変更されました。

CityHash のドキュメントでは、ユーザーは特定のハッシュ値に依存すべきではなく、それをどこかに保存したり、シャーディングキーとして使用したりすべきではないと明記されています。

しかし、この関数をユーザーに公開したため、CityHash のバージョン（1.0.2）を固定せざるを得ませんでした。現在、SQL で利用可能な CityHash 関数の挙動は変わらないことを保証しています。

— Alexey Milovidov
:::

:::note 注意

現在の Google 製 CityHash のバージョンは、ClickHouse の `cityHash64` バリアントとは[異なります](https://github.com/ClickHouse/ClickHouse/issues/8354)。

Google 製 CityHash の値を得るために `farmHash64` を使用しないでください。[FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) は CityHash の後継ですが、完全な互換性はありません。

| String                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

また、CityHash の説明と作成の背景については [Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) も参照してください。要するに、**暗号用途を想定していない**ハッシュであり、[MurmurHash](http://en.wikipedia.org/wiki/MurmurHash) より高速ですが、より複雑です。



## 実装 {#implementations}

### Go {#go}

両方のバリアントに対応している Go パッケージ [go-faster/city](https://github.com/go-faster/city) を利用できます。
