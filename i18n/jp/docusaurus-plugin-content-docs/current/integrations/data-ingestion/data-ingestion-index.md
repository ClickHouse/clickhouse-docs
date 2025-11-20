---
slug: /integrations/data-ingestion-overview
keywords: [ 'Airbyte', 'Apache Spark', 'Spark', 'Azure Synapse', 'Amazon Glue', 'Apache Beam', 'dbt', 'Fivetran', 'NiFi', 'dlt', 'Vector' ]
title: 'データ取り込み'
description: 'データ取り込みセクション用のランディングページ'
doc_type: 'landing-page'
---

# データ取り込み

ClickHouse は、データ統合および変換のための多数のソリューションと連携できます。
詳細については、以下のページを参照してください。

| データ取り込みツール                                              | 説明                                                                                                                                                                                                                           |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Airbyte](/integrations/airbyte)                                 | オープンソースのデータ統合プラットフォーム。ELT データパイプラインを作成でき、140 以上のすぐに使えるコネクタが用意されています。                                                                                   |
| [Apache Spark](/integrations/apache-spark)                       | 単一ノードマシンまたはクラスター上で、データエンジニアリング、データサイエンス、および機械学習を実行するためのマルチランゲージエンジン。                                                                                                        |
| [Apache Flink](https://github.com/ClickHouse/flink-connector-clickhouse)                       | Flink の DataStream API を通じて、バッチ書き込みに対応しつつ ClickHouse へのリアルタイムなデータ取り込みと処理を行うためのコネクタ。                                                                                                        |
| [Amazon Glue](/integrations/glue)                                | Amazon Web Services (AWS) が提供するフルマネージドのサーバーレスデータ統合サービスで、分析、機械学習、アプリケーション開発向けのデータの検出、準備、変換プロセスを簡素化します。     |
| [Azure Synapse](/integrations/azure-synapse)                     | Microsoft Azure が提供するフルマネージドのクラウドベース分析サービスで、ビッグデータとデータウェアハウスを統合し、SQL、Apache Spark、およびデータパイプラインを用いた大規模なデータ統合、変換、分析を簡素化します。 |
| [Azure Data Factory](/integrations/azure-data-factory)           | 大規模なデータワークフローの作成、スケジューリング、およびオーケストレーションを可能にするクラウドベースのデータ統合サービス。 |
| [Apache Beam](/integrations/apache-beam)                         | バッチおよびストリーム (連続) データ処理パイプラインの定義と実行を可能にする、オープンソースの統一プログラミングモデル。                                                                                 |
| [BladePipe](/integrations/bladepipe)                         | サブセカンドレイテンシを実現するリアルタイムのエンドツーエンドデータ統合ツールで、プラットフォーム間のシームレスなデータフローを実現します。                                                                                |
| [dbt](/integrations/dbt)                                         | Analytics エンジニアが単に SELECT 文を書くことで、データウェアハウス内のデータを変換できるようにします。                                                                                                                                |
| [dlt](/integrations/data-ingestion/etl-tools/dlt-and-clickhouse) | さまざまな、しばしば非構造的なデータソースからデータを取得し、適切に構造化されたライブデータセットへとロードするために Python スクリプトへ追加できるオープンソースライブラリ。                                                                            |
| [Fivetran](/integrations/fivetran)                               | クラウドデータプラットフォームから外部へ、内部へ、そしてプラットフォーム間でデータを自動的に移動させるデータムーブメントプラットフォーム。                                                                                                                                    |
| [NiFi](/integrations/nifi)                                       | ソフトウェアシステム間のデータフローを自動化するために設計されたオープンソースのワークフロー管理ソフトウェア。                                                                                                                                  |
| [Vector](/integrations/vector)                                   | 組織が自社のオブザーバビリティデータを制御できるようにする、高性能なオブザーバビリティデータパイプライン。                                                                                                                        |