---
slug: /use-cases/observability/clickstack/integrations/nginx-traces
title: 'ClickStack による Nginx トレースの監視'
sidebar_label: 'Nginx トレース'
pagination_prev: null
pagination_next: null
description: 'ClickStack による Nginx トレースの監視'
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
本ガイドでは、既存のNginxインストールから分散トレースをキャプチャし、ClickStackで可視化する方法を説明します。以下の内容を学習できます:

- NginxへのOpenTelemetryモジュールの追加
- ClickStackのOTLPエンドポイントへトレースを送信するためのNginx設定
- HyperDXでのトレース表示の確認
- 事前構築済みダッシュボードを使用したリクエストパフォーマンス(レイテンシ、エラー、スループット)の可視化

本番環境のNginxを設定する前に統合をテストする場合は、サンプルトレースを含むデモデータセットが利用可能です。

所要時間: 5〜10分
::::


## 既存のNginxとの統合 {#existing-nginx}

このセクションでは、OpenTelemetryモジュールをインストールし、ClickStackへトレースを送信するよう設定することで、既存のNginxインストールに分散トレーシングを追加する方法を説明します。
既存のセットアップを設定する前に統合をテストする場合は、[次のセクション](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset)の事前設定済みセットアップとサンプルデータを使用してテストできます。

##### 前提条件 {#prerequisites}

- OTLPエンドポイントにアクセス可能な状態で稼働しているClickStackインスタンス(ポート4317/4318)
- 既存のNginxインストール(バージョン1.18以上)
- Nginx設定を変更するためのrootまたはsudoアクセス権限
- ClickStackのホスト名またはIPアドレス

<VerticalStepper headerLevel="h4">

#### OpenTelemetry Nginxモジュールのインストール {#install-module}

Nginxにトレーシングを追加する最も簡単な方法は、OpenTelemetryサポートが組み込まれた公式Nginxイメージを使用することです。

##### nginx:otelイメージの使用 {#using-otel-image}

現在のNginxイメージをOpenTelemetry対応バージョンに置き換えます:


```yaml
# In your docker-compose.yml or Dockerfile
image: nginx:1.27-otel
```

このイメージには`ngx_otel_module.so`が事前インストールされており、すぐに使用できます。

:::note
Docker以外の環境でNginxを実行している場合は、手動インストール手順について[OpenTelemetry Nginxドキュメント](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx)を参照してください。
:::

#### ClickStackにトレースを送信するようにNginxを設定する {#configure-nginx}

`nginx.conf`ファイルにOpenTelemetry設定を追加します。この設定はモジュールをロードし、トレースをClickStackのOTLPエンドポイントに送信します。

まず、APIキーを取得します:

1. ClickStack URLでHyperDXを開きます
2. Settings → API Keysに移動します
3. **Ingestion API Key**をコピーします
4. 環境変数として設定します: `export CLICKSTACK_API_KEY=your-api-key-here`

`nginx.conf`に以下を追加します:

```yaml
load_module modules/ngx_otel_module.so;

events {
    worker_connections 1024;
}

http {
    # OpenTelemetryエクスポーター設定
    otel_exporter {
        endpoint <clickstack-host>:4317;
        header authorization ${CLICKSTACK_API_KEY};
    }

    # このnginxインスタンスを識別するためのサービス名
    otel_service_name "nginx-proxy";

    # トレースを有効化
    otel_trace on;

    server {
        listen 80;

        location / {
            # トレースを有効化 for this location
            otel_trace_context propagate;
            otel_span_name "$request_method $uri";

            # トレースにリクエストの詳細を追加
            otel_span_attr http.status_code $status;
            otel_span_attr http.request.method $request_method;
            otel_span_attr http.route $uri;

            # 既存のプロキシまたはアプリケーション設定
            proxy_pass http://your-backend;
        }
    }
}
```

DockerでNginxを実行している場合は、環境変数をコンテナに渡します:

