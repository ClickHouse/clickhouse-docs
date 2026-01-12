---
slug: /integrations/data-ingestion-overview
keywords: [ 'Airbyte', 'Apache Spark', 'Spark', 'Azure Synapse', 'Amazon Glue', 'Apache Beam', 'dbt', 'Fivetran', 'NiFi', 'dlt', 'Vector' ]
title: 'Data Ingestion'
description: 'データインジェストセクション用ランディングページ'
doc_type: 'landing-page'
---

# データインジェスト {#data-ingestion}

ClickHouse は、データ統合および変換のために数多くのソリューションと連携しています。
詳しくは、以下のページを参照してください。

| Data Ingestion Tool                                              | 説明                                                                                                                                                                                                                           |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Airbyte](/integrations/airbyte)                                 | オープンソースのデータ統合プラットフォームです。ELT データパイプラインを構築でき、140 を超える標準搭載コネクタが提供されています。                                                                                   |
| [Apache Spark](/integrations/apache-spark)                       | シングルノードマシンまたはクラスター上で、データエンジニアリング、データサイエンス、および機械学習を実行するための多言語対応エンジンです。                                                                                                        |
| [Apache Flink](https://github.com/ClickHouse/flink-connector-clickhouse)                       | Flink の DataStream API を通じて、ClickHouse へのリアルタイムなデータインジェストおよび処理を行うためのソリューションで、バッチ書き込みにも対応しています。                                                                                                        |
| [Amazon Glue](/integrations/glue)                                | Amazon Web Services (AWS) が提供するフルマネージドのサーバーレス型データ統合サービスであり、分析、機械学習、アプリケーション開発向けに、データの検出、準備、変換プロセスを簡素化します。     |
| [Azure Synapse](/integrations/azure-synapse)                     | Microsoft Azure が提供するフルマネージドのクラウド型分析サービスであり、ビッグデータとデータウェアハウジングを統合し、SQL、Apache Spark、データパイプラインを用いて、大規模なデータ統合・変換・分析を簡素化します。 |
| [Azure Data Factory](/integrations/azure-data-factory)           | クラウドベースのデータ統合サービスであり、大規模なデータワークフローを作成、スケジュール、およびオーケストレーションすることができます。 |
| [Apache Beam](/integrations/apache-beam)                         | バッチおよびストリーム（継続的）データ処理パイプラインの定義と実行を可能にする、オープンソースの統一プログラミングモデルです。                                                                                 |
| [BladePipe](/integrations/bladepipe)                         | サブセカンドレイテンシでリアルタイムなエンドツーエンドのデータ統合を実現し、プラットフォーム間のシームレスなデータフローを可能にするツールです。                                                                                |
| [dbt](/integrations/dbt)                                         | アナリティクスエンジニアが、単に SELECT 文を書くことで、データウェアハウス内のデータを変換できるようにします。                                                                                                                                |
| [dlt](/integrations/data-ingestion/etl-tools/dlt-and-clickhouse) | Python スクリプトに追加して使用できるオープンソースライブラリであり、多様でしばしば扱いにくいデータソースから、適切に構造化された最新のデータセットへデータをロードできます。                                                                            |
| [Estuary](/integrations/estuary)                                 | ミリ秒レイテンシの ETL パイプラインを実現し、柔軟なデプロイオプションを提供する right-time データプラットフォームです。                                    |
| [Fivetran](/integrations/fivetran)                               | クラウドデータプラットフォームから外部へ、内部へ、またプラットフォーム間でのデータ移動を自動化するデータムーブメントプラットフォームです。                                                                                                                                    |
| [NiFi](/integrations/nifi)                                       | ソフトウェアシステム間のデータフローを自動化するために設計された、オープンソースのワークフロー管理ソフトウェアです。                                                                                                                                  |
| [Vector](/integrations/vector)                                   | 組織が自らのオブザーバビリティデータを制御できるようにする、高性能なオブザーバビリティデータパイプラインです。                                                                                                                        |