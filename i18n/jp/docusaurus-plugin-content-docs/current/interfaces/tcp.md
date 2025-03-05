---
slug: /interfaces/tcp
sidebar_position: 18
sidebar_label: ネイティブインターフェース (TCP)
---


# ネイティブインターフェース (TCP)

ネイティブプロトコルは、[コマンドラインクライアント](../interfaces/cli.md)で使用され、分散クエリ処理中のサーバー間通信や他のC++プログラムでも使用されます。残念ながら、ネイティブなClickHouseプロトコルには正式な仕様がまだありませんが、ClickHouseのソースコードから逆引きすることができます（[ここから始まります](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client)）またはTCPトラフィックを傍受して分析することによっても可能です。
