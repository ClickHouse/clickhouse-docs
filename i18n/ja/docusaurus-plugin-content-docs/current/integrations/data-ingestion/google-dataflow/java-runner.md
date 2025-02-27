---
sidebar_label: Javaランナー
slug: /integrations/google-dataflow/java-runner
sidebar_position: 2
description: ユーザーはGoogle Dataflow Javaランナーを使ってデータをClickHouseに取り込むことができます。
---

# Dataflow Javaランナー

Dataflow Javaランナーを使用すると、Google CloudのDataflowサービス上でカスタムApache Beamパイプラインを実行できます。このアプローチは最大限の柔軟性を提供し、高度なETLワークフローに適しています。

## 仕組み {#how-it-works}

1. **パイプラインの実装**  
   Javaランナーを使用するには、`ClickHouseIO` - 公式のApache Beamコネクタを使用してBeamパイプラインを実装する必要があります。`ClickHouseIO`の使用方法についてのコード例や説明は、[ClickHouse Apache Beam](../../apache-beam)をご覧ください。

2. **デプロイメント**  
   パイプラインが実装され、構成が完了したら、Google Cloudのデプロイメントツールを使用してDataflowにデプロイできます。包括的なデプロイメント手順は、[Google Cloud Dataflowドキュメント - Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java)で提供されています。

**注意**: このアプローチは、Beamフレームワークの理解とコーディングの専門知識を前提としています。ノーコードソリューションを希望する場合は、[ClickHouseの定義済みテンプレート](./templates)の使用を検討してください。
