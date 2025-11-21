---
sidebar_label: 'テンプレート'
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: 'ユーザーは、Google Dataflow テンプレートを使用して ClickHouse にデータを取り込めます'
title: 'Google Dataflow テンプレート'
doc_type: 'guide'
keywords: ['google dataflow', 'gcp', 'data pipeline', 'templates', 'batch processing']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google Dataflow テンプレート

<ClickHouseSupportedBadge/>

Google Dataflow テンプレートは、カスタムコードを記述することなく、あらかじめ用意された即時利用可能なデータパイプラインを実行するための便利な手段を提供します。これらのテンプレートは、一般的なデータ処理タスクを簡素化するよう設計されており、[Apache Beam](https://beam.apache.org/) を用いて構築され、`ClickHouseIO` のようなコネクタを活用することで ClickHouse データベースとのシームレスな統合を実現します。これらを Google Dataflow 上で実行することで、最小限の労力で高いスケーラビリティを持つ分散データ処理を実現できます。



## Dataflowテンプレートを使用する理由 {#why-use-dataflow-templates}

- **使いやすさ**: テンプレートは、特定のユースケースに合わせて事前設定されたパイプラインを提供することで、コーディングの必要性を排除します。
- **スケーラビリティ**: Dataflowは、分散処理により大量のデータを処理し、パイプラインが効率的にスケールすることを保証します。
- **コスト効率**: 消費したリソース分のみの支払いで、パイプライン実行コストを最適化できます。


## Dataflowテンプレートの実行方法 {#how-to-run-dataflow-templates}

現在、ClickHouse公式テンプレートは、Google Cloud Console、CLI、またはDataflow REST APIを通じて利用できます。
詳細な手順については、[Google Dataflow テンプレートからパイプラインを実行するガイド](https://cloud.google.com/dataflow/docs/templates/provided-templates)を参照してください。


## ClickHouseテンプレート一覧 {#list-of-clickhouse-templates}

- [BigQueryからClickHouseへ](./templates/bigquery-to-clickhouse)
- [GCSからClickHouseへ](https://github.com/ClickHouse/DataflowTemplates/issues/3) (近日公開予定!)
- [Pub SubからClickHouseへ](https://github.com/ClickHouse/DataflowTemplates/issues/4) (近日公開予定!)
