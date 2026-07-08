---
sidebar_label: 'Apify'
keywords: ['apify', 'ウェブスクレイピング', 'データ取り込み', 'Actor', 'Dataset', '自動化', 'Webhook']
slug: /integrations/apify
description: 'Apify のウェブスクレイピングおよび自動化データを ClickHouse に読み込む'
title: 'Apify を ClickHouse に接続'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
  - website: 'https://apify.com/'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

<CommunityMaintainedBadge />

[Apify](https://apify.com/) は、ウェブスクレイピングと自動化のためのプラットフォームです。[**Actors**](https://docs.apify.com/platform/actors) と呼ばれるサーバーレスのクラウドプログラムを構築、実行、スケールできます。Actors は、ウェブサイトをスクレイピングし、ウェブをクロールし、データを処理し、ワークフローを自動化します。Actor を実行するたびに、構造化された出力が [**Datasets**](https://docs.apify.com/platform/storage/dataset) (JSON オブジェクトのコレクション) に保存されます。

スクレイピングまたは処理済みのデータを ClickHouse に読み込み、分析、監視、またはデータ拡充パイプラインに活用します。

## 主要な概念 \{#key-concepts\}

| Apify の概念                                                            | 内容                                                                                                                           |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **[Actor](https://docs.apify.com/platform/actors)**                  | Apify プラットフォーム上で実行されるサーバーレスのクラウドプログラムです。[Apify Store](https://apify.com/store) では、すぐに使える Actor が数多く提供されています。                 |
| **[Dataset](https://docs.apify.com/platform/storage/dataset)**       | Actor の実行結果です。JSON オブジェクトを表形式で格納したコレクションで、[Apify API](https://docs.apify.com/api/v2) を介して JSON、CSV、XML などのフォーマットで取得できます。     |
| **[Webhook](https://docs.apify.com/platform/integrations/webhooks)** | Actor の実行が成功・失敗したときや、その他のライフサイクルイベントに達したときにトリガーされる、イベント駆動型の HTTP 呼び出しです。Webhook を使用すると、Apify から ClickHouse へのパイプラインを自動化できます。 |

## セットアップガイド \{#setup-guide\}

<VerticalStepper headerLevel="h3">
  ### ClickHouse の接続情報を確認する \{#1-gather-your-connection-details\}

  <ConnectionDetails />

  ### Apify の前提条件 \{#2-apify-prerequisites\}

  以下も必要です。

  * [Apify アカウント](https://console.apify.com/sign-up) (無料ティアあり) 。
  * [Apify API トークン](https://docs.apify.com/platform/integrations/api#api-token)。[Apify Console](https://console.apify.com/) の **Settings &gt; Integrations** で確認できます。
  * ローカルにインストールされた Node.js 18 以降 (JavaScript の例に必要) 。

  ### 依存関係をインストールする \{#3-install-dependencies\}

  Apify JavaScript クライアントと ClickHouse JavaScript クライアントをインストールします。

  ```bash
  npm install apify-client @clickhouse/client
  ```

  :::note
  Apify は [Python クライアント](https://docs.apify.com/api/client/python) も提供しています。Python を使用する場合は、`apify-client` を pip でインストールし、ClickHouse には [clickhouse-connect](/integrations/python) を使用してください。
  :::

  ### ClickHouse にターゲットテーブルを作成する \{#4-create-a-target-table\}

  スクレイピングしたデータを格納するテーブルを作成します。schema は使用する Actor によって異なります。この例では、商品スクレイピング用 Actor 向けに [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) を使用しています。

  ```sql
  CREATE TABLE apify_products
  (
      url        String,
      title      String,
      price      Float64,
      currency   String,
      scraped_at DateTime DEFAULT now()
  )
  ENGINE = MergeTree()
  ORDER BY (scraped_at, url);
  ```

  ### Apify データセットを取得して ClickHouse に読み込む \{#5-fetch-and-load\}

  次のスクリプトは、Apify Actor の実行結果を取得し、ClickHouse に挿入します。

  ```javascript
  import { ApifyClient } from 'apify-client';
  import { createClient } from '@clickhouse/client';

  // クライアントを初期化
  const apify = new ApifyClient({ token: 'YOUR_APIFY_API_TOKEN' });
  const clickhouse = createClient({
      url: 'https://YOUR_CLICKHOUSE_HOST:8443',
      username: 'default',
      password: 'YOUR_CLICKHOUSE_PASSWORD',
      database: 'default',
  });

  // Actor の直近の実行からデータセット項目を取得
  const run = await apify.actor('YOUR_ACTOR_ID').call();
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();

  console.log(`Fetched ${items.length} items from Apify dataset.`);

  // ClickHouse に挿入
  await clickhouse.insert({
      table: 'apify_products',
      values: items,
      format: 'JSONEachRow',
  });

  console.log(`Inserted ${items.length} rows into ClickHouse.`);
  await clickhouse.close();
  ```

  :::tip
  大型データセットの場合は、[List dataset items](https://docs.apify.com/api/v2#/reference/datasets/item-collection/list-items) エンドポイントの `limit` パラメータと `offset` パラメータを使って結果をページ分割してください。`clean=true` を指定すると、空でない重複排除済みの項目のみを取得できます。
  :::

  ### Webhook で自動化する \{#6-automate-with-webhooks\}

  スクリプトを手動で実行する代わりに、Actor が完了するたびにデータが ClickHouse に読み込まれるよう、パイプラインを自動化します。

  1. [Apify Console](https://console.apify.com/) で対象の Actor を開き、**Integrations** タブを選択します。
  2. 次の内容で新しい webhook を追加します。
     * **Event type:** `ACTOR.RUN.SUCCEEDED`
     * **Action:** ローダー エンドポイントへの HTTP POST、または ClickHouse への挿入を処理する別の Actor のトリガー。
  3. webhook のペイロードには `defaultDatasetId` が含まれており、これを使って実行結果を取得できます。

  ペイロードの詳細と設定オプションについては、[Apify webhook documentation](https://docs.apify.com/platform/integrations/webhooks) を参照してください。

  別の方法として、[Apify Schedules](https://docs.apify.com/platform/schedules) を使用して cron のようなスケジュールで Actor を実行し、読み込みステップに webhook を組み合わせることもできます。
</VerticalStepper>

## ベストプラクティス \{#best-practices\}

### Apify からデータを取得する \{#fetching-data-from-apify\}

生の HTTP リクエストではなく、Apify のクライアントライブラリ ([JavaScript](https://docs.apify.com/api/client/js) 用の `apify-client` または [Python](https://docs.apify.com/api/client/python) 用) を使用してください。これにより、ページネーション、再試行、認証を自動で処理できます。大型データセットでは、[List dataset items](https://docs.apify.com/api/v2#/reference/datasets/item-collection/list-items) エンドポイントの `limit` と `offset` パラメータを使用して、結果をページネーションしながら取得してください。

### ClickHouse への読み込み \{#loading-into-clickhouse\}

ClickHouse に挿入する際は、[`JSONEachRow`](/interfaces/formats/JSONEachRow) フォーマットを使用してください。変換は不要で、Apify の JSON 出力にそのまま対応します。

ClickHouse テーブルの schema は、Actor の出力フィールドに合わせてください。Actor の出力 schema は、[Apify Store](https://apify.com/store) ページ、または実行後の **Dataset** タブで確認できます。

### パフォーマンス \{#performance\}

JavaScriptクライアントから高い処理量で INSERT を行う場合は、[パフォーマンス最適化のヒント](/integrations/javascript#tips-for-performance-optimizations)に従ってください。1 行ずつ INSERT するのではなく、複数の行をまとめて、より大きな単位で INSERT してください。クライアント側でのバッチ化が現実的でない場合は、[非同期 INSERT](/optimize/asynchronous-inserts)も検討してください。

### セキュリティ \{#security\}

このページの例では、簡潔にするために `default` ユーザーとデータベースを使用しています。本番環境では、対象テーブルに挿入するために必要な最小限の特権だけを持つ専用ユーザーを作成し、認証情報は安全に保管してください (たとえば、ソースコードにコミットするのではなく、環境変数やシークレットマネージャーに保存します) 。詳細については、[クラウドアクセス管理](/cloud/security/cloud_access_management)を参照してください。

## 関連リソース \{#related-resources\}

* [Apify Platform ドキュメント](https://docs.apify.com)
* [Apify API リファレンス](https://docs.apify.com/api/v2)
* [Apify JavaScript クライアント](https://docs.apify.com/api/client/js)
* [Apify Python クライアント](https://docs.apify.com/api/client/python)
* [Apify Store (すぐに使える Actors) ](https://apify.com/store)
* [Apify Integrations の概要](https://docs.apify.com/platform/integrations)
* [ClickHouse JavaScript クライアント](/integrations/language-clients/js.md)