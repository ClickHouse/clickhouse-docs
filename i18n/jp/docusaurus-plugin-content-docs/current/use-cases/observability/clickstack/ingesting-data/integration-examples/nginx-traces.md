---
slug: /use-cases/observability/clickstack/integrations/nginx-traces
title: 'ClickStack を使用した Nginx トレースの監視'
sidebar_label: 'Nginx トレース'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した Nginx トレースの監視'
doc_type: 'guide'
keywords: ['ClickStack', 'Nginx', 'traces', 'OTel']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-traces-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/nginx-traces-dashboard.png';
import view_traces from '@site/static/images/clickstack/nginx-traces-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack を用いた Nginx トレースの監視 \{#nginx-traces-clickstack\}

:::note[要約]
このガイドでは、既存の Nginx 環境から分散トレースを取得し、ClickStack で可視化する方法を説明します。次の内容を学びます:

- Nginx に OpenTelemetry モジュールを追加する
- Nginx を設定して、トレースを ClickStack の OTLP エンドポイントに送信する
- HyperDX にトレースが表示されていることを確認する
- あらかじめ用意されたダッシュボードを使って、リクエストのパフォーマンス（レイテンシ、エラー、スループット）を可視化する

本番環境の Nginx を設定する前に統合をテストしたい場合のために、サンプルトレースを含むデモデータセットが用意されています。

所要時間: 約 5〜10 分
::::

## 既存の Nginx との統合 \{#existing-nginx\}

このセクションでは、OpenTelemetry モジュールを導入し、既存の Nginx 環境に分散トレーシングを追加して、トレースを ClickStack に送信するよう構成する方法について説明します。
既存環境を設定する前に統合を試してみたい場合は、[次のセクション](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset)で、あらかじめ構成されたセットアップとサンプルデータを使ってテストできます。

##### 前提条件 \{#prerequisites\}

- OTLP エンドポイント (ポート 4317/4318) にアクセス可能な ClickStack インスタンスが稼働していること
- 既存の Nginx インストール (バージョン 1.18 以上)
- Nginx 設定を変更できる root または sudo 権限
- ClickStack のホスト名または IP アドレス

<VerticalStepper headerLevel="h4">

#### OpenTelemetry Nginx モジュールをインストールする \{#install-module\}

Nginx にトレースを追加する最も簡単な方法は、OpenTelemetry サポートが組み込まれた公式 Nginx イメージを利用することです。

##### nginx:otel イメージを使用する \{#using-otel-image\}

現在使用している Nginx イメージを、OpenTelemetry 対応バージョンに置き換えます:

```yaml
# docker-compose.yml または Dockerfile 内
image: nginx:1.27-otel
```

このイメージには `ngx_otel_module.so` が事前インストールされており、すぐに使用できます。

:::note
Nginx を Docker の外部で動かしている場合は、手動インストール手順について [OpenTelemetry Nginx ドキュメント](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx) を参照してください。
:::

#### Nginx を ClickStack にトレースを送信するように構成する \{#configure-nginx\}

`nginx.conf` ファイルに OpenTelemetry 設定を追加します。この設定はモジュールを読み込み、トレースを ClickStack の OTLP エンドポイントに送信します。

まず、API key を取得します:
1. ClickStack の URL で HyperDX を開く
2. Settings → API Keys に移動する  
3. **Ingestion API Key** をコピーする
4. 次のように環境変数として設定する: `export CLICKSTACK_API_KEY=your-api-key-here`

次を `nginx.conf` に追加します:

```yaml
load_module modules/ngx_otel_module.so;

events {
    worker_connections 1024;
}

http {
    # OpenTelemetry exporter の設定
    otel_exporter {
        endpoint <clickstack-host>:4317;
        header authorization ${CLICKSTACK_API_KEY};
    }
    
    # この nginx インスタンスを識別するためのサービス名
    otel_service_name "nginx-proxy";
    
    # トレースを有効化
    otel_trace on;
    
    server {
        listen 80;
        
        location / {
            # この location でトレースを有効化
            otel_trace_context propagate;
            otel_span_name "$request_method $uri";
            
            # リクエストの詳細をトレースに追加
            otel_span_attr http.status_code $status;
            otel_span_attr http.request.method $request_method;
            otel_span_attr http.route $uri;
            
            # 既存のプロキシまたはアプリケーション設定
            proxy_pass http://your-backend;
        }
    }
}
```

Nginx を Docker で実行している場合は、環境変数をコンテナに渡します:

```yaml
services:
  nginx:
    image: nginx:1.27-otel
    environment:
      - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

`<clickstack-host>` を、ClickStack インスタンスのホスト名または IP アドレスに置き換えてください。

:::note
- **ポート 4317** は、Nginx モジュールが使用する gRPC エンドポイントです
- **otel_service_name** には、この Nginx インスタンスを表すわかりやすい名前を設定してください (例: "api-gateway", "frontend-proxy")
- 環境を識別しやすくするため、**otel_service_name** を運用環境に合わせて変更してください (HyperDX 上での識別が容易になります)
:::

##### 設定内容の理解 \{#understanding-configuration\}

**トレースされる内容:**
Nginx への各リクエストは、次の情報を示すトレーススパンを作成します:
- リクエストメソッドとパス
- HTTP ステータスコード
- リクエストの処理時間
- タイムスタンプ

**スパン属性:**
`otel_span_attr` ディレクティブは各トレースにメタデータを追加し、HyperDX 上でステータスコード、メソッド、ルートなどによるリクエストのフィルタリングおよび分析を可能にします。

これらの変更を行った後、Nginx 設定をテストします:
```bash
nginx -t
```

テストに成功したら、Nginx をリロードします:
```bash
# Docker の場合
docker-compose restart nginx

