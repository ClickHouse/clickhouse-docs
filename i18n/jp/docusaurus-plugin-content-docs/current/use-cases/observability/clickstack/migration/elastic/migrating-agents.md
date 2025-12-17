---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-agents
title: 'Elastic からのエージェントの移行'
pagination_prev: null
pagination_next: null
sidebar_label: 'エージェントの移行'
sidebar_position: 5
description: 'Elastic からのエージェントの移行'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import add_logstash_output from '@site/static/images/use-cases/observability/add-logstash-output.png';
import agent_output_settings from '@site/static/images/use-cases/observability/agent-output-settings.png';
import migrating_agents from '@site/static/images/use-cases/observability/clickstack-migrating-agents.png';


## Elastic からのエージェント移行 {#migrating-agents-from-elastic}

Elastic Stack は、複数の Observability データ収集エージェントを提供しています。具体的には次のとおりです。

- [Beats ファミリー](https://www.elastic.co/beats) — [Filebeat](https://www.elastic.co/beats/filebeat)、[Metricbeat](https://www.elastic.co/beats/metricbeat)、[Packetbeat](https://www.elastic.co/beats/packetbeat) など — は、いずれも `libbeat` ライブラリをベースとしています。これらの Beats は、Lumberjack プロトコル経由で [Elasticsearch、Kafka、Redis、もしくは Logstash へのデータ送信](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output) をサポートします。
- [`Elastic Agent`](https://www.elastic.co/elastic-agent) は、ログ、メトリクス、トレースを収集可能な統合エージェントです。このエージェントは [Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet) 経由で集中管理でき、出力先として Elasticsearch、Logstash、Kafka、または Redis をサポートします。
- Elastic はまた、[OpenTelemetry Collector - EDOT](https://www.elastic.co/docs/reference/opentelemetry) のディストリビューションも提供しています。現在のところ Fleet Server によるオーケストレーションはできませんが、ClickStack へ移行する場合に、より柔軟でオープンな移行パスを提供します。

最適な移行パスは、現在使用しているエージェントに依存します。以降のセクションでは、代表的な各エージェントタイプごとに移行オプションを説明します。本ガイドの目的は、移行時の負担を最小限に抑え、可能な限り移行期間中も既存エージェントを継続利用していただけるようにすることです。

## 推奨される移行パス {#prefered-migration-path}

可能な限り、すべてのログ・メトリクス・トレース収集について [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/) への移行を推奨します。Collector は [エージェントロールでエッジにデプロイ](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) してください。これがデータ送信の最も効率的な方法であり、アーキテクチャの複雑化やデータ変換を避けることができます。

:::note なぜ OpenTelemetry Collector なのか?
OpenTelemetry Collector は、オブザーバビリティデータのインジェストに対して、持続可能かつベンダーニュートラルなソリューションを提供します。組織によっては、数千台、あるいは数万台規模の Elastic Agent 群を運用している場合があることを認識しています。これらのユーザーにとっては、既存のエージェント基盤との互換性を維持することが重要となる場合があります。本ドキュメントは、そのような要件を満たしつつ、チームが徐々に OpenTelemetry ベースの収集へ移行できるよう支援することを目的としています。
:::

## ClickHouse OpenTelemetry エンドポイント {#clickhouse-otel-endpoint}

すべてのデータは **OpenTelemetry (OTel) collector** インスタンスを経由して ClickStack に取り込まれます。このインスタンスが、ログ、メトリクス、トレース、およびセッションデータの主なエントリポイントとして機能します。このインスタンスには、[ClickStack ディストリビューション](/use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector) に含まれる公式 collector を使用することを推奨します（[ClickStack のデプロイメントモデルにすでにバンドルされていない場合](/use-cases/observability/clickstack/deployment)）。

ユーザーは、この collector に対して、[言語 SDKs](/use-cases/observability/clickstack/sdks) から、またはインフラストラクチャのメトリクスとログを収集するデータ収集エージェント（[agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) ロールで動作する OTel collector や、[Fluentd](https://www.fluentd.org/)、[Vector](https://vector.dev/) などの他のテクノロジー）を通じてデータを送信します。

**以降のすべてのエージェント移行手順において、この collector が利用可能であることを前提とします。**

## Beats からの移行 {#migrating-to-beats}

大規模な Beats デプロイメントを運用しているユーザーは、ClickStack への移行時にもそれらを引き続き利用したい場合があります。

**現時点ではこのオプションは Filebeat でのみ検証されており、そのためログ用途にのみ適しています。**

Beats エージェントは [Elastic Common Schema (ECS)](https://www.elastic.co/docs/reference/ecs) を使用します。これは現在、ClickStack が利用する OpenTelemetry 仕様へ[統合されつつあります](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md)。しかしながら、これらの[スキーマには依然として大きな差異があり](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview)、現時点ではユーザー側で ECS 形式のイベントを、ClickStack へのインジェスト前に OpenTelemetry 形式へ変換する必要があります。

この変換は、軽量かつ高パフォーマンスなオブザーバビリティデータパイプラインであり、Vector Remap Language (VRL) と呼ばれる強力な変換言語をサポートする [Vector](https://vector.dev) を用いて実行することを推奨します。 

Filebeat エージェントが、Beats でサポートされている出力先である Kafka へのデータ送信に設定されている場合、Vector は Kafka からそれらのイベントを読み取り、VRL を使用してスキーマ変換を適用し、その後 OTLP 経由で ClickStack に同梱されている OpenTelemetry Collector へ転送できます。

また、Vector は Logstash が使用する Lumberjack プロトコル経由でのイベント受信にも対応しています。これにより、Beats エージェントはデータを直接 Vector に送信でき、同じ変換処理を適用したうえで OTLP 経由で ClickStack の OpenTelemetry Collector に転送することが可能になります。

以下に、これら 2 つのアーキテクチャを示します。

<Image img={migrating_agents} alt="エージェント移行" size="lg" background/>

次の例では、Lumberjack プロトコル経由で Filebeat からのログイベントを受信するように Vector を設定するための初期ステップを示します。受信した ECS イベントを OTel の仕様へマッピングするための VRL を提示し、その後 OTLP 経由で ClickStack の OpenTelemetry Collector に送信します。Kafka からイベントを取り込むユーザーは、Vector の Logstash ソースを [Kafka ソース](https://vector.dev/docs/reference/configuration/sources/kafka/) に置き換えることができます — それ以外の手順はすべて同一です。

<VerticalStepper headerLevel="h3">
  ### vectorのインストール

  [公式インストールガイド](https://vector.dev/docs/setup/installation/)を使用してVectorをインストールします。

  これは、Elastic Stack OTel collectorと同じインスタンスにインストールすることができます。

  [Vectorを本番環境に移行する](https://vector.dev/docs/setup/going-to-prod/)際は、アーキテクチャとセキュリティに関するベストプラクティスに従ってください。

  ### vectorの設定

  VectorをLumberjackプロトコル経由でイベントを受信するように設定し、Logstashインスタンスを模倣します。これは、Vectorの[`logstash`ソース](https://vector.dev/docs/reference/configuration/sources/logstash/)を設定することで実現できます:

  ```yaml
  sources:
    beats:
      type: logstash
      address: 0.0.0.0:5044
      tls:
        enabled: false  # Set to true if you're using TLS
        # The files below are generated from the steps at https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs
        # crt_file: logstash.crt
        # key_file: logstash.key
        # ca_file: ca.crt
        # verify_certificate: true
  ```

  :::note TLS設定
  相互TLSが必要な場合は、Elasticガイド[&quot;Configure SSL/TLS for the Logstash output&quot;](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)を使用して証明書と鍵を生成します。生成した証明書と鍵は、上記の設定例のように指定することができます。
  :::

  イベントはECS形式で受信されます。これらはVector Remap Language（VRL）トランスフォーマーを使用してOpenTelemetryスキーマに変換できます。このトランスフォーマーの設定は簡単で、スクリプトファイルを別ファイルとして保持します:

  ```yaml
  transforms:
    remap_filebeat:
      inputs: ["beats"]
      type: "remap"
      file: 'beat_to_otel.vrl'
  ```

  上記の `beats` ソースからイベントを受信することに注意してください。remapスクリプトを以下に示します。このスクリプトはログイベントでのみテスト済みですが、他の形式の基礎として利用できます。

  <details>
    <summary>VRL - ECS から OTel へのマッピング</summary>

    ```javascript
    # Define keys to ignore at root level
    ignored_keys = ["@metadata"]

    # Define resource key prefixes
    resource_keys = ["host", "cloud", "agent", "service"]

    # Create separate objects for resource and log record fields
    resource_obj = {}
    log_record_obj = {}

    # Copy all non-ignored root keys to appropriate objects
    root_keys = keys(.)
    for_each(root_keys) -> |_index, key| {
        if !includes(ignored_keys, key) {
            val, err = get(., [key])
            if err == null {
                # Check if this is a resource field
                is_resource = false
                if includes(resource_keys, key) {
                    is_resource = true
                }

                # Add to appropriate object
                if is_resource {
                    resource_obj = set(resource_obj, [key], val) ?? resource_obj
                } else {
                    log_record_obj = set(log_record_obj, [key], val) ?? log_record_obj
                }
            }
        }
    }

    # Flatten both objects separately
    flattened_resources = flatten(resource_obj, separator: ".")
    flattened_logs = flatten(log_record_obj, separator: ".")

    # Process resource attributes
    resource_attributes = []
    resource_keys_list = keys(flattened_resources)
    for_each(resource_keys_list) -> |_index, field_key| {
        field_value, err = get(flattened_resources, [field_key])
        if err == null && field_value != null {
            attribute, err = {
                "key": field_key,
                "value": {
                    "stringValue": to_string(field_value)
                }
            }
            if (err == null) {
                resource_attributes = push(resource_attributes, attribute)
            }
        }
    }

    # Process log record attributes
    log_attributes = []
    log_keys_list = keys(flattened_logs)
    for_each(log_keys_list) -> |_index, field_key| {
        field_value, err = get(flattened_logs, [field_key])
        if err == null && field_value != null {
            attribute, err = {
                "key": field_key,
                "value": {
                    "stringValue": to_string(field_value)
                }
            }
            if (err == null) {
                log_attributes = push(log_attributes, attribute)
            }
        }
    }

    # Get timestamp for timeUnixNano (convert to nanoseconds)
    timestamp_nano = if exists(.@timestamp) {
        to_unix_timestamp!(parse_timestamp!(.@timestamp, format: "%Y-%m-%dT%H:%M:%S%.3fZ"), unit: "nanoseconds")
    } else {
        to_unix_timestamp(now(), unit: "nanoseconds")
    }

    # Get message/body field
    body_value = if exists(.message) {
        to_string!(.message)
    } else if exists(.body) {
        to_string!(.body)
    } else {
        ""
    }

    # Create the OpenTelemetry structure
    . = {
        "resourceLogs": [
            {
                "resource": {
                    "attributes": resource_attributes
                },
                "scopeLogs": [
                    {
                        "scope": {},
                        "logRecords": [
                            {
                                "timeUnixNano": to_string(timestamp_nano),
                                "severityNumber": 9,
                                "severityText": "info",
                                "body": {
                                    "stringValue": body_value
                                },
                                "attributes": log_attributes
                            }
                        ]
                    }
                ]
            }
        ]
    }
    ```
  </details>

  最後に、変換されたイベントは、OTLPを介したOpenTelemetryコレクター経由でClickStackに送信できます。これには、`remap_filebeat`変換からイベントを入力として受け取るVectorでのOTLPシンクの設定が必要です。

  ```yaml
  sinks:
    otlp:
      type: opentelemetry
      inputs: [remap_filebeat] # receives events from a remap transform - see below
      protocol:
        type: http  # Use "grpc" for port 4317
        uri: http://localhost:4318/v1/logs # logs endpoint for the OTel collector 
        method: post
        encoding:
          codec: json
        framing:
          method: newline_delimited
        headers:
          content-type: application/json
          authorization: ${YOUR_INGESTION_API_KEY}
  ```

  ここでの`YOUR_INGESTION_API_KEY`はClickStackによって生成されます。このキーはHyperDXアプリの`Team Settings → API Keys`から確認できます。

  <Image img={ingestion_key} alt="インジェストキー" size="lg" />

  最終的な完全な設定を以下に示します：

  ```yaml
  sources:
    beats:
      type: logstash
      address: 0.0.0.0:5044
      tls:
        enabled: false  # Set to true if you're using TLS
          #crt_file: /data/elasticsearch-9.0.1/logstash/logstash.crt
          #key_file: /data/elasticsearch-9.0.1/logstash/logstash.key
          #ca_file: /data/elasticsearch-9.0.1/ca/ca.crt
          #verify_certificate: true

  transforms:
    remap_filebeat:
      inputs: ["beats"]
      type: "remap"
      file: 'beat_to_otel.vrl'

  sinks:
    otlp:
      type: opentelemetry
      inputs: [remap_filebeat]
      protocol:
        type: http  # Use "grpc" for port 4317
        uri: http://localhost:4318/v1/logs
        method: post
        encoding:
          codec: json
        framing:
          method: newline_delimited
        headers:
          content-type: application/json
  ```

  ### Filebeatの設定

  既存のFilebeatインストールは、イベントをVectorに送信するように変更するだけで済みます。これにはLogstash出力の設定が必要です。TLSもオプションで設定可能です:

  ```yaml
  # ------------------------------ Logstash Output -------------------------------
  output.logstash:
    # The Logstash hosts
    hosts: ["localhost:5044"]

    # Optional SSL. By default is off.
    # List of root certificates for HTTPS server verifications
    #ssl.certificate_authorities: ["/etc/pki/root/ca.pem"]

    # Certificate for SSL client authentication
    #ssl.certificate: "/etc/pki/client/cert.pem"

    # Client Certificate Key
    #ssl.key: "/etc/pki/client/cert.key"
  ```
</VerticalStepper>

## Elastic Agent からの移行 {#migrating-from-elastic-agent}

Elastic Agent は、複数の Elastic Beats を 1 つのパッケージに統合したものです。このエージェントは [Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server) と連携し、中央集約的にオーケストレーションおよび設定を行えます。

Elastic Agent をデプロイしているユーザーには、いくつかの移行方法があります。

- エージェントを構成し、Lumberjack プロトコル経由で Vector エンドポイントに送信するようにします。**これは現在、Elastic Agent でログデータのみを収集しているユーザー向けにテストされています。** この方法は Kibana の Fleet UI から一元的に設定できます。
- [エージェントを Elastic OpenTelemetry Collector (EDOT) として実行する](https://www.elastic.co/docs/reference/fleet/otel-agent)。Elastic Agent には EDOT Collector が組み込まれており、アプリケーションとインフラストラクチャを一度計装するだけで、複数のベンダーやバックエンドにデータを送信できます。この構成では、EDOT Collector を設定して、OTLP 経由で ClickStack の OTel collector にイベントを転送するだけで済みます。**このアプローチは、すべてのイベントタイプをサポートします。**

以下で、これら 2 つのオプションについて順に説明します。

### Vector 経由でデータを送信する {#sending-data-via-vector}

<VerticalStepper headerLevel="h4">

#### Vector をインストールして設定する {#install-configure-vector}

Filebeat からの移行時に記載されている[同じ手順](#install-vector)を使用して、Vector をインストールおよび設定します。

#### Elastic Agent を設定する {#configure-elastic-agent}

Elastic Agent は、Logstash プロトコルである Lumberjack 経由でデータを送信するように設定する必要があります。これは[サポートされているデプロイメントパターン](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge)であり、Fleet を使用しないデプロイの場合は、Kibana を用いた中央管理、または[エージェント設定ファイル `elastic-agent.yaml`](https://www.elastic.co/docs/reference/fleet/logstash-output) を直接編集する方法のいずれかで設定できます。

Kibana からの中央設定は、[Fleet に Output を追加](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings)することで行えます。

<Image img={add_logstash_output} alt="Logstash output を追加" size="md"/>

この Output は、その後[エージェントポリシー](https://www.elastic.co/docs/reference/fleet/agent-policy)で使用できます。これにより、そのポリシーを使用しているすべてのエージェントが、自動的に Vector にデータを送信するようになります。

<Image img={agent_output_settings} alt="エージェント設定" size="md"/>

これは TLS を用いたセキュア通信の設定が必要となるため、ガイド「[Configure SSL/TLS for the Logstash output](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)」を参照することを推奨します。このガイドは、自身の Vector インスタンスが Logstash の役割を担う前提で読み進めることができます。

また、Vector 側で Logstash source を相互 TLS 認証を用いるように設定する必要がある点に注意してください。[ガイドで生成したキーと証明書](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs)を使用して、適切に input を構成してください。

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: true  # TLS を使用する場合は true に設定します。
      # 以下のファイルは https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs の手順で生成されます
      crt_file: logstash.crt
      key_file: logstash.key
      ca_file: ca.crt
      verify_certificate: true
```

</VerticalStepper>

### OpenTelemetry collector として Elastic Agent を実行する {#sending-data-via-vector}

Elastic Agent には EDOT Collector が組み込まれており、一度アプリケーションやインフラストラクチャを計装することで、複数のベンダーやバックエンドにデータを送信できます。

:::note Agent のインテグレーションとオーケストレーション
Elastic Agent に同梱されている EDOT Collector を実行しているユーザーは、[Agent が提供する既存のインテグレーション](https://www.elastic.co/docs/reference/fleet/manage-integrations)を活用できません。さらに、Collector は Fleet から集中管理できないため、ユーザーは [Agent をスタンドアロンモード](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents) で実行し、自身で設定を管理する必要があります。
:::

EDOT Collector と共に Elastic Agent を実行するには、[Elastic の公式ガイド](https://www.elastic.co/docs/reference/fleet/otel-agent-transform)を参照してください。ガイドに記載されているように Elastic エンドポイントを設定するのではなく、既存の `exporters` を削除し、OTLP 出力を設定して、データを ClickStack の OpenTelemetry collector に送信します。たとえば、`exporters` の設定は次のようになります。

```yaml
exporters:
  # Elasticsearch Managed OTLP Inputにログとメトリクスを送信するエクスポーター
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: true
```

ここでの `YOUR_INGESTION_API_KEY` は ClickStack によって発行されます。キーは HyperDX アプリの `Team Settings → API Keys` で確認できます。

<Image img={ingestion_key} alt="インジェストキー" size="lg" />

Vector が相互 TLS (mTLS) を使用するように構成されており、証明書および鍵がガイド [&quot;Logstash 出力向けに SSL/TLS を構成する&quot;](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output) の手順に従って生成されている場合は、`otlp` エクスポーターも同様に設定する必要があります。例えば、次のように構成します。

```yaml
exporters:
  # ログとメトリクスをElasticsearch Managed OTLP Inputに送信するエクスポーター
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: false
      ca_file: /path/to/ca.crt
      cert_file: /path/to/client.crt
      key_file: /path/to/client.key
```


## Elastic OpenTelemetry collector からの移行 {#migrating-from-elastic-otel-collector}

すでに[Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry) を利用している場合は、エージェントの設定を変更して、OTLP 経由で ClickStack OpenTelemetry collector に送信するようにするだけで済みます。必要な手順は、上で説明した [Elastic Agent を OpenTelemetry collector として実行する](#run-agent-as-otel) 場合と同じです。このアプローチは、すべての種類のデータに対して利用できます。