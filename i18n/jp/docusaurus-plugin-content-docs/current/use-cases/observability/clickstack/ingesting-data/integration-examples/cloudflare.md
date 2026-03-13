---
slug: /use-cases/observability/clickstack/integrations/cloudflare-logs
title: 'ClickStack で Cloudflare Logs を監視する'
sidebar_label: 'Cloudflare Logs'
pagination_prev: null
pagination_next: null
description: 'S3 から継続的にログをインジェストするため、ClickPipes を使用して Cloudflare Logpush データを ClickStack に取り込む'
doc_type: 'guide'
keywords: ['Cloudflare', 'logs', 'ClickStack', 'ClickPipes', 'S3', 'HTTP', 'Logpush']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clickpipe_s3 from '@site/static/images/clickstack/cloudflare/clickpipe-s3.png';
import continuous_ingestion from '@site/static/images/clickstack/cloudflare/continuous-ingestion.png';
import parse_information from '@site/static/images/clickstack/cloudflare/parse-information.png';
import add_source from '@site/static/images/clickstack/cloudflare/add-source.png';
import configure_optional from '@site/static/images/clickstack/cloudflare/configure-optional-fields.png';
import save_source from '@site/static/images/clickstack/cloudflare/save-source.png';
import search_view from '@site/static/images/clickstack/cloudflare/search-view.png';
import log_view from '@site/static/images/clickstack/cloudflare/log-view.png';
import import_dashboard from '@site/static/images/clickstack/cloudflare/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudflare/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudflare/example-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# ClickStackでCloudflareログを監視する \{#cloudflare-clickstack\}

:::note[要点]
このガイドでは、ClickPipesを使用してCloudflareログをClickStackに取り込む方法を説明します。Cloudflare LogpushはログをS3に書き込み、ClickPipesは新しいファイルを継続的にClickHouseに取り込みます。OpenTelemetry Collectorを使用する多くのClickStack統合ガイドとは異なり、このガイドでは、[ClickPipes](/integrations/clickpipes)を使用してS3からデータを直接取得します。

本番環境向けのインジェストを設定する前にダッシュボードを確認したい場合は、デモデータセットを利用できます。
:::

## 概要 \{#overview\}

