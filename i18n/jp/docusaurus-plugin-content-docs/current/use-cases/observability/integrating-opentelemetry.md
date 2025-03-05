
---
title: OpenTelemetryの統合
description: 視認性のためのOpenTelemetryとClickHouseの統合
slug: /observability/integrating-opentelemetry
keywords: [observability, logs, traces, metrics, OpenTelemetry, Grafana, OTel]
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';


# OpenTelemetryによるデータ収集の統合

あらゆる観測ソリューションは、ログやトレースを収集してエクスポートする手段を必要とします。この目的のために、ClickHouseは[OpenTelemetry (OTel)プロジェクト](https://opentelemetry.io/)を推奨しています。

"OpenTelemetryは、トレース、メトリクス、ログなどのテレメトリデータを作成および管理するために設計された観測フレームワークおよびツールキットです。"

ClickHouseやPrometheusとは異なり、OpenTelemetryは観測バックエンドではなく、テレメトリデータの生成、収集、管理、エクスポートに焦点を当てています。OpenTelemetryの初期の目的は、ユーザーが言語特有のSDKを使用して自分のアプリケーションやシステムを容易に計測できるようにすることでしたが、OpenTelemetryコレクターを介してログを収集することも含むように拡張されました。コレクターは、テレメトリデータを受信、処理、エクスポートするエージェントまたはプロキシです。

## ClickHouse関連コンポーネント {#clickhouse-relevant-components}

OpenTelemetryは多数のコンポーネントで構成されています。データおよびAPIの仕様、標準化されたプロトコル、フィールド/カラムの命名規則を提供するだけでなく、OTelはClickHouseで観測ソリューションを構築するための基本的な2つの機能を提供します。

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)は、テレメトリデータを受信、処理、エクスポートするプロキシです。ClickHouseを利用したソリューションは、ログ収集とイベント処理のためにこのコンポーネントを使用します。
- [言語SDK](https://opentelemetry.io/docs/languages/)は、仕様、API、およびテレメトリデータのエクスポートを実装します。これらのSDKは、アプリケーションコード内でトレースが正しく記録されることを保証し、構成要素のスパンを生成し、メタデータを介してサービス間でコンテキストが伝播されることを確実にします。これにより、分散トレースが形成され、スパンが相関できるようになります。これらのSDKは、自動的に一般的なライブラリやフレームワークを実装するエコシステムによって補完されるため、ユーザーはコードを変更する必要がなく、即時の計測が得られます。

ClickHouseを利用した観測ソリューションは、これらのツールの両方を活用します。

## ディストリビューション {#distributions}

OpenTelemetryコレクターには[多数のディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)があります。ClickHouseソリューションに必要なfilelogレシーバーとClickHouseエクスポータは、[OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)にのみ存在します。

このディストリビューションは多くのコンポーネントを含み、ユーザーがさまざまな構成を試行できるようにします。ただし、プロダクションでの運用時には、コレクターに必要なコンポーネントのみを含めることを推奨します。これには以下のいくつかの理由があります：

- コレクターのサイズを削減し、デプロイ時間を短縮する
- 利用可能な攻撃面を減少させ、コレクターのセキュリティを向上させる

[カスタムコレクター](https://opentelemetry.io/docs/collector/custom-collector/)は、[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)を使用して構築できます。

## OTelを使用したデータの取り込み {#ingesting-data-with-otel}
### コレクターのデプロイ役割 {#collector-deployment-roles}

ログを収集してClickHouseに挿入するために、OpenTelemetry Collectorの使用を推奨します。OpenTelemetry Collectorは、主に2つの役割でデプロイできます：

- **エージェント** - エージェントインスタンスは、サーバーやKubernetesノードなどのエッジでデータを収集するか、アプリケーションから直接イベントを受信します。後者の場合、エージェントインスタンスはアプリケーションと共に、または同じホスト上で実行されます（サイドカーやDaemonSetのように）。エージェントは、データを直接ClickHouseに送信するか、ゲートウェイインスタンスに送信することができます。前者の場合、これを[エージェントデプロイパターン](https://opentelemetry.io/docs/collector/deployment/agent/)と呼びます。
- **ゲートウェイ** - ゲートウェイインスタンスは、スタンドアロンサービス（たとえば、Kubernetes内のデプロイメント）を提供し、通常はクラスターごと、データセンターごと、またはリージョンごとにデプロイされます。これらは、単一のOTLPエンドポイントを介してアプリケーション（または別のコレクターからのエージェント）のイベントを受信します。通常、一連のゲートウェイインスタンスがデプロイされ、負荷を分散するためにアウト・オブ・ザ・ボックスのロードバランサーが使用されます。すべてのエージェントとアプリケーションがこの単一のエンドポイントにシグナルを送信すると、これを[ゲートウェイデプロイパターン](https://opentelemetry.io/docs/collector/deployment/gateway/)と呼ぶことがよくあります。

以下では、単純なエージェントコレクターがClickHouseに直接イベントを送信するものとします。ゲートウェイの使用と適用時期についての詳細は[ゲートウェイを使ったスケーリング](#scaling-with-gateways)を参照してください。

### ログの収集 {#collecting-logs}

コレクターを使用する主な利点は、サービスがデータを迅速にオフロードできることです。コレクターは、リトライ、バッチ処理、暗号化、さらには機密データのフィルタリングなどの追加処理を行います。

コレクターは、[受信者](https://opentelemetry.io/docs/collector/configuration/#receivers)、[プロセッサー](https://opentelemetry.io/docs/collector/configuration/#processors)、および[エクスポーター](https://opentelemetry.io/docs/collector/configuration/#exporters)という3つの主要な処理段階のための用語を使用します。受信者はデータ収集に使用され、プルまたはプッシュベースのいずれかになります。プロセッサーはメッセージの変換や強化を実行する能力を提供します。エクスポーターは、データを下流サービスに送信する役割を担っています。このサービスは理論的には別のコレクターである可能性がありますが、以下の最初の議論では、すべてのデータが直接ClickHouseに送信されると仮定します。

<img src={observability_3}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

ユーザーは、受信者、プロセッサー、およびエクスポーターの完全なセットに精通することを推奨します。

コレクターは、ログを収集するための2つの主要受信者を提供します：

**OTLP経由** - この場合、ログはOTLPプロトコルを介してOpenTelemetry SDKからコレクターに直接（プッシュ）されます。[OpenTelemetryデモ](https://opentelemetry.io/docs/demo/)は、このアプローチを採用しており、各言語のOTLPエクスポーターはローカルのコレクターエンドポイントを想定しています。この場合、コレクターはOTLP受信者で構成する必要があります。—上記の[デモの設定を参照](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)。このアプローチの利点は、ログデータに自動的にトレースIDが含まれ、ユーザーが特定のログのトレースやその逆を後で識別できることです。

<img src={observability_4}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

このアプローチでは、ユーザーが[適切な言語SDK](https://opentelemetry.io/docs/languages/)でコードを計測する必要があります。

- **Filelog受信者を介したスクレイピング** - この受信者は、ディスク上のファイルをトレースし、ログメッセージを形成してClickHouseに送信します。この受信者は、マルチラインメッセージの検出、ログのロールオーバー、再起動時の堅牢性のためのチェックポイント、および構造の抽出などの複雑なタスクを処理します。この受信者は、DockerやKubernetesコンテナログをトレースすることもでき、helmチャートとしてデプロイ可能で、これらから構造を[抽出し](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)、ポッドの詳細で強化します。

<img src={observability_5}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

**ほとんどのデプロイメントは上記の受信者の組み合わせを使用します。ユーザーは[コレクタードキュメント](https://opentelemetry.io/docs/collector/)を読んで基本的な概念と[設定構造](https://opentelemetry.io/docs/collector/configuration/)および[インストール方法](https://opentelemetry.io/docs/collector/installation/)に精通することを推奨します。**

:::note 注: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/)は、設定を検証および視覚化するのに便利です。
:::

## 構造化ログと非構造化ログ {#structured-vs-unstructured}

ログは、構造化されている場合と非構造化されている場合があります。

構造化ログは、JSONのようなデータ形式を使用し、httpコードやソースIPアドレスのようなメタデータフィールドを定義します。

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

非構造化ログは、通常、正規表現パターンを介して抽出可能な固有の構造を持ちながら、ログを単に文字列として表現します。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

ユーザーは、可能な限り構造化されたロギングを使用し、JSON（つまりndjson）でログを記録することを強く推奨します。これにより、ClickHouseに送信する前もしくは挿入時に[コレクタープロセッサー](https://opentelemetry.io/docs/collector/configuration/#processors)を使用して、後でログの処理が簡素化されます。構造化ログは、後の処理リソースを節約し、ClickHouseソリューションで必要なCPUを削減します。

### 例 {#example}

例の目的で、構造化（JSON）および非構造化のロギングデータセットを提供します。各データセットには約10m行が含まれています。以下のリンクから入手可能です：

- [非構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

以下の例では構造化データセットを使用します。このファイルをダウンロードして解凍して、以下の例を再現してください。

次の構成は、OTelコレクターがこれらのファイルをディスク上で読み取り、filelog受信者を使用し、結果として得られるメッセージをstdoutに出力するための簡単な設定を表しています。ログが構造化されているため、[`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md)オペレーターを使用します。access-structured.logファイルのパスを変更してください。

:::note ClickHouseによるパースを検討
以下の例は、ログからタイムスタンプを抽出します。これには、`json_parser`オペレーターを使用して、ログ行全体をJSON文字列に変換し、結果を`LogAttributes`に配置する必要があります。これは計算コストが高く、[ClickHouseでより効率的に行うことができます](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [SQLで構造を抽出する](/use-cases/observability/schema-design#extracting-structure-with-sql)。当該`s`の非構造化の例は、[`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md)を使用して実現します。詳細は[こちら](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)で確認できます。
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

ユーザーは[公式のインストール手順](https://opentelemetry.io/docs/collector/installation/)に従って、コレクターをローカルにインストールできます。重要なのは、[contribディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)（`filelog`受信者を含む）を使用するように指示が変更されていることを確認することです。例えば、`otelcol_0.102.1_darwin_arm64.tar.gz`の代わりに、ユーザーは`otelcol-contrib_0.102.1_darwin_arm64.tar.gz`をダウンロードします。リリースは[こちら](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)で見つけることができます。

インストールが完了したら、OTelコレクターは以下のコマンドで実行できます：

```bash
./otelcol-contrib --config config-logs.yaml
```

構造化ログを使用している場合、メッセージは出力で以下のような形になります：

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

上記は、OTelコレクターによって生成された単一のログメッセージを表しています。これらのメッセージは、後のセクションでClickHouseに取り込むことになります。

ログメッセージの完全なスキーマと、他の受信者を使用している場合は存在する可能性のある追加のカラムは、[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)で維持されています。**ユーザーはこのスキーマに慣れることを強く推奨します。**

ここでの重要なポイントは、ログ行自体が`Body`フィールド内の文字列として保持されている一方で、`json_parser`のおかげでJSONがAttributesフィールドに自動的に抽出されていることです。同様に、この[オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available)は、適切な`Timestamp`カラムにタイムスタンプを抽出するために使用されています。OTelを使用したログ処理の推奨事項については、[処理](#processing---filtering-transforming-and-enriching)を参照してください。

:::note オペレーター
オペレーターは、ログ処理の最も基本的な単位です。各オペレーターは、ファイルから行を読み取ったり、フィールドからJSONを解析したりするなど、単一の責任を果たします。オペレーターは、パイプライン内で必要な結果を得るために連鎖させます。
:::

上記のメッセージには`TraceID`または`SpanID`フィールドは含まれていません。これらは存在する可能性があり、たとえば、ユーザーが[分散トレース](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)を実装している場合は、上記の同じ技術を使用してJSONから抽出できます。

ローカルまたはKubernetesログファイルを収集する必要があるユーザーは、[filelog受信者](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration)の利用可能な設定オプションや、[オフセット](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking)および[複数行のログパースがどのように処理されているか](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)に慣れることをお勧めします。

## Kubernetesログの収集 {#collecting-kubernetes-logs}

Kubernetesログの収集については、[OpenTelemetryドキュメントガイド](https://opentelemetry.io/docs/kubernetes/)を推奨します。[Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor)は、ポッドメタデータでログやメトリクスを強化するために推奨されます。これにより、動的メタデータ（たとえば、ラベル）が作成され、`ResourceAttributes`カラムに保存される可能性があります。ClickHouseは現在、このカラムにタイプ`Map(String, String)`を使用しています。[マップの使用](/use-cases/observability/schema-design#using-maps)および[マップからの抽出](/use-cases/observability/schema-design#extracting-from-maps)についての詳細は、最適化や取り扱いに関するさらなる情報を参照してください。

## トレースの収集 {#collecting-traces}

コードに計測を実装し、トレースを収集したいユーザーには、公式の[OTelドキュメント](https://opentelemetry.io/docs/languages/)に従うことを推奨します。

イベントをClickHouseに送信するには、ユーザーはOTelコレクターをデプロイし、適切な受信者を介してOTLPプロトコルでトレースイベントを受信する必要があります。OpenTelemetryデモは、[各サポートされる言語を計測してコレクターに送信する例](https://opentelemetry.io/docs/demo/)を提供します。以下に、stdoutにイベントを出力するための適切なコレクター構成の例を示します：

### 例 {#example-1}

トレースはOTLPを介して受信する必要があるため、[`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)ツールを使用してトレースデータを生成します。インストール手順は[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)を参照してください。

以下の構成は、OTLP受信者でトレースイベントを受信し、stdoutに送信します。

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

この構成は次のようにして実行します：

```bash
./otelcol-contrib --config config-traces.yaml
```

トレースイベントは`telemetrygen`を介してコレクターに送信されます：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

これにより、以下のようなトレースメッセージがstdoutに出力されます：

```response
Span #86
	Trace ID   	: 1bb5cdd2c9df5f0da320ca22045c60d9
	Parent ID  	: ce129e5c2dd51378
	ID         	: fbb14077b5e149a0
	Name       	: okey-dokey-0
	Kind       	: Server
	Start time 	: 2024-06-19 18:03:41.603868 +0000 UTC
	End time   	: 2024-06-19 18:03:41.603991 +0000 UTC
	Status code	: Unset
	Status message :
Attributes:
 	-> net.peer.ip: Str(1.2.3.4)
 	-> peer.service: Str(telemetrygen-client)
```

上記は、OTelコレクターによって生成された単一のトレースメッセージを表しています。これらのメッセージは、後のセクションでClickHouseに取り込むことになります。

トレースメッセージの完全なスキーマは[こちら](https://opentelemetry.io/docs/concepts/signals/traces/)で維持されています。ユーザーがこのスキーマにも精通することを強く推奨します。

## 処理 - フィルタリング、変換、および強化 {#processing---filtering-transforming-and-enriching}

ログイベントのタイムスタンプ設定の前の例で示したように、ユーザーは必然的にイベントメッセージをフィルタリング、変換、および強化したいと考えるでしょう。これは、OpenTelemetryの多くの機能を使用して実現できます。

- **プロセッサー** - プロセッサーは、[受信者によって収集されたデータを修正または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/)し、エクスポーターに送信します。プロセッサーは、コレクターの構成の`processors`セクションに設定された順序で適用されます。これらはオプションですが、[最小限のセットが一般に推奨されます](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。ClickHouseにOTelコレクターを使用する場合、プロセッサーは以下のように制限することを推奨します：

    - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)は、コレクターのメモリ不足の状況を防ぐために使用されます。[リソースの見積もり](#estimating-resources)に関する推奨事項を参照してください。
    - コンテキストに基づいて強化を行うプロセッサー。たとえば、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)は、k8sメタデータでスパン、メトリクス、ログリソース属性を自動的に設定することを許可します。
    - トレースが必要な場合の[テールまたはヘッドサンプリング](https://opentelemetry.io/docs/concepts/sampling/)。
    - [基本的なフィルタリング](https://opentelemetry.io/docs/collector/transforming-telemetry/) - オペレーターを使用できない場合、不要なイベントをドロップします（以下を参照）。
    - [バッチ処理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - ClickHouseでデータをバッチで送信するために必須です。[ClickHouseへのエクスポート]("#exporting-to-clickhouse")を参照してください。

- **オペレーター** - [オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)は、受信者で利用可能な最も基本的な処理単位を提供します。基本的なパースがサポートされ、SeverityやTimestampなどのフィールドを設定できます。JSONおよび正規表現パースがサポートされており、イベントフィルタリングや基本的な変換も可能です。ここでイベントフィルタリングを行うことを推奨します。

ユーザーは、オペレーターや[変換プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)を用いた過度なイベント処理を避けることをお勧めします。これらは特にJSONパースにおいて相当なメモリおよびCPUオーバーヘッドを招く可能性があります。挿入時にClickHouseですべての処理を行うことができ、マテリアライズドビューとカラムにおいて例外もあります - 特に、k8sメタデータの追加などのコンテキスト認識の強化を除きます。詳細は[SQLで構造を抽出する](/use-cases/observability/schema-design#extracting-structure-with-sql)を参照してください。

OTelコレクターを使用して処理を行う際は、ゲートウェイインスタンスで変換を行い、エージェントインスタンスで行う作業を最小限に抑えることを推奨します。これは、サーバー上で実行されているエッジのエージェントが必要とするリソースを最小限に抑えます。通常、ユーザーは、不要なネットワーク使用量を最小限に抑えるためのフィルタリング（通信量削減）、オペレーターによるタイムスタンプ設定、およびエージェントでのコンテキストが必要な強化の処理を行います。たとえば、ゲートウェイインスタンスが異なるKubernetesクラスターに存在する場合、k8sの強化はエージェントで行う必要があります。

### 例 {#example-2}

以下の構成は、非構造化ログファイルの収集を示しています。ログ行から構造を抽出するためのオペレーター（`regex_parser`）を使用してイベントをフィルタリングし、イベントをバッチ処理しメモリ使用量を制限するためのプロセッサーを使用しています。

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

エクスポータは、データを1つ以上のバックエンドまたは宛先に送信します。エクスポータは、プル型またはプッシュ型のいずれかです。ClickHouseにイベントを送信するためには、ユーザーはプッシュ型の [ClickHouseエクスポータ](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)を使用する必要があります。

:::note OpenTelemetry Collector Contribの使用
ClickHouseエクスポータは、コアディストリビューションではなく、[OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main)の一部です。ユーザーは、contribディストリビューションを使用するか、[独自のコレクタを構築](https://opentelemetry.io/docs/collector/custom-collector/)することができます。
:::

以下に完全な設定ファイルの例を示します。

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

以下の主要設定に注意してください：

- **pipelines** - 上記の設定は、ログとトレース用の受信者、プロセッサ、エクスポータで構成された[パイプライン](https://opentelemetry.io/docs/collector/configuration/#pipelines)の使用を強調しています。
- **endpoint** - ClickHouseとの通信は、`endpoint`パラメータを介して構成されます。接続文字列`tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1`はTCPを介って通信を行うことを意味します。ユーザーがトラフィックスイッチングの理由でHTTPを好む場合は、接続文字列を[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)の説明に従って修正してください。この接続文字列内にユーザー名とパスワードを指定できる詳細な接続情報は[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)に記載されています。

**重要:** 上記の接続文字列は、圧縮（lz4）および非同期挿入の両方を有効にします。両方を常に有効にすることをお勧めします。[バッチ処理](#batching)で非同期挿入に関する詳細を確認してください。古いバージョンのエクスポータではデフォルトで圧縮が有効にならないため、必ず指定する必要があります。

- **ttl** - ここでの値は、データが保持される期間を決定します。「データの管理」に関する詳細。これを時間単位（例：72h）で指定する必要があります。以下の例では、データが2019年のものであり、挿入されるとすぐにClickHouseによって削除されるため、TTLを無効にしています。
- **traces_table_name**および**logs_table_name** - ログおよびトレーステーブルの名前を決定します。
- **create_schema** - 起動時にテーブルがデフォルトスキーマで作成されるかどうかを決定します。開始のためにはデフォルトでtrueです。ユーザーはこれをfalseに設定し、自分のスキーマを定義する必要があります。
- **database** - ターゲットデータベース。
- **retry_on_failure** - 失敗したバッチを再試行するかどうかを決定する設定です。
- **batch** - バッチプロセッサは、イベントがバッチとして送信されることを保証します。5000の値と5秒のタイムアウトを持つことをお勧めします。これらのうちどちらかが最初に到達すると、バッチがエクスポータにフラッシュされます。これらの値を下げると、クエリの準備の早い低レイテンシパイプラインが得られますが、ClickHouseへの接続やバッチが増えることになります。非同期挿入を使用しない場合は推奨されません。[多すぎるパーツ](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts)の問題が発生する可能性があります。逆に、ユーザーが非同期挿入を使用している場合、クエリの準備のためのデータの可用性は非同期挿入の設定にも依存しますが、コネクタからのデータフラッシュは早くなります。[バッチ処理](#batching)で詳細を確認してください。
- **sending_queue** - 送信キューのサイズを制御します。キュー内の各項目はバッチを含みます。このキューが超過すると、ClickHouseに到達できないがイベントが到着し続ける場合、バッチが破棄されます。

ユーザーが構造化されたログファイルを抽出し、[ローカルのClickHouseインスタンス](/install)が実行中（デフォルトの認証で）であると仮定すると、ユーザーは以下のコマンドでこの設定を実行できます。

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

このコレクタにトレースデータを送信するには、以下のコマンドを`telemetrygen`ツールを使用して実行します：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

実行中に、簡単なクエリでログイベントが存在することを確認してください：

```sql
SELECT *
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:      	2019-01-22 06:46:14.000000000
TraceId:
SpanId:
TraceFlags:     	0
SeverityText:
SeverityNumber: 	0
ServiceName:
Body:           	{"remote_addr":"109.230.70.66","remote_user":"-","run_time":"0","time_local":"2019-01-22 06:46:14.000","request_type":"GET","request_path":"\/image\/61884\/productModel\/150x150","request_protocol":"HTTP\/1.1","status":"200","size":"1684","referer":"https:\/\/www.zanbil.ir\/filter\/p3%2Cb2","user_agent":"Mozilla\/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko\/20100101 Firefox\/64.0"}
ResourceSchemaUrl:
ResourceAttributes: {}
ScopeSchemaUrl:
ScopeName:
ScopeVersion:
ScopeAttributes:	{}
LogAttributes:  	{'referer':'https://www.zanbil.ir/filter/p3%2Cb2','log.file.name':'access-structured.log','run_time':'0','remote_user':'-','request_protocol':'HTTP/1.1','size':'1684','user_agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0','remote_addr':'109.230.70.66','request_path':'/image/61884/productModel/150x150','status':'200','time_local':'2019-01-22 06:46:14.000','request_type':'GET'}

1 row in set. Elapsed: 0.012 sec. Processed 5.04 thousand rows, 4.62 MB (414.14 thousand rows/s., 379.48 MB/s.)
Peak memory usage: 5.41 MiB.
```

同様に、トレースイベントについては、ユーザーは`otel_traces`テーブルを確認できます：

```sql
SELECT *
FROM otel_traces
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:      	2024-06-20 11:36:41.181398000
TraceId:        	00bba81fbd38a242ebb0c81a8ab85d8f
SpanId:         	beef91a2c8685ace
ParentSpanId:
TraceState:
SpanName:       	lets-go
SpanKind:       	SPAN_KIND_CLIENT
ServiceName:    	telemetrygen
ResourceAttributes: {'service.name':'telemetrygen'}
ScopeName:      	telemetrygen
ScopeVersion:
SpanAttributes: 	{'peer.service':'telemetrygen-server','net.peer.ip':'1.2.3.4'}
Duration:       	123000
StatusCode:     	STATUS_CODE_UNSET
StatusMessage:
Events.Timestamp:   []
Events.Name:    	[]
Events.Attributes:  []
Links.TraceId:  	[]
Links.SpanId:   	[]
Links.TraceState:   []
Links.Attributes:   []
```
## 組み込みスキーマ {#out-of-the-box-schema}

デフォルトでは、ClickHouseエクスポータは、ログとトレースの両方に対してターゲットログテーブルを作成します。これは`create_schema`設定を介して無効にできます。さらに、ログテーブルとトレーステーブルの名前は、上記の設定に従ってデフォルトの`otel_logs`と`otel_traces`から変更できます。

:::note 
以下のスキーマでは、TTLが72hとして有効であると仮定します。
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
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

ここに示されているカラムは、[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)で文書化されたOTel公式仕様に対応しています。

このスキーマに関するいくつかの重要な注意点：

- デフォルトでは、テーブルは`PARTITION BY toDate(Timestamp)`によって日付でパーティション分けされています。これにより、期限切れのデータを効率的に削除できます。
- TTLは`TTL toDateTime(Timestamp) + toIntervalDay(3)`によって設定され、コレクタ設定で設定された値に対応します。[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)は、すべての行が期限切れたときにのみ部分全体が削除されることを意味します。これは部分内の行を削除することよりも効率的であり、高価な削除を回避します。この設定は常に有効にすることをお勧めします。[TTLによるデータ管理](/observability/managing-data#data-management-with-ttl-time-to-live)に関する詳細を参照してください。
- テーブルはクラシックな[`MergeTree`エンジン](/engines/table-engines/mergetree-family/mergetree)を使用しています。これはログおよびトレースに推奨され、変更する必要はありません。
- テーブルは`ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`によって順序付けされています。これにより、クエリが`ServiceName`、`SeverityText`、`Timestamp`および`TraceId`に対するフィルタリングに最適化されます。リスト内の早いカラムは遅いカラムよりもフィルタリングが速くなります。例えば、`ServiceName`によるフィルタリングは`TraceId`によるフィルタリングよりもかなり速くなります。ユーザーは、期待されるアクセスパターンに応じてこの順序を変更する必要があります。[プライマリーキーの選択](/use-cases/observability/schema-design#choosing-a-primary-ordering-key)を参照してください。
- 上記のスキーマはカラムに`ZSTD(1)`を適用しています。これはログのための最良の圧縮を提供します。ユーザーは、より良い圧縮を得るためにZSTD圧縮レベルを上げることもできますが、これは稀にしか有益ではありません。この値を上げることは挿入時により高いCPUオーバーヘッドをもたらします（圧縮時）、ただし、解除（およびクエリ）は比較的同じままとなります。[こちら](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を参照して、さらに詳細を確認してください。`Timestamp`には追加の[デルタエンコーディング](/sql-reference/statements/create/table#delta)が適用され、ディスク上のサイズを削減します。
- [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes)、および[`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope)がマップとして定義されていることに注意してください。ユーザーは、これらの違いを理解する必要があります。これらのマップへのアクセス方法や、キーへのアクセスを最適化する方法については、[マップの使用](/use-cases/observability/integrating-opentelemetry.md)を参照してください。
- その他のタイプも（例：`ServiceName`はLowCardinalityとして）最適化されています。Bodyは、例のログではJSONですが、文字列として保存されています。
- マップのキーと値、ならびにBodyカラムにはブームフィルタが適用されています。これにより、これらのカラムへのクエリ時間が改善されることが狙いですが、通常は必要ありません。[セカンダリ/データスキッピングインデックス](/use-cases/observability/schema-design#secondarydata-skipping-indices)を参照してください。

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
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

これもまた、[こちら](https://opentelemetry.io/docs/specs/otel/trace/api/)で文書化されたOTel公式仕様に対応するカラムを持ちます。ここでのスキーマは、上記のログスキーマと多くの同じ設定を使用しており、スパンに特有の追加のリンクカラムを持っています。

ユーザーには、自動スキーマ作成を無効にし、手動でテーブルを作成することをお勧めします。これにより、プライマリおよびセカンダリキーを変更したり、クエリパフォーマンスを最適化するための追加のカラムを導入する機会が得られます。[スキーマ設計](/use-cases/observability/schema-design)に関する詳細を参照してください。
## 挿入の最適化 {#optimizing-inserts}

ClickHouseを介して観測データを挿入する際に高い挿入性能を得ながら強力な一貫性の保証を得るために、ユーザーは簡単なルールに従う必要があります。OTelコレクタの正しい設定で、以下のルールは簡単に実行できます。これにより、ClickHouseを初めて使用する際に発生する[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)を回避できます。
### バッチ処理 {#batching}

デフォルトでは、ClickHouseへの各挿入は、挿入からのデータを含むストレージのパートを即座に作成します。したがって、データを多く含む小さな挿入を送信することは、少ないデータを含む多数の挿入を送信するよりも、必要な書き込み数を減少させます。少なくとも1,000行のデータを持つかなり大きなバッチでデータを挿入することをお勧めします。さらに詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)を参照してください。

デフォルトでは、ClickHouseへの挿入は同期的で、同一であれば冪等性があります。マージツリーエンジンファミリーのテーブルでは、ClickHouseはデフォルトで自動的に[挿入の重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)を行います。これは、以下のようなケースで挿入が耐障害性を持つことを意味します：

- (1) データを受信しているノードに問題がある場合、挿入クエリはタイムアウト（またはより具体的なエラー）となり、確認を受け取りません。
- (2) データがノードに書き込まれましたが、ネットワーク接続の中断により確認を送信できない場合、送信者はタイムアウトまたはネットワークエラーを受け取ります。

コレクタの観点から、(1)および(2)は区別が難しい場合があります。しかし、いずれの場合も、認証されていない挿入はすぐに再試行できます。再試行された挿入クエリが同じ順序で同じデータを含んでいれば、ClickHouseは（認証されていない）元の挿入が成功している場合に再試行された挿入を自動的に無視します。

ユーザーには、上記の要件を満たすために、以前の設定で示した[バッチプロセッサ](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)を使用することをお勧めします。これにより、挿入が一貫したバッチの行として送信されることが保証されます。コレクタに高いスループット（1秒あたりのイベント）が期待される場合、各挿入で少なくとも5,000イベントが送信できるなら、これは通常、パイプラインで必要な唯一のバッチ処理です。この場合、コレクタはバッチプロセッサの`timeout`が到達する前にバッチをフラッシュし、パイプラインのエンドツーエンドレイテンシを低く保ち、バッチが一貫したサイズになります。
### 非同期挿入を使用する {#use-asynchronous-inserts}

通常、ユーザーはコレクタのスループットが低いときに小さなバッチを送信せざるを得なく、なおかつ最低限のエンドツーエンドレイテンシ内にデータがClickHouseに到達することを期待しています。この場合、バッチプロセッサの`timeout`が切れると、小さなバッチが送信されます。これが問題を引き起こす可能性があり、非同期挿入が必要となる時点です。このケースは、**エージェント役のコレクタがClickHouseに直接送信するように構成されている場合**に一般的に発生します。ゲートウェイは集約装置として機能することで、この問題を軽減できます - [ゲートウェイでのスケーリング](#scaling-with-gateways)を参照してください。

大きなバッチが保証できない場合、ユーザーは[非同期挿入](/cloud/bestpractices/asynchronous-inserts)を使用してClickHouseにバッチ処理を委託できます。非同期挿入を使用すると、データは最初にバッファに挿入され、その後データベースストレージに書き込まれます。

<img src={observability_6}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

[非同期挿入が有効](https://optimize/asynchronous-inserts#enabling-asynchronous-inserts)になると、ClickHouseは①挿入クエリを受け取ると、クエリのデータを②最初にメモリ内バッファに書き込みます。そして、③次のバッファフラッシュが発生すると、バッファのデータは[ソートされ](https://guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)、データベースストレージにパートとして書き込まれます。注意すべきは、データがデータベースストレージにフラッシュされる前は、クエリによって検索可能ではなくなるということです。バッファフラッシュは[構成可能](https://optimize/asynchronous-inserts)です。

コレクタの非同期挿入を有効にするには、接続文字列に`async_insert=1`を追加します。配信保証を得るためには、ユーザーには`wait_for_async_insert=1`（デフォルト）を使用することをお勧めします - 詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。

非同期挿入からのデータは、ClickHouseバッファがフラッシュされたときに挿入されます。これは、[`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size)を超えた場合や、最初のINSERTクエリから[`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size)ミリ秒が経過した場合に発生します。`async_insert_stale_timeout_ms`がゼロ以外の値に設定されている場合、データは最後のクエリから`async_insert_stale_timeout_ms milliseconds`後に挿入されます。ユーザーはこれらの設定を調整してパイプラインのエンドツーエンドレイテンシを制御できます。バッファフラッシュを調整するために使用できる設定の詳細は[こちら](https://operations/settings/settings#async_insert)に記載されています。一般的に、デフォルト設定が適切です。

:::note 適応型非同期挿入を考慮
エージェントの数が少なく、スループットが低いが厳格なエンドツーエンドレイテンシ要件がある場合、[適応型非同期挿入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts)が有用なことがあります。一般的に、これらはClickHouseで見られる高スループットの観測ユースケースには適用されません。
:::

最後に、非同期挿入を使用する際のClickHouseへの同期挿入に関連する以前の重複排除動作はデフォルトで無効になっています。必要な場合は、[`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)の設定を参照してください。

この機能の構成に関する詳細は[こちら](https://optimize/asynchronous-inserts#enabling-asynchronous-inserts)で確認できます。詳細については[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)をご覧ください。
## デプロイメントアーキテクチャ {#deployment-architectures}

OTelコレクタを使用してClickHouseを利用する際に、いくつかのデプロイメントアーキテクチャが可能です。それぞれの適用シーンを以下に説明します。
### エージェントのみ {#agents-only}

エージェントのみのアーキテクチャでは、ユーザーはOTelコレクタをエッジにエージェントとしてデプロイします。これらはローカルアプリケーションからトレースを受け取り（例：サイドカーコンテナとして）、サーバーやKubernetesノードからログを収集します。このモードでは、エージェントはデータをClickHouseに直接送信します。

<img src={observability_7}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

このアーキテクチャは、小規模から中規模のデプロイメントに適しています。その主な利点は、追加のハードウェアが必要なく、ClickHouseの観測ソリューションの全体的なリソースフットプリントを最小限に抑え、アプリケーションとコレクタ間の単純なマッピングを維持できることです。

エージェントの数が数百を超えると、ユーザーはゲートウェイベースのアーキテクチャへの移行を検討すべきです。このアーキテクチャにはスケーリングに関していくつかの欠点があるため、次のように困難になります。

- **接続スケーリング** - 各エージェントはClickHouseに接続を確立します。ClickHouseは数百（場合によっては数千）の同時挿入接続を維持することができますが、最終的にはこれが制限要因となり、挿入の効率が低下します。つまり、接続を維持するためにClickHouseがより多くのリソースを使用することになります。ゲートウェイを使用すると、接続の数を最小限に抑え、挿入をより効率的にします。
- **エッジでの処理** - このアーキテクチャでは、すべての変換やイベント処理をエッジまたはClickHouseで行う必要があります。これは制限的であり、複雑なClickHouseのマテリアライズドビューまたは重要なサービスに影響を与える可能性のあるエッジでの重要な計算を推し進めることにつながる場合があります。
- **小さなバッチとレイテンシ** - エージェントコレクタは非常に少ないイベントを個別に収集する場合が多くなります。通常、このことは、配信SLAを満たすために設定間隔でフラッシュするように設定する必要があります。これにより、コレクタはClickHouseに小さなバッチを送信することになります。これは不利ですが、非同期挿入を使用することで軽減できます - [挿入の最適化](#optimizing-inserts)を参照してください。
```
### Gatewaysを使用したスケーリング {#scaling-with-gateways}

OTelコレクタは、上記の制限に対処するためにGatewayインスタンスとして展開できます。これにより、データセンターまたは地域ごとに独立したサービスが提供されます。これらは、アプリケーション（またはエージェント役の他のコレクタ）から単一のOTLPエンドポイントを介してイベントを受信します。通常、ゲートウェイインスタンスのセットが展開され、ロードバランサーが使用されて負荷が分散されます。

<img src={observability_8}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

このアーキテクチャの目的は、エージェントから計算集約的な処理をオフロードし、それによってリソース使用量を最小限に抑えることです。これらのゲートウェイは、エージェントが行う必要のある変換タスクを実行できます。さらに、多くのエージェントからのイベントを集約することで、ゲートウェイは大規模なバッチをClickHouseに送信できるようにし、効率的な挿入を可能にします。これらのゲートウェイコレクタは、エージェントが追加され、イベントスループットが増加するにつれて簡単にスケールできます。例として、サンプル構造化ログファイルを消費する関連エージェント構成を持つゲートウェイ構成の例は以下に示します。エージェントとゲートウェイ間の通信にはOTLPが使用されていることに注意してください。

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
      insecure: true # セキュア接続を使用している場合はfalseに設定します
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # 同じホスト上で2つのコレクタが実行されるように変更
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

これらの構成は、次のコマンドを使用して実行できます。

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

このアーキテクチャの主な欠点は、コレクタのセットを管理するためのコストとオーバーヘッドが発生することです。

より大規模なゲートウェイ中心のアーキテクチャを管理する例と学びに関連する例については、[このブログ投稿](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)を推奨します。

### Kafkaの追加 {#adding-kafka}

読者は、上記のアーキテクチャではKafkaがメッセージキューとして使用されていないことに気付くかもしれません。

メッセージバッファとしてKafkaキューを使用することは、ロギングアーキテクチャで見られる一般的なデザインパターンであり、ELKスタックによって普及しました。これにはいくつかの利点があります。主に、メッセージ配信の保証を強化し、バックプレッシャーに対処するのに役立ちます。メッセージはコレクションエージェントからKafkaに送信され、ディスクに書き込まれます。理論的には、クラスタ化されたKafkaインスタンスは高スループットのメッセージバッファを提供すべきであり、データを線形にディスクに書き込む際の計算オーバーヘッドが少ないため、メッセージの解析と処理にかかるよりもはるかに効率的です。たとえば、Elasticでは、トークン化とインデックス作成のためにかなりのオーバーヘッドが発生します。エージェントからデータを移動することで、ソースでのログローテーションの結果としてメッセージが失われるリスクを減らすことができます。最後に、メッセージリプレイとクロスリージョンレプリケーションの機能を提供しており、特定のユースケースにとって魅力的である可能性があります。

ただし、ClickHouseは非常に迅速にデータを挿入できるため、ミリオン行/秒を処理できます（中程度のハードウェアで）。ClickHouseからのバックプレッシャーは**まれ**です。多くの場合、Kafkaキューを活用することは、より大きなアーキテクチャの複雑さとコストを意味します。ログには銀行トランザクションや他のミッションクリティカルなデータと同じ配信の保証が必要ないという原則を受け入れることができる場合、Kafkaの複雑さを避けることをお勧めします。

ただし、高い配信保証やデータのリプレイ機能（潜在的には複数のソースへの）を必要とする場合、Kafkaは有用なアーキテクチャの追加となる可能性があります。

<img src={observability_9}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

この場合、OTelエージェントは[Kafkaエクスポータ](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md)を通じてKafkaにデータを送信するように構成できます。ゲートウェイインスタンスは、[Kafkaレシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md)を使用してメッセージを消費します。詳細については、ConfluentおよびOTelドキュメントを参照することをお勧めします。

### リソースの見積もり {#estimating-resources}

OTelコレクタのリソース要件は、イベントスループット、メッセージのサイズ、実行される処理の量に依存します。OpenTelemetryプロジェクトは、ユーザーがリソース要件を見積もるために使用できる[ベンチマーク](https://opentelemetry.io/docs/collector/benchmarks/)を維持しています。

私たちの経験に基づくと、3コアと12GBのRAMを持つゲートウェイインスタンスは、毎秒約60,000イベントを処理できます。これは、フィールドをリネームする責任を持つ最小限の処理パイプラインが関与しており、正規表現は使用していないという前提です。

イベントをゲートウェイに送信する責任を持つエージェントインスタンスについては、ユーザーが予想する秒あたりのログに基づいてサイズ設定することをお勧めします。以下は、ユーザーが出発点として使用できるおおよその数値を示しています：

| ロギングレート  | コレクターエージェントへのリソース |
|-----------------|------------------------------------|
| 1k/秒           | 0.2CPU, 0.2GiB                     |
| 5k/秒           | 0.5 CPU, 0.5GiB                    |
| 10k/秒          | 1 CPU, 1GiB                        |
