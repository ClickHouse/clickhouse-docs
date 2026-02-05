---
slug: /use-cases/observability/clickstack/integrations/nodejs-traces
title: 'ClickStack による Node.js アプリケーション・トレースの監視'
sidebar_label: 'Node.js トレース'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した Node.js アプリケーション・トレースの監視'
doc_type: 'guide'
keywords: ['Node.js', 'traces', 'OTel', 'ClickStack', 'distributed tracing']
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


# ClickStack による Node.js トレースの監視 \{#nodejs-traces-clickstack\}

:::note[TL;DR]
このガイドでは、Node.js アプリケーションから分散トレースを収集し、OpenTelemetry の自動インストゥルメンテーションを使用して ClickStack 上で可視化する方法を説明します。以下の内容を学びます:

- 自動インストゥルメンテーション付きで Node.js 用の OpenTelemetry をインストールおよび構成する方法
- ClickStack の OTLP エンドポイントへトレースを送信する方法
- HyperDX 上でトレースが表示されていることを確認する方法
- アプリケーションパフォーマンスを可視化するために、あらかじめ用意されたダッシュボードを利用する方法

本番アプリケーションを計測する前に統合をテストしたい場合のために、サンプルトレースを含むデモ用データセットが用意されています。

所要時間: 10〜15 分
:::

## 既存の Node.js アプリケーションとの統合 \{#existing-nodejs\}

このセクションでは、OpenTelemetry 自動インストルメンテーションを使用して、既存の Node.js アプリケーションに分散トレーシングを追加する方法について説明します。

