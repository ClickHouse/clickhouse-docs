---
sidebar_label: 'Google Dataflow と ClickHouse の統合'
slug: /integrations/google-dataflow/dataflow
sidebar_position: 1
description: 'ユーザーは Google Dataflow を使用して ClickHouse にデータを取り込むことができます'
title: 'Google Dataflow と ClickHouse の統合'
doc_type: 'guide'
keywords: ['Google Dataflow ClickHouse', 'Dataflow ClickHouse integration', 'Apache Beam ClickHouse', 'ClickHouseIO connector', 'Google Cloud ClickHouse integration']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Google Dataflow と ClickHouse の統合 {#integrating-google-dataflow-with-clickhouse}

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) は、フルマネージドなストリーミングおよびバッチのデータ処理サービスです。Java または Python で記述されたパイプラインをサポートしており、Apache Beam SDK 上に構築されています。

Google Dataflow を ClickHouse と組み合わせて利用する主な方法は 2 つあり、どちらも [`ClickHouseIO Apache Beam connector`](/integrations/apache-beam) を利用します。
それらは次のとおりです:
- [Java runner](#1-java-runner)
- [Predefined templates](#2-predefined-templates)

## Java runner {#1-java-runner}
[Java runner](./java-runner) を使用すると、Apache Beam SDK の `ClickHouseIO` 統合を用いて、カスタム Dataflow パイプラインを実装できます。このアプローチではパイプラインロジックを柔軟かつ詳細に制御できるため、ETL プロセスを特定の要件に合わせて最適化できます。
ただし、このオプションを利用するには、Java プログラミングの知識と Apache Beam フレームワークへの習熟が必要です。

### Key features {#key-features}
- 高度なカスタマイズ性。
- 複雑または高度なユースケースに最適。
- コーディングおよび Beam API の理解が必要。

## 事前定義済みテンプレート {#2-predefined-templates}
ClickHouse は、BigQuery から ClickHouse へのデータインポートなど、特定のユースケース向けに設計された[事前定義済みテンプレート](./templates)を提供しています。これらのテンプレートはすぐに利用可能で、連携プロセスを簡素化するため、ノーコードソリューションを好むユーザーにとって最適な選択肢です。

### 主な特長 {#key-features-1}
- Beam によるコーディングは不要
- シンプルなユースケース向けに、迅速かつ容易にセットアップ可能
- プログラミング経験がほとんどないユーザーにも適している

どちらのアプローチも Google Cloud と ClickHouse エコシステムに完全に対応しており、技術的な専門性やプロジェクト要件に応じた柔軟性を提供します。
