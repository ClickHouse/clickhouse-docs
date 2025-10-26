---
'sidebar_label': 'テンプレート'
'slug': '/integrations/google-dataflow/templates'
'sidebar_position': 3
'description': 'ユーザーは Google Dataflow テンプレートを使用して ClickHouse にデータを取り込むことができます'
'title': 'Google Dataflow テンプレート'
'doc_type': 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google Dataflow テンプレート

<ClickHouseSupportedBadge/>

Google Dataflow テンプレートは、カスタムコードを書くことなく、事前構築されたデータパイプラインを簡単に実行する方法を提供します。これらのテンプレートは、一般的なデータ処理タスクを簡素化するように設計されており、`ClickHouseIO` のようなコネクタを利用して ClickHouse データベースとのシームレスな統合を実現するために [Apache Beam](https://beam.apache.org/) を使用して構築されています。これらのテンプレートを Google Dataflow で実行することにより、最小限の労力で非常にスケーラブルで分散データ処理を実現できます。

## Dataflow テンプレートを使用する理由 {#why-use-dataflow-templates}

- **使いやすさ**: テンプレートは、特定のユースケースに合わせた事前構成のパイプラインを提供することで、コーディングの必要性を排除します。
- **スケーラビリティ**: Dataflow は、お客様のパイプラインが効率的にスケールし、大量のデータを分散処理できるようにします。
- **コスト効率**: 消費したリソースに対してのみ支払い、パイプラインの実行コストを最適化する能力があります。

## Dataflow テンプレートの実行方法 {#how-to-run-dataflow-templates}

現在、ClickHouse の公式テンプレートは Google Cloud Console、CLI、または Dataflow REST API を通じて利用可能です。詳細な手順については、[Google Dataflow テンプレートからパイプラインを実行するガイド](https://cloud.google.com/dataflow/docs/templates/provided-templates) を参照してください。

## ClickHouse テンプレートの一覧 {#list-of-clickhouse-templates}
* [BigQuery To ClickHouse](./templates/bigquery-to-clickhouse)
* [GCS To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (近日公開予定!)
* [Pub Sub To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (近日公開予定!)
