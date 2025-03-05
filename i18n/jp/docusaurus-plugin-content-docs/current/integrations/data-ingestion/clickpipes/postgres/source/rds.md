---
sidebar_label: Amazon RDS Postgres
description: ClickPipesのソースとしてAmazon RDS Postgresをセットアップする
slug: /integrations/clickpipes/postgres/source/rds
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';


# RDS Postgres ソースセットアップガイド

## サポートされているPostgresバージョン {#supported-postgres-versions}

ClickPipesはPostgresバージョン12以降をサポートしています。

## 論理レプリケーションを有効にする {#enable-logical-replication}

RDSインスタンスが既に以下の設定で構成されている場合、このセクションをスキップできます：
- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

これらの設定は、以前に他のデータレプリケーションツールを使用していた場合、通常は事前に構成されています。

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

まだ構成されていない場合は、以下の手順に従ってください：

1. 必要な設定を持つPostgresバージョンの新しいパラメーターグループを作成します：
    - `rds.logical_replication` を1に設定
    - `wal_sender_timeout` を0に設定

<img src={parameter_group_in_blade} alt="RDSでパラメーターグループの位置" />

<img src={change_rds_logical_replication} alt="rds.logical_replicationの変更" />

<img src={change_wal_sender_timeout} alt="wal_sender_timeoutの変更" />

2. 新しいパラメーターグループをRDS Postgresデータベースに適用します

<img src={modify_parameter_group} alt="新しいパラメーターグループでRDS Postgresを変更" />

3. 変更を適用するためにRDSインスタンスを再起動します

<img src={reboot_rds} alt="RDS Postgresの再起動" />

## データベースユーザーの構成 {#configure-database-user}

管理者ユーザーとしてRDS Postgresインスタンスに接続し、以下のコマンドを実行します：

1. ClickPipes用の専用ユーザーを作成します：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. スキーマ権限を付与します。以下の例は`public`スキーマに対する権限を示しています。レプリケーションしたい各スキーマに対してこれらのコマンドを繰り返してください：

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. レプリケーション特権を付与します：

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. レプリケーションのためのパブリケーションを作成します：

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## ネットワークアクセスの構成 {#configure-network-access}

### IPベースのアクセス制御 {#ip-based-access-control}

RDSインスタンスへのトラフィックを制限したい場合は、[文書化された静的NAT IPs](../../index.md#list-of-static-ips)をRDSセキュリティグループの`Inbound rules`に追加してください。

<img src={security_group_in_rds_postgres} alt="RDS Postgresでのセキュリティグループの位置" />

<img src={edit_inbound_rules} alt="上記セキュリティグループの受信ルールを編集" />

### AWS PrivateLinkを通じたプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを通じてRDSインスタンスに接続するには、AWS PrivateLinkを使用できます。接続のセットアップについては、[ClickPipes用のAWS PrivateLinkセットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。

### RDS Proxyのための代替策 {#workarounds-for-rds-proxy}
RDS Proxyは論理レプリケーション接続をサポートしていません。RDSで動的IPアドレスを使用していて、DNS名やLambdaを使用できない場合は、以下の代替策があります：

1. cronジョブを使用して、定期的にRDSエンドポイントのIPを解決し、変更されている場合はNLBを更新します。
2. RDSイベント通知をEventBridge/SNSと共に使用します：AWS RDSイベント通知を使用して自動的に更新をトリガーします。
3. 安定したEC2：ポーリングサービスまたはIPベースのプロキシとして機能するEC2インスタンスを展開します。
4. TerraformやCloudFormationのようなツールを使用してIPアドレス管理を自動化します。

## 次は何ですか？ {#whats-next}

次に、[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込むことができます。Postgresインスタンスを設定した際に使用した接続詳細をメモしておくと、ClickPipe作成プロセス中に必要になります。
