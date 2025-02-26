---
sidebar_label: テンプレート
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: ユーザーは Google Dataflow テンプレートを使用して ClickHouse にデータを取り込むことができます
---

# Google Dataflow テンプレート

Google Dataflow テンプレートは、カスタムコードを書く必要なく、事前構築された、即使用できるデータパイプラインを実行する便利な方法を提供します。これらのテンプレートは、一般的なデータ処理タスクを簡素化するために設計されており、ClickHouse データベースとのシームレスな統合のために `ClickHouseIO` などのコネクタを利用して [Apache Beam](https://beam.apache.org/) を使用して構築されています。これらのテンプレートを Google Dataflow で実行することにより、最小限の労力で高いスケーラビリティと分散データ処理を実現できます。




## データフローテンプレートを使用する理由は？ {#why-use-dataflow-templates}

- **使いやすさ**: テンプレートは、特定のユースケースに合わせた事前設定されたパイプラインを提供することにより、コーディングの必要を排除します。
- **スケーラビリティ**: Dataflow は、パイプラインが効率的にスケールし、大量のデータを分散処理で処理できることを保証します。
- **コスト効率**: 使用するリソースに対してのみ料金を支払い、パイプライン実行コストを最適化する機能があります。

## データフローテンプレートの実行方法 {#how-to-run-dataflow-templates}

現在、ClickHouse の公式テンプレートは Google Cloud CLI または Dataflow REST API を介して利用可能です。
詳細な手順については、[Google Dataflow テンプレートからのパイプライン実行ガイド](https://cloud.google.com/dataflow/docs/templates/provided-templates)を参照してください。


## ClickHouse テンプレートの一覧 {#list-of-clickhouse-templates}
* [BigQuery から ClickHouse へ](./templates/bigquery-to-clickhouse)
* [GCS から ClickHouse へ](https://github.com/ClickHouse/DataflowTemplates/issues/3) (近日公開！)
* [Pub Sub から ClickHouse へ](https://github.com/ClickHouse/DataflowTemplates/issues/4) (近日公開！)
