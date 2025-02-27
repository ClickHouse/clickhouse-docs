---
slug: /cloud/manage/postman
sidebar_label: Postmanによるプログラム的APIアクセス
title: Postmanによるプログラム的APIアクセス
---

このガイドでは、[Postman](https://www.postman.com/product/what-is-postman/)を使用してClickHouse Cloud APIをテストする方法を説明します。  
Postmanアプリケーションはウェブブラウザ内で利用でき、デスクトップにダウンロードすることも可能です。

### アカウントの作成 {#create-an-account}
* 無料アカウントは[https://www.postman.com](https://www.postman.com)で利用可能です。
![Postmanサイト](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman1.png)

### ワークスペースの作成 {#create-a-workspace}
* ワークスペースに名前を付け、可視性レベルを設定します。 
![ワークスペースの作成](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman2.png)

### コレクションの作成 {#create-a-collection}
* 左上のメニューの「Explore」の下にある「Import」をクリックします： 
![Explore > Import](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman3.png)

* モーダルが表示されます：
![API URLの入力](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman4.png)

* APIアドレス「https://api.clickhouse.cloud/v1」を入力し、'Enter'を押します：
![インポート](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman5.png)

* 「Import」ボタンをクリックして「Postman Collection」を選択します：
![コレクション > インポート](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman6.png)

### ClickHouse Cloud API仕様とのインターフェース {#interface-with-the-clickhouse-cloud-api-spec}
* 「ClickHouse Cloud用API仕様」が「コレクション」に表示されます（左ナビゲーション）。
![APIをインポート](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman7.png)

* 「ClickHouse Cloud用API仕様」をクリックします。中央のペインで「Authorization」タブを選択します：
![インポート完了](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman8.png)

### 認証の設定 {#set-authorization}
* ドロップダウンメニューを切り替えて「Basic Auth」を選択します：
![Basic Auth](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman9.png)

* ClickHouse Cloud APIキーを設定したときに受け取ったユーザー名とパスワードを入力します：
![資格情報](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman10.png)

### 変数の有効化 {#enable-variables}
* [変数](https://learning.postman.com/docs/sending-requests/variables/)を使用すると、Postman内で値を保存し再利用でき、APIテストが簡単になります。
#### 組織IDとサービスIDの設定 {#set-the-organization-id-and-service-id}
* 「コレクション」の中で中央のペインの「Variable」タブをクリックします（Base URLは以前のAPIインポートによって設定されているはずです）：
* `baseURL`の下にある「Add new value」という開いているフィールドをクリックし、組織IDとサービスIDを置き換えます：
![組織IDとサービスID](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman11.png)

## ClickHouse Cloud API機能のテスト {#test-the-clickhouse-cloud-api-functionalities}
### 「利用可能な組織のリストを取得」テスト {#test-get-list-of-available-organizations}
* 「ClickHouse Cloud用OpenAPI仕様」の下で、フォルダーを展開 > V1 > organizations
* 「利用可能な組織のリストを取得」をクリックし、右側の青い「Send」ボタンを押します：
![組織の取得テスト](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman12.png)
* 返された結果は、「status": 200」という組織の詳細を提供します。（「status」が400で組織情報がない場合、設定が正しくありません。）
![ステータス](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman13.png)

### 「組織情報の取得」テスト {#test-get-organizational-details}
* `organizationid`フォルダーの下で、「組織情報の取得」に移動します：
* 中央のフレームメニューのParamsで`organizationid`が必要です。
![組織情報取得のテスト](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman14.png)
* この値を中括弧`{{orgid}}`で編集します（以前にこの値を設定すると、値のあるメニューが表示されます）：
![テストを送信](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman15.png)
* 「Save」ボタンを押した後、画面右上の青い「Send」ボタンを押します。
![戻り値](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman16.png)
* 返された結果は、「status": 200」という組織の詳細を提供します。（「status」が400で組織情報がない場合、設定が正しくありません。）

### 「サービス情報の取得」テスト {#test-get-service-details}
* 「サービス情報の取得」をクリックします。
* `organizationid`と`serviceid`の値をそれぞれ`{{orgid}}`と`{{serviceid}}`に編集します。
* 「Save」を押し、その後右側の青い「Send」ボタンを押します。
![サービスのリスト](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/images/postman/postman17.png)
* 返された結果は、「status": 200」というサービスの詳細とそのリストを提供します。（「status」が400でサービス情報がない場合、設定が正しくありません。）