Cloudflare [Logpush](https://developers.cloudflare.com/logs/about/) は、HTTP リクエストログを Amazon S3 などの宛先にエクスポートします。これらのログを ClickStack に転送すると、次のことが可能になります。

* 他のオブザーバビリティデータとあわせて、エッジトラフィック、キャッシュのパフォーマンス、セキュリティイベントを分析する
* ClickHouse SQL を使用してログをクエリする
* Cloudflare のデフォルトの保持期間を超えてログを保持する

このガイドでは、[ClickPipes](/integrations/clickpipes) を使用して、Cloudflare のログファイルを S3 から ClickHouse に継続的に取り込みます。S3 は Cloudflare と ClickHouse の間で永続的なバッファとして機能し、exactly-once セマンティクスとリプレイ機能を提供します。

:::note[代替: HTTP へ直接インジェスト]
Cloudflare Logpush は、ログを [HTTP エンドポイント](https://developers.cloudflare.com/logs/get-started/enable-destinations/http/) に直接プッシュすることもサポートしています。Cloudflare はログを改行区切り JSON (NDJSON) としてエクスポートし、ClickHouse は `JSONEachRow` を介してこの形式をネイティブにサポートしているため、次のエンドポイント URL 形式を使用して、Logpush の送信先を ClickHouse Cloud の HTTP インターフェースに直接設定できます。

```text
https://YOUR_CLICKHOUSE_HOST:8443/?query=INSERT+INTO+cloudflare_http_logs+FORMAT+JSONEachRow&header_Authorization=Basic+BASE64_CREDENTIALS
```

`YOUR_CLICKHOUSE_HOST` は ClickHouse Cloud のホスト名に、`BASE64_CREDENTIALS` は Base64 エンコードされた認証情報 (`echo -n 'default:YOUR_PASSWORD' | base64`) に置き換えてください。

こちらの方が設定は簡単です (S3、SQS、IAM の設定は不要) が、配信に失敗しても Cloudflare Logpush は[過去のデータをバックフィルできません](https://developers.cloudflare.com/logs/logpush/)。そのため、プッシュ中に ClickHouse を利用できない場合、それらのログは完全に失われます。
:::

## 既存の Cloudflare Logpush との統合 \{#existing-cloudflare\}

このセクションでは、Cloudflare Logpush が S3 にログをエクスポートするよう設定済みであることを前提としています。まだ設定していない場合は、先に [Cloudflare の AWS S3 セットアップガイド](https://developers.cloudflare.com/logs/get-started/enable-destinations/aws-s3/) を参照してください。

### 前提条件 \{#prerequisites\}

* **ClickHouse Cloud service** が稼働中であること (ClickPipes は Cloud 専用機能のため、ClickStack OSS では利用できません)
* Cloudflare Logpush が S3 バケットにログを継続的に書き込んでいること
* Cloudflare がログを書き込む S3 バケットの名前とリージョン

<VerticalStepper headerLevel="h4">
  #### S3認証の設定 \{#configure-auth\}

  ClickPipes がS3バケットから読み取るには権限が必要です。IAMロールベースのアクセスまたは認証情報ベースのアクセスを設定するには、[S3データへの安全なアクセス](/docs/cloud/data-sources/secure-s3)ガイドに従ってください。

  ClickPipes S3の認証と権限の詳細については、[S3 ClickPipesリファレンスドキュメント](/docs/integrations/clickpipes/object-storage/s3/overview#access-control)を参照してください。

  #### ClickPipesジョブの作成 \{#create-clickpipes\}

  1. ClickHouse Cloud Console → **Data Sources** → **Create ClickPipe**
  2. **ソース**: Amazon S3

  <Image img={clickpipe_s3} alt="ClickPipe S3" />

  **接続:**

  * **S3 ファイルパス**: ファイルに一致するワイルドカードを含む Cloudflare ログバケットのパスです。Logpush で日次サブフォルダを有効にしている場合は、サブディレクトリをまたいで一致させるために `**` を使用します:
    * サブフォルダなし: `https://your-bucket.s3.us-east-1.amazonaws.com/logs/*`
    * 日付ごとのサブフォルダ: `https://your-bucket.s3.us-east-1.amazonaws.com/logs/**/*`
  * **認証**: 認証方法を選択し、認証情報または IAMロールのARN を指定します

  **インジェスト設定:**

  **Incoming data** をクリックし、以下を設定します：

  * **Continuous ingestion** を有効にします
  * **並び順**: 辞書順

  <Image img={continuous_ingestion} alt="継続的インジェスト" />

  Cloudflare Logpushは日付ベースの命名規則 (例：`20250127/...`) でファイルを書き込みます。これは自然に辞書順 (レキシコグラフィカル順) になります。ClickPipesは30秒ごとに新しいファイルをポーリングし、最後に処理されたファイルよりもファイル名が後になるファイルを取り込みます。

  **スキーママッピング:**

  **Parse information** をクリックします。ClickPipes がログファイルをサンプリングし、スキーマを自動検出します。マッピングされたカラムを確認し、必要に応じて型を調整してください。宛先テーブルの **ソートキー** を定義します。Cloudflare ログの場合、`(EdgeStartTimestamp, ClientCountry, EdgeResponseStatus)` が適切な選択肢です。

  <Image img={parse_information} alt="解析に関する情報" />

  **Complete Setup** をクリックします。

  :::note
  初回作成時、ClickPipes は継続的なポーリングに切り替わる前に、指定されたパス内の**既存のすべてのファイル**を初期ロードします。バケットに大量の Cloudflare ログが蓄積されている場合、この初期ロードには時間がかかる場合があります。
  :::

  #### HyperDX データソースの設定 \{#configure-source\}

  ClickPipes は Cloudflare のログを、Cloudflare ネイティブのフィールド名を持つフラットなテーブルに取り込みます。HyperDX でこれらのログを表示するには、Cloudflare のカラムを HyperDX のログビューにマッピングするカスタムデータソースを設定してください。

  1. HyperDX を開く → **Team Settings** → **Sources**

  <Image img={add_source} alt="ソースを追加" />

  2. **Add source** をクリックし、以下の設定を行います。すべてのフィールドを表示するには、**Configure Optional Fields** をクリックします：

  <Image img={configure_optional} alt="必要に応じて設定" />

  | 設定                | 値                                                                                                                                                                                                                                                                                                                 |
  | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | **名称**            | `Cloudflare Logs`                                                                                                                                                                                                                                                                                                 |
  | **ソースデータタイプ**     | ログ                                                                                                                                                                                                                                                                                                                |
  | **データベース**        | `default`                                                                                                                                                                                                                                                                                                         |
  | **テーブル**          | `cloudflare_http_logs`                                                                                                                                                                                                                                                                                            |
  | **タイムスタンプカラム**    | `toDateTime(EdgeStartTimestamp / 1000000000)`                                                                                                                                                                                                                                                                     |
  | **デフォルトの SELECT** | `EdgeStartTimestamp, ClientRequestMethod, ClientRequestURI, EdgeResponseStatus, ClientCountry`                                                                                                                                                                                                                    |
  | **サービス名の設定式**     | `'cloudflare'`                                                                                                                                                                                                                                                                                                    |
  | **ログレベルの式**       | `multiIf(EdgeResponseStatus >= 500, 'ERROR', EdgeResponseStatus >= 400, 'WARN', 'INFO')`                                                                                                                                                                                                                          |
  | **メッセージ本文の式**     | `concat(ClientRequestMethod, ' ', ClientRequestURI, ' ', toString(EdgeResponseStatus))`                                                                                                                                                                                                                           |
  | **ログ属性の式**        | `map('http.method', ClientRequestMethod, 'http.status_code', toString(EdgeResponseStatus), 'http.url', ClientRequestURI, 'client.country', ClientCountry, 'client.ip', ClientIP, 'cache.status', CacheCacheStatus, 'bot.score', toString(BotScore), 'cloudflare.ray_id', RayID, 'cloudflare.colo', EdgeColoCode)` |
  | **リソース属性式**       | `map('cloudflare.zone', ClientRequestHost)`                                                                                                                                                                                                                                                                       |
  | **暗黙のカラム式**       | `concat(ClientRequestMethod, ' ', ClientRequestURI)`                                                                                                                                                                                                                                                              |

  3. **Save Source**をクリックします

  <Image img={save_source} alt="ソースを保存" />

  これにより、Cloudflareのネイティブカラムがデータの変換や重複なしにHyperDXのログビューアーへ直接マッピングされます。**Body**には`GET /api/v1/users 200`のようなリクエストの概要が表示され、すべてのCloudflareフィールドは検索可能な属性として利用できます。

  #### HyperDX でデータを確認する \{#verify-hyperdx\}

  **Search** ビューに移動し、**Cloudflare Logs** ソースを選択してください。データが含まれる時間範囲を設定します。以下のようなログエントリが表示されます：

  * Bodyカラム内のリクエストの要約 (例: `GET /api/v1/users 200`)
  * HTTPステータスに応じて色分けされた重大度 (2xx は INFO、4xx は WARN、5xx は ERROR)
  * `http.status_code`、`client.country`、`cache.status`、`bot.score` などの検索に利用できる属性

  <Image img={search_view} alt="検索ビュー" />

  <Image img={log_view} alt="ログビュー" />
</VerticalStepper>

## デモデータセット \{#demo-dataset\}

本番の Cloudflare Logpush を設定する前に連携をテストしたいユーザー向けに、実際の HTTP リクエストログに近いサンプルデータセットを用意しています。

<VerticalStepper headerLevel="h4">
  #### デモデータセットで ClickPipes を開始する \{#start-demo\}

  1. ClickHouse Cloud Console → **Data Sources** → **Create ClickPipe**
  2. **Source**: Amazon S3
  3. **Authentication**: Public
  4. **S3 file path**: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/cloudflare/cloudflare-http-logs.json`
  5. **Incoming data** をクリックします
  6. 形式として **JSON** を選択します
  7. **Parse information** をクリックし、検出されたスキーマを確認します
  8. **Table name** を `cloudflare_http_logs` に設定します
  9. **Complete Setup** をクリックします

  このデータセットには、24 時間分の 5,000 件の HTTP リクエストログが含まれており、複数の国からのトラフィック、キャッシュヒットとミス、API リクエストや静的アセットへのリクエスト、エラーレスポンス、セキュリティイベントなど、現実的なパターンが含まれています。

  #### HyperDX データソースを設定する \{#configure-demo-source\}

  [データソースの設定手順](#configure-source)に従って、`cloudflare_http_logs` テーブルを参照する HyperDX ソースを作成します。本番環境の連携セクションですでにソースを設定済みの場合、この手順は不要です。

  #### デモデータを確認する \{#verify-demo\}

  ```sql
  SELECT count() FROM cloudflare_http_logs;
  -- 5000 が返るはずです
  ```

  HyperDX の **Search** ビューに移動し、**Cloudflare Logs** ソースを選択して、時間範囲を **2026-02-23 00:00:00 - 2026-02-26 00:00:00** に設定します。

  リクエストの概要、検索可能な Cloudflare 属性、HTTP ステータスコードに基づく重大度レベルを含むログエントリが表示されるはずです。

  <Image img={search_view} alt="検索ビュー" />

  <Image img={log_view} alt="ログビュー" />

  :::note[タイムゾーン表示]
  HyperDX はタイムスタンプをブラウザーのローカルタイムゾーンで表示します。デモデータの対象期間は **2026-02-24 00:00:00 - 2026-02-25 00:00:00 (UTC)** です。時間範囲を広めに設定しているため、どの地域からでもデモログを確認できます。ログが表示されたら、より見やすく可視化するために、範囲を 24 時間に絞り込めます。
  :::
</VerticalStepper>

## ダッシュボードと可視化 \{#dashboards\}

<VerticalStepper headerLevel="h4">
  #### <TrackedLink href={useBaseUrl('/examples/cloudflare-logs-dashboard.json')} download="cloudflare-logs-dashboard.json" eventName="docs.cloudflare_logs_monitoring.dashboard_download">ダッシュボード設定をダウンロード</TrackedLink> \{#download\}

  #### ダッシュボードをインポート \{#import-dashboard\}

  1. HyperDX → **Dashboards** → **Import Dashboard**

  <Image img={import_dashboard} alt="ダッシュボードのインポート" />

  2. `cloudflare-logs-dashboard.json` をアップロード → **Finish Import**

  <Image img={finish_import} alt="ダッシュボードのインポート" />

  #### ダッシュボードを表示 \{#view-dashboard\}

  <Image img={example_dashboard} alt="ダッシュボードの例" />

  :::note
  デモ用データセットでは、時間範囲を **2026-02-24 00:00:00 - 2026-02-25 00:00:00 (UTC)** に設定してください (ローカルタイムゾーンに応じて調整してください) 。インポートしたダッシュボードには、デフォルトでは時間範囲が設定されていません。
  :::
</VerticalStepper>

## トラブルシューティング \{#troubleshooting\}

### ClickHouseにデータが表示されない \{#no-data\}

テーブルが作成され、データが含まれていることを確認します。

```sql
SHOW TABLES FROM default LIKE 'cloudflare_http_logs';
SELECT count() FROM cloudflare_http_logs;
```

テーブルは存在するものの空の場合は、ClickPipes にエラーがないか確認してください: ClickHouse Cloud Console → **Data Sources** → ご利用の ClickPipe → **Logs**。プライベートバケットの認証に関する問題については、[S3 ClickPipes access control documentation](/docs/integrations/clickpipes/object-storage/s3/overview#access-control)を参照してください。

### HyperDX にログが表示されない \{#no-hyperdx\}

データが ClickHouse にあるのに HyperDX で表示されない場合は、データソースの設定を確認してください。

* HyperDX → **Team Settings** → **Sources** に `cloudflare_http_logs` のソースが存在することを確認します
* **Timestamp Column** が `toDateTime(EdgeStartTimestamp / 1000000000)` に設定されていることを確認します — Cloudflare のタイムスタンプはナノ秒単位のため、変換が必要です
* HyperDX の時間範囲に対象のデータが含まれていることを確認します。デモ用データセットでは、**2026-02-23 00:00:00 - 2026-02-26 00:00:00** を使用します

## 次のステップ \{#next-steps\}

Cloudflare のログが ClickStack に取り込まれるようになったら、次の作業を行います。

* セキュリティイベント (WAF によるブロック、ボットトラフィックの急増、エラー率のしきい値) に対する[アラート](/use-cases/observability/clickstack/alerts)を設定します
* データ量に応じて[データ保持ポリシー](/use-cases/observability/clickstack/ttl)を最適化します
* 特定のユースケース (API パフォーマンス、キャッシュ最適化、地域別トラフィック分析) 向けに追加のダッシュボードを作成します

## 本番環境での運用 \{#going-to-production\}

このガイドでは、公開デモデータセットを使用して Cloudflare ログを取り込む方法を説明します。本番環境にデプロイする場合は、Cloudflare Logpush が独自の S3 バケットに書き込むよう設定し、安全にアクセスできるよう [IAM ロールベース認証](/docs/cloud/data-sources/secure-s3) を使用して ClickPipes を構成してください。ストレージコストとインジェスト量を抑えるため、必要な [Logpush フィールド](https://developers.cloudflare.com/logs/logpush/logpush-job/datasets/zone/http_requests/) のみを選択してください。ファイルを整理しやすくするため、Logpush で日次サブフォルダーを有効にし、ClickPipes のパスパターンでは `**/*` を使用してサブディレクトリーをまたいで一致させてください。

バックフィルや順不同のファイルを処理するための [SQS ベースの順不同インジェスト](/docs/integrations/clickpipes/object-storage/s3/overview#continuous-ingestion-any-order) を含む高度な設定オプションについては、[S3 ClickPipes ドキュメント](/docs/integrations/clickpipes/object-storage/s3/overview) を参照してください。