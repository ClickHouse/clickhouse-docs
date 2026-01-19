---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-sdks
title: 'Elastic からの SDK の移行'
pagination_prev: null
pagination_next: null
sidebar_label: 'SDK の移行'
sidebar_position: 6
description: 'Elastic からの SDK の移行'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

Elastic Stack は、アプリケーションを計装するための言語 SDK を 2 種類提供しています：

1. **[Elastic Official APM agents](https://www.elastic.co/docs/reference/apm-agents/)** – これらは Elastic Stack 専用に構築された APM エージェントです。現時点では、これらの SDK 向けの直接的な移行パスは存在しません。これらを使用しているアプリケーションは、対応する [ClickStack SDKs](/use-cases/observability/clickstack/sdks) を使用して再計装する必要があります。

2. **[Elastic Distributions of OpenTelemetry (EDOT SDKs)](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – これは標準 OpenTelemetry SDKs の Elastic ディストリビューションであり、.NET、Java、Node.js、PHP、Python 向けに提供されています。アプリケーションがすでに EDOT SDK を使用している場合、コードを再計装する必要はありません。その代わりに、ClickStack に含まれる OTLP Collector へテレメトリデータをエクスポートするように SDK を再構成するだけでかまいません。詳細は [&quot;Migrating EDOT SDKs&quot;](#migrating-edot-sdks) を参照してください。

:::note 可能な限り ClickStack SDKs を使用する
標準の OpenTelemetry SDKs もサポートされていますが、各言語向けには [**ClickStack-distributed SDKs**](/use-cases/observability/clickstack/sdks) の使用を強く推奨します。これらのディストリビューションには、追加の計装、強化されたデフォルト設定、ClickStack パイプラインおよび HyperDX UI とシームレスに連携するよう設計されたカスタム拡張機能が含まれています。ClickStack SDKs を使用することで、プレーンな OpenTelemetry や EDOT SDKs では利用できない例外スタックトレースなどの高度な機能を活用できます。
:::

## EDOT SDK の移行 \{#migrating-edot-sdks\}

ClickStack の OpenTelemetry ベースの SDK と同様に、Elastic Distributions of the OpenTelemetry SDKs（EDOT SDK）は、公式の OpenTelemetry SDK をベースにしたカスタマイズ版です。たとえば、[EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/) は、Elastic Observability とシームレスに連携するように設計された、[OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/) のベンダー独自ディストリビューションです。

これらの SDK は標準の OpenTelemetry ライブラリに基づいているため、ClickStack への移行は容易で、再インストルメンテーションは不要です。ClickStack OpenTelemetry Collector にテレメトリ データを送信するように設定を調整するだけで済みます。

設定は標準的な OpenTelemetry のメカニズムに従います。Python の場合、通常は [OpenTelemetry Zero-Code Instrumentation ドキュメント](https://opentelemetry.io/docs/zero-code/python/configuration/) で説明されているように、環境変数経由で行います。

一般的な EDOT SDK の設定は次のようになります。

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

ClickStack へ移行するには、エンドポイントをローカルの OTLP Collector を指すように更新し、Authorization ヘッダーを変更します。

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>"
```

インジェスト API key は HyperDX アプリケーション上で生成され、「Team Settings」→「API Keys」で確認できます。

<Image img={ingestion_key} alt="Ingestion keys" size="lg" />
