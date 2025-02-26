---
sidebar_label: サービス
title: サービス
---

## 組織サービスの一覧 {#list-of-organization-services}

組織内のすべてのサービスのリストを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services` |

### リクエスト {#request}

#### パスパラメータ {#path-params}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のIDです。 | 

### レスポンス {#response}

#### レスポンススキーマ {#response-schema}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | 一意のサービスIDです。 | 
| name | string | サービスの名前です。最大50文字までの英数字と空白の文字列です。 | 
| provider | string | クラウドプロバイダー | 
| region | string | サービスのリージョンです。 | 
| state | string | サービスの現在の状態です。 | 
| endpoints | array | すべてのサービスエンドポイントのリストです。 | 
| tier | string | BASIC、SCALE、およびENTERPRISE組織ティアに対しては非推奨です。サービスのティア: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. プロダクションサービスはスケール可能で、開発は固定サイズになります。Azureサービスは開発ティアをサポートしていません。 | 
| minTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のあるサービスには不正確です。自動スケーリング中の三つのワーカーの最小メモリ（GB単位）です。'production'サービスのみが対象です。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のあるサービスには不正確です。自動スケーリング中の三つのワーカーの最大メモリ（GB単位）です。'production'サービスのみが対象です。12の倍数であり、無償サービスの場合は360以下、または有料サービスの場合は708以下である必要があります。 | 
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小合計メモリ（GB単位）です。4の倍数であり、8以上でなければなりません。 | 
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大合計メモリ（GB単位）です。4の倍数でなければならず、無償サービスの場合は120*以下、有料サービスの場合は236*以下でなければなりません。* - 最大レプリカサイズは選択した地域のクラウドプロバイダーのハードウェア可用性に依存します。 | 
| numReplicas | number | サービスのレプリカ数です。データウェアハウスで最初のサービスのレプリカ数は2から20の間である必要があります。既存のデータウェアハウスに作成されるサービスは、1つのレプリカのみ持つことができます。組織のティアに応じてさらに制限が適用される場合があります。基本ティアではデフォルトで1、スケールおよびエンタープライズティアでは3に設定されます。 | 
| idleScaling | boolean | trueに設定されている場合、サービスはアイドル時にゼロにスケールダウンすることができます。デフォルトではtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 | 
| ipAccessList | array | サービスにアクセスを許可されたIPアドレスのリストです。 | 
| createdAt | date-time | サービスの作成タイムスタンプです。ISO-8601形式です。 | 
| encryptionKey | string | オプションの顧客提供のディスク暗号化キーです。 | 
| encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロールです。 | 
| iamRole | string | S3のオブジェクトにアクセスするために使用されるIAMロールです。 | 
| privateEndpointIds | array | プライベートエンドポイントのリストです。 | 
| dataWarehouseId | string | このサービスを含むデータウェアハウスです。 | 
| isPrimary | boolean | このサービスがデータウェアハウス内の主要サービスである場合はtrueです。 | 
| isReadonly | boolean | このサービスが読み取り専用の場合はtrueです。dataWarehouseIdが提供されている場合にのみ読み取り専用に設定できます。 | 
| releaseChannel | string | 新しいClickHouseのリリースをできるだけ早く取得したい場合はfastを選択してください。新しい機能をより早く得られますが、バグのリスクが高くなります。この機能はプロダクションサービスのみに利用可能です。 | 
| byocId | string | Bring Your Own Cloud (BYOC)のためにリージョンを設定した後に返されるIDです。byocIdパラメータが指定されると、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要になり、次のサイズの中のいずれかの値が含まれている必要があります：28、60、124、188、252、380。 | 

#### サンプルレスポンス {#sample-response}

```
{
  "id": "uuid",
  "name": "string",
  "provider": "string",
  "region": "string",
  "state": "string",
  "endpoints": "Array",
  "tier": "string",
  "minTotalMemoryGb": 0,
  "maxTotalMemoryGb": 0,
  "minReplicaMemoryGb": 0,
  "maxReplicaMemoryGb": 0,
  "numReplicas": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time",
  "encryptionKey": "string",
  "encryptionAssumedRoleIdentifier": "string",
  "iamRole": "string",
  "privateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## 新しいサービスを作成 {#create-new-service}

組織内に新しいサービスを作成し、サービスの現在の状態とサービスにアクセスするためのパスワードを返します。サービスは非同期に開始されます。

| メソッド | パス |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services` |

### リクエスト {#request-1}

#### パスパラメータ {#path-params-1}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のIDです。 | 

### ボディパラメータ {#body-params}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| name | string | サービスの名前です。最大50文字までの英数字と空白の文字列です。 | 
| provider | string | クラウドプロバイダー | 
| region | string | サービスのリージョンです。 | 
| tier | string | BASIC、SCALE、およびENTERPRISE組織ティアに対しては非推奨です。サービスのティア: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. プロダクションサービスはスケール可能で、開発は固定サイズになります。Azureサービスは開発ティアをサポートしていません。 | 
| ipAccessList | array | サービスにアクセスを許可されたIPアドレスのリストです。 | 
| minTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のあるサービスには不正確です。三つのワーカーの最小メモリ（GB単位）です。'production'サービスのみが対象です。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のあるサービスには不正確です。三つのワーカーの最大メモリ（GB単位）です。'production'サービスのみが対象です。12の倍数であり、無償サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 | 
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小合計メモリ（GB単位）です。4の倍数でなければなりません。 | 
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大合計メモリ（GB単位）です。4の倍数でなければならず、無償サービスの場合は120*以下、有料サービスの場合は236*以下でなければなりません。* - 最大レプリカサイズは選択した地域のクラウドプロバイダーのハードウェア可用性に依存します。 | 
| numReplicas | number | サービスのレプリカ数です。データウェアハウスで最初のサービスのレプリカ数は2から20の間である必要があります。既存のデータウェアハウスで作成されるサービスは、1つのレプリカのみ持つことができます。組織のティアに応じてさらに制限が適用される場合があります。基本ティアではデフォルトで1、スケールおよびエンタープライズティアでは3に設定されます。 | 
| idleScaling | boolean | trueに設定されている場合、サービスはアイドル時にゼロにスケールダウンすることができます。デフォルトではtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 | 
| isReadonly | boolean | このサービスが読み取り専用の場合はtrueです。dataWarehouseIdが提供されている場合にのみ読み取り専用に設定できます。 | 
| dataWarehouseId | string | このサービスを含むデータウェアハウスです。 | 
| backupId | string | 新しいサービスの初期状態に使用するオプションのバックアップIDです。使用する場合、リージョンと新しいインスタンスのティアは元のインスタンスの値と同じでなければなりません。 | 
| encryptionKey | string | オプションの顧客提供のディスク暗号化キーです。 | 
| encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロールです。 | 
| privateEndpointIds | array | プライベートエンドポイントのリストです。 | 
| privatePreviewTermsChecked | boolean | プライベートプレビューの利用規約に同意します。プライベートプレビューの場合、組織内の最初のサービスを作成する際に必要です。 | 
| releaseChannel | string | 新しいClickHouseのリリースをできるだけ早く取得したい場合はfastを選択してください。新しい機能をより早く得られますが、バグのリスクが高くなります。この機能はプロダクションサービスのみに利用可能です。 | 
| byocId | string | Bring Your Own Cloud (BYOC)のためにリージョンを設定した後に返されるIDです。byocIdパラメータが指定されると、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要になり、次のサイズの中のいずれかの値が含まれている必要があります：28、60、124、188、252、380。 | 
| endpoints | array | 有効または無効にするサービスエンドポイントのリストです。 | 

### レスポンス {#response-1}

#### レスポンススキーマ {#response-schema-1}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| service |  |  | 
| password | string | 新しく作成されたサービスのパスワードです。 | 

#### サンプルレスポンス {#sample-response-1}

```
{
  "password": "string"
}
```

## サービス詳細を取得 {#get-service-details}

組織に属するサービスを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}` |

### リクエスト {#request-2}

#### パスパラメータ {#path-params-2}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のIDです。 | 
| serviceId | uuid | 要求されたサービスのIDです。 | 

### レスポンス {#response-2}

#### レスポンススキーマ {#response-schema-2}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | 一意のサービスIDです。 | 
| name | string | サービスの名前です。最大50文字までの英数字と空白の文字列です。 | 
| provider | string | クラウドプロバイダー | 
| region | string | サービスのリージョンです。 | 
| state | string | サービスの現在の状態です。 | 
| endpoints | array | すべてのサービスエンドポイントのリストです。 | 
| tier | string | BASIC、SCALE、およびENTERPRISE組織ティアに対しては非推奨です。サービスのティア: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. プロダクションサービスはスケール可能で、開発は固定サイズになります。Azureサービスは開発ティアをサポートしていません。 | 
| minTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のあるサービスには不正確です。三つのワーカーの最小メモリ（GB単位）です。'production'サービスのみが対象です。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のあるサービスには不正確です。三つのワーカーの最大メモリ（GB単位）です。'production'サービスのみが対象です。12の倍数であり、無償サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 | 
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小合計メモリ（GB単位）です。4の倍数でなければなりません。 | 
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大合計メモリ（GB単位）です。4の倍数でなければならず、無償サービスの場合は120*以下、有料サービスの場合は236*以下でなければなりません。* - 最大レプリカサイズは選択した地域のクラウドプロバイダーのハードウェア可用性に依存します。 | 
| numReplicas | number | サービスのレプリカ数です。データウェアハウスで最初のサービスのレプリカ数は2から20の間である必要があります。既存のデータウェアハウスで作成されるサービスは、1つのレプリカのみ持つことができます。組織のティアに応じてさらに制限が適用される場合があります。基本ティアではデフォルトで1、スケールおよびエンタープライズティアでは3に設定されます。 | 
| idleScaling | boolean | trueに設定されている場合、サービスはアイドル時にゼロにスケールダウンすることができます。デフォルトではtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 | 
| ipAccessList | array | サービスにアクセスを許可されたIPアドレスのリストです。 | 
| createdAt | date-time | サービスの作成タイムスタンプです。ISO-8601形式です。 | 
| encryptionKey | string | オプションの顧客提供のディスク暗号化キーです。 | 
| encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロールです。 | 
| iamRole | string | S3のオブジェクトにアクセスするために使用されるIAMロールです。 | 
| privateEndpointIds | array | プライベートエンドポイントのリストです。 | 
| dataWarehouseId | string | このサービスを含むデータウェアハウスです。 | 
| isPrimary | boolean | このサービスがデータウェアハウス内の主要サービスである場合はtrueです。 | 
| isReadonly | boolean | このサービスが読み取り専用の場合はtrueです。dataWarehouseIdが提供されている場合にのみ読み取り専用に設定できます。 | 
| releaseChannel | string | 新しいClickHouseのリリースをできるだけ早く取得したい場合はfastを選択してください。新しい機能をより早く得られますが、バグのリスクが高くなります。この機能はプロダクションサービスのみに利用可能です。 | 
| byocId | string | Bring Your Own Cloud (BYOC)のためにリージョンを設定した後に返されるIDです。byocIdパラメータが指定されると、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要になり、次のサイズの中のいずれかの値が含まれている必要があります：28、60、124、188、252、380。 | 

#### サンプルレスポンス {#sample-response-2}

```
{
  "id": "uuid",
  "name": "string",
  "provider": "string",
  "region": "string",
  "state": "string",
  "endpoints": "Array",
  "tier": "string",
  "minTotalMemoryGb": 0,
  "maxTotalMemoryGb": 0,
  "minReplicaMemoryGb": 0,
  "maxReplicaMemoryGb": 0,
  "numReplicas": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time",
  "encryptionKey": "string",
  "encryptionAssumedRoleIdentifier": "string",
  "iamRole": "string",
  "privateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## サービスの基本詳細を更新 {#update-service-basic-details}

サービス名やIPアクセスリストなど、基本的なサービスの詳細を更新します。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}` |

### リクエスト {#request-3}

#### パスパラメータ {#path-params-3}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のIDです。 | 
| serviceId | uuid | 更新するサービスのIDです。 | 

### ボディパラメータ {#body-params-1}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| name | string | サービスの名前です。最大50文字までの英数字と空白の文字列です。 | 
| ipAccessList |  |  | 
| privateEndpointIds |  |  | 
| releaseChannel | string | 新しいClickHouseのリリースをできるだけ早く取得したい場合はfastを選択してください。新しい機能をより早く得られますが、バグのリスクが高くなります。この機能はプロダクションサービスのみに利用可能です。 | 
| endpoints | array | 変更するサービスエンドポイントのリストです。 | 

### レスポンス {#response-3}

#### レスポンススキーマ {#response-schema-3}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | 一意のサービスIDです。 | 
| name | string | サービスの名前です。最大50文字までの英数字と空白の文字列です。 | 
| provider | string | クラウドプロバイダー | 
| region | string | サービスのリージョンです。 | 
| state | string | サービスの現在の状態です。 | 
| endpoints | array | すべてのサービスエンドポイントのリストです。 | 
| tier | string | BASIC、SCALE、およびENTERPRISE組織ティアに対しては非推奨です。サービスのティア: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. プロダクションサービスはスケール可能で、開発は固定サイズになります。Azureサービスは開発ティアをサポートしていません。 | 
| minTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のあるサービスには不正確です。三つのワーカーの最小メモリ（GB単位）です。'production'サービスのみが対象です。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のあるサービスには不正確です。三つのワーカーの最大メモリ（GB単位）です。'production'サービスのみが対象です。12の倍数であり、無償サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 | 
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小合計メモリ（GB単位）です。4の倍数でなければなりません。 | 
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大合計メモリ（GB単位）です。4の倍数でなければならず、無償サービスの場合は120*以下、有料サービスの場合は236*以下でなければなりません。* - 最大レプリカサイズは選択した地域のクラウドプロバイダーのハードウェア可用性に依存します。 | 
| numReplicas | number | サービスのレプリカ数です。データウェアハウスで最初のサービスのレプリカ数は2から20の間である必要があります。既存のデータウェアハウスで作成されるサービスは、1つのレプリカのみ持つことができます。組織のティアに応じてさらに制限が適用される場合があります。基本ティアではデフォルトで1、スケールおよびエンタープライズティアでは3に設定されます。 | 
| idleScaling | boolean | trueに設定されている場合、サービスはアイドル時にゼロにスケールダウンすることができます。デフォルトではtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 | 
| ipAccessList | array | サービスにアクセスを許可されたIPアドレスのリストです。 | 
| createdAt | date-time | サービスの作成タイムスタンプです。ISO-8601形式です。 | 
| encryptionKey | string | オプションの顧客提供のディスク暗号化キーです。 | 
| encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロールです。 | 
| iamRole | string | S3のオブジェクトにアクセスするために使用されるIAMロールです。 | 
| privateEndpointIds | array | プライベートエンドポイントのリストです。 | 
| dataWarehouseId | string | このサービスを含むデータウェアハウスです。 | 
| isPrimary | boolean | このサービスがデータウェアハウス内の主要サービスである場合はtrueです。 | 
| isReadonly | boolean | このサービスが読み取り専用の場合はtrueです。dataWarehouseIdが提供されている場合にのみ読み取り専用に設定できます。 | 
| releaseChannel | string | 新しいClickHouseのリリースをできるだけ早く取得したい場合はfastを選択してください。新しい機能をより早く得られますが、バグのリスクが高くなります。この機能はプロダクションサービスのみに利用可能です。 | 
| byocId | string | Bring Your Own Cloud (BYOC)のためにリージョンを設定した後に返されるIDです。byocIdパラメータが指定されると、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要になり、次のサイズの中のいずれかの値が含まれている必要があります：28、60、124、188、252、380。 | 

#### サンプルレスポンス {#sample-response-3}

```
{
  "id": "uuid",
  "name": "string",
  "provider": "string",
  "region": "string",
  "state": "string",
  "endpoints": "Array",
  "tier": "string",
  "minTotalMemoryGb": 0,
  "maxTotalMemoryGb": 0,
  "minReplicaMemoryGb": 0,
  "maxReplicaMemoryGb": 0,
  "numReplicas": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time",
  "encryptionKey": "string",
  "encryptionAssumedRoleIdentifier": "string",
  "iamRole": "string",
  "privateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## サービスを削除 {#delete-service}

サービスを削除します。サービスは停止状態でなければならず、このメソッド呼び出しの後に非同期で削除されます。

| メソッド | パス |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/services/{serviceId}` |

### リクエスト {#request-4}

#### パスパラメータ {#path-params-4}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のIDです。 | 
| serviceId | uuid | 削除するサービスのIDです。 | 

## プライベートエンドポイント構成を取得 {#get-private-endpoint-configuration}

プライベートエンドポイントを設定するために必要な情報です。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/privateEndpointConfig` |

### リクエスト {#request-5}

#### パスパラメータ {#path-params-5}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のIDです。 | 
| serviceId | uuid | 要求されたサービスのIDです。 | 

### レスポンス {#response-4}

#### レスポンススキーマ {#response-schema-4}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| endpointServiceId | string | AWS（サービス名）、GCP（ターゲットサービス）、またはAZURE（プライベートリンクサービス）リソースに作成したインターフェースエンドポイントの一意の識別子 | 
| privateDnsHostname | string | 作成したVPCのプライベートDNSホスト名 | 

#### サンプルレスポンス {#sample-response-4}

```
{
  "endpointServiceId": "string",
  "privateDnsHostname": "string"
}
```

## 特定のインスタンスのサービスクエリエンドポイントを取得 {#get-the-service-query-endpoint-for-a-given-instance}

これは実験的な機能です。サポートに連絡して有効にしてください。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |

### リクエスト {#request-6}

#### パスパラメータ {#path-params-6}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のIDです。 | 
| serviceId | uuid | 要求されたサービスのIDです。 | 

### レスポンス {#response-5}

#### レスポンススキーマ {#response-schema-5}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | string | サービスクエリエンドポイントのIDです。 | 
| openApiKeys | array | サービスクエリエンドポイントにアクセスできるOpenAPIキーのリストです。 | 
| roles | array | サービスクエリエンドポイントにアクセスできるロールのリストです。 | 
| allowedOrigins | string | コロン区切りのドメインリストとして許可されるオリジンです。 | 

#### サンプルレスポンス {#sample-response-5}

```
{
  "id": "string",
  "openApiKeys": "Array",
  "roles": "Array",
  "allowedOrigins": "string"
}
```

## 特定のインスタンスのサービスクエリエンドポイントを削除 {#delete-the-service-query-endpoint-for-a-given-instance}

これは実験的な機能です。サポートに連絡して有効にしてください。

| メソッド | パス |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |

### リクエスト {#request-7}

#### パスパラメータ {#path-params-7}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のIDです。 | 
| serviceId | uuid | 要求されたサービスのIDです。 | 

## 特定のインスタンスのサービスクエリエンドポイントをアップサート {#upsert-the-service-query-endpoint-for-a-given-instance}

これは実験的な機能です。サポートに連絡して有効にしてください。

| メソッド | パス |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |

### リクエスト {#request-8}

#### パスパラメータ {#path-params-8}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のIDです。 | 
| serviceId | uuid | 要求されたサービスのIDです。 | 

### ボディパラメータ {#body-params-2}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| roles | array | ロールのリストです。 | 
| openApiKeys | array | サービスクエリエンドポイントのバージョン | 
| allowedOrigins | string | コロン区切りのドメインリストとして許可されるオリジンです。 | 

### レスポンス {#response-6}

#### レスポンススキーマ {#response-schema-6}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | string | サービスクエリエンドポイントのIDです。 | 
| openApiKeys | array | サービスクエリエンドポイントにアクセスできるOpenAPIキーのリストです。 | 
| roles | array | サービスクエリエンドポイントにアクセスできるロールのリストです。 | 
| allowedOrigins | string | コロン区切りのドメインリストとして許可されるオリジンです。 | 

#### サンプルレスポンス {#sample-response-6}

```
{
  "id": "string",
  "openApiKeys": "Array",
  "roles": "Array",
  "allowedOrigins": "string"
}
```

## サービスの状態を更新 {#update-service-state}

サービスを開始または停止します。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/state` |

### リクエスト {#request-9}

#### パスパラメータ {#path-params-9}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のIDです。 | 
| serviceId | uuid | 状態を更新するサービスのIDです。 | 

### ボディパラメータ {#body-params-3}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| command | string | 状態を変更するためのコマンド: 'start', 'stop'. | 

### レスポンス {#response-7}

#### レスポンススキーマ {#response-schema-7}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | 一意のサービスIDです。 | 
| name | string | サービスの名前です。最大50文字までの英数字と空白の文字列です。 | 
| provider | string | クラウドプロバイダー | 
| region | string | サービスのリージョンです。 | 
| state | string | サービスの現在の状態です。 | 
| endpoints | array | すべてのサービスエンドポイントのリストです。 | 
| tier | string | BASIC、SCALE、およびENTERPRISE組織ティアに対しては非推奨です。サービスのティア: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. プロダクションサービスはスケール可能で、開発は固定サイズになります。Azureサービスは開発ティアをサポートしていません。 | 
| minTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のあるサービスには不正確です。三つのワーカーの最小メモリ（GB単位）です。'production'サービスのみが対象です。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のあるサービスには不正確です。三つのワーカーの最大メモリ（GB単位）です。'production'サービスのみが対象です。12の倍数であり、無償サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 | 
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小合計メモリ（GB単位）です。4の倍数でなければなりません。 | 
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大合計メモリ（GB単位）です。4の倍数でなければならず、無償サービスの場合は120*以下、有料サービスの場合は236*以下でなければなりません。* - 最大レプリカサイズは選択した地域のクラウドプロバイダーのハードウェア可用性に依存します。 | 
| numReplicas | number | サービスのレプリカ数です。データウェアハウスで最初のサービスのレプリカ数は2から20の間である必要があります。既存のデータウェアハウスで作成されるサービスは、1つのレプリカのみ持つことができます。組織のティアに応じてさらに制限が適用される場合があります。基本ティアではデフォルトで1、スケールおよびエンタープライズティアでは3に設定されます。 | 
| idleScaling | boolean | trueに設定されている場合、サービスはアイドル時にゼロにスケールダウンすることができます。デフォルトではtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 | 
| ipAccessList | array | サービスにアクセスを許可されたIPアドレスのリストです。 | 
| createdAt | date-time | サービスの作成タイムスタンプです。ISO-8601形式です。 | 
| encryptionKey | string | オプションの顧客提供のディスク暗号化キーです。 | 
| encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロールです。 | 
| iamRole | string | S3のオブジェクトにアクセスするために使用されるIAMロールです。 | 
| privateEndpointIds | array | プライベートエンドポイントのリストです。 | 
| dataWarehouseId | string | このサービスを含むデータウェアハウスです。 | 
| isPrimary | boolean | このサービスがデータウェアハウス内の主要サービスである場合はtrueです。 | 
| isReadonly | boolean | このサービスが読み取り専用の場合はtrueです。dataWarehouseIdが提供されている場合にのみ読み取り専用に設定できます。 | 
| releaseChannel | string | 新しいClickHouseのリリースをできるだけ早く取得したい場合はfastを選択してください。新しい機能をより早く得られますが、バグのリスクが高くなります。この機能はプロダクションサービスのみに利用可能です。 | 
| byocId | string | Bring Your Own Cloud (BYOC)のためにリージョンを設定した後に返されるIDです。byocIdパラメータが指定されると、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要になり、次のサイズの中のいずれかの値が含まれている必要があります：28、60、124、188、252、380。 | 

#### サンプルレスポンス {#sample-response-7}

```
{
  "id": "uuid",
  "name": "string",
  "provider": "string",
  "region": "string",
  "state": "string",
  "endpoints": "Array",
  "tier": "string",
  "minTotalMemoryGb": 0,
  "maxTotalMemoryGb": 0,
  "minReplicaMemoryGb": 0,
  "maxReplicaMemoryGb": 0,
  "numReplicas": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time",
  "encryptionKey": "string",
  "encryptionAssumedRoleIdentifier": "string",
  "iamRole": "string",
  "privateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```
```json
{
  "ipAccessList": "Array",
  "createdAt": "date-time",
  "encryptionKey": "string",
  "encryptionAssumedRoleIdentifier": "string",
  "iamRole": "string",
  "privateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## サービスのオートスケーリング設定の更新 {#update-service-auto-scaling-settings}

サービスの最小および最大メモリ制限とアイドルモードのスケーリング動作を更新します。メモリ設定は「本番」サービスのみに利用可能で、24GBから始まる12の倍数でなければなりません。numReplicasの調整を有効にするには、サポートに連絡してください。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/scaling` |

### リクエスト {#request-10}

#### パスパラメータ {#path-params-10}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | スケーリングパラメータを更新するサービスのID。 |

### ボディパラメータ {#body-params-4}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| minTotalMemoryGb | number | 廃止予定 - デフォルト以外のレプリカ数を持つサービスには不正確です。オートスケーリング中の3つのワーカーの最小メモリ（Gb単位）。「本番」サービスのみに利用可能。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 廃止予定 - デフォルト以外のレプリカ数を持つサービスには不正確です。オートスケーリング中の3つのワーカーの最大メモリ（Gb単位）。「本番」サービスのみに利用可能。12の倍数であり、課金されていないサービスの場合は360以下、課金されているサービスの場合は708以下でなければなりません。 | 
| numReplicas | number | サービスのレプリカ数。倉庫内の最初のサービスに対してレプリカ数は2から20の範囲でなければなりません。既存の倉庫で作成されたサービスは、レプリカ数が1でも問題ありません。制限は、組織のティアによって異なる場合があります。BASICティアにはデフォルトで1、SCALEおよびENTERPRISEティアにはデフォルトで3が設定されています。 | 
| idleScaling | boolean | trueに設定された場合、サービスはアイドル時にゼロにスケールダウンすることが許可されます。デフォルトはtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 |

### レスポンス {#response-8}

#### レスポンススキーマ {#response-schema-8}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなサービスID。 | 
| name | string | サービスの名前。最大50文字の空白を含む英数字の文字列。 | 
| provider | string | クラウドプロバイダー | 
| region | string | サービスの地域。 | 
| state | string | サービスの現在の状態。 | 
| endpoints | array | すべてのサービスエンドポイントのリスト。 | 
| tier | string | BASIC、SCALE、ENTERPRISE組織ティアに対して廃止予定。サービスのティア： 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'。生産サービスはスケールし、開発サービスは固定サイズです。Azureサービスは開発ティアをサポートしていません。 | 
| minTotalMemoryGb | number | 廃止予定 - デフォルト以外のレプリカ数を持つサービスには不正確です。オートスケーリング中の3つのワーカーの最小メモリ（Gb単位）。「本番」サービスのみに利用可能。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 廃止予定 - デフォルト以外のレプリカ数を持つサービスには不正確です。オートスケーリング中の3つのワーカーの最大メモリ（Gb単位）。「本番」サービスのみに利用可能。12の倍数であり、課金されていないサービスの場合は360以下、課金されているサービスの場合は708以下でなければなりません。 | 
| minReplicaMemoryGb | number | シングルレプリカ用のオートスケーリング中の最小合計メモリ（Gb単位）。「本番」サービスのみに利用可能。4の倍数であり、8以上でなければなりません。 | 
| maxReplicaMemoryGb | number | シングルレプリカ用のオートスケーリング中の最大合計メモリ（Gb単位）。「本番」サービスのみに利用可能。4の倍数であり、課金されていないサービスの場合は120以下、課金されているサービスの場合は236以下でなければなりません。* - 最大レプリカサイズは、選択した地域におけるクラウドプロバイダーのハードウェアの利用可能性に基づいています。 |
| numReplicas | number | サービスのレプリカ数。倉庫内の最初のサービスに対してレプリカ数は2から20の範囲でなければなりません。既存の倉庫で作成されたサービスは、レプリカ数が1でも問題ありません。制限は、組織のティアによって異なる場合があります。BASICティアにはデフォルトで1、SCALEおよびENTERPRISEティアにはデフォルトで3が設定されています。 | 
| idleScaling | boolean | trueに設定された場合、サービスはアイドル時にゼロにスケールダウンすることが許可されます。デフォルトはtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 | 
| ipAccessList | array | サービスにアクセスを許可されているIPアドレスのリスト。 | 
| createdAt | date-time | サービス作成タイムスタンプ。ISO-8601形式。 | 
| encryptionKey | string | オプションの顧客提供のディスク暗号化キー。 | 
| encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロール。 | 
| iamRole | string | S3内のオブジェクトにアクセスするために使用されるIAMロール。 | 
| privateEndpointIds | array | プライベートエンドポイントのリスト。 | 
| dataWarehouseId | string | このサービスを含むデータウェアハウス。 | 
| isPrimary | boolean | このサービスがデータウェアハウス内のプライマリサービスである場合はtrue。 | 
| isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供された場合のみ読み取り専用にすることができます。 | 
| releaseChannel | string | 新しいClickHouseリリースをできるだけ早く受け取るには、fastを選択してください。新機能をすぐに得ることができますが、バグのリスクも高まります。この機能は本番サービスのみに使用可能です。 | 
| byocId | string | Bring Your Own Cloud（BYOC）用にリージョンを設定した後に返されるIDです。byocIdパラメータが指定された場合、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要で、以下のサイズのいずれかを含む必要があります：28、60、124、188、252、380。 |

#### サンプルレスポンス {#sample-response-8}

```
{
  "id": "uuid",
  "name": "string",
  "provider": "string",
  "region": "string",
  "state": "string",
  "endpoints": "Array",
  "tier": "string",
  "minTotalMemoryGb": 0,
  "maxTotalMemoryGb": 0,
  "minReplicaMemoryGb": 0,
  "maxReplicaMemoryGb": 0,
  "numReplicas": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time",
  "encryptionKey": "string",
  "encryptionAssumedRoleIdentifier": "string",
  "iamRole": "string",
  "privateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## サービスのオートスケーリング設定の更新 {#update-service-auto-scaling-settings-1}

レプリカごとの最小および最大メモリ制限とアイドルモードのスケーリング動作を更新します。メモリ設定は「本番」サービスのみに利用可能で、8GBから始まる4の倍数でなければなりません。numReplicasの調整を有効にするには、サポートに連絡してください。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/replicaScaling` |

### リクエスト {#request-11}

#### パスパラメータ {#path-params-11}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | スケーリングパラメータを更新するサービスのID。 | 

### ボディパラメータ {#body-params-5}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| minReplicaMemoryGb | number | シングルレプリカ用の最小オートスケーリングメモリ（Gb単位）。「本番」サービスのみに利用可能。4の倍数であり、8以上でなければなりません。 | 
| maxReplicaMemoryGb | number | シングルレプリカ用の最大オートスケーリングメモリ（Gb単位）。「本番」サービスのみに利用可能。4の倍数であり、課金されていないサービスの場合は120以下、課金されているサービスの場合は236以下でなければなりません。 | 
| numReplicas | number | サービスのレプリカ数。倉庫内の最初のサービスに対してレプリカ数は2から20の範囲でなければなりません。既存の倉庫で作成されたサービスは、レプリカ数が1でも問題ありません。制限は、組織のティアによって異なる場合があります。BASICティアにはデフォルトで1、SCALEおよびENTERPRISEティアにはデフォルトで3が設定されています。 | 
| idleScaling | boolean | trueに設定された場合、サービスはアイドル時にゼロにスケールダウンすることが許可されます。デフォルトはtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 |

### レスポンス {#response-9}

#### レスポンススキーマ {#response-schema-9}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなサービスID。 | 
| name | string | サービスの名前。最大50文字の空白を含む英数字の文字列。 | 
| provider | string | クラウドプロバイダー | 
| region | string | サービスの地域。 | 
| state | string | サービスの現在の状態。 | 
| endpoints | array | すべてのサービスエンドポイントのリスト。 | 
| tier | string | BASIC、SCALE、ENTERPRISE組織ティアに対して廃止予定。サービスのティア： 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'。生産サービスはスケールし、開発サービスは固定サイズです。Azureサービスは開発ティアをサポートしていません。 | 
| minTotalMemoryGb | number | 廃止予定 - デフォルト以外のレプリカ数を持つサービスには不正確です。オートスケーリング中の3つのワーカーの最小メモリ（Gb単位）。「本番」サービスのみに利用可能。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 廃止予定 - デフォルト以外のレプリカ数を持つサービスには不正確です。オートスケーリング中の3つのワーカーの最大メモリ（Gb単位）。「本番」サービスのみに利用可能。12の倍数であり、課金されていないサービスの場合は360以下、課金されているサービスの場合は708以下でなければなりません。 | 
| minReplicaMemoryGb | number | シングルレプリカ用の最小オートスケーリングメモリ（Gb単位）。「本番」サービスのみに利用可能。4の倍数であり、8以上でなければなりません。 | 
| maxReplicaMemoryGb | number | シングルレプリカ用の最大オートスケーリングメモリ（Gb単位）。「本番」サービスのみに利用可能。4の倍数であり、課金されていないサービスの場合は120以下、課金されているサービスの場合は236以下でなければなりません。 | 
| numReplicas | number | サービスのレプリカ数。倉庫内の最初のサービスに対してレプリカ数は2から20の範囲でなければなりません。既存の倉庫で作成されたサービスは、レプリカ数が1でも問題ありません。制限は、組織のティアによって異なる場合があります。BASICティアにはデフォルトで1、SCALEおよびENTERPRISEティアにはデフォルトで3が設定されています。 | 
| idleScaling | boolean | trueに設定された場合、サービスはアイドル時にゼロにスケールダウンすることが許可されます。デフォルトはtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 | 
| ipAccessList | array | サービスにアクセスを許可されているIPアドレスのリスト。 | 
| createdAt | date-time | サービス作成タイムスタンプ。ISO-8601形式。 | 
| encryptionKey | string | オプションの顧客提供のディスク暗号化キー。 | 
| encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロール。 | 
| iamRole | string | S3内のオブジェクトにアクセスするために使用されるIAMロール。 | 
| privateEndpointIds | array | プライベートエンドポイントのリスト。 | 
| dataWarehouseId | string | このサービスを含むデータウェアハウス。 | 
| isPrimary | boolean | このサービスがデータウェアハウス内のプライマリサービスである場合はtrue。 | 
| isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供された場合のみ読み取り専用にすることができます。 | 
| releaseChannel | string | 新しいClickHouseリリースをできるだけ早く受け取るには、fastを選択してください。新機能をすぐに得ることができますが、バグのリスクも高まります。この機能は本番サービスのみに使用可能です。 | 
| byocId | string | Bring Your Own Cloud（BYOC）用にリージョンを設定した後に返されるIDです。byocIdパラメータが指定された場合、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要で、以下のサイズのいずれかを含む必要があります：28、60、124、188、252、380。 |

#### サンプルレスポンス {#sample-response-9}

```
{
  "id": "uuid",
  "name": "string",
  "provider": "string",
  "region": "string",
  "state": "string",
  "endpoints": "Array",
  "tier": "string",
  "minTotalMemoryGb": 0,
  "maxTotalMemoryGb": 0,
  "minReplicaMemoryGb": 0,
  "maxReplicaMemoryGb": 0,
  "numReplicas": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time",
  "encryptionKey": "string",
  "encryptionAssumedRoleIdentifier": "string",
  "iamRole": "string",
  "privateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## サービスのパスワードを更新 {#update-service-password}

サービスの新しいパスワードを設定します。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/password` |

### リクエスト {#request-12}

#### パスパラメータ {#path-params-12}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | パスワードを更新するサービスのID。 | 

### ボディパラメータ {#body-params-6}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| newPasswordHash | string | オプションのパスワードハッシュ。ネットワーク越しのパスワード送信を避けるために使用されます。指定されない場合は新しいパスワードが生成され、レスポンスに含まれます。このハッシュが使用されます。アルゴリズム: echo -n "yourpassword" | sha256sum | tr -d '-' | xxd -r -p | base64 | 
| newDoubleSha1Hash | string | MySQLプロトコル用のオプションのダブルSHA1パスワードハッシュ。newPasswordHashが指定されていない場合、このキーは無視され、生成されたパスワードが使用されます。アルゴリズム: echo -n "yourpassword" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-' | 

### レスポンス {#response-10}

#### レスポンススキーマ {#response-schema-10}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| password | string | 新しいサービスのパスワード。リクエストに'newPasswordHash'が含まれていない場合のみ提供されます。 |

#### サンプルレスポンス {#sample-response-10}

```
{
  "password": "string"
}
```

## Prometheusメトリックの取得 {#get-prometheus-metrics}

サービスのPrometheusメトリックを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/prometheus` |

### リクエスト {#request-13}

#### パスパラメータ {#path-params-13}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | リクエストされたサービスのID。 | 
| filtered_metrics | boolean | フィルタリングされたPrometheusメトリックのリストを返します。 | 


## サービスバックアップのリスト {#list-of-service-backups}

サービスのすべてのバックアップのリストを返します。最も新しいバックアップがリストの先頭に表示されます。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backups` |

### リクエスト {#request-14}

#### パスパラメータ {#path-params-14}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | バックアップを所有する組織のID。 | 
| serviceId | uuid | バックアップが作成されたサービスのID。 | 


### レスポンス {#response-11}

#### レスポンススキーマ {#response-schema-11}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなバックアップID。 | 
| status | string | バックアップの状態： 'done', 'error', 'in_progress'。 | 
| serviceId | string | 名前  | 
| startedAt | date-time | バックアップ開始のタイムスタンプ。ISO-8601形式。 | 
| finishedAt | date-time | バックアップ終了のタイムスタンプ。ISO-8601形式。終了したバックアップのみ利用可能 | 
| sizeInBytes | number | バックアップのサイズ（バイト単位）。 | 
| durationInSeconds | number | バックアップを実行するのにかかった時間（秒単位）。状態がまだin_progressの場合、これはバックアップが開始されてから今までの経過時間を秒単位で示します。 | 
| type | string | バックアップタイプ（"full"または"incremental"）。 | 

#### サンプルレスポンス {#sample-response-11}

```
{
  "id": "uuid",
  "status": "string",
  "serviceId": "string",
  "startedAt": "date-time",
  "finishedAt": "date-time",
  "sizeInBytes": 0,
  "durationInSeconds": 0,
  "type": "string"
}
```

## バックアップ詳細の取得 {#get-backup-details}

単一のバックアップ情報を返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backups/{backupId}` |

### リクエスト {#request-15}

#### パスパラメータ {#path-params-15}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | バックアップを所有する組織のID。 | 
| serviceId | uuid | バックアップが作成されたサービスのID。 | 
| backupId | uuid | リクエストされたバックアップのID。 | 


### レスポンス {#response-12}

#### レスポンススキーマ {#response-schema-12}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなバックアップID。 | 
| status | string | バックアップの状態： 'done', 'error', 'in_progress'。 | 
| serviceId | string | 名前  | 
| startedAt | date-time | バックアップ開始のタイムスタンプ。ISO-8601形式。 | 
| finishedAt | date-time | バックアップ終了のタイムスタンプ。ISO-8601形式。終了したバックアップのみ利用可能 | 
| sizeInBytes | number | バックアップのサイズ（バイト単位）。 | 
| durationInSeconds | number | バックアップを実行するのにかかった時間（秒単位）。状態がまだin_progressの場合、これはバックアップが開始されてから今までの経過時間を秒単位で示します。 | 
| type | string | バックアップタイプ（"full"または"incremental"）。 | 

#### サンプルレスポンス {#sample-response-12}

```
{
  "id": "uuid",
  "status": "string",
  "serviceId": "string",
  "startedAt": "date-time",
  "finishedAt": "date-time",
  "sizeInBytes": 0,
  "durationInSeconds": 0,
  "type": "string"
}
```

## サービスバックアップ設定の取得 {#get-service-backup-configuration}

サービスバックアップ設定を返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backupConfiguration` |

### リクエスト {#request-16}

#### パスパラメータ {#path-params-16}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | サービスのID。 | 


### レスポンス {#response-13}

#### レスポンススキーマ {#response-schema-13}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | 各バックアップ間の時間間隔（時間単位）。 | 
| backupRetentionPeriodInHours | number | バックアップが利用可能な最小期間（時間単位）。 | 
| backupStartTime | string | バックアップを実行する時間（HH:MM形式、UTCタイムゾーンで評価）。定義された場合、バックアップ期間は24時間ごとにリセットされます。 | 

#### サンプルレスポンス {#sample-response-13}

```
{
  "backupPeriodInHours": 0,
  "backupRetentionPeriodInHours": 0,
  "backupStartTime": "string"
}
```

## サービスバックアップ設定の更新 {#update-service-backup-configuration}

サービスバックアップ設定を更新します。ADMIN認証キーの役割が必要です。null値を持つプロパティを設定すると、プロパティはデフォルト値にリセットされます。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/backupConfiguration` |

### リクエスト {#request-17}

#### パスパラメータ {#path-params-17}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | サービスのID。 | 

### ボディパラメータ {#body-params-7}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | 各バックアップ間の時間間隔（時間単位）。 | 
| backupRetentionPeriodInHours | number | バックアップが利用可能な最小期間（時間単位）。 | 
| backupStartTime | string | バックアップを実行する時間（HH:MM形式、UTCタイムゾーンで評価）。定義された場合、バックアップ期間は24時間ごとにリセットされます。 |

### レスポンス {#response-14}

#### レスポンススキーマ {#response-schema-14}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | 各バックアップ間の時間間隔（時間単位）。 | 
| backupRetentionPeriodInHours | number | バックアップが利用可能な最小期間（時間単位）。 | 
| backupStartTime | string | バックアップを実行する時間（HH:MM形式、UTCタイムゾーンで評価）。定義された場合、バックアップ期間は24時間ごとにリセットされます。 |

#### サンプルレスポンス {#sample-response-14}

```
{
  "backupPeriodInHours": 0,
  "backupRetentionPeriodInHours": 0,
  "backupStartTime": "string"
}
```
