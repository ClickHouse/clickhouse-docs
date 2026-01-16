---
sidebar_label: 'AlloyDB Postgres'
description: 'ClickPipes のソースとして AlloyDB Postgres インスタンスをセットアップする'
slug: /integrations/clickpipes/postgres/source/alloydb
title: 'AlloyDB Postgres ソース設定ガイド'
doc_type: 'guide'
---

import edit_instance from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/1_edit_instance.png';
import set_flags from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/2_set_flags.png';
import verify_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/3_verify_logical_replication.png';
import configure_network_security from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/4_configure_network_security.png';
import configure_network_security2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/5_configure_network_security.png';
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# AlloyDB Postgres ソース設定ガイド \{#alloydb-postgres-source-setup-guide\}

## サポートされているバージョン \{#supported-versions\}

ClickPipes を使用して AlloyDB インスタンスから ClickHouse Cloud へデータをレプリケーションするには、インスタンスを **論理レプリケーション (logical replication)** 用に構成しておく必要があります。この機能は **AlloyDB バージョン 14 以降** でサポートされています。

## 論理レプリケーションを有効にする \{#enable-logical-replication\}

AlloyDB インスタンスで論理レプリケーションが有効になっているかを確認するには、プライマリ インスタンスで次のクエリを実行します。

```sql
SHOW  wal_level;
```

