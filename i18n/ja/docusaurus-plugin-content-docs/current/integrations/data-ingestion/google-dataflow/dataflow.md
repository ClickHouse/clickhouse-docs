---
sidebar_label: ClickHouseとのデータフロー統合
slug: /integrations/google-dataflow/dataflow
sidebar_position: 1
description: ユーザーはGoogle Dataflowを使用してClickHouseにデータを取り込むことができます
---

# Google DataflowとClickHouseの統合

[Google Dataflow](https://cloud.google.com/dataflow)は、完全に管理されたストリームおよびバッチデータ処理サービスです。JavaまたはPythonで書かれたパイプラインをサポートし、Apache Beam SDKに基づいています。

Google DataflowをClickHouseと共に使用する主な方法は2つあり、どちらも[`ClickHouseIO Apache Beamコネクタ`](../../apache-beam)を活用しています。

## 1. Javaランナー {#1-java-runner}
[Javaランナー](./java-runner)を使用すると、ユーザーはApache Beam SDKの`ClickHouseIO`統合を使用してカスタムDataflowパイプラインを実装できます。このアプローチは、パイプラインロジックに対する完全な柔軟性と制御を提供し、ユーザーがETLプロセスを特定の要件に合わせて調整できるようにします。ただし、このオプションはJavaプログラミングの知識とApache Beamフレームワークへの理解を必要とします。

### 主な機能 {#key-features}
- 高度なカスタマイズが可能。
- 複雑または高度なユースケースに最適。
- コーディングとBeam APIの理解が必要。

## 2. 事前定義されたテンプレート {#2-predefined-templates}
ClickHouseは、BigQueryからClickHouseへのデータインポートのような特定のユースケース向けに設計された[事前定義されたテンプレート](./templates)を提供しています。これらのテンプレートはすぐに使用でき、統合プロセスを簡素化し、ノーコードソリューションを好むユーザーには最適な選択肢です。

### 主な機能 {#key-features-1}
- Beamのコーディングは不要。
- 簡単なユースケースの迅速かつ簡単なセットアップ。
- プログラミングの専門知識がほとんどないユーザーにも適しています。

どちらのアプローチもGoogle CloudおよびClickHouseエコシステムと完全に互換性があり、技術的な専門知識やプロジェクト要件に応じた柔軟性を提供します。
