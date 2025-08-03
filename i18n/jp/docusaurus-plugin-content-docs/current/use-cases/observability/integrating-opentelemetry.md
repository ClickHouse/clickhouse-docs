---
title: 'Integrating OpenTelemetry'
description: 'Integrating OpenTelemetry and ClickHouse for observability'
slug: '/observability/integrating-opentelemetry'
keywords:
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';
import Image from '@theme/IdealImage';



# OpenTelemetryを統合してデータ収集を行う

任意の可観測性ソリューションには、ログやトレースを収集し、エクスポートする手段が必要です。そのため、ClickHouseでは[OpenTelemetry (OTel)プロジェクト](https://opentelemetry.io/)を推奨しています。

"OpenTelemetryは、トレース、メトリクス、ログなどのテレメトリデータを生成および管理するために設計された可観測性フレームワークおよびツールキットです。"

ClickHouseやPrometheusとは異なり、OpenTelemetryは可観測性バックエンドではなく、テレメトリデータの生成、収集、管理、およびエクスポートに焦点を当てています。OpenTelemetryの初期の目的は、ユーザーが言語固有のSDKを使用してアプリケーションやシステムを容易に計測できるようにすることでしたが、OpenTelemetryコレクターを介したログの収集も含むように拡張されています。これは、テレメトリデータを受信、処理、およびエクスポートするエージェントまたはプロキシです。

## ClickHouse関連コンポーネント {#clickhouse-relevant-components}

OpenTelemetryは、いくつかのコンポーネントで構成されています。データおよびAPI仕様、標準化されたプロトコル、およびフィールド/カラムの命名規則を提供するだけでなく、OTelはClickHouseでの可観測性ソリューションを構築するために基本となる2つの機能を提供します：

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)は、テレメトリデータを受信、処理、およびエクスポートするプロキシです。ClickHouseを使用したソリューションでは、このコンポーネントを使用して、ログの収集とバッチ処理および挿入前のイベント処理を行います。
- [Language SDKs](https://opentelemetry.io/docs/languages/)は、仕様、API、およびテレメトリデータのエクスポートを実装しています。これらのSDKは、アプリケーションのコード内でトレースが正しく記録されることを効果的に保証し、構成要素スパンを生成し、メタデータを介してサービス間でコンテキストが伝播することを保証します。これにより、分散トレースが形成され、スパンが相関できるようになります。これらのSDKは、共通のライブラリやフレームワークを自動的に実装するエコシステムによって補完されるため、ユーザーはコードを変更する必要がなく、すぐに計測を取得できます。

ClickHouseを使用した可観測性ソリューションは、これらの2つのツールを活用します。

## ディストリビューション {#distributions}

OpenTelemetryコレクターには、[いくつかのディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)があります。ClickHouseソリューションに必要なファイルログレシーバーとClickHouseエクスポーターは、[OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)にのみ存在します。

このディストリビューションには多くのコンポーネントが含まれており、ユーザーはさまざまな構成を試すことができます。ただし、生産環境で実行する際は、コレクターに必要なコンポーネントのみを含めるように制限することを推奨します。これを行う理由のいくつかは次のとおりです：

- コレクターのサイズを削減し、コレクターの展開時間を短縮します。
- 利用可能な攻撃面を減少させることで、コレクターのセキュリティを向上させます。

[カスタムコレクター](https://opentelemetry.io/docs/collector/custom-collector/)を構築するには、[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)を使用できます。

## OTelでのデータの取り込み {#ingesting-data-with-otel}
### コレクターのデプロイ役割 {#collector-deployment-roles}

ログを収集し、ClickHouseに挿入するために、OpenTelemetry Collectorの使用を推奨します。OpenTelemetry Collectorは、以下の2つの主要な役割でデプロイできます：

- **エージェント** - エージェントインスタンスは、サーバーやKubernetesノードなどのエッジでデータを収集したり、OpenTelemetry SDKを使用して計測したアプリケーションから直接イベントを受信したりします。この場合、エージェントインスタンスはアプリケーションと一緒に（サイドカーやDaemonSetとして）またはアプリケーションと同じホスト上で実行されます。エージェントは、データを直接ClickHouseに送信するか、ゲートウェイインスタンスに送信することができます。前者は、[エージェントデプロイメントパターン](https://opentelemetry.io/docs/collector/deployment/agent/)と呼ばれています。
- **ゲートウェイ**  - ゲートウェイインスタンスは、通常、クラスター、データセンター、またはリージョンごとにスタンドアロンサービスを提供します。これらは、単一のOTLPエンドポイントを介してアプリケーション（または他のコレクターをエージェントとして）からイベントを受信します。通常、一連のゲートウェイインスタンスがデプロイされ、負荷分散用にアウトオブボックスのロードバランサーが使用されます。すべてのエージェントとアプリケーションがこの単一のエンドポイントに信号を送信する場合、これは一般に[ゲートウェイデプロイメントパターン](https://opentelemetry.io/docs/collector/deployment/gateway/)と呼ばれます。

以下では、単純なエージェントコレクターがそのイベントをClickHouseに直接送信することを前提としています。ゲートウェイを使用する際の詳細については[スケーリングゲートウェイ](#scaling-with-gateways)を参照してください。

### ログの収集 {#collecting-logs}

コレクターを使用する主な利点は、サービスがデータを迅速にオフロードでき、コレクターがリトライ、バッチ処理、暗号化、またはセンシティブデータフィルタリングなどの追加処理を担当できることです。

コレクターでは、[receiver](https://opentelemetry.io/docs/collector/configuration/#receivers)、[processor](https://opentelemetry.io/docs/collector/configuration/#processors)、[exporter](https://opentelemetry.io/docs/collector/configuration/#exporters)の3つの主要な処理段階の用語を使用しています。レシーバーはデータ収集に使用され、プルまたはプッシュベースできます。プロセッサーはメッセージの変換や強化を行うことができます。エクスポーターは、データを下流サービスに送信する責任を負います。このサービスは理論的には別のコレクターでも可能ですが、以下の初期の議論ではすべてのデータが直接ClickHouseに送信されると仮定しています。

<Image img={observability_3} alt="ログの収集" size="md"/>

ユーザーには、利用可能な完全なレシーバー、プロセッサー、およびエクスポーターに慣れ親しむことをお勧めします。

コレクターは、ログ収集用の2つの主要なレシーバーを提供します：

**OTLP経由** - この場合、ログはOpenTelemetry SDKからOTLPプロトコルを介してコレクターに直接送信（プッシュ）されます。[OpenTelemetryデモ](https://opentelemetry.io/docs/demo/)はこのアプローチを採用しており、各言語のOTLPエクスポーターはローカルコレクターエンドポイントを想定しています。この場合、コレクターはOTLPレシーバーで構成する必要があります — 上記の[デモの設定](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)を参照してください。このアプローチの利点は、ログデータに自動的にトレースIDが含まれるため、ユーザーは特定のログのトレースを後で特定でき、逆も可能になることです。

<Image img={observability_4} alt="otlp経由でのログの収集" size="md"/>

このアプローチでは、ユーザーが[適切な言語SDK](https://opentelemetry.io/docs/languages/)を使用してコードを計測する必要があります。

- **Filelogレシーバーを介したスクレイピング** - このレシーバーは、ディスク上のファイルを追跡し、ログメッセージを形成し、これをClickHouseに送信します。このレシーバーは、複数行メッセージの検出、ログのロールオーバーの処理、再起動への堅牢性のためのチェックポイント、および構造の抽出といった複雑なタスクを処理します。また、このレシーバーはDockerおよびKubernetesコンテナのログを追跡し、helmチャートとしてデプロイ可能であり、これらから構造を抽出して[ポッドの詳細を強化します](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)。

<Image img={observability_5} alt="ファイルログレシーバー" size="md"/>

**ほとんどのデプロイメントは上記のレシーバーの組み合わせを使用します。ユーザーは[コレクターの文書](https://opentelemetry.io/docs/collector/)を読み、基本的な概念と[設定構造](https://opentelemetry.io/docs/collector/configuration/)および[インストール方法](https://opentelemetry.io/docs/collector/installation/)に慣れることをお勧めします。**

:::note ヒント: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/)は、設定を検証および可視化するのに便利です。
:::

## 構造化 vs 非構造化 {#structured-vs-unstructured}

ログは構造化または非構造化のいずれかです。

構造化ログは、httpコードやソースIPアドレスといったメタデータフィールドを定義するJSONのようなデータ形式を利用します。

```json
{
    "remote_addr":"54.36.149.41",
    "remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET",
    "request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1",
    "status":"200",
    "size":"30577",
    "referer":"-",
    "user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"
}
```

非構造化ログは、通常、正規表現パターンを使用して抽出可能な固有の構造を持っているものの、ログを単に文字列として表現します。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

ユーザーには、可能な限り構造化ログおよびJSON（つまりndjson）でのログを使用することをお勧めします。これにより、ClickHouseに送信する前の[コレクターのプロセッサー](https://opentelemetry.io/docs/collector/configuration/#processors)や、挿入時にマテリアライズドビューを使用してログの処理が簡素化されます。構造化ログは、後の処理リソースを最終的に節約し、ClickHouseソリューションに必要なCPUを削減します。

### 例 {#example}

例えば、構造化（JSON）および非構造化ログデータセットを提供しており、それぞれ約10m行のデータがあります。以下のリンクから入手可能です：

- [非構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

以下の例では、構造化データセットを使用します。このファイルをダウンロードして解凍し、以下の例を再現してください。

以下は、ファイルをディスク上で読み取り、filelogレシーバーを使用してメッセージをstdoutに出力するOTelコレクターのシンプルな設定を示しています。ログが構造化されているため、[`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md)オペレーターを使用します。access-structured.logファイルへのパスを修正してください。

:::note ClickHouseでの解析を検討する
以下の例は、ログからタイムスタンプを抽出します。これは、全ログ行をJSON文字列に変換し、その結果を`LogAttributes`に置く`json_parser`オペレーターの使用を要求します。これは計算コストが高く、[ClickHouseでより効率的に行えます](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [SQLを使用して構造を抽出する](/use-cases/observability/schema-design#extracting-structure-with-sql)。同様の非構造化の例は、[`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md)を使用してこれを行うことができ、[こちらにあります](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)。
:::

**[config-structured-logs.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_1*N*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Blogging%5D%7E)**

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
processors:
  batch:
    timeout: 5s
    send_batch_size: 1
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [logging]
```

ユーザーは、[公式の指示](https://opentelemetry.io/docs/collector/installation/)に従って、コレクターをローカルにインストールできます。重要なことは、指示が[filelogレシーバーを含む](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)ために変更されていることを確認することです。例えば、`otelcol_0.102.1_darwin_arm64.tar.gz`の代わりに、ユーザーは`otelcol-contrib_0.102.1_darwin_arm64.tar.gz`をダウンロードします。リリースは[こちら](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)で確認できます。

インストールが完了したら、OTel Collectorは次のコマンドで実行できます：

```bash
./otelcol-contrib --config config-logs.yaml
```

構造化ログを使用している場合、メッセージは以下の形式になります：

```response
LogRecord #98
ObservedTimestamp: 2024-06-19 13:21:16.414259 +0000 UTC
Timestamp: 2019-01-22 01:12:53 +0000 UTC
SeverityText:
SeverityNumber: Unspecified(0)
Body: Str({"remote_addr":"66.249.66.195","remote_user":"-","run_time":"0","time_local":"2019-01-22 01:12:53.000","request_type":"GET","request_path":"\/product\/7564","request_protocol":"HTTP\/1.1","status":"301","size":"178","referer":"-","user_agent":"Mozilla\/5.0 (Linux; Android 6.0.1; Nexus 5X Build\/MMB29P) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/41.0.2272.96 Mobile Safari\/537.36 (compatible; Googlebot\/2.1; +http:\/\/www.google.com\/bot.html)"})
Attributes:
        -> remote_user: Str(-)
        -> request_protocol: Str(HTTP/1.1)
        -> time_local: Str(2019-01-22 01:12:53.000)
        -> user_agent: Str(Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html))
        -> log.file.name: Str(access.log)
        -> status: Str(301)
        -> size: Str(178)
        -> referer: Str(-)
        -> remote_addr: Str(66.249.66.195)
        -> request_type: Str(GET)
        -> request_path: Str(/product/7564)
        -> run_time: Str(0)
Trace ID:
Span ID:
Flags: 0
```

上記は、OTelコレクターによって生成された単一のログメッセージを示しています。これらのメッセージを後のセクションでClickHouseに取り込みます。

ログメッセージの完全なスキーマや、他のレシーバーを使用している場合に存在する可能性のある追加のカラムは[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)で維持されています。**ユーザーには、このスキーマに慣れ親しむことを強く推奨します。**

ここでの重要な点は、ログ行自体が`Body`フィールド内に文字列として保持されていますが、`json_parser`のおかげでAttributesフィールドにJSONが自動的に抽出されたことです。この同じ[オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available)は、適切な`Timestamp`カラムへのタイムスタンプの抽出にも使用されました。OTelでのログ処理に関する推奨事項については、[処理](#processing---filtering-transforming-and-enriching)を参照してください。

:::note オペレーター
オペレーターは、ログ処理で利用可能な最も基本的な単位です。各オペレーターは、ファイルから行を読み取ったり、フィールドからJSONを解析したりするなど、一つの責任を果たします。オペレーターは、望ましい結果を達成するためにパイプラインで連結されます。
:::

上記のメッセージには`TraceID`または`SpanID`フィールドが含まれていません。もし存在する場合（例えば、ユーザーが[分散トレース](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)を実装している場合）には、上記と同じテクニックを使用してJSONから抽出できます。

ローカルまたはKubernetesログファイルの収集が必要なユーザーには、[filelogレシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration)で利用可能な設定オプションや、[オフセット](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking)や、[複数行ログの解析がどのように処理されるか](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)に精通することをお勧めします。

## Kubernetesログの収集 {#collecting-kubernetes-logs}

Kubernetesログを収集するために、[OpenTelemetryドキュメントガイド](https://opentelemetry.io/docs/kubernetes/)を推奨します。[Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor)は、ポッドメタデータでログやメトリクスを強化するために推奨されます。これにより、ダイナミックメタデータ（例：ラベル）が生成され、`ResourceAttributes`カラムに格納される可能性があります。ClickHouseは現在、このカラムに対して`Map(String, String)`型を使用しています。[マップを使用する](/use-cases/observability/schema-design#using-maps)および[マップからの抽出](/use-cases/observability/schema-design#extracting-from-maps)については、このタイプを処理および最適化するための詳細を参照してください。

## トレースの収集 {#collecting-traces}

コードを計測してトレースを収集したいユーザーには、公式の[OTelドキュメント](https://opentelemetry.io/docs/languages/)を参照することを推奨します。

ClickHouseにイベントを送信するには、適切なレシーバーを介してOTLPプロトコル経由でトレースイベントを受信するOTelコレクターをデプロイする必要があります。OpenTelemetryデモは、[サポートされている各言語の計測例を提供](https://opentelemetry.io/docs/demo/)しており、イベントをコレクターに送信します。以下は、イベントをstdoutに出力するための適切なコレクター設定の一例です。

### 例 {#example-1}

トレースをOTLPで受信する必要があるため、トレースデータを生成するための[`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)ツールを使用します。インストール手順については[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)を参照してください。

以下の設定では、OTLPレシーバーでトレースイベントを受け取り、それをstdoutに送信します。

[config-traces.xml](https://www.otelbin.io/#config=receivers%3A*N_otlp%3A*N___protocols%3A*N_____grpc%3A*N_______endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N__timeout%3A_1s*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N__traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Blogging%5D%7E)

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 1s
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging]
```

次のコマンドでこの設定を実行します：

```bash
./otelcol-contrib --config config-traces.yaml
```

トレースイベントを`telemetrygen`を介してコレクターに送信します：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

これにより、stdoutに出力されたトレースメッセージは以下のようになります：

```response
Span #86
        Trace ID        : 1bb5cdd2c9df5f0da320ca22045c60d9
        Parent ID       : ce129e5c2dd51378
        ID              : fbb14077b5e149a0
        Name            : okey-dokey-0
        Kind            : Server
        Start time      : 2024-06-19 18:03:41.603868 +0000 UTC
        End time        : 2024-06-19 18:03:41.603991 +0000 UTC
        Status code     : Unset
        Status message :
Attributes:
        -> net.peer.ip: Str(1.2.3.4)
        -> peer.service: Str(telemetrygen-client)
```

上記は、OTelコレクターによって生成された単一のトレースメッセージを示しています。これらのメッセージも後のセクションでClickHouseに取り込みます。

トレースメッセージの完全なスキーマは[こちら](https://opentelemetry.io/docs/concepts/signals/traces/)で維持されています。ユーザーには、このスキーマに慣れ親しむことを強く推奨します。

## 処理 - フィルタリング、変換、強化 {#processing---filtering-transforming-and-enriching}

ログイベントのタイムスタンプを設定する早期の例で示されたように、ユーザーはイベントメッセージをフィルタリング、変換、および強化したいと考えます。これは、OpenTelemetryのさまざまな機能を使用して実現できます：

- **プロセッサー** - プロセッサーは、[レシーバーで収集したデータを変更または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/)し、エクスポーターに送信する前に処理します。プロセッサーは、コレクター構成の`processors`セクションで設定された順序で適用されます。これはオプションですが、最小限のセットは[通常推奨されます](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。ClickHouseでOTelコレクターを使用する際は、プロセッサーを次のように制限することをお勧めします：

    - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)は、コレクターのメモリ不足の状況を防ぐために使用されます。リソースの推定については、[リソースの推定](#estimating-resources)を参照してください。
    - コンテキストに基づいて強化を行うプロセッサー。例えば、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)は、k8sメタデータを使用してスパン、メトリクス、およびログリソース属性を自動的に設定することを可能にします。これにより、ソースポッドIDと共にイベントが強化されます。
    - 必要に応じて、[TailまたはHeadサンプリング](https://opentelemetry.io/docs/concepts/sampling/)。
    - [基本的なフィルタリング](https://opentelemetry.io/docs/collector/transforming-telemetry/) - オペレーターを介してこれが行えない場合、不要なイベントをドロップします（以下を参照）。
    - [バッチ処理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - ClickHouseで作業する際には、データがバッチで送信されることを保証するために不可欠です。["ClickHouseにエクスポートする"](#exporting-to-clickhouse)を参照してください。

- **オペレーター** - [オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)は、レシーバーで利用可能な最も基本的な処理単位です。基本的な解析がサポートされており、SeverityやTimestampなどのフィールドを設定できます。ここではJSONや正規表現の解析、イベントのフィルタリング、基本的な変換がサポートされています。イベントフィルタリングをここで行うことを推奨します。

ユーザーは、オペレーターや[変換プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)を使用して過剰なイベント処理を避けることをお勧めします。これらは、特にJSON解析において considerableなメモリおよびCPUオーバーヘッドを引き起こす可能性があります。ClickHouseでマテリアライズドビューを使用して、挿入時にすべての処理を行うことが可能ですが、特にk8sメタデータの追加などのコンテキストを意識した強化に関しては例外があります。詳細については、[SQLを使用して構造を抽出する](https://use-cases/observability/schema-design#extracting-structure-with-sql)を参照してください。

OTelコレクターを使用して処理を行う場合は、ゲートウェイのインスタンスで変換を行い、エージェントのインスタンスで行われる作業を最小限に抑えることをお勧めします。これにより、サーバー上で実行されるエッジのエージェントに必要なリソースが可能な限り最小限に抑えられます。通常、ユーザーはフィルタリング（不必要なネットワーク使用量を最小限に抑えるため）、タイムスタンプ設定（オペレーターを介して）、およびコンテキストが必要な強化を行うことを確認します。たとえば、ゲートウェイインスタンスが異なるKubernetesクラスターに存在する場合、k8s強化はエージェントで行う必要があります。

### 例 {#example-2}

以下の設定は、非構造化ログファイルの収集を示しています。オペレーターを使用してログ行から構造を抽出し（`regex_parser`）、イベントをフィルタリングし、バッチイベントを処理し、メモリ使用量を制限しています。

[config-unstructured-logs-with-processor.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-unstructured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_regex*_parser*N_______regex%3A_*%22%5E*C*QP*Lip*G%5B*Bd.%5D*P*D*Bs*P-*Bs*P-*Bs*P*B%5B*C*QP*Ltimestamp*G%5B%5E*B%5D%5D*P*D*B%5D*Bs*P%22*C*QP*Lmethod*G%5BA-Z%5D*P*D*Bs*P*C*QP*Lurl*G%5B%5E*Bs%5D*P*D*Bs*PHTTP%2F%5B%5E*Bs%5D*P%22*Bs*P*C*QP*Lstatus*G*Bd*P*D*Bs*P*C*QP*Lsize*G*Bd*P*D*Bs*P%22*C*QP*Lreferrer*G%5B%5E%22%5D***D%22*Bs*P%22*C*QP*Luser*_agent*G%5B%5E%22%5D***D%22*%22*N_______timestamp%3A*N_________parse*_from%3A_attributes.timestamp*N_________layout%3A_*%22*.d%2F*.b%2F*.Y%3A*.H%3A*.M%3A*.S_*.z*%22*N_________*H22%2FJan%2F2019%3A03%3A56%3A14_*P0330*N*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_1s*N___send*_batch*_size%3A_100*N_memory*_limiter%3A*N___check*_interval%3A_1s*N___limit*_mib%3A_2048*N___spike*_limit*_mib%3A_256*N*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%2C_memory*_limiter%5D*N_____exporters%3A_%5Blogging%5D%7E)

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-unstructured.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<ip>[\d.]+)\s+-\s+-\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>[A-Z]+)\s+(?P<url>[^\s]+)\s+HTTP/[^\s]+"\s+(?P<status>\d+)\s+(?P<size>\d+)\s+"(?P<referrer>[^"]*)"\s+"(?P<user_agent>[^"]*)"'
        timestamp:
          parse_from: attributes.timestamp
          layout: '%d/%b/%Y:%H:%M:%S %z'
          #22/Jan/2019:03:56:14 +0330
processors:
  batch:
    timeout: 1s
    send_batch_size: 100
  memory_limiter:
    check_interval: 1s
    limit_mib: 2048
    spike_limit_mib: 256
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch, memory_limiter]
      exporters: [logging]
```

```bash
./otelcol-contrib --config config-unstructured-logs-with-processor.yaml
```
## ClickHouseへのエクスポート {#exporting-to-clickhouse}

エクスポーターは、データを1つまたは複数のバックエンドまたは宛先に送信します。エクスポーターはプルまたはプッシュベースのものがあり、ユーザーがClickHouseにイベントを送信するには、プッシュベースの[ClickHouseエクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)を使用する必要があります。

:::note OpenTelemetry Collector Contribを使用
ClickHouseエクスポーターは、コアディストリビューションではなく、[OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main)の一部です。ユーザーは、contribディストリビューションを使用するか、[独自のコレクターを構築](https://opentelemetry.io/docs/collector/custom-collector/)することができます。
:::

完全な設定ファイルは以下に示します。

[clickhouse-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N_otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_5000*N*Nexporters%3A*N_clickhouse%3A*N___endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*Aasync*_insert*E1*N___*H_ttl%3A_72h*N___traces*_table*_name%3A_otel*_traces*N___logs*_table*_name%3A_otel*_logs*N___create*_schema%3A_true*N___timeout%3A_5s*N___database%3A_default*N___sending*_queue%3A*N_____queue*_size%3A_1000*N___retry*_on*_failure%3A*N_____enabled%3A_true*N_____initial*_interval%3A_5s*N_____max*_interval%3A_30s*N_____max*_elapsed*_time%3A_300s*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Bclickhouse%5D*N___traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Bclickhouse%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 5s
    send_batch_size: 5000
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
    # ttl: 72h
    traces_table_name: otel_traces
    logs_table_name: otel_logs
    create_schema: true
    timeout: 5s
    database: default
    sending_queue:
      queue_size: 1000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s


service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [clickhouse]
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [clickhouse]
```

次の重要な設定に注意してください：

- **pipelines** - 上記の設定では、[pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines)を使用していることが強調されています。これには、ログとトレース用のレシーバー、プロセッサー、およびエクスポーターのセットが含まれます。
- **endpoint** - ClickHouseとの通信は`endpoint`パラメータを介して構成されます。接続文字列`tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1`は、TCPを介して通信が行われることを意味します。ユーザーがトラフィックスイッチングの理由でHTTPを好む場合は、[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)に説明されているように、この接続文字列を修正してください。接続の詳細、およびこの接続文字列内にユーザー名とパスワードを指定する能力については、[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)で説明されています。

**重要：** 上記の接続文字列では、圧縮（lz4）と非同期挿入の両方が有効になります。両方を常に有効にすることをお勧めします。非同期の挿入に関する詳細は、[バッチ処理](#batching)を参照してください。圧縮は常に指定する必要があり、エクスポーターの古いバージョンではデフォルトでは有効になっていません。

- **ttl** - ここでの値は、データがどのくらい保持されるかを決定します。詳細は「データの管理」を参照してください。これは、e.g. 72hのように、時間単位で指定する必要があります。以下の例では、データは2019年のものであり、ClickHouseに挿入されるとすぐに削除されるため、TTLは無効化しています。
- **traces_table_name**および **logs_table_name** - ログとトレースのテーブル名を決定します。
- **create_schema** - テーブルが初回起動時にデフォルトのスキーマで作成されるかどうかを判断します。始めるためにはデフォルトでtrueです。ユーザーはこれをfalseに設定し、自分のスキーマを定義する必要があります。
- **database** - ターゲットデータベース。
- **retry_on_failure** - 失敗したバッチを試みるかどうかを判断する設定。
- **batch** - バッチプロセッサーは、イベントをバッチとして送信することを保証します。私たちは、約5000の値と5秒のタイムアウトを推奨します。どちらかが最初に到達した場合、エクスポーターにフラッシュされるバッチが開始されます。これらの値を下げると、より低いレイテンシーパイプラインを意味し、データがより早くクエリ可能になりますが、ClickHouseに送信される接続とバッチが増えることになります。これは、ユーザーが[非同期挿入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を使用していない場合には推奨されません。なぜなら、それは[ClickHouseのパーツが多すぎる問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts)を引き起こす可能性があるからです。逆に、ユーザーが非同期挿入を使用している場合、クエリ可能なデータの可用性は非同期挿入設定にも依存します。ただし、データはコネクタからより早くフラッシュされます。詳細については、[バッチ処理](#batching)を参照してください。
- **sending_queue** - 送信キューのサイズを制御します。キュー内の各項目にはバッチが含まれています。このキューが超過された場合、e.g. ClickHouseが到達不能になったがイベントの到着が続く場合、バッチがドロップされます。

ユーザーが構造化されたログファイルを抽出し、[ClickHouseのローカルインスタンス](/install)を実行中で（デフォルトの認証で）、ユーザーは次のコマンドでこの設定を実行できます。

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

このコレクターにトレースデータを送信するには、次のコマンドを`telemetrygen`ツールを使用して実行します。

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

実行中の間に、簡単なクエリでログイベントが存在することを確認します。

```sql
SELECT *
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:              2019-01-22 06:46:14.000000000
TraceId:
SpanId:
TraceFlags:             0
SeverityText:
SeverityNumber:         0
ServiceName:
Body:                   {"remote_addr":"109.230.70.66","remote_user":"-","run_time":"0","time_local":"2019-01-22 06:46:14.000","request_type":"GET","request_path":"\/image\/61884\/productModel\/150x150","request_protocol":"HTTP\/1.1","status":"200","size":"1684","referer":"https:\/\/www.zanbil.ir\/filter\/p3%2Cb2","user_agent":"Mozilla\/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko\/20100101 Firefox\/64.0"}
ResourceSchemaUrl:
ResourceAttributes: {}
ScopeSchemaUrl:
ScopeName:
ScopeVersion:
ScopeAttributes:        {}
LogAttributes:          {'referer':'https://www.zanbil.ir/filter/p3%2Cb2','log.file.name':'access-structured.log','run_time':'0','remote_user':'-','request_protocol':'HTTP/1.1','size':'1684','user_agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0','remote_addr':'109.230.70.66','request_path':'/image/61884/productModel/150x150','status':'200','time_local':'2019-01-22 06:46:14.000','request_type':'GET'}

1 row in set. Elapsed: 0.012 sec. Processed 5.04 thousand rows, 4.62 MB (414.14 thousand rows/s., 379.48 MB/s.)
Peak memory usage: 5.41 MiB.


同様に、トレースイベントについては、ユーザーは`otel_traces`テーブルを確認できます。

```sql
SELECT *
FROM otel_traces
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:              2024-06-20 11:36:41.181398000
TraceId:                00bba81fbd38a242ebb0c81a8ab85d8f
SpanId:                 beef91a2c8685ace
ParentSpanId:
TraceState:
SpanName:               lets-go
SpanKind:               SPAN_KIND_CLIENT
ServiceName:            telemetrygen
ResourceAttributes: {'service.name':'telemetrygen'}
ScopeName:              telemetrygen
ScopeVersion:
SpanAttributes:         {'peer.service':'telemetrygen-server','net.peer.ip':'1.2.3.4'}
Duration:               123000
StatusCode:             STATUS_CODE_UNSET
StatusMessage:
Events.Timestamp:   []
Events.Name:            []
Events.Attributes:  []
Links.TraceId:          []
Links.SpanId:           []
Links.TraceState:   []
Links.Attributes:   []
```
## デフォルトのスキーマ {#out-of-the-box-schema}

デフォルトでは、ClickHouseエクスポーターは、ログとトレースの両方に対してターゲットログテーブルを作成します。これは、`create_schema`設定を介して無効にできます。さらに、ログとトレースの両方のテーブル名は、上記で指摘された設定を使用してデフォルトの`otel_logs`および`otel_traces`から変更できます。

:::note
以下のスキーマでは、TTLが72hとして有効になっているとします。
:::

ログのデフォルトスキーマは以下に示しています（`otelcol-contrib v0.102.1`）：

```sql
CREATE TABLE default.otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
        INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_scope_attr_key mapKeys(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_scope_attr_value mapValues(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_log_attr_value mapValues(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(3)
SETTINGS ttl_only_drop_parts = 1
```

ここに示されているカラムは、[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)で文書化されているログのOTel公式仕様と一致します。

このスキーマに関する重要な注意点いくつか：

- デフォルトでは、テーブルは`PARTITION BY toDate(Timestamp)`を使用して日付でパーティション分けされます。これは、有効期限が切れたデータを削除するのに効率的です。
- TTLは、`TTL toDateTime(Timestamp) + toIntervalDay(3)`で設定され、コレクター設定で設定された値に対応します。[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)は、含まれる行がすべて期限切れになったときにのみ全体のパーツが削除されることを意味します。これは、パーツ内で行を削除するよりも効率的です。常にこれを設定することをお勧めします。詳細は、[TTLによるデータ管理](/observability/managing-data#data-management-with-ttl-time-to-live)を参照してください。
- テーブルは古典的な[`MergeTree`エンジン](/engines/table-engines/mergetree-family/mergetree)を使用しています。これは、ログとトレースに推奨されており、変更の必要はありません。
- テーブルは`ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`で並べ替えられています。これは、`ServiceName`、`SeverityText`、`Timestamp`、`TraceId`でフィルタリングのためにクエリが最適化されることを意味します。リストの早い側のカラムは後のものよりも早くフィルタリングされます。つまり、`ServiceName`でフィルタリングすることは、`TraceId`でフィルタリングするよりもかなり早くなります。ユーザーは、予想されるアクセスパターンに基づいてこの順序を変更する必要があります。詳細は、[主キーの選択](/use-cases/observability/schema-design#choosing-a-primary-ordering-key)を参照してください。
- 上記のスキーマは、カラムに`ZSTD(1)`を適用します。これは、ログの最適な圧縮を提供します。ユーザーは、より良い圧縮のためにZSTDの圧縮レベル（デフォルトの1以上）を上げることができますが、これはほとんど利益をもたらしません。この値を上げると、挿入時（圧縮時）のCPUのオーバーヘッドが大きくなりますが、解凍（したがってクエリ）は比較的保持されるべきです。詳細は[こちら](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を参照してください。Timestampには、ディスク上のサイズを削減することを目的とした追加の[デルタエンコーディング](/sql-reference/statements/create/table#delta)が適用されています。
- [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes)、および[`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope)がマップであることに注意してください。ユーザーはこれらの違いに慣れておくべきです。これらのマップにアクセスし、それらの中のキーへのアクセスを最適化する方法については、[マップの使用](/use-cases/observability/integrating-opentelemetry.md)を参照してください。
- ここにある他のタイプ、大胆にLowCardinalityとしているものは、最適化されています。注意すべきは、Bodyは私たちの例のログではJSONですが、Stringとして保存されています。
- マップのキーと値、およびBodyカラムには、ブルームフィルタが適用されています。これにより、これらのカラムへのクエリ時間が改善されることを目指しますが、通常は必要ありません。詳細は、[二次/データスキッピングインデックス](/use-cases/observability/schema-design#secondarydata-skipping-indices)を参照してください。

```sql
CREATE TABLE default.otel_traces
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `ParentSpanId` String CODEC(ZSTD(1)),
        `TraceState` String CODEC(ZSTD(1)),
        `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
        `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `Duration` Int64 CODEC(ZSTD(1)),
        `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
        `StatusMessage` String CODEC(ZSTD(1)),
        `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
        `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
        `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        `Links.TraceId` Array(String) CODEC(ZSTD(1)),
        `Links.SpanId` Array(String) CODEC(ZSTD(1)),
        `Links.TraceState` Array(String) CODEC(ZSTD(1)),
        `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
        INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_duration Duration TYPE minmax GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(3)
SETTINGS ttl_only_drop_parts = 1
```

再度、これは[こちら](https://opentelemetry.io/docs/specs/otel/trace/api/)で文書化されているトレースのOTel公式仕様に準拠しています。ここでのスキーマは、上記のログスキーマと多くの同じ設定を採用しており、スパン専用の追加リンクカラムがあります。

ユーザーには、autoスキーマ生成を無効にし、手動でテーブルを作成することをお勧めします。これにより、主キーおよび副キーを変更する機会と、クエリパフォーマンスを最適化するための追加カラムを導入する機会が得られます。詳細については、[スキーマ設計](/use-cases/observability/schema-design)を参照してください。
## 挿入の最適化 {#optimizing-inserts}

ObservabilityデータをClickHouseにコレクターを介して挿入する際、高い挿入パフォーマンスと強い整合性保証を実現するために、ユーザーは単純なルールに従うべきです。OTelコレクターの設定が正しく行われていれば、次のルールは簡単に守れます。これにより、ユーザーがClickHouseを初めて使用する際に遭遇する[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)も避けられます。
### バッチ処理 {#batching}

デフォルトでは、ClickHouseに送信される各挿入は、挿入からデータとともに保存する必要がある他のメタデータを含むストレージのパーツを直ちに作成します。したがって、より少量の挿入を送信してそれぞれにより多くのデータを含めること（より多くの挿入を送信してそれぞれに少しデータしか含めないよりも）は、必要な書き込みの数を減らします。私たちは、1回の挿入で少なくとも1,000行の比較的大きなバッチのデータを挿入することをお勧めします。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)を参照してください。

デフォルトでは、ClickHouseへの挿入は同期的であり、同一であれば冪等です。MergeTreeエンジンファミリのテーブルでは、ClickHouseはデフォルトで、自動的に[挿入を重複除去](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)します。これにより、以下のようなケースでも挿入が許容されます：

- (1) データを受信するノードに問題がある場合、挿入クエリはタイムアウトし（またはより具体的なエラーが発生し）、応答を受け取らない。
- (2) データがノードに書き込まれましたが、ネットワークの中断によりクエリの送信者に確認応答が返せない場合、送信者はタイムアウトまたはネットワークエラーを受け取る。

コレクターの観点からは、(1)と(2)を区別するのは難しい場合があります。ただし、いずれの場合も、未確認挿入はすぐに再試行できます。再試行された挿入クエリが同じデータを同じ順序で含む限り、ClickHouseは（未確認の）元の挿入が成功していた場合、再試行された挿入を自動的に無視します。

私たちは、上記を満たすために以前の構成で示された[バッチプロセッサ](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)の使用をお勧めします。これにより、挿入は一貫したバッチとして送信され、上記の要件を満たすことが保証されます。コレクターが高スループット（秒あたりのイベント数）を持つことが予想され、各挿入で少なくとも5000イベントを送信できる場合、通常はこれがパイプラインで必要な唯一のバッチ処理です。この場合、コレクターはバッチプロセッサの`timeout`に達する前にバッチをフラッシュし、パイプラインのエンドツーエンドのレイテンシーが低く、バッチのサイズが一貫していることを保証します。
### 非同期挿入を使用 {#use-asynchronous-inserts}

通常、スループットが低いコレクターの場合、ユーザーは小さなバッチを送信しなければならず、それでも最低限のエンドツーエンドレイテンシーでClickHouseにデータが届くことを期待しています。この場合、バッチプロセッサの`timeout`が切れると、小さなバッチが送信されます。これが問題を引き起こす可能性があるときに、非同期挿入が必要です。この状況は、**エージェントロールのコレクターがClickHouseに直接送信するように構成されている場合**に一般的に発生します。ゲートウェイは、集約器として機能することでこの問題を緩和できます - [ゲートウェイでのスケーリング](#scaling-with-gateways)を参照してください。

大きなバッチを確保できない場合、ユーザーは[非同期挿入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)を使用してClickHouseにバッチ処理を委任できます。非同期挿入を使用すると、データが最初にバッファに挿入され、その後データベースストレージに書き込まれます。

<Image img={observability_6} alt="非同期挿入" size="md"/>

[非同期挿入が有効になっている場合](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)、ClickHouseが①挿入クエリを受信すると、クエリのデータが②最初にメモリ内バッファに即座に書き込まれます。次に③バッファフラッシュが発生したときに、バッファのデータが[並べ替えられ](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)て、データベースストレージにパーツとして書き込まれます。データがデータベースストレージにフラッシュされる前はクエリによって検索できないことに注意してください。バッファフラッシュは[設定可能です](/optimize/asynchronous-inserts)。

コレクターのために非同期挿入を有効にするには、接続文字列に`async_insert=1`を追加します。配信保証を得るために、ユーザーは`wait_for_async_insert=1`（デフォルト）を使用することをお勧めします。詳細については[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。

非同期挿入からのデータは、ClickHouseのバッファがフラッシュされた後に挿入されます。この処理は、[`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size)を超えた場合、または最初のINSERTクエリ以来[`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size)ミリ秒経過後に発生します。`async_insert_stale_timeout_ms`がゼロ以外の値に設定されている場合、データは最後のクエリから`async_insert_stale_timeout_ms`ミリ秒後に挿入されます。ユーザーはこれらの設定を調整してパイプラインのエンドツーエンドレイテンシーを制御できます。バッファフラッシングを調整するために使用できる他の設定は[こちら](https://operations/settings/settings#async_insert)に文書化されています。一般的に、デフォルトは適切です。

:::note 適応型非同期挿入を考慮する
エージェントの数が少なく、スループットが低く、厳格なエンドツーエンドレイテンシー要件がある場合、[適応型非同期挿入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts)が役立つことがあります。一般的に、これはClickHouseのような高スループットなObservabilityユースケースには適用されません。
:::

最後に、非同期挿入を使用する際、ClickHouseへの同期挿入に関連する以前の重複排除動作は、デフォルトでは有効になっていません。必要な場合は、設定[`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)を参照してください。

この機能の設定に関する詳細は[こちら](https://optimize/asynchronous-inserts#enabling-asynchronous-inserts)で入手できます。さらに詳しくは[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。
## デプロイメントアーキテクチャ {#deployment-architectures}

OTelコレクターをClickHouseと共に使用する際に使用可能なアーキテクチャは数種類あります。それぞれの適用可能性について説明します。
### エージェントのみ {#agents-only}

エージェントのみのアーキテクチャでは、ユーザーはOTelコレクターをエッジにエージェントとして展開します。これらはローカルアプリケーション（例：サイドカーコンテナ）からトレースを受信し、サーバーやKubernetesノードからログを収集します。このモードでは、エージェントはデータを直接ClickHouseに送信します。

<Image img={observability_7} alt="エージェントのみ" size="md"/>

このアーキテクチャは、小規模から中規模の展開に適しています。その主な利点は、追加のハードウェアを必要とせず、ClickHouseの可観測性ソリューションの全体的なリソース使用量が最小限に抑えられ、アプリケーションとコレクター間の単純なマッピングが行われることです。

ユーザーは、エージェントの数が数百を超えると、ゲートウェイベースのアーキテクチャへの移行を検討する必要があります。このアーキテクチャにはスケーリングが困難であるいくつかの欠点があります：

- **接続スケーリング** - 各エージェントがClickHouseに接続を確立します。ClickHouseは数百（場合によっては数千）の同時挿入接続を維持できますが、最終的には制約要因となり、挿入の効率が低下します。つまり、接続を維持するためにClickHouseが使用するリソースが増えます。ゲートウェイを使用することで、この接続数を最小限に抑え、挿入の効率を高めます。
- **エッジでの処理** - このアーキテクチャでは、どんな変換やイベント処理もエッジまたはClickHouse内で行う必要があります。これは制約が厳しいだけでなく、複雑なClickHouseのマテリアライズドビューを作成するか、重大なサービスに影響を与えるリソースが不足している可能性のあるエッジでの大きな計算を押し上げることを意味しています。
- **小さなバッチとレイテンシー** - エージェントコレクターは、非常に少数のイベントを個別に収集する場合があります。これは通常、納品SLAを満たすために設定された間隔でフラッシュする必要があることを意味します。これにより、コレクターが小さなバッチをClickHouseに送信する可能性があります。欠点ではありますが、非同期挿入を使用することで軽減可能です - [挿入の最適化](#optimizing-inserts)を参照してください。
### ゲートウェイによるスケーリング {#scaling-with-gateways}

OTel コレクタは、上記の制限に対処するためにゲートウェイインスタンスとして展開できます。これらは、通常はデータセンターや地域ごとにスタンドアロンのサービスを提供します。これらは、単一の OTLP エンドポイントを介してアプリケーション（またはエージェント役の他のコレクタ）からイベントを受信します。通常、一連のゲートウェイインスタンスが展開され、負荷を分散させるためにアウトオブボックスのロードバランサーが使用されます。

<Image img={observability_8} alt="ゲートウェイによるスケーリング" size="md"/>

このアーキテクチャの目的は、エージェントから計算集約的な処理をオフロードし、それによってリソースの使用量を最小限に抑えることです。これらのゲートウェイは、エージェントによって行われる必要がある変換タスクを実行できます。さらに、多くのエージェントからのイベントを集約することにより、ゲートウェイは大規模なバッチが ClickHouse に送信されるようにし、効率的な挿入を可能にします。これらのゲートウェイコレクタは、エージェントが追加され、イベントスループットが増加するにつれて容易にスケールできます。以下に、例としてゲートウェイの構成と、例の構造化ログファイルを消費する関連するエージェントの構成を示します。エージェントとゲートウェイ間の通信に OTLP が使用されていることに注意してください。

[clickhouse-agent-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_1000*N*Nexporters%3A*N_otlp%3A*N___endpoint%3A_localhost%3A4317*N___tls%3A*N_____insecure%3A_true_*H_Set_to_false_if_you_are_using_a_secure_connection*N*Nservice%3A*N_telemetry%3A*N___metrics%3A*N_____address%3A_0.0.0.0%3A9888_*H_Modified_as_2_collectors_running_on_same_host*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Botlp%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
processors:
  batch:
    timeout: 5s
    send_batch_size: 1000
exporters:
  otlp:
    endpoint: localhost:4317
    tls:
      insecure: true # セキュアな接続を使用している場合は false に設定
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # 同一ホスト上で 2 つのコレクタが動作しているため修正
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlp]
```

[clickhouse-gateway-config.yaml](https://www.otelbin.io/#config=receivers%3A*N__otlp%3A*N____protocols%3A*N____grpc%3A*N____endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_10000*N*Nexporters%3A*N__clickhouse%3A*N____endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*N____ttl%3A_96h*N____traces*_table*_name%3A_otel*_traces*N____logs*_table*_name%3A_otel*_logs*N____create*_schema%3A_true*N____timeout%3A_10s*N____database%3A_default*N____sending*_queue%3A*N____queue*_size%3A_10000*N____retry*_on*_failure%3A*N____enabled%3A_true*N____initial*_interval%3A_5s*N____max*_interval%3A_30s*N____max*_elapsed*_time%3A_300s*N*Nservice%3A*N__pipelines%3A*N____logs%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Bclickhouse%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

```yaml
receivers:
  otlp:
    protocols:
    grpc:
    endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 5s
    send_batch_size: 10000
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4
    ttl: 96h
    traces_table_name: otel_traces
    logs_table_name: otel_logs
    create_schema: true
    timeout: 10s
    database: default
    sending_queue:
      queue_size: 10000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [clickhouse]
```

これらの構成は、以下のコマンドで実行できます。

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

このアーキテクチャの主な欠点は、一連のコレクタの管理に関連するコストとオーバーヘッドです。

大規模なゲートウェイベースのアーキテクチャの管理に関する学習例については、この [ブログ記事](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog) を推奨します。

### Kafkaの追加 {#adding-kafka}

読者は、上記のアーキテクチャがメッセージキューとして Kafka を使用していないことに気付くかもしれません。

メッセージバッファとして Kafka キューを使用することは、ログアーキテクチャで見られる一般的なデザインパターンであり、ELKスタックによって普及しました。これにはいくつかの利点があります。主に、より強いメッセージ配信の保証を提供し、バックプレッシャーに対処するのに役立ちます。メッセージは収集エージェントから Kafka に送信され、ディスクに書き込まれます。理論的には、クラスタ化された Kafka インスタンスはメッセージバッファとして高いスループットを提供すべきです。ディスクにデータを線形に書き込む方が、メッセージを解析して処理するよりも計算オーバーヘッドが少ないためです。たとえば、Elastic ではトークン化とインデックス作成にはかなりのオーバーヘッドがかかります。データをエージェントから遠ざけることで、ソースでのログ回転の結果としてメッセージを失うリスクも低くなります。最後に、メッセージの返信およびクロスリージョン複製機能を提供し、一部のユースケースにとって魅力的かもしれません。

しかし、ClickHouse はデータの挿入を非常に迅速に処理できます - 中程度のハードウェアで毎秒数百万行です。ClickHouse からのバックプレッシャーは **まれ** です。しばしば、Kafka キューを活用することは、より多くのアーキテクチャの複雑さとコストを意味します。ログには銀行取引や他のミッションクリティカルなデータと同じ配信保証が必要ないという原則を受け入れられるなら、Kafka の複雑さを避けることをお勧めします。

ただし、高い配信保証やデータを再生する能力（潜在的には複数のソースへ）を必要とする場合、Kafka は有用なアーキテクチャの追加となる可能性があります。

<Image img={observability_9} alt="Kafkaの追加" size="md"/>

この場合、OTel エージェントは [Kafka エクスポータ](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) を介してデータを Kafka に送信するように構成できます。ゲートウェイインスタンスは、[Kafka レシーバ](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) を使用してメッセージを消費します。詳細については、Confluent と OTel のドキュメントをお勧めします。

### リソースの見積もり {#estimating-resources}

OTel コレクタのリソース要件は、イベントスループット、メッセージのサイズ、および実行される処理の量によって異なります。OpenTelemetry プロジェクトは、リソース要件を見積もるために使用できる [ベンチマーク](https://opentelemetry.io/docs/collector/benchmarks/) を維持しています。

[私たちの経験では](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)、3 コアと 12GB の RAM を備えたゲートウェイインスタンスは、毎秒約 60,000 イベントを処理できます。これは、フィールドの名前変更を行う最小限の処理パイプラインが責任を持つことを前提とし、正規表現は使用していないものとします。

イベントをゲートウェイに送信することを担当するエージェントインスタンスについては、毎秒のログ数に基づいてサイズを決定することをお勧めします。以下は、ユーザーが出発点として使用できるおおよその数値です：

| ログ記録レート | コレクタエージェントのリソース |
|----------------|-----------------------------|
| 1k/秒           | 0.2CPU, 0.2GiB             |
| 5k/秒           | 0.5 CPU, 0.5GiB            |
| 10k/秒          | 1 CPU, 1GiB                |
