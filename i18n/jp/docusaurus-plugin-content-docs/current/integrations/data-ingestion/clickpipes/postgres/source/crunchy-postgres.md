---
'sidebar_label': 'Crunchy Bridge Postgres'
'description': '将 Crunchy Bridge Postgres 设置为 ClickPipes 的源'
'slug': '/integrations/clickpipes/postgres/source/crunchy-postgres'
'title': 'Crunchy Bridge Postgres 源设置指南'
'doc_type': 'guide'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';


# Crunchy Bridge Postgres ソースセットアップガイド

ClickPipesはPostgresバージョン12以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

Crunchy Bridgeには、[デフォルト](https://docs.crunchybridge.com/how-to/logical-replication)で論理レプリケーションが有効になっています。以下の設定が正しく構成されていることを確認してください。そうでない場合は、適宜調整してください。

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```

## ClickPipesユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

`postgres`ユーザーを介してCrunchy Bridge Postgresに接続し、以下のコマンドを実行します。

1. ClickPipes専用のPostgresユーザーを作成します。

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. テーブルをレプリケートするスキーマへの読み取り専用アクセスを`clickpipes_user`に付与します。以下の例は、`public`スキーマへの権限付与を示しています。複数のスキーマにアクセスを付与したい場合は、各スキーマに対してこれらの3つのコマンドを実行できます。

```sql
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. このユーザーにレプリケーションアクセスを付与します：

```sql
ALTER ROLE clickpipes_user REPLICATION;
```

4. 今後MIRROR（レプリケーション）を作成するために使用する公開物を作成します。

```sql
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

## ClickPipes IPの安全リスト {#safe-list-clickpipes-ips}

[ClickPipes IP](../../index.md#list-of-static-ips)を安全リストに追加し、Crunchy Bridgeのファイアウォールルールに加えます。

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="Crunchy Bridgeのファイアウォールルールの見つけ方" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="ClickPipes用のファイアウォールルールを追加" border/>

## 次は何ですか？ {#whats-next}

これで[ClickPipeを作成](../index.md)し、あなたのPostgresインスタンスからClickHouse Cloudにデータをインジェストし始めることができます。
Postgresインスタンスの設定中に使用した接続詳細をメモしておくことを忘れないでください。ClickPipeの作成プロセス中に必要となります。
