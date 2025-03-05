---
sidebar_label: Splunk
slug: /integrations/audit-splunk
keywords: [clickhouse, Splunk, audit, cloud]
description: ClickHouse Cloudの監査ログをSplunkに保存します。
---

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



# ClickHouse Cloudの監査ログをSplunkに保存する

[Splunk](https://www.splunk.com/) はデータ分析と監視のプラットフォームです。

このアドオンを使用すると、[ClickHouse Cloudの監査ログ](/cloud/security/audit-logging) をSplunkに保存できます。これは、[ClickHouse Cloud API](/cloud/manage/api/api-overview) を使用して監査ログをダウンロードします。

このアドオンは、モジュラー入力のみを含み、追加のUIは提供されません。


# インストール

## Splunk Enterprise用 {#for-splunk-enterprise}

[Splunkbase](https://splunkbase.splunk.com/app/7709) からClickHouse Cloud Audit Add-on for Splunkをダウンロードします。

<img src={splunk_001} className="image" alt="Splunkbaseからダウンロード" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Splunk Enterpriseで、Apps -> Manageに移動します。次に、Install app from fileをクリックします。

<img src={splunk_002} className="image" alt="アプリの管理" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Splunkbaseからダウンロードしたアーカイブファイルを選択し、Uploadをクリックします。

<img src={splunk_003} className="image" alt="アプリの管理" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

すべてが正常に進むと、ClickHouse Audit logsアプリケーションがインストールされているはずです。そうでない場合は、Splunkdログを確認してエラーを探してください。


# モジュラー入力の設定

モジュラー入力を設定するには、まずClickHouse Cloudのデプロイメントから情報が必要です。

- 組織ID
- 管理者の[API Key](/cloud/manage/openapi)

## ClickHouse Cloudから情報を取得する {#getting-information-from-clickhouse-cloud}

[ClickHouse Cloudコンソール](https://console.clickhouse.cloud/) にログインします。

Organization -> Organization detailsに移動します。そこで、組織IDをコピーできます。

<img src={splunk_004} className="image" alt="アプリの管理" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

次に、左側のメニューからAPI Keysに移動します。

<img src={splunk_005} className="image" alt="アプリの管理" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

API Keyを作成し、意味のある名前を付けて、`Admin`権限を選択します。Generate API Keyをクリックします。

<img src={splunk_006} className="image" alt="アプリの管理" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

API Keyとシークレットを安全な場所に保存します。

<img src={splunk_007} className="image" alt="アプリの管理" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

## Splunkでのデータ入力の設定 {#configure-data-input-in-splunk}

Splunkに戻り、Settings -> Data inputsに移動します。

<img src={splunk_008} className="image" alt="アプリの管理" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

ClickHouse Cloud Audit Logsデータ入力を選択します。

<img src={splunk_009} className="image" alt="アプリの管理" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

"New"をクリックして、新しいデータ入力のインスタンスを設定します。

<img src={splunk_010} className="image" alt="アプリの管理" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

すべての情報を入力したら、Nextをクリックします。

<img src={splunk_011} className="image" alt="アプリの管理" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

入力が設定されましたので、監査ログのブラウジングを開始できます。


# 使用方法

モジュラー入力は、Splunkにデータを保存します。データを表示するには、Splunkの一般的な検索ビューを使用できます。

<img src={splunk_012} className="image" alt="アプリの管理" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>
