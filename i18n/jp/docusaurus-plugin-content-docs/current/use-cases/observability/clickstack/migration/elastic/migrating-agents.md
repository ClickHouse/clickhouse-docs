---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-agents
title: 'Elastic からのエージェント移行'
pagination_prev: null
pagination_next: null
sidebar_label: 'エージェントの移行'
sidebar_position: 5
description: 'Elastic からのエージェント移行'
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

Elastic Stack は、複数の可観測性データ収集エージェントを提供しています。具体的には次のとおりです。

- [Beats ファミリー](https://www.elastic.co/beats) — [Filebeat](https://www.elastic.co/beats/filebeat)、[Metricbeat](https://www.elastic.co/beats/metricbeat)、[Packetbeat](https://www.elastic.co/beats/packetbeat) など — は、すべて `libbeat` ライブラリをベースとしています。これらの Beats は、Lumberjack プロトコル経由で [Elasticsearch、Kafka、Redis、または Logstash へのデータ送信](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output) をサポートします。
- [`Elastic Agent`](https://www.elastic.co/elastic-agent) は、ログ、メトリクス、トレースを収集可能な統合エージェントです。このエージェントは [Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet) を通じて集中管理でき、Elasticsearch、Logstash、Kafka、または Redis への出力をサポートします。
- Elastic は [OpenTelemetry Collector - EDOT](https://www.elastic.co/docs/reference/opentelemetry) のディストリビューションも提供しています。現時点では Fleet Server によるオーケストレーションはできませんが、ClickStack への移行を検討しているユーザーにとって、より柔軟でオープンな移行経路を提供します。

最適な移行パスは、現在使用しているエージェントによって異なります。以下のセクションでは、主要な各エージェントタイプごとに移行オプションを説明します。ここでの目標は、移行時の負担を最小限に抑え、可能な限り移行期間中も既存のエージェントを継続利用できるようにすることです。



## 推奨される移行パス {#prefered-migration-path}

可能な限り、すべてのログ、メトリクス、トレースの収集には [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/) を利用し、Collector を [エッジにおけるエージェントロール](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) としてデプロイすることを推奨します。これはデータを送信するうえで最も効率的な方法であり、アーキテクチャの複雑化やデータ変換の必要性を避けることができます。

:::note なぜ OpenTelemetry Collector なのか？
OpenTelemetry Collector は、可観測性データのインジェストに対して持続可能でベンダーニュートラルなソリューションを提供します。多くの組織が、数千台、場合によっては数万台規模の Elastic エージェント群を運用していることを認識しています。これらのユーザーにとっては、既存のエージェントインフラストラクチャとの互換性を維持することが重要となり得ます。本ドキュメントは、そのようなニーズをサポートすると同時に、チームが段階的に OpenTelemetry ベースの収集へ移行できるよう支援することを目的としています。
:::



## ClickHouse OpenTelemetry エンドポイント {#clickhouse-otel-endpoint}

すべてのデータは、ログ、メトリクス、トレース、セッションデータの主要なエントリポイントとして機能する **OpenTelemetry (OTel) collector** インスタンス経由で ClickStack に取り込まれます。このインスタンスには、[ClickStack ディストリビューションの公式 collector](/use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector) を使用することを推奨します（[ClickStack のデプロイメントモデルにすでにバンドルされていない場合](/use-cases/observability/clickstack/deployment)）。

ユーザーは、この collector に対して、[各言語向け SDK](/use-cases/observability/clickstack/sdks) から、またはインフラストラクチャのメトリクスとログを収集するデータ収集エージェントを通じてデータを送信します（[エージェント](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) ロールで動作する OTel collector や、[Fluentd](https://www.fluentd.org/) や [Vector](https://vector.dev/) などのその他の技術）。

**エージェント移行のすべてのステップにおいて、この collector が利用可能であることを前提とします。**



## Beatsからの移行 {#migrating-to-beats}

大規模なBeatデプロイメントを運用しているユーザーは、ClickStackへの移行時にこれらを保持したい場合があります。

**現在、このオプションはFilebeatでのみテストされているため、ログのみに適用可能です。**

Beatsエージェントは[Elastic Common Schema (ECS)](https://www.elastic.co/docs/reference/ecs)を使用しており、これは現在ClickStackで使用される[OpenTelemetry仕様への統合が進行中](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md)です。しかし、これらの[スキーマには依然として大きな違い](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview)があり、ClickStackへインジェストする前に、ECS形式のイベントをOpenTelemetry形式に変換する必要があります。

この変換には[Vector](https://vector.dev)の使用を推奨します。Vectorは軽量で高性能なオブザーバビリティデータパイプラインであり、Vector Remap Language (VRL)と呼ばれる強力な変換言語をサポートしています。

FilebeatエージェントがKafkaにデータを送信するように構成されている場合（Beatsがサポートする出力形式）、VectorはKafkaからこれらのイベントを取得し、VRLを使用してスキーマ変換を適用した後、OTLPを介してClickStackに付属するOpenTelemetry Collectorに転送できます。

あるいは、VectorはLogstashで使用されるLumberjackプロトコルを介したイベントの受信もサポートしています。これにより、BeatsエージェントはVectorに直接データを送信でき、OTLPを介してClickStack OpenTelemetry Collectorに転送する前に同じ変換プロセスを適用できます。

以下に、これら両方のアーキテクチャを図示します。

<Image img={migrating_agents} alt='エージェントの移行' size='lg' background />

以下の例では、Lumberjackプロトコルを介してFilebeatからログイベントを受信するようにVectorを構成する初期手順を示します。受信したECSイベントをOTel仕様にマッピングするためのVRLを提供し、その後OTLPを介してClickStack OpenTelemetry collectorに送信します。Kafkaからイベントを取得するユーザーは、Vector Logstashソースを[Kafkaソース](https://vector.dev/docs/reference/configuration/sources/kafka/)に置き換えることができます。その他の手順はすべて同じです。

<VerticalStepper headerLevel="h3">

### Vectorのインストール {#install-vector}

[公式インストールガイド](https://vector.dev/docs/setup/installation/)を使用してVectorをインストールします。

Elastic Stack OTel collectorと同じインスタンスにインストールできます。

[Vectorを本番環境に移行](https://vector.dev/docs/setup/going-to-prod/)する際は、アーキテクチャとセキュリティに関するベストプラクティスに従ってください。

### Vectorの構成 {#configure-vector}

VectorはLogstashインスタンスを模倣し、Lumberjackプロトコルを介してイベントを受信するように構成する必要があります。これは、Vectorに[`logstash`ソース](https://vector.dev/docs/reference/configuration/sources/logstash/)を構成することで実現できます。

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: false # TLSを使用している場合はtrueに設定
      # 以下のファイルは https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs の手順から生成されます
      # crt_file: logstash.crt
      # key_file: logstash.key
      # ca_file: ca.crt
      # verify_certificate: true
```

:::note TLS構成
相互TLSが必要な場合は、Elasticガイド["Configure SSL/TLS for the Logstash output"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)を使用して証明書とキーを生成します。これらは上記のように構成で指定できます。
:::

イベントはECS形式で受信されます。これらは、Vector Remap Language (VRL)トランスフォーマーを使用してOpenTelemetryスキーマに変換できます。このトランスフォーマーの構成はシンプルで、スクリプトファイルは別ファイルに保持されます。

```yaml
transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: "beat_to_otel.vrl"
```

上記の`beats`ソースからイベントを受信することに注意してください。リマップスクリプトを以下に示します。このスクリプトはログイベントでのみテストされていますが、他の形式の基礎となることができます。

<details>
<summary>VRL - ECSからOTelへ</summary>


```javascript
# ルートレベルで無視するキーを定義
ignored_keys = ["@metadata"]
```


# リソースキーのプレフィックスを定義する
resource_keys = ["host", "cloud", "agent", "service"]



# リソースフィールド用とログレコードフィールド用に別々のオブジェクトを作成する
resource_obj = {}
log_record_obj = {}



# Copy all non-ignored root keys to appropriate objects

root_keys = keys(.)
for_each(root_keys) -> |\_index, key| {
if !includes(ignored_keys, key) {
val, err = get(., [key])
if err == null { # Check if this is a resource field
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


# 両方のオブジェクトをそれぞれ個別にフラット化する
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


# ログレコード属性を処理する

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


# timeUnixNano用のタイムスタンプを取得（ナノ秒に変換）

timestamp_nano = if exists(.@timestamp) {
to_unix_timestamp!(parse_timestamp!(.@timestamp, format: "%Y-%m-%dT%H:%M:%S%.3fZ"), unit: "nanoseconds")
} else {
to_unix_timestamp(now(), unit: "nanoseconds")
}


# message/body フィールドを取得する

body_value = if exists(.message) {
to_string!(.message)
} else if exists(.body) {
to_string!(.body)
} else {
""
}


# OpenTelemetry構造を作成する

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

最後に、変換されたイベントはOTLP経由でOTel collectorを通じてClickStackに送信できます。これには、`remap_filebeat`変換からイベントを入力として受け取るOTLPシンクをVectorで設定する必要があります。

```yaml
sinks:
  otlp:
    type: opentelemetry
    inputs: [remap_filebeat] # remap変換からイベントを受信 - 以下を参照
    protocol:
      type: http  # ポート4317を使用する場合は"grpc"を指定
      uri: http://localhost:4318/v1/logs # OTel collectorのログエンドポイント
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

<Image img={ingestion_key} alt='インジェストキー' size='lg' />

最終的な完全な設定を以下に示します。

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
      type: http # ポート4317を使用する場合は"grpc"を指定
      uri: http://localhost:4318/v1/logs
      method: post
      encoding:
        codec: json
      framing:
        method: newline_delimited
      headers:
        content-type: application/json
```

### Filebeatを設定する {#configure-filebeat}

既存のFilebeatインストールは、イベントをVectorに送信するように変更するだけで済みます。これにはLogstash出力の設定が必要です。ここでも、TLSはオプションで設定できます。


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


## Elastic Agent からの移行

Elastic Agent は、さまざまな Elastic Beats を 1 つのパッケージに統合したものです。このエージェントは [Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server) と統合されており、集中管理によるオーケストレーションと設定が可能です。

Elastic Agent をデプロイ済みのユーザーには、複数の移行パスがあります。

* Agent を構成して、Lumberjack プロトコル経由で Vector エンドポイントに送信するようにします。**これは現在のところ、Elastic Agent でログデータのみを収集しているユーザーを対象としてテストされています。** これは Kibana の Fleet UI から集中管理で設定できます。
* [Elastic OpenTelemetry Collector (EDOT) として agent を実行する](https://www.elastic.co/docs/reference/fleet/otel-agent)。Elastic Agent には EDOT Collector が組み込まれており、アプリケーションとインフラストラクチャを一度計測するだけで、複数のベンダーやバックエンドにデータを送信できます。この構成では、ユーザーは単に EDOT collector を構成し、OTLP 経由で ClickStack の OTel collector にイベントをフォワードするようにします。**このアプローチはすべてのイベントタイプをサポートします。**

以下では、これら 2 つのオプションをどちらも示します。

### Vector 経由でデータを送信する

<VerticalStepper headerLevel="h4">
  #### Vector のインストールと設定

  Filebeat からの移行で説明したものと[同じ手順](#install-vector)を用いて Vector をインストールおよび設定します。

  #### Elastic Agent の設定

  Elastic Agent は、Logstash プロトコルである Lumberjack を介してデータを送信するように構成する必要があります。これは [サポートされているデプロイパターン](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge) であり、集中管理で構成するか、Fleet を使用しないデプロイの場合は [agent の設定ファイル `elastic-agent.yaml` で構成](https://www.elastic.co/docs/reference/fleet/logstash-output) できます。

  Kibana からの集中設定は、[Fleet に Output を追加](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings) することで実現できます。

  <Image img={add_logstash_output} alt="Logstash 出力の追加" size="md" />

  この Output は、その後 [agent ポリシー](https://www.elastic.co/docs/reference/fleet/agent-policy) で使用できます。これにより、そのポリシーを使用しているすべての agent が、自動的にデータを Vector に送信するようになります。

  <Image img={agent_output_settings} alt="Agent 設定" size="md" />

  これは TLS によるセキュアな通信の設定が必要となるため、「[Logstash 出力に対して SSL/TLS を構成する](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)」ガイドに従うことを推奨します。このガイドでは、Vector インスタンスが Logstash の役割を担うことを前提として手順を進められます。

  また、Vector 側でも Logstash ソースを相互 TLS で構成する必要がある点に注意してください。[ガイドで生成した鍵と証明書](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs) を使用して、入力を適切に構成します。

  ```yaml
  sources:
    beats:
      type: logstash
      address: 0.0.0.0:5044
      tls:
        enabled: true  # TLS を使用する場合は true に設定します。
        # 以下のファイルは、https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs の手順で生成されます
        crt_file: logstash.crt
        key_file: logstash.key
        ca_file: ca.crt
        verify_certificate: true
  ```
</VerticalStepper>

### Elastic Agent を OpenTelemetry collector として実行する

Elastic Agent には EDOT Collector が組み込まれており、アプリケーションとインフラストラクチャを一度計測するだけで、複数のベンダーやバックエンドにデータを送信できます。

:::note Agent のインテグレーションとオーケストレーション
Elastic Agent に同梱されている EDOT collector を実行しているユーザーは、[Agent が提供する既存のインテグレーション](https://www.elastic.co/docs/reference/fleet/manage-integrations) を活用することはできません。さらに、collector は Fleet による集中管理ができないため、ユーザーは [Agent をスタンドアロンモードで実行](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents) し、自身で設定を管理する必要があります。
:::

Elastic Agent を EDOT collector とともに実行する方法については、[Elastic 公式ガイド](https://www.elastic.co/docs/reference/fleet/otel-agent-transform) を参照してください。このガイドに記載されているように Elastic エンドポイントを構成するのではなく、既存の `exporters` を削除し、OTLP 出力を構成して ClickStack の OpenTelemetry collector にデータを送信するようにします。たとえば、exporters の設定は次のようになります。

```yaml
exporters:
  # ElasticsearchマネージドOTLP入力にログとメトリクスを送信するエクスポーター
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: true
```


ここでの `YOUR_INGESTION_API_KEY` は ClickStack によって生成されます。HyperDX アプリの `Team Settings → API Keys` からこのキーを確認できます。

<Image img={ingestion_key} alt="Ingestion keys" size="lg" />

Vector が、ガイド [&quot;Configure SSL/TLS for the Logstash output&quot;](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output) の手順に従って生成した証明書と秘密鍵を用いた相互 TLS を使用するよう構成されている場合、`otlp` エクスポーターもそれに応じて設定する必要があります。例えば、次のように設定します。

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


## Elastic OpenTelemetry collector からの移行 {#migrating-from-elastic-otel-collector}

すでに [Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry) を実行しているユーザーは、エージェントを再設定して OTLP 経由で ClickStack の OpenTelemetry collector に送信するようにするだけで済みます。実施する手順は、[Elastic Agent を OpenTelemetry collector として実行する](#run-agent-as-otel) 場合に前述した内容と同一です。この方法は、すべてのデータ種別に対して利用できます。
