---
slug: /use-cases/observability/clickstack/integrations/nginx-traces
title: 'ClickStack による Nginx トレースのモニタリング'
sidebar_label: 'Nginx トレース'
pagination_prev: null
pagination_next: null
description: 'ClickStack による Nginx トレースのモニタリング'
doc_type: 'guide'
keywords: ['ClickStack', 'Nginx', 'traces', 'otel']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-traces-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/nginx-traces-dashboard.png';
import view_traces from '@site/static/images/clickstack/nginx-traces-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStackによるNginxトレースの監視 {#nginx-traces-clickstack}

:::note[要約]
このガイドでは、既存のNginxインストールから分散トレースを取得し、ClickStackで可視化する方法を説明します。以下の内容を学習します:

- NginxへのOpenTelemetryモジュールの追加
- ClickStackのOTLPエンドポイントへトレースを送信するためのNginx設定
- HyperDXでのトレース表示の確認
- 事前構築済みダッシュボードを使用したリクエストパフォーマンス(レイテンシ、エラー、スループット)の可視化

本番環境のNginxを設定する前に統合をテストする場合は、サンプルトレースを含むデモデータセットが利用可能です。

所要時間:5〜10分
::::


## 既存のNginxとの統合 {#existing-nginx}

このセクションでは、OpenTelemetryモジュールをインストールし、ClickStackへトレースを送信するよう設定することで、既存のNginxインストールに分散トレーシングを追加する方法を説明します。
既存のセットアップを設定する前に統合をテストする場合は、[次のセクション](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset)にある事前設定済みのセットアップとサンプルデータを使用してテストできます。

##### 前提条件 {#prerequisites}

- OTLPエンドポイントにアクセス可能なClickStackインスタンスが稼働していること（ポート4317/4318）
- 既存のNginxインストール（バージョン1.18以上）
- Nginx設定を変更するためのrootまたはsudoアクセス権
- ClickStackのホスト名またはIPアドレス

<VerticalStepper headerLevel="h4">

#### OpenTelemetry Nginxモジュールのインストール {#install-module}

Nginxにトレーシングを追加する最も簡単な方法は、OpenTelemetryサポートが組み込まれた公式Nginxイメージを使用することです。

##### nginx:otelイメージの使用 {#using-otel-image}

現在のNginxイメージをOpenTelemetry対応バージョンに置き換えます：


```yaml
# 使用している docker-compose.yml または Dockerfile 内
image: nginx:1.27-otel
```

このイメージには `ngx_otel_module.so` があらかじめインストールされており、すぐに利用できます。

:::note
Docker の外で Nginx を実行している場合は、手動インストール手順については [OpenTelemetry Nginx ドキュメント](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx) を参照してください。
:::

#### Nginx を設定してトレースを ClickStack に送信する {#configure-nginx}

`nginx.conf` ファイルに OpenTelemetry の設定を追加します。この設定でモジュールを読み込み、トレースを ClickStack の OTLP エンドポイントに送信します。

まず、API キーを取得します：

1. ClickStack の URL で HyperDX を開きます
2. Settings → API Keys に移動します
3. **Ingestion API Key** をコピーします
4. 次のように環境変数として設定します：`export CLICKSTACK_API_KEY=your-api-key-here`

次を `nginx.conf` に追加します：

```yaml
load_module modules/ngx_otel_module.so;

events {
    worker_connections 1024;
}

http {
    # OpenTelemetry exporter configuration
    otel_exporter {
        endpoint <clickstack-host>:4317;
        header authorization ${CLICKSTACK_API_KEY};
    }

    # Service name for identifying this nginx instance
    otel_service_name "nginx-proxy";

    # Enable tracing
    otel_trace on;

    server {
        listen 80;

        location / {
            # Enable tracing for this location
            otel_trace_context propagate;
            otel_span_name "$request_method $uri";

            # Add request details to traces
            otel_span_attr http.status_code $status;
            otel_span_attr http.request.method $request_method;
            otel_span_attr http.route $uri;

            # Your existing proxy or application configuration
            proxy_pass http://your-backend;
        }
    }
}
```

Docker で Nginx を実行している場合は、その環境変数をコンテナに渡します：

```yaml
services:
  nginx:
    image: nginx:1.27-otel
    environment:
      - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

`<clickstack-host>` を、使用している ClickStack インスタンスのホスト名または IP アドレスに置き換えてください。

:::note

- **ポート 4317** は Nginx モジュールが使用する gRPC エンドポイントです
- **otel_service_name** には、Nginx インスタンスを表すわかりやすい名前を設定してください（例: "api-gateway", "frontend-proxy"）
- HyperDX 上で識別しやすくするため、環境に合わせて **otel_service_name** を変更してください
  :::

##### 設定内容の理解 {#understanding-configuration}

**トレースされる内容:**
Nginx への各リクエストに対して、次の情報を含むトレーススパンが作成されます：

- リクエストメソッドとパス
- HTTP ステータスコード
- リクエスト処理時間
- タイムスタンプ

**スパン属性:**
`otel_span_attr` ディレクティブは各トレースにメタデータを追加し、HyperDX 上でステータスコード、メソッド、ルートなどに基づいてリクエストをフィルタリングおよび分析できるようにします。

これらの変更を行ったら、次のコマンドで Nginx の設定をテストします：

```bash
nginx -t
```


テストが成功したら、Nginx を再読み込みします。

```bash
# Docker の場合
docker-compose restart nginx
```


# systemd を使用している場合

sudo systemctl reload nginx

```

#### HyperDXでトレースを確認する {#verifying-traces}

