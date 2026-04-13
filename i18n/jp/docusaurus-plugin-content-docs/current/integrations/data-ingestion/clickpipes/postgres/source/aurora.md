---
sidebar_label: 'Amazon Aurora Postgres'
description: 'ClickPipes のソースとして Amazon Aurora Postgres を設定する'
slug: /integrations/clickpipes/postgres/source/aurora
title: 'Aurora Postgres ソース設定ガイド'
doc_type: 'guide'
keywords: ['Amazon Aurora', 'PostgreSQL', 'ClickPipes', 'AWSデータベース', '論理レプリケーションの設定']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';

# Aurora Postgres ソース設定ガイド \{#aurora-postgres-source-setup-guide\}

## サポートされる Postgres のバージョン \{#supported-postgres-versions\}

ClickPipes は Aurora PostgreSQL-Compatible Edition バージョン 12 以降をサポートしています。

## 論理レプリケーションを有効にする \{#enable-logical-replication\}

Aurora インスタンスで以下の設定がすでに設定されている場合は、このセクションをスキップできます。

* `rds.logical_replication = 1`

以前に別のデータレプリケーションツールを使用していた場合、この設定は通常、あらかじめ設定されています。

```text
postgres=> SHOW rds.logical_replication ;
 rds.logical_replication
-------------------------
 on
(1 row)
```

まだ設定していない場合は、次の手順に従ってください。

1. 必須の設定を含む、使用中の Aurora PostgreSQL バージョン向けの新しいパラメータグループを作成します。
   * `rds.logical_replication` を 1 に設定します

<Image img={parameter_group_in_blade} alt="Aurora でパラメータグループを確認する場所" size="lg" border />

<Image img={change_rds_logical_replication} alt="rds.logical_replication の変更" size="lg" border />

2. 新しいパラメータグループを Aurora PostgreSQL クラスタに適用します

<Image img={modify_parameter_group} alt="新しいパラメータグループを Aurora PostgreSQL に適用する" size="lg" border />

3. 変更を反映するため、Aurora クラスタを再起動します

<Image img={reboot_rds} alt="Aurora PostgreSQL の再起動" size="lg" border />

## データベースユーザーを設定する \{#configure-database-user\}

管理者ユーザーとして Aurora PostgreSQL の writer インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 前の手順で作成したユーザーに、スキーマレベルの読み取り専用アクセス権を付与します。以下の例は `public` スキーマに対する権限を示しています。レプリケーションするテーブルを含む各スキーマについて、これらのコマンドを繰り返してください。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. ユーザーにレプリケーション権限を付与します。

   ```sql
   GRANT rds_replication TO clickpipes_user;
   ```

4. レプリケーションしたいテーブルを含む [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) を作成します。パフォーマンスのオーバーヘッドを避けるため、publication には必要なテーブルだけを含めることを強く推奨します。

   :::warning
   publication に含めるテーブルには、**主キー** が定義されているか、または **replica identity** が `FULL` に設定されている必要があります。スコープ設定のガイダンスについては、[Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   * 特定のテーブルに対する publication を作成するには:

     ```sql
     CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
     ```

   * 特定のスキーマ内のすべてのテーブルに対する publication を作成するには:

     ```sql
     CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
     ```

   `clickpipes` publication には、指定したテーブルから生成される変更イベントのセットが含まれ、後でレプリケーションストリームを取り込むために使用されます。

## ネットワークアクセスを設定する \{#configure-network-access\}

### IP ベースのアクセス制御 \{#ip-based-access-control\}

Aurora クラスタへのトラフィックを制限する場合は、[ドキュメントに記載されている静的 NAT IP](../../index.md#list-of-static-ips) を、Aurora のセキュリティグループの `インバウンドルール` に追加してください。

<Image img={security_group_in_rds_postgres} alt="Aurora PostgreSQL でセキュリティグループを確認する場所" size="lg" border />

<Image img={edit_inbound_rules} alt="上記のセキュリティグループのインバウンドルールを編集する" size="lg" border />

### AWS PrivateLink によるプライベートアクセス \{#private-access-via-aws-privatelink\}

プライベートネットワーク経由で Aurora クラスタに接続するには、AWS PrivateLink を利用できます。接続を設定するには、[ClickPipes 向け AWS PrivateLink 設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。

### Aurora 固有の考慮事項 \{#aurora-specific-considerations\}

Aurora PostgreSQL で ClickPipes を設定する際は、次の点に留意してください。

1. **接続エンドポイント**: 論理レプリケーションでは、レプリケーションスロットの作成に書き込み権限が必要であり、プライマリインスタンスに接続する必要があるため、必ず Aurora クラスタの writer エンドポイント に接続してください。

2. **フェイルオーバー時の動作**: フェイルオーバーが発生すると、Aurora は reader を自動的に昇格させて新しい writer にします。ClickPipes は切断を検出すると、writer エンドポイント への再接続を試みます。この エンドポイント は新しいプライマリインスタンスを指すようになります。

3. **Global Database**: Aurora Global Database を使用している場合は、プライマリリージョンの writer エンドポイント に接続してください。リージョン間のデータ移動は、クロスリージョンレプリケーションですでに処理されるためです。

4. **ストレージに関する考慮事項**: Aurora のストレージレイヤーは、クラスタ内のすべてのインスタンスで共有されます。そのため、標準の RDS と比べて、論理レプリケーションでより高いパフォーマンスが得られる場合があります。

### 動的なクラスタエンドポイントへの対処 \{#dealing-with-dynamic-cluster-endpoints\}

Aurora は適切なインスタンスに自動的にルーティングする安定したエンドポイントを提供しますが、安定した接続を確保するための追加の方法を以下に示します。

1. 高可用性構成では、現在のプライマリインスタンスを自動的に指す Aurora writer エンドポイント を使うようアプリケーションを設定します。

2. クロスリージョン レプリケーションを使用している場合は、レイテンシを低減し、耐障害性を向上させるため、リージョンごとに個別の ClickPipes を設定することを検討してください。

## 次のステップ \{#whats-next\}

これで、[ClickPipe を作成](../index.md)し、Aurora PostgreSQL クラスタから ClickHouse Cloud へのデータ取り込みを開始できます。
ClickPipe の作成時に必要になるため、Aurora PostgreSQL クラスタの設定時に使用した接続情報は必ず控えておいてください。