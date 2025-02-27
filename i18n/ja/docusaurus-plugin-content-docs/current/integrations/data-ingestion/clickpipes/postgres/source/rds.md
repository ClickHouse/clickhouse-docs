---
sidebar_label: Amazon RDS Postgres
description: ClickPipes用にAmazon RDS Postgresをソースとして設定する
slug: /integrations/clickpipes/postgres/source/rds
---

# RDS Postgres ソース設定ガイド

## 対応している Postgres バージョン {#supported-postgres-versions}

ClickPipesは、Postgresバージョン12以降をサポートしています。

## 論理レプリケーションを有効にする {#enable-logical-replication}

RDSインスタンスに次の設定がすでに構成されている場合、このセクションはスキップできます：
- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

これらの設定は、以前に他のデータレプリケーションツールを使用していた場合、一般的に事前に構成されています。

![論理レプリケーションが既に有効か確認](images/setup/rds/logical_rep_already_configured.png)

未設定の場合は、次の手順に従ってください：

1. 必要な設定でPostgresバージョン用の新しいパラメータグループを作成します：
    - `rds.logical_replication`を1に設定
    - `wal_sender_timeout`を0に設定

    ![RDSのパラメータグループを見つける場所](images/setup/rds/parameter_group_in_blade.png)

    ![rds.logical_replicationの変更](images/setup/rds/change_rds_logical_replication.png)

    ![wal_sender_timeoutの変更](images/setup/rds/change_wal_sender_timeout.png)

2. 新しいパラメータグループをRDS Postgresデータベースに適用します

    ![新しいパラメータグループでRDS Postgresを変更](images/setup/rds/modify_parameter_group.png)

3. 変更を適用するためにRDSインスタンスを再起動します

    ![RDS Postgresを再起動](images/setup/rds/reboot_rds.png)

## データベースユーザーの設定 {#configure-database-user}

管理ユーザーとしてRDS Postgresインスタンスに接続し、次のコマンドを実行します：

1. ClickPipes用の専用ユーザーを作成します：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. スキーマ権限を付与します。次の例は、`public`スキーマの権限を示しています。レプリケーションしたい各スキーマについてこれらのコマンドを繰り返してください：

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

RDSインスタンスへのトラフィックを制限したい場合は、[ドキュメント化された静的NAT IP](../../index.md#list-of-static-ips)をRDSセキュリティグループの`Inbound rules`に追加してください。

![RDS Postgresでセキュリティグループを見つける場所](images/setup/rds/security_group_in_rds_postgres.png)

![上記のセキュリティグループのインバウンドルールを編集](images/setup/rds/edit_inbound_rules.png)

### AWS PrivateLinkによるプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを介してRDSインスタンスに接続するには、AWS PrivateLinkを使用できます。接続の設定には、[ClickPipes用のAWS PrivateLink設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。

### RDSプロキシの回避策 {#workarounds-for-rds-proxy}
RDSプロキシは論理レプリケーション接続をサポートしていません。RDSに動的IPアドレスがあり、DNS名またはLambdaを使用できない場合は、以下の代替手段があります：

1. Cronジョブを使用して、定期的にRDSエンドポイントのIPを解決し、変更があればNLBを更新します。
2. EventBridge/SNSを使用したRDSイベント通知：AWS RDSイベント通知を使用して自動的に更新をトリガーします。
3. 安定したEC2：ポーリングサービスまたはIPベースのプロキシとして機能するEC2インスタンスをデプロイします。
4. TerraformやCloudFormationなどのツールを使用して、IPアドレス管理を自動化します。

## 次は何ですか？ {#whats-next}

これで、[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込み始めることができます。Postgresインスタンスを設定する際に使用した接続情報をメモしておくことを忘れないでください。ClickPipe作成プロセス中に必要になります。