ご自身の既存環境を構成する前に統合を試してみたい場合は、[デモデータセットのセクション](#demo-dataset)にある、あらかじめ設定済みの環境とサンプルデータを使ってテストできます。

##### 前提条件 \{#prerequisites\}

- OTLP エンドポイントにアクセス可能な ClickStack インスタンス（ポート 4317/4318）
- 既存の Node.js アプリケーション（Node.js 14 以上）
- npm または yarn パッケージマネージャー
- ClickStack のホスト名または IP アドレス

<VerticalStepper headerLevel="h4">

#### OpenTelemetry のインストールと設定 \{#install-configure\}

アプリケーションの先頭で `@hyperdx/node-opentelemetry` パッケージをインストールし、初期化します。詳細なインストール手順については、[Node.js SDK ガイド](/use-cases/observability/clickstack/sdks/nodejs#getting-started) を参照してください。

#### ClickStack API key の取得 \{#get-api-key\}

ClickStack の OTLP エンドポイントにトレースを送信するための API key を取得します。

1. ClickStack の URL（例: http://localhost:8080）で HyperDX を開く
2. 必要に応じてアカウントを作成するかログインする
3. **Team Settings → API Keys** に移動する
4. **インジェスト API key** をコピーする

<Image img={api_key} alt="ClickStack API Key"/>

#### アプリケーションを実行する \{#run-application\}

以下の環境変数を設定して Node.js アプリケーションを起動します:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

#### トラフィックを生成する \{#generate-traffic\}

アプリケーションにリクエストを送信してトレースを生成します:

```bash
# シンプルなリクエスト
curl http://localhost:3000/
curl http://localhost:3000/api/users
curl http://localhost:3000/api/products

# 負荷をシミュレート
for i in {1..100}; do curl -s http://localhost:3000/ > /dev/null; done
```

#### HyperDX でトレースを確認する \{#verify-traces\}

設定が完了したら、HyperDX にログインしてトレースがインジェストされていることを確認します。次のような画面が表示されるはずです。トレースが表示されない場合は、時間範囲を調整してみてください。

<Image img={search_view} alt="トレース検索ビュー"/>

任意のトレースをクリックすると、スパン、タイミング、属性を含む詳細ビューを確認できます:

<Image img={trace_view} alt="個別トレースビュー"/>

</VerticalStepper>

## デモデータセット \{#demo-dataset\}

本番アプリケーションを計装する前に ClickStack で Node.js のトレースを試したいユーザー向けに、現実的なトラフィックパターンを持つ、事前生成済みの Node.js アプリケーショントレースのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットのダウンロード \{#download-sample\}

サンプルトレースファイルをダウンロードします:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nodejs/nodejs-traces-sample.json
```

#### ClickStack を起動する \{#start-clickstack\}

まだ ClickStack を実行していない場合は、次のコマンドで起動します:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD= \
  clickhouse/clickstack-all-in-one:latest
```

#### ClickStack の API key を取得する \{#get-api-key-demo\}

ClickStack の OTLP エンドポイントへトレースを送信するための API key を取得します。

1. ClickStack の URL（例: http://localhost:8080）で HyperDX を開きます
2. 必要に応じてアカウントを作成するかログインします
3. **Team Settings → API Keys** に移動します
4. **インジェスト API key（Ingestion API Key）** をコピーします

<Image img={api_key} alt="ClickStack API Key"/>

取得した API key を環境変数として設定します:

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

`{"partialSuccess":{}}` のようなレスポンスが表示されれば、トレースが正常に送信できたことを示しています。

#### HyperDX でトレースを確認する \{#verify-demo-traces\}

1. [HyperDX](http://localhost:8080/) を開き、アカウントにログインします（まだの場合はアカウントを作成します）
2. **Search** ビューに移動し、ソースを **Traces** に設定します
3. 時間範囲を **2025-10-25 13:00:00 - 2025-10-28 13:00:00** に設定します

<Image img={search_view} alt="Traces 検索ビュー"/>

<Image img={trace_view} alt="個別トレースビュー"/>

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** の期間をカバーしています。広めの時間範囲を指定することで、どのロケーションからでもデモトレースを確実に確認できます。トレースが確認できたら、可視化を見やすくするために時間範囲を 24 時間に絞り込むことができます。
:::

</VerticalStepper>

## ダッシュボードと可視化 \{#dashboards\}

Node.js アプリケーションのパフォーマンス監視をすぐに始められるように、主要なトレースの可視化を備えたあらかじめ用意されたダッシュボードを提供しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nodejs-traces-dashboard.json')} download="nodejs-traces-dashboard.json" eventName="docs.node_traces_monitoring.dashboard_download">ダッシュボード構成をダウンロード</TrackedLink> \{#download-dashboard\}

#### あらかじめ用意されたダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、**Dashboards** セクションに移動します
2. 右上（省略記号メニューの下）にある **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードをインポート"/>

3. `nodejs-traces-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポートの完了"/>

#### すべての可視化が事前に設定された状態でダッシュボードが作成されます \{#created-dashboard\}

<Image img={example_dashboard} alt="ダッシュボードの例"/>

:::note
デモ用データセットの場合、時間範囲を **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

</VerticalStepper>

## トラブルシューティング \{#troubleshooting\}

### curl 経由のデモトレースが表示されない \{#demo-traces-not-appearing\}

curl でトレースを送信したにもかかわらず HyperDX に表示されない場合は、トレースをもう一度送信してみてください。

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

これは、curl を使ったデモ用アプローチでのみ発生する既知の問題であり、計装済みの本番アプリケーションには影響しません。


### HyperDX にトレースが表示されない場合 \{#no-traces\}

**環境変数が設定されているか確認してください：**

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

OTLP エンドポイントに正常に接続できるはずです。

**アプリケーションログを確認する:**
アプリケーション起動時に、OpenTelemetry の初期化メッセージが出力されていることを確認します。HyperDX SDK は、初期化が完了したことを示す確認メッセージを出力するはずです。


## 次のステップ \{#next-steps\}

さらに活用したい場合は、ダッシュボードで次のようなことを試してみてください。

- 重要なメトリクス（エラー率、レイテンシーのしきい値）向けに[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 特定のユースケース（API モニタリング、セキュリティイベント）向けの追加ダッシュボードを作成する

## 本番運用への移行 \{#going-to-production\}

このガイドでは、HyperDX SDK を使用してトレースを ClickStack の OTLP エンドポイントへ直接送信します。これは、開発・テスト環境や小〜中規模の本番環境でのデプロイに適しています。
より大規模な本番環境、またはテレメトリーデータをより細かく制御する必要がある場合は、エージェントとして独自の OpenTelemetry Collector をデプロイすることを検討してください。
本番環境向けのデプロイパターンと Collector の設定例については、[OpenTelemetry を用いた取り込み](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。