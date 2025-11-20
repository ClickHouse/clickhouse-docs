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

Elastic Stack は、アプリケーションを計装するための 2 種類の言語 SDK を提供しています。

1. **[Elastic Official APM agents](https://www.elastic.co/docs/reference/apm-agents/)** – これらは Elastic Stack での利用に特化して作られています。現在、これらの SDK からの直接的な移行パスはありません。これらを利用しているアプリケーションは、対応する [ClickStack SDKs](/use-cases/observability/clickstack/sdks) を用いて再計装する必要があります。

2. **[Elastic Distributions of OpenTelemetry (EDOT SDKs)](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – これらは標準 OpenTelemetry SDK の Elastic 独自ディストリビューションであり、.NET、Java、Node.js、PHP、Python 向けに提供されています。アプリケーションですでに EDOT SDK を利用している場合、コードを再計装する必要はありません。その代わりに、ClickStack に含まれる OTLP Collector にテレメトリデータをエクスポートするように SDK を再設定するだけで済みます。詳細は「[Migrating EDOT SDKs](#migrating-edot-sdks)」を参照してください。

:::note Use ClickStack SDKs where possible
標準の OpenTelemetry SDK もサポートされていますが、各言語向けには [**ClickStack-distributed SDKs**](/use-cases/observability/clickstack/sdks) の利用を強く推奨します。これらのディストリビューションには、追加の計装、強化されたデフォルト設定、および ClickStack パイプラインと HyperDX UI とシームレスに連携するよう設計されたカスタム拡張が含まれています。ClickStack SDKs を使用することで、標準的な OpenTelemetry や EDOT SDK では利用できない、例外スタックトレースなどの高度な機能を利用できます。
:::


## EDOT SDKの移行 {#migrating-edot-sdks}

ClickStackのOpenTelemetryベースSDKと同様に、Elastic Distributions of the OpenTelemetry SDKs（EDOT SDK）は、公式OpenTelemetry SDKのカスタマイズ版です。例えば、[EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/)は、Elastic Observabilityとシームレスに連携するように設計された[OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/)のベンダーカスタマイズディストリビューションです。

これらのSDKは標準のOpenTelemetryライブラリをベースにしているため、ClickStackへの移行は簡単です。再計装は不要で、テレメトリデータをClickStack OpenTelemetry Collectorに送信するように設定を調整するだけで済みます。

設定は標準のOpenTelemetryメカニズムに従います。Pythonの場合、[OpenTelemetry Zero-Code Instrumentationドキュメント](https://opentelemetry.io/docs/zero-code/python/configuration/)に記載されているように、通常は環境変数を使用して行います。

典型的なEDOT SDKの設定は次のようになります：

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

ClickStackに移行するには、エンドポイントをローカルのOTLP Collectorを指すように更新し、認証ヘッダーを変更します：

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>"
```

インジェストAPIキーはHyperDXアプリケーションによって生成され、Team Settings → API Keysで確認できます。

<Image img={ingestion_key} alt='インジェストキー' size='lg' />
