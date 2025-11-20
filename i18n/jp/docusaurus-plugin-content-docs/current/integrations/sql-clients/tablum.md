---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IO は、ClickHouse を標準でサポートするデータ管理 SaaS です。'
title: 'TABLUM.IO を ClickHouse に接続する'
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


# TABLUM.IO と ClickHouse の接続

<CommunityMaintainedBadge/>



## TABLUM.IOのスタートアップページを開く {#open-the-tablumio-startup-page}

:::note
LinuxサーバーのDocker上にTABLUM.IOのセルフホスト版をインストールすることができます。
:::


## 1. サービスへのサインアップまたはサインイン {#1-sign-up-or-sign-in-to-the-service}

まず、メールアドレスを使用してTABLUM.IOにサインアップするか、GoogleまたはFacebookアカウントでクイックログインを行います。

<Image img={tablum_ch_0} size='md' border alt='TABLUM.IOログインページ' />


## 2. ClickHouseコネクタの追加 {#2-add-a-clickhouse-connector}

ClickHouseの接続情報を準備し、**Connector**タブに移動して、ホストURL、ポート、ユーザー名、パスワード、データベース名、コネクタ名を入力します。これらのフィールドの入力が完了したら、**Test connection**ボタンをクリックして接続情報を検証し、その後**Save connector for me**をクリックして設定を永続化します。

:::tip
接続情報に応じて、正しい**HTTP**ポートを指定し、**SSL**モードを適切に切り替えてください。
:::

:::tip
通常、TLS使用時はポート8443、TLS非使用時はポート8123を使用します。
:::

<Image
  img={tablum_ch_1}
  size='lg'
  border
  alt='TABLUM.IOでのClickHouseコネクタの追加'
/>


## 3. コネクタを選択する {#3-select-the-connector}

**Dataset**タブに移動します。ドロップダウンから先ほど作成したClickHouseコネクタを選択します。右側のパネルに、利用可能なテーブルとスキーマの一覧が表示されます。

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
TABLUM.IOでは次のことが可能です

- TABLUM.IOアカウント内で複数のClickHouseコネクタを作成・利用する
- データソースに関係なく、読み込まれた任意のデータに対してクエリを実行する
- 結果を新しいClickHouseデータベースとして共有する
  :::


## 詳細情報 {#learn-more}

TABLUM.IOの詳細については、https://tablum.io をご覧ください。
