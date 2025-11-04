---
'sidebar_label': 'Splunk'
'slug': '/integrations/audit-splunk'
'keywords':
- 'clickhouse'
- 'Splunk'
- 'audit'
- 'cloud'
'description': 'ClickHouse Cloud 監査ログをSplunkに保存します。'
'title': 'ClickHouse Cloud 監査ログをSplunkに保存する'
'doc_type': 'guide'
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
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# ClickHouse Cloudの監査ログをSplunkに保存する

<ClickHouseSupportedBadge/>

[Splunk](https://www.splunk.com/) はデータ分析とモニタリングのプラットフォームです。

このアドオンは、ユーザーが[ClickHouse Cloudの監査ログ](/cloud/security/audit-logging)をSplunkに保存することを可能にします。監査ログをダウンロードするために[ClickHouse Cloud API](/cloud/manage/api/api-overview)を使用します。

このアドオンには、モジュラー入力のみが含まれており、追加のUIは提供されていません。


# インストール

## Splunk Enterpriseの場合 {#for-splunk-enterprise}

[Splunkbase](https://splunkbase.splunk.com/app/7709)からClickHouse Cloud Audit Add-on for Splunkをダウンロードします。

<Image img={splunk_001} size="lg" alt="SplunkbaseのウェブサイトでClickHouse Cloud Audit Add-on for Splunkのダウンロードページが表示されています" border />

Splunk Enterpriseで、Apps -> Manageに移動します。次に、Install app from fileをクリックします。

<Image img={splunk_002} size="lg" alt="Splunk EnterpriseのインターフェースでApps管理ページが表示され、Install app from fileオプションが示されています" border />

Splunkbaseからダウンロードしたアーカイブファイルを選択し、Uploadをクリックします。

<Image img={splunk_003} size="lg" alt="ClickHouseのアドオンをアップロードするためのSplunkアプリインストールダイアログ" border />

すべてが正常に行けば、ClickHouse Audit logsアプリケーションがインストールされているはずです。そうでない場合は、エラーについてSplunkdログを確認してください。


# モジュラー入力の設定

モジュラー入力を設定するには、まずClickHouse Cloudのデプロイメントから情報が必要です：

- 組織ID
- 管理者[API Key](/cloud/manage/openapi)

## ClickHouse Cloudから情報を取得する {#getting-information-from-clickhouse-cloud}

[ClickHouse Cloudコンソール](https://console.clickhouse.cloud/)にログインします。

組織 -> 組織の詳細に移動します。そこから組織IDをコピーできます。

<Image img={splunk_004} size="lg" alt="ClickHouse Cloudコンソールでの組織の詳細ページが表示され、組織IDが示されています" border />

次に、左端のメニューからAPI Keysに移動します。

<Image img={splunk_005} size="lg" alt="ClickHouse Cloudコンソールでの左のナビゲーションメニューにAPI Keysセクションが表示されています" border />

API Keyを作成し、意味のある名前を付けて`Admin`権限を選択します。Generate API Keyをクリックします。

<Image img={splunk_006} size="lg" alt="ClickHouse CloudコンソールでのAPI Key作成インターフェースが表示され、Admin権限が選択されています" border />

API Keyとシークレットを安全な場所に保存します。

<Image img={splunk_007} size="lg" alt="ClickHouse Cloudコンソールでの生成されたAPI Keyと保存するべきシークレットが表示されています" border />

## Splunkでデータ入力を設定する {#configure-data-input-in-splunk}

Splunkに戻り、Settings -> Data inputsに移動します。

<Image img={splunk_008} size="lg" alt="Splunkインターフェースでの設定メニューにData inputsオプションが表示されています" border />

ClickHouse Cloud Audit Logsデータ入力を選択します。

<Image img={splunk_009} size="lg" alt="Splunkのデータ入力ページにClickHouse Cloud Audit Logsオプションが表示されています" border />

新しいデータ入力のインスタンスを設定するために「New」をクリックします。

<Image img={splunk_010} size="lg" alt="新しいClickHouse Cloud Audit Logsデータ入力設定用のSplunkインターフェース" border />

すべての情報を入力したら、Nextをクリックします。

<Image img={splunk_011} size="lg" alt="Splunkの設定ページでClickHouseデータ入力設定が完了しています" border />

入力が設定されましたので、監査ログを参照し始めることができます。


# 使用法

モジュラー入力は、データをSplunkに保存します。データを表示するには、Splunkの一般検索ビューを使用できます。

<Image img={splunk_012} size="lg" alt="ClickHouse監査ログデータを表示するSplunkの検索インターフェース" border />
