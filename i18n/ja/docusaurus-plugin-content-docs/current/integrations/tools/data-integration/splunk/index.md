---
sidebar_label: Splunk
slug: /integrations/audit-splunk
keywords: [clickhouse, Splunk, audit, cloud]
description: ClickHouse Cloudの監査ログをSplunkに保存します。
---
# ClickHouse Cloudの監査ログをSplunkに保存する

[Splunk](https://www.splunk.com/)は、データ分析および監視プラットフォームです。 

このアドオンは、ユーザーが[ClickHouse Cloudの監査ログ](/cloud/security/audit-logging)をSplunkに保存できるようにします。監査ログをダウンロードするために[ClickHouse Cloud API](/cloud/manage/api/api-overview)を使用します。  

このアドオンにはモジュラ―入力のみが含まれており、追加のUIは提供されていません。

# インストール

## Splunk Enterprise向け {#for-splunk-enterprise}

[Splunkbase](https://splunkbase.splunk.com/app/7709)からClickHouse Cloud監査アドオンをダウンロードします。 

<img src={require('./images/splunk_001.png').default} className="image" alt="Download from Splunkbase" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Splunk Enterpriseで、Apps -> Manageに移動します。次に、Install app from fileをクリックします。

<img src={require('./images/splunk_002.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Splunkbaseからダウンロードしたアーカイブファイルを選択し、Uploadをクリックします。 

<img src={require('./images/splunk_003.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

すべてが正常にいけば、ClickHouse監査ログアプリケーションがインストールされたことが表示されます。そうでない場合は、Splunkdログでエラーを確認してください。

# モジュラ―入力の設定

モジュラ―入力を構成するには、最初にClickHouse Cloudデプロイメントから情報が必要です：

- 組織ID
- 管理者[APIキー](/cloud/manage/openapi)

## ClickHouse Cloudから情報を取得する {#getting-information-from-clickhouse-cloud}

[ClickHouse Cloudコンソール](https://console.clickhouse.cloud/)にログインします。

Organization -> Organization detailsに移動します。そこで組織IDをコピーできます。

<img src={require('./images/splunk_004.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

次に、左端のメニューからAPI Keysに移動します。

<img src={require('./images/splunk_005.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

APIキーを作成し、意味のある名前を付け、`Admin`権限を選択します。Generate API Keyをクリックします。

<img src={require('./images/splunk_006.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

APIキーとシークレットを安全な場所に保存します。  

<img src={require('./images/splunk_007.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

## Splunkでのデータ入力の設定 {#configure-data-input-in-splunk}

Splunkに戻り、Settings -> Data inputsに移動します。

<img src={require('./images/splunk_008.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

ClickHouse Cloud監査ログデータ入力を選択します。

<img src={require('./images/splunk_009.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

"New"をクリックしてデータ入力の新しいインスタンスを構成します。

<img src={require('./images/splunk_010.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

すべての情報を入力したら、次へ進むためにNextをクリックします。

<img src={require('./images/splunk_011.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

入力が設定されると、監査ログを閲覧できるようになります。

# 使用法

モジュラ―入力は、データをSplunkに保存します。データを見るには、Splunkの一般的な検索ビューを使用できます。

<img src={require('./images/splunk_012.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>
