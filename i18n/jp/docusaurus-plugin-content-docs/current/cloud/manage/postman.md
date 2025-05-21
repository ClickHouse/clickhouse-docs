---
slug: /cloud/manage/postman
sidebar_label: 'Postmanによるプログラム的APIアクセス'
title: 'Postmanによるプログラム的APIアクセス'
description: 'このガイドでは、Postmanを使用してClickHouse Cloud APIをテストする方法を説明します'
---

import Image from '@theme/IdealImage';
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
Postmanアプリケーションは、ウェブブラウザ内で使用できるほか、デスクトップにダウンロードすることもできます。

### アカウントを作成する {#create-an-account}
* 無料アカウントは[https://www.postman.com](https://www.postman.com)で利用できます。

<Image img={postman1} size="md" alt="Postmanサイト" border/>

### ワークスペースを作成する {#create-a-workspace}
* ワークスペースの名前を設定し、可視性レベルを設定します。 

<Image img={postman2} size="md" alt="ワークスペースの作成" border/>

### コレクションを作成する {#create-a-collection}
* 左上のメニューの「Explore」の下で「Import」をクリックします: 

<Image img={postman3} size="md" alt="Explore > Import" border/>

* モーダルが表示されます:

<Image img={postman4} size="md" alt="API URL入力" border/>

* APIアドレス「https://api.clickhouse.cloud/v1」を入力し、「Enter」を押します:

<Image img={postman5} size="md" alt="インポート" border/>

* 「Import」ボタンをクリックして「Postman Collection」を選択します:

<Image img={postman6} size="md" alt="Collection > Import" border/>

### ClickHouse Cloud API仕様書とインターフェース {#interface-with-the-clickhouse-cloud-api-spec}
* 「ClickHouse CloudのAPI仕様」が「Collections」に表示されます（左側のナビゲーション）。

<Image img={postman7} size="md" alt="あなたのAPIをインポート" border/>

* 「ClickHouse CloudのAPI仕様」をクリックします。中央ペインから「Authorization」タブを選択します:

<Image img={postman8} size="md" alt="インポート完了" border/>

### 認証設定 {#set-authorization}
* ドロップダウンメニューを切り替えて「Basic Auth」を選択します:

<Image img={postman9} size="md" alt="基本認証" border/>

* ClickHouse Cloud APIキーを設定した際に受け取ったユーザー名とパスワードを入力します:

<Image img={postman10} size="md" alt="資格情報" border/>

### 変数を有効にする {#enable-variables}
* [変数](https://learning.postman.com/docs/sending-requests/variables/)は、Postman内で値を保存して再利用することを可能にし、APIテストをより簡単にします。
#### 組織IDとサービスIDの設定 {#set-the-organization-id-and-service-id}
* 「Collection」内で、中央ペインの「Variable」タブをクリックします（Base URLは前のAPIインポートによって設定されています）:
* `baseURL`の下の「Add new value」をクリックし、あなたの組織IDとサービスIDを入力します:

<Image img={postman11} size="md" alt="組織IDとサービスID" border/>


## ClickHouse Cloud API機能をテストする {#test-the-clickhouse-cloud-api-functionalities}
### "GET 利用可能な組織のリスト"をテストする {#test-get-list-of-available-organizations}
* 「OpenAPI spec for ClickHouse Cloud」の下で、フォルダを展開 > V1 > organizations
* 「GET 利用可能な組織のリスト」をクリックし、右の青い「Send」ボタンを押します:

<Image img={postman12} size="md" alt="組織の取得をテスト" border/>

* 返される結果は、「status": 200」であなたの組織の詳細を届けるべきです。（もし「status": 400」で組織情報がない場合は、設定が正しくありません）。

<Image img={postman13} size="md" alt="ステータス" border/>

### "GET 組織の詳細"をテストする {#test-get-organizational-details}
* `organizationid`フォルダの下で、「GET 組織の詳細」に移動します:
* 中央フレームメニューのParamsに`organizationid`が必要です。

<Image img={postman14} size="md" alt="組織の詳細を取得するテスト" border/>

* この値を中括弧`{{orgid}}`で`orgid`に編集します（この値を以前に設定した際にメニューが表示されます）:

<Image img={postman15} size="md" alt="テストを提出" border/>

* 「Save」ボタンを押した後、画面右上の青い「Send」ボタンを押します。

<Image img={postman16} size="md" alt="返される値" border/>

* 返される結果は、「status": 200」であなたの組織の詳細を届けるべきです。（もし「status": 400」で組織情報がない場合は、設定が正しくありません）。

### "GET サービスの詳細"をテストする {#test-get-service-details}
* 「GET サービスの詳細」をクリックします。
* `organizationid`と`serviceid`の値をそれぞれ`{{orgid}}`と`{{serviceid}}`に編集します。
* 「Save」を押し、右の青い「Send」ボタンを押します。

<Image img={postman17} size="md" alt="サービスのリスト" border/>

* 返される結果は、「status": 200」であなたのサービスおよびその詳細のリストを届けるべきです。（もし「status": 400」でサービス情報がない場合は、設定が正しくありません）。
