---
'sidebar_label': 'Java Runner'
'slug': '/integrations/google-dataflow/java-runner'
'sidebar_position': 2
'description': 'ユーザーは Google Dataflow Java Runner を使用して ClickHouse にデータを取り込むことができます'
'title': 'Dataflow Java Runner'
'doc_type': 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Dataflow Java runner

<ClickHouseSupportedBadge/>

Dataflow Java Runner は、カスタム Apache Beam パイプラインを Google Cloud の Dataflow サービスで実行できるようにします。このアプローチは最大の柔軟性を提供し、高度な ETL ワークフローに適しています。

## 仕組み {#how-it-works}

1. **パイプラインの実装**
   Java Runner を使用するには、`ClickHouseIO` - 当社の公式 Apache Beam コネクタを使用して Beam パイプラインを実装する必要があります。`ClickHouseIO` の使用方法に関するコード例や指示については、[ClickHouse Apache Beam](/integrations/apache-beam) をご覧ください。

2. **デプロイ**
   パイプラインが実装され、構成されたら、Google Cloud のデプロイツールを使用して Dataflow にデプロイできます。デプロイメントの包括的な手順については、[Google Cloud Dataflow ドキュメント - Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java)をご参照ください。

**注**: このアプローチは、Beam フレームワークに対する理解とコーディングの専門知識が必要です。ノーコードソリューションを好む場合は、[ClickHouse の定義済みテンプレート](./templates) の使用を検討してください。
