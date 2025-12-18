---
sidebar_label: 'Embeddable'
slug: /integrations/embeddable
keywords: ['clickhouse', 'Embeddable', 'connect', 'integrate', 'ui']
description: 'Embeddable は、高速でインタラクティブかつ完全にカスタマイズ可能なアナリティクス エクスペリエンスをアプリに直接組み込むための開発者向けツールキットです。'
title: 'Embeddable を ClickHouse に接続する'
doc_type: 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Embeddable を ClickHouse に接続する {#connecting-embeddable-to-clickhouse}

<CommunityMaintainedBadge/>

[Embeddable](https://embeddable.com/) では、自社のコードリポジトリに保存されたコード内で [データモデル](https://docs.embeddable.com/data-modeling/introduction) と [コンポーネント](https://docs.embeddable.com/development/introduction) を定義し、Embeddable の強力な **ノーコードビルダー** でチームが利用できるようにするために、**SDK** を使用します。

その結果、プロダクトチームが設計し、エンジニアリングチームが構築し、カスタマーサクセスおよびデータチームが運用する、高速でインタラクティブな顧客向けアナリティクスを、プロダクトに直接組み込んで提供できるようになります。まさに、あるべき姿と言えるでしょう。

組み込みの行レベルセキュリティ機能により、各ユーザーは自分に閲覧権限があるデータだけを常に正確に確認できます。さらに、完全に構成可能な 2 段階のキャッシュにより、スケールさせながら高速なリアルタイムアナリティクスを提供できます。

## 1. 接続情報を確認する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouse 接続タイプを作成する {#2-create-a-clickhouse-connection-type}

Embeddable API を使用してデータベース接続を追加します。この接続は ClickHouse サービスへの接続に利用されます。次の API コールを使用して接続を追加できます。

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

`apiKey` は、いずれかの Embeddable ダッシュボードで「**Publish**」をクリックすると確認できます。

`name` は、この接続を識別するための一意の名前です。

* デフォルトでは、データモデルは &quot;default&quot; という名前の接続を探しますが、モデル側で異なる `data_source` 名を指定することで、異なるデータモデルを異なる接続に紐づけて利用できます（モデル内で data&#95;source 名を指定するだけです）

`type` は、Embeddable にどのドライバーを使用するかを指定します。

* ここでは `clickhouse` を使用しますが、1 つの Embeddable ワークスペースに複数の異なるデータソースを接続できるため、`postgres`、`bigquery`、`mongodb` など他のものを使用することもできます。

`credentials` は、ドライバーが必要とする認証情報を含む JavaScript オブジェクトです。

* これらは安全に暗号化され、データモデルで定義したデータを取得する目的にのみ使用されます。
  Embeddable では、各接続ごとに読み取り専用のデータベースユーザーを作成することを強く推奨しています（Embeddable はデータベースからの読み取りのみを行い、書き込みは一切行いません）。

本番、QA、テストなどで異なるデータベースに接続したり（あるいは顧客ごとに異なるデータベースを利用したり）できるように、各接続を環境に割り当てることができます（[Environments API](https://docs.embeddable.com/data/environments) を参照してください）。
