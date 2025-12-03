---
sidebar_label: 'Amazon Aurora Postgres'
description: 'ClickPipes 用のソースとして Amazon Aurora Postgres を設定する'
slug: /integrations/clickpipes/postgres/source/aurora
title: 'Aurora Postgres ソース設定ガイド'
doc_type: 'guide'
keywords: ['Amazon Aurora', 'PostgreSQL', 'ClickPipes', 'AWS データベース', '論理レプリケーションのセットアップ']
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';

# Aurora Postgres ソースのセットアップガイド {#aurora-postgres-source-setup-guide}

## サポートされている Postgres バージョン {#supported-postgres-versions}

ClickPipes は Aurora PostgreSQL 互換エディションのバージョン 12 以降に対応しています。

## 論理レプリケーションを有効にする {#enable-logical-replication}

Aurora インスタンスですでに次の設定が行われている場合は、このセクションはスキップしてかまいません。

* `rds.logical_replication = 1`
* `wal_sender_timeout = 0`

これらの設定は、以前に別のデータレプリケーションツールを使用していた場合には、あらかじめ設定されていることが一般的です。

```text
postgres=> SHOW rds.logical_replication ;
 rds.logical_replication
-------------------------
 on
(1 row)

postgres=> SHOW wal_sender_timeout ;
 wal_sender_timeout
--------------------
 0
(1 row)
```

まだ設定していない場合は、次の手順に従ってください。

1. 使用している Aurora PostgreSQL のバージョン用に、必要な設定を含む新しいパラメータグループを作成します：
   * `rds.logical_replication` を 1 に設定します
   * `wal_sender_timeout` を 0 に設定します

<Image img={parameter_group_in_blade} alt="Aurora でパラメータグループを表示できる場所" size="lg" border />

<Image img={change_rds_logical_replication} alt="rds.logical_replication の変更" size="lg" border />

<Image img={change_wal_sender_timeout} alt="wal_sender_timeout の変更" size="lg" border />

2. 新しいパラメータグループを Aurora PostgreSQL クラスターに適用します

<Image img={modify_parameter_group} alt="新しいパラメータグループを適用した Aurora PostgreSQL の変更" size="lg" border />

3. Aurora クラスターを再起動して変更を反映します

<Image img={reboot_rds} alt="Aurora PostgreSQL の再起動" size="lg" border />

## データベースユーザーの設定 {#configure-database-user}

Aurora PostgreSQL のライターインスタンスに管理者ユーザーとして接続し、次のコマンドを実行します。

1. ClickPipes 用の専用ユーザーを作成します：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. スキーマの権限を付与します。次の例では、`public` スキーマに対する権限を示しています。レプリケーション対象とする各スキーマごとに、同様のコマンドを実行してください。

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. レプリケーション権限を付与します：

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. レプリケーション用のパブリケーションを作成します：

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## ネットワークアクセスの設定 {#configure-network-access}

### IP ベースのアクセス制御 {#ip-based-access-control}

Aurora クラスターへのトラフィックを制限したい場合は、[ドキュメントに記載されている固定 NAT IP](../../index.md#list-of-static-ips) を Aurora セキュリティグループの `Inbound rules` に追加してください。

<Image img={security_group_in_rds_postgres} alt="Aurora PostgreSQL でセキュリティグループを確認できる場所" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記セキュリティグループの inbound rules を編集" size="lg" border/>

### AWS PrivateLink を使用したプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワーク経由で Aurora クラスターに接続するには、AWS PrivateLink を使用できます。接続を設定するには、ClickPipes 用の [AWS PrivateLink セットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes) に従ってください。

### Aurora 固有の考慮事項 {#aurora-specific-considerations}

Aurora PostgreSQL と ClickPipes を連携させる際は、次の点を考慮してください。

1. **接続エンドポイント**: 常に Aurora クラスターの writer エンドポイントに接続してください。論理レプリケーションでは、レプリケーションスロットを作成するために書き込みアクセスが必要であり、プライマリインスタンスに接続しなければなりません。

2. **フェイルオーバー処理**: フェイルオーバーが発生すると、Aurora は自動的にリーダーを新しい writer に昇格させます。ClickPipes は切断を検知し、writer エンドポイントへの再接続を試みます。このエンドポイントは新しいプライマリインスタンスを指すようになります。

3. **グローバルデータベース**: Aurora Global Database を使用している場合は、プライマリリージョンの writer エンドポイントに接続する必要があります。リージョン間レプリケーションが、すでにリージョン間のデータ移動を処理しているためです。

4. **ストレージに関する考慮事項**: Aurora のストレージレイヤーはクラスター内のすべてのインスタンスで共有されており、標準的な RDS と比較して、論理レプリケーションのパフォーマンスが向上する可能性があります。

### 動的なクラスターエンドポイントへの対応 {#dealing-with-dynamic-cluster-endpoints}

Aurora では、適切なインスタンスに自動的にルーティングされる安定したエンドポイントが提供されていますが、一貫した接続性を確保するために、次のような追加のアプローチがあります。

1. 高可用性構成の場合は、アプリケーションを Aurora の writer エンドポイントを使用するように構成してください。これは自動的に現在のプライマリインスタンスを指します。

2. リージョン間レプリケーションを使用している場合は、レイテンシーを低減し、耐障害性を向上させるために、リージョンごとに個別の ClickPipes を設定することを検討してください。

## 次のステップ {#whats-next}

これで、[ClickPipeを作成](../index.md)し、Aurora PostgreSQL クラスターから ClickHouse Cloud へデータの取り込みを開始できます。
Aurora PostgreSQL クラスターをセットアップした際に使用した接続情報は、ClickPipe の作成時にも必要になるため、必ず控えておいてください。
