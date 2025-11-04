---
'sidebar_label': 'Amazon RDS Postgres'
'description': 'ClickPipes のソースとして Amazon RDS Postgres を設定します'
'slug': '/integrations/clickpipes/postgres/source/rds'
'title': 'RDS Postgres ソース設定ガイド'
'doc_type': 'guide'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# RDS Postgres ソース設定ガイド

## サポートされている Postgres バージョン {#supported-postgres-versions}

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

以下の設定がすでに RDS インスタンスに構成されている場合は、このセクションをスキップできます：
- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

これらの設定は、以前に別のデータレプリケーションツールを使用していた場合に事前に構成されていることが一般的です。

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

1. 必要な設定を持つ Postgres バージョンの新しいパラメータグループを作成します：
    - `rds.logical_replication` を 1 に設定
    - `wal_sender_timeout` を 0 に設定

<Image img={parameter_group_in_blade} alt="RDS のパラメータグループの見つけ方" size="lg" border/>

<Image img={change_rds_logical_replication} alt="rds.logical_replication を変更" size="lg" border/>

<Image img={change_wal_sender_timeout} alt="wal_sender_timeout を変更" size="lg" border/>

2. 新しいパラメータグループを RDS Postgres データベースに適用します

<Image img={modify_parameter_group} alt="新しいパラメータグループを使って RDS Postgres を変更" size="lg" border/>

3. 変更を適用するために RDS インスタンスを再起動します

<Image img={reboot_rds} alt="RDS Postgres を再起動" size="lg" border/>

## データベースユーザーの設定 {#configure-database-user}

管理者ユーザーとして RDS Postgres インスタンスに接続し、以下のコマンドを実行します：

1. ClickPipes 用の専用ユーザーを作成します：

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. スキーマの権限を付与します。以下の例は `public` スキーマに対する権限を示しています。レプリケートしたい各スキーマに対してこれらのコマンドを繰り返します：

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

RDS インスタンスへのトラフィックを制限したい場合は、[ドキュメント化された静的 NAT IPs](../../index.md#list-of-static-ips)を RDS セキュリティグループの `Inbound rules` に追加してください。

<Image img={security_group_in_rds_postgres} alt="RDS Postgres でのセキュリティグループの見つけ方" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記セキュリティグループのインバウンドルールを編集" size="lg" border/>

### AWS PrivateLink を介したプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを通じて RDS インスタンスに接続するには、AWS PrivateLink を使用できます。接続の設定方法については、[ClickPipes 用の AWS PrivateLink 設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。

### RDS プロキシ用の回避策 {#workarounds-for-rds-proxy}
RDS プロキシは論理レプリケーション接続をサポートしていません。RDS に動的 IP アドレスがあり、DNS 名またはラムダを使用できない場合、以下の代替案があります：

1. cron ジョブを使用して RDS エンドポイントの IP を定期的に解決し、変更されている場合は NLB を更新します。
2. EventBridge/SNS とRDS イベント通知を使用：AWS RDS イベント通知を使用して自動的に更新をトリガーします。
3. 安定した EC2：ポーリングサービスまたは IP ベースのプロキシとして機能する EC2 インスタンスをデプロイします。
4. Terraform や CloudFormation のようなツールを使用して IP アドレス管理を自動化します。

## 次は何をするか？ {#whats-next}

これで [ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud にデータを取り込むことができます。
Postgres インスタンスを設定する際に使用した接続の詳細をメモしておくことを忘れないでください。ClickPipe の作成プロセス中に必要になります。
