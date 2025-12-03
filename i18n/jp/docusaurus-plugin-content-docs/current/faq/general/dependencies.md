---
title: 'ClickHouse を実行するためのサードパーティの依存関係は何ですか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/dependencies
description: 'ClickHouse は自己完結しており、実行時の依存関係はありません'
doc_type: 'reference'
keywords: ['dependencies', '3rd-party']
---

# ClickHouse を実行する際に必要なサードパーティ製の依存関係はありますか？ {#what-are-the-3rd-party-dependencies-for-running-clickhouse}

ClickHouse には実行時の依存関係は一切ありません。完全に自己完結した単一バイナリアプリケーションとして配布されており、このアプリケーションだけでクラスタのすべての機能を提供します。クエリの処理に加え、クラスタ内のワーカーノードとして、RAFT コンセンサスアルゴリズムを提供する調整システムとして、さらにはクライアントやローカルクエリエンジンとして動作します。

このようなユニークなアーキテクチャ上の選択により、専用のフロントエンド、バックエンド、集約ノードを持つことが多い他のシステムと一線を画しています。その結果、デプロイ、クラスタ管理、および監視が容易になります。

:::info
かつて ClickHouse は、分散クラスタの調整に ZooKeeper を必要としていました。現在は不要であり、ZooKeeper の利用はサポートしているものの、もはや推奨されません。
:::