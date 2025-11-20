---
sidebar_label: 'Java Runner'
slug: /integrations/google-dataflow/java-runner
sidebar_position: 2
description: 'ユーザーは Google Dataflow Java Runner を使用して ClickHouse にデータをインジェストできます'
title: 'Dataflow Java Runner'
doc_type: 'guide'
keywords: ['Dataflow Java Runner', 'Google Dataflow ClickHouse', 'Apache Beam Java ClickHouse', 'ClickHouseIO connector']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Dataflow Java ランナー

<ClickHouseSupportedBadge/>

Dataflow Java ランナーを使用すると、カスタム Apache Beam パイプラインを Google Cloud の Dataflow サービス上で実行できます。この方法は柔軟性が高く、高度な ETL ワークフローに適しています。



## 動作の仕組み {#how-it-works}

1. **パイプラインの実装**
   Java Runnerを使用するには、ClickHouseの公式Apache Beamコネクタである`ClickHouseIO`を使用してBeamパイプラインを実装する必要があります。`ClickHouseIO`の使用方法に関するコード例と手順については、[ClickHouse Apache Beam](/integrations/apache-beam)を参照してください。

2. **デプロイ**
   パイプラインの実装と設定が完了したら、Google Cloudのデプロイツールを使用してDataflowにデプロイできます。詳細なデプロイ手順については、[Google Cloud Dataflowドキュメント - Javaパイプライン](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java)を参照してください。

**注意**: このアプローチは、Beamフレームワークに関する知識とコーディングスキルを前提としています。ノーコードソリューションをご希望の場合は、[ClickHouseの事前定義済みテンプレート](./templates)の使用をご検討ください。
