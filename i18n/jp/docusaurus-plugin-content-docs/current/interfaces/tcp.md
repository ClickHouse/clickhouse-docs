---
description: 'ClickHouseのネイティブTCPインターフェースに関するドキュメント'
sidebar_label: 'ネイティブインターフェース (TCP)'
sidebar_position: 18
slug: /interfaces/tcp
title: 'ネイティブインターフェース (TCP)'
---


# ネイティブインターフェース (TCP)

ネイティブプロトコルは、[コマンドラインクライアント](../interfaces/cli.md)で使用され、分散クエリ処理中のサーバー間通信や他のC++プログラムでも使用されます。残念ながら、ネイティブClickHouseプロトコルにはまだ正式な仕様はなく、ClickHouseのソースコード（[ここから](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client)）をリバースエンジニアリングするか、TCPトラフィックを傍受して分析することで推測することができます。
