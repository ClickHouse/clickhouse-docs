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

# TABLUM.IO を ClickHouse に接続する {#connecting-tablumio-to-clickhouse}

<CommunityMaintainedBadge/>

## TABLUM.IO のスタートページを開く {#open-the-tablumio-startup-page}

:::note
  Linux サーバー上で Docker を使って、TABLUM.IO の自己ホスト版をインストールできます。
:::

## 1. サービスにサインアップまたはログインする {#1-sign-up-or-sign-in-to-the-service}

  まず、メールアドレスで TABLUM.IO にサインアップするか、Google または Facebook アカウントを使ったクイックログインを行ってください。

<Image img={tablum_ch_0} size="md" border alt="TABLUM.IO ログインページ" />

## 2. Add a ClickHouse connector {#2-add-a-clickhouse-connector}

ClickHouse の接続情報を用意し、**Connector** タブに移動して、ホスト URL、ポート、ユーザー名、パスワード、データベース名、およびコネクタ名を入力します。すべての項目を入力したら、**Test connection** ボタンをクリックして接続情報を検証し、その後 **Save connector for me** をクリックしてコネクタ設定を保存します。

:::tip
正しい **HTTP** ポートを指定し、接続情報に応じて **SSL** モードを切り替えてください。
:::

:::tip
通常、TLS を使用する場合はポート 8443、TLS を使用しない場合はポート 8123 です。
:::

<Image img={tablum_ch_1} size="lg" border alt="TABLUM.IO で ClickHouse コネクタを追加する" />

## 3. コネクタを選択する {#3-select-the-connector}

**Dataset** タブに移動します。ドロップダウンメニューから、直前に作成した ClickHouse コネクタを選択します。右側のパネルには、利用可能なテーブルとスキーマの一覧が表示されます。

<Image img={tablum_ch_2} size="lg" border alt="TABLUM.IO で ClickHouse コネクタを選択する" />

## 4. SQL クエリを入力して実行する {#4-input-a-sql-query-and-run-it}

SQL Console にクエリを入力し、**Run Query** をクリックします。結果はスプレッドシート形式で表示されます。

:::tip
列名を右クリックすると、ソートやフィルタなどの操作を行えるドロップダウンメニューが開きます。
:::

<Image img={tablum_ch_3} size="lg" border alt="TABLUM.IO で SQL クエリを実行する様子" />

:::note
TABLUM.IO を使用すると、次のことができます。
* TABLUM.IO アカウント内で複数の ClickHouse コネクタを作成および利用する
* データソースに関係なく、読み込まれた任意のデータに対してクエリを実行する
* 結果を新しい ClickHouse データベースとして共有する
:::

## 詳細情報 {#learn-more}

TABLUM.IO の詳細については https://tablum.io をご覧ください。
