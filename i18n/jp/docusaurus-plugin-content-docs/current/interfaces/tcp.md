---
'description': 'ClickHouseのネイティブTCPインターフェースに関するDocumentation'
'sidebar_label': 'ネイティブインターフェース (TCP)'
'sidebar_position': 18
'slug': '/interfaces/tcp'
'title': 'ネイティブインターフェース (TCP)'
'doc_type': 'reference'
---


# ネイティブインターフェース (TCP)

ネイティブプロトコルは、[コマンドラインクライアント](../interfaces/cli.md)で使用され、分散クエリ処理中のサーバー間通信や他のC++プログラムでも使用されます。残念ながら、ネイティブのClickHouseプロトコルにはまだ正式な仕様がありませんが、ClickHouseのソースコード（[こちらから始まる](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client)）を逆コンパイルするか、TCPトラフィックを傍受して分析することで逆エンジニアリングすることができます。
