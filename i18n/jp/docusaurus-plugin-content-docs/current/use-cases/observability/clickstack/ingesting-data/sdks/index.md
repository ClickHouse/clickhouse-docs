---
slug: /use-cases/observability/clickstack/sdks
pagination_prev: null
pagination_next: null
description: 'ClickStack 用言語 SDK - ClickHouse Observability Stack'
title: '言語 SDK'
doc_type: 'guide'
keywords: ['ClickStack SDKs', 'ClickStack language SDKs', 'OpenTelemetry SDKs ClickStack', 'application instrumentation SDKs
', 'telemetry collection SDKs']
---

データは通常、**OpenTelemetry (OTel) コレクター**を経由して ClickStack に送信されます。これは、言語 SDK から直接送信される場合もあれば、インフラストラクチャメトリクスやログを収集するエージェントとして動作する中間の OpenTelemetry コレクターを介して送信される場合もあります。

言語 SDK は、アプリケーション内部からのテレメトリ、特に **トレース** と **ログ** を収集し、このデータを OTLP エンドポイント経由で OpenTelemetry コレクターにエクスポートする役割を担います。OpenTelemetry コレクター側で、ClickHouse への取り込み処理が行われます。

ブラウザベースの環境では、SDK は **セッションデータ**（UI イベント、クリック、ナビゲーションなどを含む）の収集も担当し、ユーザーセッションのリプレイを可能にします。 



## 仕組み {#how-it-works}

1. アプリケーションはClickStack SDK(Node.js、Python、Goなど)を使用します。これらのSDKはOpenTelemetry SDKをベースとしており、追加機能と使いやすさの向上が施されています。
2. SDKはOTLP(HTTPまたはgRPC)経由でトレースとログを収集し、エクスポートします。
3. OpenTelemetryコレクターがテレメトリを受信し、設定されたエクスポーターを介してClickHouseに書き込みます。


## サポート言語 {#supported-languages}

:::note OpenTelemetry互換性
ClickStackは強化されたテレメトリと機能を備えた独自の言語SDKを提供していますが、既存のOpenTelemetry SDKもシームレスに使用できます。
:::

<br />

| 言語     | 説明                                     | リンク                                                                    |
| ------------ | ----------------------------------------------- | ----------------------------------------------------------------------- |
| AWS Lambda   | AWS Lambda関数の計装            | [ドキュメント](/use-cases/observability/clickstack/sdks/aws_lambda)    |
| Browser      | ブラウザベースアプリケーション向けJavaScript SDK   | [ドキュメント](/use-cases/observability/clickstack/sdks/browser)       |
| Elixir       | Elixirアプリケーション                             | [ドキュメント](/use-cases/observability/clickstack/sdks/elixir)        |
| Go           | Goアプリケーションとマイクロサービス               | [ドキュメント](/use-cases/observability/clickstack/sdks/golang)        |
| Java         | Javaアプリケーション                               | [ドキュメント](/use-cases/observability/clickstack/sdks/java)          |
| NestJS       | NestJSアプリケーション                             | [ドキュメント](/use-cases/observability/clickstack/sdks/nestjs)        |
| Next.js      | Next.jsアプリケーション                            | [ドキュメント](/use-cases/observability/clickstack/sdks/nextjs)        |
| Node.js      | サーバーサイドアプリケーション向けJavaScriptランタイム | [ドキュメント](/use-cases/observability/clickstack/sdks/nodejs)        |
| Deno         | Denoアプリケーション                               | [ドキュメント](/use-cases/observability/clickstack/sdks/deno)          |
| Python       | Pythonアプリケーションとウェブサービス            | [ドキュメント](/use-cases/observability/clickstack/sdks/python)        |
| React Native | React Nativeモバイルアプリケーション                | [ドキュメント](/use-cases/observability/clickstack/sdks/react-native)  |
| Ruby         | Ruby on Railsアプリケーションとウェブサービス     | [ドキュメント](/use-cases/observability/clickstack/sdks/ruby-on-rails) |


## APIキーによるセキュリティ保護 {#securing-api-key}

OTelコレクター経由でClickStackにデータを送信するには、SDKでインジェストAPIキーを指定する必要があります。これは、SDKの`init`関数を使用するか、`OTEL_EXPORTER_OTLP_HEADERS`環境変数を使用して設定できます:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

このAPIキーはHyperDXアプリケーションによって生成され、アプリ内の`チーム設定 → APIキー`から取得できます。

OpenTelemetryをサポートするほとんどの[言語SDK](/use-cases/observability/clickstack/sdks)およびテレメトリライブラリでは、アプリケーション内で`OTEL_EXPORTER_OTLP_ENDPOINT`環境変数を設定するか、SDKの初期化時に指定できます:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```


## Kubernetes統合 {#kubernetes-integration}

すべてのSDKは、Kubernetes環境で実行する際に、Kubernetesメタデータ(Pod名、Namespace など)との自動相関をサポートしています。これにより、以下のことが可能になります:

- サービスに関連付けられたPodおよびノードのKubernetesメトリクスの表示
- アプリケーションログおよびトレースとインフラストラクチャメトリクスの相関付け
- Kubernetesクラスタ全体におけるリソース使用状況とパフォーマンスの追跡

この機能を有効にするには、OpenTelemetryコレクターを設定してリソースタグをPodに転送してください。詳細なセットアップ手順については、[Kubernetes統合ガイド](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)を参照してください。
