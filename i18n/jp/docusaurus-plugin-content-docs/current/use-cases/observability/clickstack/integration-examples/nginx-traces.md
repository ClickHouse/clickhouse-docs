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

# ClickStack を使った Nginx トレースのモニタリング {#nginx-traces-clickstack}

:::note[TL;DR]
このガイドでは、既存の Nginx インストールから分散トレースを収集し、ClickStack で可視化する方法を説明します。次の内容を学びます：

- Nginx に OpenTelemetry モジュールを追加する
- Nginx を設定して ClickStack の OTLP エンドポイントにトレースを送信する
- HyperDX にトレースが表示されていることを確認する
- あらかじめ用意されたダッシュボードを使ってリクエスト性能（レイテンシ、エラー、スループット）を可視化する

本番環境の Nginx を設定する前に統合をテストしたい場合のために、サンプルトレースを含むデモ用データセットも用意されています。

所要時間：5〜10 分
::::

## 既存の Nginx との統合 {#existing-nginx}

このセクションでは、OpenTelemetry モジュールをインストールし、ClickStack にトレースを送信するように設定することで、既存の Nginx 環境に分散トレーシングを追加する方法を説明します。
既存の環境を設定する前に統合を試してみたい場合は、[次のセクション](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset)にある事前構成済みのセットアップとサンプルデータを使ってテストできます。

##### 前提条件 {#prerequisites}

- OTLP エンドポイントにアクセス可能な ClickStack インスタンスが稼働していること（ポート 4317/4318）
- 既存の Nginx インストール（バージョン 1.18 以上）
- Nginx 設定を変更するための root または sudo アクセス権
- ClickStack のホスト名または IP アドレス

<VerticalStepper headerLevel="h4">

#### OpenTelemetry Nginx モジュールをインストールする {#install-module}

Nginx にトレース機能を追加する最も簡単な方法は、OpenTelemetry 対応が組み込まれた公式 Nginx イメージを使用することです。

##### nginx:otel イメージを使用する {#using-otel-image}

現在使用している Nginx イメージを、OpenTelemetry 対応バージョンに置き換えます:

```yaml
# docker-compose.yml または Dockerfile 内 {#in-your-docker-composeyml-or-dockerfile}
image: nginx:1.27-otel
```

このイメージには、`ngx_otel_module.so` が事前インストールされており、すぐに使用できます。

:::note
Docker 以外で Nginx を実行している場合は、手動インストール手順について [OpenTelemetry Nginx ドキュメント](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx) を参照してください。
:::

#### Nginx を ClickStack へトレースを送信するように構成する {#configure-nginx}

`nginx.conf` ファイルに OpenTelemetry の設定を追加します。この設定でモジュールを読み込み、トレースを ClickStack の OTLP エンドポイントへ送信します。

まず、API キーを取得します:
1. ClickStack の URL で HyperDX を開く
2. Settings → API Keys に移動する  
3. **Ingestion API Key** をコピーする
4. 環境変数として設定する: `export CLICKSTACK_API_KEY=your-api-key-here`

次を `nginx.conf` に追加します:

```yaml
load_module modules/ngx_otel_module.so;

events {
    worker_connections 1024;
}

http {
    # OpenTelemetry エクスポーターの設定
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
- **otel_service_name** は、Nginx インスタンスを表すわかりやすい名前にしてください（例: "api-gateway", "frontend-proxy"）
- HyperDX で識別しやすくするために、環境に合わせて **otel_service_name** を変更してください
:::

##### 設定内容の理解 {#understanding-configuration}

**トレースされる内容:**
Nginx への各リクエストごとに、次を示すトレーススパンが作成されます:
- リクエストメソッドとパス
- HTTP ステータスコード
- リクエストの処理時間
- タイムスタンプ

**スパン属性:**
`otel_span_attr` ディレクティブは、各トレースにメタデータを追加し、HyperDX 上でステータスコード、メソッド、ルートなどでリクエストをフィルタリングおよび分析できるようにします。

これらの変更を行った後、Nginx の設定をテストします:
```bash
nginx -t
```

テストに成功したら、Nginx をリロードします:
```bash
# Docker の場合 {#for-docker}
docker-compose restart nginx