設定完了後、HyperDXにログインしてトレースが正常に送信されていることを確認します。次のような画面が表示されるはずです。トレースが表示されない場合は、時間範囲を調整してください。

<Image img={view_traces} alt="トレースの表示"/>

</VerticalStepper>
```


## デモデータセット {#demo-dataset}

本番環境を構成する前にnginxトレース統合をテストしたいユーザー向けに、実際のトラフィックパターンを再現した事前生成済みのNginxトレースのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### ClickStackの起動 {#start-clickstack}

ClickStackをまだ起動していない場合は、以下のコマンドで起動してください:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

次の手順に進む前に、ClickStackが完全に初期化されるまで約30秒お待ちください。

- ポート8080: HyperDX Webインターフェース
- ポート4317: OTLP gRPCエンドポイント(nginxモジュールで使用)
- ポート4318: OTLP HTTPエンドポイント(デモトレースで使用)

#### サンプルデータセットのダウンロード {#download-sample}

サンプルトレースファイルをダウンロードし、タイムスタンプを現在時刻に更新します:


```bash
# トレースのダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nginx-traces-sample.json
```

データセットには以下が含まれます：

- リアルなタイミングを持つ1,000個のトレーススパン
- 多様なトラフィックパターンを持つ9つの異なるエンドポイント
- 約93%の成功率（200）、約3%のクライアントエラー（404）、約4%のサーバーエラー（500）
- 10msから800msまでのレイテンシ
- 元のトラフィックパターンを保持し、現在時刻にシフト

#### ClickStackへのトレース送信 {#send-traces}

APIキーを環境変数として設定します（まだ設定していない場合）：

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

**APIキーの取得：**

1. ClickStack URLでHyperDXを開きます
2. Settings → API Keysに移動します
3. **Ingestion API Key**をコピーします

次に、トレースをClickStackに送信します：

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nginx-traces-sample.json
```

:::note[localhostでの実行]
このデモでは、ClickStackが`localhost:4318`でローカルに実行されていることを前提としています。リモートインスタンスの場合は、`localhost`をClickStackのホスト名に置き換えてください。
:::

`{"partialSuccess":{}}`のようなレスポンスが表示され、トレースが正常に送信されたことを示します。1,000個すべてのトレースがClickStackに取り込まれます。

#### HyperDXでのトレース確認 {#verify-demo-traces}

1. [HyperDX](http://localhost:8080/)を開き、アカウントにログインします（最初にアカウントを作成する必要がある場合があります）
2. Searchビューに移動し、ソースを`Traces`に設定します
3. 時間範囲を**2025-10-25 13:00:00 - 2025-10-28 13:00:00**に設定します

検索ビューには以下のように表示されます：

:::note[タイムゾーン表示]
HyperDXはブラウザのローカルタイムゾーンでタイムスタンプを表示します。デモデータは**2025-10-26 13:00:00 - 2025-10-27 13:00:00（UTC）**の範囲です。広い時間範囲により、場所に関係なくデモトレースを確認できます。トレースが表示されたら、より明確な可視化のために範囲を24時間に絞り込むことができます。
:::

<Image img={view_traces} alt='トレースの表示' />

</VerticalStepper>


## ダッシュボードと可視化 {#dashboards}

ClickStackでトレースの監視を開始できるよう、トレースデータの重要な可視化機能を提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード設定を<TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">ダウンロード</TrackedLink>する {#download}

#### 事前構築されたダッシュボードをインポートする {#import-dashboard}

1. HyperDXを開き、Dashboardsセクションに移動します。
2. 右上隅の省略記号の下にある「Import Dashboard」をクリックします。

<Image img={import_dashboard} alt='ダッシュボードのインポート' />

3. nginx-trace-dashboard.jsonファイルをアップロードし、「finish import」をクリックします。

<Image img={finish_import} alt='インポートの完了' />

#### すべての可視化が事前設定されたダッシュボードが作成されます。 {#created-dashboard}

:::note
デモデータセットの場合、時間範囲を**2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**に設定してください(ローカルタイムゾーンに基づいて調整してください)。インポートされたダッシュボードには、デフォルトで時間範囲が指定されていません。
:::

<Image img={example_dashboard} alt='ダッシュボードの例' />

</VerticalStepper>


## トラブルシューティング {#troubleshooting}

### HyperDXにトレースが表示されない場合 {#no-traces}

**nginxモジュールが読み込まれているか確認する:**

```bash
nginx -V 2>&1 | grep otel
```

OpenTelemetryモジュールへの参照が表示されます。

**ネットワーク接続を確認する:**

```bash
telnet <clickstack-host> 4317
```

OTLP gRPCエンドポイントへの接続が成功します。

**APIキーが設定されているか確認する:**

```bash
echo $CLICKSTACK_API_KEY
```

APIキーが出力されます(空でないこと)。


**nginx のエラーログを確認する：**

```bash
# Docker の場合
docker logs <nginx-container> 2>&1 | grep -i otel
```


# systemd の場合

sudo tail -f /var/log/nginx/error.log | grep -i otel

```
OpenTelemetry関連のエラーを確認してください。
```


**nginx がリクエストを受信していることを確認する：**

```bash
# アクセスログを確認してトラフィックを検証
tail -f /var/log/nginx/access.log
```


## 次のステップ {#next-steps}

ダッシュボードをさらに活用したい場合は、以下の手順を試してみてください。

- 重要なメトリクス(エラー率、レイテンシのしきい値)に対するアラートを設定する
- 特定のユースケース(APIモニタリング、セキュリティイベント)用の追加ダッシュボードを作成する
