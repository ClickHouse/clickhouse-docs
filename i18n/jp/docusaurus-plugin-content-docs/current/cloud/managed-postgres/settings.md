---
slug: /cloud/managed-postgres/settings
sidebar_label: '設定'
title: '設定'
description: 'PostgreSQL および PgBouncer のパラメータを構成し、Managed Postgres インスタンスの設定を管理する'
keywords: ['postgres 設定', 'postgresql 設定', 'pgbouncer', 'IP フィルター']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import postgresParameters from '@site/static/images/managed-postgres/postgres-parameters.png';
import serviceActions from '@site/static/images/managed-postgres/service-actions.png';
import ipFilters from '@site/static/images/managed-postgres/ip-filters.png';

<PrivatePreviewBadge />

サイドバーの **Settings** タブから、Managed Postgres インスタンスの構成パラメータを変更したり、インスタンス設定を管理したりできます。


## 構成パラメータの変更 \{#changing-configuration\}

<Image img={postgresParameters} alt="Postgres パラメータ構成" size="md" border/>

パラメータを変更するには、**Edit parameters** ボタンをクリックします。変更したいパラメータを選択し、それぞれの値を必要に応じて更新します。変更内容に問題がなければ、**Save Changes** ボタンをクリックします。

構成パラメータに対して行ったすべての変更は、通常 1 分以内にインスタンスに反映されます。パラメータによっては、反映にデータベースの再起動が必要なものもあります。これらの変更は、次回の再起動後に適用されます。再起動は、**Service actions** ツールバーから手動で実行できます。

## サービスアクションとスケーリング \{#service-actions\}

<Image img={serviceActions} alt="サービスアクションとスケーリング" size="md" border/>

**Service actions** ツールバーを使用して、Managed Postgres インスタンスを管理できます。

- **Reset password**: スーパーユーザーのパスワードを更新します（インスタンスが `Running` の場合のみ）
- **Restart**: データベースインスタンスを再起動します（インスタンスが `Running` の場合のみ）
- **Delete**: インスタンスを削除します

**Scaling** セクションでは、プライマリおよびスタンバイのインスタンスタイプを変更して、コンピュートリソースおよびストレージ容量を増減できます。内部的には、新しいインスタンスがプロビジョニングされ、現在のプライマリに追いついた後に引き継ぎます。フェイルオーバープロセス中は、すべての現在の接続が中断され、短時間のダウンタイムが発生します。

:::tip
安全性の観点から、現在使用中のストレージ容量に近いストレージサイズのインスタンスタイプには切り替えられない場合があります。問題を避けるため、常に現在の使用容量に対して余裕のあるインスタンスタイプを選択してください。
:::

## IP フィルター \{#ip-filters\}

IP フィルターは、Managed Postgres インスタンスへの接続を許可する送信元 IP アドレスを制御します。

<Image img={ipFilters} alt="IP アクセスリストの設定" size="md" border/>

IP フィルターを設定するには、次の手順に従います:

1. **Settings** タブに移動します
2. **IP Filters** の下にある **Edit** をクリックします
3. 接続を許可する IP アドレスまたは CIDR 範囲を追加します
4. 変更を適用するには **Save** をクリックします

個々の IP アドレスを指定することも、CIDR 表記を使用して IP 範囲を指定することもできます (例: `192.168.1.0/24`)。インスタンスをインターネットに対して完全に開放または遮断するためのショートカットとして、**Anywhere** または **Nowhere** を選択することもできます。

:::note
IP フィルターが設定されていない場合、すべての IP アドレスからの接続が許可されます。本番ワークロードでは、既知の IP アドレスのみにアクセスを制限することを推奨します。
:::