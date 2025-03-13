---
slug: /cloud/manage/postman
sidebar_label: PostmanによるプログラムインターフェースAPIアクセス
title: PostmanによるプログラムインターフェースAPIアクセス
---

import postman1 from '@site/static/images/cloud/manage/postman/postman1.png';
import postman2 from '@site/static/images/cloud/manage/postman/postman2.png';
import postman3 from '@site/static/images/cloud/manage/postman/postman3.png';
import postman4 from '@site/static/images/cloud/manage/postman/postman4.png';
import postman5 from '@site/static/images/cloud/manage/postman/postman5.png';
import postman6 from '@site/static/images/cloud/manage/postman/postman6.png';
import postman7 from '@site/static/images/cloud/manage/postman/postman7.png';
import postman8 from '@site/static/images/cloud/manage/postman/postman8.png';
import postman9 from '@site/static/images/cloud/manage/postman/postman9.png';
import postman10 from '@site/static/images/cloud/manage/postman/postman10.png';
import postman11 from '@site/static/images/cloud/manage/postman/postman11.png';
import postman12 from '@site/static/images/cloud/manage/postman/postman12.png';
import postman13 from '@site/static/images/cloud/manage/postman/postman13.png';
import postman14 from '@site/static/images/cloud/manage/postman/postman14.png';
import postman15 from '@site/static/images/cloud/manage/postman/postman15.png';
import postman16 from '@site/static/images/cloud/manage/postman/postman16.png';
import postman17 from '@site/static/images/cloud/manage/postman/postman17.png';

このガイドでは、[Postman](https://www.postman.com/product/what-is-postman/)を使用してClickHouse Cloud APIをテストする方法を説明します。  
Postmanアプリケーションは、ウェブブラウザ内で使用できるか、デスクトップにダウンロードして使用できます。

### アカウントを作成する {#create-an-account}
* 無料アカウントは[https://www.postman.com](https://www.postman.com)で利用可能です。

<img src={postman1} alt="Postmanサイト"/>

### ワークスペースを作成する {#create-a-workspace}
* ワークスペースに名前を付け、可視性レベルを設定します。

<img src={postman2} alt="ワークスペースを作成"/>

### コレクションを作成する {#create-a-collection}
* 左上のメニューの「Explore」の下にある「Import」をクリックします：

<img src={postman3} alt="Explore > Import"/>

* モーダルが表示されます：

<img src={postman4} alt="API URL入力"/>

* APIアドレス「https://api.clickhouse.cloud/v1」を入力し、'Enter'を押します：

<img src={postman5} alt="インポート"/>

* 「Import」ボタンをクリックして「Postman Collection」を選択します：

<img src={postman6} alt="Collection > Import"/>

### ClickHouse Cloud API仕様とインターフェースを取る {#interface-with-the-clickhouse-cloud-api-spec}
* 「Collections」に「ClickHouse Cloud用API仕様」が表示されます（左側ナビゲーション）。

<img src={postman7} alt="APIをインポート"/>

* 「ClickHouse Cloud用API仕様」をクリックします。中央のペインから「Authorization」タブを選択します：

<img src={postman8} alt="インポート完了"/>

### 認証を設定する {#set-authorization}
* ドロップダウンメニューを切り替えて「Basic Auth」を選択します：

<img src={postman9} alt="Basic auth"/>

* ClickHouse Cloud APIキーを設定した際に受け取ったユーザー名とパスワードを入力します：

<img src={postman10} alt="認証情報"/>

### 変数を有効にする {#enable-variables}
* [Variables](https://learning.postman.com/docs/sending-requests/variables/)を使用することで、Postmanで値の保存と再利用が可能になり、APIテストが容易になります。
#### 組織IDとサービスIDを設定する {#set-the-organization-id-and-service-id}
* 「Collection」の中で、中央のペインにある「Variable」タブをクリックします（Base URLは先にAPIをインポートした際に設定されています）：
* `baseURL`の下にあるオープンフィールド「Add new value」をクリックし、組織IDとサービスIDを代入します：

<img src={postman11} alt="組織IDとサービスID"/>


## ClickHouse Cloud API機能をテストする {#test-the-clickhouse-cloud-api-functionalities}
### 「GET利用可能な組織のリスト」をテストする {#test-get-list-of-available-organizations}
* 「ClickHouse Cloud用OpenAPI仕様」の下で、フォルダーを展開 > V1 > organizations
* 「GET利用可能な組織のリスト」をクリックして、右側の青い「Send」ボタンを押します：

<img src={postman12} alt="組織の取得をテスト"/>

* 返された結果には「status": 200とともに、あなたの組織の詳細が表示されるはずです。（「status」400が表示され、組織情報がない場合は、設定が正しくありません）。

<img src={postman13} alt="ステータス"/>

### 「GET組織の詳細」をテストする {#test-get-organizational-details}
* `organizationid`フォルダの下で、「GET組織の詳細」に移動します：
* 中央のフレームメニューのParamsに`organizationid`が必要です。

<img src={postman14} alt="組織の詳細を取得するテスト"/>

* この値を中かっこ`{{orgid}}`で編集します（この値を設定した際、メニューに値が表示されます）：

<img src={postman15} alt="テストを送信"/>

* 「Save」ボタンを押した後、画面右上の青い「Send」ボタンを押します。

<img src={postman16} alt="戻り値"/>

* 返された結果には「status": 200とともに、あなたの組織の詳細が表示されるはずです。（「status」400が表示され、組織情報がない場合は、設定が正しくありません）。

### 「GETサービスの詳細」をテストする {#test-get-service-details}
* 「GETサービスの詳細」をクリックします
* `organizationid`と`serviceid`の値をそれぞれ`{{orgid}}`と`{{serviceid}}`で編集します。
* 「Save」を押してから、右側の青い「Send」ボタンを押します。

<img src={postman17} alt="サービスのリスト"/>

* 返された結果には「status": 200とともに、サービスのリストとその詳細が表示されるはずです。（「status」400が表示され、サービス情報がない場合は、設定が正しくありません）。
