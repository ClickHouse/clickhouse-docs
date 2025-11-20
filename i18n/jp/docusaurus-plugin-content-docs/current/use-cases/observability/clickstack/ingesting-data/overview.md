---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: 'ClickStack へのデータ取り込み'
sidebar_label: '概要'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: 'ClickStack へのデータ取り込みの概要'
doc_type: 'ガイド'
keywords: ['clickstack', 'observability', 'logs', 'monitoring', 'platform']
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

すべてのデータは、**OpenTelemetry (OTel) collector** を介して ClickStack に取り込まれます。この collector は、ログ、メトリクス、トレース、およびセッションデータの主なエントリポイントとして機能します。

<Image img={architecture_with_flow} alt="フロー付きのシンプルなアーキテクチャ" size="md" />

この collector は、2 つの OTLP エンドポイントを公開します:

* **HTTP** - ポート `4318`
* **gRPC** - ポート `4317`

ユーザーは、[language SDKs](/use-cases/observability/clickstack/sdks) から直接、または OTel と互換性のあるデータ収集エージェント (例: インフラストラクチャのメトリクスやログを収集する他の OTel collector など) から、これらのエンドポイントにデータを送信できます。

より具体的には、次のとおりです。

* [**Language SDKs**](/use-cases/observability/clickstack/sdks) は、アプリケーション内部からのテレメトリ、特に **traces** と **logs** の収集を担当し、このデータを OTLP エンドポイント経由で OpenTelemetry collector にエクスポートします。この collector が ClickHouse への取り込みを処理します。ClickStack で利用可能な language SDKs の詳細については、[SDKs](/use-cases/observability/clickstack/sdks) を参照してください。

* **Data collection agents** は、サーバー、Kubernetes ノード、またはアプリケーションのそばなど、エッジにデプロイされるエージェントです。これらはインフラストラクチャのテレメトリ (例: logs、metrics) を収集したり、SDKs でインストルメントされたアプリケーションから直接イベントを受信します。この場合、エージェントはアプリケーションと同じホスト上で、しばしば sidecar や DaemonSet として動作します。これらのエージェントは、中央の ClickStack OTel collector にデータを転送します。この collector は [gateway](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) として機能し、通常、クラスター、データセンター、またはリージョンごとに 1 回デプロイされます。[gateway](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) は、エージェントやアプリケーションから OTLP イベントを受信し、ClickHouse への取り込みを処理します。詳細については [OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) を参照してください。これらのエージェントは、他の OTel collector インスタンスである場合もあれば、[Fluentd](https://www.fluentd.org/) や [Vector](https://vector.dev/) のような別のテクノロジーである場合もあります。

:::note OpenTelemetry compatibility
ClickStack は、拡張されたテレメトリと機能を備えた独自の language SDKs とカスタム OpenTelemetry を提供していますが、ユーザーは既存の OpenTelemetry SDKs やエージェントもシームレスに利用できます。
:::
