---
sidebar_label: 'Splunk'
slug: /integrations/audit-splunk
keywords: ['clickhouse', 'Splunk', 'audit', 'cloud']
description: 'ClickHouse Cloud の監査ログを Splunk に保存します。'
title: 'ClickHouse Cloud の監査ログを Splunk に保存する'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import splunk_001 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_001.png';
import splunk_002 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_002.png';
import splunk_003 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_003.png';
import splunk_004 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_004.png';
import splunk_005 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_005.png';
import splunk_006 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_006.png';
import splunk_007 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_007.png';
import splunk_008 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_008.png';
import splunk_009 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_009.png';
import splunk_010 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_010.png';
import splunk_011 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_011.png';
import splunk_012 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_012.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# ClickHouse Cloud の監査ログを Splunk に保存する

<PartnerBadge/>

[Splunk](https://www.splunk.com/) は、データ分析および監視のためのプラットフォームです。

このアドオンを使用すると、[ClickHouse Cloud の監査ログ](/cloud/security/audit-logging) を Splunk に保存できます。監査ログのダウンロードには [ClickHouse Cloud API](/cloud/manage/api/api-overview) を使用します。

このアドオンにはモジュラー入力のみが含まれており、追加の UI は提供されません。



# インストール



## Splunk Enterprise の場合 {#for-splunk-enterprise}

[Splunkbase](https://splunkbase.splunk.com/app/7709) から ClickHouse Cloud Audit Add-on for Splunk をダウンロードします。

<Image
  img={splunk_001}
  size='lg'
  alt='ClickHouse Cloud Audit Add-on for Splunk のダウンロードページを表示している Splunkbase ウェブサイト'
  border
/>

Splunk Enterprise で、Apps -> Manage に移動します。次に、Install app from file をクリックします。

<Image
  img={splunk_002}
  size='lg'
  alt='Install app from file オプションが表示されたアプリ管理ページの Splunk Enterprise インターフェース'
  border
/>

Splunkbase からダウンロードしたアーカイブファイルを選択し、Upload をクリックします。

<Image
  img={splunk_003}
  size='lg'
  alt='ClickHouse アドオンをアップロードするための Splunk アプリインストールダイアログ'
  border
/>

すべて正常に完了すると、ClickHouse Audit logs アプリケーションがインストールされていることを確認できます。インストールされていない場合は、Splunkd ログでエラーを確認してください。


# モジュラー入力の設定

モジュラー入力を構成するには、まず ClickHouse Cloud デプロイメントから次の情報を取得する必要があります。

- 組織 ID
- 管理者用の [API キー](/cloud/manage/openapi)



## ClickHouse Cloudから情報を取得する {#getting-information-from-clickhouse-cloud}

[ClickHouse Cloudコンソール](https://console.clickhouse.cloud/)にログインします。

Organization -> Organization detailsに移動します。ここでOrganization IDをコピーできます。

<Image
  img={splunk_004}
  size='lg'
  alt='Organization IDが表示されているClickHouse CloudコンソールのOrganization detailsページ'
  border
/>

次に、左側のメニューからAPI Keysに移動します。

<Image
  img={splunk_005}
  size='lg'
  alt='左側のナビゲーションメニューにAPI Keysセクションが表示されているClickHouse Cloudコンソール'
  border
/>

API Keyを作成し、わかりやすい名前を付けて`Admin`権限を選択します。Generate API Keyをクリックします。

<Image
  img={splunk_006}
  size='lg'
  alt='Admin権限が選択されているAPI Key作成インターフェースを表示したClickHouse Cloudコンソール'
  border
/>

API Keyとシークレットを安全な場所に保存します。

<Image
  img={splunk_007}
  size='lg'
  alt='保存すべき生成されたAPI Keyとシークレットを表示しているClickHouse Cloudコンソール'
  border
/>


## Splunkでデータ入力を設定する {#configure-data-input-in-splunk}

Splunkに戻り、Settings -> Data inputsに移動します。

<Image
  img={splunk_008}
  size='lg'
  alt='Data inputsオプションを含むSettingsメニューを表示するSplunkインターフェース'
  border
/>

ClickHouse Cloud Audit Logsデータ入力を選択します。

<Image
  img={splunk_009}
  size='lg'
  alt='ClickHouse Cloud Audit Logsオプションを表示するSplunk Data inputsページ'
  border
/>

「New」をクリックして、新しいデータ入力インスタンスを設定します。

<Image
  img={splunk_010}
  size='lg'
  alt='新しいClickHouse Cloud Audit Logsデータ入力を設定するためのSplunkインターフェース'
  border
/>

すべての情報を入力したら、「Next」をクリックします。

<Image
  img={splunk_011}
  size='lg'
  alt='ClickHouseデータ入力設定が完了したSplunk設定ページ'
  border
/>

入力の設定が完了しました。監査ログの閲覧を開始できます。


# 使用方法

モジュール式入力はデータを Splunk に保存します。データを表示するには、Splunk の標準の検索ビューを使用できます。

<Image img={splunk_012} size="lg" alt="ClickHouse の監査ログデータを表示している Splunk の検索インターフェイス" border />
