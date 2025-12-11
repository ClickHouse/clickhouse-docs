---
sidebar_label: 'テンプレート'
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: 'Google Dataflow テンプレートを使用して ClickHouse にデータを取り込めます'
title: 'Google Dataflow テンプレート'
doc_type: 'guide'
keywords: ['google dataflow', 'gcp', 'データパイプライン', 'テンプレート', 'バッチ処理']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Google Dataflow テンプレート {#google-dataflow-templates}

<ClickHouseSupportedBadge/>

Google Dataflow テンプレートは、カスタムコードを記述することなく、事前構築済みのすぐに利用できるデータパイプラインを実行するための便利な手段を提供します。これらのテンプレートは、一般的なデータ処理タスクを簡素化するよう設計されており、`ClickHouseIO` などのコネクタを活用して ClickHouse データベースとシームレスに統合できる [Apache Beam](https://beam.apache.org/) を用いて構築されています。Google Dataflow 上でこれらのテンプレートを実行することで、最小限の労力で高いスケーラビリティを備えた分散データ処理を実現できます。

## なぜ Dataflow テンプレートを使用するのか {#why-use-dataflow-templates}

- **使いやすさ**: テンプレートを使えば、特定のユースケース向けに事前構成されたパイプラインを利用でき、コードを書く必要がありません。
- **スケーラビリティ**: Dataflow により、大量データを扱う分散処理でもパイプラインを効率的にスケールできます。
- **コスト効率**: 使用したリソース分だけ支払い、パイプラインの実行コストを最適化できます。

## Dataflow テンプレートの実行方法 {#how-to-run-dataflow-templates}

現時点では、ClickHouse の公式テンプレートは Google Cloud コンソール、CLI、または Dataflow REST API を通じて利用できます。
詳しい手順については、[Google Dataflow Run Pipeline From a Template Guide](https://cloud.google.com/dataflow/docs/templates/provided-templates) を参照してください。

## ClickHouse テンプレート一覧 {#list-of-clickhouse-templates}
* [BigQuery To ClickHouse](./templates/bigquery-to-clickhouse)
* [GCS To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3)（近日公開予定！）
* [Pub Sub To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4)（近日公開予定！）
