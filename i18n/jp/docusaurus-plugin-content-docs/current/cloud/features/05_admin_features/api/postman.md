---
slug: /cloud/manage/postman
sidebar_label: 'Postman を使用したプログラムからの API アクセス'
title: 'Postman を使用したプログラムからの API アクセス'
description: 'このガイドでは、Postman を使用して ClickHouse Cloud の API をテストする方法を説明します。'
doc_type: 'guide'
keywords: ['api', 'postman', 'rest api', 'クラウド管理', '連携']
---

import Image from '@theme/IdealImage';
import postman1 from '@site/static/images/cloud/manage/postman/postman1.png';
import postman2 from '@site/static/images/cloud/manage/postman/postman2.png';
import postman3 from '@site/static/images/cloud/manage/postman/postman3.png';
import postman4 from '@site/static/images/cloud/manage/postman/postman4.png';
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

このガイドでは、[Postman](https://www.postman.com/product/what-is-postman/) を使用して ClickHouse Cloud API をテストする方法を説明します。
Postman アプリケーションは Web ブラウザから利用できるほか、デスクトップアプリとしてダウンロードして使用することもできます。


### アカウントを作成する \{#create-an-account\}

* 無料アカウントは [https://www.postman.com](https://www.postman.com) で作成できます。

<Image img={postman1} size="md" alt="Postman のサイト" border/>

### ワークスペースを作成する \{#create-a-workspace\}

* ワークスペース名と公開範囲を設定します。 

<Image img={postman2} size="md" alt="ワークスペースを作成" border/>

### コレクションを作成する \{#create-a-collection\}

* 画面左上のメニューで「Explore」の直下にある「Import」をクリックします：

<Image img={postman3} size="md" alt="Explore > Import" border/>

* モーダルダイアログが表示されます：

<Image img={postman4} size="md" alt="API URL entry" border/>

* API アドレス "https://api.clickhouse.cloud/v1" を入力し、Enter キーを押します：

* 「Import」ボタンをクリックし、「Postman Collection」を選択します：

<Image img={postman6} size="md" alt="Collection > Import" border/>

### ClickHouse Cloud API スペックとのインターフェース \{#interface-with-the-clickhouse-cloud-api-spec\}

* 「API spec for ClickHouse Cloud」が「Collections」（左側のナビゲーション）内に表示されます。

<Image img={postman7} size="md" alt="Import your API" border/>

* 「API spec for ClickHouse Cloud」をクリックします。中央のペインから「Authorization」タブを選択します。

<Image img={postman8} size="md" alt="Import complete" border/>

### 認証を設定する \{#set-authorization\}

* ドロップダウンメニューを開き、「Basic Auth」を選択します:

<Image img={postman9} size="md" alt="Basic auth" border/>

* ClickHouse Cloud の API キーを設定した際に発行された Username と Password を入力します:

<Image img={postman10} size="md" alt="credentials" border/>

### 変数を有効にする \{#enable-variables\}

* [変数](https://learning.postman.com/docs/sending-requests/variables/) を使用すると、Postman 内で値を保存して再利用できるため、API テストをより簡単に行えます。

#### 組織 ID と Service ID を設定する \{#set-the-organization-id-and-service-id\}

* 「Collection」内で、中央ペインの「Variable」タブをクリックします（Base URL は先ほどの API インポート時に設定されています）:
* `baseURL` の下にある「Add new value」のフィールドをクリックし、自分の組織 ID と Service ID を入力します:

<Image img={postman11} size="md" alt="Organization ID and Service ID" border/>

## ClickHouse Cloud API の各種機能をテストする \{#test-the-clickhouse-cloud-api-functionalities\}

### 「GET list of available organizations」をテストする \{#test-get-list-of-available-organizations\}

* 「OpenAPI spec for ClickHouse Cloud」で、フォルダ > V1 > organizations を展開します
* 「GET list of available organizations」をクリックし、右側の青い「Send」ボタンを押します：

<Image img={postman12} size="md" alt="組織の取得テスト" border/>

* 返される結果には、"status": 200 とともに組織の詳細が含まれているはずです。（"status" 400 が返り、組織情報が含まれていない場合は設定が正しくありません）。

<Image img={postman13} size="md" alt="ステータス" border/>

### 「GET organizational details」をテストする \{#test-get-organizational-details\}

* `organizationid` フォルダ配下で「GET organizational details」に移動します:
* 中央フレームの Params メニューで、`organizationid` が必須です。

<Image img={postman14} size="md" alt="組織詳細取得テスト" border/>

* この値を、波括弧 `{{orgid}}` 内の `orgid` に編集します（先ほどこの値を設定していれば、その値が表示されたメニューが現れます）:

<Image img={postman15} size="md" alt="テスト送信" border/>

* 「Save」ボタンを押した後、画面右上の青い「Send」ボタンを押します。

<Image img={postman16} size="md" alt="返却値" border/>

* レスポンスには `"status": 200` とともに組織の詳細が含まれている必要があります（`"status": 400` が返り、organization 情報が何も含まれていない場合は、設定が正しくありません）。

### "GET service details" をテストする \{#test-get-service-details\}

* "GET service details" をクリックします。
* `organizationid` と `serviceid` の Values を、それぞれ `{{orgid}}` と `{{serviceid}}` に編集します。
* "Save" を押し、その後右側の青い "Send" ボタンを押します。

<Image img={postman17} size="md" alt="List of services" border/>

* 返された結果には、"status": 200 とともに、あなたのサービスとその詳細の一覧が含まれているはずです。（サービス情報がない状態で "status" 400 を受け取った場合は、設定が正しくありません）。