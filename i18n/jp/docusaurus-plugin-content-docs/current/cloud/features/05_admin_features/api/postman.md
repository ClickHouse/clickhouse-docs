---
'slug': '/cloud/manage/postman'
'sidebar_label': 'Postmanを使用したプログラムによるAPIアクセス'
'title': 'Postmanを使用したプログラムによるAPIアクセス'
'description': 'このガイドでは、Postmanを使用してClickHouse Cloud APIをテストする方法を説明します。'
'doc_type': 'guide'
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

このガイドは、[Postman](https://www.postman.com/product/what-is-postman/)を使用してClickHouse Cloud APIをテストするのに役立ちます。 
Postmanアプリケーションは、ウェブブラウザ内で使用可能で、デスクトップにダウンロードすることもできます。

### アカウントを作成する {#create-an-account}

* 無料アカウントは[https://www.postman.com](https://www.postman.com)で利用可能です。

<Image img={postman1} size="md" alt="Postman site" border/>

### ワークスペースを作成する {#create-a-workspace}

* ワークスペースに名前を付けて、可視性のレベルを設定します。 

<Image img={postman2} size="md" alt="Create workspace" border/>

### コレクションを作成する {#create-a-collection}

* 左上のメニューの「Explore」の下で「Import」をクリックします： 

<Image img={postman3} size="md" alt="Explore > Import" border/>

* モーダルが表示されます：

<Image img={postman4} size="md" alt="API URL entry" border/>

* APIアドレスを入力します: "https://api.clickhouse.cloud/v1" を入力し、'Enter'を押します：

<Image img={postman5} size="md" alt="Import" border/>

* 「Import」ボタンをクリックして「Postman Collection」を選択します：

<Image img={postman6} size="md" alt="Collection > Import" border/>

### ClickHouse Cloud API仕様とのインターフェース {#interface-with-the-clickhouse-cloud-api-spec}
* 「ClickHouse CloudのAPI仕様」が「Collections」（左ナビゲーション）内に表示されます。

<Image img={postman7} size="md" alt="Import your API" border/>

* 「ClickHouse CloudのAPI仕様」をクリックします。中央のペインで「Authorization」タブを選択します：

<Image img={postman8} size="md" alt="Import complete" border/>

### 認証を設定する {#set-authorization}
* ドロップダウンメニューを切り替えて「Basic Auth」を選択します：

<Image img={postman9} size="md" alt="Basic auth" border/>

* ClickHouse Cloud APIキーを設定したときに受け取ったユーザー名とパスワードを入力します：

<Image img={postman10} size="md" alt="credentials" border/>

### 変数を有効にする {#enable-variables}

* [変数](https://learning.postman.com/docs/sending-requests/variables/)を使うことで、Postman内で値を保存し再利用でき、APIテストが簡単になります。

#### 組織IDとサービスIDを設定する {#set-the-organization-id-and-service-id}

* 「Collection」の中で、中央のペインの「Variable」タブをクリックします（Base URLは先ほどのAPIインポートで設定されています）：
* `baseURL`の下で、「Add new value」と表示されたフィールドをクリックし、組織IDとサービスIDを置き換えます：

<Image img={postman11} size="md" alt="Organization ID and Service ID" border/>

## ClickHouse Cloud API機能のテスト {#test-the-clickhouse-cloud-api-functionalities}

### 「GET 利用可能な組織のリストを取得」をテストする {#test-get-list-of-available-organizations}

* 「ClickHouse CloudのOpenAPI仕様」の下で、フォルダ > V1 > organizationsを展開します。
* 「GET 利用可能な組織のリストを取得」をクリックし、右側の青い「Send」ボタンを押します：

<Image img={postman12} size="md" alt="Test retrieval of organizations" border/>

* 返される結果には、あなたの組織の詳細が「status": 200」と共に表示されるはずです。（「status」が400で、組織情報が無い場合は、設定が正しくありません）。

<Image img={postman13} size="md" alt="Status" border/>

### 「GET 組織の詳細を取得」をテストする {#test-get-organizational-details}

* `organizationid`フォルダ内で、「GET 組織の詳細を取得」に移動します：
* 中央のフレームメニューのParamsに`organizationid`が必要です。

<Image img={postman14} size="md" alt="Test retrieval of organization details" border/>

* この値を中括弧`{{orgid}}`に置き換えます（以前にこの値を設定したため、値が入ったメニューが表示されます）：

<Image img={postman15} size="md" alt="Submit test" border/>

* 「Save」ボタンを押した後、画面右上の青い「Send」ボタンを押します。

<Image img={postman16} size="md" alt="Return value" border/>

* 返される結果には、あなたの組織の詳細が「status": 200」とともに返されるはずです。（「status」が400で、組織情報が無い場合は、設定が正しくありません）。

### 「GET サービスの詳細を取得」をテストする {#test-get-service-details}

* 「GET サービスの詳細を取得」をクリックします。
* `organizationid`および`serviceid`の値を`{{orgid}}`および`{{serviceid}}`にそれぞれ編集します。
* 「Save」を押し、次に右側の青い「Send」ボタンを押します。

<Image img={postman17} size="md" alt="List of services" border/>

* 返される結果には、あなたのサービスとその詳細のリストが「status": 200」とともに表示されるはずです。（「status」が400で、サービスの情報が無い場合は、設定が正しくありません）。
