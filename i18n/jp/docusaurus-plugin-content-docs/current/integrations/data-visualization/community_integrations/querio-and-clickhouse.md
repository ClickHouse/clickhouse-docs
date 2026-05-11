---
sidebar_label: 'Querio'
sidebar_position: 145
slug: /integrations/querio
keywords: ['Querio', '接続', '統合', '分析', 'AI']
description: 'Querio は AI ネイティブのアナリティクスおよびビジネスインテリジェンス向けワークスペースです。ClickHouse を Querio に接続して、SQL、Python、AI を使用してライブデータを探索・可視化・分析できます。'
title: 'ClickHouse を Querio に接続する'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

<CommunityMaintainedBadge />

Querio は、AI を活用したアナリティクスおよびビジネスインテリジェンス向けワークスペースであり、チームが SQL、Python、自然言語を用いてデータに対してクエリを実行し、探索し、可視化し、インサイトを得ることができます。Querio を ClickHouse データベースまたはデータウェアハウスに接続すると、データを移動することなく、ClickHouse 上のデータに対してスケールするライブ分析を実行し、ボード、ノートブック、AI 支援レポートを作成できます。


## Querio 向けに ClickHouse をセットアップする \{#setup-clickhouse-for-querio\}

<VerticalStepper headerLevel="h3">

### 専用ユーザーを作成する \{#create-dedicated-user\}

セキュリティのベストプラクティスとして、Querio 専用のユーザーアカウントを作成し、必要最小限の権限のみを付与してください:

```sql
CREATE USER querio_user IDENTIFIED BY 'STRONG_PASSWORD';
```

:::tip
少なくとも 16 文字以上の長くランダムなパスワードを使用し、可能であればパスワードマネージャーで生成してください。
:::

### 読み取り専用のデータベースアクセス権を付与する \{#grant-read-only-access\}

Querio の権限は、クエリが必要なデータベースとテーブルのみに制限してください:

```sql
GRANT SELECT ON my_database.* TO querio_user;
```

特定のテーブルに対しては、次のようにします:
```sql
GRANT SELECT ON database.table_name TO querio_user;
```

Querio にアクセス権が必要な各データベースについて、この手順を繰り返してください。

### 接続情報を確認する \{#gather-connection-details\}

Querio を ClickHouse に接続するには、次の接続情報が必要です:

| Parameter | Description |
|-----------|-------------|
| `HOST` | ClickHouse サーバーまたはクラスターのアドレス |
| `PORT` | ポート 9440（セキュアなネイティブプロトコルのデフォルト）または設定しているポート |
| `DATABASE` | Querio にクエリさせたいデータベース |
| `USERNAME` | `querio_user`（または任意のユーザー名） |
| `PASSWORD` | ユーザーアカウントのパスワード |

:::note
- ClickHouse Cloud の場合、接続情報は Cloud コンソール上で確認できます
- セルフマネージド環境の場合、ClickHouse が別のポートを使用しているときはサーバー設定を確認してください
- ポート 9440 はセキュアなネイティブプロトコル接続のデフォルトです
:::

</VerticalStepper>

## Querio アカウントを作成し、ClickHouse に接続する \{#create-account-and-connect\}

[https://app.querio.ai/](https://app.querio.ai/) にアクセスし、Querio ワークスペースにログインするか、新規作成します。

1. Querio で **Settings → Datasources** に移動し、**Add Datasource** をクリックします。

2. データベースオプションの一覧から **ClickHouse** を選択します。

3. 上記で確認した接続情報を入力し、設定を保存します。

4. Querio が接続を検証します。成功すると、ClickHouse はワークスペース全体で利用可能なデータソースとして追加されます。

## ClickHouse へのクエリ実行 \{#querying-clickhouse\}

Querio を ClickHouse に接続したら、プラットフォーム上のどこからでもデータを探索・分析できます。Querio ノートブック内で SQL ブロックまたは Python セルを作成し、データソースとして ClickHouse を選択して、ClickHouse クラスターに対して直接クエリを実行します。Querio の可視化機能と AI ツールを利用してインサイトを抽出し、ボードを構築し、結果を共有します。

## 追加リソース \{#additional-resources\}

- [Querio のドキュメント](https://docs.querio.ai/integrations/clickhouse)
- [Querio の入門ガイドとチュートリアル](https://www.querio.ai)