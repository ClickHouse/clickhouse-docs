---
sidebar_label: 組織
title: 組織
---

## 利用可能な組織のリストを取得

リクエストのAPIキーに関連付けられた単一の組織のリストを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations` |

### リクエスト


### レスポンス

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークな組織ID。 | 
| createdAt | date-time | 組織が作成されたタイムスタンプ。ISO-8601。 | 
| name | string | 組織の名前。 | 
| privateEndpoints | array | 組織のプライベートエンドポイントのリスト | 
| byocConfig | array | 組織のBYOC構成 | 


#### サンプルレスポンス

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## 組織の詳細を取得

単一の組織の詳細を返します。詳細を取得するには、認証キーがその組織に属している必要があります。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のID。 | 


### レスポンス

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークな組織ID。 | 
| createdAt | date-time | 組織が作成されたタイムスタンプ。ISO-8601。 | 
| name | string | 組織の名前。 | 
| privateEndpoints | array | 組織のプライベートエンドポイントのリスト | 
| byocConfig | array | 組織のBYOC構成 | 


#### サンプルレスポンス

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## 組織の詳細を更新

組織のフィールドを更新します。ADMIN認証キーの役割が必要です。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 更新する組織のID。 | 

### ボディパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| name | string | 組織の名前。 | 
| privateEndpoints |  |  | 

### レスポンス

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークな組織ID。 | 
| createdAt | date-time | 組織が作成されたタイムスタンプ。ISO-8601。 | 
| name | string | 組織の名前。 | 
| privateEndpoints | array | 組織のプライベートエンドポイントのリスト | 
| byocConfig | array | 組織のBYOC構成 | 


#### サンプルレスポンス

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## 組織の活動のリスト

すべての組織の活動のリストを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/activities` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のID。 | 
| from_date | date-time | 検索の開始日 | 
| to_date | date-time | 検索の終了日 | 


### レスポンス

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | string | ユニークな活動ID。 | 
| createdAt | date-time | 活動のタイムスタンプ。ISO-8601。 | 
| type | string | 活動のタイプ。 | 
| actorType | string | アクターのタイプ: 'user', 'support', 'system', 'api'。 | 
| actorId | string | ユニークなアクターID。 | 
| actorDetails | string | アクターに関する追加情報。 | 
| actorIpAddress | string | アクターのIPアドレス。'user'と'api'のアクタータイプに対して定義されます。 | 
| organizationId | string | 活動のスコープ: この活動に関連する組織ID。 | 
| serviceId | string | 活動のスコープ: この活動に関連するサービスID。 | 


#### サンプルレスポンス

```
{
  "id": "string",
  "createdAt": "date-time",
  "type": "string",
  "actorType": "string",
  "actorId": "string",
  "actorDetails": "string",
  "actorIpAddress": "string",
  "organizationId": "string",
  "serviceId": "string"
}
```

## 組織の活動

IDによって単一の組織活動を返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/activities/{activityId}` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のID。 | 
| activityId | string | 要求された活動のID。 | 


### レスポンス

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | string | ユニークな活動ID。 | 
| createdAt | date-time | 活動のタイムスタンプ。ISO-8601。 | 
| type | string | 活動のタイプ。 | 
| actorType | string | アクターのタイプ: 'user', 'support', 'system', 'api'。 | 
| actorId | string | ユニークなアクターID。 | 
| actorDetails | string | アクターに関する追加情報。 | 
| actorIpAddress | string | アクターのIPアドレス。'user'と'api'のアクタータイプに対して定義されます。 | 
| organizationId | string | 活動のスコープ: この活動に関連する組織ID。 | 
| serviceId | string | 活動のスコープ: この活動に関連するサービスID。 | 


#### サンプルレスポンス

```
{
  "id": "string",
  "createdAt": "date-time",
  "type": "string",
  "actorType": "string",
  "actorId": "string",
  "actorDetails": "string",
  "actorIpAddress": "string",
  "organizationId": "string",
  "serviceId": "string"
}
```
