---
sidebar_label: キー
title: キー
---

## すべてのキーのリストを取得する

組織内のすべてのキーのリストを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/keys` |

### リクエスト

#### パスパラメータ

| 名称 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 | 

### レスポンス

#### レスポンススキーマ

| 名称 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | 一意のAPIキーID。 | 
| name | string | キーの名前 | 
| state | string | キーの状態: 'enabled', 'disabled'。 | 
| roles | array | キーに割り当てられたロールのリスト。少なくとも1要素を含む。 | 
| keySuffix | string | キーの最後の4文字。 | 
| createdAt | date-time | キーが作成されたタイムスタンプ。ISO-8601。 | 
| expireAt | date-time | キーが有効期限切れになるタイムスタンプ。存在しない場合や空の場合、キーは有効期限切れになりません。ISO-8601。 | 
| usedAt | date-time | キーが最後に使用されたタイムスタンプ。存在しない場合、キーは使用されていません。ISO-8601。 | 

#### サンプルレスポンス

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

## キーを作成する

新しいAPIキーを作成します。

| メソッド | パス |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/keys` |

### リクエスト

#### パスパラメータ

| 名称 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | キーを所有する組織のID。 | 

### ボディパラメータ

| 名称 | タイプ | 説明 |
| :--- | :--- | :---------- |
| name | string | キーの名前。 | 
| expireAt | string | キーが有効期限切れになるタイムスタンプ。存在しない場合や空の場合、キーは有効期限切れになりません。ISO-8601。 | 
| state | string | キーの初期状態: 'enabled', 'disabled'。指定がない場合、新しいキーは'enabled'になります。 | 
| hashData |  |  | 
| roles | array | キーに割り当てられたロールのリスト。少なくとも1要素を含む。 | 

### レスポンス

#### レスポンススキーマ

| 名称 | タイプ | 説明 |
| :--- | :--- | :---------- |
| key.id | uuid | 一意のAPIキーID。 | 
| key.name | string | キーの名前 | 
| key.state | string | キーの状態: 'enabled', 'disabled'。 | 
| key.roles | array | キーに割り当てられたロールのリスト。少なくとも1要素を含む。 | 
| key.keySuffix | string | キーの最後の4文字。 | 
| key.createdAt | date-time | キーが作成されたタイムスタンプ。ISO-8601。 | 
| key.expireAt | date-time | キーが有効期限切れになるタイムスタンプ。存在しない場合や空の場合、キーは有効期限切れになりません。ISO-8601。 | 
| key.usedAt | date-time | キーが最後に使用されたタイムスタンプ。存在しない場合、キーは使用されていません。ISO-8601。 | 
| keyId | string | 生成されたキーID。リクエストに'hashData'が含まれない場合のみ提供されます。 | 
| keySecret | string | 生成されたキーシークレット。リクエストに'hashData'が含まれない場合のみ提供されます。 | 

#### サンプルレスポンス

```
{
  "key": {
    "id": "uuid",
    "name": "string",
    "state": "string",
    "roles": "Array",
    "keySuffix": "string",
    "createdAt": "date-time",
    "expireAt": "date-time",
    "usedAt": "date-time"
  },
  "keyId": "string",
  "keySecret": "string"
}
```

## キーの詳細を取得する

単一のキーの詳細を返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/keys/{keyId}` |

### リクエスト

#### パスパラメータ

| 名称 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 | 
| keyId | uuid | リクエストされたキーのID。 | 

### レスポンス

#### レスポンススキーマ

| 名称 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | 一意のAPIキーID。 | 
| name | string | キーの名前 | 
| state | string | キーの状態: 'enabled', 'disabled'。 | 
| roles | array | キーに割り当てられたロールのリスト。少なくとも1要素を含む。 | 
| keySuffix | string | キーの最後の4文字。 | 
| createdAt | date-time | キーが作成されたタイムスタンプ。ISO-8601。 | 
| expireAt | date-time | キーが有効期限切れになるタイムスタンプ。存在しない場合や空の場合、キーは有効期限切れになりません。ISO-8601。 | 
| usedAt | date-time | キーが最後に使用されたタイムスタンプ。存在しない場合、キーは使用されていません。ISO-8601。 | 

#### サンプルレスポンス

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

## キーを更新する

APIキーのプロパティを更新します。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/keys/{keyId}` |

### リクエスト

#### パスパラメータ

| 名称 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | キーを所有する組織のID。 | 
| keyId | uuid | 更新するキーのID。 | 

### ボディパラメータ

| 名称 | タイプ | 説明 |
| :--- | :--- | :---------- |
| name | string | キーの名前 | 
| roles | array | キーに割り当てられたロールのリスト。少なくとも1要素を含む。 | 
| expireAt | string | キーが有効期限切れになるタイムスタンプ。存在しない場合や空の場合、キーは有効期限切れになりません。ISO-8601。 | 
| state | string | キーの状態: 'enabled', 'disabled'。 | 

### レスポンス

#### レスポンススキーマ

| 名称 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | 一意のAPIキーID。 | 
| name | string | キーの名前 | 
| state | string | キーの状態: 'enabled', 'disabled'。 | 
| roles | array | キーに割り当てられたロールのリスト。少なくとも1要素を含む。 | 
| keySuffix | string | キーの最後の4文字。 | 
| createdAt | date-time | キーが作成されたタイムスタンプ。ISO-8601。 | 
| expireAt | date-time | キーが有効期限切れになるタイムスタンプ。存在しない場合や空の場合、キーは有効期限切れになりません。ISO-8601。 | 
| usedAt | date-time | キーが最後に使用されたタイムスタンプ。存在しない場合、キーは使用されていません。ISO-8601。 | 

#### サンプルレスポンス

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

## キーを削除する

APIキーを削除します。アクティブなリクエストの認証に使用されていないキーのみ削除できます。

| メソッド | パス |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/keys/{keyId}` |

### リクエスト

#### パスパラメータ

| 名称 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | キーを所有する組織のID。 | 
| keyId | uuid | 削除するキーのID。 | 
