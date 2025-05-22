---
'sidebar_label': 'Amazon RDS Postgres'
'description': 'ClickPipes 用の Amazon RDS Postgres ソースの設定'
'slug': '/integrations/clickpipes/postgres/source/rds'
'title': 'RDS Postgres Source Setup Guide'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# RDS Postgres ソースセットアップガイド

## サポートされているPostgresバージョン {#supported-postgres-versions}

ClickPipesはPostgresバージョン12以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

以下の設定がすでに構成されている場合は、このセクションをスキップできます：
- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

これらの設定は、以前に別のデータレプリケーションツールを使用していた場合、通常は事前に構成されています。

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

構成されていない場合は、以下の手順に従ってください：

1. 必要な設定を持つPostgresバージョンの新しいパラメータグループを作成します：
    - `rds.logical_replication`を1に設定
    - `wal_sender_timeout`を0に設定

<Image img={parameter_group_in_blade} alt="RDSでパラメータグループを見つける場所" size="lg" border/>

<Image img={change_rds_logical_replication} alt="rds.logical_replicationの変更" size="lg" border/>

<Image img={change_wal_sender_timeout} alt="wal_sender_timeoutの変更" size="lg" border/>

2. 新しいパラメータグループをRDS Postgresデータベースに適用します。

<Image img={modify_parameter_group} alt="新しいパラメータグループでRDS Postgresを変更する" size="lg" border/>

3. 変更を適用するためにRDSインスタンスを再起動します。

<Image img={reboot_rds} alt="RDS Postgresを再起動する" size="lg" border/>

## データベースユーザーの設定 {#configure-database-user}

管理者ユーザーとしてRDS Postgresインスタンスに接続し、以下のコマンドを実行します：

1. ClickPipes用の専用ユーザーを作成します：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. スキーマの権限を付与します。以下の例は`public`スキーマの権限を示しています。レプリケートしたい各スキーマに対してこれらのコマンドを繰り返します：

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. レプリケーション権限を付与します：

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. レプリケーション用の公開物を作成します：

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## ネットワークアクセスの設定 {#configure-network-access}

### IPベースのアクセス制御 {#ip-based-access-control}

RDSインスタンスへのトラフィックを制限したい場合は、[文書化された静的NAT IP](../../index.md#list-of-static-ips)をRDSセキュリティグループの`Inbound rules`に追加してください。

<Image img={security_group_in_rds_postgres} alt="RDS Postgresでセキュリティグループを見つける場所" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記のセキュリティグループのインバウンドルールを編集する" size="lg" border/>

### AWS PrivateLinkによるプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを通じてRDSインスタンスに接続するには、AWS PrivateLinkを使用できます。接続の設定については、[ClickPipes用のAWS PrivateLinkセットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。

### RDS Proxyの回避策 {#workarounds-for-rds-proxy}
RDS Proxyは論理レプリケーション接続をサポートしていません。RDSで動的IPアドレスを使用していて、DNS名やラムダを使用できない場合、いくつかの代替手段があります：

1. cronジョブを使用して定期的にRDSエンドポイントのIPを解決し、変更があればNLBを更新します。
2. RDSイベント通知をEventBridge/SNSとともに使用：AWS RDSイベント通知を使用して自動的に更新をトリガーします。
3. 安定したEC2：ポーリングサービスまたはIPベースのプロキシとして機能するEC2インスタンスをデプロイします。
4. TerraformやCloudFormationなどのツールを使用してIPアドレス管理を自動化します。

## 次は何ですか？ {#whats-next}

これで、[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込む準備が整いました。
Postgresインスタンスの設定時に使用した接続詳細をメモしておくことを忘れないでください。ClickPipeの作成プロセス中に必要になります。
