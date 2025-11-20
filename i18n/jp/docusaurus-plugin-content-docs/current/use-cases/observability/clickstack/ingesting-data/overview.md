---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: 'ClickStack へのデータの取り込み'
sidebar_label: '概要'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: 'ClickStack へのデータ取り込みの概要'
doc_type: 'guide'
keywords: ['clickstack', 'observability', 'logs', 'monitoring', 'platform']
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

すべてのデータは、ログ、メトリクス、トレース、セッションデータの主なエントリポイントとして機能する **OpenTelemetry (OTel) コレクター** を介して ClickStack に取り込まれます。

<Image img={architecture_with_flow} alt="フロー付きのシンプルなアーキテクチャ" size="md" />

このコレクターは、2 つの OTLP エンドポイントを公開します:

* **HTTP** - ポート `4318`
* **gRPC** - ポート `4317`

ユーザーは、[言語 SDK](/use-cases/observability/clickstack/sdks) から直接、または OTel 互換のデータ収集エージェント（例: インフラストラクチャのメトリクスやログを収集する他の OTel コレクター）から、これらのエンドポイントへデータを送信できます。

より具体的には、次のとおりです。

* [**言語 SDK**](/use-cases/observability/clickstack/sdks) は、アプリケーション内部からのテレメトリ、特に **トレース** と **ログ** の収集を担当し、このデータを OTLP エンドポイント経由で OpenTelemetry コレクターにエクスポートします。コレクターは ClickHouse への取り込みを処理します。ClickStack で利用可能な言語 SDK の詳細については、[SDKs](/use-cases/observability/clickstack/sdks) を参照してください。

* **データ収集エージェント** は、サーバー、Kubernetes ノード、またはアプリケーションのサイドなど、エッジにデプロイされるエージェントです。これらはインフラストラクチャのテレメトリ（例: ログ、メトリクス）を収集するか、SDK でインスツルメントされたアプリケーションからイベントを直接受信します。この場合、エージェントはしばしばサイドカーや DaemonSet として、アプリケーションと同じホスト上で動作します。これらのエージェントは、中央の ClickStack OTel コレクターにデータを転送します。これは通常、クラスター、データセンター、またはリージョンごとに 1 度デプロイされる [ゲートウェイ](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) として機能します。[ゲートウェイ](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) は、エージェントやアプリケーションから OTLP イベントを受信し、ClickHouse への取り込みを処理します。詳細については [OTel コレクター](/use-cases/observability/clickstack/ingesting-data/otel-collector) を参照してください。これらのエージェントは、他の OTel コレクターのインスタンスである場合もあれば、[Fluentd](https://www.fluentd.org/) や [Vector](https://vector.dev/) などの別の技術スタックである場合もあります。

:::note OpenTelemetry 互換性
ClickStack は、拡張されたテレメトリと機能を備えた独自の言語 SDK とカスタム OpenTelemetry コレクターを提供しますが、ユーザーは既存の OpenTelemetry SDK やエージェントもシームレスに利用できます。
:::
