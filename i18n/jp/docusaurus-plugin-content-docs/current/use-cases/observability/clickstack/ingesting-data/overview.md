---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: 'ClickStack へのデータの取り込み'
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

すべてのデータは **OpenTelemetry (OTel) collector** を経由して ClickStack に取り込まれます。この collector は、ログ、メトリクス、トレース、セッションデータの主なエントリポイントとして機能します。

<Image img={architecture_with_flow} alt="フローを伴うシンプルなアーキテクチャ" size="md" />

この collector は、次の 2 つの OTLP エンドポイントを公開します:

* **HTTP** - ポート `4318`
* **gRPC** - ポート `4317`

ユーザーは、[Language SDKs](/use-cases/observability/clickstack/sdks) から直接、または OTel 互換のデータ収集エージェント（例: インフラメトリクスやログを収集する別の OTel collector など）から、これらのエンドポイントへデータを送信できます。

もう少し詳しく説明すると、次のとおりです。

* [**Language SDKs**](/use-cases/observability/clickstack/sdks) は、アプリケーション内部からのテレメトリ、特に **トレース** や **ログ** を収集し、そのデータを OTLP エンドポイント経由で OpenTelemetry collector にエクスポートする役割を担います。この collector が ClickHouse へのインジェストを処理します。ClickStack で利用可能な Language SDKs の詳細については、[SDKs](/use-cases/observability/clickstack/sdks) を参照してください。

* **データ収集エージェント** は、サーバー、Kubernetes ノード、あるいはアプリケーションの横など、エッジにデプロイされるエージェントです。これらはインフラのテレメトリ（例: ログ、メトリクス）を収集するか、SDK で計装されたアプリケーションからイベントを直接受信します。この場合、エージェントはアプリケーションと同じホスト上で動作し、多くの場合サイドカーやデーモンセットとして実行されます。これらのエージェントは、クラスターやデータセンター、リージョンごとに通常 1 つデプロイされる、[ゲートウェイ](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) として機能する中央の ClickStack OTel collector にデータを転送します。この [ゲートウェイ](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) は、エージェントやアプリケーションから OTLP イベントを受け取り、ClickHouse へのインジェストを処理します。詳細は [OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) を参照してください。これらのエージェントには、OTel collector の別インスタンスのほか、[Fluentd](https://www.fluentd.org/) や [Vector](https://vector.dev/) といった別のテクノロジーを利用することもできます。

:::note OpenTelemetry 互換性
ClickStack は独自の Language SDKs と、拡張されたテレメトリと機能を備えたカスタムの OpenTelemetry 実装を提供しますが、ユーザーは既存の OpenTelemetry SDKs やエージェントもシームレスに利用できます。
:::
