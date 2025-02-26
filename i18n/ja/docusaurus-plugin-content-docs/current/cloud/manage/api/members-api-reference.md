---
sidebar_label: メンバー
title: メンバー
---

## 組織のメンバー一覧 {#list-organization-members}

組織内のすべてのメンバーのリストを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/members` |

### リクエスト {#request}

#### パスパラメータ {#path-params}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のID。 | 


### レスポンス {#response}

#### レスポンススキーマ {#response-schema}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| userId | string | ユニークなユーザーID。ユーザーが複数の組織のメンバーである場合、このIDは同じままです。 | 
| name | string | 個人ユーザープロファイルに設定されたメンバーの名前。 | 
| email | email | 個人ユーザープロファイルに設定されたメンバーのメール。 | 
| role | string | 組織内のメンバーの役割。 | 
| joinedAt | date-time | メンバーが組織に参加したタイムスタンプ。ISO-8601形式。 | 

#### サンプルレスポンス {#sample-response}

```
{
  "userId": "string",
  "name": "string",
  "email": "email",
  "role": "string",
  "joinedAt": "date-time"
}
```

## メンバーの詳細を取得 {#get-member-details}

単一の組織メンバーの詳細を返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/members/{userId}` |

### リクエスト {#request-1}

#### パスパラメータ {#path-params-1}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | メンバーが属している組織のID。 | 
| userId | uuid | 要求されたユーザーのID。 | 


### レスポンス {#response-1}

#### レスポンススキーマ {#response-schema-1}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| userId | string | ユニークなユーザーID。ユーザーが複数の組織のメンバーである場合、このIDは同じままです。 | 
| name | string | 個人ユーザープロファイルに設定されたメンバーの名前。 | 
| email | email | 個人ユーザープロファイルに設定されたメンバーのメール。 | 
| role | string | 組織内のメンバーの役割。 | 
| joinedAt | date-time | メンバーが組織に参加したタイムスタンプ。ISO-8601形式。 | 

#### サンプルレスポンス {#sample-response-1}

```
{
  "userId": "string",
  "name": "string",
  "email": "email",
  "role": "string",
  "joinedAt": "date-time"
}
```

## 組織メンバーの更新 {#update-organization-member}

組織メンバーの役割を更新します。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/members/{userId}` |

### リクエスト {#request-2}

#### パスパラメータ {#path-params-2}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | メンバーが属している組織のID。 | 
| userId | uuid | パッチするユーザーのID。 | 

### ボディパラメータ {#body-params}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| role | string | 組織内のメンバーの役割。 | 

### レスポンス {#response-2}

#### レスポンススキーマ {#response-schema-2}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| userId | string | ユニークなユーザーID。ユーザーが複数の組織のメンバーである場合、このIDは同じままです。 | 
| name | string | 個人ユーザープロファイルに設定されたメンバーの名前。 | 
| email | email | 個人ユーザープロファイルに設定されたメンバーのメール。 | 
| role | string | 組織内のメンバーの役割。 | 
| joinedAt | date-time | メンバーが組織に参加したタイムスタンプ。ISO-8601形式。 | 

#### サンプルレスポンス {#sample-response-2}

```
{
  "userId": "string",
  "name": "string",
  "email": "email",
  "role": "string",
  "joinedAt": "date-time"
}
```

## 組織メンバーの削除 {#remove-an-organization-member}

組織からユーザーを削除します。

| メソッド | パス |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/members/{userId}` |

### リクエスト {#request-3}

#### パスパラメータ {#path-params-3}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のID。 | 
| userId | uuid | 要求されたユーザーのID。 | 
