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


# ClickStack を使用した Nginx トレースの監視 {#nginx-traces-clickstack}

:::note[要約]
このガイドでは、既存の Nginx 環境から分散トレースを取得し、ClickStack で可視化する方法を説明します。次の内容を学習します。

- Nginx に OpenTelemetry モジュールを追加する
- Nginx を設定して、トレースを ClickStack の OTLP エンドポイントに送信する
- HyperDX にトレースが表示されていることを確認する
- あらかじめ用意されたダッシュボードを使用して、リクエストのパフォーマンス（レイテンシ、エラー、スループット）を可視化する

本番環境の Nginx を設定する前に統合をテストしたい場合は、サンプルトレースを含むデモデータセットを利用できます。

所要時間: 約 5〜10 分
::::



## 既存のNginxとの統合 {#existing-nginx}

このセクションでは、OpenTelemetryモジュールをインストールし、トレースをClickStackに送信するよう設定することで、既存のNginxインストールに分散トレーシングを追加する方法を説明します。
既存のセットアップを設定する前に統合をテストする場合は、[次のセクション](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset)の事前設定済みセットアップとサンプルデータを使用してテストできます。

##### 前提条件 {#prerequisites}

- OTLPエンドポイントにアクセス可能な状態で稼働しているClickStackインスタンス（ポート4317/4318）
- 既存のNginxインストール（バージョン1.18以上）
- Nginx設定を変更するためのrootまたはsudoアクセス
- ClickStackのホスト名またはIPアドレス

<VerticalStepper headerLevel="h4">

#### OpenTelemetry Nginxモジュールのインストール {#install-module}

Nginxにトレーシングを追加する最も簡単な方法は、OpenTelemetryサポートが組み込まれた公式Nginxイメージを使用することです。

##### nginx:otelイメージの使用 {#using-otel-image}

現在のNginxイメージをOpenTelemetry対応バージョンに置き換えます。


```yaml
# docker-compose.yml または Dockerfile 内
image: nginx:1.27-otel
```

このイメージには `ngx_otel_module.so` が事前にインストールされており、すぐに使用できます。

:::note
Nginx を Docker コンテナの外で実行している場合は、手動インストール手順について、[OpenTelemetry の Nginx 向けドキュメント](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx) を参照してください。
:::

#### ClickStack にトレースを送信するように Nginx を設定する

`nginx.conf` ファイルに OpenTelemetry の設定を追加します。この設定によりモジュールがロードされ、トレースが ClickStack の OTLP エンドポイントに送信されます。

まず、API key を取得します。

1. ClickStack の URL で HyperDX を開きます
2. Settings → API Keys に移動します
3. **Ingestion API Key**（インジェスト API key）をコピーします
4. 環境変数として設定します: `export CLICKSTACK_API_KEY=your-api-key-here`

次を `nginx.conf` に追加します:

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
    
    # このnginxインスタンスを識別するサービス名
    otel_service_name "nginx-proxy";
    
    # トレーシングを有効化
    otel_trace on;
    
    server {
        listen 80;
        
        location / {
            # このロケーションでトレーシングを有効化
            otel_trace_context propagate;
            otel_span_name "$request_method $uri";
            
            # リクエスト詳細をトレースに追加
            otel_span_attr http.status_code $status;
            otel_span_attr http.request.method $request_method;
            otel_span_attr http.route $uri;
            
            # 既存のプロキシまたはアプリケーション設定
            proxy_pass http://your-backend;
        }
    }
}
```

Docker で Nginx を実行している場合は、環境変数をコンテナに渡してください：

```yaml
services:
  nginx:
    image: nginx:1.27-otel
    environment:
      - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

`<clickstack-host>` を使用している ClickStack インスタンスのホスト名または IP アドレスに置き換えてください。

:::note

* **ポート 4317** は Nginx モジュールが使用する gRPC エンドポイントです
* **otel&#95;service&#95;name** には、Nginx インスタンスを表すわかりやすい名前を指定してください（例: &quot;api-gateway&quot;, &quot;frontend-proxy&quot;）
* HyperDX 上で識別しやすくするために、環境に合わせて **otel&#95;service&#95;name** を設定してください
  :::

##### 設定内容の理解

**何がトレースされるか:**
Nginx への各リクエストは、次の情報を示すスパンを生成します:

* リクエストメソッドとパス
* HTTP ステータスコード
* リクエスト処理時間
* タイムスタンプ

**スパン属性:**
`otel_span_attr` ディレクティブは各トレースにメタデータを追加し、HyperDX 上でステータスコード、メソッド、ルートなどによってリクエストをフィルタリングおよび分析できるようにします。

これらの変更を行ったら、Nginx の設定をテストしてください。

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

#### HyperDXでトレースを検証する {#verifying-traces}

設定完了後、HyperDXにログインし、トレースが正常に送信されていることを確認します。正常に動作している場合、以下のような画面が表示されます。トレースが表示されない場合は、時間範囲を調整してください。

