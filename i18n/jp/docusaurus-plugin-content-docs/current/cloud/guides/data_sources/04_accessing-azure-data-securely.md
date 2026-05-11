---
slug: /cloud/data-sources/secure-azure
sidebar_label: 'Azure データへのセキュアなアクセス'
title: 'ClickHouse Cloud を Azure Blob Storage に接続する'
description: '本記事では、ClickHouse Cloud のお客様が Azure データに安全にアクセスする方法を説明します'
keywords: ['ABS', 'azure blob storage']
doc_type: 'guide'
---

本ガイドでは、データのインジェスト、外部テーブル、その他の連携シナリオのために、ClickHouse Cloud を Azure Blob Storage に安全に接続する方法を説明します。

## 概要 \{#overview\}

ClickHouse Cloud は、複数の認証方式を使用して Azure Blob Storage に接続できます。
本ガイドでは、適切な方式の選択と、安全な接続設定の手順を説明します。

サポートされるユースケース:

- [azureBlobStorage テーブル関数](/sql-reference/table-functions/azureBlobStorage) を使用した Azure Blob Storage からのデータ読み取り
- [AzureBlobStorage テーブルエンジン](/engines/table-engines/integrations/azureBlobStorage) を使用した外部テーブルの作成
- ClickPipes を介したデータの取り込み
- [Azure Blob Storage へのバックアップ保存](/cloud/manage/backups/backup-restore-via-ui#azure)

:::warning 重要なネットワーク制限
ClickHouse Cloud サービスと Azure Blob Storage コンテナが同一の Azure リージョンにデプロイされている場合、IP アドレスの許可リスト登録は機能しません。

これは、Azure が同一リージョン内のトラフィックを、パブリックインターネットや NAT ゲートウェイを経由させず、内部ネットワーク (VNet + Service Endpoints) 経由でルーティングするためです。
その結果、パブリック IP アドレスに基づく Azure Storage Account のファイアウォールルールは適用されません。

IP 許可リスト登録が機能するケース:

- ClickHouse Cloud サービスがストレージアカウントとは異なる Azure リージョンにある場合
- ClickHouse Cloud サービスが AWS/GCP 上にあり、Azure Storage に接続する場合

IP 許可リスト登録が機能しないケース:

- ClickHouse Cloud サービスとストレージが同一の Azure リージョンにある場合。IP 許可リスト登録の代わりに接続文字列経由で [Shared Access Signatures (SAS)](/integrations/clickpipes/object-storage/abs/overview#authentication) を使用するか、ABS と ClickHouse を異なるリージョンにデプロイしてください。
:::

## ネットワーク設定（リージョン間のみ） \{#network-config\}

:::warning Cross-Region Only
このセクションは、ClickHouse Cloud サービスと Azure Blob Storage コンテナーが異なる Azure リージョンにある場合、または ClickHouse Cloud が AWS/GCP 上にある場合にのみ適用されます。
同一リージョンでのデプロイの場合は、代わりに SAS トークンを使用してください。
:::

<VerticalStepper headerLevel="h3">

### ClickHouse Cloud の egress IP を確認する \{#find-egress-ips\}

IP ベースのファイアウォールルールを設定するには、ClickHouse Cloud のリージョンに対応する egress IP アドレスを許可リストに登録する必要があります。

以下のコマンドを実行して、リージョンごとの egress / ingress の IP アドレス一覧を取得します。
他のリージョンを除外するために、下記の `eastus` を利用しているリージョン名に置き換えてください:

```bash
# For Azure regions
curl https://api.clickhouse.cloud/static-ips.json | jq '.azure[] | select(.region == "westus")'
```

次のような出力が表示されます:

```response
{
  "egress_ips": [
    "20.14.94.21",
    "20.150.217.205",
    "20.38.32.164"
  ],
  "ingress_ips": [
    "4.227.34.126"
  ],
  "region": "westus3"
}
```

:::tip
ClickHouse Cloud でサポートされているリージョン一覧については [Azure regions](/cloud/reference/supported-regions#azure-regions) を参照し、
使用すべき名前については [Azure regions list](https://learn.microsoft.com/en-us/azure/reliability/regions-list#azure-regions-list-1) の "Programmatic name" カラムを参照してください。
:::

詳細は ["Cloud IP addresses"](/manage/data-sources/cloud-endpoints-api) を参照してください。

### Azure Storage のファイアウォールを設定する \{#configure-firewall\}

Azure Portal で対象の Storage Account に移動します。

1. **Networking** → **Firewalls and virtual networks** に移動します
2. **Enabled from selected virtual networks and IP addresses** を選択します
3. 前の手順で取得した各 ClickHouse Cloud の egress IP アドレスを Address range フィールドに追加します

:::warning
ClickHouse Cloud のプライベート IP（10.x.x.x アドレス）は追加しないでください
:::

4. **Save** をクリックします

詳細については、[Configure Azure Storage firewalls docs](https://learn.microsoft.com/en-us/azure/storage/common/storage-network-security?tabs=azure-portal) を参照してください。

</VerticalStepper>

## ClickPipes の設定 \{#clickpipes-config\}

Azure Blob Storage と [ClickPipes](/integrations/clickpipes) を併用する場合、ClickPipes の UI で認証を設定する必要があります。
詳細については「[最初の Azure ClickPipe の作成](/integrations/clickpipes/object-storage/azure-blob-storage/get-started)」を参照してください。

:::note
ClickPipes は、アウトバウンド接続に専用の固定 IP アドレスを使用します。
IP ベースのファイアウォールルールを使用している場合、これらの IP を許可リストに登録する必要があります。

「[固定 IP の一覧](/integrations/clickpipes#list-of-static-ips)」を参照してください。
:::

:::tip
このドキュメントの冒頭で説明した「同一リージョン内での IP 許可リストに関する制限」は、ClickPipes にも適用されます。
ClickPipes サービスと Azure Blob Storage が同じリージョンにある場合は、IP 許可リストではなく SAS トークンによる認証を使用してください。
:::