```yaml
services:
  nginx:
    image: nginx:1.27-otel
    environment:
      - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

`<clickstack-host>`をClickStackインスタンスのホスト名またはIPアドレスに置き換えてください。

:::note

- **ポート4317**はNginxモジュールが使用するgRPCエンドポイントです
- **otel_service_name**はNginxインスタンスを説明する名前にする必要があります（例: "api-gateway"、"frontend-proxy"）
- HyperDXでの識別を容易にするため、**otel_service_name**を環境に合わせて変更してください
  :::

##### 設定について {#understanding-configuration}

**トレースされる内容:**
Nginxへの各リクエストは、以下を示すトレーススパンを作成します:

- リクエストメソッドとパス
- HTTPステータスコード
- リクエスト処理時間
- タイムスタンプ

**スパン属性:**
`otel_span_attr`ディレクティブは各トレースにメタデータを追加し、HyperDXでステータスコード、メソッド、ルートなどによってリクエストをフィルタリングおよび分析できるようにします。

これらの変更を行った後、Nginx設定をテストします:

```bash
nginx -t
```


テストが成功したら、Nginx をリロードします：

```bash
# Dockerの場合
docker-compose restart nginx
```


# systemd を使用している場合

sudo systemctl reload nginx

```

#### HyperDXでトレースを確認する {#verifying-traces}

設定完了後、HyperDXにログインしてトレースが流れていることを確認します。トレースが表示されない場合は、時間範囲を調整してください。次のような画面が表示されます。

<Image img={view_traces} alt="トレースの表示"/>

</VerticalStepper>
```


## デモデータセット {#demo-dataset}

本番システムを構成する前にnginxトレース統合をテストしたいユーザー向けに、実際のトラフィックパターンを持つ事前生成済みのNginxトレースのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### ClickStackの起動 {#start-clickstack}

ClickStackがまだ実行されていない場合は、以下のコマンドで起動します:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

次の手順に進む前に、ClickStackが完全に初期化されるまで約30秒待ちます。

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

- 現実的なタイミングを持つ1,000個のトレーススパン
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
2. 設定 → APIキーに移動します
3. **Ingestion APIキー**をコピーします

次に、トレースをClickStackに送信します：

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nginx-traces-sample.json
```

:::note[localhostでの実行]
このデモは、ClickStackが`localhost:4318`でローカルに実行されていることを前提としています。リモートインスタンスの場合は、`localhost`をClickStackのホスト名に置き換えてください。
:::

`{"partialSuccess":{}}`のようなレスポンスが表示され、トレースが正常に送信されたことを示します。1,000件すべてのトレースがClickStackに取り込まれます。

#### HyperDXでのトレース検証 {#verify-demo-traces}

1. [HyperDX](http://localhost:8080/)を開き、アカウントにログインします（最初にアカウントを作成する必要がある場合があります）
2. 検索ビューに移動し、ソースを`Traces`に設定します
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

#### ダッシュボード設定を<TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">ダウンロード</TrackedLink> {#download}

#### 事前構築されたダッシュボードをインポート {#import-dashboard}

1. HyperDXを開き、ダッシュボードセクションに移動します。
2. 右上隅の省略記号の下にある「Import Dashboard」をクリックします。

<Image img={import_dashboard} alt='ダッシュボードのインポート' />

3. nginx-trace-dashboard.jsonファイルをアップロードし、「finish import」をクリックします。

<Image img={finish_import} alt='インポートの完了' />

#### すべての可視化が事前設定されたダッシュボードが作成されます {#created-dashboard}

:::note
デモデータセットの場合、時間範囲を**2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**に設定してください（ローカルタイムゾーンに基づいて調整してください）。インポートされたダッシュボードには、デフォルトで時間範囲が指定されていません。
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


**nginx のエラーログを確認する**

```bash
# Dockerの場合
docker logs <nginx-container> 2>&1 | grep -i otel
```


# systemd の場合

sudo tail -f /var/log/nginx/error.log | grep -i otel

```
OpenTelemetry関連のエラーを確認してください。
```


**nginx がリクエストを受信しているか確認する:**

```bash
# アクセスログを確認してトラフィックを検証
tail -f /var/log/nginx/access.log
```


## 次のステップ {#next-steps}

ダッシュボードをさらに活用したい場合は、以下の手順を試してみてください。

- 重要なメトリクス（エラー率、レイテンシのしきい値）に対するアラートを設定する
- 特定のユースケース（API監視、セキュリティイベント）用の追加ダッシュボードを作成する
