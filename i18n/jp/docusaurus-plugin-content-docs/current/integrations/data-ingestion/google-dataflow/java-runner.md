---
sidebar_label: 'Javaランナー'
slug: '/integrations/google-dataflow/java-runner'
sidebar_position: 2
description: 'Users can ingest data into ClickHouse using Google Dataflow Java Runner'
title: 'Dataflow Java Runner'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Dataflow Java Runner

<ClickHouseSupportedBadge/>

Dataflow Java Runnerを使用すると、Google CloudのDataflowサービスでカスタムApache Beamパイプラインを実行できます。このアプローチは最大限の柔軟性を提供し、高度なETLワークフローに適しています。

## 仕組み {#how-it-works}

1. **パイプライン実装**
   Java Runnerを使用するには、公式のApache Beamコネクタである`ClickHouseIO`を使用してBeamパイプラインを実装する必要があります。`ClickHouseIO`の使用方法に関するコード例や指示については、[ClickHouse Apache Beam](/integrations/apache-beam)を訪れてください。

2. **デプロイメント**
   パイプラインが実装され、設定されたら、Google Cloudのデプロイメントツールを使用してDataflowにデプロイできます。包括的なデプロイメント手順は、[Google Cloud Dataflow documentation - Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java)に記載されています。

**注意**: このアプローチはBeamフレームワークへの理解とコーディングスキルを前提としています。ノーコードのソリューションを希望する場合は、[ClickHouseの事前定義されたテンプレート](./templates)の使用を検討してください。
