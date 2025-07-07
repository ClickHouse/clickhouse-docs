---
'sidebar_label': 'Embeddable'
'slug': '/integrations/embeddable'
'keywords':
- 'clickhouse'
- 'Embeddable'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Embeddable is a developer toolkit for building fast, interactive,
  fully-custom analytics experiences directly into your app.'
'title': 'Connecting Embeddable to ClickHouse'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# EmbeddableをClickHouseに接続する

<CommunityMaintainedBadge/>

[Embeddable](https://embeddable.com/)では、コード内で[データモデル](https://docs.embeddable.com/data-modeling/introduction)と[コンポーネント](https://docs.embeddable.com/development/introduction)を定義し（自分自身のコードリポジトリに保存）、私たちの**SDK**を使用して、強力なEmbeddable**ノーコードビルダー**内でチームにそれらを提供します。

最終的な結果は、製品内で迅速かつインタラクティブな顧客向け分析を提供できることです。これは、あなたのプロダクトチームによって設計され、エンジニアリングチームによって構築され、顧客対応チームとデータチームによって維持されます。正にあるべき姿です。

組み込まれた行レベルセキュリティにより、ユーザーは自身が見ることを許可されたデータのみを正確に確認できます。さらに、2つの完全に構成可能なキャッシュレベルによって、スケールにおいて迅速なリアルタイム分析を提供できます。

## 1. 接続詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouse接続タイプを作成する {#2-create-a-clickhouse-connection-type}

Embeddable APIを使用してデータベース接続を追加します。この接続はClickHouseサービスに接続するために使用されます。次のAPI呼び出しを使用して接続を追加できます。

```javascript
// セキュリティ上の理由から、これはクライアントサイドから*決して*呼び出さないでください
fetch('https://api.embeddable.com/api/v1/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}` /* APIキーを安全に保管してください */,
  },
  body: JSON.stringify({
    name: 'my-clickhouse-db',
    type: 'clickhouse',
    credentials: {
      host: 'my.clickhouse.host',
      user: 'clickhouse_user',
      port: 8443,
      password: '*****',
    },
  }),
});


Response:
Status 201 { errorMessage: null }
```

上記は`CREATE`アクションを表しますが、すべての`CRUD`操作が利用可能です。

`apiKey`は、Embeddableダッシュボードの1つで「**公開**」をクリックすることで見つけることができます。

`name`は、この接続を識別するための一意の名前です。
- デフォルトではデータモデルは「default」という接続を探しますが、異なる接続に異なるデータモデルを接続するために、別の`data_source`名をモデルに指定できます（モデル内でdata_source名を指定するだけです）。

`type`は、Embeddableにどのドライバーを使用するかを伝えます。

- ここでは`clickhouse`を使用したいですが、Embeddableのワークスペースに異なるデータソースを複数接続できるので、他にも`postgres`、`bigquery`、`mongodb`などを使用できます。

`credentials`は、ドライバーが必要とする資格情報を含むJavaScriptオブジェクトです。
- これらは安全に暗号化され、データモデルで記述されたデータのみを取得するために使用されます。Embeddableは、各接続に対して読み取り専用のデータベースユーザーを作成することを強く推奨します（Embeddableはデータベースから読み取るだけで、書き込むことはありません）。

本番環境、QA、テストなどの異なるデータベースへの接続をサポートするために（または異なる顧客のために異なるデータベースをサポートするために）、各接続を環境に割り当てることができます（[Environments API](https://docs.embeddable.com/data/environments)を参照してください）。