# systemd の場合 {#for-systemd}
sudo systemctl reload nginx
```

#### HyperDX でトレースを検証する {#verifying-traces}

設定が完了したら、HyperDX にログインしてトレースが送信されていることを確認します。次のような表示が見えるはずです。トレースが表示されない場合は、時間範囲の調整を試してください:

<Image img={view_traces} alt="トレースを表示"/>

</VerticalStepper>

## デモ用データセット {#demo-dataset}

本番システムを設定する前に nginx トレース連携をテストしたいユーザー向けに、現実的なトラフィックパターンを持つ事前生成済みの nginx トレースのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### ClickStack を起動する {#start-clickstack}

まだ ClickStack を起動していない場合は、次のコマンドで起動してください:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

続行する前に、ClickStack が完全に初期化されるまで約 30 秒待ちます。

- ポート 8080: HyperDX の Web インターフェイス
- ポート 4317: OTLP gRPC エンドポイント (nginx モジュールで使用)
- ポート 4318: OTLP HTTP エンドポイント (デモトレースで使用)

#### サンプルデータセットをダウンロードする {#download-sample}

サンプルトレースファイルをダウンロードし、タイムスタンプを現在時刻に更新します:

```bash
# Download the traces {#download-the-traces}
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nginx-traces-sample.json
```

このデータセットには以下が含まれます:
- 現実的なタイミングを持つ 1,000 個のトレーススパン
- 多様なトラフィックパターンを持つ 9 種類のエンドポイント
- 約 93% の成功率 (200)、約 3% のクライアントエラー (404)、約 4% のサーバーエラー (500)
- 10ms 〜 800ms の範囲のレイテンシ
- 元のトラフィックパターンを保持したまま、現在時刻にシフト済み

#### トレースを ClickStack に送信する {#send-traces}

API key を環境変数として設定します (まだ設定していない場合):

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

**API key を取得する:**
1. ClickStack の URL で HyperDX を開きます
2. Settings → API Keys に移動します
3. **Ingestion API Key** をコピーします

その後、トレースを ClickStack に送信します:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nginx-traces-sample.json
```

:::note[localhost での実行]
このデモでは、ClickStack が `localhost:4318` 上でローカルに動作していることを前提としています。リモート環境の場合は、`localhost` を ClickStack のホスト名に置き換えてください。
:::

`{"partialSuccess":{}}` のようなレスポンスが表示されれば、トレースが正常に送信されたことを示しています。すべての 1,000 件のトレースが ClickStack にインジェストされます。

#### HyperDX でトレースを確認する {#verify-demo-traces}

1. [HyperDX](http://localhost:8080/) を開き、アカウントにログインします (必要に応じてアカウントを作成してください)
2. Search ビューに移動し、ソースを `Traces` に設定します
3. タイムレンジを **2025-10-25 13:00:00 - 2025-10-28 13:00:00** に設定します

Search ビューでは次のように表示されるはずです:

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** の範囲をカバーしています。広めのタイムレンジを指定することで、どの場所からアクセスしてもデモトレースを確認できるようにしています。トレースが確認できたら、24 時間の範囲に狭めて、より見やすい可視化にすることができます。
:::

<Image img={view_traces} alt="トレースを表示"/>

</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack でトレースの監視を始めやすくするために、トレースデータ向けの基本的な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード設定を<TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">ダウンロード</TrackedLink> {#download}

#### あらかじめ用意されたダッシュボードをインポートする {#import-dashboard}
1. HyperDX を開き、［Dashboards］セクションに移動します。
2. 右上の三点リーダーアイコンから「Import Dashboard」をクリックします。

<Image img={import_dashboard} alt="ダッシュボードのインポート"/>

3. `nginx-traces-dashboard.json` ファイルをアップロードし、「Finish import」をクリックします。

<Image img={finish_import} alt="インポートの完了"/>

#### すべての可視化が事前設定された状態でダッシュボードが作成されます。 {#created-dashboard}

:::note
デモデータセットを使用する場合、時間範囲を **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** に設定します（ローカルタイムゾーンに応じて調整してください）。インポートしたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

<Image img={example_dashboard} alt="ダッシュボード例"/>

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### HyperDX にトレースが表示されない {#no-traces}

**nginx モジュールがロードされていることを確認してください:**

```bash
nginx -V 2>&1 | grep otel
```

OpenTelemetry モジュールへの参照が表示されているはずです。

**ネットワーク接続を確認する:**

```bash
telnet <clickstack-host> 4317
```

これで OTLP の gRPC エンドポイントに正常に接続できるはずです。

**API キーが設定されていることを確認する:**

```bash
echo $CLICKSTACK_API_KEY
```

空ではない API キーが出力されていることを確認します。

**nginx のエラーログを確認する:**

```bash
# Docker の場合 {#for-docker}
docker logs <nginx-container> 2>&1 | grep -i otel

# systemd の場合 {#for-systemd}
sudo tail -f /var/log/nginx/error.log | grep -i otel
```

OpenTelemetry 関連のエラーが発生していないか確認します。

**nginx がリクエストを受信していることを確認する：**

```bash
# アクセスログを確認してトラフィックを検証する {#check-access-logs-to-confirm-traffic}
tail -f /var/log/nginx/access.log
```

## 次のステップ {#next-steps}

さらに深く活用したい場合は、ダッシュボードで次のようなことを試してみてください。

- 重要なメトリクス（エラー率、レイテンシのしきい値）に対するアラートを設定する
- 特定のユースケース向けに追加のダッシュボードを作成する（API モニタリング、セキュリティイベントなど）