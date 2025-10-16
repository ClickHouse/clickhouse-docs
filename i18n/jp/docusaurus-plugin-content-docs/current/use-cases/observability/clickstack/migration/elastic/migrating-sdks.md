---
'slug': '/use-cases/observability/clickstack/migration/elastic/migrating-sdks'
'title': 'ElasticからSDKを移行する'
'pagination_prev': null
'pagination_next': null
'sidebar_label': 'SDKの移行'
'sidebar_position': 6
'description': 'ElasticからSDKを移行する'
'show_related_blogs': true
'keywords':
- 'ClickStack'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

The Elastic Stackは、アプリケーションを計測するための2種類の言語SDKを提供しています。

1. **[Elastic公式APMエージェント](https://www.elastic.co/docs/reference/apm-agents/)** – これはElastic Stack専用に構築されています。これらのSDKには現在、直接の移行パスはありません。これらを使用しているアプリケーションは、対応する[ClickStack SDKs](/use-cases/observability/clickstack/sdks)を使用して再計測する必要があります。

2. **[OpenTelemetryのElasticディストリビューション（EDOT SDKs）](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – これはElasticの標準OpenTelemetry SDKのディストリビューションで、.NET、Java、Node.js、PHP、およびPython用に提供されています。あなたのアプリケーションがすでにEDOT SDKを使用している場合、コードを再計測する必要はありません。代わりに、SDKを再構成して、ClickStackに含まれるOTLP Collectorにテレメトリデータをエクスポートできます。詳細は、["EDOT SDKの移行"](#migrating-edot-sdks)を参照してください。

:::note ClickStack SDKsを可能な限り使用する
標準のOpenTelemetry SDKはサポートされていますが、各言語に対して[**ClickStack配布SDK**](/use-cases/observability/clickstack/sdks)を使用することを強く推奨します。これらのディストリビューションには、追加の計測、強化されたデフォルト、およびClickStackパイプラインとHyperDX UIとシームレスに動作するように設計されたカスタム拡張が含まれています。ClickStack SDKを使用することで、バニラのOpenTelemetryやEDOT SDKでは利用できない例外スタックトレースなどの高度な機能を利用できます。
:::

## EDOT SDKの移行 {#migrating-edot-sdks}

ClickStackのOpenTelemetryベースのSDKと同様に、OpenTelemetry SDKのElasticディストリビューション（EDOT SDK）は、公式のOpenTelemetry SDKのカスタマイズ版です。例えば、[EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/)は、Elastic Observabilityとシームレスに動作するように設計された[OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/)のベンダーカスタマイズ版です。

これらのSDKは標準のOpenTelemetryライブラリに基づいているため、ClickStackへの移行は簡単で、再計測は不要です。設定を調整して、テレメトリデータをClickStackのOpenTelemetry Collectorに向けるだけです。

設定は標準のOpenTelemetryメカニズムに従います。Pythonの場合、これは通常、[OpenTelemetry Zero-Code Instrumentation docs](https://opentelemetry.io/docs/zero-code/python/configuration/)に記載されているように、環境変数を介して行われます。

一般的なEDOT SDKの設定は次のようになります：

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

ClickStackに移行するには、エンドポイントをローカルOTLP Collectorを指すように更新し、認証ヘッダーを変更します：

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>"
```

あなたのインジェスションAPIキーはHyperDXアプリケーションによって生成され、Team Settings → API Keysの下で見つけることができます。

<Image img={ingestion_key} alt="インジェスションキー" size="lg"/>
