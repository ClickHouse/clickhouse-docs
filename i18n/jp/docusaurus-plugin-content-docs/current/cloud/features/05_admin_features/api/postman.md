---
slug: /cloud/manage/postman
sidebar_label: "Postmanを使用したプログラマティックAPIアクセス"
title: "Postmanを使用したプログラマティックAPIアクセス"
description: "このガイドでは、Postmanを使用してClickHouse Cloud APIをテストする方法を説明します"
doc_type: "guide"
keywords: ["api", "postman", "rest api", "クラウド管理", "統合"]
---

import Image from "@theme/IdealImage"
import postman1 from "@site/static/images/cloud/manage/postman/postman1.png"
import postman2 from "@site/static/images/cloud/manage/postman/postman2.png"
import postman3 from "@site/static/images/cloud/manage/postman/postman3.png"
import postman4 from "@site/static/images/cloud/manage/postman/postman4.png"
import postman5 from "@site/static/images/cloud/manage/postman/postman5.png"
import postman6 from "@site/static/images/cloud/manage/postman/postman6.png"
import postman7 from "@site/static/images/cloud/manage/postman/postman7.png"
import postman8 from "@site/static/images/cloud/manage/postman/postman8.png"
import postman9 from "@site/static/images/cloud/manage/postman/postman9.png"
import postman10 from "@site/static/images/cloud/manage/postman/postman10.png"
import postman11 from "@site/static/images/cloud/manage/postman/postman11.png"
import postman12 from "@site/static/images/cloud/manage/postman/postman12.png"
import postman13 from "@site/static/images/cloud/manage/postman/postman13.png"
import postman14 from "@site/static/images/cloud/manage/postman/postman14.png"
import postman15 from "@site/static/images/cloud/manage/postman/postman15.png"
import postman16 from "@site/static/images/cloud/manage/postman/postman16.png"
import postman17 from "@site/static/images/cloud/manage/postman/postman17.png"

このガイドでは、[Postman](https://www.postman.com/product/what-is-postman/)を使用してClickHouse Cloud APIをテストする方法を説明します。
Postmanアプリケーションは、Webブラウザ内で使用することも、デスクトップにダウンロードして使用することもできます。

### アカウントの作成 {#create-an-account}

- 無料アカウントは[https://www.postman.com](https://www.postman.com)で利用できます。

<Image img={postman1} size='md' alt='Postmanサイト' border />

### ワークスペースの作成 {#create-a-workspace}

- ワークスペースに名前を付け、公開範囲を設定します。

<Image img={postman2} size='md' alt='ワークスペースの作成' border />

### コレクションの作成 {#create-a-collection}

- 左上のメニューの「Explore」の下にある「Import」をクリックします:

<Image img={postman3} size='md' alt='Explore > Import' border />

- モーダルウィンドウが表示されます:

<Image img={postman4} size='md' alt='API URL入力' border />

- APIアドレス「https://api.clickhouse.cloud/v1」を入力し、Enterキーを押します:

<Image img={postman5} size='md' alt='インポート' border />

- 「Import」ボタンをクリックして「Postman Collection」を選択します:

<Image img={postman6} size='md' alt='Collection > Import' border />

### ClickHouse Cloud API仕様との連携 {#interface-with-the-clickhouse-cloud-api-spec}

- 「API spec for ClickHouse Cloud」が「Collections」(左側のナビゲーション)内に表示されます。

<Image img={postman7} size='md' alt='APIのインポート' border />

- 「API spec for ClickHouse Cloud」をクリックします。中央のペインから「Authorization」タブを選択します:

<Image img={postman8} size='md' alt='インポート完了' border />

### 認証の設定 {#set-authorization}

- ドロップダウンメニューを切り替えて「Basic Auth」を選択します:

<Image img={postman9} size='md' alt='Basic認証' border />

- ClickHouse Cloud APIキーを設定した際に受け取ったユーザー名とパスワードを入力します:

<Image img={postman10} size='md' alt='認証情報' border />

### 変数の有効化 {#enable-variables}

- [変数](https://learning.postman.com/docs/sending-requests/variables/)を使用すると、Postman内で値を保存および再利用でき、APIテストが容易になります。

#### 組織IDとサービスIDの設定 {#set-the-organization-id-and-service-id}

- 「Collection」内で、中央のペインの「Variable」タブをクリックします(Base URLは先ほどのAPIインポートで設定されています):
- `baseURL`の下にある「Add new value」フィールドをクリックし、組織IDとサービスIDを入力します:

<Image img={postman11} size='md' alt='組織IDとサービスID' border />


## ClickHouse Cloud API機能のテスト {#test-the-clickhouse-cloud-api-functionalities}

### 「利用可能な組織のリストを取得」のテスト {#test-get-list-of-available-organizations}

- 「OpenAPI spec for ClickHouse Cloud」配下で、フォルダ > V1 > organizationsを展開します
- 「GET list of available organizations」をクリックし、右側の青い「Send」ボタンを押します:

<Image img={postman12} size='md' alt='組織の取得テスト' border />

- 返された結果には、「status」: 200とともに組織の詳細が含まれているはずです(組織情報がない「status」400を受け取った場合、設定が正しくありません)。

<Image img={postman13} size='md' alt='ステータス' border />

### 「組織の詳細を取得」のテスト {#test-get-organizational-details}

- `organizationid`フォルダ配下で、「GET organizational details」に移動します:
- 中央フレームメニューのParams配下で、`organizationid`が必要です。

<Image
  img={postman14}
  size='md'
  alt='組織詳細の取得テスト'
  border
/>

- この値を波括弧で囲んだ`orgid` `{{orgid}}`で編集します(この値を事前に設定しているため、値を含むメニューが表示されます):

<Image img={postman15} size='md' alt='テストの送信' border />

- 「Save」ボタンを押した後、画面右上の青い「Send」ボタンを押します。

<Image img={postman16} size='md' alt='戻り値' border />

- 返された結果には、「status」: 200とともに組織の詳細が含まれているはずです(組織情報がない「status」400を受け取った場合、設定が正しくありません)。

### 「サービスの詳細を取得」のテスト {#test-get-service-details}

- 「GET service details」をクリックします
- `organizationid`と`serviceid`の値をそれぞれ`{{orgid}}`と`{{serviceid}}`で編集します。
- 「Save」を押してから、右側の青い「Send」ボタンを押します。

<Image img={postman17} size='md' alt='サービスのリスト' border />

- 返された結果には、「status」: 200とともにサービスのリストとその詳細が含まれているはずです(サービス情報がない「status」400を受け取った場合、設定が正しくありません)。
