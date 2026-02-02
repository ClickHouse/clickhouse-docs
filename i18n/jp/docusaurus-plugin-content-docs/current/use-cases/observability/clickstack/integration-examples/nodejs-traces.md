---
slug: /use-cases/observability/clickstack/integrations/nodejs-traces
title: 'ClickStack による Node.js トレースの監視'
sidebar_label: 'Node.js トレース'
pagination_prev: null
pagination_next: null
description: 'ClickStack による Node.js アプリケーション・トレースの監視'
doc_type: 'guide'
keywords: ['Node.js', 'traces', 'OTEL', 'ClickStack', 'distributed tracing']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import api_key from '@site/static/images/clickstack/api-key.png';
import search_view from '@site/static/images/clickstack/nodejs/traces-search-view.png';
import trace_view from '@site/static/images/clickstack/nodejs/trace-view.png';
import finish_import from '@site/static/images/clickstack/nodejs/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/nodejs/example-traces-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# ClickStack を使用した Node.js トレースの監視 \{#nodejs-traces-clickstack\}

:::note[TL;DR]
このガイドでは、Node.js アプリケーションから分散トレースを収集し、OpenTelemetry の自動計装を使用して ClickStack 上で可視化する方法を説明します。次の内容を学びます:

- 自動計装を用いた Node.js 向け OpenTelemetry のインストールと設定方法
- トレースを ClickStack の OTLP エンドポイントに送信する方法
- HyperDX 上でトレースが表示されていることを検証する方法
- あらかじめ用意されたダッシュボードを使用してアプリケーションのパフォーマンスを可視化する方法

本番アプリケーションを計装する前に統合をテストしたい場合のために、サンプルトレースを含むデモデータセットも利用できます。

所要時間: 10〜15 分
:::

## 既存の Node.js アプリケーションとの統合 \{#existing-nodejs\}

このセクションでは、OpenTelemetry の自動インストルメンテーションを使用して既存の Node.js アプリケーションに分散トレーシングを追加する方法について説明します。

