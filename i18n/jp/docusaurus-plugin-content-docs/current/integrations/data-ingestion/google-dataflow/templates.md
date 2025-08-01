---
sidebar_label: 'テンプレート'
slug: '/integrations/google-dataflow/templates'
sidebar_position: 3
description: 'ユーザーは Google Dataflow テンプレートを使用してデータを ClickHouse に取り込むことができます。'
title: 'Google Dataflow テンプレート'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google Dataflow テンプレート

<ClickHouseSupportedBadge/>

Google Dataflow テンプレートは、カスタムコードを記述することなく、事前構築されたデータパイプラインを実行するための便利な方法を提供します。これらのテンプレートは、一般的なデータ処理タスクを簡素化するために設計されており、`ClickHouseIO` のようなコネクタを利用して ClickHouse データベースとのシームレスな統合を実現するために [Apache Beam](https://beam.apache.org/) を使用して構築されています。これらのテンプレートを Google Dataflow で実行することにより、最小限の労力で高いスケーラビリティを持つ分散データ処理を達成できます。

## なぜ Dataflow テンプレートを使用するのか？ {#why-use-dataflow-templates}

- **使いやすさ**: テンプレートは特定の使用ケースに合わせて事前構成されたパイプラインを提供することで、コーディングの必要性を排除します。
- **スケーラビリティ**: Dataflow は、パイプラインが効率的にスケールし、大量のデータを分散処理で処理できるようにします。
- **コスト効率**: 消費したリソースに対してのみ支払うことができ、パイプライン実行コストを最適化する能力があります。

## Dataflow テンプレートの実行方法 {#how-to-run-dataflow-templates}

現時点では、ClickHouse 公式テンプレートは Google Cloud CLI または Dataflow REST API 経由で利用可能です。
詳細な手順については、[Google Dataflow テンプレートからパイプラインを実行するガイド](https://cloud.google.com/dataflow/docs/templates/provided-templates)を参照してください。

## ClickHouse テンプレートの一覧 {#list-of-clickhouse-templates}
* [BigQuery To ClickHouse](./templates/bigquery-to-clickhouse)
* [GCS To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (近日公開予定!)
* [Pub Sub To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (近日公開予定!)
