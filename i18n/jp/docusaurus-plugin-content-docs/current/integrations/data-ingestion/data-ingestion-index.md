---
slug: /integrations/data-ingestion-overview
keywords: [ 'Airbyte', 'Apache Spark', 'Spark', 'Azure Synapse', 'Amazon Glue', 'Apache Beam', 'dbt', 'Fivetran', 'NiFi', 'dlt', 'Vector' ]
title: 'データ取り込み'
description: 'データ取り込みセクションのランディングページ'
doc_type: 'landing-page'
---

# データ取り込み

ClickHouse は、データ統合および変換のための多数のソリューションと連携します。
詳細については、以下のページを参照してください:

| データ取り込みツール                                             | 説明                                                                                                                                                                                                                                  |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Airbyte](/integrations/airbyte)                                 | オープンソースのデータ統合プラットフォーム。ELT データパイプラインを構築でき、140 を超えるあらかじめ用意されたコネクタが提供されています。                                                                                           |
| [Apache Spark](/integrations/apache-spark)                       | 単一ノードマシンやクラスター上で、データエンジニアリング、データサイエンス、および機械学習を実行するためのマルチ言語エンジンです。                                                                                                  |
| [Apache Flink](https://github.com/ClickHouse/flink-connector-clickhouse)                       | Flink の DataStream API を通じてバッチ書き込みをサポートしつつ、ClickHouse へのリアルタイムなデータ取り込みと処理を実現します。                                                                                                      |
| [Amazon Glue](/integrations/glue)                                | Amazon Web Services (AWS) が提供するフルマネージドかつサーバーレスのデータ統合サービスであり、分析、機械学習、アプリケーション開発のためのデータの検出、準備、変換プロセスを簡素化します。                                              |
| [Azure Synapse](/integrations/azure-synapse)                     | Microsoft Azure が提供するフルマネージドのクラウド型分析サービスであり、ビッグデータとデータウェアハウジングを統合し、SQL、Apache Spark、データパイプラインを用いて、大規模なデータ統合、変換、分析を容易にします。              |
| [Azure Data Factory](/integrations/azure-data-factory)           | スケールアウト可能なデータワークフローを作成、スケジュール、およびオーケストレーションできるクラウドベースのデータ統合サービスです。                                                                 |
| [Apache Beam](/integrations/apache-beam)                         | バッチおよびストリーム（連続）データ処理パイプラインの定義と実行を可能にする、オープンソースの統一プログラミングモデルです。                                                                                                         |
| [BladePipe](/integrations/bladepipe)                         | サブセカンドレイテンシでリアルタイムなエンドツーエンドのデータ統合を実現し、プラットフォーム間のシームレスなデータフローを実現するツールです。                                                                                         |
| [dbt](/integrations/dbt)                                         | アナリティクスエンジニアが `SELECT` ステートメントを書くことで、ウェアハウス内のデータを変換できるようにします。                                                                                                                      |
| [dlt](/integrations/data-ingestion/etl-tools/dlt-and-clickhouse) | さまざまな（しばしば雑多な）データソースからデータを読み込み、よく構造化されたライブデータセットとしてロードするために、Python スクリプトに組み込めるオープンソースライブラリです。                                                   |
| [Fivetran](/integrations/fivetran)                               | クラウドデータプラットフォームから外部への、クラウドデータプラットフォームへの、そしてクラウドデータプラットフォーム間でのデータ移動を自動化するデータムーブメントプラットフォームです。                                               |
| [NiFi](/integrations/nifi)                                       | ソフトウェアシステム間のデータフローを自動化するために設計された、オープンソースのワークフロー管理ソフトウェアです。                                                                                                                 |
| [Vector](/integrations/vector)                                   | 組織が自社のオブザーバビリティデータを制御できるようにする、高性能なオブザーバビリティデータパイプラインです。                                                                                                                        |