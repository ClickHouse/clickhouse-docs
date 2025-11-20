---
sidebar_label: 'Google Dataflow と ClickHouse の統合'
slug: /integrations/google-dataflow/dataflow
sidebar_position: 1
description: 'Google Dataflow を使用して ClickHouse にデータを取り込むことができます'
title: 'Google Dataflow と ClickHouse の統合'
doc_type: 'guide'
keywords: ['Google Dataflow ClickHouse', 'Dataflow ClickHouse integration', 'Apache Beam ClickHouse', 'ClickHouseIO connector', 'Google Cloud ClickHouse integration']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google Dataflow と ClickHouse の統合

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) は、フルマネージドのストリーミングおよびバッチデータ処理サービスです。Java または Python で記述されたパイプラインをサポートしており、Apache Beam SDK 上に構築されています。

Google Dataflow を ClickHouse と組み合わせて利用する主な方法は 2 つあり、いずれも [`ClickHouseIO Apache Beam connector`](/integrations/apache-beam) を使用します。
次の 2 通りです。
- [Java runner](#1-java-runner)
- [Predefined templates](#2-predefined-templates)



## Javaランナー {#1-java-runner}

[Javaランナー](./java-runner)を使用すると、Apache Beam SDKの`ClickHouseIO`統合を利用してカスタムDataflowパイプラインを実装できます。このアプローチでは、パイプラインロジックに対する完全な柔軟性と制御が提供され、特定の要件に合わせてETLプロセスをカスタマイズできます。
ただし、このオプションを使用するには、Javaプログラミングの知識とApache Beamフレームワークへの習熟が必要です。

### 主な機能 {#key-features}

- 高度なカスタマイズが可能
- 複雑または高度なユースケースに最適
- コーディングとBeam APIの理解が必要


## 事前定義済みテンプレート {#2-predefined-templates}

ClickHouseは、BigQueryからClickHouseへのデータインポートなど、特定のユースケース向けに設計された[事前定義済みテンプレート](./templates)を提供しています。これらのテンプレートはすぐに使用でき、統合プロセスを簡素化するため、ノーコードソリューションを好むユーザーに最適です。

### 主な特徴 {#key-features-1}

- Beamのコーディングは不要
- シンプルなユースケースに対する迅速かつ簡単なセットアップ
- プログラミングの専門知識が最小限のユーザーにも適している

どちらのアプローチもGoogle CloudおよびClickHouseエコシステムと完全に互換性があり、技術的な専門知識とプロジェクト要件に応じた柔軟性を提供します。
