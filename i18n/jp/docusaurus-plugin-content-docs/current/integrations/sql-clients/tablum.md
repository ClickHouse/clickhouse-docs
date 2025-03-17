---
sidebar_label: TABLUM.IO
slug: /integrations/tablumio
description: TABLUM.IOは、ClickHouseをすぐにサポートするデータ管理SaaSです。
---

import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';


# TABLUM.IOをClickHouseに接続する

## TABLUM.IOのスタートアップページを開く {#open-the-tablumio-startup-page}

TABLUM.IOのクラウド版は[https://go.tablum.io/](https://go.tablum.io/)で利用できます。

:::note
  Linuxサーバーにdockerを使用してTABLUM.IOのセルフホステッド版をインストールできます。
:::

## 1. サービスにサインアップまたはサインインする {#1-sign-up-or-sign-in-to-the-service}

  まず、メールアドレスを使用してTABLUM.IOにサインアップするか、GoogleまたはFacebookのアカウントを使用してクイックログインを行います。

<img src={tablum_ch_0} class="image" alt="TABLUM.IO 0" />

## 2. ClickHouseコネクタを追加する {#2-add-a-clickhouse-connector}

ClickHouseの接続詳細を収集し、**コネクタ**タブに移動して、ホストURL、ポート、ユーザー名、パスワード、データベース名、コネクタの名前を入力します。これらのフィールドを完了したら、**接続テスト**ボタンをクリックして詳細を検証し、次に**私のためにコネクタを保存**をクリックして永続化します。

:::tip
正しい**HTTP**ポートを指定し、接続詳細に従って**SSL**モードを切り替えることを確認してください。
:::

:::tip
通常、TLSを使用する場合はポートが8443、使用しない場合は8123です。
:::

<img src={tablum_ch_1} class="image" alt="TABLUM.IO 01" />

## 3. コネクタを選択する {#3-select-the-connector}

**データセット**タブに移動します。ドロップダウンから最近作成したClickHouseコネクタを選択します。右側のパネルには、利用可能なテーブルとスキーマのリストが表示されます。

<img src={tablum_ch_2} class="image" alt="TABLUM.IO 02" />

## 4. SQLクエリを入力して実行する {#4-input-a-sql-query-and-run-it}

SQLコンソールにクエリを入力し、**クエリを実行**を押します。結果はスプレッドシートとして表示されます。

:::tip
カラム名を右クリックして、ソート、フィルタ、その他のアクションを含むドロップダウンメニューを開きます。
:::

<img src={tablum_ch_3} class="image" alt="TABLUM.IO 03" />

:::note
TABLUM.IOを使うことで、以下を行うことができます。
* TABLUM.IOアカウント内で複数のClickHouseコネクタを作成し、利用する。
* データソースに関係なく、ロードされたデータに対してクエリを実行する。
* 結果を新しいClickHouseデータベースとして共有する。
:::

## 詳しく知る {#learn-more}

TABLUM.IOに関する詳細情報は、https://tablum.ioで確認できます。