結果が `logical` の場合、論理レプリケーションはすでに有効化されているため、[次のステップ](#create-a-clickpipes-user-and-manage-replication-permissions) に進むことができます。結果が `replica` の場合は、プライマリインスタンスで [`alloydb.enable_pglogical`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.enable_pglogical) フラグと [`alloydb.logical_decoding`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.logical_decoding) フラグを `on` に設定する必要があります。

:::warning
[AlloyDB flags のドキュメント](https://cloud.google.com/alloydb/docs/reference/alloydb-flags) に記載されているとおり、論理レプリケーションを有効にするフラグを変更するには、プライマリインスタンスの再起動が必要です。
:::

これらのフラグを有効にするには、次の手順を実行します。

1. Google Cloud Console で AlloyDB の [Clusters](https://console.cloud.google.com/alloydb/clusters) ページに移動します。プライマリインスタンスの **Actions** メニューから **Edit** をクリックします。

   <Image img={edit_instance} alt="プライマリインスタンスの設定を編集" size="lg" border />

2. **Advanced configuration options** までスクロールし、そのセクションを展開します。**Flags** で **Add a database flag** をクリックします。

   * [`allowdb.enable_pglogical`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.enable_pglogical) フラグを追加し、その値を `on` に設定します
   * [`alloydb.logical_decoding`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.logical_decoding) フラグを追加し、その値を `on` に設定します

   <Image img={set_flags} alt="allowdb.enable_pglogical と alloydb.logical_decoding フラグを on に設定" size="lg" border />

3. **Update instance** をクリックして設定変更を保存します。この操作により、**プライマリインスタンスの再起動が行われる** 点に注意してください。

4. インスタンスのステータスが `Updating` から `Ready` に変わったら、プライマリインスタンスに対して次のクエリを実行し、論理レプリケーションが有効になっていることを確認します。

   ```sql
   SHOW  wal_level;
   ```

   結果は `logical` になっている必要があります。

   <Image img={verify_logical_replication} alt="論理レプリケーションが有効になっていることを確認" size="lg" border />


## ClickPipes ユーザーを作成し、レプリケーション権限を管理する \{#create-a-clickpipes-user-and-manage-replication-permissions\}

管理者ユーザーとして AlloyDB インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 前の手順で作成したユーザーに対し、スキーマ単位の読み取り専用アクセス権を付与します。次の例は、`public` スキーマに対する権限を示しています。レプリケーションしたいテーブルを含む各スキーマについて、このコマンド群を繰り返してください:
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. ユーザーにレプリケーション権限を付与します:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. レプリケーションしたいテーブルを含む [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) を作成します。パフォーマンスのオーバーヘッドを抑えるため、publication には必要なテーブルのみを含めることを強く推奨します。

   :::warning
   publication に含まれるいずれのテーブルも、**primary key** が定義されているか、**replica identity** が `FULL` に設定されている必要があります。スコープの決め方については、[Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブルに対する publication を作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定のスキーマ内のすべてのテーブルに対する publication を作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication は、指定したテーブルから生成される変更イベントのセットを保持し、後でレプリケーションストリームを取り込む際に使用されます。

## ネットワークアクセスを構成する \{#configure-network-access\}

:::note
ClickPipes は Private Service Connect (PSC) 接続をサポートしていません。AlloyDB インスタンスへのパブリックアクセスを許可しない場合は、安全に接続するために[SSH トンネルを使用](#configure-network-access)できます。PSC は今後サポートされる予定です。
:::

次に、ClickPipes から AlloyDB インスタンスへの接続を許可する必要があります。

<Tabs groupId="network-configuration">
<TabItem value="public-ip" label="ClickPipes の IP を許可する">

1. Google Cloud Console で AlloyDB の [Clusters](https://console.cloud.google.com/alloydb/clusters) ページに移動します。プライマリインスタンスを選択して **Overview** ページを開きます。

2. **Instances in your cluster** までスクロールし、**Edit primary** をクリックします。

3. **Enable Public IP** チェックボックスをオンにして、パブリックインターネット経由でインスタンスへの接続を許可します。**Authorized external networks** で、サービスをデプロイしているリージョンに対応した [ClickPipes の 静的 IP アドレス一覧](../../index.md#list-of-static-ips) を入力します。

   <Image img={configure_network_security} alt="IP 許可リストを使用してパブリックアクセス用のネットワークを構成する" size="lg" border/>

   :::note
   AlloyDB では、アドレスは [CIDR 表記](https://cloud.google.com/alloydb/docs/connection-overview#public-ip)で指定する必要があります。提供されている ClickPipes の静的 IP アドレス一覧は、各アドレスの末尾に `/32` を付与することで、この表記に変換できます。
   :::

4. **Network Security** で、**Require SSL Encryption (default)** を選択します（未選択の場合）。

5. **Update instance** をクリックして、ネットワークセキュリティ構成の変更を保存します。

</TabItem>
<TabItem value="ssh-tunnel" label="SSH トンネルを使用する">

AlloyDB インスタンスへのパブリックアクセスを許可しない場合は、まず SSH バスティオンホストをセットアップして、接続を安全にトンネリングする必要があります。Google Cloud Platform 上で SSH バスティオンホストをセットアップするには、次の手順を実行します。

1. [公式ドキュメント](https://cloud.google.com/compute/docs/instances/create-start-instance)に従って、Google Compute Engine (GCE) インスタンスを作成して起動します。
   - GCE インスタンスが AlloyDB インスタンスと同じ Virtual Private Network (VPC) 内にあることを確認します。
   - GCE インスタンスに [静的パブリック IP アドレス](https://cloud.google.com/compute/docs/ip-addresses/reserve-static-external-ip-address) が割り当てられていることを確認します。ClickPipes を SSH バスティオンホストに接続する際に、この IP アドレスを使用します。

2. SSH バスティオンホストのファイアウォールルールを更新し、サービスをデプロイしているリージョンに対応する [ClickPipes の静的 IP アドレス一覧](../../index.md#list-of-static-ips) からのトラフィックを許可します。

3. AlloyDB のファイアウォールルールを更新し、SSH バスティオンホストからのトラフィックを許可します。

</TabItem>
</Tabs>

## 次のステップ \{#whats-next\}

これで [ClickPipe を作成](../index.md) し、Postgres インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。
Postgres インスタンスのセットアップ時に使用した接続情報は、ClickPipe 作成時にも必要になるため、必ずメモしておいてください。