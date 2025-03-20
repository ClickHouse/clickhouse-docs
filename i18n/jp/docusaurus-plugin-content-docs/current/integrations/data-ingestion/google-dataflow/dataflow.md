---
sidebar_label: ClickHouseとGoogle Dataflowの統合
slug: /integrations/google-dataflow/dataflow
sidebar_position: 1
description: ユーザーはGoogle Dataflowを使用してClickHouseにデータを取り込むことができます
---


# Google DataflowとClickHouseの統合

[Google Dataflow](https://cloud.google.com/dataflow) は、完全に管理されたストリームおよびバッチデータ処理サービスです。JavaまたはPythonで記述されたパイプラインをサポートし、Apache Beam SDK上に構築されています。

ClickHouseでGoogle Dataflowを使用するには2つの主要な方法があり、どちらも [`ClickHouseIO Apache Beam connector`](/integrations/apache-beam) を利用しています。

## 1. Java Runner {#1-java-runner}
[Java Runner](./java-runner) を使用することで、ユーザーはApache Beam SDK `ClickHouseIO` 統合を利用したカスタムDataflowパイプラインを実装できます。このアプローチは、パイプラインロジックへの完全な柔軟性と制御を提供し、ユーザーがETLプロセスを特定の要件に合わせて調整できるようにします。しかし、このオプションはJavaプログラミングの知識とApache Beamフレームワークへの理解が必要です。

### 主な機能 {#key-features}
- 高度なカスタマイズが可能。
- 複雑または高度なユースケースに最適。
- コーディングとBeam APIの理解が必要。

## 2. 事前定義されたテンプレート {#2-predefined-templates}
ClickHouseは、BigQueryからClickHouseにデータをインポートするなど、特定のユースケース向けに設計された[事前定義されたテンプレート](./templates)を提供しています。これらのテンプレートは使う準備が整っており、統合プロセスを簡素化するため、ノーコードソリューションを好むユーザーにとって優れた選択肢です。

### 主な機能 {#key-features-1}
- Beamコーディングは不要。
- 簡単なユースケース向けに迅速かつ簡単に設定可能。
- プログラミングの専門知識がほとんどないユーザーにも適している。

どちらのアプローチもGoogle CloudおよびClickHouseエコシステムと完全に互換性があり、技術的な専門知識やプロジェクトの要件に応じた柔軟性を提供します。  

