---
slug: /use-cases/observability/clickstack/sdks
pagination_prev: null
pagination_next: null
description: 'ClickStack - ClickHouse オブザーバビリティスタック向け言語 SDK'
title: '言語 SDK'
doc_type: 'guide'
keywords: ['ClickStack SDKs', 'ClickStack 言語 SDK', 'OpenTelemetry SDKs ClickStack', 'application instrumentation SDKs', 'telemetry collection SDKs']
---

データは通常、**OpenTelemetry (OTel) コレクター** を介して ClickStack に送信されます。送信元は、言語 SDK から直接の場合もあれば、インフラストラクチャメトリクスやログを収集するエージェントとして動作する中間の OpenTelemetry コレクター経由の場合もあります。

言語 SDK は、アプリケーション内部からのテレメトリ、特に **トレース (traces)** と **ログ (logs)** を収集し、このデータを OTLP エンドポイント経由で OpenTelemetry コレクターにエクスポートします。コレクターが ClickHouse への取り込みを処理します。

ブラウザベースの環境では、SDK が **セッションデータ (session data)**（UI イベント、クリック、ナビゲーションなどを含む）の収集も担当し、ユーザーセッションのリプレイを可能にします。 



## 仕組み {#how-it-works}

1. アプリケーションはClickStack SDK（Node.js、Python、Goなど）を使用します。これらのSDKはOpenTelemetry SDKをベースとしており、追加機能と使いやすさの向上が施されています。
2. SDKはOTLP（HTTPまたはgRPC）経由でトレースとログを収集し、エクスポートします。
3. OpenTelemetryコレクターがテレメトリを受信し、設定されたエクスポーター経由でClickHouseに書き込みます。


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
| Go           | Goアプリケーションおよびマイクロサービス               | [ドキュメント](/use-cases/observability/clickstack/sdks/golang)        |
| Java         | Javaアプリケーション                               | [ドキュメント](/use-cases/observability/clickstack/sdks/java)          |
| NestJS       | NestJSアプリケーション                             | [ドキュメント](/use-cases/observability/clickstack/sdks/nestjs)        |
| Next.js      | Next.jsアプリケーション                            | [ドキュメント](/use-cases/observability/clickstack/sdks/nextjs)        |
| Node.js      | サーバーサイドアプリケーション向けJavaScriptランタイム | [ドキュメント](/use-cases/observability/clickstack/sdks/nodejs)        |
| Deno         | Denoアプリケーション                               | [ドキュメント](/use-cases/observability/clickstack/sdks/deno)          |
| Python       | Pythonアプリケーションおよびウェブサービス            | [ドキュメント](/use-cases/observability/clickstack/sdks/python)        |
| React Native | React Nativeモバイルアプリケーション                | [ドキュメント](/use-cases/observability/clickstack/sdks/react-native)  |
| Ruby         | Ruby on Railsアプリケーションおよびウェブサービス     | [ドキュメント](/use-cases/observability/clickstack/sdks/ruby-on-rails) |


## APIキーによるセキュリティ保護 {#securing-api-key}

OTelコレクター経由でClickStackにデータを送信するには、SDKでインジェストAPIキーを指定する必要があります。これは、SDKの`init`関数または`OTEL_EXPORTER_OTLP_HEADERS`環境変数のいずれかで設定できます:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

このAPIキーはHyperDXアプリケーションによって生成され、アプリ内の`Team Settings → API Keys`から取得できます。

OpenTelemetryをサポートするほとんどの[言語SDK](/use-cases/observability/clickstack/sdks)およびテレメトリライブラリでは、アプリケーション内で`OTEL_EXPORTER_OTLP_ENDPOINT`環境変数を設定するか、SDKの初期化時に指定することができます:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```


## Kubernetes統合 {#kubernetes-integration}

すべてのSDKは、Kubernetes環境で実行する際に、Kubernetesメタデータ(Pod名、Namespaceなど)との自動相関をサポートしています。これにより、以下のことが可能になります:

- サービスに関連付けられたPodとNodeのKubernetesメトリクスを表示する
- アプリケーションログとトレースをインフラストラクチャメトリクスと相関付ける
- Kubernetesクラスタ全体のリソース使用状況とパフォーマンスを追跡する

この機能を有効にするには、OpenTelemetryコレクターを設定してリソースタグをPodに転送します。詳細なセットアップ手順については、[Kubernetes統合ガイド](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)を参照してください。
