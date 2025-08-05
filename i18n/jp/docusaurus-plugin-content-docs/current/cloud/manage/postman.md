---
slug: '/cloud/manage/postman'
sidebar_label: 'Programmatic API access with Postman'
title: 'Programmatic API access with Postman'
description: 'This guide will help you test the ClickHouse Cloud API using Postman'
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
Postmanアプリケーションは、Webブラウザ内で使用できるほか、デスクトップにダウンロードすることもできます。

### アカウントを作成する {#create-an-account}
* 無料アカウントは[https://www.postman.com](https://www.postman.com)で利用できます。

<Image img={postman1} size="md" alt="Postman site" border/>

### ワークスペースを作成する {#create-a-workspace}
* ワークスペースに名前を付け、可視性レベルを設定します。 

<Image img={postman2} size="md" alt="Create workspace" border/>

### コレクションを作成する {#create-a-collection}
* 左上のメニューの「Explore」の下で「Import」をクリックします: 

<Image img={postman3} size="md" alt="Explore > Import" border/>

* モーダルが表示されます:

<Image img={postman4} size="md" alt="API URL entry" border/>

* APIアドレス「https://api.clickhouse.cloud/v1」を入力し、「Enter」を押します:

<Image img={postman5} size="md" alt="Import" border/>

* 「Import」ボタンをクリックして「Postman Collection」を選択します:

<Image img={postman6} size="md" alt="Collection > Import" border/>

### ClickHouse Cloud API仕様とのインターフェース {#interface-with-the-clickhouse-cloud-api-spec}
* 「ClickHouse Cloud用API仕様」が「Collections」（左ナビゲーション）内に表示されます。

<Image img={postman7} size="md" alt="Import your API" border/>

* 「ClickHouse Cloud用API仕様」をクリックします。中間ペインから「Authorization」タブを選択します:

<Image img={postman8} size="md" alt="Import complete" border/>

### 認証を設定する {#set-authorization}
* ドロップダウンメニューを切り替えて「Basic Auth」を選択します:

<Image img={postman9} size="md" alt="Basic auth" border/>

* ClickHouse Cloud APIキーをセットアップした際に受け取ったユーザー名とパスワードを入力します:

<Image img={postman10} size="md" alt="credentials" border/>

### 変数を有効にする {#enable-variables}
* [変数](https://learning.postman.com/docs/sending-requests/variables/)を使用すると、Postman内で値を保存および再利用でき、APIテストが容易になります。
#### Organization IDとService IDを設定する {#set-the-organization-id-and-service-id}
* 「Collection」内で、中央ペインの「Variable」タブをクリックします（Base URLは前のAPIインポートによって設定されているはずです）。
* `baseURL`の下の「新しい値を追加」をクリックし、あなたの組織IDとサービスIDに置き換えます:

<Image img={postman11} size="md" alt="Organization ID and Service ID" border/>

## ClickHouse Cloud API機能をテストする {#test-the-clickhouse-cloud-api-functionalities}
### 「GET 利用可能な組織のリスト」をテストする {#test-get-list-of-available-organizations}
* 「ClickHouse Cloud用OpenAPI仕様」の下で、フォルダーを展開 > V1 > organizations
* 「GET 利用可能な組織のリスト」をクリックし、右側の青い「Send」ボタンを押します:

<Image img={postman12} size="md" alt="Test retrieval of organizations" border/>

* 返された結果は、「status": 200」と共に組織の詳細を返すはずです（「status」が400で、組織情報が表示されない場合は、設定が正しくありません）。

<Image img={postman13} size="md" alt="Status" border/>

### 「GET 組織の詳細」をテストする {#test-get-organizational-details}
* `organizationid`フォルダーの下に移動し、「GET 組織の詳細」へ:
* 中央フレームのメニューのParamsに`organizationid`が必要です。

<Image img={postman14} size="md" alt="Test retrieval of organization details" border/>

* この値を波括弧内の`orgid`で編集します `{{orgid}}`（この値を設定したことで、メニューが表示され、値が表示されます）:

<Image img={postman15} size="md" alt="Submit test" border/>

* 「Save」ボタンを押した後、画面右上の青い「Send」ボタンを押します。

<Image img={postman16} size="md" alt="Return value" border/>

* 返された結果は、「status": 200」と共に組織の詳細を返すはずです（「status」が400で、組織情報が表示されない場合は、設定が正しくありません）。

### 「GET サービスの詳細」をテストする {#test-get-service-details}
* 「GET サービスの詳細」をクリックします。
* `organizationid`と`serviceid`の値をそれぞれ`{{orgid}}`と`{{serviceid}}`に編集します。
* 「Save」を押し、次に右の青い「Send」ボタンを押します。

<Image img={postman17} size="md" alt="List of services" border/>

* 返された結果は、「status": 200」と共にサービスのリストとその詳細を返すはずです（「status」が400で、サービス情報が表示されない場合は、設定が正しくありません）。
