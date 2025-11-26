---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-sdks
title: 'Elastic からの SDK 移行'
pagination_prev: null
pagination_next: null
sidebar_label: 'SDK 移行'
sidebar_position: 6
description: 'Elastic からの SDK 移行'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

The Elastic Stack では、アプリケーションをインストルメントするために 2 種類の言語 SDK を提供しています。

1. **[Elastic Official APM agents](https://www.elastic.co/docs/reference/apm-agents/)** – これらは Elastic Stack 専用に作成されたエージェントです。現時点では、これらの SDKs から直接移行するためのマイグレーションパスはありません。これらを使用しているアプリケーションは、対応する [ClickStack SDKs](/use-cases/observability/clickstack/sdks) を用いて再インストルメントする必要があります。

2. **[Elastic Distributions of OpenTelemetry (EDOT SDKs)](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – これは標準の OpenTelemetry SDKs に対する Elastic 独自のディストリビューションで、.NET、Java、Node.js、PHP、Python 向けに提供されています。アプリケーションがすでに EDOT SDK を使用している場合、コードを再インストルメントする必要はありません。その代わりに、ClickStack に含まれる OTLP Collector へテレメトリデータをエクスポートするよう SDK を再設定するだけで済みます。詳細は [&quot;Migrating EDOT SDKs&quot;](#migrating-edot-sdks) を参照してください。

:::note 可能な限り ClickStack SDKs を使用する
標準の OpenTelemetry SDKs もサポートされていますが、各言語に対しては [**ClickStack-distributed SDKs**](/use-cases/observability/clickstack/sdks) の使用を強く推奨します。これらのディストリビューションには、追加のインストルメンテーション、強化されたデフォルト設定、および ClickStack パイプラインと HyperDX UI とをシームレスに連携させるために設計されたカスタム拡張が含まれています。ClickStack SDKs を使用することで、例外スタックトレースなど、標準の OpenTelemetry や EDOT SDKs では利用できない高度な機能を利用できます。
:::


## EDOT SDK の移行

ClickStack の OpenTelemetry ベースの SDK と同様に、OpenTelemetry SDK の Elastic ディストリビューション（EDOT SDK）は、公式 OpenTelemetry SDK をベースにしたカスタマイズ版です。たとえば、[EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/) は、Elastic Observability とシームレスに連携するよう設計された [OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/) のベンダーカスタマイズ版ディストリビューションです。

これらの SDK は標準的な OpenTelemetry ライブラリに基づいているため、ClickStack への移行は容易で、再インストルメンテーションは不要です。ClickStack OpenTelemetry Collector にテレメトリデータを送信するように設定を調整するだけで済みます。

設定は標準的な OpenTelemetry のメカニズムに従います。Python の場合、一般的には、[OpenTelemetry Zero-Code Instrumentation ドキュメント](https://opentelemetry.io/docs/zero-code/python/configuration/) に記載されているとおり、環境変数で行います。

典型的な EDOT SDK の設定は次のようになります。

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

ClickStack へ移行するには、エンドポイントをローカルの OTLP コレクターを指すように更新し、Authorization ヘッダーを変更します。

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>"
```

インジェスト API key は HyperDX アプリケーションで生成され、Team Settings → API Keys から確認できます。

<Image img={ingestion_key} alt="インジェストキー" size="lg" />