<Image img={view_traces} alt="トレースを表示"/>

</VerticalStepper>
```


## デモデータセット {#demo-dataset}

本番システムを構成する前にnginxトレース統合をテストしたいユーザー向けに、実際のトラフィックパターンを持つ事前生成済みのNginxトレースのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### ClickStackを起動する {#start-clickstack}

ClickStackをまだ実行していない場合は、以下のコマンドで起動します:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

次の手順に進む前に、ClickStackが完全に初期化されるまで約30秒待機します。

- ポート8080: HyperDX Webインターフェース
- ポート4317: OTLP gRPCエンドポイント(nginxモジュールが使用)
- ポート4318: OTLP HTTPエンドポイント(デモトレースが使用)

#### サンプルデータセットをダウンロードする {#download-sample}

サンプルトレースファイルをダウンロードし、タイムスタンプを現在時刻に更新します:


```bash
# トレースをダウンロードする
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nginx-traces-sample.json
```

データセットには以下が含まれます：

- 現実的なタイミングを持つ1,000個のトレーススパン
- 多様なトラフィックパターンを持つ9つの異なるエンドポイント
- 約93%の成功率（200）、約3%のクライアントエラー（404）、約4%のサーバーエラー（500）
- 10msから800msまでのレイテンシ
- 元のトラフィックパターンを保持し、現在時刻にシフト

#### ClickStackにトレースを送信する {#send-traces}

API keyを環境変数として設定します（まだ設定していない場合）：

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

**API keyを取得する：**

1. ClickStack URLでHyperDXを開く
2. Settings → API Keysに移動する
3. **インジェスト API key**をコピーする

次に、ClickStackにトレースを送信します：

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

#### HyperDXでトレースを確認する {#verify-demo-traces}

1. [HyperDX](http://localhost:8080/)を開き、アカウントにログインします（最初にアカウントを作成する必要がある場合があります）
2. Searchビューに移動し、ソースを`Traces`に設定します
3. 時間範囲を**2025-10-25 13:00:00 - 2025-10-28 13:00:00**に設定します

検索ビューには以下のように表示されます：

:::note[タイムゾーン表示]
HyperDXはブラウザのローカルタイムゾーンでタイムスタンプを表示します。デモデータは**2025-10-26 13:00:00 - 2025-10-27 13:00:00（UTC）**の期間にわたります。広い時間範囲により、場所に関係なくデモトレースを確認できます。トレースが表示されたら、より明確な可視化のために範囲を24時間に絞り込むことができます。
:::

<Image img={view_traces} alt='トレースを表示' />

</VerticalStepper>


## ダッシュボードと可視化 {#dashboards}

ClickStack でトレースの監視を始めやすくするために、トレースデータ向けの主要な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード設定ファイルを<TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">ダウンロード</TrackedLink>する {#download}

#### あらかじめ用意されたダッシュボードをインポートする {#import-dashboard}
1. HyperDX を開き、Dashboards セクションに移動します。
2. 右上の省略記号の下にある「Import Dashboard」をクリックします。

<Image img={import_dashboard} alt="ダッシュボードのインポート"/>

3. `nginx-trace-dashboard.json` ファイルをアップロードし、「Finish import」をクリックします。

<Image img={finish_import} alt="インポートの完了"/>

#### すべての可視化が事前設定された状態でダッシュボードが作成されます。 {#created-dashboard}

:::note
デモデータセットでは、時間範囲を **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

<Image img={example_dashboard} alt="ダッシュボード例"/>

</VerticalStepper>



## トラブルシューティング

### HyperDX にトレースが表示されない場合

**nginx モジュールがロードされていることを確認してください：**

```bash
nginx -V 2>&1 | grep otel
```

OpenTelemetry モジュールへの参照が表示されているはずです。

**ネットワーク接続を確認する：**

```bash
telnet <clickstack-host> 4317
```

これで OTLP gRPC エンドポイントに正常に接続できるはずです。

**API キーが設定されていることを確認します:**

```bash
echo $CLICKSTACK_API_KEY
```

空ではない API キーが出力されるはずです。


**nginx のエラーログを確認する:**

```bash
# Docker の場合
docker logs <nginx-container> 2>&1 | grep -i otel
```


# systemd の場合

sudo tail -f /var/log/nginx/error.log | grep -i otel

```
OpenTelemetry関連のエラーを確認してください。
```


**nginx がリクエストを受信していることを確認する:**

```bash
# アクセスログを確認してトラフィックを検証
tail -f /var/log/nginx/access.log
```


## 次のステップ {#next-steps}
さらに活用したい場合は、ダッシュボードで次のようなことを試してみてください。

- 重要なメトリクス（エラー率、レイテンシのしきい値）に対するアラートを設定する
- 特定のユースケース向け（API 監視、セキュリティイベントなど）に追加のダッシュボードを作成する
