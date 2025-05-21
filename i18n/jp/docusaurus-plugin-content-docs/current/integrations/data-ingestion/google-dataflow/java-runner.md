---
sidebar_label: 'Java Runner'
slug: /integrations/google-dataflow/java-runner
sidebar_position: 2
description: 'ユーザーは Google Dataflow Java Runner を使用して ClickHouse にデータを取り込むことができます'
title: 'Dataflow Java Runner'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Dataflow Java Runner

<ClickHouseSupportedBadge/>

Dataflow Java Runner を使用すると、Google Cloud の Dataflow サービス上でカスタム Apache Beam パイプラインを実行できます。このアプローチは最大限の柔軟性を提供し、高度な ETL ワークフローに適しています。

## 仕組み {#how-it-works}

1. **パイプライン実装**
   Java Runner を使用するには、`ClickHouseIO` - 当社の公式 Apache Beam コネクタを使用して Beam パイプラインを実装する必要があります。`ClickHouseIO` の使用方法やコード例については、[ClickHouse Apache Beam](/integrations/apache-beam)をご覧ください。

2. **デプロイ**
   パイプラインが実装され、設定されると、Google Cloud のデプロイツールを使用して Dataflow にデプロイできます。包括的なデプロイ手順については、[Google Cloud Dataflow documentation - Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java)を参照してください。

**注意**: このアプローチは、Beam フレームワークに精通していることと、コーディングの専門知識があることを前提としています。ノーコードのソリューションを希望する場合は、[ClickHouse の事前定義テンプレート](./templates)の使用を検討してください。
