---
sidebar_label: 招待
title: 招待
---

## すべての招待をリストする {#list-all-invitations}

すべての組織の招待のリストを返します。

| メソッド | パス |
| :------- | :--- |
| GET | `/v1/organizations/{organizationId}/invitations` |

### リクエスト {#request}

#### パスパラメータ {#path-params}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のID。 | 


### レスポンス {#response}

#### レスポンススキーマ {#response-schema}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| role | string | 組織内のメンバーの役割。 | 
| id | uuid | 一意の招待ID。 | 
| email | email | 招待されたユーザーのメール。 このメールを持つユーザーだけが招待を使用して参加できます。 メールは小文字形式で保存されます。 | 
| createdAt | date-time | 招待の作成タイムスタンプ。 ISO-8601形式。 | 
| expireAt | date-time | 招待が期限切れになるタイムスタンプ。 ISO-8601形式。 | 

#### サンプルレスポンス {#sample-response}

```
{
  "role": "string",
  "id": "uuid",
  "email": "email",
  "createdAt": "date-time",
  "expireAt": "date-time"
}
```

## 招待を作成する {#create-an-invitation}

組織の招待を作成します。

| メソッド | パス |
| :------- | :--- |
| POST | `/v1/organizations/{organizationId}/invitations` |

### リクエスト {#request-1}

#### パスパラメータ {#path-params-1}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | ユーザーを招待する組織のID。 | 

### ボディパラメータ {#body-params}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| email | string | 招待されたユーザーのメール。 このメールを持つユーザーだけが招待を使用して参加できます。 メールは小文字形式で保存されます。 | 
| role | string | 組織内のメンバーの役割。 | 

### レスポンス {#response-1}

#### レスポンススキーマ {#response-schema-1}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| role | string | 組織内のメンバーの役割。 | 
| id | uuid | 一意の招待ID。 | 
| email | email | 招待されたユーザーのメール。 このメールを持つユーザーだけが招待を使用して参加できます。 メールは小文字形式で保存されます。 | 
| createdAt | date-time | 招待の作成タイムスタンプ。 ISO-8601形式。 | 
| expireAt | date-time | 招待が期限切れになるタイムスタンプ。 ISO-8601形式。 | 

#### サンプルレスポンス {#sample-response-1}

```
{
  "role": "string",
  "id": "uuid",
  "email": "email",
  "createdAt": "date-time",
  "expireAt": "date-time"
}
```

## 招待の詳細を取得する {#get-invitation-details}

単一の組織の招待の詳細を返します。

| メソッド | パス |
| :------- | :--- |
| GET | `/v1/organizations/{organizationId}/invitations/{invitationId}` |

### リクエスト {#request-2}

#### パスパラメータ {#path-params-2}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のID。 | 
| invitationId | uuid | 要求された招待のID。 | 


### レスポンス {#response-2}

#### レスポンススキーマ {#response-schema-2}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| role | string | 組織内のメンバーの役割。 | 
| id | uuid | 一意の招待ID。 | 
| email | email | 招待されたユーザーのメール。 このメールを持つユーザーだけが招待を使用して参加できます。 メールは小文字形式で保存されます。 | 
| createdAt | date-time | 招待の作成タイムスタンプ。 ISO-8601形式。 | 
| expireAt | date-time | 招待が期限切れになるタイムスタンプ。 ISO-8601形式。 | 

#### サンプルレスポンス {#sample-response-2}

```
{
  "role": "string",
  "id": "uuid",
  "email": "email",
  "createdAt": "date-time",
  "expireAt": "date-time"
}
```

## 組織の招待を削除する {#delete-organization-invitation}

単一の組織の招待を削除します。

| メソッド | パス |
| :------- | :--- |
| DELETE | `/v1/organizations/{organizationId}/invitations/{invitationId}` |

### リクエスト {#request-3}

#### パスパラメータ {#path-params-3}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 招待を持つ組織のID。 | 
| invitationId | uuid | 要求された招待のID。 | 
