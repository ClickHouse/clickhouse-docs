---
sidebar_label: キー
title: キー
---

## すべてのキーのリストを取得 {#get-list-of-all-keys}

組織内のすべてのキーのリストを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/keys` |

### リクエスト {#request}

#### パスパラメータ {#path-params}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のID。 | 

### レスポンス {#response}

#### レスポンススキーマ {#response-schema}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | 一意のAPIキーID。 | 
| name | string | キーの名前 | 
| state | string | キーの状態：'enabled'、'disabled'。 | 
| roles | array | キーに割り当てられたロールのリスト。少なくとも1要素を含む必要があります。 | 
| keySuffix | string | キーの最後の4文字。 | 
| createdAt | date-time | キーが作成されたタイムスタンプ。ISO-8601形式。 | 
| expireAt | date-time | キーの有効期限。存在しない、または空の場合、そのキーは有効期限がありません。ISO-8601形式。 | 
| usedAt | date-time | キーが最後に使用されたタイムスタンプ。存在しない場合、そのキーは使用されていません。ISO-8601形式。 | 

#### サンプルレスポンス {#sample-response}

```
{
  "id": "uuid",
  "name": "string",
  "state": "string",
  "roles": "Array",
  "keySuffix": "string",
  "createdAt": "date-time",
  "expireAt": "date-time",
  "usedAt": "date-time"
}
```

## キーを作成 {#create-key}

新しいAPIキーを作成します。

| メソッド | パス |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/keys` |

### リクエスト {#request-1}

#### パスパラメータ {#path-params-1}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | キーを所有する組織のID。 | 

### ボディパラメータ {#body-params}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| name | string | キーの名前。 | 
| expireAt | string | キーの有効期限。存在しない、または空の場合、そのキーは有効期限がありません。ISO-8601形式。 | 
| state | string | キーの初期状態：'enabled'、'disabled'。提供しない場合、新しいキーは 'enabled' になります。 | 
| hashData |  |  | 
| roles | array | キーに割り当てられたロールのリスト。少なくとも1要素を含む必要があります。 | 

### レスポンス {#response-1}

#### レスポンススキーマ {#response-schema-1}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| key |  |  | 
| keyId | string | 生成されたキーID。リクエストに'hashData'がない場合のみ提供されます。 | 
| keySecret | string | 生成されたキーシークレット。リクエストに'hashData'がない場合のみ提供されます。 | 

#### サンプルレスポンス {#sample-response-1}

```
{
  "keyId": "string",
  "keySecret": "string"
}
```

## キーの詳細を取得 {#get-key-details}

単一のキーの詳細を返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/keys/{keyId}` |

### リクエスト {#request-2}

#### パスパラメータ {#path-params-2}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のID。 | 
| keyId | uuid | 要求されたキーのID。 | 

### レスポンス {#response-2}

#### レスポンススキーマ {#response-schema-2}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | 一意のAPIキーID。 | 
| name | string | キーの名前 | 
| state | string | キーの状態：'enabled'、'disabled'。 | 
| roles | array | キーに割り当てられたロールのリスト。少なくとも1要素を含む必要があります。 | 
| keySuffix | string | キーの最後の4文字。 | 
| createdAt | date-time | キーが作成されたタイムスタンプ。ISO-8601形式。 | 
| expireAt | date-time | キーの有効期限。存在しない、または空の場合、そのキーは有効期限がありません。ISO-8601形式。 | 
| usedAt | date-time | キーが最後に使用されたタイムスタンプ。存在しない場合、そのキーは使用されていません。ISO-8601形式。 | 

#### サンプルレスポンス {#sample-response-2}

```
{
  "id": "uuid",
  "name": "string",
  "state": "string",
  "roles": "Array",
  "keySuffix": "string",
  "createdAt": "date-time",
  "expireAt": "date-time",
  "usedAt": "date-time"
}
```

## キーを更新 {#update-key}

APIキーのプロパティを更新します。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/keys/{keyId}` |

### リクエスト {#request-3}

#### パスパラメータ {#path-params-3}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | キーを所有する組織のID。 | 
| keyId | uuid | 更新するキーのID。 | 

### ボディパラメータ {#body-params-1}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| name | string | キーの名前 | 
| roles | array | キーに割り当てられたロールのリスト。少なくとも1要素を含む必要があります。 | 
| expireAt | string | キーの有効期限。存在しない、または空の場合、そのキーは有効期限がありません。ISO-8601形式。 | 
| state | string | キーの状態：'enabled'、'disabled'。 | 

### レスポンス {#response-3}

#### レスポンススキーマ {#response-schema-3}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | 一意のAPIキーID。 | 
| name | string | キーの名前 | 
| state | string | キーの状態：'enabled'、'disabled'。 | 
| roles | array | キーに割り当てられたロールのリスト。少なくとも1要素を含む必要があります。 | 
| keySuffix | string | キーの最後の4文字。 | 
| createdAt | date-time | キーが作成されたタイムスタンプ。ISO-8601形式。 | 
| expireAt | date-time | キーの有効期限。存在しない、または空の場合、そのキーは有効期限がありません。ISO-8601形式。 | 
| usedAt | date-time | キーが最後に使用されたタイムスタンプ。存在しない場合、そのキーは使用されていません。ISO-8601形式。 | 

#### サンプルレスポンス {#sample-response-3}

```
{
  "id": "uuid",
  "name": "string",
  "state": "string",
  "roles": "Array",
  "keySuffix": "string",
  "createdAt": "date-time",
  "expireAt": "date-time",
  "usedAt": "date-time"
}
```

## キーを削除 {#delete-key}

APIキーを削除します。アクティブなリクエストの認証に使用されていないキーのみを削除できます。

| メソッド | パス |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/keys/{keyId}` |

### リクエスト {#request-4}

#### パスパラメータ {#path-params-4}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | キーを所有する組織のID。 | 
| keyId | uuid | 削除するキーのID。 | 
