---
slug: /interfaces/tcp
sidebar_position: 18
sidebar_label: ネイティブインターフェース (TCP)
---

# ネイティブインターフェース (TCP)

ネイティブプロトコルは、[コマンドラインクライアント](../interfaces/cli.md)で使用され、分散クエリ処理中のインターサーバー通信や他のC++プログラムでも利用されます。残念ながら、ネイティブなClickHouseプロトコルにはまだ正式な仕様がありませんが、ClickHouseのソースコードからリバースエンジニアリングすることができます（[ここから](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client)始まります）や、TCPトラフィックをインターセプトして分析することでも取得可能です。
