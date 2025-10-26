---
'sidebar_label': 'DataflowとClickHouseの統合'
'slug': '/integrations/google-dataflow/dataflow'
'sidebar_position': 1
'description': 'ユーザーはGoogle Dataflowを使用してClickHouseにデータを取り込むことができます'
'title': 'Google DataflowとClickHouseの統合'
'doc_type': 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google DataflowとClickHouseの統合

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) は、完全に管理されたストリームおよびバッチデータ処理サービスです。これは、JavaまたはPythonで記述されたパイプラインをサポートし、Apache Beam SDK上に構築されています。

Google DataflowをClickHouseと統合する主な方法は2つあり、どちらも [`ClickHouseIO Apache Beam connector`](/integrations/apache-beam) を利用しています：

## 1. Javaランナー {#1-java-runner}
[Javaランナー](./java-runner) は、ユーザーがApache Beam SDK `ClickHouseIO`統合を使用してカスタムDataflowパイプラインを実装できるようにします。このアプローチは、パイプラインロジックに対する完全な柔軟性と制御を提供し、ユーザーが特定の要件に合わせてETLプロセスを調整できるようにします。
しかし、このオプションはJavaプログラミングの知識とApache Beamフレームワークへの理解を必要とします。

### 主な特徴 {#key-features}
- 高度なカスタマイズが可能。
- 複雑または高度なユースケースに最適。
- コーディングとBeam APIの理解が求められます。

## 2. 定義済みテンプレート {#2-predefined-templates}
ClickHouseは、特定のユースケース（例えば、BigQueryからClickHouseへのデータインポート）向けに設計された[定義済みテンプレート](./templates)を提供しています。これらのテンプレートは使用準備が整っており、統合プロセスを簡素化し、コーディングなしでのソリューションを好むユーザーにとって優れた選択肢となります。

### 主な特徴 {#key-features-1}
- Beamコーディングは不要。
- シンプルなユースケースのための迅速かつ簡単なセットアップ。
- プログラミングの専門知識が少ないユーザーにも適しています。

両方のアプローチはGoogle CloudとClickHouseエコシステムと完全に互換性があり、技術的な専門知識やプロジェクトの要件に応じて柔軟性を提供します。
