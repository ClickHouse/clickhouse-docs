---
sidebar_label: テンプレート
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: ユーザーはGoogle Dataflowテンプレートを使用してClickHouseにデータを取り込むことができます
---


# Google Dataflowテンプレート

Google Dataflowテンプレートは、カスタムコードを書くことなく、事前構築された使用可能なデータパイプラインを実行する便利な方法を提供します。これらのテンプレートは、一般的なデータ処理タスクを簡素化するために設計されており、`ClickHouseIO`などのコネクタを活用してClickHouseデータベースとのシームレスな統合を実現するために[Apache Beam](https://beam.apache.org/)を使用しています。これらのテンプレートをGoogle Dataflowで実行することにより、最小限の手間で高いスケーラビリティを持つ分散データ処理を達成できます。

## なぜDataflowテンプレートを使用するのか？ {#why-use-dataflow-templates}

- **使いやすさ**: テンプレートは、特定のユースケースに合わせた事前構成されたパイプラインを提供することで、コーディングの必要性を排除します。
- **スケーラビリティ**: Dataflowはパイプラインの効率的なスケーリングを保証し、大量のデータを分散処理で処理します。
- **コスト効率**: 使用したリソースに対してのみ支払いが発生し、パイプライン実行コストを最適化することができます。

## Dataflowテンプレートの実行方法 {#how-to-run-dataflow-templates}

現在、ClickHouse公式テンプレートはGoogle Cloud CLIまたはDataflow REST APIを介して利用可能です。詳細なステップバイステップの手順については、[Google Dataflowテンプレートからパイプラインを実行するガイド](https://cloud.google.com/dataflow/docs/templates/provided-templates)を参照してください。

## ClickHouseテンプレートの一覧 {#list-of-clickhouse-templates}
* [BigQuery To ClickHouse](./templates/bigquery-to-clickhouse)
* [GCS To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (まもなく登場!)
* [Pub Sub To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (まもなく登場!)
