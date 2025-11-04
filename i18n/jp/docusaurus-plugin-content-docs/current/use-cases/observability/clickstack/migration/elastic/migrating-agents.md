---
'slug': '/use-cases/observability/clickstack/migration/elastic/migrating-agents'
'title': 'Elasticからエージェントを移行する'
'pagination_prev': null
'pagination_next': null
'sidebar_label': 'エージェントの移行'
'sidebar_position': 5
'description': 'Elasticからエージェントを移行する'
'show_related_blogs': true
'keywords':
- 'ClickStack'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import add_logstash_output from '@site/static/images/use-cases/observability/add-logstash-output.png';
import agent_output_settings from '@site/static/images/use-cases/observability/agent-output-settings.png';
import migrating_agents from '@site/static/images/use-cases/observability/clickstack-migrating-agents.png';

## Elasticからのエージェントの移行 {#migrating-agents-from-elastic}

Elastic Stackは、複数の可観測性データ収集エージェントを提供しています。具体的には：

- [Beatsファミリー](https://www.elastic.co/beats) - [Filebeat](https://www.elastic.co/beats/filebeat)、[Metricbeat](https://www.elastic.co/beats/metricbeat)、および[Packetbeat](https://www.elastic.co/beats/packetbeat)など、すべて`libbeat`ライブラリに基づいています。これらのBeatsは、Lumberjackプロトコルを介して[Elasticsearch、Kafka、Redis、またはLogstashにデータを送信](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output)することをサポートします。
- [`Elastic Agent`](https://www.elastic.co/elastic-agent)は、ログ、メトリック、およびトレースを収集するための統合エージェントを提供します。このエージェントは、[Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet)を介して中央管理可能で、Elasticsearch、Logstash、Kafka、またはRedisへの出力をサポートしています。
- Elasticはまた、[OpenTelemetry Collector - EDOT](https://www.elastic.co/docs/reference/opentelemetry)の配布版を提供しています。現在はFleet Serverによってオーケストレーションできませんが、ClickStackへの移行を考えるユーザーにとって、より柔軟でオープンな道を提供します。

最適な移行パスは、現在使用しているエージェントに依存します。以下のセクションでは、各主要エージェントタイプに対する移行オプションを文書化しています。私たちの目標は、摩擦を最小限に抑え、可能な限りユーザーが移行中も既存のエージェントを引き続き使用できるようにすることです。

## 推奨移行パス {#prefered-migration-path}

可能な限り、すべてのログ、メトリック、トレース収集に[OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/)への移行を推奨し、[エッジのエージェントロールで収集器をデプロイ](#collector-roles)することをお勧めします。これはデータを送信する最も効率的な手段を表し、アーキテクチャの複雑さやデータ変換を避けることができます。

:::note OpenTelemetry Collectorの理由
OpenTelemetry Collectorは、可観測性データの取り込みに対して持続可能でベンダーニュートラルなソリューションを提供します。私たちは、いくつかの組織が数千、あるいは数万のElasticエージェントを運用していることを認識しています。これらのユーザーにとって、既存のエージェントインフラとの互換性を維持することが重要かもしれません。このドキュメントはそれをサポートしつつ、チームが段階的にOpenTelemetryベースの収集に移行するのを助けることを目的としています。
:::

## ClickHouse OpenTelemetryエンドポイント {#clickhouse-otel-endpoint}

すべてのデータは、ログ、メトリック、トレース、セッションデータの主な入り口として機能する**OpenTelemetry (OTel) collector**インスタンスを介してClickStackに取り込まれます。このインスタンスのためには、公式の[ClickStack配布版](https://use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector)を使用することを推奨します。[すでにClickStackのデプロイメントモデルにバンドルされていない限り](https://use-cases/observability/clickstack/deployment)。

ユーザーは、[言語SDK](https://use-cases/observability/clickstack/sdks)から、またはインフラメトリックとログを収集するデータ収集エージェントを介して、この収集器にデータを送信します（OTelコレクターの[エージェント](https://use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)役割や、[Fluentd](https://www.fluentd.org/)や[Vector](https://vector.dev/)などの他の技術を使用することができます）。

**このコレクターはすべてのエージェント移行ステップで利用可能であると仮定します。**

## Beatsからの移行 {#migrating-to-beats}

広範なBeatsデプロイメントを持つユーザーは、ClickStackに移行する際にこれらを保持したいと考えるかもしれません。

**現在、このオプションはFilebeatでのみテストされているため、ログ専用に適しています。**

Beatsエージェントは、現在[OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md)の仕様に統合されつつある[Elastic Common Schema (ECS)](https://www.elastic.co/docs/reference/ecs)を使用します。ただし、これらの[スキーマは依然として著しく異なる](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview)ため、ユーザーはECS形式のイベントをClickStackに取り込む前にOpenTelemetry形式に変換する責任があります。

この変換は、強力な変換言語であるVector Remap Language (VRL)をサポートする軽量で高性能な可観測性データパイプラインである[Vector](https://vector.dev)を使用して行うことを推奨します。

FilebeatエージェントがKafkaにデータを送信するように構成されている場合（Beatsでサポートされている出力）、VectorはKafkaからこれらのイベントを消費し、VRLを使用してスキーマ変換を適用し、OTLPを介してClickStackに付属のOpenTelemetry Collectorに転送できます。

また、VectorはLogstashで使用されるLumberjackプロトコル経由でイベントを受信することもサポートしています。これにより、Beatsエージェントはデータを直接Vectorに送信でき、同じ変換プロセスを適用してからOTLPを介してClickStackのOpenTelemetry Collectorに転送できます。

これらのアーキテクチャの両方を以下に示します。

<Image img={migrating_agents} alt="Migrating agents" size="lg" background/>

以下の例では、Lumberjackプロトコルを介してFilebeatからログイベントを受信するためにVectorを構成する初期ステップを提供します。ECSイベントをOTel仕様にマッピングするためのVRLを提供し、これらをOTLPを介してClickStackのOpenTelemetryコレクターに送信します。Kafkaからイベントを消費するユーザーは、VectorのLogstashソースを[Kafkaソース](https://vector.dev/docs/reference/configuration/sources/kafka/)に置き換えることができ、他のステップは同じままとなります。

<VerticalStepper headerLevel="h3">

### Vectorのインストール {#install-vector}

[公式インストールガイド](https://vector.dev/docs/setup/installation/)を使用してVectorをインストールします。

これは、Elastic Stack OTelコレクターと同じインスタンスにインストールできます。

ユーザーは、[Vectorをプロダクションに移行する際のベストプラクティス](https://vector.dev/docs/setup/going-to-prod/)に従って、アーキテクチャやセキュリティに関して配慮することができます。

### Vectorの構成 {#configure-vector}

Vectorは、Logstashインスタンスを模倣してLumberjackプロトコル経由でイベントを受信するように構成する必要があります。これは、Vectorの[`logstash`ソース](https://vector.dev/docs/reference/configuration/sources/logstash/)を構成することで達成できます。

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

:::note TLS構成
相互TLSが必要な場合は、Elasticガイドの["Logstash出力のSSL/TLSを構成する"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)を使用して証明書とキーを生成します。これらは、上記のように構成で指定できます。
:::

イベントはECS形式で受信されます。これらは、Vector Remap Language (VRL)トランスフォーマーを使用してOpenTelemetryスキーマに変換できます。このトランスフォーマーの構成は簡単で、スクリプトファイルは別のファイルに保持されます。

```yaml
transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: 'beat_to_otel.vrl'
```

上記の`beats`ソースからイベントを受信することを注意してください。我々のリマップスクリプトを以下に示します。このスクリプトはログイベントのみでテストされていますが、他の形式の基盤となることができます。

<details>
<summary>VRL - ECSからOTelへ</summary>

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

最後に、変換されたイベントはOTLPを介してClickStackにOpenTelemetryコレクターに送信できます。これには、Vectorで`remap_filebeat`変換からイベントを取り込むOTLPシンクの構成が必要です。

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

ここでの`YOUR_INGESTION_API_KEY`はClickStackによって生成されます。このキーは、HyperDXアプリの`Team Settings → API Keys`で見つけることができます。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

私たちの最終的な完全な構成は以下に示されています。

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

### Filebeatの構成 {#configure-filebeat}

既存のFilebeatインストールは、単にイベントをVectorに送信するように変更される必要があります。これには、Logstash出力の構成が必要で、再びTLSはオプションで構成できます。

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

## Elastic Agentからの移行 {#migrating-from-elastic-agent}

Elastic Agentは、異なるElastic Beatsを1つのパッケージに統合します。このエージェントは、[Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server)と統合されており、中央集権的にオーケストレーションおよび構成することができます。

Elastic Agentsを展開しているユーザーは、いくつかの移行パスがあります：

- エージェントをLumberjackプロトコル経由でVectorエンドポイントに送信するように構成します。**これは、Elastic Agentでログデータを収集しているユーザーに対してのみテストされています。** これは、KibanaのFleet UIを通じて中央に設定できます。
- [Elastic OpenTelemetry Collector (EDOT)としてエージェントを実行](https://www.elastic.co/docs/reference/fleet/otel-agent)します。Elastic Agentには、アプリケーションとインフラを一度の手間で計器化し、複数のベンダーやバックエンドにデータを送信できる埋め込まれたEDOTコレクターが含まれています。この構成では、ユーザーは単にEDOTコレクターを構成して、OTLPを介してClickStack OTelコレクターにイベントを転送することができます。**このアプローチはすべてのイベントタイプをサポートします。**

これらのオプションの両方を下に示します。

### Vector経由でデータを送信 {#sending-data-via-vector}

<VerticalStepper headerLevel="h4">

#### Vectorのインストールと構成 {#install-configure-vector}

Filebeatからの移行用に文書化された手順と同じ手順を使用して、Vectorをインストールおよび構成します。

#### Elasticエージェントを構成 {#configure-elastic-agent}

Elastic Agentは、LogstashプロトコルLumberjackを介してデータを送信するように構成する必要があります。これは[サポートされているデプロイメントパターン](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge)で、中央に設定するか、[エージェント構成ファイル`elastic-agent.yaml`](https://www.elastic.co/docs/reference/fleet/logstash-output)を通じて設定することができます（Fleetなしで展開する場合）。

Kibanaを通じた中央設定は、[Fleetに出力を追加すること](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings)によって実現できます。

<Image img={add_logstash_output} alt="Add Logstash output" size="md"/>

この出力は、[エージェントポリシー](https://www.elastic.co/docs/reference/fleet/agent-policy)で使用できます。これにより、ポリシーを使用しているすべてのエージェントが自動的にそのデータをVectorに送信することになります。

<Image img={agent_output_settings} alt="Agent settings" size="md"/>

これにはTLSによる安全な通信が必要であるため、ユーザーがそのVectorインスタンスをLogstashの役割として想定していることを前提とした、["Logstash出力のSSL/TLSを構成する"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)ガイドを推奨します。

この設定には、Vector内のLogstashソースも相互TLSを設定する必要があります。ガイドで[生成されたキーと証明書](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs)を使用して、入力を適切に構成してください。

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: true  # Set to true if you're using TLS. 
      # The files below are generated from the steps at https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs
      crt_file: logstash.crt
      key_file: logstash.key
      ca_file: ca.crt
      verify_certificate: true
```

</VerticalStepper>

### ElasticエージェントをOpenTelemetryコレクターとして実行 {#run-agent-as-otel}

Elastic Agentには、アプリケーションとインフラを一度の手間で計器化し、複数のベンダーやバックエンドにデータを送信できる埋め込まれたEDOTコレクターが含まれています。

:::note エージェント統合とオーケストレーション
Elastic Agentに埋め込まれたEDOTコレクターを実行しているユーザーは、[エージェントが提供する既存の統合機能](https://www.elastic.co/docs/reference/fleet/manage-integrations)を利用できません。また、コレクターはFleetによって中央管理できず、ユーザーは[独立モードでエージェントを実行する](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents)ことを余儀なくされ、自ら構成を管理する必要があります。
:::

Elastic AgentをEDOTコレクターで実行するには、[公式Elasticガイド](https://www.elastic.co/docs/reference/fleet/otel-agent-transform)を参照してください。ガイドに示されているようにElasticエンドポイントの構成を行うのではなく、既存の`exporters`を削除し、OTLP出力を構成してClickStack OpenTelemetryコレクターにデータを送信します。たとえば、エクスポーターの構成は次のようになります。

```yaml
exporters:
  # Exporter to send logs and metrics to Elasticsearch Managed OTLP Input
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: true
```

ここでの`YOUR_INGESTION_API_KEY`はClickStackによって生成されます。このキーは、HyperDXアプリの`Team Settings → API Keys`で見つけることができます。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

もしVectorが相互TLSを使用するように構成されており、[ガイドから生成された証明書とキー](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)が使用されている場合、`otlp`エクスポーターは次のように構成される必要があります。

```yaml
exporters:
  # Exporter to send logs and metrics to Elasticsearch Managed OTLP Input
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

## Elastic OpenTelemetryコレクターからの移行 {#migrating-from-elastic-otel-collector}

すでに[Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry)を実行しているユーザーは、エージェントをClickStack OpenTelemetryコレクターにOTLP経由で送信するように単に再構成できます。これに関与する手順は、[Elastic AgentをOpenTelemetryコレクターとして実行するための手順](#run-agent-as-otel)と同じです。このアプローチはすべてのデータタイプで使用できます。
