---
slug: /integrations/data-ingestion-overview
keywords: [ 'Airbyte', 'Apache Spark', 'Spark', 'Azure Synapse', 'Amazon Glue', 'Apache Beam', 'dbt', 'Fivetran', 'NiFi', 'dlt', 'Vector' ]
title: 'データ取り込み'
description: 'データ取り込みセクションのランディングページ'
doc_type: 'landing-page'
---

# データ取り込み

ClickHouse は、データ統合および変換のための多数のソリューションと連携できます。
詳細については、以下のページを参照してください。

| データ取り込みツール                                              | 説明                                                                                                                                                                                                                           |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Airbyte](/integrations/airbyte)                                 | オープンソースのデータ統合プラットフォーム。ELT データパイプラインを作成でき、140 を超えるすぐに使えるコネクタが付属しています。                                                                                   |
| [Apache Spark](/integrations/apache-spark)                       | 単一ノードマシンまたはクラスター上で、データエンジニアリング、データサイエンス、機械学習を実行するためのマルチランゲージエンジンです。                                                                                                        |
| [Apache Flink](https://github.com/ClickHouse/flink-connector-clickhouse)                       | Flink の DataStream API を通じて ClickHouse へのリアルタイムなデータ取り込みおよび処理を行い、バッチ書き込みもサポートします。                                                                                                        |
| [Amazon Glue](/integrations/glue)                                | Amazon Web Services (AWS) が提供するフルマネージド型のサーバーレスデータ統合サービスであり、分析、機械学習、アプリケーション開発向けのデータの検出、準備、変換プロセスを簡素化します。     |
| [Azure Synapse](/integrations/azure-synapse)                     | Microsoft Azure が提供するフルマネージド型のクラウド分析サービスであり、SQL、Apache Spark、データパイプラインを用いて大規模なデータ統合、変換、分析を容易にする、ビッグデータとデータウェアハウスを統合したサービスです。 |
| [Azure Data Factory](/integrations/azure-data-factory)           | 大規模なデータワークフローを作成、スケジュール、およびオーケストレーションできるクラウドベースのデータ統合サービスです。 |
| [Apache Beam](/integrations/apache-beam)                         | バッチ処理とストリーム（継続的）処理の両方のデータ処理パイプラインを定義および実行できる、オープンソースの統一プログラミングモデルです。                                                                                 |
| [BladePipe](/integrations/bladepipe)                         | サブセカンドレイテンシで動作するリアルタイムなエンドツーエンドのデータ統合ツールであり、プラットフォーム間のシームレスなデータフローを実現します。                                                                                |
| [dbt](/integrations/dbt)                                         | 分析エンジニアが `SELECT` 文を書くことで、データウェアハウス内のデータを変換できるようにします。                                                                                                                                |
| [dlt](/integrations/data-ingestion/etl-tools/dlt-and-clickhouse) | Python スクリプトに追加することで、多種多様でしばしば扱いにくいデータソースから、よく構造化されたライブデータセットへデータをロードできるオープンソースライブラリです。                                                                            |
| [Fivetran](/integrations/fivetran)                               | クラウドデータプラットフォームから外部への、プラットフォーム内への、さらにプラットフォーム間でのデータ移動を自動化するデータ移動プラットフォームです。                                                                                                                                    |
| [NiFi](/integrations/nifi)                                       | ソフトウェアシステム間のデータフローを自動化するために設計された、オープンソースのワークフロー管理ソフトウェアです。                                                                                                                                  |
| [Vector](/integrations/vector)                                   | 組織が自らのオブザーバビリティデータを制御できるようにする、高性能なオブザーバビリティデータパイプラインです。                                                                                                                        |