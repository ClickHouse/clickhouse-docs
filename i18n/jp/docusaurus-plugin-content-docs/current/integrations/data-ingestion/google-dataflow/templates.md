---
sidebar_label: 'テンプレート'
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: 'ユーザーは Google Dataflow テンプレートを使用して ClickHouse にデータを取り込むことができます'
title: 'Google Dataflow テンプレート'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google Dataflow テンプレート

<ClickHouseSupportedBadge/>

Google Dataflow テンプレートは、カスタムコードを書くことなく、事前に構築されたデータパイプラインを実行する便利な方法を提供します。これらのテンプレートは、一般的なデータ処理タスクを簡素化するように設計されており、`ClickHouseIO` などのコネクタを利用して ClickHouse データベースとのシームレスな統合を実現しています。これらのテンプレートを Google Dataflow で実行することにより、最小限の努力で非常にスケーラブルな分散データ処理を達成できます。

## Dataflow テンプレートを使用する理由 {#why-use-dataflow-templates}

- **使いやすさ**: テンプレートは特定のユースケースに合わせた事前構成されたパイプラインを提供することで、コーディングの必要性を排除します。
- **スケーラビリティ**: Dataflow はパイプラインが効率的にスケールし、大規模なデータを分散処理で処理できるようにします。
- **コスト効率**: 使用したリソースに対してのみ支払うことができ、パイプラインの実行コストを最適化する能力があります。

## Dataflow テンプレートの実行方法 {#how-to-run-dataflow-templates}

現在、ClickHouse の公式テンプレートは Google Cloud CLI または Dataflow REST API を通じて利用可能です。
詳細なステップバイステップの指示については、[Google Dataflow テンプレートからパイプラインを実行するガイド](https://cloud.google.com/dataflow/docs/templates/provided-templates)を参照してください。

## ClickHouse テンプレートの一覧 {#list-of-clickhouse-templates}
* [BigQuery から ClickHouse へ](./templates/bigquery-to-clickhouse)
* [GCS から ClickHouse へ](https://github.com/ClickHouse/DataflowTemplates/issues/3) (近日公開予定！)
* [Pub Sub から ClickHouse へ](https://github.com/ClickHouse/DataflowTemplates/issues/4) (近日公開予定！)
