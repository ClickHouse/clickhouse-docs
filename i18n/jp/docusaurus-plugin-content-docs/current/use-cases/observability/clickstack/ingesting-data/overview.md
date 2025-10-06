---
'slug': '/use-cases/observability/clickstack/ingesting-data/overview'
'title': 'ClickStackへのデータ取り込み'
'sidebar_label': '概要'
'sidebar_position': 0
'pagination_prev': null
'pagination_next': 'use-cases/observability/clickstack/ingesting-data/opentelemetry'
'description': 'ClickStackへのデータ取り込みの概要'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

すべてのデータは、**OpenTelemetry (OTel) コレクタ**を介して ClickStack に取り込まれます。これは、ログ、メトリクス、トレース、およびセッションデータのための主要なエントリポイントとして機能します。

<Image img={architecture_with_flow} alt="フローを持つシンプルなアーキテクチャ" size="md"/>

このコレクタは、2つの OTLP エンドポイントを公開しています：

- **HTTP** - ポート `4318`
- **gRPC** - ポート `4317`

ユーザーは、[言語 SDKs](/use-cases/observability/clickstack/sdks) から直接、または他の OTel コレクタが収集したインフラストラクチャメトリクスやログを含む OTel 互換のデータ収集エージェントから、これらのエンドポイントにデータを送信できます。

より具体的には：

- [**言語 SDKs**](/use-cases/observability/clickstack/sdks) は、あなたのアプリケーション内からテレメトリを収集する役割を担っており、特に **トレース** と **ログ** を収集し、OTLP エンドポイントを介して OpenTelemetry コレクタにデータをエクスポートします。このコレクタは、ClickHouse への取り込みを処理します。ClickStack で利用可能な言語 SDKs の詳細については、[SDKs](/use-cases/observability/clickstack/sdks) を参照してください。

- **データ収集エージェント** は、エッジ（サーバー、Kubernetes ノード、またはアプリケーションと一緒にデプロイ）で展開されるエージェントです。これらはインフラストラクチャテレメトリ（例：ログ、メトリクス）を収集するか、SDKs で計測されたアプリケーションから直接イベントを受け取ります。この場合、エージェントはアプリケーションと同じホスト上で動作し、しばしばサイドカーや DaemonSet として実行されます。これらのエージェントは、中央の ClickStack OTel コレクタにデータを転送し、これは通常、クラスター、データセンター、またはリージョンごとに1回展開される[ゲートウェイ](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)として機能します。[ゲートウェイ](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)は、エージェントやアプリケーションからの OTLP イベントを受け取り、ClickHouse への取り込みを処理します。詳細については、[OTel コレクタ](/use-cases/observability/clickstack/ingesting-data/otel-collector)を参照してください。これらのエージェントは、OTel コレクタの他のインスタンスや、[Fluentd](https://www.fluentd.org/)や[Vector](https://vector.dev/)などの代替技術を使用することができます。

:::note OpenTelemetry 互換性
ClickStack は独自の言語 SDKs とカスタム OpenTelemetry を提供し、強化されたテレメトリと機能を備えていますが、ユーザーは既存の OpenTelemetry SDKs およびエージェントをシームレスに使用することもできます。
:::
