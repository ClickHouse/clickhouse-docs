---
description: 'ClickHouse のネイティブ TCP インターフェイスに関するドキュメント'
sidebar_label: 'ネイティブインターフェイス (TCP)'
sidebar_position: 18
slug: /interfaces/tcp
title: 'ネイティブインターフェイス (TCP)'
doc_type: 'reference'
---

# ネイティブインターフェース (TCP)

ネイティブプロトコルは、[コマンドラインクライアント](../interfaces/cli.md)、分散クエリ処理中のサーバー間通信、およびその他の C++ プログラムで使用されます。残念ながら、ClickHouse のネイティブプロトコルにはまだ正式な仕様がありませんが、ClickHouse のソースコード（[このあたり](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client) から始まります）からリバースエンジニアリングすることや、TCP トラフィックを傍受して解析することで明らかにすることができます。