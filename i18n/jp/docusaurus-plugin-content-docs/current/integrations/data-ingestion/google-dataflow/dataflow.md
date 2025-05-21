---
sidebar_label: 'ClickHouseとのデータフローの統合'
slug: /integrations/google-dataflow/dataflow
sidebar_position: 1
description: 'ユーザーはGoogle Dataflowを使用してClickHouseにデータを取り込むことができます'
title: 'Google DataflowとClickHouseの統合'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google DataflowとClickHouseの統合

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) は完全に管理されたストリームおよびバッチデータ処理サービスです。JavaまたはPythonで記述されたパイプラインをサポートし、Apache Beam SDKに基づいて構築されています。

Google DataflowをClickHouseと連携させる方法は主に2つあり、どちらも [`ClickHouseIO Apache Beamコネクタ`](/integrations/apache-beam) を活用しています。

## 1. Javaランナー {#1-java-runner}
[Javaランナー](./java-runner) は、ユーザーがApache Beam SDK `ClickHouseIO` 統合を使用してカスタムデータフローのパイプラインを実装できるようにします。このアプローチは、パイプラインのロジックに対して完全な柔軟性と制御を提供し、ユーザーが特定の要件に合わせてETLプロセスを調整できるようにします。しかし、このオプションはJavaプログラミングの知識とApache Beamフレームワークへの理解を必要とします。

### 主要機能 {#key-features}
- 高度なカスタマイズの可能性。
- 複雑または高度なユースケースに最適。
- コーディングとBeam APIの理解が必要。

## 2. 予定義テンプレート {#2-predefined-templates}
ClickHouseは、BigQueryからClickHouseへのデータインポートなど、特定のユースケース用に設計された[予定義テンプレート](./templates)を提供しています。これらのテンプレートはすぐに使用でき、統合プロセスを簡素化するため、ノーコードソリューションを好むユーザーにとって優れた選択肢です。

### 主要機能 {#key-features-1}
- Beamコーディングは不要。
- 簡単なユースケースのための迅速で簡単なセットアップ。
- プログラミングの専門知識がほとんどなくても使用可能。

両方のアプローチはGoogle CloudとClickHouseエコシステムと完全に互換性があり、技術的な専門知識やプロジェクトの要件に応じた柔軟性を提供します。
