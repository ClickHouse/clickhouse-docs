---
sidebar_label: 'Integrating Dataflow with ClickHouse'
slug: '/integrations/google-dataflow/dataflow'
sidebar_position: 1
description: 'Users can ingest data into ClickHouse using Google Dataflow'
title: 'Integrating Google Dataflow with ClickHouse'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google Dataflow と ClickHouse の統合

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) は、完全に管理されたストリームおよびバッチデータ処理サービスです。Java または Python で記述されたパイプラインをサポートし、Apache Beam SDK を基盤としています。

Google Dataflow を ClickHouse と組み合わせて使用する主な方法は二つあり、どちらも [`ClickHouseIO Apache Beam コネクタ`](/integrations/apache-beam) を活用しています。

## 1. Java ランナー {#1-java-runner}
[Java ランナー](./java-runner) は、ユーザーが Apache Beam SDK の `ClickHouseIO` 統合を使用してカスタム Dataflow パイプラインを実装できるようにします。このアプローチは、パイプラインロジックに対する完全な柔軟性と制御を提供し、ユーザーが特定の要件に合わせて ETL プロセスを調整できるようにします。ただし、このオプションは Java プログラミングの知識と Apache Beam フレームワークへの精通を必要とします。

### 主な機能 {#key-features}
- 高いカスタマイズ性。
- 複雑または高度なユースケースに最適。
- コーディングおよび Beam API の理解が必要。

## 2. 予め定義されたテンプレート {#2-predefined-templates}
ClickHouse は、BigQuery から ClickHouse へのデータインポートなど、特定のユースケース向けに設計された [予め定義されたテンプレート](./templates) を提供しています。これらのテンプレートはすぐに使用でき、統合プロセスを簡素化するため、ノーコードソリューションを好むユーザーにとって優れた選択肢です。

### 主な機能 {#key-features-1}
- Beam コーディングは不要。
- 簡単なユースケースに対して迅速かつ簡便なセットアップ。
- 最小限のプログラミング専門知識を持つユーザーにも適している。

どちらのアプローチも Google Cloud および ClickHouse エコシステムと完全に互換性があり、技術的専門知識やプロジェクト要件に応じた柔軟性を提供します。