ご自身の既存環境を設定する前に統合を試してみたい場合は、[デモデータセットのセクション](#demo-dataset)で用意している事前構成済みセットアップとサンプルデータを使って検証できます。

##### 前提条件 \{#prerequisites\}

- OTLP エンドポイントにアクセス可能な ClickStack インスタンス（ポート 4317/4318）
- 既存の Node.js アプリケーション（Node.js 14 以上）
- npm または yarn パッケージマネージャー
- ClickStack のホスト名または IP アドレス

<VerticalStepper headerLevel="h4">

#### OpenTelemetry のインストールと設定 \{#install-configure\}

`@hyperdx/node-opentelemetry` パッケージをインストールし、アプリケーションの先頭で初期化します。詳細なインストール手順については、[Node.js SDK ガイド](/use-cases/observability/clickstack/sdks/nodejs#getting-started) を参照してください。

#### ClickStack API key の取得 \{#get-api-key\}

ClickStack の OTLP エンドポイントにトレースを送信するための API key です。

1. ClickStack の URL (例: http://localhost:8080) で HyperDX を開く
2. 必要に応じてアカウントを作成するかログインする
3. **Team Settings → API Keys** に移動する
4. **Ingestion API Key（インジェスト API key）** をコピーする

<Image img={api_key} alt="ClickStack API キー"/>

#### アプリケーションを実行する \{#run-application\}

環境変数を設定して Node.js アプリケーションを起動します。

```bash
export CLICKSTACK_API_KEY=your-api-key-here
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

#### トラフィックを生成する \{#generate-traffic\}

アプリケーションにリクエストを送り、トレースを生成します。

```bash
# 簡単なリクエスト
curl http://localhost:3000/
curl http://localhost:3000/api/users
curl http://localhost:3000/api/products

# 負荷をシミュレート
for i in {1..100}; do curl -s http://localhost:3000/ > /dev/null; done
```

#### HyperDX でトレースを確認する \{#verify-traces\}

設定が完了したら HyperDX にログインし、トレースが流れていることを確認します。次のような画面が表示されるはずです。トレースが表示されない場合は、時間範囲を調整してみてください。

<Image img={search_view} alt="トレース検索ビュー"/>

任意のトレースをクリックすると、span、タイミング、属性を含む詳細ビューが表示されます。

<Image img={trace_view} alt="個別トレースビュー"/>

</VerticalStepper>

## デモデータセット \{#demo-dataset\}

本番アプリケーションを計測する前に ClickStack で Node.js のトレースを試したいユーザー向けに、現実的なトラフィックパターンを持つ、事前生成済みの Node.js アプリケーショントレースのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットをダウンロードする \{#download-sample\}

サンプルトレースファイルをダウンロードします:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nodejs/nodejs-traces-sample.json
```

#### ClickStack を起動する \{#start-clickstack\}

まだ ClickStack を起動していない場合は、次のコマンドで起動します:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD= \
  clickhouse/clickstack-all-in-one:latest
```

#### ClickStack の API key を取得する \{#get-api-key-demo\}

ClickStack の OTLP エンドポイントにトレースを送信するための API key を取得します。

1. ClickStack の URL で HyperDX を開きます (例: http://localhost:8080)
2. 必要に応じてアカウントを作成するかログインします
3. **Team Settings → API Keys** に移動します
4. **Ingestion API Key** をコピーします

<Image img={api_key} alt="ClickStack API Key"/>

API key を環境変数として設定します:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### トレースを ClickStack に送信する \{#send-traces\}

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

`{"partialSuccess":{}}` のようなレスポンスが返ってくれば、トレースが正常に送信されたことを示しています。

#### HyperDX でトレースを確認する \{#verify-demo-traces\}

1. [HyperDX](http://localhost:8080/) を開き、アカウントにログインします (必要に応じて先にアカウントを作成します)
2. **Search** ビューに移動し、**source** を **Traces** に設定します
3. 時間範囲を **2025-10-25 13:00:00 - 2025-10-28 13:00:00** に設定します

<Image img={search_view} alt="Traces 検索ビュー"/>

<Image img={trace_view} alt="個別トレースビュー"/>

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** の期間をカバーしています。広めの時間範囲を指定しているのは、どの地域からアクセスしてもデモトレースが表示されるようにするためです。トレースが確認できたら、可視化をよりわかりやすくするために時間範囲を 24 時間に絞り込むことができます。
:::

</VerticalStepper>

## ダッシュボードと可視化 \{#dashboards\}

Node.js アプリケーションのパフォーマンス監視をすぐに開始できるように、主要なトレースの可視化を含む事前構成済みのダッシュボードを提供しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nodejs-traces-dashboard.json')} download="nodejs-traces-dashboard.json" eventName="docs.nodejs_traces_monitoring.dashboard_download">ダッシュボード設定をダウンロード</TrackedLink> \{#download-dashboard\}

#### 事前構成済みダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、**Dashboards** セクションに移動します
2. 右上（省略記号メニュー内）の **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポート"/>

3. `nodejs-traces-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポートの完了"/>

#### すべての可視化があらかじめ構成された状態でダッシュボードが作成されます \{#created-dashboard\}

<Image img={example_dashboard} alt="ダッシュボードの例"/>

:::note
デモデータセットの場合は、時間範囲を **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

</VerticalStepper>

## トラブルシューティング \{#troubleshooting\}

### curl 経由のデモトレースが表示されない \{#demo-traces-not-appearing\}

curl を使ってトレースを送信したのに HyperDX に表示されない場合は、トレースをもう一度送信してみてください。

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

これは、curl を使ったデモ手順の場合にだけ発生する既知の問題であり、本番環境で計測されたアプリケーションには影響しません。

### HyperDX にトレースが表示されない場合 \{#no-traces\}

**環境変数が設定されていることを確認してください:**

```bash
echo $CLICKSTACK_API_KEY
# Should output your API key

echo $OTEL_EXPORTER_OTLP_ENDPOINT
# Should output http://localhost:4318 or your ClickStack host
```

**ネットワーク接続を確認する：**

```bash
curl -v http://localhost:4318/v1/traces
```

OTLP エンドポイントへの接続が正常に行われているはずです。

**アプリケーションログを確認する:**
アプリケーションの起動時に OpenTelemetry の初期化メッセージを探します。HyperDX SDK が初期化されたことを示す確認メッセージを出力しているはずです。

## 次のステップ \{#next-steps\}

さらに活用したい場合は、ダッシュボードで次のようなステップを試してみてください。

- 重要なメトリクス（エラー率、レイテンシしきい値）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 特定のユースケース向けに追加のダッシュボードを作成する（API監視、セキュリティイベントなど）

## 本番環境への移行 \{#going-to-production\}

このガイドでは、トレースを ClickStack の OTLP エンドポイントに直接送信する HyperDX SDK を使用します。これは、開発、テスト、および小規模〜中規模の本番デプロイメントに適しています。
より大規模な本番環境、またはテレメトリーデータに対してさらに細かな制御が必要な場合は、エージェントとして独自の OpenTelemetry Collector をデプロイすることを検討してください。 
本番環境向けのデプロイメントパターンや Collector の設定例については、[OpenTelemetry による取り込み](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。