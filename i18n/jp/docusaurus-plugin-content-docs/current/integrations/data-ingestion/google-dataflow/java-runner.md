---
sidebar_label: 'Java Runner'
slug: /integrations/google-dataflow/java-runner
sidebar_position: 2
description: 'Google Dataflow Java Runner を使用して ClickHouse にデータを取り込めます'
title: 'Dataflow Java Runner'
doc_type: 'guide'
keywords: ['Dataflow Java Runner', 'Google Dataflow ClickHouse', 'Apache Beam Java ClickHouse', 'ClickHouseIO connector']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Dataflow Java ランナー \{#dataflow-java-runner\}

<ClickHouseSupportedBadge/>

Dataflow Java Runner を使用すると、カスタム Apache Beam パイプラインを Google Cloud の Dataflow サービス上で実行できます。このアプローチは最大限の柔軟性を提供し、高度な ETL ワークフローに適しています。

## 仕組み \\{#how-it-works\\}

1. **パイプラインの実装**
   Java Runner を使用するには、公式の Apache Beam コネクタである `ClickHouseIO` を使って Beam パイプラインを実装する必要があります。コード例および `ClickHouseIO` の使用方法については、[ClickHouse Apache Beam](/integrations/apache-beam) を参照してください。

2. **デプロイメント**
   パイプラインを実装して設定したら、Google Cloud のデプロイメントツールを使用して Dataflow にデプロイできます。詳細なデプロイメント手順は、[Google Cloud Dataflow ドキュメント - Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java) に記載されています。

**注記**: この方法は、Beam フレームワークに関する十分な知識とコーディングの専門スキルを前提としています。ノーコードのソリューションを希望する場合は、[ClickHouse の事前定義テンプレート](./templates)の利用を検討してください。