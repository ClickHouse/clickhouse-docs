---
sidebar_label: 'Embeddable'
slug: /integrations/embeddable
keywords: ['clickhouse', 'Embeddable', 'connect', 'integrate', 'ui']
description: 'Embeddable は、高速でインタラクティブ、かつ完全にカスタマイズ可能な分析エクスペリエンスを、アプリケーションに直接組み込むための開発者向けツールキットです。'
title: 'Embeddable を ClickHouse に接続する'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Embeddable を ClickHouse に接続する

<CommunityMaintainedBadge/>

[Embeddable](https://embeddable.com/) では、（自社のコードリポジトリで管理される）コード内で [Data Models](https://docs.embeddable.com/data-modeling/introduction) と [Components](https://docs.embeddable.com/development/introduction) を定義し、**SDK** を使ってそれらを強力な Embeddable の **ノーコードビルダー** 上でチームが利用できるようにします。

その結果として、プロダクトに直接組み込まれた、高速でインタラクティブな顧客向けアナリティクスを提供できるようになります。プロダクトチームが設計し、エンジニアリングチームが構築し、カスタマー対応チームとデータチームが運用する――本来あるべき形で。

組み込みの行レベルセキュリティにより、各ユーザーは自分に閲覧権限が与えられたデータだけを正確に確認できます。また、2 段階の完全に構成可能なキャッシュによって、高速かつリアルタイムなアナリティクスを大規模に提供できます。



## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. ClickHouse接続タイプを作成する {#2-create-a-clickhouse-connection-type}

Embeddable APIを使用してデータベース接続を追加します。この接続は、ClickHouseサービスへの接続に使用されます。以下のAPI呼び出しで接続を追加できます:

```javascript
// セキュリティ上の理由から、クライアント側から*決して*呼び出さないでください
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

上記は`CREATE`アクションを表していますが、すべての`CRUD`操作が利用可能です。

`apiKey`は、Embeddableダッシュボードの1つで「**Publish**」をクリックすることで確認できます。

`name`は、この接続を識別するための一意の名前です。

- デフォルトでは、データモデルは「default」という名前の接続を探しますが、異なるデータモデルを異なる接続に接続するために、モデルに異なる`data_source`名を指定することができます(モデル内でdata_source名を指定するだけです)

`type`は、Embeddableが使用するドライバーを指定します

- ここでは`clickhouse`を使用しますが、1つのEmbeddableワークスペースに複数の異なるデータソースを接続できるため、`postgres`、`bigquery`、`mongodb`などの他のドライバーも使用できます。

`credentials`は、ドライバーが必要とする認証情報を含むJavaScriptオブジェクトです

- これらは安全に暗号化され、データモデルで記述したデータを正確に取得するためにのみ使用されます。
  Embeddableでは、各接続に対して読み取り専用のデータベースユーザーを作成することを強く推奨します(Embeddableはデータベースからの読み取りのみを行い、書き込みは行いません)。

本番環境、QA環境、テスト環境などの異なるデータベースへの接続をサポートするため(または異なる顧客に対して異なるデータベースをサポートするため)、各接続を環境に割り当てることができます([Environments API](https://docs.embeddable.com/data/environments)を参照)。
