---
'sidebar_label': 'Embeddable'
'slug': '/integrations/embeddable'
'keywords':
- 'clickhouse'
- 'Embeddable'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Embeddableは、アプリに直接組み込むための高速でインタラクティブな完全カスタマイズ可能な分析体験を構築するための開発者ツールキットです。'
'title': 'EmbeddableをClickHouseに接続する'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Connecting Embeddable to ClickHouse

<CommunityMaintainedBadge/>

In [Embeddable](https://embeddable.com/) では、[データモデル](https://docs.embeddable.com/data-modeling/introduction) と [コンポーネント](https://docs.embeddable.com/development/introduction) をコードで定義し（自身のコードリポジトリに保存）、私たちの **SDK** を使用して、強力な Embeddable **ノーコードビルダー** でチームに提供します。

最終的な結果は、製品内で高速でインタラクティブな顧客向け分析を提供できる能力です。これは、あなたの製品チームによって設計され、エンジニアリングチームによって構築され、顧客向けやデータチームによって維持されます。ちょうどあるべき方法です。

組み込みの行レベルセキュリティにより、すべてのユーザーは常に許可されたデータのみを確認できます。また、2つの完全に構成可能なキャッシングレベルにより、大規模なリアルタイム分析を迅速に提供できます。

## 1. 接続詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouse接続タイプを作成する {#2-create-a-clickhouse-connection-type}

Embeddable APIを使用してデータベース接続を追加します。この接続は、あなたの ClickHouse サービスに接続するために使用されます。次の API コールを使用して接続を追加できます：

```javascript
// for security reasons, this must *never* be called from your client-side
fetch('https://api.embeddable.com/api/v1/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}` /* keep your API Key secure */,
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

上記は `CREATE` アクションを表していますが、すべての `CRUD` 操作が利用可能です。

`apiKey` は、あなたの Embeddable ダッシュボードの1つで "**Publish**" をクリックすることで見つけることができます。

`name` は、この接続を識別するためのユニークな名前です。
- デフォルトでは、あなたのデータモデルは "default" という接続を探しますが、異なる接続に異なるデータモデルを接続するために、モデルに異なる `data_source` 名を指定することができます（単にモデル内で data_source 名を指定してください）。

`type` は、Embeddable にどのドライバーを使用するかを指示します。

- ここでは `clickhouse` を使用しますが、1つの Embeddable ワークスペースに複数の異なるデータソースを接続できるため、`postgres`、`bigquery`、`mongodb` などの他のデータソースを使用することもできます。

`credentials` は、ドライバーによって期待される必要な資格情報を含む JavaScript オブジェクトです。
- これらは安全に暗号化され、あなたのデータモデルに記述したデータを正確に取得するためのみに使用されます。Embeddable は、各接続に対して読み取り専用データベースユーザーを作成することを強く推奨します（Embeddable は常にデータベースから読み込み、書き込みは行いません）。

生産、QA、テストなどの異なるデータベースへの接続をサポートするため（または異なる顧客のために異なるデータベースをサポートするため）に、各接続に環境を割り当てることができます（[Environments API](https://docs.embeddable.com/data/environments)を参照してください）。
