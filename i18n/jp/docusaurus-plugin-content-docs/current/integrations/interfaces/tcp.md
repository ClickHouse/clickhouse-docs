---
description: 'ClickHouse のネイティブ TCP インターフェイスのドキュメント'
sidebar_label: 'ネイティブインターフェイス (TCP)'
sidebar_position: 18
slug: /interfaces/tcp
title: 'ネイティブインターフェイス (TCP)'
doc_type: 'reference'
---

# ネイティブインターフェイス (TCP) {#native-interface-tcp}

ネイティブプロトコルは、[コマンドラインクライアント](/interfaces/cli)、分散クエリ処理時のサーバー間通信、そして他の C++ プログラムで使用されます。残念ながら、ClickHouse のネイティブプロトコルにはまだ正式な仕様がありませんが、ClickHouse のソースコード（[このあたり](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client) からたどることができます）からリバースエンジニアリングするか、TCP トラフィックを傍受・解析することで仕様を把握できます。