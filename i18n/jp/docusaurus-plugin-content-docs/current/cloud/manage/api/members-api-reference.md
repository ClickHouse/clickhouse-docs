---
sidebar_label: メンバー
title: メンバー
---

## 組織のメンバーリスト

組織内の全メンバーのリストを返します。

| メソッド | パス |
| :------- | :--- |
| GET | `/v1/organizations/{organizationId}/members` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :--- |
| organizationId | uuid | リクエストされた組織のID。 |

### レスポンス

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :--- |
| userId | string | ユニークなユーザーID。同じユーザーが複数の組織にメンバーとして存在する場合、このIDは同じままです。 | 
| name | string | 個人ユーザープロファイルに設定されたメンバーの名前。 | 
| email | email | 個人ユーザープロファイルに設定されたメンバーのメールアドレス。 | 
| role | string | 組織内でのメンバーの役割。 | 
| joinedAt | date-time | メンバーが組織に参加したタイムスタンプ。ISO-8601。 |

#### サンプルレスポンス

```
{
  "userId": "string",
  "name": "string",
  "email": "email",
  "role": "string",
  "joinedAt": "date-time"
}
```

## メンバーの詳細を取得

特定の組織メンバーの詳細を返します。

| メソッド | パス |
| :------- | :--- |
| GET | `/v1/organizations/{organizationId}/members/{userId}` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :--- |
| organizationId | uuid | メンバーが所属する組織のID。 | 
| userId | uuid | リクエストされたユーザーのID。 | 

### レスポンス

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :--- |
| userId | string | ユニークなユーザーID。同じユーザーが複数の組織にメンバーとして存在する場合、このIDは同じままです。 | 
| name | string | 個人ユーザープロファイルに設定されたメンバーの名前。 | 
| email | email | 個人ユーザープロファイルに設定されたメンバーのメールアドレス。 | 
| role | string | 組織内でのメンバーの役割。 | 
| joinedAt | date-time | メンバーが組織に参加したタイムスタンプ。ISO-8601。 |

#### サンプルレスポンス

```
{
  "userId": "string",
  "name": "string",
  "email": "email",
  "role": "string",
  "joinedAt": "date-time"
}
```

## 組織メンバーの更新

組織メンバーの役割を更新します。

| メソッド | パス |
| :------- | :--- |
| PATCH | `/v1/organizations/{organizationId}/members/{userId}` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :--- |
| organizationId | uuid | メンバーが所属する組織のID。 | 
| userId | uuid | パッチを適用するユーザーのID。 | 

### ボディパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :--- |
| role | string | 組織内でのメンバーの役割。 | 

### レスポンス

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :--- |
| userId | string | ユニークなユーザーID。同じユーザーが複数の組織にメンバーとして存在する場合、このIDは同じままです。 | 
| name | string | 個人ユーザープロファイルに設定されたメンバーの名前。 | 
| email | email | 個人ユーザープロファイルに設定されたメンバーのメールアドレス。 | 
| role | string | 組織内でのメンバーの役割。 | 
| joinedAt | date-time | メンバーが組織に参加したタイムスタンプ。ISO-8601。 |

#### サンプルレスポンス

```
{
  "userId": "string",
  "name": "string",
  "email": "email",
  "role": "string",
  "joinedAt": "date-time"
}
```

## 組織メンバーを削除

組織からユーザーを削除します。

| メソッド | パス |
| :------- | :--- |
| DELETE | `/v1/organizations/{organizationId}/members/{userId}` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :--- |
| organizationId | uuid | リクエストされた組織のID。 | 
| userId | uuid | リクエストされたユーザーのID。 | 
