---
sidebar_label: 'Azure Flexible Server for MySQL'
description: 'ClickPipes のソースとして Azure Flexible Server for MySQL を設定する'
slug: /integrations/clickpipes/mysql/source/azure-flexible-server-mysql
title: 'Azure Flexible Server for MySQL ソース設定ガイド'
keywords: ['azure', 'flexible server', 'mysql', 'clickpipes', 'binlog']
doc_type: 'guide'
---

import configure_network_security from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/azure-flexible-server-mysql/1_configure_network_security.png';
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Azure Flexible Server for MySQL ソース設定ガイド \{#azure-flexible-server-for-mysql-source-setup-guide\}

このステップバイステップガイドでは、[MySQL ClickPipe](../index.md) を使用して、Azure Flexible Server for MySQL を ClickHouse Cloud にデータをレプリケートするように構成する方法を説明します。このサービスでは **一度限りのインジェスト** のみがサポートされています。MySQL CDC に関する一般的な質問については、[MySQL FAQ ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md) を参照してください。

:::warning
このサービスでは、**CDC による継続的なインジェストはサポートされていません**。Azure Flexible Server for MySQL では、ClickPipes でフル機能の MySQL CDC を行うために必須となる [`binlog_row_metadata`](https://dev.mysql.com/doc/refman/en/replication-options-binary-log.html#sysvar_binlog_row_metadata) システム変数を `FULL` に設定することができません。

この機能の追加を依頼するには、[Azure フィードバックフォーラム](https://feedback.azure.com/d365community/forum/47b1e71d-ee24-ec11-b6e6-000d3a4f0da0) で機能リクエストを送信するか、[この質問](https://learn.microsoft.com/en-us/answers/questions/766047/setting-binlog-row-metadata-to-full-in-azure-db-fo) に投票するか、[Azure サポートにお問い合わせ](https://azure.microsoft.com/en-us/support/create-ticket/)ください。
:::

## データベースユーザーを構成する \\{#configure-database-user\\}

管理者権限を持つユーザーとして Azure Flexible Server for MySQL インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 用の専用ユーザーを作成します。

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. スキーマに対する権限を付与します。次の例では、`mysql` データベースに対する権限を示しています。レプリケーション対象とする各データベースおよびホストごとに、これらのコマンドを繰り返してください。

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'%';
    ```

3. 権限の変更を反映します。

   ```sql
   FLUSH PRIVILEGES;
   ```

## ネットワーク アクセスを構成する \\{#configure-network-access\\}

:::note
ClickPipes は Azure Private Link 接続をサポートしていません。Azure Flexible Server for MySQL インスタンスへのパブリック アクセスを許可していない場合は、[SSH トンネルを使用](#configure-network-security)して安全に接続できます。Azure Private Link は今後サポート予定です。
:::

次に、ClickPipes から Azure Flexible Server for MySQL インスタンスへの接続を許可する必要があります。

<Tabs groupId="network-configuration">
<TabItem value="public-ip" label="ClickPipes の IP を許可する">

1. Azure ポータルで **All resources** に移動します。Azure Flexible Server for MySQL インスタンスを選択して **Overview** ページを開きます。

2. **Settings** で **Networking** を選択します。**Public access** が有効になっていることを確認します。

3. **Firewall rules** セクションで、サービスがデプロイされているリージョンの [ClickPipes 静的 IP アドレス一覧](../../index.md#list-of-static-ips) を入力します。

   <Image img={configure_network_security} alt="IP 許可リストを使用してパブリック アクセス用のネットワークを構成する" size="lg" border/>

4. **Save** をクリックして、ネットワーク セキュリティ構成の変更を保存します。

</TabItem>
<TabItem value="ssh-tunnel" label="SSH トンネルを使用する">

Azure Flexible Server for MySQL インスタンスへのパブリック アクセスを許可していない場合は、まず SSH バスティオン ホストをセットアップして、安全なトンネル経由で接続する必要があります。Azure で SSH バスティオン ホストをセットアップするには、次の手順に従います。

1. [公式ドキュメント](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu)に従って Azure Virtual Machine (VM) を作成して起動します。
   - VM が Azure Flexible Server for MySQL インスタンスと同じ Virtual Network (VNet) 内、または接続性のあるピアリング済み VNet 内にあることを確認します。
   - VM に [静的パブリック IP アドレス](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/virtual-network-public-ip-address) が割り当てられていることを確認します。ClickPipes を SSH バスティオン ホストに接続する際に、この IP アドレスを使用します。

2. SSH バスティオン ホストの Network Security Group (NSG) ルールを更新し、サービスがデプロイされているリージョンの [ClickPipes 静的 IP アドレス一覧](../../index.md#list-of-static-ips) からのトラフィックを許可します。

3. Azure Flexible Server for MySQL インスタンスのファイアウォール ルールを更新し、SSH バスティオン ホストの [プライベート IP アドレス](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/private-ip-addresses) からのトラフィックを許可します。

</TabItem>
</Tabs>

## 次のステップ \\{#whats-next\\}

これで、[ClickPipe を作成](../index.md)し、Azure Flexible Server for MySQL インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。インスタンスをセットアップする際に使用した接続情報は、ClickPipe を作成する際にも必要になるため、必ず控えておいてください。