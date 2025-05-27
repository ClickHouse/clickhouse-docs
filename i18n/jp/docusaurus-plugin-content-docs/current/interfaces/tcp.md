---
'description': 'Documentation for the native TCP interface in ClickHouse'
'sidebar_label': 'Native Interface (TCP)'
'sidebar_position': 18
'slug': '/interfaces/tcp'
'title': 'Native Interface (TCP)'
---




# ネイティブインターフェース (TCP)

ネイティブプロトコルは、[コマンドラインクライアント](../interfaces/cli.md)で使用され、分散クエリ処理中のサーバー間通信や他のC++プログラムでも利用されます。残念ながら、ネイティブClickHouseプロトコルにはまだ正式な仕様がありませんが、ClickHouseのソースコードからリバースエンジニアリング（[ここから](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client)始めることができます）や、TCPトラフィックを傍受して分析することによって理解することができます。
