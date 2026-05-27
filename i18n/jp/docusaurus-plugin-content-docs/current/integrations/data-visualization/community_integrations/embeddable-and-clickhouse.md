---
sidebar_label: 'Embeddable'
slug: /integrations/embeddable
keywords: ['clickhouse', 'Embeddable', 'connect', 'integrate', 'ui']
description: 'Embeddable は、高速でインタラクティブかつ完全にカスタマイズ可能な分析体験をアプリに直接組み込むための、開発者向けツールキットです。'
title: 'Embeddable を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

<CommunityMaintainedBadge />

[Embeddable](https://embeddable.com/) では、[Data Models](https://docs.embeddable.com/data-modeling/introduction) と [Components](https://docs.embeddable.com/development/introduction) をコードで定義し (コードは自社のリポジトリに保存されます) 、**SDK** を使って、これらを強力な Embeddable の**ノーコードビルダー**でチームが利用できるようにします。

その結果、プロダクトに顧客向けの高速でインタラクティブなアナリティクスを直接組み込めるようになります。設計はプロダクトチーム、実装はエンジニアリングチーム、運用は顧客対応チームとデータチームが担います。あるべき形そのものです。

組み込みの行レベルセキュリティにより、各ユーザーには、閲覧を許可されたデータだけが表示されます。さらに、2 層の完全に設定可能なキャッシュによって、大規模環境でも高速なリアルタイムアナリティクスを提供できます。

## 1. 接続情報を用意する \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. ClickHouse 接続タイプを作成する \{#2-create-a-clickhouse-connection-type\}

Embeddable API を使用してデータベース接続を追加します。この接続は、ClickHouse サービスへの接続に使用されます。接続は、次の API 呼び出しで追加できます。

```javascript title="Query"
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
```

```text title="Response"
Status 201 { errorMessage: null }
```

上記は `CREATE` アクションを表していますが、`CRUD` のすべての操作を利用できます。

`apiKey` は、いずれかの Embeddable ダッシュボードで &quot;**Publish**&quot; をクリックすると確認できます。

`name` は、この接続を識別するための一意の名前です。

* デフォルトでは、Data Models は &quot;default&quot; という名前の接続を参照しますが、モデルに別の `data_source` 名を指定することで、異なる Data Models を異なる接続に紐付けられます (モデル内で data&#95;source 名を指定するだけです)

`type` は、使用するドライバーを Embeddable に伝えるためのものです

* ここでは `clickhouse` を使用しますが、1 つの Embeddable ワークスペースに複数の異なるデータソースを接続できるため、`postgres`、`bigquery`、`mongodb` などを使用することもできます。

`credentials` は、ドライバーが必要とする認証情報を含む JavaScript オブジェクトです

* これらは安全に暗号化され、Data Models で定義したとおりのデータを取得するためにのみ使用されます。
  Embeddable では、接続ごとに読み取り専用のデータベースユーザーを作成することを強く推奨しています (Embeddable がデータベースに対して行うのは読み取りのみで、書き込みは行いません) 。

prod、qa、test などで異なるデータベースへの接続をサポートするため (または顧客ごとに異なるデータベースをサポートするため) 、各接続を環境に割り当てることができます ([Environments API](https://docs.embeddable.com/data/environments) を参照) 。