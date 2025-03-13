---
sidebar_label: 招待
title: 招待
---

## すべての招待をリストする

すべての組織の招待のリストを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/invitations` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のID。 | 

### レスポンス

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| role | string | 組織内のメンバーの役割。 | 
| id | uuid | 一意の招待ID。 | 
| email | email | 招待されたユーザーのメールアドレス。このメールアドレスを持つユーザーだけが招待を使用して参加できます。メールアドレスは小文字形式で保存されます。 | 
| createdAt | date-time | 招待の作成タイムスタンプ。ISO-8601。 | 
| expireAt | date-time | 招待の有効期限タイムスタンプ。ISO-8601。 | 

#### サンプルレスポンス

```
{
  "role": "string",
  "id": "uuid",
  "email": "email",
  "createdAt": "date-time",
  "expireAt": "date-time"
}
```

## 招待を作成する

組織の招待を作成します。

| メソッド | パス |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/invitations` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | ユーザーを招待する組織のID。 | 

### ボディパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| email | string | 招待されたユーザーのメールアドレス。このメールアドレスを持つユーザーだけが招待を使用して参加できます。メールアドレスは小文字形式で保存されます。 | 
| role | string | 組織内のメンバーの役割。 | 

### レスポンス

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| role | string | 組織内のメンバーの役割。 | 
| id | uuid | 一意の招待ID。 | 
| email | email | 招待されたユーザーのメールアドレス。このメールアドレスを持つユーザーだけが招待を使用して参加できます。メールアドレスは小文字形式で保存されます。 | 
| createdAt | date-time | 招待の作成タイムスタンプ。ISO-8601。 | 
| expireAt | date-time | 招待の有効期限タイムスタンプ。ISO-8601。 | 

#### サンプルレスポンス

```
{
  "role": "string",
  "id": "uuid",
  "email": "email",
  "createdAt": "date-time",
  "expireAt": "date-time"
}
```

## 招待の詳細を取得する

単一の組織招待の詳細を返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/invitations/{invitationId}` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のID。 | 
| invitationId | uuid | 要求された招待のID。 | 

### レスポンス

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| role | string | 組織内のメンバーの役割。 | 
| id | uuid | 一意の招待ID。 | 
| email | email | 招待されたユーザーのメールアドレス。このメールアドレスを持つユーザーだけが招待を使用して参加できます。メールアドレスは小文字形式で保存されます。 | 
| createdAt | date-time | 招待の作成タイムスタンプ。ISO-8601。 | 
| expireAt | date-time | 招待の有効期限タイムスタンプ。ISO-8601。 | 

#### サンプルレスポンス

```
{
  "role": "string",
  "id": "uuid",
  "email": "email",
  "createdAt": "date-time",
  "expireAt": "date-time"
}
```

## 組織招待を削除する

単一の組織招待を削除します。

| メソッド | パス |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/invitations/{invitationId}` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 招待がある組織のID。 | 
| invitationId | uuid | 要求された招待のID。 | 
