---
sidebar_label: 組織
title: 組織
---

## 利用可能な組織のリストを取得 {#get-list-of-available-organizations}

リクエスト内のAPIキーに関連付けられた単一の組織のリストを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations` |

### リクエスト {#request}


### レスポンス {#response}

#### レスポンススキーマ {#response-schema}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | 一意の組織ID。 | 
| createdAt | date-time | 組織が作成されたタイムスタンプ。ISO-8601。 | 
| name | string | 組織の名前。 | 
| privateEndpoints | array | 組織のためのプライベートエンドポイントのリスト | 
| byocConfig | array | 組織のためのBYOC設定 | 

#### サンプルレスポンス {#sample-response}

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## 組織の詳細を取得 {#get-organization-details}

単一の組織の詳細を返します。詳細を取得するには、認証キーがその組織に属している必要があります。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}` |

### リクエスト {#request-1}

#### パスパラメータ {#path-params}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 取得する組織のID。 | 


### レスポンス {#response-1}

#### レスポンススキーマ {#response-schema-1}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | 一意の組織ID。 | 
| createdAt | date-time | 組織が作成されたタイムスタンプ。ISO-8601。 | 
| name | string | 組織の名前。 | 
| privateEndpoints | array | 組織のためのプライベートエンドポイントのリスト | 
| byocConfig | array | 組織のためのBYOC設定 | 

#### サンプルレスポンス {#sample-response-1}

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## 組織の詳細を更新 {#update-organization-details}

組織のフィールドを更新します。ADMIN認証キーの役割が必要です。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}` |

### リクエスト {#request-2}

#### パスパラメータ {#path-params-1}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 更新する組織のID。 | 

### ボディパラメータ {#body-params}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| name | string | 組織の名前。 | 
| privateEndpoints |  |  | 

### レスポンス {#response-2}

#### レスポンススキーマ {#response-schema-2}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | 一意の組織ID。 | 
| createdAt | date-time | 組織が作成されたタイムスタンプ。ISO-8601。 | 
| name | string | 組織の名前。 | 
| privateEndpoints | array | 組織のためのプライベートエンドポイントのリスト | 
| byocConfig | array | 組織のためのBYOC設定 | 

#### サンプルレスポンス {#sample-response-2}

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## 組織活動のリスト {#list-of-organization-activities}

すべての組織活動のリストを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/activities` |

### リクエスト {#request-3}

#### パスパラメータ {#path-params-2}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 取得する組織のID。 | 
| from_date | date-time | 検索の開始日 | 
| to_date | date-time | 検索の終了日 | 


### レスポンス {#response-3}

#### レスポンススキーマ {#response-schema-3}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | string | 一意の活動ID。 | 
| createdAt | date-time | 活動のタイムスタンプ。ISO-8601。 | 
| type | string | 活動のタイプ。 | 
| actorType | string | アクターの種類：'user', 'support', 'system', 'api'。 | 
| actorId | string | 一意のアクターID。 | 
| actorDetails | string | アクターに関する追加情報。 | 
| actorIpAddress | string | アクターのIPアドレス。'user'および'api'のアクタータイプに対して定義されています。 | 
| organizationId | string | 活動の範囲：この活動が関連する組織ID。 | 
| serviceId | string | 活動の範囲：この活動が関連するサービスID。 | 

#### サンプルレスポンス {#sample-response-3}

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

## 組織活動 {#organization-activity}

IDによる単一の組織活動を返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/activities/{activityId}` |

### リクエスト {#request-4}

#### パスパラメータ {#path-params-3}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 取得する組織のID。 | 
| activityId | string | 取得する活動のID。 | 


### レスポンス {#response-4}

#### レスポンススキーマ {#response-schema-4}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | string | 一意の活動ID。 | 
| createdAt | date-time | 活動のタイムスタンプ。ISO-8601。 | 
| type | string | 活動のタイプ。 | 
| actorType | string | アクターの種類：'user', 'support', 'system', 'api'。 | 
| actorId | string | 一意のアクターID。 | 
| actorDetails | string | アクターに関する追加情報。 | 
| actorIpAddress | string | アクターのIPアドレス。'user'および'api'のアクタータイプに対して定義されています。 | 
| organizationId | string | 活動の範囲：この活動が関連する組織ID。 | 
| serviceId | string | 活動の範囲：この活動が関連するサービスID。 | 

#### サンプルレスポンス {#sample-response-4}

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
