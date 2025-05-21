---
title: 'OpenTelemetryの統合'
description: '可観測性のためのOpenTelemetryとClickHouseの統合'
slug: /observability/integrating-opentelemetry
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';
import Image from '@theme/IdealImage';


# OpenTelemetryを用いたデータ収集の統合

どの可観測性ソリューションも、ログやトレースの収集とエクスポートの手段を必要とします。この目的のために、ClickHouseは[OpenTelemetry (OTel) プロジェクト](https://opentelemetry.io/)を推奨します。

"OpenTelemetryは、トレース、メトリックス、ログなどのテレメトリデータを作成し管理するための可観測性フレームワークおよびツールキットです。"

ClickHouseやPrometheusとは異なり、OpenTelemetryは可観測性バックエンドではなく、テレメトリデータの生成、収集、管理、およびエクスポートに焦点を当てています。OpenTelemetryの最初の目標は、ユーザーが言語ごとのSDKを使用してアプリケーションやシステムを簡単にインスツルメンテーションできるようにすることでしたが、OpenTelemetryコレクタを通じてログの収集を含むように拡張されています。これは、テレメトリデータを受信、処理、およびエクスポートするエージェントまたはプロキシです。

## ClickHouse関連のコンポーネント {#clickhouse-relevant-components}

OpenTelemetryは複数のコンポーネントで構成されています。データおよびAPI仕様、標準化されたプロトコル、フィールド/カラムの命名規則を提供するだけでなく、OTelはClickHouseで可観測性ソリューションを構築するために基本的な2つの機能を提供します。

- [OpenTelemetryコレクタ](https://opentelemetry.io/docs/collector/)は、テレメトリデータを受信、処理、およびエクスポートするプロキシです。ClickHouseによるソリューションは、ログ収集とイベント処理の両方にこのコンポーネントを使用します。
- [言語SDK](https://opentelemetry.io/docs/languages/)は、仕様、API、およびテレメトリデータのエクスポートを実装します。これらのSDKは、アプリケーションのコード内でトレースが正しく記録され、構成要素としてのスパンが生成され、メタデータを通じてサービス間でコンテキストが伝播されることを保証します。これにより、分散トレースが形成され、スパンが相関できるようになります。これらのSDKは、自動的に一般的なライブラリやフレームワークを実装するエコシステムによって補完されており、ユーザーはコードを変更することなく、即座にインスツルメンテーションを得ることができます。

ClickHouseを使用する可観測性ソリューションは、これらの2つのツールを利用します。

## ディストリビューション {#distributions}

OpenTelemetryコレクタには[いくつかのディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)があります。ClickHouseのソリューションに必要なfilelogレシーバーは、[OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)にのみ存在します。

このディストリビューションには多くのコンポーネントが含まれており、ユーザーがさまざまな構成を試すことができます。ただし、実稼働環境で実行する場合は、コレクタには環境に必要なコンポーネントのみを含めることをお勧めします。その理由は以下の通りです。

- コレクタのサイズを削減し、コレクタのデプロイ時間を短縮
- コレクタの攻撃面を減らすことでセキュリティを向上

[カスタムコレクタ](https://opentelemetry.io/docs/collector/custom-collector/)の構築は、[OpenTelemetryコレクタビルダー](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)を使用して可能です。

## OTelを用いたデータの取り込み {#ingesting-data-with-otel}

### コレクタのデプロイメント役割 {#collector-deployment-roles}

ログを収集し、それをClickHouseに挿入するには、OpenTelemetryコレクタの使用をお勧めします。OpenTelemetryコレクタは、主に2つの役割でデプロイできます。

- **エージェント** - エージェントインスタンスは、サーバーやKubernetesノードなどのエッジでデータを収集するか、OpenTelemetry SDKでインスツルメントされたアプリケーションから直接イベントを受信します。この場合、エージェントインスタンスはアプリケーションとともに、またはアプリケーションと同じホスト上（サイドカーやDaemonSetなど）で実行されます。エージェントは、データを直接ClickHouseに送信するか、ゲートウェイインスタンスに送信できます。前者の場合は、[エージェントデプロイメントパターン](https://opentelemetry.io/docs/collector/deployment/agent/)と呼ばれます。
- **ゲートウェイ**  - ゲートウェイインスタンスは、スタンドアロンのサービスを提供します（例えば、Kubernetes内のデプロイメント）、通常はクラスターごと、データセンターごと、またはリージョンごとです。これらは、単一のOTLPエンドポイントを介してアプリケーション（または他のコレクタからエージェントとして）からイベントを受信します。通常、一連のゲートウェイインスタンスがデプロイされ、アウトオブボックスのロードバランサーがそれらの間で負荷を分散させるために使用されます。すべてのエージェントやアプリケーションがこの単一エンドポイントに信号を送る場合、これは[ゲートウェイデプロイメントパターン](https://opentelemetry.io/docs/collector/deployment/gateway/)と呼ばれます。

以下では、ClickHouseに直接イベントを送信するシンプルなエージェントコレクタを前提とします。ゲートウェイの使用方法や適用される条件については、[ゲートウェイによるスケーリング](#scaling-with-gateways)を参照してください。

### ログの収集 {#collecting-logs}

コレクタを使用する主な利点は、サービスがデータを迅速にオフロードできることで、コレクタがリトライ、バッチ処理、暗号化、さらには機密データのフィルタリングといった追加処理を担当できます。

コレクタは、[レシーバー](https://opentelemetry.io/docs/collector/configuration/#receivers)、[プロセッサー](https://opentelemetry.io/docs/collector/configuration/#processors)、および[エクスポーター](https://opentelemetry.io/docs/collector/configuration/#exporters)という3つの主要な処理段階の用語を使用します。レシーバーはデータ収集に使用され、プル型またはプッシュ型のいずれかです。プロセッサーはメッセージの変換やエンリッチメントを行う能力を提供します。エクスポーターは、データを下流のサービスに送信する役割を担います。このサービスは理論上、別のコレクタである可能性もありますが、以下の初期の議論ではすべてのデータが直接ClickHouseに送信されると仮定します。

<Image img={observability_3} alt="ログの収集" size="md"/>

ユーザーには、レシーバー、プロセッサー、およびエクスポーターの完全なセットに慣れておくことをお勧めします。

コレクタは、ログ収集のための2つの主要なレシーバーを提供します。

**OTLP経由で** - この場合、ログはOpenTelemetry SDKからOTLPプロトコルを介してコレクタに直接送信されます。[OpenTelemetryデモ](https://opentelemetry.io/docs/demo/)はこのアプローチを採用しており、各言語のOTLPエクスポーターはローカルコレクタエンドポイントを仮定しています。この場合、コレクタはOTLPレシーバーで構成される必要があります — 設定については、上記の[デモを参照してください](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)。このアプローチの利点は、ログデータにTrace Idが自動的に含まれるため、ユーザーは特定のログのトレースやその逆を特定できるようになります。

<Image img={observability_4} alt="OTLP経由でのログ収集" size="md"/>

このアプローチでは、ユーザーが[適切な言語SDK](https://opentelemetry.io/docs/languages/)を使用してコードをインスツルメントする必要があります。

- **Filelogレシーバーを介したスクレイピング** - このレシーバーはディスク上のファイルを尾行し、ログメッセージを形成してClickHouseに送信します。このレシーバーは、マルチラインメッセージの検出、ログのロールオーバー処理、再起動への堅牢性のためのチェックポイント化、構造の抽出といった複雑なタスクを処理できます。また、このレシーバーはDockerおよびKubernetesコンテナのログも尾行でき、helmチャートとしてデプロイ可能で、これらから[構造を抽出し](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)、ポッドの詳細でエンリッチすることができます。

<Image img={observability_5} alt="File log receiver" size="md"/>

**ほとんどのデプロイメントでは、上記のレシーバーの組み合わせが使用されます。ユーザーには[コレクタドキュメント](https://opentelemetry.io/docs/collector/)を読み、基本的な概念とともに[構成構造](https://opentelemetry.io/docs/collector/configuration/)や[インストール方法](https://opentelemetry.io/docs/collector/installation/)に慣れることをお勧めします。**

:::note ヒント: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/)は、構成を検証し可視化するのに便利です。
:::

## 構造化ログと非構造化ログ {#structured-vs-unstructured}

ログは構造化されているか、非構造化されているかのいずれかです。

構造化ログは、JSONのようなデータフォーマットを使用し、HTTPコードやソースIPアドレスなどのメタデータフィールドを定義します。

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

非構造化ログは、通常は正規表現パターンを通じて抽出可能な固有の構造があるにも関わらず、ログを単なる文字列として表現します。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

可能な限り構造化されたログとJSON（つまりndjson）でログを取ることをお勧めします。これは、後でClickHouseに送信する前に[コレクタプロセッサー](https://opentelemetry.io/docs/collector/configuration/#processors)で行うか、挿入時にマテリアライズドビューを使用するなど、ログの処理を簡素化します。構造化ログは、最終的に後の処理リソースを節約し、ClickHouseソリューションで必要なCPUを減少させることになります。

### 例 {#example}

例として、構造化（JSON）および非構造化ログデータセットを提供します。それぞれ約10m行あり、以下のリンクから入手可能です。

- [非構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

以下の例では、構造化データセットを使用します。このファイルをダウンロードして抽出し、次の例を再現してください。

以下は、ファイルをディスク上で読み込み、filelogレシーバーを使用して結果のメッセージをstdoutに出力するOTelコレクタのシンプルな構成を示しています。ログが構造化されているため、[`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md)演算子を使用します。access-structured.logファイルへのパスを修正してください。

:::note ClickHouseによるパースを検討
以下の例は、ログからタイムスタンプを抽出しています。これは、`json_parser`演算子を使用する必要があります。これにより、完全なログ行がJSON文字列に変換され、結果が`LogAttributes`に配置されます。これは計算コストが高く、[ClickHouseでより効率的に行うことができます](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [SQLによる構造の抽出](/use-cases/observability/schema-design#extracting-structure-with-sql)の例です。すべての受信者が使用される場合の、この運用を達成するための同等の非構造化例は、[こちら](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)で見つけられます。
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

ユーザーは[公式の指示](https://opentelemetry.io/docs/collector/installation/)に従ってローカルにコレクタをインストールできます。重要なことは、指示が[filelogレシーバーを含む](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)であることを確認することです。例えば、`otelcol_0.102.1_darwin_arm64.tar.gz`の代わりに`otelcol-contrib_0.102.1_darwin_arm64.tar.gz`をダウンロードします。リリースは[こちら](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)で見つけられます。

インストールが完了すると、OTelコレクタは以下のコマンドで実行できます。

```bash
./otelcol-contrib --config config-logs.yaml
```

構造化ログを使用する場合、メッセージは次のような形式になります。

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

上記はOTelコレクタによって生成された単一のログメッセージを表しています。このメッセージは、後のセクションでClickHouseに取り込まれます。

ログメッセージの完全なスキーマは、他のレシーバーを使用する場合に存在する可能性のある追加のカラムとともに[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)で維持されています。**ユーザーはこのスキーマに慣れておくことを強くお勧めします。**

ここでの重要な点は、ログ行自体が`Body`フィールド内に文字列として保持されているが、`json_parser`のおかげでJSONが自動的にAttributesフィールドに抽出されているということです。この同じ[演算子](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available)を使用して、タイムスタンプを適切な`Timestamp`カラムに抽出しています。OTelでのログ処理についての推奨事項は、[処理](#processing---filtering-transforming-and-enriching)を参照してください。

:::note 演算子
演算子は、ログ処理における最も基本的な単位です。各演算子は、ファイルから行を読み取る、またはフィールドからJSONを解析するなど、単一の責任を果たします。演算子はパイプライン内で連結され、所望の結果を達成します。
:::

上記のメッセージには`TraceID`や`SpanID`フィールドがありません。分散トレーシングを実装している場合など、これらが存在する場合は、上記で示された技術を使用してJSONから抽出できます。

ローカルまたはKubernetesのログファイルを収集する必要があるユーザーには、[filelogレシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration)の利用可能な構成オプションや、[オフセット](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking)と[マルチラインログパース](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)の処理を理解することをお勧めします。

## Kubernetesログの収集 {#collecting-kubernetes-logs}

Kubernetesログを収集するためには、[OpenTelemetryのドキュメントガイド](https://opentelemetry.io/docs/kubernetes/)をお勧めします。[Kubernetes属性プロセッサー](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor)は、ポッドメタデータでログやメトリックスをエンリッチするために推奨されます。これは、`ResourceAttributes`カラムに格納される動的メタデータ（例えば、ラベル）を生成する可能性があります。ClickHouseでは現在このカラムに`Map(String, String)`型を使用しています。[マップの使用](/use-cases/observability/schema-design#using-maps)や[マップからの抽出](/use-cases/observability/schema-design#extracting-from-maps)について詳しい情報は、これらの型を処理および最適化する際に役立ちます。

## トレースの収集 {#collecting-traces}

コードをインスツルメントしトレースを収集するユーザーには、公式の[OTelドキュメント](https://opentelemetry.io/docs/languages/)に従うことをお勧めします。

ClickHouseにイベントを届けるには、トレースイベントをOTLPプロトコル経由で受け取るOTelコレクタをデプロイする必要があります。OpenTelemetryデモは、[各サポートされる言語のインスツルメンテーションの例](https://opentelemetry.io/docs/demo/)を提供し、イベントをコレクタに送信します。stdoutにイベントを出力する適切なコレクタ構成の例を以下に示します。

### 例 {#example-1}

トレースはOTLP経由で受け取る必要があるため、[`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)ツールを使用してトレースデータを生成します。[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)の指示に従ってインストールします。

以下の構成は、OTLPレシーバーでトレースイベントを受信し、stdoutに送信します。

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

この構成を以下のように実行します。

```bash
./otelcol-contrib --config config-traces.yaml
```

`telemetrygen`を介してコレクタにトレースイベントを送信します：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

これにより、以下のようなトレースメッセージがstdoutに出力されます。

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

上記はOTelコレクタによって生成された単一のトレースメッセージを表しています。このメッセージは、後のセクションでClickHouseに取り込まれます。

トレースメッセージの完全なスキーマは、[こちら](https://opentelemetry.io/docs/concepts/signals/traces/)で維持されています。ユーザーはこのスキーマに慣れておくことを強くお勧めします。

## 処理 - フィルタリング、変換、エンリッチメント {#processing---filtering-transforming-and-enriching}

以前のログイベントのタイムスタンプを設定する例で示されたように、ユーザーはイベントメッセージをフィルタリング、変換、エンリッチすることを常に望むでしょう。これはOpenTelemetryの以下の機能を使用して達成できます。

- **プロセッサー** - プロセッサーは、[レシーバーによって収集されたデータを変更または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/)し、エクスポーターに送信する前にそれを行います。プロセッサーは、コレクタ構成の`processors`セクションで設定された順序で適用されます。これらはオプショナルですが、最小限のセットは[通常推奨されています](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。ClickHouseで使用するOTelコレクタを使用する場合、プロセッサーは以下のように制限することをお勧めします：

    - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)は、コレクタでのメモリ不足の状況を防ぎます。リソースの見積もりについては、[リソースの推定](#estimating-resources)を参照してください。
    - コンテキストに基づくエンリッチメントを行うプロセッサー。たとえば、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)は、k8sメタデータでスパン、メトリック、ログのリソース属性を自動的に設定し、イベントをそのソースポッドIDでエンリッチします。
    - トレースの場合に必要な[テールまたはヘッドサンプリング](https://opentelemetry.io/docs/concepts/sampling/)。
    - [基本的なフィルタリング](https://opentelemetry.io/docs/collector/transforming-telemetry/) - 演算子を使用してこれができない場合に不要なイベントをドロップします（下記参照）。
    - [バッチ処理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - ClickHouseで作業する際には必須であり、データがバッチで送信されることを保証します。["ClickHouseへのエクスポート"](#exporting-to-clickhouse)を参照してください。

- **演算子** - [演算子](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)は、レシーバーで利用可能な最も基本的な処理単位を提供します。基本のパースがサポートされており、たとえばSeverityやTimestampの設定が可能です。ここではJSONおよび正規表現パースがサポートされており、イベントのフィルタリングおよび基本的な変換が可能です。ここでイベントフィルタリングを実行することをお勧めします。

ユーザーは、演算子や[変換プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)を使用して過度にイベント処理を行うことを避けることをお勧めします。これらはかなりのメモリとCPUのオーバーヘッドを引き起こす可能性があり、特にJSONのパースで顕著です。すべての処理は、挿入時にClickHouseで実行することが可能で、マテリアライズドビューやカラムで行われますが、一部の例外—特にk8sメタデータの追加のようなコンテキストに気づいたエンリッチメント—があります。詳細については、[SQLによる構造の抽出](/use-cases/observability/schema-design#extracting-structure-with-sql)を参照してください。

OTelコレクタで処理が行われる場合は、ゲートウェイインスタンスで変換を行い、エージェントインスタンスで行う作業を最小限に抑えることをお勧めします。これにより、サーバー上で動作するエッジのエージェントに必要なリソースが最小限に保たれます。通常、ユーザーはフィルタリング（不要なネットワーク使用量を最小限に抑える）、タイムスタンプの設定（演算子による）、およびコンテキストが必要なエンリッチメントのみをエージェントで実行します。たとえば、ゲートウェイインスタンスが異なるKubernetesクラスターに存在する場合、k8sのエンリッチメントはエージェントで行う必要があります。

### 例 {#example-2}

以下の構成は、非構造化ログファイルの収集を示しています。演算子を使用してログ行から構造を抽出し（`regex_parser`）、イベントをフィルタリングし、プロセッサーを使用してイベントをバッチ処理し、メモリ使用量を制限します。

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
```yaml
title: 'ClickHouseへのエクスポート'
sidebar_label: 'ClickHouseへのエクスポート'
keywords: ['ClickHouse', 'エクスポーター', 'データ', 'OpenTelemetry']
description: 'ClickHouseへのデータエクスポートのためのエクスポーターと設定について説明します。'
```

## ClickHouseへのエクスポート {#exporting-to-clickhouse}

エクスポーターはデータを1つ以上のバックエンドまたは宛先に送信します。エクスポーターはプルまたはプッシュベースのものがあります。ClickHouseにイベントを送信するには、ユーザーはプッシュベースの [ClickHouseエクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md) を使用する必要があります。

:::note OpenTelemetry Collector Contribを使用
ClickHouseエクスポーターは、コアディストリビューションではなく、[OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main) の一部です。ユーザーは、contribディストリビューションを使用するか、[独自のコレクターを構築](https://opentelemetry.io/docs/collector/custom-collector/)することができます。
:::

完全な設定ファイルは以下に示されています。

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

以下の主要な設定に注意してください：

- **pipelines** - 上記の設定は、ログとトレース用の受信者、プロセッサ、エクスポーターのセットから構成される[パイプライン](https://opentelemetry.io/docs/collector/configuration/#pipelines)の使用を強調しています。
- **endpoint** - ClickHouseとの通信は、 `endpoint` パラメータを介して構成されます。接続文字列 `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` により、TCP経由で通信が行われます。トラフィックスイッチの理由からHTTPを好む場合は、この接続文字列を[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)に記載のように修正します。ユーザー名とパスワードをこの接続文字列内で指定する能力を含む、完全な接続詳細は[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)で説明されています。

**重要:** 上記の接続文字列は、圧縮（lz4）と非同期挿入の両方を有効にします。どちらも常に有効にすることを推奨します。非同期挿入に関する詳細は、[バッチ処理](#batching)をご参照ください。圧縮は常に指定する必要があり、古いバージョンのエクスポーターではデフォルトで有効になっていません。

- **ttl** - ここでの値はデータがどのくらい保持されるかを決定します。「データの管理」の詳細については、ここをご覧ください。この値は、72hのように時間単位で指定する必要があります。データが2019年のものでClickHouseによって直ちに削除されるため、以下の例ではTTLを無効にしています。
- **traces_table_name** および **logs_table_name** - ログおよびトレースのテーブル名を決定します。
- **create_schema** - 起動時にテーブルをデフォルトスキーマで作成するかどうかを決定します。開始するためにはtrueがデフォルトです。ユーザーはこれをfalseに設定し、独自のスキーマを定義する必要があります。
- **database** - 対象のデータベース。
- **retry_on_failure** - 失敗したバッチが再試行されるかどうかを決定する設定。
- **batch** - バッチプロセッサはイベントがバッチとして送信されることを保証します。5秒のタイムアウトで、約5000の値を推奨します。これらのうちどちらかが最初に達成されると、エクスポーターにフラッシュされるバッチが開始されます。これらの値を下げると、低レイテンシのパイプラインが実現され、クエリのためにデータがより早く利用可能になりますが、ClickHouseに送信される接続とバッチが多くなるという代償があります。[非同期挿入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を使用しない場合は推奨されません。[あまりにも多くのパーツ](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts)に問題が発生する可能性があります。一方、非同期挿入を使用する場合、クエリのためのデータの可用性は非同期挿入設定にも依存しますが、コネクタからデータは早くフラッシュされます。[バッチ処理](#batching)の詳細については、こちらをご覧ください。
- **sending_queue** - 送信キューのサイズを制御します。キュー内の各アイテムはバッチを含みます。このキューが超過された場合（例：ClickHouseが到達できないがイベントが到着し続ける場合）、バッチはドロップされます。

ユーザーが構造化されたログファイルを抽出して [ClickHouseのローカルインスタンス](/install) を実行していると仮定します（デフォルトの認証で）、ユーザーは次のコマンドを実行してこの設定を行います。

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

このコレクターにトレースデータを送信するには、次のコマンドを `telemetrygen` ツールを使用して実行します。

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

実行中は、シンプルなクエリでログイベントが存在することを確認します。

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


同様に、トレースイベントの場合、ユーザーは `otel_traces` テーブルを確認できます。

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
## 既定のスキーマ {#out-of-the-box-schema}

デフォルトでは、ClickHouseエクスポーターは、ログとトレースの両方に対するターゲットログテーブルを作成します。これを `create_schema` 設定を介して無効にすることができます。さらに、ログとトレーステーブルの名前は、上記の設定を介してデフォルトの `otel_logs` および `otel_traces` から変更できます。

:::note
以下のスキーマでは、TTLが72hとして有効になっていると仮定しています。
:::

ログのデフォルトスキーマは以下に示されています（`otelcol-contrib v0.102.1`）：

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

ここでのカラムは、[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)で文書化されているOTel公式仕様のログによるものです。

このスキーマに関するいくつかの重要な注意点：

- デフォルトでは、テーブルは `PARTITION BY toDate(Timestamp)` を介して日付でパーティション化されています。これにより、期限切れデータを効率的に削除できます。
- TTLは `TTL toDateTime(Timestamp) + toIntervalDay(3)` によって設定され、コレクター構成で指定された値に対応します。[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) は、すべての行が期限切れたときに全体のパーツのみがドロップされることを意味します。これは、パーツ内の行を削除するよりも効率的であり、高コストの削除を回避します。これを常に設定することを推奨します。TTLによるデータ管理の詳細は、[こちら](/observability/managing-data#data-management-with-ttl-time-to-live)をご覧ください。
- テーブルは古典的な [`MergeTree` エンジン](/engines/table-engines/mergetree-family/mergetree) を使用しています。これはログとトレースに推奨され、変更する必要はないはずです。
- テーブルは `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)` によって並べ替えられています。これは、クエリが `ServiceName`, `SeverityText`, `Timestamp`, `TraceId` に対して最適化されることを意味します。リストの前にあるカラムは、後のものよりも高速にフィルタリングされます。たとえば、`ServiceName` でフィルタリングすると、`TraceId` でフィルタリングするよりも大幅に高速になります。ユーザーは、期待されるアクセスパターンに従ってこの順序を変更する必要があります。詳細は、[プライマリキーの選択](/use-cases/observability/schema-design#choosing-a-primary-ordering-key)をご覧ください。
- 上記のスキーマは、カラムに `ZSTD(1)` を適用します。これはログに対する最良の圧縮を提供します。ユーザーは、最良の圧縮を得るためにZSTD圧縮レベル（デフォルトの1を超えて）を上げることができますが、これはめったに有益ではありません。この値を増すと、挿入時にCPUオーバーヘッドが大きくなります（圧縮中）、ただし、圧縮解除（およびしたがってクエリ）は比較可能であるべきです。詳細は[こちら](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)をご覧ください。追加の[デルタエンコーディング](/sql-reference/statements/create/table#delta)は、ディスク上のサイズを削減することを目的としてTimestampに適用されます。
- `ResourceAttributes` (https://opentelemetry.io/docs/specs/otel/resource/sdk/)、`LogAttributes` (https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) および `ScopeAttributes` (https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) がマップであることに注意してください。ユーザーはこれらの間の違いについて理解しておく必要があります。これらのマップにアクセスし、キーへのアクセスを最適化する方法については、[こちら](/use-cases/observability/integrating-opentelemetry.md)をご覧ください。
- その他のほとんどのタイプは、`ServiceName`をLowCardinalityとして最適化されています。ただし、例に挙げたJSON形式のBodyはStringとして格納されています。
- ブルームフィルターは、マップのキーと値、およびBodyカラムに適用されます。これは、これらのカラムにアクセスする際のクエリ時間を改善することを目的としていますが、通常は必要ありません。詳細は[こちら](/use-cases/observability/schema-design#secondarydata-skipping-indices)をご覧ください。

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

これもまた、[こちら](https://opentelemetry.io/docs/specs/otel/trace/api/)で文書化されているOTel公式仕様に対応するカラムを使用しています。このスキーマは、上記のログスキーマと多くの同じ設定を採用していますが、スパンに特有の追加のリンクカラムを含んでいます。

ユーザーには、スキーマの自動作成を無効にし、テーブルを手動で作成することをお勧めします。これにより、プライマリおよびセカンダリキーの変更が可能になり、クエリパフォーマンスを最適化するための追加のカラムを導入する機会が得られます。詳細は、[スキーマデザイン](/use-cases/observability/schema-design)をご覧ください。
## 挿入の最適化 {#optimizing-inserts}

高い挿入パフォーマンスを達成し、強い一貫性の保証を得るために、ユーザーはコレクターを介してClickHouseに観測データを挿入する際にシンプルなルールに従うべきです。OTelコレクターの正しい設定があれば、以下のルールは守りやすくなります。これにより、ClickHouseを初めて使用する際にユーザーが遭遇する[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)を回避できます。
### バッチ処理 {#batching}

デフォルトでは、ClickHouseに送信される各挿入はClickHouseが直ちに、挿入からのデータを含むストレージの部分を作成するトリガーとなります。他のメタデータも格納する必要があります。したがって、より多くのデータを含む少数の挿入を送信する方が、より少ないデータを含む多数の挿入を送信するよりも、必要な書き込みの数が減少します。ユーザーには、少なくとも1,000行の大きなバッチでデータを挿入することをお勧めします。さらなる詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)をご覧ください。

デフォルトでは、ClickHouseへの挿入は同期的で、同じ場合は冪等です。マージツリーエンジンファミリーのテーブルの場合、ClickHouseはデフォルトで自動的に[挿入の重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)を行います。このため、以下のようなケースで挿入が耐性があります。

- (1) データを受け取るノードに問題が発生した場合、挿入クエリはタイムアウトするか（またはより具体的なエラーが表示され）、確認を受けません。
- (2) データがノードによって書き込まれたが、ネットワークの中断のために確認がクエリの送信元に返されない場合、送信者はタイムアウトまたはネットワークエラーを受け取ります。

コレクターの視点から見ると、(1)と(2)は区別が難しい場合があります。ただし、どちらのケースでも、確認されなかった挿入はすぐに再試行できます。再試行される挿入クエリが同じデータを同じ順序で含んでいる限り、ClickHouseは元の（確認されていない）挿入が成功した場合、再試行された挿入を自動的に無視します。

ユーザーには、上記を満たすために[バッチプロセッサ](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)を使用することをお勧めします。これにより、行の一貫したバッチが送信されることが保証されます。コレクターが高いスループット（イベント/秒）を持つことが期待され、1回の挿入に少なくとも5000のイベントが送信できる場合、これは通常、パイプライン内で必要な唯一のバッチ処理です。この場合、コレクターはバッチプロセッサの `timeout` に達する前にバッチをフラッシュし、パイプラインのエンドツーエンドのレイテンシが低く、バッチが一貫したサイズであることを保証します。
### 非同期挿入の使用 {#use-asynchronous-inserts}

通常、スループットが低い場合、ユーザーは小さなバッチを送信する必要がありながら、最小限のエンドツーエンドレイテンシ内でデータがClickHouseに到達することを期待します。この場合、バッチプロセッサの `timeout` が切れると、小さなバッチが送信されます。これは問題を引き起こし、非同期挿入が必要になります。このケースは、**エージェントの役割を持つコレクターがClickHouseに直接送信するように構成されているときに通常発生します**。ゲートウェイは集約器として機能することでこの問題を軽減できます - [ゲートウェイでのスケーリング](#scaling-with-gateways)を参照してください。

大きなバッチが確実に保証されない場合、ユーザーは[非同期挿入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)を使用してClickHouseにバッチ処理を委任できます。非同期挿入では、データは最初にバッファに挿入され、後でデータベースストレージに書き込まれます。

<Image img={observability_6} alt="Async inserts" size="md"/>

[非同期挿入を有効にする](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)と、ClickHouseは ① 挿入クエリを受信したときに、クエリのデータを ② 最初にメモリバッファに書き込みます。次に ③ バッファフラッシュが行われると、バッファのデータが[ソートされて](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)、データベースストレージの部品として書き込まれます。データは、データベースストレージにフラッシュされるまでクエリで検索可能ではありません。バッファフラッシュは[構成可能です](/optimize/asynchronous-inserts)。

コレクターの非同期挿入を有効にするには、接続文字列に `async_insert=1` を追加します。ユーザーには、配信保証を得るために `wait_for_async_insert=1`（デフォルト）を使用することをお勧めします - 詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)をご覧ください。

非同期挿入からのデータは、ClickHouseのバッファがフラッシュされたときに挿入されます。これは、[`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) が超過されるか、最初のINSERTクエリから[`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size)ミリ秒が経過したときに発生します。また、`async_insert_stale_timeout_ms`がゼロ以外の値に設定されている場合、データは最後のクエリから`async_insert_stale_timeout_ms`ミリ秒後に挿入されます。ユーザーは、パイプラインのエンドツーエンドレイテンシを制御するためにこれらの設定を調整できます。バッファフラッシュを調整するために使用できる追加の設定は[こちら](/operations/settings/settings#async_insert)で文書化されています。一般的に、デフォルトは適切であると考えられます。

:::note 適応型非同期挿入を考慮
使用されるエージェントの数が少なく、スループットが低いが厳密なエンドツーエンドのレイテンシ要件がある場合、[適応型非同期挿入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts)が役に立つかもしれません。一般的に、これはClickHouseでの高スループット観測使用ケースには適用されません。
:::

最後に、非同期挿入を使用する際に、ClickHouseへの同期挿入に関連する以前の重複排除動作はデフォルトで無効になっています。必要な場合は、設定 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate) を参照してください。

この機能の構成に関する完全な詳細は[こちら](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)で見つけることができ、深い理解は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)で得られます。
## デプロイメントアーキテクチャ {#deployment-architectures}

OTelコレクターをClickHouseと共に使用する際には、いくつかのデプロイメントアーキテクチャが考えられます。以下にそれぞれの説明と適用可能な場合を記載します。
### エージェントのみ {#agents-only}

エージェントのみのアーキテクチャでは、ユーザーはOTelコレクターをエッジにエージェントとしてデプロイします。これらはローカルアプリケーションからトレースを受信し（例：サイドカーコンテナとして）、サーバーやKubernetesノードからログを収集します。このモードでは、エージェントはデータをClickHouseに直接送信します。

<Image img={observability_7} alt="Agents only" size="md"/>

このアーキテクチャは、小規模から中規模のデプロイメントに適しています。その主な利点は、追加のハードウェアを必要とせず、ClickHouseの観測ソリューションのリソースフットプリントが最小限に抑えられ、アプリケーションとコレクターの間の単純なマッピングが維持されることです。

エージェントの数が数百を超えると、ユーザーはゲートウェイベースのアーキテクチャへの移行を検討すべきです。このアーキテクチャには、スケーラビリティを難しくするいくつかの欠点があります：

- **接続スケーリング** - 各エージェントはClickHouseに接続を確立します。ClickHouseは数百（場合によっては数千）の同時挿入接続を維持できますが、最終的にはこれが制限要因となり、挿入の効率が悪化します。つまり、ClickHouseが接続を維持するために追加のリソースを使用することになります。ゲートウェイを使用することで、接続の数が最小限に抑えられ、挿入の効率が向上します。
- **エッジでの処理** - このアーキテクチャでは、すべての変換やイベント処理がエッジまたはClickHouseで実行される必要があります。制限されるだけでなく、複雑なClickHouseマテリアライズドビューや、重要なサービスに影響を与え、リソースが不足しているエッジにかなりの計算を押し付けることを意味します。
- **小さなバッチとレイテンシ** - エージェントコレクターは、個別に非常に少数のイベントを収集する場合があります。これは通常、納品SLAを満たすために設定インターバルでフラッシュするように構成される必要があることを意味します。これにより、コレクターがClickHouseに小さなバッチを送信することになる場合があります。デメリットですが、非同期挿入を使用することで軽減できます - [挿入の最適化](#optimizing-inserts)を参照してください。
```
### Gatewaysを使用したスケーリング {#scaling-with-gateways}

OTelコレクタは、上記の制限に対処するためにGatewayインスタンスとしてデプロイできます。これらは、通常はデータセンターまたは地域ごとのスタンドアロンサービスを提供します。これらは、アプリケーション（またはエージェント役割の他のコレクタ）からのイベントを単一のOTLPエンドポイントを介して受信します。通常、複数のGatewayインスタンスがデプロイされ、ロードバランサーを使用して負荷を分散します。

<Image img={observability_8} alt="Gatewaysを使用したスケーリング" size="md"/>

このアーキテクチャの目的は、エージェントから計算集約的な処理をオフロードし、それによってリソース使用量を最小限に抑えることです。これらのGatewayは、エージェントによって実行される必要がある変換タスクを実行できます。さらに、多くのエージェントからのイベントを集約することで、Gatewayは大きなバッチがClickHouseに送信され、効率的な挿入を可能にします。これらのGatewayコレクタは、エージェントが追加され、イベントのスループットが増加した場合に簡単にスケーリングできます。以下は、例としてのGateway設定と、例の構造化ログファイルを消費する関連するエージェント設定の例です。エージェントとGateway間の通信にOTLPを使用している点に注意してください。

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
      insecure: true # セキュア接続を使用している場合はfalseに設定
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # 同じホストで2つのコレクタが実行されるとして修正
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

これらの設定は、以下のコマンドを使用して実行できます。

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

このアーキテクチャの主な欠点は、一連のコレクタを管理するためのコストとオーバーヘッドです。

より大規模なGatewayベースのアーキテクチャを管理する例については、こちらの[ブログ記事](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)をおすすめします。
### Kafkaの追加 {#adding-kafka}

読者は、上記のアーキテクチャがメッセージキューとしてKafkaを使用していないことに気づくかもしれません。

Kafkaキューをメッセージバッファとして使用するのは、ログアーキテクチャでよく見られる人気のある設計パターンであり、ELKスタックによって普及しました。これにはいくつかの利点があります。主に、より強力なメッセージ配送保証を提供し、バックプレッシャーの処理に役立ちます。メッセージは収集エージェントからKafkaに送信され、ディスクに書き込まれます。理論的には、クラスタ化されたKafkaインスタンスは高スループットのメッセージバッファを提供するはずですが、データをディスクに直線的に書き込む方が、メッセージを解析して処理するよりも計算オーバーヘッドが少なくなります。たとえば、Elasticではトークン化とインデックス作成に多大なオーバーヘッドが発生します。エージェントからデータを移動させることで、ソースでのログ回転の結果としてメッセージを失うリスクも減少します。最後に、メッセージの返信やクロスリージョンのレプリケーション機能が提供され、特定のユースケースには魅力的かもしれません。

しかし、ClickHouseはデータの挿入を非常に迅速に処理でき、適度なハードウェア上で毎秒数百万行の処理が可能です。ClickHouseからのバックプレッシャーは**まれ**です。Kafkaキューを活用することは、しばしばアーキテクチャの複雑さやコストを増加させます。ログには銀行取引やその他のミッションクリティカルなデータと同じ配送保証は必要ないという原則を受け入れることができれば、Kafkaの複雑さを避けることをお勧めします。

ただし、高い配送保証やデータの再生能力（複数のソースに対して）を必要とする場合、Kafkaは有効なアーキテクチャの追加要素となることがあります。

<Image img={observability_9} alt="Kafkaの追加" size="md"/>

この場合、OTelエージェントは[Kafkaエクスポータ](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md)を介してデータをKafkaに送信するように構成できます。Gatewayインスタンスは、[Kafkaレシーバ](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md)を使用してメッセージを消費します。詳細については、ConfluentおよびOTelドキュメントを参照することをお勧めします。
### リソースの見積もり {#estimating-resources}

OTelコレクタのリソース要件は、イベントのスループット、メッセージのサイズ、および実行される処理の量によって異なります。OpenTelemetryプロジェクトは、リソース要件を見積もるために使用できる[ベンチマークユーザー](https://opentelemetry.io/docs/collector/benchmarks/)を維持しています。

[私たちの経験では](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)、3つのコアと12GBのRAMを持つGatewayインスタンスは、毎秒約60,000イベントを処理できます。これは、フィールドのリネームを行う最小限の処理パイプラインが責任を負っていることを前提としています。

エージェントインスタンスは、イベントをGatewayに送信し、イベントのタイムスタンプのみを設定する責任があり、ユーザーは予想される毎秒のログに基づいてサイズを調整することをお勧めします。以下は、ユーザーが出発点として使用できるおおよその数値を示しています：

| ロギングレート  | コレクタエージェントのリソース |
|--------------|------------------------------|
| 1k/秒      | 0.2CPU, 0.2GiB              |
| 5k/秒      | 0.5 CPU, 0.5GiB             |
| 10k/秒     | 1 CPU, 1GiB                 |
