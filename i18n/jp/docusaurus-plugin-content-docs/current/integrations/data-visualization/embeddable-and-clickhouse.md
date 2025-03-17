---
sidebar_label: 埋め込み可能
slug: /integrations/embeddable
keywords: [clickhouse, 埋め込み可能, 接続, 統合, ui]
description: 埋め込み可能は、あなたのアプリに直接高速でインタラクティブなカスタム解析体験を構築するための開発者ツールキットです。
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# 埋め込み可能をClickHouseに接続する

[埋め込み可能](https://embeddable.com/)では、コード内で[データモデル](https://trevorio.notion.site/Data-modeling-35637bbbc01046a1bc47715456bfa1d8)と[コンポーネント](https://trevorio.notion.site/Using-components-761f52ac2d0743b488371088a1024e49)を定義し（自身のコードリポジトリに保存）、私たちの**SDK**を使用して、強力な埋め込み可能**ノーコードビルダー**にチームのためにこれらを利用可能にします。

最終的な結果は、商品チームが設計し、エンジニアリングチームが構築し、顧客対応チームおよびデータチームによって維持される形で直接商品内で高速でインタラクティブな顧客向け分析を提供する能力です。まさにそれが求められる方法です。

組み込みの行レベルセキュリティにより、すべてのユーザーは許可されているデータのみを正確に見ることができます。また、2つの完全に構成可能なキャッシングレベルにより、スケールで迅速なリアルタイム分析を提供できます。


## 1. 接続詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouse接続タイプを作成する {#2-create-a-clickhouse-connection-type}

Embedding APIを使用してデータベース接続を追加します。この接続はあなたのClickHouseサービスに接続するために使用されます。次のAPI呼び出しを使用して接続を追加できます：

```javascript
// セキュリティ上の理由から、これは*決して*クライアント側から呼び出してはいけません
fetch('https://api.embeddable.com/api/v1/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}` /* あなたのAPIキーを安全に保つ */,
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

上記は`CREATE`アクションを表していますが、すべての`CRUD`操作が可能です。

`apiKey`は、あなたの埋め込み可能ダッシュボードの1つで「**公開**」をクリックすることで見つけることができます。

`name`はこの接続を識別するためのユニークな名前です。
- デフォルトでは、データモデルは「default」と呼ばれる接続を探しますが、異なる接続に異なる`data_source`名を指定することで、異なるデータモデルを異なる接続に接続できます（モデル内でdata_source名を単に指定してください）。

`type`は、Embeddedにどのドライバーを使用するかを伝えます。

- ここでは`clickhouse`を使用したいですが、1つの埋め込み可能なワークスペースに複数の異なるデータソースを接続できるので、他のソース（例えば：`postgres`、`bigquery`、`mongodb`など）を使用することもできます。

`credentials`は、ドライバーが期待する必要な資格情報を含むJavaScriptオブジェクトです。
- これらは安全に暗号化され、あなたのデータモデルに記述されたデータを正確に取得するにのみ使用されます。
埋め込み可能は、各接続のために読み取り専用データベースユーザーを作成することを強く推奨します（埋め込み可能はあなたのデータベースから読み込むだけで、書き込むことはありません）。

本番、QA、テストなどの異なるデータベースに接続することをサポートするために（または異なる顧客のために異なるデータベースをサポートするために）、各接続に環境を割り当てることができます（[環境API](https://www.notion.so/Environments-API-497169036b5148b38f7936aa75e62949?pvs=21）を参照してください）。
