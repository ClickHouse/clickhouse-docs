---
sidebar_label: 'テンプレート'
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: 'ユーザーは Google Dataflow テンプレートを使用して ClickHouse にデータを取り込めます'
title: 'Google Dataflow テンプレート'
doc_type: 'guide'
keywords: ['google dataflow', 'gcp', 'data pipeline', 'templates', 'batch processing']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google Dataflow テンプレート

<ClickHouseSupportedBadge/>

Google Dataflow テンプレートは、カスタムコードを記述することなく、あらかじめ用意されたすぐに使えるデータパイプラインを実行するための便利な手段です。これらのテンプレートは、一般的なデータ処理タスクを簡素化するように設計されており、[Apache Beam](https://beam.apache.org/) を用いて構築されています。また、`ClickHouseIO` のようなコネクタを活用し、ClickHouse データベースとシームレスに統合できます。これらのテンプレートを Google Dataflow 上で実行することで、最小限の労力で高スケーラビリティな分散データ処理を実現できます。



## Dataflowテンプレートを使用する理由 {#why-use-dataflow-templates}

- **使いやすさ**: テンプレートは特定のユースケースに合わせて事前設定されたパイプラインを提供するため、コーディングが不要です。
- **スケーラビリティ**: Dataflowは分散処理により大量のデータを処理し、パイプラインを効率的にスケールさせます。
- **コスト効率**: 使用したリソース分のみの支払いで、パイプライン実行コストの最適化が可能です。


## Dataflowテンプレートの実行方法 {#how-to-run-dataflow-templates}

現在、ClickHouse公式テンプレートは、Google Cloud Console、CLI、またはDataflow REST APIを通じて利用できます。
詳細な手順については、[Google Dataflow テンプレートからパイプラインを実行するガイド](https://cloud.google.com/dataflow/docs/templates/provided-templates)を参照してください。


## ClickHouseテンプレート一覧 {#list-of-clickhouse-templates}

- [BigQueryからClickHouse](./templates/bigquery-to-clickhouse)
- [GCSからClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (近日公開予定)
- [Pub SubからClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (近日公開予定)
