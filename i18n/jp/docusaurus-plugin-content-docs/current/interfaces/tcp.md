---
description: 'ClickHouse のネイティブ TCP インターフェイスに関するドキュメント'
sidebar_label: 'ネイティブインターフェイス (TCP)'
sidebar_position: 18
slug: /interfaces/tcp
title: 'ネイティブインターフェイス (TCP)'
doc_type: 'reference'
---

# ネイティブインターフェイス (TCP)

ネイティブプロトコルは、[コマンドラインクライアント](../interfaces/cli.md)、分散クエリ処理におけるサーバー間通信、その他の C++ プログラムで利用されます。残念ながら、ClickHouse のネイティブプロトコルにはまだ正式な仕様がありませんが、ClickHouse のソースコード（[このあたり](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client)からたどることができます）や TCP トラフィックを傍受・解析することで、リバースエンジニアリングすることが可能です。