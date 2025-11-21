---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: 'ClickStack へのデータ取り込み'
sidebar_label: '概要'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: 'ClickStack へのデータ取り込みの概要'
doc_type: 'guide'
keywords: ['clickstack', 'オブザーバビリティ', 'ログ', 'モニタリング', 'プラットフォーム']
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

すべてのデータは **OpenTelemetry (OTel) コレクター** を経由して ClickStack に取り込まれます。これは、ログ、メトリクス、トレース、セッションデータの主な入口として機能します。

<Image img={architecture_with_flow} alt="フローを含むシンプルなアーキテクチャ" size="md" />

このコレクターは 2 つの OTLP エンドポイントを公開します:

* **HTTP** - ポート `4318`
* **gRPC** - ポート `4317`

ユーザーは、[Language SDK](/use-cases/observability/clickstack/sdks) から直接、または OTel 対応のデータ収集エージェント（例: インフラストラクチャのメトリクスやログを収集する他の OTel コレクター）から、これらのエンドポイントにデータを送信できます。

より具体的には次のとおりです。

* [**Language SDK**](/use-cases/observability/clickstack/sdks) は、アプリケーション内部からのテレメトリ、特に **トレース** と **ログ** を収集し、このデータを OTLP エンドポイント経由で OpenTelemetry コレクターにエクスポートする役割を担います。コレクターが ClickHouse への取り込みを処理します。ClickStack で利用可能な Language SDK の詳細については、[SDKs](/use-cases/observability/clickstack/sdks) を参照してください。

* **データ収集エージェント** は、サーバー、Kubernetes ノード、またはアプリケーションの横など、エッジにデプロイされるエージェントです。これらはインフラストラクチャのテレメトリ（例: ログ、メトリクス）を収集するか、SDK でインスツルメンテーションされたアプリケーションからイベントを直接受信します。この場合、エージェントはアプリケーションと同じホスト上で、サイドカーまたは DaemonSet として動作することがよくあります。これらのエージェントは、中央の ClickStack OTel コレクターにデータを転送します。このコレクターは通常、クラスター、データセンター、またはリージョンごとに 1 回デプロイされる [ゲートウェイ](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) として機能します。[ゲートウェイ](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) は、エージェントまたはアプリケーションから OTLP イベントを受信し、ClickHouse への取り込みを処理します。詳細については [OTel コレクター](/use-cases/observability/clickstack/ingesting-data/otel-collector) を参照してください。これらのエージェントは、他の OTel コレクターインスタンスや、[Fluentd](https://www.fluentd.org/) や [Vector](https://vector.dev/) などの別の技術である場合もあります。

:::note OpenTelemetry 互換性
ClickStack は、強化されたテレメトリと機能を備えた独自の Language SDK とカスタム OpenTelemetry を提供しますが、ユーザーは既存の OpenTelemetry SDK やエージェントもシームレスに利用できます。
:::
