---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: 'ClickStack へのデータ取り込み'
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

すべてのデータは **OpenTelemetry (OTel) collector** を介して ClickStack に取り込まれます。これは、ログ、メトリクス、トレース、およびセッションデータの主なエントリポイントとして機能します。

<Image img={architecture_with_flow} alt="フロー付きのシンプルなアーキテクチャ" size="md" />

この collector は 2 つの OTLP エンドポイントを公開します:

* **HTTP** - ポート `4318`
* **gRPC** - ポート `4317`

ユーザーは、[language SDKs](/use-cases/observability/clickstack/sdks) から直接、または OTel 互換のデータ収集エージェント (例: インフラストラクチャのメトリクスやログを収集する他の OTel collector) から、これらのエンドポイントにデータを送信できます。

より具体的には:

* [**Language SDKs**](/use-cases/observability/clickstack/sdks) はアプリケーション内部からのテレメトリ収集、特に **トレース** と **ログ** を担当し、このデータを OTLP エンドポイント経由で OpenTelemetry collector にエクスポートします。collector は ClickHouse へのインジェストを処理します。ClickStack で利用可能な language SDKs の詳細については、[SDKs](/use-cases/observability/clickstack/sdks) を参照してください。

* **データ収集エージェント** は、サーバーや Kubernetes ノード、アプリケーションの横など、エッジにデプロイされるエージェントです。これらはインフラストラクチャのテレメトリ (例: ログ、メトリクス) を収集するか、SDK でインスツルメントされたアプリケーションからイベントを直接受信します。この場合、エージェントはアプリケーションと同じホスト上で動作し、多くの場合サイドカーまたはデーモンセットとして実行されます。これらのエージェントは、中央の ClickStack OTel collector にデータを転送します。これは通常、クラスタ、データセンター、またはリージョンごとに一度だけデプロイされる [gateway](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) として機能します。[gateway](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) はエージェントまたはアプリケーションからの OTLP イベントを受信し、ClickHouse へのインジェストを処理します。詳細については [OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) を参照してください。これらのエージェントは、他のインスタンスの OTel collector である場合もあれば、[Fluentd](https://www.fluentd.org/) や [Vector](https://vector.dev/) などの別のテクノロジーである場合もあります。

:::note OpenTelemetry との互換性
ClickStack は、拡張されたテレメトリと機能を備えた独自の language SDKs とカスタム OpenTelemetry を提供していますが、ユーザーは既存の OpenTelemetry SDKs やエージェントも引き続きシームレスに利用できます。
:::
