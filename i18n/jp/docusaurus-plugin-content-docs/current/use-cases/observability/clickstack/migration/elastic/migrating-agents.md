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


## Elasticからのエージェント移行 {#migrating-agents-from-elastic}

Elastic Stackは、複数のObservabilityデータ収集エージェントを提供しています。具体的には以下の通りです：

- [Beatsファミリー](https://www.elastic.co/beats) - [Filebeat](https://www.elastic.co/beats/filebeat)、[Metricbeat](https://www.elastic.co/beats/metricbeat)、[Packetbeat](https://www.elastic.co/beats/packetbeat)など - はすべて`libbeat`ライブラリをベースとしています。これらのBeatsは、Lumberjackプロトコルを介した[Elasticsearch、Kafka、Redis、またはLogstashへのデータ送信](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output)をサポートしています。
- [`Elastic Agent`](https://www.elastic.co/elastic-agent)は、ログ、メトリクス、トレースを収集できる統合エージェントを提供します。このエージェントは[Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet)を介して一元管理でき、Elasticsearch、Logstash、Kafka、またはRedisへの出力をサポートしています。
- Elasticは[OpenTelemetry Collector - EDOT](https://www.elastic.co/docs/reference/opentelemetry)のディストリビューションも提供しています。現在Fleet Serverによるオーケストレーションには対応していませんが、ClickStackへ移行するユーザーにとって、より柔軟でオープンな選択肢となります。

最適な移行パスは、現在使用しているエージェントによって異なります。以降のセクションでは、主要なエージェントタイプごとの移行オプションを説明します。私たちの目標は、移行時の負担を最小限に抑え、可能な限りユーザーが既存のエージェントを使い続けられるようにすることです。


## 推奨される移行パス {#prefered-migration-path}

可能な限り、すべてのログ、メトリック、トレースの収集について[OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/)への移行を推奨します。コレクターは[エッジにエージェントロールとして](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)デプロイしてください。これはデータ送信の最も効率的な手段であり、アーキテクチャの複雑性とデータ変換を回避できます。

:::note なぜOpenTelemetry Collectorなのか？
OpenTelemetry Collectorは、オブザーバビリティデータ取り込みのための持続可能でベンダー中立的なソリューションを提供します。一部の組織では、数千台、あるいは数万台のElasticエージェントを運用していることを認識しています。このようなユーザーにとって、既存のエージェントインフラストラクチャとの互換性を維持することは重要な課題となる可能性があります。本ドキュメントは、これをサポートするとともに、チームがOpenTelemetryベースの収集へ段階的に移行できるよう支援することを目的としています。
:::


## ClickHouse OpenTelemetryエンドポイント {#clickhouse-otel-endpoint}

すべてのデータは**OpenTelemetry（OTel）コレクター**インスタンスを介してClickStackに取り込まれます。このコレクターは、ログ、メトリクス、トレース、セッションデータの主要なエントリーポイントとして機能します。このインスタンスには、[ClickStackデプロイメントモデルにすでにバンドルされていない](/use-cases/observability/clickstack/deployment)場合、公式の[ClickStackディストリビューション](/use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector)のコレクターを使用することを推奨します。

ユーザーは、[言語SDK](/use-cases/observability/clickstack/sdks)から、またはインフラストラクチャのメトリクスとログを収集するデータ収集エージェント（[エージェント](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)ロールのOTelコレクターや、[Fluentd](https://www.fluentd.org/)、[Vector](https://vector.dev/)などの他の技術）を通じて、このコレクターにデータを送信します。

**すべてのエージェント移行手順において、このコレクターが利用可能であることを前提としています**。


## Beatsからの移行 {#migrating-to-beats}

大規模なBeatデプロイメントを運用しているユーザーは、ClickStackへの移行時にこれらを維持することを検討する場合があります。

**現在、このオプションはFilebeatでのみテストされているため、ログのみに適用可能です。**

Beatsエージェントは[Elastic Common Schema (ECS)](https://www.elastic.co/docs/reference/ecs)を使用しており、これは現在ClickStackで使用される[OpenTelemetry仕様への統合が進行中](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md)です。しかし、これらの[スキーマには依然として大きな差異](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview)があり、ClickStackへの取り込み前にECS形式のイベントをOpenTelemetry形式に変換する必要があります。

この変換には[Vector](https://vector.dev)の使用を推奨します。Vectorは軽量で高性能な可観測性データパイプラインであり、Vector Remap Language (VRL)と呼ばれる強力な変換言語をサポートしています。

FilebeatエージェントがKafkaへのデータ送信を設定している場合（Beatsがサポートする出力先）、VectorはKafkaからこれらのイベントを取得し、VRLを使用してスキーマ変換を適用した後、OTLPを介してClickStackに付属するOpenTelemetry Collectorに転送できます。

また、VectorはLogstashで使用されるLumberjackプロトコルを介したイベント受信もサポートしています。これにより、BeatsエージェントはVectorに直接データを送信でき、OTLPを介してClickStack OpenTelemetry Collectorに転送する前に同じ変換処理を適用できます。

以下に、これら両方のアーキテクチャを図示します。

<Image img={migrating_agents} alt='エージェントの移行' size='lg' background />

以下の例では、Lumberjackプロトコルを介してFilebeatからログイベントを受信するようにVectorを設定する初期手順を示します。受信したECSイベントをOTel仕様にマッピングするVRLを提供し、OTLPを介してClickStack OpenTelemetry Collectorに送信します。Kafkaからイベントを取得するユーザーは、Vector Logstashソースを[Kafkaソース](https://vector.dev/docs/reference/configuration/sources/kafka/)に置き換えることができます。その他の手順はすべて同じです。

<VerticalStepper headerLevel="h3">

### Vectorのインストール {#install-vector}

[公式インストールガイド](https://vector.dev/docs/setup/installation/)を使用してVectorをインストールします。

これはElastic Stack OTel Collectorと同じインスタンスにインストールできます。

[Vectorを本番環境に移行](https://vector.dev/docs/setup/going-to-prod/)する際は、アーキテクチャとセキュリティに関するベストプラクティスに従うことができます。

### Vectorの設定 {#configure-vector}

VectorはLogstashインスタンスを模倣して、Lumberjackプロトコルを介してイベントを受信するように設定する必要があります。これは、Vectorに[`logstash`ソース](https://vector.dev/docs/reference/configuration/sources/logstash/)を設定することで実現できます：

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: false # TLSを使用する場合はtrueに設定
      # 以下のファイルは https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs の手順から生成されます
      # crt_file: logstash.crt
      # key_file: logstash.key
      # ca_file: ca.crt
      # verify_certificate: true
```

:::note TLS設定
相互TLSが必要な場合は、Elasticガイド[「Logstash出力のSSL/TLS設定」](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)を使用して証明書と鍵を生成します。これらは上記のように設定で指定できます。
:::

イベントはECS形式で受信されます。これらはVector Remap Language (VRL)トランスフォーマーを使用してOpenTelemetryスキーマに変換できます。このトランスフォーマーの設定はシンプルで、スクリプトファイルは別ファイルに保持されます：

```yaml
transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: "beat_to_otel.vrl"
```

上記の`beats`ソースからイベントを受信することに注意してください。リマップスクリプトを以下に示します。このスクリプトはログイベントでのみテストされていますが、他の形式の基礎として使用できます。

<details>
<summary>VRL - ECSからOTelへ</summary>


```javascript
# ルートレベルで無視するキーを定義
ignored_keys = ["@metadata"]
```


# リソースキーの接頭辞を定義する
resource_keys = ["host", "cloud", "agent", "service"]



# リソースフィールドとログレコードフィールド用に別々のオブジェクトを作成する
resource_obj = {}
log_record_obj = {}



# 無視されないすべてのルートキーを適切なオブジェクトにコピー

root_keys = keys(.)
for_each(root_keys) -> |\_index, key| {
if !includes(ignored_keys, key) {
val, err = get(., [key])
if err == null { # リソースフィールドかどうかを確認
is_resource = false
if includes(resource_keys, key) {
is_resource = true
}

            # 適切なオブジェクトに追加
            if is_resource {
                resource_obj = set(resource_obj, [key], val) ?? resource_obj
            } else {
                log_record_obj = set(log_record_obj, [key], val) ?? log_record_obj
            }
        }
    }

}


# 両方のオブジェクトをそれぞれフラット化する
flattened_resources = flatten(resource_obj, separator: ".")
flattened_logs = flatten(log_record_obj, separator: ".")



# リソース属性を処理

resource_attributes = []
resource_keys_list = keys(flattened_resources)
for_each(resource_keys_list) -> |\_index, field_key| {
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


# ログレコード属性を処理

log_attributes = []
log_keys_list = keys(flattened_logs)
for_each(log_keys_list) -> |\_index, field_key| {
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


# timeUnixNano用のタイムスタンプを取得(ナノ秒に変換)

timestamp_nano = if exists(.@timestamp) {
to_unix_timestamp!(parse_timestamp!(.@timestamp, format: "%Y-%m-%dT%H:%M:%S%.3fZ"), unit: "nanoseconds")
} else {
to_unix_timestamp(now(), unit: "nanoseconds")
}


# message/bodyフィールドの取得

body_value = if exists(.message) {
to_string!(.message)
} else if exists(.body) {
to_string!(.body)
} else {
""
}


# OpenTelemetry構造の作成

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

````

</details>

最後に、変換されたイベントはOTLP経由でOpenTelemetryコレクターを介してClickStackに送信できます。これには、`remap_filebeat`トランスフォームからイベントを入力として受け取るVectorのOTLPシンクの設定が必要です:

```yaml
sinks:
  otlp:
    type: opentelemetry
    inputs: [remap_filebeat] # remapトランスフォームからイベントを受信 - 以下を参照
    protocol:
      type: http  # ポート4317の場合は"grpc"を使用
      uri: http://localhost:4318/v1/logs # OTelコレクターのログエンドポイント
      method: post
      encoding:
        codec: json
      framing:
        method: newline_delimited
      headers:
        content-type: application/json
        authorization: ${YOUR_INGESTION_API_KEY}
````

ここでの`YOUR_INGESTION_API_KEY`はClickStackによって生成されます。このキーは、HyperDXアプリの`Team Settings → API Keys`で確認できます。

<Image img={ingestion_key} alt='インジェスチョンキー' size='lg' />

最終的な完全な設定を以下に示します:

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled:
        false # TLSを使用する場合はtrueに設定
        #crt_file: /data/elasticsearch-9.0.1/logstash/logstash.crt
        #key_file: /data/elasticsearch-9.0.1/logstash/logstash.key
        #ca_file: /data/elasticsearch-9.0.1/ca/ca.crt
        #verify_certificate: true

transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: "beat_to_otel.vrl"

sinks:
  otlp:
    type: opentelemetry
    inputs: [remap_filebeat]
    protocol:
      type: http # ポート4317の場合は"grpc"を使用
      uri: http://localhost:4318/v1/logs
      method: post
      encoding:
        codec: json
      framing:
        method: newline_delimited
      headers:
        content-type: application/json
```

### Filebeatの設定 {#configure-filebeat}

既存のFilebeatインストールは、イベントをVectorに送信するように変更するだけで済みます。これには、Logstash出力の設定が必要です - TLSはオプションで設定できます:


```yaml
# ------------------------------ Logstash出力 -------------------------------
output.logstash:
  # Logstashホスト
  hosts: ["localhost:5044"]

  # オプションのSSL。デフォルトではオフです。
  # HTTPSサーバー検証用のルート証明書のリスト
  #ssl.certificate_authorities: ["/etc/pki/root/ca.pem"]

  # SSLクライアント認証用の証明書
  #ssl.certificate: "/etc/pki/client/cert.pem"

  # クライアント証明書の鍵
  #ssl.key: "/etc/pki/client/cert.key"
```

</VerticalStepper>


## Elastic Agentからの移行 {#migrating-from-elastic-agent}

Elastic Agentは、複数のElastic Beatsを単一のパッケージに統合したものです。このエージェントは[Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server)と統合されており、中央集約的なオーケストレーションと設定が可能です。

Elastic Agentを導入しているユーザーには、以下のような移行パスがあります:

- Lumberjackプロトコルを使用してVectorエンドポイントにデータを送信するようにエージェントを設定します。**現在、この方法はElastic Agentでログデータを収集しているユーザーに対してのみテストされています。** KibanaのFleet UIから中央集約的に設定できます。
- [Elastic OpenTelemetry Collector (EDOT)としてエージェントを実行します](https://www.elastic.co/docs/reference/fleet/otel-agent)。Elastic Agentには組み込みのEDOT Collectorが含まれており、アプリケーションとインフラストラクチャを一度計装するだけで、複数のベンダーやバックエンドにデータを送信できます。この構成では、EDOT CollectorをOTLP経由でClickStack OTel Collectorにイベントを転送するように設定するだけです。**この方法はすべてのイベントタイプをサポートします。**

以下では、これら両方のオプションについて説明します。

### Vector経由でのデータ送信 {#sending-data-via-vector}

<VerticalStepper headerLevel="h4">

#### Vectorのインストールと設定 {#install-configure-vector}

Filebeatからの移行で説明されている[同じ手順](#install-vector)を使用してVectorをインストールおよび設定します。

#### Elastic Agentの設定 {#configure-elastic-agent}

Elastic AgentはLogstashプロトコルのLumberjack経由でデータを送信するように設定する必要があります。これは[サポートされているデプロイメントパターン](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge)であり、中央集約的に設定するか、Fleetを使用しない場合は[エージェント設定ファイル`elastic-agent.yaml`経由](https://www.elastic.co/docs/reference/fleet/logstash-output)で設定できます。

Kibanaを通じた中央集約設定は、[FleetにOutputを追加する](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings)ことで実現できます。

<Image img={add_logstash_output} alt='Add Logstash output' size='md' />

このOutputは[エージェントポリシー](https://www.elastic.co/docs/reference/fleet/agent-policy)で使用できます。このポリシーを使用するすべてのエージェントが自動的にVectorにデータを送信するようになります。

<Image img={agent_output_settings} alt='Agent settings' size='md' />

TLS経由のセキュアな通信の設定が必要なため、ガイド["Configure SSL/TLS for the Logstash output"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)に従うことをお勧めします。このガイドは、VectorインスタンスがLogstashの役割を担うと想定して進めることができます。

なお、VectorのLogstashソースも相互TLSを使用するように設定する必要があります。[ガイドで生成された](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs)鍵と証明書を使用して、入力を適切に設定してください。

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: true # TLSを使用する場合はtrueに設定します。
      # 以下のファイルは https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs の手順から生成されます
      crt_file: logstash.crt
      key_file: logstash.key
      ca_file: ca.crt
      verify_certificate: true
```

</VerticalStepper>

### Elastic AgentをOpenTelemetry Collectorとして実行 {#run-agent-as-otel}

Elastic Agentには組み込みのEDOT Collectorが含まれており、アプリケーションとインフラストラクチャを一度計装するだけで、複数のベンダーやバックエンドにデータを送信できます。

:::note エージェント統合とオーケストレーション
Elastic Agentに付属するEDOT Collectorを実行しているユーザーは、[エージェントが提供する既存の統合](https://www.elastic.co/docs/reference/fleet/manage-integrations)を利用できません。また、CollectorはFleetによって中央集約管理できないため、ユーザーは[スタンドアロンモードでエージェントを実行](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents)し、設定を自分で管理する必要があります。
:::

Elastic AgentをEDOT Collectorで実行するには、[公式Elasticガイド](https://www.elastic.co/docs/reference/fleet/otel-agent-transform)を参照してください。ガイドに示されているElasticエンドポイントを設定する代わりに、既存の`exporters`を削除し、OTLP出力を設定してClickStack OpenTelemetry Collectorにデータを送信します。例えば、exportersの設定は次のようになります:

```yaml
exporters:
  # ログとメトリクスをElasticsearch Managed OTLP Inputに送信するためのExporter
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: true
```


ここでの `YOUR_INGESTION_API_KEY` は ClickStack によって生成されます。キーは HyperDX アプリの `Team Settings → API Keys` から確認できます。

<Image img={ingestion_key} alt="Ingestion keys" size="lg" />

Vector で相互 TLS を使用するように設定しており、証明書とキーを [&quot;Configure SSL/TLS for the Logstash output&quot;](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output) ガイドの手順に従って生成している場合は、`otlp` エクスポーター側もそれに合わせて設定する必要があります。例えば、次のようにします。

```yaml
exporters:
  # Elasticsearch Managed OTLP Inputにログとメトリクスを送信するエクスポーター
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

既に[Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry)を実行しているユーザーは、エージェントを再設定してOTLP経由でClickStack OpenTelemetryコレクターにデータを送信するだけで移行できます。手順は、上記の[Elastic AgentをOpenTelemetryコレクターとして実行する](#run-agent-as-otel)場合と同じです。このアプローチは、すべてのデータタイプで利用可能です。
