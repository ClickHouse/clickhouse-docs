---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IO は、ClickHouse を標準でサポートするデータ管理 SaaS です。'
title: 'TABLUM.IO と ClickHouse を接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
keywords: ['tablum', 'sql client', 'database tool', 'query tool', 'desktop app']
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# TABLUM.IO を ClickHouse に接続する

<CommunityMaintainedBadge/>



## TABLUM.IO スタートアップページを開く {#open-the-tablumio-startup-page}

:::note
TABLUM.IO のセルフホスト版を Docker 経由で Linux サーバーにインストールすることができます。
:::


## 1. サービスへのサインアップまたはサインイン {#1-sign-up-or-sign-in-to-the-service}

まず、メールアドレスを使用してTABLUM.IOにサインアップするか、GoogleまたはFacebookアカウントでクイックログインしてください。

<Image img={tablum_ch_0} size='md' border alt='TABLUM.IOログインページ' />


## 2. ClickHouseコネクタを追加する {#2-add-a-clickhouse-connector}

ClickHouseの接続情報を収集し、**Connector**タブに移動して、ホストURL、ポート、ユーザー名、パスワード、データベース名、コネクタ名を入力します。これらのフィールドを入力したら、**Test connection**ボタンをクリックして詳細を検証し、その後**Save connector for me**をクリックして保存します。

:::tip
接続情報に応じて、正しい**HTTP**ポートを指定し、**SSL**モードを適切に切り替えてください。
:::

:::tip
通常、TLSを使用する場合はポート8443、TLSを使用しない場合はポート8123を使用します。
:::

<Image
  img={tablum_ch_1}
  size='lg'
  border
  alt='TABLUM.IOでClickHouseコネクタを追加'
/>


## 3. コネクタを選択する {#3-select-the-connector}

**Dataset**タブに移動します。ドロップダウンから、先ほど作成したClickHouseコネクタを選択します。右側のパネルに、利用可能なテーブルとスキーマの一覧が表示されます。

<Image
  img={tablum_ch_2}
  size='lg'
  border
  alt='TABLUM.IOでClickHouseコネクタを選択'
/>


## 4. SQLクエリを入力して実行する {#4-input-a-sql-query-and-run-it}

SQLコンソールにクエリを入力し、**Run Query**を押します。結果はスプレッドシート形式で表示されます。

:::tip
列名を右クリックすると、並べ替え、フィルタ、その他の操作を含むドロップダウンメニューが開きます。
:::

<Image
  img={tablum_ch_3}
  size='lg'
  border
  alt='TABLUM.IOでのSQLクエリの実行'
/>

:::note
TABLUM.IOでは以下が可能です

- TABLUM.IOアカウント内で複数のClickHouseコネクタを作成・利用
- データソースに関係なく、読み込まれた任意のデータに対してクエリを実行
- 結果を新しいClickHouseデータベースとして共有
  :::


## 詳細情報 {#learn-more}

TABLUM.IOの詳細については、https://tablum.io をご覧ください。