# systemd の場合
sudo systemctl reload nginx
```

#### HyperDX でトレースを検証する \{#verifying-traces\}

設定が完了したら、HyperDX にログインしてトレースが流れていることを確認します。次のような表示が見えるはずです。トレースが表示されない場合は、時間範囲を調整してみてください:

<Image img={view_traces} alt="View Traces"/>

</VerticalStepper>

## デモデータセット \{#demo-dataset\}

本番環境を構成する前に nginx のトレース連携を試したいユーザー向けに、現実的なトラフィックパターンを含む事前生成済みの Nginx トレースのサンプルデータセットを提供します。

<VerticalStepper headerLevel="h4">

#### ClickStack を起動する \{#start-clickstack\}

まだ ClickStack を起動していない場合は、次のコマンドで起動します:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

続行する前に、ClickStack が完全に初期化されるまで約 30 秒待ちます。

- ポート 8080: HyperDX の Web インターフェース
- ポート 4317: OTLP gRPC エンドポイント (nginx モジュールで使用)
- ポート 4318: OTLP HTTP エンドポイント (デモトレースで使用)

#### サンプルデータセットをダウンロードする \{#download-sample\}

サンプルトレースファイルをダウンロードし、タイムスタンプを現在時刻に更新します:

```bash
# トレースをダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nginx-traces-sample.json
```

このデータセットには以下が含まれます:
- 現実的なタイミングを持つ 1,000 個のトレーススパン
- さまざまなトラフィックパターンを持つ 9 種類のエンドポイント
- 約 93% の成功率 (200)、約 3% のクライアントエラー (404)、約 4% のサーバーエラー (500)
- 10ms から 800ms までのレイテンシ
- 元のトラフィックパターンを保持したまま、現在時刻にシフト済み

#### トレースを ClickStack に送信する \{#send-traces\}

API key を環境変数として設定します (まだ設定していない場合):

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

**API key の取得方法:**
1. ClickStack の URL で HyperDX を開きます
2. Settings → API Keys に移動します
3. **インジェスト API key** をコピーします

続いて、トレースを ClickStack に送信します:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nginx-traces-sample.json
```

:::note[localhost 上で実行している場合]
このデモでは、ClickStack が `localhost:4318` でローカルに動作していることを前提としています。リモートインスタンスの場合は、`localhost` を ClickStack のホスト名に置き換えてください。
:::

`{"partialSuccess":{}}` のようなレスポンスが表示されれば、トレースが正常に送信されたことを示しています。1,000 件すべてのトレースが ClickStack にインジェストされます。

#### HyperDX でトレースを確認する \{#verify-demo-traces\}

1. [HyperDX](http://localhost:8080/) を開き、自分のアカウントにログインします (まだアカウントがない場合は、まずアカウントを作成します)
2. Search ビューに移動し、ソースを `Traces` に設定します
3. 時間範囲を **2025-10-25 13:00:00 - 2025-10-28 13:00:00** に設定します

Search ビューでは次のように表示されるはずです:

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** の期間をカバーしています。広めの時間範囲を指定することで、どの場所からでもデモトレースを必ず確認できるようにしています。トレースが確認できたら、より明確な可視化のために範囲を 24 時間に絞り込むことができます。
:::

<Image img={view_traces} alt="トレースを表示"/>

</VerticalStepper>

## ダッシュボードと可視化 \{#dashboards\}

ClickStack でトレース監視を開始しやすくするために、トレースデータ向けの基本的な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">ダウンロード</TrackedLink> ダッシュボード設定 \{#download\}

#### 事前に用意されたダッシュボードをインポートする \{#import-dashboard\}
1. HyperDX を開き、Dashboards セクションに移動します。
2. 右上の省略記号（三点）メニューを開き、"Import Dashboard" をクリックします。

<Image img={import_dashboard} alt="ダッシュボードのインポート"/>

3. `nginx-trace-dashboard.json` ファイルをアップロードし、"Finish import" をクリックします。

<Image img={finish_import} alt="インポートの完了"/>

#### ダッシュボードは、すべての可視化があらかじめ設定された状態で作成されます。 \{#created-dashboard\}

:::note
デモデータセットの場合、時間範囲を **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

<Image img={example_dashboard} alt="ダッシュボードの例"/>

</VerticalStepper>

## トラブルシューティング \{#troubleshooting\}

### HyperDX にトレースが表示されない \{#no-traces\}

**nginx モジュールが読み込まれていることを確認する：**

```bash
nginx -V 2>&1 | grep otel
```

OpenTelemetry モジュールへの参照が表示されていることを確認します。

**ネットワーク接続を確認する：**

```bash
telnet <clickstack-host> 4317
```

これで OTLP gRPC エンドポイントへ正常に接続できるはずです。

**API キーが設定されていることを確認する：**

```bash
echo $CLICKSTACK_API_KEY
```

API キーが空でない値として出力されていることを確認します。

**nginx のエラーログを確認します：**

```bash
# For Docker
docker logs <nginx-container> 2>&1 | grep -i otel

# For systemd
sudo tail -f /var/log/nginx/error.log | grep -i otel
```

OpenTelemetry 関連のエラーを確認します。

**nginx がリクエストを受信していることを確認します：**

```bash
# Check access logs to confirm traffic
tail -f /var/log/nginx/access.log
```


## 次のステップ \{#next-steps\}

さらに活用したい場合は、ダッシュボードで次のステップを試してみてください。

- 重要なメトリクス（エラー率、レイテンシのしきい値）に対してアラートを設定する
- 特定のユースケース（API モニタリング、セキュリティイベント）向けに追加のダッシュボードを作成する