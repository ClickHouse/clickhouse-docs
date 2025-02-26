---
sidebar_label: 埋め込み
slug: /integrations/embeddable
keywords: [clickhouse, 埋め込み, 接続, 統合, ui]
description: 埋め込みは、アプリに直接迅速でインタラクティブな完全カスタマイズの分析体験を構築するための開発者ツールキットです。
---

import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# EmbeddableをClickHouseに接続する

[Embeddable](https://embeddable.com/)では、[データモデル](https://trevorio.notion.site/Data-modeling-35637bbbc01046a1bc47715456bfa1d8)と[コンポーネント](https://trevorio.notion.site/Using-components-761f52ac2d0743b488371088a1024e49)をコード内で定義し（自分のコードリポジトリに保存）、私たちの**SDK**を使用して、強力なEmbeddable **ノーコードビルダー**でチームに提供します。

最終的な結果は、製品に直接迅速でインタラクティブな顧客向けの分析を提供できる能力です。それは、製品チームによって設計され、エンジニアリングチームによって構築され、顧客対応チームやデータチームによって維持されています。まさにあるべき姿です。

組み込みの行レベルセキュリティにより、各ユーザーは自分が見ることを許可されたデータのみを常に見ることができます。また、2つのレベルの完全に構成可能なキャッシュにより、スケールで迅速でリアルタイムの分析を提供できます。


## 1. 接続詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouse接続タイプを作成する {#2-create-a-clickhouse-connection-type}

Embeddable APIを使用してデータベース接続を追加します。この接続は、あなたのClickHouseサービスに接続するために使用されます。次のAPI呼び出しを使用して接続を追加できます。

```javascript
// セキュリティ上の理由から、これはクライアント側から呼び出してはいけません
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

`apiKey`は、Embeddableダッシュボードの1つで「**Publish**」をクリックすることで見つけることができます。

`name`は、この接続を識別するためのユニークな名前です。
- デフォルトでは、データモデルは「default」という接続を探しますが、異なる接続に異なるデータモデルを接続するために、モデルに異なる`data_source`名を指定することもできます（単にモデル内でデータソース名を指定します）。

`type`は、Embeddableにどのドライバーを使用するかを伝えます。

- ここでは`clickhouse`を使用することになりますが、1つのEmbeddableワークスペースに異なる複数のデータソースを接続することができるため、`postgres`や`bigquery`、`mongodb`など他のソースを使用することもできます。

`credentials`は、ドライバーが期待する必要な資格情報を含むJavaScriptオブジェクトです。
- これらは安全に暗号化され、あなたのデータモデルで記述されたデータを正確に取得するためにのみ使用されます。
Embeddableは、各接続に対して読み取り専用のデータベースユーザーを作成することを強く推奨します（Embeddableはデータベースに対してのみ読み取りを行い、書き込みは行いません）。

プロダクション、QA、テストなどの異なるデータベースに接続する（または異なる顧客に対して異なるデータベースをサポートする）ために、各接続を環境に割り当てることができます（[Environments API](https://www.notion.so/Environments-API-497169036b5148b38f7936aa75e62949?pvs=21）を参照）。
