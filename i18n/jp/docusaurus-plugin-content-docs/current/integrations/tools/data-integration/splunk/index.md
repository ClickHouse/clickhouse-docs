---
sidebar_label: 'Splunk'
slug: /integrations/audit-splunk
keywords: ['clickhouse', 'Splunk', 'audit', 'cloud']
description: 'ClickHouse Cloud 監査ログを Splunk に保存します。'
title: 'ClickHouse Cloud 監査ログを Splunk に保存する'
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

[Splunk](https://www.splunk.com/) は、データ分析およびモニタリングのためのプラットフォームです。

このアドオンを使用すると、[ClickHouse Cloud の監査ログ](/cloud/security/audit-logging) を Splunk に取り込むことができます。監査ログのダウンロードには [ClickHouse Cloud API](/cloud/manage/api/api-overview) を使用します。

このアドオンにはモジュラー入力のみが含まれており、追加の UI は提供されません。



# インストール



## Splunk Enterpriseの場合 {#for-splunk-enterprise}

[Splunkbase](https://splunkbase.splunk.com/app/7709)からClickHouse Cloud Audit Add-on for Splunkをダウンロードします。

<Image
  img={splunk_001}
  size='lg'
  alt='ClickHouse Cloud Audit Add-on for Splunkのダウンロードページを表示しているSplunkbaseのウェブサイト'
  border
/>

Splunk Enterpriseで、Apps -> Manageに移動します。次に、Install app from fileをクリックします。

<Image
  img={splunk_002}
  size='lg'
  alt='Install app from fileオプションを含むアプリ管理ページを表示しているSplunk Enterpriseのインターフェース'
  border
/>

Splunkbaseからダウンロードしたアーカイブファイルを選択し、Uploadをクリックします。

<Image
  img={splunk_003}
  size='lg'
  alt='ClickHouseアドオンをアップロードするためのSplunkアプリインストールダイアログ'
  border
/>

すべて正常に完了すると、ClickHouse Audit logsアプリケーションがインストールされていることを確認できます。インストールされていない場合は、Splunkdログでエラーを確認してください。


# モジュラー入力の設定

モジュラー入力を設定するには、まず ClickHouse Cloud デプロイメントから次の情報が必要です。

- 組織 ID
- 管理者用の [API Key](/cloud/manage/openapi)



## ClickHouse Cloudから情報を取得する {#getting-information-from-clickhouse-cloud}

[ClickHouse Cloudコンソール](https://console.clickhouse.cloud/)にログインします。

組織 -> 組織の詳細に移動します。ここで組織IDをコピーできます。

<Image
  img={splunk_004}
  size='lg'
  alt='組織IDが表示された組織の詳細ページを示すClickHouse Cloudコンソール'
  border
/>

次に、左側のメニューからAPIキーに移動します。

<Image
  img={splunk_005}
  size='lg'
  alt='左側のナビゲーションメニューにあるAPIキーセクションを示すClickHouse Cloudコンソール'
  border
/>

APIキーを作成し、わかりやすい名前を付けて`Admin`権限を選択します。「APIキーを生成」をクリックします。

<Image
  img={splunk_006}
  size='lg'
  alt='Admin権限が選択されたAPIキー作成インターフェースを示すClickHouse Cloudコンソール'
  border
/>

APIキーとシークレットを安全な場所に保存します。

<Image
  img={splunk_007}
  size='lg'
  alt='保存すべき生成されたAPIキーとシークレットを示すClickHouse Cloudコンソール'
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

「New」をクリックして、データ入力の新しいインスタンスを設定します。

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
  alt='完了したClickHouseデータ入力設定を含むSplunk設定ページ'
  border
/>

入力の設定が完了しました。監査ログの閲覧を開始できます。


# 利用方法

モジュラー入力はデータを Splunk に保存します。データを表示するには、Splunk の通常の検索ビューを使用します。

<Image img={splunk_012} size="lg" alt="ClickHouse の監査ログデータを表示している Splunk の検索インターフェイス" border />
