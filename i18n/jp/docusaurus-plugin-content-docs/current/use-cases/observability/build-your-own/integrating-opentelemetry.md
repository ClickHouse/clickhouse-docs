---
title: 'OpenTelemetry の統合'
description: 'OpenTelemetry と ClickHouse を統合してオブザーバビリティを実現する'
slug: /observability/integrating-opentelemetry
keywords: ['オブザーバビリティ', 'OpenTelemetry']
show_related_blogs: true
doc_type: 'guide'
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';
import Image from '@theme/IdealImage';


# データ収集のための OpenTelemetry の統合 \{#integrating-opentelemetry-for-data-collection\}

あらゆるオブザーバビリティソリューションには、ログおよびトレースを収集してエクスポートする手段が必要です。この目的のために、ClickHouse は [OpenTelemetry (OTel) プロジェクト](https://opentelemetry.io/) を推奨しています。

「OpenTelemetry は、トレース、メトリクス、ログなどのテレメトリデータを作成および管理するために設計されたオブザーバビリティフレームワーク兼ツールキットです。」

ClickHouse や Prometheus とは異なり、OpenTelemetry はオブザーバビリティのバックエンドではなく、テレメトリデータの生成、収集、管理、およびエクスポートに特化しています。OpenTelemetry の当初の目的は、言語固有の SDKS を用いてアプリケーションやシステムを容易にインスツルメンテーションできるようにすることでしたが、現在では OpenTelemetry collector を通じたログ収集も含むように拡張されています。OpenTelemetry collector は、テレメトリデータを受信、処理、およびエクスポートするエージェントまたはプロキシです。

## ClickHouse 関連コンポーネント \\{#clickhouse-relevant-components\\}

OpenTelemetry は複数のコンポーネントで構成されています。データおよび API 仕様、標準化されたプロトコル、フィールドやカラムの命名規則を提供するだけでなく、OTel は ClickHouse を用いてオブザーバビリティソリューションを構築するうえで不可欠な 2 つの機能を提供します。

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) は、テレメトリーデータを受信・処理・エクスポートするプロキシです。ClickHouse を基盤とするソリューションでは、このコンポーネントを、バッチ処理および挿入前のログ収集とイベント処理の両方に利用します。
- [Language SDKs](https://opentelemetry.io/docs/languages/) は、仕様・API・テレメトリーデータのエクスポートを実装します。これらの SDK により、アプリケーションコード内でトレースが正しく記録され、構成要素となる span が生成され、メタデータを通じてサービス間でコンテキストが伝播されます。これにより分散トレースが形成され、span を相関付けられるようになります。さらに、これらの SDK は、一般的なライブラリやフレームワークを自動的に組み込むエコシステムによって補完されているため、ユーザーはコードを変更する必要がなく、そのまま利用可能なインスツルメンテーションを得られます。

ClickHouse を基盤としたオブザーバビリティソリューションでは、これら 2 つのツールをいずれも活用します。

## ディストリビューション \\{#distributions\\}

OpenTelemetry Collector には[複数のディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)があります。ClickHouse ソリューションに必要となる filelog receiver と ClickHouse exporter は、[OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) にのみ含まれています。

このディストリビューションには多くのコンポーネントが含まれており、さまざまな構成を試すことができます。ただし本番環境で実行する場合は、その環境に必要なコンポーネントのみに Collector を限定することを推奨します。理由としては次のようなものがあります：

- Collector のサイズを削減し、Collector のデプロイ時間を短縮できる
- 利用可能な攻撃対象領域を減らすことで、Collector のセキュリティを向上できる

[カスタム Collector](https://opentelemetry.io/docs/collector/custom-collector/) は、[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder) を使用してビルドできます。

## OTel を使ったデータ取り込み \\{#ingesting-data-with-otel\\}

### コレクターのデプロイメントロール \\{#collector-deployment-roles\\}

ログを収集して ClickHouse に挿入するためには、OpenTelemetry Collector の利用を推奨します。OpenTelemetry Collector は、主に次の 2 つのロールでデプロイできます。

- **Agent** - Agent インスタンスは、エッジ（例: サーバー上や Kubernetes ノード上）でデータを収集したり、OpenTelemetry SDK で計装されたアプリケーションからイベントを直接受信します。後者の場合、Agent インスタンスはアプリケーションと同一プロセス内、またはアプリケーションと同じホスト上（sidecar や デーモンセット など）で動作します。Agent は、収集したデータを直接 ClickHouse に送信することも、ゲートウェイインスタンスに送信することもできます。前者の場合、これは [Agent deployment pattern](https://opentelemetry.io/docs/collector/deployment/agent/) と呼ばれます。
- **Gateway**  - Gateway インスタンスは、スタンドアロンのサービス（たとえば Kubernetes のデプロイメント）として、通常はクラスタ単位、データセンター単位、またはリージョン単位で提供されます。これらは、単一の OTLP エンドポイント経由で、アプリケーション（または Agent として動作する他のコレクター）からイベントを受信します。通常、複数の Gateway インスタンスがデプロイされ、それらの間で負荷を分散するために既存のロードバランサーが利用されます。すべての Agent とアプリケーションがこの単一エンドポイントにシグナルを送信する場合、これは [Gateway deployment pattern](https://opentelemetry.io/docs/collector/deployment/gateway/) と呼ばれることがよくあります。

以下では、シンプルな Agent ロールのコレクターがイベントを直接 ClickHouse に送信する構成を前提とします。ゲートウェイの利用方法とそれが適用されるシナリオについては、[Scaling with Gateways](#scaling-with-gateways) を参照してください。

### ログの収集 \\{#collecting-logs\\}

Collector を使用する主な利点は、サービス側がデータをすばやくオフロードでき、その後のリトライ、バッチ処理、暗号化、さらには機密データのフィルタリングといった追加処理を Collector 側に任せられる点です。

Collector では、3 つの主要な処理ステージを [receiver](https://opentelemetry.io/docs/collector/configuration/#receivers)、[processor](https://opentelemetry.io/docs/collector/configuration/#processors)、[exporter](https://opentelemetry.io/docs/collector/configuration/#exporters) という用語で表現します。Receiver はデータ収集のために使用され、pull 型と push 型のいずれにも対応します。Processor はメッセージの変換および付加情報の付与（enrichment）を行う機能を提供します。Exporter はデータを下流のサービスへ送信する役割を担います。この下流サービスは理論上は別の Collector でも構いませんが、以下の説明では、すべてのデータが直接 ClickHouse に送信されることを前提とします。

<Image img={observability_3} alt="ログの収集" size="md"/>

ユーザーは、すべての receiver、processor、exporter について一通り理解しておくことを推奨します。

Collector はログ収集のために、主に 2 種類の receiver を提供します。

**OTLP 経由** - この場合、ログは OpenTelemetry SDK から OTLP プロトコル経由で Collector に直接（push で）送信されます。[OpenTelemetry demo](https://opentelemetry.io/docs/demo/) はこの方式を採用しており、各言語の OTLP exporter はローカルの Collector エンドポイントを前提としています。この場合、Collector 側では OTLP receiver を有効にするよう設定しておく必要があります（上記 [デモの設定例](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12) を参照してください）。この方式の利点は、ログデータに自動的に Trace ID が含まれるため、特定のログに対応するトレース、あるいはその逆を後から容易にたどれる点です。

<Image img={observability_4} alt="OTLP 経由でのログ収集" size="md"/>

この方式では、対象のコードを [利用するプログラミング言語に対応した SDK](https://opentelemetry.io/docs/languages/) で計装（インストルメント）する必要があります。

- **Filelog receiver によるスクレイピング** - この receiver はディスク上のファイルを tail してログメッセージを生成し、それらを ClickHouse に送信します。この receiver は、複数行メッセージの検出、ログローテーションの取り扱い、再起動に対する堅牢性を高めるためのチェックポイント処理、構造の抽出といった複雑なタスクに対応します。さらに、この receiver は Docker および Kubernetes コンテナのログを tail することもでき、Helm チャートとしてデプロイでき、[これらのログから構造を抽出](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) し、ポッドの詳細を付加してログを拡充できます。

<Image img={observability_5} alt="Filelog receiver" size="md"/>

**多くのデプロイメントでは、上記の receiver を組み合わせて使用します。ユーザーには、[collector のドキュメント](https://opentelemetry.io/docs/collector/) を読み、基本概念に加えて [設定構造](https://opentelemetry.io/docs/collector/configuration/) や [インストール方法](https://opentelemetry.io/docs/collector/installation/) に慣れておくことをお勧めします。**

:::note Tip: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) は設定の検証と可視化に役立ちます。
:::

## 構造化ログと非構造化ログ \{#structured-vs-unstructured\}

ログには、構造化されたものと非構造化のものがあります。

構造化ログでは JSON などのデータ形式を用いて、HTTP コードや送信元 IP アドレスといったメタデータフィールドを定義します。

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

非構造化ログは、多くの場合、正規表現パターンで抽出可能なある程度の構造を持ってはいますが、ログはあくまで文字列として表現されます。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

可能な限り構造化ログを採用し、JSON（ndjson など）形式でログを出力することを推奨します。これにより、後続のログ処理が簡素化されます。具体的には、[Collector processors](https://opentelemetry.io/docs/collector/configuration/#processors) を使用して ClickHouse に送信する前、または insert 時に materialized view を用いて処理することが容易になります。構造化ログを使用することで、後段の処理に必要なリソースを最終的に削減でき、ClickHouse ソリューションで必要となる CPU も抑制できます。


### 例 \{#example\}

本節の例として、構造化（JSON形式）および非構造化の2種類のログデータセットを用意しています。いずれも約 1,000 万行で、以下のリンクから取得できます。

* [Unstructured](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
* [Structured](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

以下の例では構造化されたデータセットを使用します。以降の例を再現できるよう、このファイルをダウンロードして解凍しておいてください。

次は、これらのファイルをディスクから読み取り、`filelog` receiver を使用して処理し、結果のメッセージを stdout に出力する、OTel collector のシンプルな構成例です。ログが構造化されているため、[`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md) operator を使用します。`access-structured.log` ファイルへのパスは適宜変更してください。

:::note 解析には ClickHouse の利用も検討
以下の例では、ログからタイムスタンプを抽出します。これは、ログの 1 行全体を JSON 文字列に変換して結果を `LogAttributes` に格納する `json_parser` operator の使用を必要とします。この処理は計算コストが高くなりますが、[ClickHouse でより効率的に実行できます](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql)。同等の非構造化ログの例として、[`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) を使用して同様の処理を行うものを[こちら](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)で参照できます。
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

[公式手順](https://opentelemetry.io/docs/collector/installation/)に従って、ローカル環境に collector をインストールできます。重要な点として、手順の中で [contrib distribution](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)（`filelog` receiver を含んでいます）を使用するようにしてください。例えば、`otelcol_0.102.1_darwin_arm64.tar.gz` の代わりに `otelcol-contrib_0.102.1_darwin_arm64.tar.gz` をダウンロードします。リリースは[こちら](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)から確認できます。

インストールが完了したら、OTel Collector は次のコマンドで実行できます。

```bash
./otelcol-contrib --config config-logs.yaml
```

構造化ログを使用している場合、出力されるメッセージは次の形式になります：


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

上記は、OTel collector によって出力された 1 つのログメッセージを表しています。同じメッセージを、後続のセクションで ClickHouse に取り込みます。

ログメッセージの完全なスキーマと、他の receiver を使用している場合に存在しうる追加カラムは [こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/) で管理されています。**このスキーマには必ず目を通し、内容を理解しておくことを強く推奨します。**

ここで重要なのは、ログ行自体は `Body` フィールド内の文字列として保持されている一方で、`json_parser` によって JSON が自動的に抽出され、`Attributes` フィールドに格納されている点です。同じ [operator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available) を使用して、タイムスタンプも適切な `Timestamp` カラムに抽出しています。OTel を用いたログ処理の推奨事項については [Processing](#processing---filtering-transforming-and-enriching) を参照してください。

:::note Operators
Operators はログ処理の最も基本的な単位です。各 Operator は、ファイルから行を読み取る、あるフィールドから JSON をパースするなど、単一の責務を果たします。Operators は、その後パイプライン内で連結され、目的とする結果を得るために利用されます。
:::

上記のメッセージには `TraceID` や `SpanID` フィールドが存在しません。これらが存在する場合、たとえばユーザーが [分散トレーシング](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces) を実装しているケースでは、先ほどと同様の手法を用いて JSON から抽出することができます。

ローカルまたは Kubernetes のログファイルを収集する必要があるユーザーは、[filelog receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration) で利用可能な設定オプション、および [offset](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) と [複数行ログのパース方法](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing) について理解しておくことを推奨します。


## Kubernetes ログの収集 \\{#collecting-kubernetes-logs\\}

Kubernetes ログの収集には、[OpenTelemetry documentation guide](https://opentelemetry.io/docs/kubernetes/) を参照することを推奨します。[Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor) は、ポッドのメタデータでログとメトリクスを拡張するために推奨されます。これにより、ラベルなどの動的メタデータが `ResourceAttributes` カラムに保存される可能性があります。ClickHouse では現在、このカラムに `Map(String, String)` 型を使用しています。この型の扱いや最適化の詳細については、[Using Maps](/use-cases/observability/schema-design#using-maps) および [Extracting from maps](/use-cases/observability/schema-design#extracting-from-maps) を参照してください。

## トレースの収集 \\{#collecting-traces\\}

コードを計装してトレースを収集したいユーザーは、公式の [OTel ドキュメント](https://opentelemetry.io/docs/languages/) を参照してください。

ClickHouse にイベントを送信するには、適切な receiver を介して OTLP プロトコル経由でトレースイベントを受信する OTel collector をデプロイする必要があります。OpenTelemetry のデモでは、[サポートされている各言語の計装例](https://opentelemetry.io/docs/demo/) と、イベントを collector に送信する方法を示しています。イベントを stdout に出力する collector 設定の一例を以下に示します。

### 例 \{#example-1\}

トレースは OTLP 経由で受信する必要があるため、トレースデータを生成するために [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) ツールを使用します。インストール手順は[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)を参照してください。

次の設定では、OTLP レシーバーでトレースイベントを受信し、それらを標準出力 (stdout) に送信します。

[config-traces.xml](https://www.otelbin.io/#config=receivers%3A*N_otlp%3A*N___protocols%3A*N_____grpc%3A*N_______endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N__timeout%3A_1s*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*Nservice%3A*N_pipelines%3A*N__traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Blogging%5D%7E)

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

この構成は次のコマンドで実行します:

```bash
./otelcol-contrib --config config-traces.yaml
```

`telemetrygen` を使用してトレースイベントをコレクターに送信します：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

これにより、次の例に示すようなトレースメッセージが stdout に出力されます。

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

上記は、OTel collector が生成した単一のトレースメッセージです。同様のメッセージを、後続のセクションで ClickHouse に取り込みます。

トレースメッセージの完全なスキーマは[こちら](https://opentelemetry.io/docs/concepts/signals/traces/)で公開されています。このスキーマには事前に目を通しておくことを強く推奨します。


## Processing - filtering, transforming and enriching \\{#processing---filtering-transforming-and-enriching\\}

前の例でログイベントのタイムスタンプを設定したように、イベントメッセージをフィルタリング・変換し、付加情報を与えてエンリッチしたくなる場面は必ず発生します。これは、OpenTelemetry が持つ複数の機能を利用することで実現できます。

- **Processors** - Processors は、[receivers によって収集されたデータを exporters に送信する前に変更または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/) します。Processors は collector の設定ファイル内の `processors` セクションで定義された順序で適用されます。必須ではありませんが、[最小限のセットが一般的に推奨されています](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。ClickHouse と組み合わせて OTel collector を使用する場合、processors は次のようなものに限定することを推奨します。

  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) は、collector におけるメモリ不足（Out Of Memory）の発生を防ぐために使用されます。推奨値については [Estimating Resources](#estimating-resources) を参照してください。
  - コンテキストに基づいてエンリッチメントを行う processor。たとえば [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) は、k8s メタデータを用いて spans、metrics、logs の resource 属性を自動的に設定できます。例として、イベントにその発生元のポッド ID を付与してエンリッチできます。
  - トレースに対して必要な場合の [tail または head サンプリング](https://opentelemetry.io/docs/concepts/sampling/)。
  - [Basic filtering](https://opentelemetry.io/docs/collector/transforming-telemetry/) - 下記の operator では実施できない場合に、不要なイベントをドロップします。
  - [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - データをバッチ単位で送信できるようにするため、ClickHouse と連携する際には不可欠です。["Exporting to ClickHouse"](#exporting-to-clickhouse) を参照してください。

- **Operators** - [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) は、receiver で利用可能な最も基本的な処理単位を提供します。ここでは Severity や Timestamp といったフィールドを設定できる基本的なパースがサポートされています。JSON および正規表現によるパースに加え、イベントフィルタリングや基本的な変換が可能です。イベントフィルタリングはここで行うことを推奨します。

operators や [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md) を用いた過度なイベント処理は避けることを推奨します。特に JSON パースは、メモリと CPU に大きなオーバーヘッドを招く可能性があります。いくつかの例外を除いて、materialized view とカラムを用いることで、ClickHouse 側で挿入時にすべての処理を実行することが可能です。具体的には、コンテキストに依存するエンリッチメント、たとえば k8s メタデータの付与などが例外です。詳細については [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql) を参照してください。

処理を OTel collector で行う場合、変換処理は gateway インスタンス側で実施し、agent インスタンス側での処理を最小限に抑えることを推奨します。これにより、サーバー上のエッジで稼働する agent が必要とするリソースを可能な限り少なくできます。一般的に、ユーザーは agent ではフィルタリング（不要なネットワーク使用を最小化するため）、タイムスタンプ設定（operators 経由）、およびコンテキストを必要とするエンリッチメントのみを実行しています。たとえば、gateway インスタンスが別の Kubernetes クラスターに存在する場合、k8s によるエンリッチメントは agent 内で行う必要があります。

### 例 \{#example-2\}

次の設定は、非構造化ログファイルを収集する例です。ログ行から構造を抽出してイベントをフィルタリングするオペレーター（`regex_parser`）と、イベントをバッチ処理してメモリ使用量を制限するプロセッサーの利用方法に注目してください。

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


## ClickHouse へのエクスポート \{#exporting-to-clickhouse\}

Exporter は、1 つ以上のバックエンドまたは送信先にデータを送信します。Exporter には、pull 型と push 型があります。イベントを ClickHouse に送信するには、push 型の [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md) を使用する必要があります。

:::note OpenTelemetry Collector Contrib を使用
ClickHouse exporter は [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main) の一部であり、コアディストリビューションには含まれていません。contrib ディストリビューションを使用するか、[独自の Collector をビルド](https://opentelemetry.io/docs/collector/custom-collector/) することができます。
:::

完全な設定ファイルを以下に示します。

[clickhouse-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N_otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_5000*N*Nexporters%3A*N_clickhouse%3A*N___endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*Aasync*_insert*E1*N___*H_ttl%3A_72h*N___traces*_table*_name%3A_otel*_traces*N___logs*_table*_name%3A_otel*_logs*N___create*_schema%3A_true*N___timeout%3A_5s*N___database%3A_default*N___sending*_queue%3A*N_____queue*_size%3A_1000*N___retry*_on*_failure%3A*N_____enabled%3A_true*N_____initial*_interval%3A_5s*N_____max*_interval%3A_30s*N_____max*_elapsed*_time%3A_300s*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Bclickhouse%5D*N___traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Bclickhouse%5D%7E\&distro=otelcol-contrib%7E\&distroVersion=v0.103.1%7E)

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

次の重要な設定項目を確認してください：


* **pipelines** - 上記の設定では、[pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines) の使用が重要になります。これは一連の receiver、processor、exporter から構成され、ログ用とトレース用にそれぞれ 1 つずつ定義されています。
* **endpoint** - ClickHouse との通信は `endpoint` パラメータで設定します。接続文字列 `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` により、通信は TCP 経由で行われます。トラフィック切り替えなどの理由で HTTP を利用したい場合は、この接続文字列を[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)で説明されているとおりに変更してください。ユーザー名とパスワードをこの接続文字列内で指定する方法を含む、完全な接続方法の詳細は[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)で説明されています。

**Important:** 上記の接続文字列では、圧縮 (lz4) と非同期インサートの両方が有効になっています。常に両方を有効にすることを推奨します。非同期インサートの詳細については [Batching](#batching) を参照してください。圧縮は常に明示的に指定する必要があり、古いバージョンの exporter ではデフォルトでは有効になりません。

* **ttl** - この値はデータの保持期間を決定します。詳細は「Managing data」を参照してください。単位付き時間 (例: 72h) で指定する必要があります。以下の例では、データが 2019 年のものであり、挿入すると ClickHouse によって即座に削除されてしまうため、有効期限 (TTL) を無効にしています。
* **traces&#95;table&#95;name** と **logs&#95;table&#95;name** - ログテーブルとトレーステーブルの名前を決定します。
* **create&#95;schema** - 起動時にデフォルトスキーマでテーブルを作成するかどうかを決定します。初期セットアップではデフォルトで true です。準備ができたら false に設定し、自分でスキーマを定義してください。
* **database** - 対象のデータベース。
* **retry&#95;on&#95;failure** - 失敗したバッチを再試行するかどうかを決定する設定です。
* **batch** - batch processor はイベントをバッチとして送信します。約 5000 件、タイムアウト 5s 程度の設定を推奨します。これらのいずれかに達した時点で、バッチがフラッシュされ exporter に送信されます。これらの値を小さくすると、データがより早くクエリ可能になる低レイテンシなパイプラインになりますが、その分、多数の接続およびバッチが ClickHouse に送信されます。[非同期インサート](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) を使用していない場合、これは ClickHouse で[パーツが多すぎる](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts)問題を引き起こす可能性があるため推奨されません。逆に、非同期インサートを使用している場合、クエリ可能になるまでのデータ可用性は非同期インサートの設定にも依存しますが、コネクタからのフラッシュ自体はより早く行われます。詳細は [Batching](#batching) を参照してください。
* **sending&#95;queue** - 送信キューのサイズを制御します。キュー内の各要素は 1 つのバッチを含みます。たとえば ClickHouse に到達できない状態が継続する一方でイベントが到着し続け、このキューが溢れた場合、バッチは破棄されます。

ユーザーが構造化ログファイルを展開済みで、(デフォルト認証の) [ローカルの ClickHouse インスタンス](/install) が稼働していることを前提に、この設定は次のコマンドで実行できます。

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

このコレクターにトレースデータを送信するには、`telemetrygen` ツールを使用して次のコマンドを実行してください。

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

起動後、簡単なクエリを実行してログイベントが取り込まれていることを確認します。


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

Likewise, for trace events, you can check the `otel_traces` table:

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


## すぐに利用できるスキーマ \{#out-of-the-box-schema\}

デフォルトでは、ClickHouse exporter はログとトレースの両方に対して、出力先のログテーブルを作成します。これは `create_schema` 設定で無効化できます。さらに、ログおよびトレーステーブルの名前は、前述の設定によりデフォルトである `otel_logs` と `otel_traces` から変更できます。

:::note
以下のスキーマでは、有効期限 (TTL) を 72時間に設定しているものと仮定しています。
:::

ログのデフォルトスキーマは以下のとおりです（`otelcol-contrib v0.102.1`）:

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

ここで示すカラムは、ログに関するOTelの公式仕様として[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)に文書化されている内容と対応しています。

このスキーマに関する重要な注意点をいくつか示します：


- デフォルトでは、テーブルは `PARTITION BY toDate(Timestamp)` によって日付でパーティション分割されます。これにより、有効期限切れのデータを効率的に削除できます。
- 有効期限 (TTL) は `TTL toDateTime(Timestamp) + toIntervalDay(3)` によって設定されており、これはコレクターの設定で指定した値に対応します。[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) は、含まれているすべての行が期限切れになったときに、テーブルのパーツ全体のみを削除することを意味します。これは、パーツ内の行だけを削除する場合と比べて、コストの高い削除処理を避けられるため、より効率的です。常にこの設定にすることを推奨します。詳細については、[Data management with TTL](/observability/managing-data#data-management-with-ttl-time-to-live) を参照してください。
- テーブルは従来型の [`MergeTree` engine](/engines/table-engines/mergetree-family/mergetree) を使用しています。これはログやトレースに推奨されるものであり、通常は変更する必要はありません。
- テーブルは `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)` によって並べ替えられています。これは、`ServiceName`、`SeverityText`、`Timestamp`、`TraceId` に対するフィルターにクエリが最適化されることを意味します。リストの先頭にあるカラムほど後ろのカラムよりも高速にフィルタリングされます。例えば、`ServiceName` でのフィルタリングは `TraceId` でのフィルタリングよりも有意に高速になります。想定されるアクセスパターンに応じて、この並び順を調整してください。詳細は [Choosing a primary key](/use-cases/observability/schema-design#choosing-a-primary-ordering-key) を参照してください。
- 上記のスキーマでは、カラムに `ZSTD(1)` が適用されています。これはログに対して最も優れた圧縮を提供します。より良い圧縮を得るために、ZSTD の圧縮レベル（デフォルト値 1 より大きい値）を上げることもできますが、メリットが出るケースは多くありません。この値を上げると、挿入時（圧縮処理中）の CPU オーバーヘッドが増加しますが、伸張（ひいてはクエリ）の性能は概ね同等のままです。詳細は[こちら](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を参照してください。さらに Timestamp に対しては、ディスク上のサイズを削減する目的で追加の [delta encoding](/sql-reference/statements/create/table#delta) が適用されています。
- [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes)、[`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) が map であることに注意してください。これらの違いを理解することは重要です。これらの map へのアクセス方法および内部のキーアクセスを最適化する方法については、["Using maps"](/use-cases/observability/schema-design#using-maps) を参照してください。
- `ServiceName` を LowCardinality にしていることなど、ここに挙がっているほとんどの型は最適化されています。例のログでは JSON である `Body` は String として保存される点に注意してください。
- Bloom フィルターが map のキーおよび値、さらに `Body` カラムに適用されています。これらは、これらのカラムにアクセスするクエリの実行時間を改善することを目的としていますが、通常は必須ではありません。詳細は [Secondary/Data skipping indices](/use-cases/observability/schema-design#secondarydata-skipping-indices) を参照してください。

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

ここでも、[こちら](https://opentelemetry.io/docs/specs/otel/trace/api/) に記載されているトレース向けの OTel 公式仕様で定義されたカラムと整合するようになっています。ここでのスキーマは、上記のログ用スキーマと多くの設定を共有しつつ、Span 固有の Link カラムを追加で使用します。

自動スキーマ作成機能を無効にし、テーブルを手動で作成することを推奨します。これにより、プライマリキーおよびセカンダリキーを変更できるほか、クエリのパフォーマンスを最適化するための追加カラムを導入することも可能になります。詳細については [Schema design](/use-cases/observability/schema-design) を参照してください。


## 挿入の最適化 \\{#optimizing-inserts\\}

OTel collector 経由でオブザーバビリティデータを ClickHouse に挿入する際に、高い挿入パフォーマンスを維持しつつ強い一貫性保証を得るには、いくつかの簡単なルールに従ってください。OTel collector を正しく構成すれば、次に挙げるルールには容易に従えるはずです。これにより、ClickHouse を初めて使用するユーザーが直面しがちな[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)を回避するのにも役立ちます。

### バッチ処理 \\{#batching\\}

デフォルトでは、ClickHouse に送信された各 insert に対して、ClickHouse は、その insert で送られたデータと保存が必要なその他のメタデータを含むストレージのパートを即座に作成します。したがって、少量の insert にそれぞれ多くのデータを含めて送信する方が、多数の insert でそれぞれ少量のデータを送信する場合と比べて、必要な書き込み回数を削減できます。データは、一度に少なくとも 1,000 行以上という、比較的まとまったバッチで挿入することを推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)を参照してください。

デフォルトでは、ClickHouse への insert は同期的に行われ、かつ内容が同一であれば冪等です。MergeTree エンジンファミリーのテーブルでは、ClickHouse はデフォルトで自動的に [deduplicate inserts](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time) を行います。これは、insert が次のようなケースでも問題なく扱えることを意味します。

- (1) データを受け取ったノードに問題がある場合、insert クエリはタイムアウト（または、より具体的なエラー）となり、確認応答（ACK）は返されません。
- (2) ノードがデータを書き込んだものの、ネットワークの中断によりクエリ送信元へ ACK を返せない場合、送信元はタイムアウトまたはネットワークエラーを受け取ります。

コレクターの視点からは、(1) と (2) を区別するのは難しい場合があります。しかし、どちらの場合でも ACK を受け取っていない insert は、そのまま即座に再試行して構いません。再試行された insert クエリが同じ順序で同じデータを含んでいる限り、未 ACK の元の insert が成功していた場合には、ClickHouse は再試行された insert を自動的に無視します。

上記を満たすために、前の構成例で示した [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md) を使用することを推奨します。これにより、上記要件を満たす行の一貫したバッチとして insert が送信されることが保証されます。コレクターが高スループット（毎秒イベント数）が想定され、各 insert で少なくとも 5000 イベントを送信できる場合、これは通常パイプラインで必要となる唯一のバッチ処理です。この場合、コレクターは batch processor の `timeout` に達する前にバッチをフラッシュし、パイプラインのエンドツーエンドレイテンシを低く保ちつつ、バッチサイズの一貫性を確保します。

### 非同期インサートを利用する \\{#use-asynchronous-inserts\\}

通常、コレクタのスループットが低い場合、ユーザーはより小さなバッチを送信せざるを得ませんが、それでもエンドツーエンドのレイテンシーを最小限に抑えて ClickHouse にデータが到達することを期待します。この場合、バッチプロセッサの `timeout` が有効期限切れになると、小さなバッチが送信されます。これが問題を引き起こすことがあり、そのような場合に非同期インサートが必要となります。このケースは、**エージェントロールのコレクタが ClickHouse に直接送信するよう構成されている**ときによく発生します。Gateway はアグリゲータとして動作することでこの問題を軽減できます。詳細は [Gateway によるスケーリング](#scaling-with-gateways) を参照してください。

大きなバッチを保証できない場合は、[非同期インサート](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) を使用してバッチ処理を ClickHouse に委譲できます。非同期インサートでは、データはまずバッファに挿入され、その後データベースストレージに、後から（または非同期に）書き込まれます。

<Image img={observability_6} alt="Async inserts" size="md"/>

[非同期インサートを有効化](/optimize/asynchronous-inserts#enabling-asynchronous-inserts) した場合、ClickHouse が ① INSERT クエリを受信すると、そのクエリのデータは ② まずインメモリバッファに即座に書き込まれます。③ 次のバッファフラッシュが行われると、バッファ内のデータは[ソート](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) され、1 つのパーツとしてデータベースストレージに書き込まれます。注意点として、データベースストレージにフラッシュされるまでは、そのデータはクエリから検索できません。バッファフラッシュは[設定可能](/optimize/asynchronous-inserts)です。

コレクタで非同期インサートを有効にするには、接続文字列に `async_insert=1` を追加します。確実な配信保証を得るために、`wait_for_async_insert=1`（デフォルト）の使用を推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。

非同期インサートからのデータは、ClickHouse のバッファがフラッシュされたときに挿入されます。これは、[`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) を超えた場合、または最初の INSERT クエリから [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) ミリ秒経過した場合のいずれかで発生します。`async_insert_stale_timeout_ms` がゼロ以外の値に設定されている場合、最後のクエリから `async_insert_stale_timeout_ms` ミリ秒経過後にデータが挿入されます。これらの設定を調整することで、パイプラインのエンドツーエンドレイテンシーを制御できます。バッファフラッシュの調整に使用できる追加の設定は[こちら](/operations/settings/settings#async_insert)に記載されています。一般的には、デフォルト値で問題ありません。

:::note 適応的非同期インサートの検討
利用中のエージェント数が少なく、スループットも低い一方でエンドツーエンドレイテンシーに厳しい要件がある場合には、[adaptive asynchronous inserts](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) が有用な場合があります。一般的に、これは ClickHouse を用いた高スループットなオブザーバビリティ用途には適用されません。
:::

最後に、ClickHouse への同期インサートに関連する従来の重複排除動作は、非同期インサート使用時にはデフォルトでは有効になりません。必要に応じて、[`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate) の設定を参照してください。

この機能の設定に関する詳細は[こちら](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)、深掘りした解説は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。

## デプロイメントアーキテクチャ \\{#deployment-architectures\\}

OTel collector を ClickHouse と組み合わせて使用する場合、いくつかのデプロイメントアーキテクチャが利用可能です。以下では、それぞれの構成と、その構成が適用しやすいケースについて説明します。

### エージェントのみ \\{#agents-only\\}

エージェントのみのアーキテクチャでは、ユーザーは OTel collector をエージェントとしてエッジにデプロイします。これらはローカルアプリケーション（例: サイドカーコンテナとして）からトレースを受信し、サーバーおよび Kubernetes ノードからログを収集します。このモードでは、エージェントはデータを直接 ClickHouse に送信します。

<Image img={observability_7} alt="Agents only" size="md"/>

このアーキテクチャは、小規模から中規模のデプロイメントに適しています。主な利点は、追加のハードウェアを必要とせず、ClickHouse によるオブザーバビリティソリューション全体のリソースフットプリントを最小限に抑えつつ、アプリケーションとコレクターの対応関係をシンプルに保てる点です。

エージェントの数が数百を超える場合は、ゲートウェイベースのアーキテクチャへの移行を検討してください。このアーキテクチャには、スケールさせるうえで問題となるいくつかの欠点があります。

- **接続のスケーリング** - 各エージェントは ClickHouse への接続を確立します。ClickHouse は何百（場合によっては何千）もの同時 INSERT 接続を維持できますが、最終的にはこれが制約要因となり、INSERT の効率を低下させます。つまり、接続を維持するために ClickHouse 側でより多くのリソースが消費されます。ゲートウェイを使用することで接続数を最小化し、INSERT をより効率的にできます。
- **エッジでの処理** - このアーキテクチャでは、あらゆる変換処理やイベント処理をエッジ側、または ClickHouse 側で実行する必要があります。制約が大きいだけでなく、複雑な ClickHouse の materialized view が必要になったり、重要なサービスに影響が及びうるエッジ側に大きな計算処理を押し付けたりする可能性があります。エッジ側ではリソースが限られている場合もあります。
- **小さなバッチとレイテンシ** - エージェントコレクターは、それぞれがごく少量のイベントしか収集しない場合があります。通常、配信の SLA を満たすために、一定間隔でフラッシュするよう設定する必要があります。その結果、コレクターが小さなバッチを ClickHouse に送信してしまうことがあります。これは欠点ですが、非同期 INSERT を使用することで軽減可能です。詳細は [Optimizing inserts](#optimizing-inserts) を参照してください。

### ゲートウェイによるスケーリング \{#scaling-with-gateways\}

OTel collector は、上記の制約に対処するために Gateway インスタンスとしてデプロイできます。これらはスタンドアロンのサービスを提供し、通常はデータセンターごと、あるいはリージョンごとに 1 つ配置します。これらは、単一の OTLP エンドポイントを介して、アプリケーション（またはエージェント役割を持つ他の collector）からイベントを受信します。通常、複数の Gateway インスタンスがデプロイされ、それらの間で負荷を分散するために、一般的なロードバランサーが使用されます。

<Image img={observability_8} alt="ゲートウェイによるスケーリング" size="md" />

このアーキテクチャの目的は、計算負荷の高い処理をエージェントからオフロードし、それによってエージェントのリソース使用量を最小化することです。これらのゲートウェイは、本来であればエージェントが担う必要がある変換処理を実行できます。さらに、多数のエージェントからのイベントを集約することで、ゲートウェイは ClickHouse に対して大きなバッチを送信し、効率的な挿入を可能にします。これらの gateway collector は、エージェントの追加やイベントスループットの増加に応じて容易にスケールアウトできます。サンプルの構造化ログファイルを取り込むエージェント設定と組み合わせたゲートウェイ設定の例を以下に示します。エージェントとゲートウェイ間の通信に OTLP を使用している点に注目してください。

[clickhouse-agent-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_1000*N*Nexporters%3A*N_otlp%3A*N___endpoint%3A_localhost%3A4317*N___tls%3A*N_____insecure%3A_true_*H_Set_to_false_if_you_are_using_a_secure_connection*N*Nservice%3A*N_telemetry%3A*N___metrics%3A*N_____address%3A_0.0.0.0%3A9888_*H_Modified_as_2_collectors_running_on_same_host*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Botlp%5D%7E\&distro=otelcol-contrib%7E\&distroVersion=v0.103.1%7E)

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
      insecure: true # Set to false if you are using a secure connection
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlp]
```


[clickhouse-gateway-config.yaml](https://www.otelbin.io/#config=receivers%3A*N__otlp%3A*N____protocols%3A*N____grpc%3A*N____endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_10000*N*Nexporters%3A*N__clickhouse%3A*N____endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*N____ttl%3A_96h*N____traces*_table*_name%3A_otel*_traces*N____logs*_table*_name%3A_otel*_logs*N____create*_schema%3A_true*N____timeout%3A_10s*N____database%3A_default*N____sending*_queue%3A*N____queue*_size%3A_10000*N____retry*_on*_failure%3A*N____enabled%3A_true*N____initial*_interval%3A_5s*N____max*_interval%3A_30s*N____max*_elapsed*_time%3A_300s*N*Nservice%3A*N__pipelines%3A*N____logs%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Bclickhouse%5D%7E\&distro=otelcol-contrib%7E\&distroVersion=v0.103.1%7E)

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

これらの構成は、次のコマンドで適用できます。

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

このアーキテクチャの主な欠点は、複数の collector を管理するためのコストと運用負荷が発生することです。

より大規模なゲートウェイベースのアーキテクチャの管理方法と、そこから得られる知見の例については、この [ブログ記事](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog) を参考にすることをお勧めします。


### Kafka の追加 \\{#adding-kafka\\}

ここまでに紹介したアーキテクチャでは、メッセージキューとして Kafka を使用していないことに気づく読者もいるかもしれません。

メッセージバッファとして Kafka キューを使用することは、ログ収集アーキテクチャでよく見られる一般的な設計パターンであり、ELK スタックによって広く普及しました。これにはいくつかの利点があります。主なものは、より強力なメッセージ配信保証を提供し、バックプレッシャーへの対応を助ける点です。メッセージは収集エージェントから Kafka に送信され、ディスクに書き込まれます。理論上、クラスタ構成の Kafka インスタンスは、高スループットなメッセージバッファを提供できます。これは、メッセージをパースして処理するよりも、データをディスクに線形に書き込む方が計算オーバーヘッドが小さいためです。例えば Elastic では、トークナイズとインデクシングに大きなオーバーヘッドが発生します。エージェント側からデータを切り離して退避させることで、ソース側でのログローテーションが原因でメッセージを失うリスクも低減できます。最後に、一部のユースケースにとって魅力的になり得るメッセージのリプレイ機能やリージョン間レプリケーション機能も提供します。

しかし、ClickHouse はデータの挿入を非常に高速に処理でき、一般的なハードウェアでも毎秒数百万行を扱うことができます。ClickHouse 側からのバックプレッシャーは**まれ**です。多くの場合、Kafka キューを活用することは、アーキテクチャの複雑さとコストの増大を意味します。ログは銀行取引やその他のミッションクリティカルなデータと同レベルの配信保証を必要としない、という前提を受け入れられるのであれば、Kafka を導入することによるこの複雑さは避けることを推奨します。

一方で、高い配信保証や（複数の宛先に対して）データをリプレイする能力が必須要件である場合には、Kafka は有用なアーキテクチャ上のコンポーネントとなり得ます。

<Image img={observability_9} alt="Kafka の追加" size="md"/>

この場合、OTel エージェントは [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) を介して Kafka にデータを送信するように設定できます。ゲートウェイインスタンスは、[Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) を使用してメッセージを消費します。詳細については、Confluent と OTel のドキュメントを参照することをお勧めします。

### リソース見積もり \\{#estimating-resources\\}

OTel collector のリソース要件は、イベントスループット、メッセージサイズ、および実施する処理内容に依存します。OpenTelemetry プロジェクトでは、リソース要件を見積もる際に利用できる[ベンチマーク](https://opentelemetry.io/docs/collector/benchmarks/)を公開しています。

[弊社の経験では](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)、3 コアと 12GB の RAM を搭載したゲートウェイインスタンスで、毎秒約 6 万件のイベントを処理できます。これは、フィールド名の変更のみを行い、正規表現を使用しない最小限の処理パイプラインを前提としています。

ゲートウェイへのイベント送信と、イベントへのタイムスタンプ設定のみを担当するエージェントインスタンスについては、想定される 1 秒あたりのログ数に基づいてリソースを見積もることを推奨します。以下は、出発点として利用できるおおよその値です。

| ログレート | collector エージェントに必要なリソース |
|------------|----------------------------------------|
| 1k/second  | 0.2CPU, 0.2GiB                        |
| 5k/second  | 0.5 CPU, 0.5GiB                       |
| 10k/second | 1 CPU, 1GiB                           |