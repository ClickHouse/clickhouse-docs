---
sidebar_label: '組み込み可能'
slug: /integrations/embeddable
keywords: ['clickhouse', '組み込み可能', '接続', '統合', 'ui']
description: '組み込み可能は、アプリに直接組み込む迅速でインタラクティブな完全カスタマイズの分析体験を構築するための開発者ツールキットです。'
title: '組み込み可能をClickHouseに接続する'
---
```

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 組み込み可能をClickHouseに接続する

<CommunityMaintainedBadge/>

In [Embeddable](https://embeddable.com/) では、[データモデル](https://docs.embeddable.com/data-modeling/introduction) および [コンポーネント](https://docs.embeddable.com/development/introduction) をコード内で定義（自身のコードリポジトリに保存）し、私たちの **SDK** を使用して、強力な組み込み可能な **ノーコードビルダー** でチームに利用できるようにします。

最終的な結果は、顧客向けの迅速でインタラクティブな分析を製品に直接提供できる能力です。これは、あなたのプロダクトチームによって設計され、エンジニアリングチームによって構築され、顧客向けおよびデータチームによって維持管理されます。まさにあるべき姿です。

組み込みの行レベルセキュリティにより、各ユーザーは許可されたデータのみを表示します。さらに、完全に構成可能な2レベルのキャッシングにより、大規模なリアルタイム分析を迅速に提供できます。


## 1. 接続情報を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouse接続タイプを作成する {#2-create-a-clickhouse-connection-type}

Embeddable API を使用してデータベース接続を追加します。この接続は、あなたの ClickHouse サービスに接続するために使用されます。次の API コールを使用して接続を追加できます。

```javascript
// セキュリティ上の理由から、これは *絶対に* クライアント側から呼び出してはいけません
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

上記は `CREATE` アクションを表していますが、すべての `CRUD` 操作が利用可能です。

`apiKey` は、1つの Embeddable ダッシュボードの "**公開**" をクリックすることで見つけることができます。

`name` はこの接続を識別するための一意の名前です。
- デフォルトでは、データモデルは "default" と呼ばれる接続を探しますが、異なる `data_source` 名をモデルに指定して、異なる接続に異なるデータモデルを接続することも可能です（単にモデル内でデータソース名を指定してください）。

`type` は、Embeddable に使用するドライバを指示します。

- ここでは `clickhouse` を使用することになりますが、1つの Embeddable ワークスペースに複数の異なるデータソースを接続できるため、`postgres`、`bigquery`、`mongodb` などの他のデータソースを使用することも可能です。

`credentials` は、ドライバが期待する必要な資格情報を含む JavaScript オブジェクトです。
- これらは安全に暗号化され、データモデルに記述した正確なデータを取得するためだけに使用されます。Embeddable は、各接続用に読み取り専用のデータベースユーザーを作成することを強く推奨します（Embeddable はデータベースから読み取るだけで、書き込みは行いません）。

プロダクション、テスト、QA など異なるデータベースへの接続をサポートするため（または異なる顧客用に異なるデータベースをサポートするため）には、各接続に環境を割り当てることができます（詳細は [Environments API](https://docs.embeddable.com/data/environments) を参照してください）。
