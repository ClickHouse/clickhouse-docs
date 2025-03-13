---
sidebar_label: 'サービス'
title: 'サービス'
---

## 組織サービスの一覧

組織内のすべてのサービスのリストを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services` |

### リクエスト
#### パスパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 |

### レスポンス
#### レスポンススキーマ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなサービスID。 |
| name | string | サービスの名前。空白を含む最大50文字の英数字の文字列。 |
| provider | string | クラウドプロバイダー |
| region | string | サービス地域。 |
| state | string | サービスの現在の状態。 |
| endpoints | array | すべてのサービスエンドポイントのリスト。 |
| tier | string | BASIC、SCALE、およびENTERPRISE組織ティアに対しては非推奨。サービスのティア：'development'、'production'、'dedicated_high_mem'、'dedicated_high_cpu'、'dedicated_standard'、'dedicated_standard_n2d_standard_4'、'dedicated_standard_n2d_standard_8'、'dedicated_standard_n2d_standard_32'、'dedicated_standard_n2d_standard_128'、'dedicated_standard_n2d_standard_32_16SSD'、'dedicated_standard_n2d_standard_64_24SSD'。プロダクションサービスはスケールする、開発は固定サイズです。AzureサービスはDevelopmentティアをサポートしていません。 |
| minTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のサービスでは不正確。自動スケーリング中の3つのワーカーの最小メモリ（Gb）。'production'サービスのみ利用可能。12の倍数で、24以上でなければなりません。 |
| maxTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のサービスでは不正確。自動スケーリング中の3つのワーカーの最大メモリ（Gb）。'production'サービスのみ利用可能。12の倍数で、非有料サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 |
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小トータルメモリ（Gb）。4の倍数で、8以上でなければなりません。 |
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大トータルメモリ（Gb）。4の倍数で、非有料サービスの場合は120*以下、有料サービスの場合は236*以下でなければなりません。* - 最大レプリカサイズは、選択された地域におけるクラウドプロバイダーのハードウェアの可用性に依存します。 |
| numReplicas | number | サービスのレプリカ数。最初のサービスのレプリカ数は2から20の範囲でなければなりません。既存のデータウェアハウスで作成されたサービスは、レプリカ数が1でも可能です。組織のティアに基づいて追加の制限が適用される場合があります。BASICティアの場合は1、SCALEおよびENTERPRISEティアの場合は3がデフォルトです。 |
| idleScaling | boolean | trueに設定すると、アイドル時にサービスがゼロにスケールダウンできることを意味します。デフォルトはtrueです。 |
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 |
| ipAccessList | array | サービスへのアクセスを許可されたIPアドレスのリスト |
| createdAt | date-time | サービス作成のタイムスタンプ。ISO-8601形式。 |
| encryptionKey | string | オプションの顧客提供のディスク暗号化キー |
| encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロール |
| iamRole | string | S3内のオブジェクトにアクセスするために使用されるIAMロール |
| privateEndpointIds | array | プライベートエンドポイントのリスト |
| availablePrivateEndpointIds | array | サービスに接続可能な利用可能なプライベートエンドポイントIDのリスト |
| dataWarehouseId | string | このサービスを含むデータウェアハウス |
| isPrimary | boolean | このサービスがデータウェアハウス内のプライマリサービスである場合はtrue |
| isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供されている場合のみ読み取り専用となります。 |
| releaseChannel | string | 新しいClickHouseのリリースを可能な限り早く受け取りたい場合はfastを選択します。新機能を迅速に取得できますが、バグのリスクが高くなります。この機能はプロダクションサービスにのみ利用可能です。 |
| byocId | string | Bring Your Own Cloud（BYOC）用に地域を設定した後に返されるIDです。byocIdパラメータが指定されている場合は、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要で、それぞれ次のサイズのいずれかの値を含める必要があります：28、60、124、188、252、380。 |

#### サンプルレスポンス

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
  "availablePrivateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## 新しいサービスを作成

組織に新しいサービスを作成し、サービスの現在の状態とサービスにアクセスするためのパスワードを返します。サービスは非同期に開始されます。

| メソッド | パス |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services` |

### リクエスト
#### パスパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |

### ボディパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| name | string | サービスの名前。空白を含む最大50文字の英数字の文字列。 |
| provider | string | クラウドプロバイダー |
| region | string | サービス地域。 |
| tier | string | BASIC、SCALE、およびENTERPRISE組織ティアに対しては非推奨。サービスのティア：'development'、'production'、'dedicated_high_mem'、'dedicated_high_cpu'、'dedicated_standard'、'dedicated_standard_n2d_standard_4'、'dedicated_standard_n2d_standard_8'、'dedicated_standard_n2d_standard_32'、'dedicated_standard_n2d_standard_128'、'dedicated_standard_n2d_standard_32_16SSD'、'dedicated_standard_n2d_standard_64_24SSD'。プロダクションサービスはスケールする、開発は固定サイズです。AzureサービスはDevelopmentティアをサポートしていません。 |
| ipAccessList | array | サービスへのアクセスを許可されたIPアドレスのリスト |
| minTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のサービスでは不正確。自動スケーリング中の3つのワーカーの最小メモリ（Gb）。'production'サービスのみ利用可能。12の倍数で、24以上でなければなりません。 |
| maxTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のサービスでは不正確。自動スケーリング中の3つのワーカーの最大メモリ（Gb）。'production'サービスのみ利用可能。12の倍数で、非有料サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 |
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小トータルメモリ（Gb）。4の倍数で、8以上でなければなりません。 |
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大トータルメモリ（Gb）。4の倍数で、非有料サービスの場合は120*以下、有料サービスの場合は236*以下でなければなりません。* - 最大レプリカサイズは、選択された地域におけるクラウドプロバイダーのハードウェアの可用性に依存します。 |
| numReplicas | number | サービスのレプリカ数。最初のサービスのレプリカ数は2から20の範囲でなければなりません。既存のデータウェアハウスで作成されたサービスは、レプリカ数が1でも可能です。組織のティアに基づいて追加の制限が適用される場合があります。BASICティアの場合は1、SCALEおよびENTERPRISEティアの場合は3がデフォルトです。 |
| idleScaling | boolean | trueに設定すると、アイドル時にサービスがゼロにスケールダウンできることを意味します。デフォルトはtrueです。 |
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 |
| isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供されている場合のみ読み取り専用となります。 |
| dataWarehouseId | string | このサービスを含むデータウェアハウス |
| backupId | string | 新しいサービスの初期状態として使用されるオプションのバックアップID。使用時には新しいインスタンスの地域とティアは、元のインスタンスの値と同じである必要があります。 |
| encryptionKey | string | オプションの顧客提供のディスク暗号化キー |
| encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロール |
| privateEndpointIds | array | プライベートエンドポイントのリスト |
| privatePreviewTermsChecked | boolean | プライベートプレビューの利用規約に同意します。プライベートプレビューの場合の組織内の最初のサービスを作成する場合にのみ必要です。 |
| releaseChannel | string | 新しいClickHouseのリリースを可能な限り早く受け取りたい場合はfastを選択します。新機能を迅速に取得できますが、バグのリスクが高くなります。この機能はプロダクションサービスにのみ利用可能です。 |
| byocId | string | Bring Your Own Cloud（BYOC）用に地域を設定した後に返されるIDです。byocIdパラメータが指定されている場合は、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要で、それぞれ次のサイズのいずれかの値を含める必要があります：28、60、124、188、252、380。 |
| endpoints | array | 有効または無効にするサービスエンドポイントのリスト |

### レスポンス
#### レスポンススキーマ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| service.id | uuid | ユニークなサービスID。 |
| service.name | string | サービスの名前。空白を含む最大50文字の英数字の文字列。 |
| service.provider | string | クラウドプロバイダー |
| service.region | string | サービス地域。 |
| service.state | string | サービスの現在の状態。 |
| service.endpoints | array | すべてのサービスエンドポイントのリスト。 |
| service.tier | string | BASIC、SCALE、およびENTERPRISE組織ティアに対しては非推奨。サービスのティア：'development'、'production'、'dedicated_high_mem'、'dedicated_high_cpu'、'dedicated_standard'、'dedicated_standard_n2d_standard_4'、'dedicated_standard_n2d_standard_8'、'dedicated_standard_n2d_standard_32'、'dedicated_standard_n2d_standard_128'、'dedicated_standard_n2d_standard_32_16SSD'、'dedicated_standard_n2d_standard_64_24SSD'。プロダクションサービスはスケールする、開発は固定サイズです。AzureサービスはDevelopmentティアをサポートしていません。 |
| service.minTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のサービスでは不正確。自動スケーリング中の3つのワーカーの最小メモリ（Gb）。'production'サービスのみ利用可能。12の倍数で、24以上でなければなりません。 |
| service.maxTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のサービスでは不正確。自動スケーリング中の3つのワーカーの最大メモリ（Gb）。'production'サービスのみ利用可能。12の倍数で、非有料サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 |
| service.minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小トータルメモリ（Gb）。4の倍数で、8以上でなければなりません。 |
| service.maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大トータルメモリ（Gb）。4の倍数で、非有料サービスの場合は120*以下、有料サービスの場合は236*以下でなければなりません。* - 最大レプリカサイズは、選択された地域におけるクラウドプロバイダーのハードウェアの可用性に依存します。 |
| service.numReplicas | number | サービスのレプリカ数。最初のサービスのレプリカ数は2から20の範囲でなければなりません。既存のデータウェアハウスで作成されたサービスは、レプリカ数が1でも可能です。組織のティアに基づいて追加の制限が適用される場合があります。BASICティアの場合は1、SCALEおよびENTERPRISEティアの場合は3がデフォルトです。 |
| service.idleScaling | boolean | trueに設定すると、アイドル時にサービスがゼロにスケールダウンできることを意味します。デフォルトはtrueです。 |
| service.idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 |
| service.ipAccessList | array | サービスへのアクセスを許可されたIPアドレスのリスト |
| service.createdAt | date-time | サービス作成のタイムスタンプ。ISO-8601形式。 |
| service.encryptionKey | string | オプションの顧客提供のディスク暗号化キー |
| service.encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロール |
| service.iamRole | string | S3内のオブジェクトにアクセスするために使用されるIAMロール |
| service.privateEndpointIds | array | プライベートエンドポイントのリスト |
| service.availablePrivateEndpointIds | array | サービスに接続可能な利用可能なプライベートエンドポイントIDのリスト |
| service.dataWarehouseId | string | このサービスを含むデータウェアハウス |
| service.isPrimary | boolean | このサービスがデータウェアハウス内のプライマリサービスである場合はtrue |
| service.isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供されている場合のみ読み取り専用となります。 |
| service.releaseChannel | string | 新しいClickHouseのリリースを可能な限り早く受け取りたい場合はfastを選択します。新機能を迅速に取得できますが、バグのリスクが高くなります。この機能はプロダクションサービスにのみ利用可能です。 |
| service.byocId | string | Bring Your Own Cloud（BYOC）用に地域を設定した後に返されるIDです。byocIdパラメータが指定されている場合は、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要で、それぞれ次のサイズのいずれかの値を含める必要があります：28、60、124、188、252、380。 |
| password | string | 新しく作成されたサービスのパスワード。 |

#### サンプルレスポンス

```
{
  "service": {
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
    "availablePrivateEndpointIds": "Array",
    "dataWarehouseId": "string",
    "isPrimary": "boolean",
    "isReadonly": "boolean",
    "releaseChannel": "string",
    "byocId": "string"
  },
  "password": "string"
}
```

## サービスの詳細を取得

組織に属するサービスを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}` |

### リクエスト
#### パスパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | リクエストされたサービスのID。 |

### レスポンス
#### レスポンススキーマ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなサービスID。 |
| name | string | サービスの名前。空白を含む最大50文字の英数字の文字列。 |
| provider | string | クラウドプロバイダー |
| region | string | サービス地域。 |
| state | string | サービスの現在の状態。 |
| endpoints | array | すべてのサービスエンドポイントのリスト。 |
| tier | string | BASIC、SCALE、およびENTERPRISE組織ティアに対しては非推奨。サービスのティア：'development'、'production'、'dedicated_high_mem'、'dedicated_high_cpu'、'dedicated_standard'、'dedicated_standard_n2d_standard_4'、'dedicated_standard_n2d_standard_8'、'dedicated_standard_n2d_standard_32'、'dedicated_standard_n2d_standard_128'、'dedicated_standard_n2d_standard_32_16SSD'、'dedicated_standard_n2d_standard_64_24SSD'。プロダクションサービスはスケールする、開発は固定サイズです。AzureサービスはDevelopmentティアをサポートしていません。 |
| minTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のサービスでは不正確。自動スケーリング中の3つのワーカーの最小メモリ（Gb）。'production'サービスのみ利用可能。12の倍数で、24以上でなければなりません。 |
| maxTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のサービスでは不正確。自動スケーリング中の3つのワーカーの最大メモリ（Gb）。'production'サービスのみ利用可能。12の倍数で、非有料サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 |
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小トータルメモリ（Gb）。4の倍数で、8以上でなければなりません。 |
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大トータルメモリ（Gb）。4の倍数で、非有料サービスの場合は120*以下、有料サービスの場合は236*以下でなければなりません。* - 最大レプリカサイズは、選択された地域におけるクラウドプロバイダーのハードウェアの可用性に依存します。 |
| numReplicas | number | サービスのレプリカ数。最初のサービスのレプリカ数は2から20の範囲でなければなりません。既存のデータウェアハウスで作成されたサービスは、レプリカ数が1でも可能です。組織のティアに基づいて追加の制限が適用される場合があります。BASICティアの場合は1、SCALEおよびENTERPRISEティアの場合は3がデフォルトです。 |
| idleScaling | boolean | trueに設定すると、アイドル時にサービスがゼロにスケールダウンできることを意味します。デフォルトはtrueです。 |
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 |
| ipAccessList | array | サービスへのアクセスを許可されたIPアドレスのリスト |
| createdAt | date-time | サービス作成のタイムスタンプ。ISO-8601形式。 |
| encryptionKey | string | オプションの顧客提供のディスク暗号化キー |
| encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロール |
| iamRole | string | S3内のオブジェクトにアクセスするために使用されるIAMロール |
| privateEndpointIds | array | プライベートエンドポイントのリスト |
| availablePrivateEndpointIds | array | サービスに接続可能な利用可能なプライベートエンドポイントIDのリスト |
| dataWarehouseId | string | このサービスを含むデータウェアハウス |
| isPrimary | boolean | このサービスがデータウェアハウス内のプライマリサービスである場合はtrue |
| isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供されている場合のみ読み取り専用となります。 |
| releaseChannel | string | 新しいClickHouseのリリースを可能な限り早く受け取りたい場合はfastを選択します。新機能を迅速に取得できますが、バグのリスクが高くなります。この機能はプロダクションサービスにのみ利用可能です。 |
| byocId | string | Bring Your Own Cloud（BYOC）用に地域を設定した後に返されるIDです。byocIdパラメータが指定されている場合は、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要で、それぞれ次のサイズのいずれかの値を含める必要があります：28、60、124、188、252、380。 |

#### サンプルレスポンス

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
  "availablePrivateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## サービスの基本詳細を更新

サービス名やIPアクセスリストなどの基本サービス詳細を更新します。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}` |

### リクエスト
#### パスパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | 更新するサービスのID。 |

### ボディパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| name | string | サービスの名前。空白を含む最大50文字の英数字の文字列。 |
| ipAccessList |  |  |
| privateEndpointIds |  |  |
| releaseChannel | string | 新しいClickHouseのリリースを可能な限り早く受け取りたい場合はfastを選択します。新機能を迅速に取得できますが、バグのリスクが高くなります。この機能はプロダクションサービスにのみ利用可能です。 |
| endpoints | array | 変更するサービスエンドポイントのリスト |

### レスポンス
#### レスポンススキーマ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなサービスID。 |
| name | string | サービスの名前。空白を含む最大50文字の英数字の文字列。 |
| provider | string | クラウドプロバイダー |
| region | string | サービス地域。 |
| state | string | サービスの現在の状態。 |
| endpoints | array | すべてのサービスエンドポイントのリスト。 |
| tier | string | BASIC、SCALE、およびENTERPRISE組織ティアに対しては非推奨。サービスのティア：'development'、'production'、'dedicated_high_mem'、'dedicated_high_cpu'、'dedicated_standard'、'dedicated_standard_n2d_standard_4'、'dedicated_standard_n2d_standard_8'、'dedicated_standard_n2d_standard_32'、'dedicated_standard_n2d_standard_128'、'dedicated_standard_n2d_standard_32_16SSD'、'dedicated_standard_n2d_standard_64_24SSD'。プロダクションサービスはスケールする、開発は固定サイズです。AzureサービスはDevelopmentティアをサポートしていません。 |
| minTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のサービスでは不正確。自動スケーリング中の3つのワーカーの最小メモリ（Gb）。'production'サービスのみ利用可能。12の倍数で、24以上でなければなりません。 |
| maxTotalMemoryGb | number | 非推奨 - デフォルト以外のレプリカ数のサービスでは不正確。自動スケーリング中の3つのワーカーの最大メモリ（Gb）。'production'サービスのみ利用可能。12の倍数で、非有料サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 |
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小トータルメモリ（Gb）。4の倍数で、8以上でなければなりません。 |
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大トータルメモリ（Gb）。4の倍数で、非有料サービスの場合は120*以下、有料サービスの場合は236*以下でなければなりません。* - 最大レプリカサイズは、選択された地域におけるクラウドプロバイダーのハードウェアの可用性に依存します。 |
| numReplicas | number | サービスのレプリカ数。最初のサービスのレプリカ数は2から20の範囲でなければなりません。既存のデータウェアハウスで作成されたサービスは、レプリカ数が1でも可能です。組織のティアに基づいて追加の制限が適用される場合があります。BASICティアの場合は1、SCALEおよびENTERPRISEティアの場合は3がデフォルトです。 |
| idleScaling | boolean | trueに設定すると、アイドル時にサービスがゼロにスケールダウンできることを意味します。デフォルトはtrueです。 |
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 |
| ipAccessList | array | サービスへのアクセスを許可されたIPアドレスのリスト |
| createdAt | date-time | サービス作成のタイムスタンプ。ISO-8601形式。 |
| encryptionKey | string | オプションの顧客提供のディスク暗号化キー |
| encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロール |
| iamRole | string | S3内のオブジェクトにアクセスするために使用されるIAMロール |
| privateEndpointIds | array | プライベートエンドポイントのリスト |
| availablePrivateEndpointIds | array | サービスに接続可能な利用可能なプライベートエンドポイントIDのリスト |
| dataWarehouseId | string | このサービスを含むデータウェアハウス |
| isPrimary | boolean | このサービスがデータウェアハウス内のプライマリサービスである場合はtrue |
| isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供されている場合のみ読み取り専用となります。 |
| releaseChannel | string | 新しいClickHouseのリリースを可能な限り早く受け取りたい場合はfastを選択します。新機能を迅速に取得できますが、バグのリスクが高くなります。この機能はプロダクションサービスにのみ利用可能です。 |
| byocId | string | Bring Your Own Cloud（BYOC）用に地域を設定した後に返されるIDです。byocIdパラメータが指定されている場合は、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要で、それぞれ次のサイズのいずれかの値を含める必要があります：28、60、124、188、252、380。 |

#### サンプルレスポンス

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
  "availablePrivateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## サービスを削除

サービスを削除します。サービスは停止状態でなければならず、このメソッド呼び出しの後に非同期的に削除されます。

| メソッド | パス |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/services/{serviceId}` |

### リクエスト
#### パスパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | 削除するサービスのID。 |

## プライベートエンドポイント構成の取得

プライベートエンドポイントを設定するために必要な情報

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/privateEndpointConfig` |

### リクエスト
#### パスパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 |
| serviceId | uuid | リクエストされたサービスのID。 |

### レスポンス
#### レスポンススキーマ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| endpointServiceId | string | AWS（サービス名）、GCP（ターゲットサービス）、またはAZURE（プライベートリンクサービス）のリソースで作成したインターフェースエンドポイントのユニークな識別子 |
| privateDnsHostname | string | 作成したVPCのプライベートDNSホスト名 |

#### サンプルレスポンス

```
{
  "endpointServiceId": "string",
  "privateDnsHostname": "string"
}
```

## 指定されたインスタンスのサービスクエリエンドポイントを取得

これは実験的な機能です。この機能を有効にするにはサポートに連絡してください。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |

### リクエスト
#### パスパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 |
| serviceId | uuid | リクエストされたサービスのID。 |

### レスポンス
#### レスポンススキーマ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | string | サービスクエリエンドポイントのID |
| openApiKeys | array | サービスクエリエンドポイントにアクセスできるOpenAPIキーのリスト |
| roles | array | サービスクエリエンドポイントにアクセスできるロールのリスト |
| allowedOrigins | string | 許可されているオリジン（カンマ区切りのドメインリスト） |

#### サンプルレスポンス

```
{
  "id": "string",
  "openApiKeys": "Array",
  "roles": "Array",
  "allowedOrigins": "string"
}
```

## 指定されたインスタンスのサービスクエリエンドポイントを削除

これは実験的な機能です。この機能を有効にするにはサポートに連絡してください。

| メソッド | パス |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |

### リクエスト
#### パスパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 |
| serviceId | uuid | リクエストされたサービスのID。 |

## 指定されたインスタンスのサービスクエリエンドポイントをアップサート

これは実験的な機能です。この機能を有効にするにはサポートに連絡してください。

| メソッド | パス |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |

### リクエスト
#### パスパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 |
| serviceId | uuid | リクエストされたサービスのID。 |

### ボディパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| roles | array | ロール |
| openApiKeys | array | サービスクエリエンドポイントのバージョン |
| allowedOrigins | string | 許可されているオリジン（カンマ区切りのドメインリスト） |

### レスポンス
#### レスポンススキーマ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | string | サービスクエリエンドポイントのID |
| openApiKeys | array | サービスクエリエンドポイントにアクセスできるOpenAPIキーのリスト |
| roles | array | サービスクエリエンドポイントにアクセスできるロールのリスト |
| allowedOrigins | string | 許可されているオリジン（カンマ区切りのドメインリスト） |

#### サンプルレスポンス

```
{
  "id": "string",
  "openApiKeys": "Array",
  "roles": "Array",
  "allowedOrigins": "string"
}
```

## サービスの状態を更新

サービスを開始または停止します。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/state` |

### リクエスト
#### パスパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | 状態を更新するサービスのID。 |

### ボディパラメータ

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| command | string | 状態を変更するためのコマンド：'start'、'stop'。 |
### レスポンス
```
```yaml
title: 'レスポンススキーマ'
sidebar_label: 'レスポンススキーマ'
keywords: 'ClickHouse,レスポンススキーマ,API,サービス'
description: 'ClickHouseのAPIレスポンススキーマの詳細'
```

#### Response Schema

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなサービスID。 |
| name | string | サービスの名前。空白を含む最大50文字の英数字文字列。 |
| provider | string | クラウドプロバイダー |
| region | string | サービスリージョン。 |
| state | string | サービスの現在の状態。 |
| endpoints | array | すべてのサービスエンドポイントのリスト。 |
| tier | string | BASIC、SCALE、ENTERPRISE組織ティア用に非推奨。サービスのティア：'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'。プロダクションサービスはスケールし、開発は固定サイズです。Azureサービスは開発ティアをサポートしていません。 |
| minTotalMemoryGb | number | 非推奨 - 非デフォルトのレプリカ数のサービスには不正確。自動スケーリング中の3つのワーカーの最小メモリ（GB）。「production」サービスのみ利用可能。12の倍数で、24以上でなければなりません。 |
| maxTotalMemoryGb | number | 非推奨 - 非デフォルトのレプリカ数のサービスには不正確。自動スケーリング中の3つのワーカーの最大メモリ（GB）。「production」サービスのみ利用可能。12の倍数で、非有料サービスは360以下、有料サービスは708以下でなければなりません。 |
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小合計メモリ（GB）。4の倍数で、8以上でなければなりません。 |
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大合計メモリ（GB）。4の倍数で、非有料サービスは120*以下、有料サービスは236*以下でなければなりません。* - 最大レプリカサイズは、選択したリージョンにおけるクラウドプロバイダーのハードウェアの可用性に依存します。 |
| numReplicas | number | サービスのレプリカ数。最初のサービスのレプリカ数は2〜20の範囲でなければなりません。既存のデータウェアハウスで作成されたサービスは、最低1つのレプリカを持つことができます。組織のティアに応じてさらなる制限が適用される場合があります。BASICティアにはデフォルトで1つ、SCALEおよびENTERPRISEティアにはデフォルトで3つのレプリカが設定されます。 |
| idleScaling | boolean | trueに設定された場合、サービスはアイドル時にゼロまでスケールダウンすることが許可されます。デフォルトではtrueです。 |
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 |
| ipAccessList | array | サービスにアクセスを許可されたIPアドレスのリスト。 |
| createdAt | date-time | サービス作成のタイムスタンプ。ISO-8601。 |
| encryptionKey | string | オプションの顧客提供ディスク暗号キー。 |
| encryptionAssumedRoleIdentifier | string | オプションのディスク暗号化に使用するロール。 |
| iamRole | string | s3のオブジェクトにアクセスするために使用されるIAMロール。 |
| privateEndpointIds | array | プライベートエンドポイントのリスト。 |
| availablePrivateEndpointIds | array | サービスに接続できる利用可能なプライベートエンドポイントIDのリスト。 |
| dataWarehouseId | string | このサービスを含むデータウェアハウス。 |
| isPrimary | boolean | このサービスがデータウェアハウスのプライマリサービスである場合はtrue。 |
| isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供されている場合のみ読み取り専用にできます。 |
| releaseChannel | string | 新しいClickHouseリリースを入手したい場合はfastを選択してください。新しい機能を早く入手できますが、バグのリスクが高くなります。この機能は「production」サービスのみ利用可能です。 |
| byocId | string | Bring Your Own Cloud（BYOC）のためのリージョンを設定した後に返されるID。byocIdパラメータが指定されると、minReplicaMemoryGbとmaxReplicaGbパラメータも必要で、次のサイズのいずれかの値が含まれている必要があります：28、60、124、188、252、380。 |

#### Sample response

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
  "availablePrivateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## Update service auto scaling settings

サービスのための最小および最大メモリ限界およびアイドルモードのスケーリング動作を更新します。このメモリ設定は「production」サービスでのみ利用可能で、24GBから始める12の倍数でなければなりません。numReplicasの調整を有効にするにはサポートにお問い合わせください。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/scaling` |

### Request
#### Path Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | スケーリングパラメータを更新するサービスのID。 |

### Body Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| minTotalMemoryGb | number | 非推奨 - 非デフォルトのレプリカ数のサービスには不正確。自動スケーリング中の3つのワーカーの最小メモリ（GB）。「production」サービスのみ利用可能。12の倍数で、24以上でなければなりません。 |
| maxTotalMemoryGb | number | 非推奨 - 非デフォルトのレプリカ数のサービスには不正確。自動スケーリング中の3つのワーカーの最大メモリ（GB）。「production」サービスのみ利用可能。12の倍数で、非有料サービスは360以下、有料サービスは708以下でなければなりません。 |
| numReplicas | number | サービスのレプリカ数。最初のサービスのレプリカ数は2〜20の範囲でなければなりません。既存のデータウェアハウスで作成されたサービスは、最低1つのレプリカを持つことができます。組織のティアに応じてさらなる制限が適用される場合があります。BASICティアにはデフォルトで1つ、SCALEおよびENTERPRISEティアにはデフォルトで3つのレプリカが設定されます。 |
| idleScaling | boolean | trueに設定された場合、サービスはアイドル時にゼロまでスケールダウンすることが許可されます。デフォルトではtrueです。 |
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 |

### Response
#### Response Schema

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなサービスID。 |
| name | string | サービスの名前。空白を含む最大50文字の英数字文字列。 |
| provider | string | クラウドプロバイダー |
| region | string | サービスリージョン。 |
| state | string | サービスの現在の状態。 |
| endpoints | array | すべてのサービスエンドポイントのリスト。 |
| tier | string | BASIC、SCALE、ENTERPRISE組織ティア用に非推奨。サービスのティア：'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'。プロダクションサービスはスケールし、開発は固定サイズです。Azureサービスは開発ティアをサポートしていません。 |
| minTotalMemoryGb | number | 非推奨 - 非デフォルトのレプリカ数のサービスには不正確。自動スケーリング中の3つのワーカーの最小メモリ（GB）。「production」サービスのみ利用可能。12の倍数で、24以上でなければなりません。 |
| maxTotalMemoryGb | number | 非推奨 - 非デフォルトのレプリカ数のサービスには不正確。自動スケーリング中の3つのワーカーの最大メモリ（GB）。「production」サービスのみ利用可能。12の倍数で、非有料サービスは360以下、有料サービスは708以下でなければなりません。 |
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小合計メモリ（GB）。4の倍数で、8以上でなければなりません。 |
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大合計メモリ（GB）。4の倍数で、非有料サービスは120*以下、有料サービスは236*以下でなければなりません。* - 最大レプリカサイズは、選択したリージョンにおけるクラウドプロバイダーのハードウェアの可用性に依存します。 |
| numReplicas | number | サービスのレプリカ数。最初のサービスのレプリカ数は2〜20の範囲でなければなりません。既存のデータウェアハウスで作成されたサービスは、最低1つのレプリカを持つことができます。組織のティアに応じてさらなる制限が適用される場合があります。BASICティアにはデフォルトで1つ、SCALEおよびENTERPRISEティアにはデフォルトで3つのレプリカが設定されます。 |
| idleScaling | boolean | trueに設定された場合、サービスはアイドル時にゼロまでスケールダウンすることが許可されます。デフォルトではtrueです。 |
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定します（分単位）。5分以上でなければなりません。 |
| ipAccessList | array | サービスにアクセスを許可されたIPアドレスのリスト。 |
| createdAt | date-time | サービス作成のタイムスタンプ。ISO-8601。 |
| encryptionKey | string | オプションの顧客提供ディスク暗号キー。 |
| encryptionAssumedRoleIdentifier | string | オプションのディスク暗号化に使用するロール。 |
| iamRole | string | s3のオブジェクトにアクセスするために使用されるIAMロール。 |
| privateEndpointIds | array | プライベートエンドポイントのリスト。 |
| availablePrivateEndpointIds | array | サービスに接続できる利用可能なプライベートエンドポイントIDのリスト。 |
| dataWarehouseId | string | このサービスを含むデータウェアハウス。 |
| isPrimary | boolean | このサービスがデータウェアハウスのプライマリサービスである場合はtrue。 |
| isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供されている場合のみ読み取り専用にできます。 |
| releaseChannel | string | 新しいClickHouseリリースを入手したい場合はfastを選択してください。新しい機能を早く入手できますが、バグのリスクが高くなります。この機能は「production」サービスのみ利用可能です。 |
| byocId | string | Bring Your Own Cloud（BYOC）のためのリージョンを設定した後に返されるID。byocIdパラメータが指定されると、minReplicaMemoryGbとmaxReplicaGbパラメータも必要で、次のサイズのいずれかの値が含まれている必要があります：28、60、124、188、252、380。 |

#### Sample response

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
  "availablePrivateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## Update service password

サービスの新しいパスワードを設定します。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/password` |

### Request
#### Path Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | パスワードを更新するサービスのID。 |

### Body Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| newPasswordHash | string | オプションのパスワードハッシュ。ネットワーク上のパスワード転送を避けるために使用されます。提供されない場合、新しいパスワードが生成され、レスポンスに提供されます。そうでない場合はこのハッシュが使用されます。アルゴリズム：echo -n "yourpassword" | sha256sum | tr -d '-' | xxd -r -p | base64 |
| newDoubleSha1Hash | string | MySQLプロトコル用のオプションのダブルSHA1パスワードハッシュ。newPasswordHashが提供されていない場合、このキーは無視され、生成されたパスワードが使用されます。アルゴリズム：echo -n "yourpassword" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-' |

### Response
#### Response Schema

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| password | string | 新しいサービスパスワード。リクエストに'newPasswordHash'がない場合のみ提供されます。 |

#### Sample response

```
{
  "password": "string"
}
```

## Create a private endpoint.

新しいプライベートエンドポイントを作成します。このプライベートエンドポイントは、このサービスおよび組織に関連付けられます。

| メソッド | パス |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services/{serviceId}/privateEndpoint` |

### Request
#### Path Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 |
| serviceId | uuid | リクエストされたサービスのID。 |

### Body Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | string | プライベートエンドポイント識別子 |
| description | string | プライベートエンドポイントの説明 |

### Response
#### Response Schema

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | string | プライベートエンドポイント識別子 |
| description | string | プライベートエンドポイントの説明 |
| cloudProvider | string | プライベートエンドポイントが存在するクラウドプロバイダー |
| region | string | プライベートエンドポイントが存在するリージョン |

#### Sample response

```
{
  "id": "string",
  "description": "string",
  "cloudProvider": "string",
  "region": "string"
}
```

## Get prometheus metrics

サービスのプロメテウスマトリックスを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/prometheus` |

### Request
#### Path Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | リクエストされたサービスのID。 |
| filtered_metrics | boolean | プロメテウスマトリックスのフィルタリングされたリストを返します。 |

## List of service backups

サービスのすべてのバックアップのリストを返します。最新のバックアップがリストの最初に表示されます。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backups` |

### Request
#### Path Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | バックアップを所有する組織のID。 |
| serviceId | uuid | バックアップが作成されたサービスのID。 |

### Response
#### Response Schema

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなバックアップID。 |
| status | string | バックアップの状態：'done', 'error', 'in_progress'。 |
| serviceId | string | 名前  |
| startedAt | date-time | バックアップ開始のタイムスタンプ。ISO-8601。 |
| finishedAt | date-time | バックアップ終了のタイムスタンプ。ISO-8601。完了したバックアップにのみ利用可能。 |
| sizeInBytes | number | バックアップのサイズ（バイト単位）。 |
| durationInSeconds | number | バックアップを実行するのにかかった時間（秒）。statusがまだin_progressの場合、これはバックアップが開始されてから現在までの秒数です。 |
| type | string | バックアップタイプ（"full"または"incremental"）。 |

#### Sample response

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

## Get backup details

単一バックアップの情報を返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backups/{backupId}` |

### Request
#### Path Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | バックアップを所有する組織のID。 |
| serviceId | uuid | バックアップが作成されたサービスのID。 |
| backupId | uuid | リクエストされたバックアップのID。 |

### Response
#### Response Schema

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなバックアップID。 |
| status | string | バックアップの状態：'done', 'error', 'in_progress'。 |
| serviceId | string | 名前  |
| startedAt | date-time | バックアップ開始のタイムスタンプ。ISO-8601。 |
| finishedAt | date-time | バックアップ終了のタイムスタンプ。ISO-8601。完了したバックアップにのみ利用可能。 |
| sizeInBytes | number | バックアップのサイズ（バイト単位）。 |
| durationInSeconds | number | バックアップを実行するのにかかった時間（秒）。statusがまだin_progressの場合、これはバックアップが開始されてから現在までの秒数です。 |
| type | string | バックアップタイプ（"full"または"incremental"）。 |

#### Sample response

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

## Get service backup configuration

サービスのバックアップ設定を返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backupConfiguration` |

### Request
#### Path Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | サービスのID。 |

### Response
#### Response Schema

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | 各バックアップ間の時間間隔（時間単位）。 |
| backupRetentionPeriodInHours | number | バックアップが利用可能な最小期間（時間単位）。 |
| backupStartTime | string | バックアップを実行する時間（HH:MM形式）（UTCタイムゾーンで評価）。定義された場合、バックアップ期間は24時間ごとにリセットされます。 |

#### Sample response

```
{
  "backupPeriodInHours": 0,
  "backupRetentionPeriodInHours": 0,
  "backupStartTime": "string"
}
```

## Update service backup configuration

サービスのバックアップ設定を更新します。ADMIN認証キーのロールが必要です。null値でプロパティを設定すると、プロパティはデフォルト値にリセットされます。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/backupConfiguration` |

### Request
#### Path Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | サービスのID。 |

### Body Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | 各バックアップ間の時間間隔（時間単位）。 |
| backupRetentionPeriodInHours | number | バックアップが利用可能な最小期間（時間単位）。 |
| backupStartTime | string | バックアップを実行する時間（HH:MM形式）（UTCタイムゾーンで評価）。定義された場合、バックアップ期間は24時間ごとにリセットされます。 |

### Response
#### Response Schema

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | 各バックアップ間の時間間隔（時間単位）。 |
| backupRetentionPeriodInHours | number | バックアップが利用可能な最小期間（時間単位）。 |
| backupStartTime | string | バックアップを実行する時間（HH:MM形式）（UTCタイムゾーンで評価）。定義された場合、バックアップ期間は24時間ごとにリセットされます。 |

#### Sample response

```
{
  "backupPeriodInHours": 0,
  "backupRetentionPeriodInHours": 0,
  "backupStartTime": "string"
}
```

## List ClickPipes

**このエンドポイントはアルファ版であり、変更される可能性があります。** 詳細についてはClickHouseサポートにお問い合わせください。<br /><br /> ClickPipesのリストを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes` |

### Request
#### Path Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | ClickPipeを所有するサービスのID。 |

### Response
#### Response Schema

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなClickPipe ID。 |
| serviceId | uuid | このClickPipeが属するサービスのID。 |
| name | string | ClickPipeの名前。 |
| description | string | ClickPipeの説明。 |
| state | string | ClickPipeの現在の状態。 |
| scaling.replicas | integer | 希望するレプリカ数。スケーラブルなパイプのみ。 |
| scaling.concurrency | integer | 希望する同時実行数。S3パイプのみ。0に設定すると、同時実行はクラスタメモリに基づいて自動的にスケーリングされます。 |
| source.kafka |  |  |
| source.objectStorage |  |  |
| source.kinesis |  |  |
| source.postgres |  |  |
| destination.database | string | 宛先データベース。 |
| destination.table | string | 宛先テーブル。Postgres以外のすべてのパイプタイプに必要なフィールド。 |
| destination.managedTable | boolean | テーブルはClickPipesによって管理されていますか？Postgres以外のすべてのパイプタイプに必要なフィールド。 |
| destination.tableDefinition.engine.type | string | 宛先テーブルのエンジンタイプ。現在、MergeTreeのみがサポートされたエンジンです。 |
| destination.tableDefinition.sortingKey | array | 宛先テーブルのソートキー。カラムのリスト。 |
| destination.tableDefinition.partitionBy | string | パーティションキーのSQL式。 |
| destination.tableDefinition.primaryKey | string | SQL式の主キー。 |
| destination.columns | array | 宛先テーブルのカラム。Postgres以外のすべてのパイプタイプに必要なフィールド。 |
| fieldMappings | array | ClickPipeのフィールドマッピング。 |
| createdAt | string | ClickPipeの作成日。 |
| updatedAt | string | ClickPipeの最終更新日。 |

#### Sample response

```
{
  "id": "uuid",
  "serviceId": "uuid",
  "name": "string",
  "description": "string",
  "state": "string",
  "scaling": {},
  "source": {},
  "destination": {
    "database": "string",
    "table": "string",
    "managedTable": "boolean",
    "tableDefinition": {
      "engine": {
        "type": "string"
      },
      "sortingKey": "Array",
      "partitionBy": "string",
      "primaryKey": "string"
    },
    "columns": "Array"
  },
  "fieldMappings": "Array",
  "createdAt": "string",
  "updatedAt": "string"
}
```

## Create ClickPipe

**このエンドポイントはアルファ版であり、変更される可能性があります。** 詳細についてはClickHouseサポートにお問い合わせください。<br /><br /> 新しいClickPipeを作成します。

| メソッド | パス |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes` |

### Request
#### Path Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | ClickPipeを作成するサービスのID。 |

### Body Params

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| name | string | ClickPipeの名前。 |
| description | string | ClickPipeの説明。 |
| source |  |  |
| destination |  |  |
| fieldMappings | array | ClickPipeのフィールドマッピング。 |
```
```yaml
title: 'ClickPipe API'
sidebar_label: 'ClickPipe API'
keywords: 'ClickHouse, API, ClickPipe, service'
description: 'ClickPipe API documentation for accessing, updating, and managing ClickPipes.'
```

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークな ClickPipe ID。 |
| serviceId | uuid | この ClickPipe が属するサービスのID。 |
| name | string | ClickPipe の名前。 |
| description | string | ClickPipe の説明。 |
| state | string | ClickPipe の現在の状態。 |
| scaling.replicas | integer | 希望するレプリカの数。スケーラブルなパイプのみに適用。 |
| scaling.concurrency | integer | 希望する同時実行数。S3 パイプのみに適用。0 に設定すると、クラスタメモリに基づいて自動でスケールされる。 |
| source.kafka |  |  |
| source.objectStorage |  |  |
| source.kinesis |  |  |
| source.postgres |  |  |
| destination.database | string | 宛先データベース。 |
| destination.table | string | 宛先テーブル。Postgres 以外のすべてのパイプタイプで必須。 |
| destination.managedTable | boolean | テーブルは ClickPipes によって管理されていますか？Postgres 以外のすべてのパイプタイプで必須。 |
| destination.tableDefinition.engine.type | string | 宛先テーブルのエンジンタイプ。現在、MergeTree のみがサポートされている。 |
| destination.tableDefinition.sortingKey | array | 宛先テーブルのソートキー。カラムのリスト。 |
| destination.tableDefinition.partitionBy | string | パーティションキーの SQL 式。 |
| destination.tableDefinition.primaryKey | string | SQL 式の主キー。 |
| destination.columns | array | 宛先テーブルのカラム。Postgres 以外のすべてのパイプタイプで必須。 |
| fieldMappings | array | ClickPipe のフィールドマッピング。 |
| createdAt | string | ClickPipe の作成日。 |
| updatedAt | string | ClickPipe の最終更新日。 |
#### サンプルレスポンス

```
{
  "id": "uuid",
  "serviceId": "uuid",
  "name": "string",
  "description": "string",
  "state": "string",
  "scaling": {},
  "source": {},
  "destination": {
    "database": "string",
    "table": "string",
    "managedTable": "boolean",
    "tableDefinition": {
      "engine": {
        "type": "string"
      },
      "sortingKey": "Array",
      "partitionBy": "string",
      "primaryKey": "string"
    },
    "columns": "Array"
  },
  "fieldMappings": "Array",
  "createdAt": "string",
  "updatedAt": "string"
}
```
## ClickPipe の取得

**このエンドポイントはアルファ版であり、変更される可能性があります。** 詳細については ClickHouse サポートにお問い合わせください。<br /><br /> 指定された ClickPipe を返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}` |
### リクエスト
#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | ClickPipe を所有するサービスのID。 |
| clickPipeId | uuid | リクエストされた ClickPipe のID。 |
### レスポンス
#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークな ClickPipe ID。 |
| serviceId | uuid | この ClickPipe が属するサービスのID。 |
| name | string | ClickPipe の名前。 |
| description | string | ClickPipe の説明。 |
| state | string | ClickPipe の現在の状態。 |
| scaling.replicas | integer | 希望するレプリカの数。スケーラブルなパイプのみに適用。 |
| scaling.concurrency | integer | 希望する同時実行数。S3 パイプのみに適用。0 に設定すると、クラスタメモリに基づいて自動でスケールされる。 |
| source.kafka |  |  |
| source.objectStorage |  |  |
| source.kinesis |  |  |
| source.postgres |  |  |
| destination.database | string | 宛先データベース。 |
| destination.table | string | 宛先テーブル。Postgres 以外のすべてのパイプタイプで必須。 |
| destination.managedTable | boolean | テーブルは ClickPipes によって管理されていますか？Postgres 以外のすべてのパイプタイプで必須。 |
| destination.tableDefinition.engine.type | string | 宛先テーブルのエンジンタイプ。現在、MergeTree のみがサポートされている。 |
| destination.tableDefinition.sortingKey | array | 宛先テーブルのソートキー。カラムのリスト。 |
| destination.tableDefinition.partitionBy | string | パーティションキーの SQL 式。 |
| destination.tableDefinition.primaryKey | string | SQL 式の主キー。 |
| destination.columns | array | 宛先テーブルのカラム。Postgres 以外のすべてのパイプタイプで必須。 |
| fieldMappings | array | ClickPipe のフィールドマッピング。 |
| createdAt | string | ClickPipe の作成日。 |
| updatedAt | string | ClickPipe の最終更新日。 |
#### サンプルレスポンス

```
{
  "id": "uuid",
  "serviceId": "uuid",
  "name": "string",
  "description": "string",
  "state": "string",
  "scaling": {},
  "source": {},
  "destination": {
    "database": "string",
    "table": "string",
    "managedTable": "boolean",
    "tableDefinition": {
      "engine": {
        "type": "string"
      },
      "sortingKey": "Array",
      "partitionBy": "string",
      "primaryKey": "string"
    },
    "columns": "Array"
  },
  "fieldMappings": "Array",
  "createdAt": "string",
  "updatedAt": "string"
}
```
## ClickPipe の更新

**このエンドポイントはアルファ版であり、変更される可能性があります。** 詳細については ClickHouse サポートにお問い合わせください。<br /><br /> 指定された ClickPipe を更新します。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}` |
### リクエスト
#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | ClickPipe を作成するサービスのID。 |
| clickPipeId | uuid | リクエストされた ClickPipe のID。 |
### ボディパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| name | string | ClickPipe の名前。 |
| description | string | ClickPipe の説明。 |
| source |  |  |
| destination |  |  |
| fieldMappings | array | ClickPipe のフィールドマッピング。この設定では、テーブルスキーマは更新されず、ClickPipe の設定だけが更新されます。 |
### レスポンス
#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークな ClickPipe ID。 |
| serviceId | uuid | この ClickPipe が属するサービスのID。 |
| name | string | ClickPipe の名前。 |
| description | string | ClickPipe の説明。 |
| state | string | ClickPipe の現在の状態。 |
| scaling.replicas | integer | 希望するレプリカの数。スケーラブルなパイプのみに適用。 |
| scaling.concurrency | integer | 希望する同時実行数。S3 パイプのみに適用。0 に設定すると、クラスタメモリに基づいて自動でスケールされる。 |
| source.kafka |  |  |
| source.objectStorage |  |  |
| source.kinesis |  |  |
| source.postgres |  |  |
| destination.database | string | 宛先データベース。 |
| destination.table | string | 宛先テーブル。Postgres 以外のすべてのパイプタイプで必須。 |
| destination.managedTable | boolean | テーブルは ClickPipes によって管理されていますか？Postgres 以外のすべてのパイプタイプで必須。 |
| destination.tableDefinition.engine.type | string | 宛先テーブルのエンジンタイプ。現在、MergeTree のみがサポートされている。 |
| destination.tableDefinition.sortingKey | array | 宛先テーブルのソートキー。カラムのリスト。 |
| destination.tableDefinition.partitionBy | string | パーティションキーの SQL 式。 |
| destination.tableDefinition.primaryKey | string | SQL 式の主キー。 |
| destination.columns | array | 宛先テーブルのカラム。Postgres 以外のすべてのパイプタイプで必須。 |
| fieldMappings | array | ClickPipe のフィールドマッピング。 |
| createdAt | string | ClickPipe の作成日。 |
| updatedAt | string | ClickPipe の最終更新日。 |
#### サンプルレスポンス

```
{
  "id": "uuid",
  "serviceId": "uuid",
  "name": "string",
  "description": "string",
  "state": "string",
  "scaling": {},
  "source": {},
  "destination": {
    "database": "string",
    "table": "string",
    "managedTable": "boolean",
    "tableDefinition": {
      "engine": {
        "type": "string"
      },
      "sortingKey": "Array",
      "partitionBy": "string",
      "primaryKey": "string"
    },
    "columns": "Array"
  },
  "fieldMappings": "Array",
  "createdAt": "string",
  "updatedAt": "string"
}
```
## ClickPipe の削除

**このエンドポイントはアルファ版であり、変更される可能性があります。** 詳細については ClickHouse サポートにお問い合わせください。<br /><br /> 指定された ClickPipe を削除します。

| メソッド | パス |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}` |
### リクエスト
#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | ClickPipe を所有するサービスのID。 |
| clickPipeId | uuid | 削除する ClickPipe のID。 |
## ClickPipe のスケーリング

**このエンドポイントはアルファ版であり、変更される可能性があります。** 詳細については ClickHouse サポートにお問い合わせください。<br /><br /> 指定された ClickPipe のスケーリング設定を変更します。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/scaling` |
### リクエスト
#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | ClickPipe を所有するサービスのID。 |
| clickPipeId | uuid | スケーリング設定を更新する ClickPipe のID。 |
### ボディパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| replicas | integer | スケールするためのレプリカの数。Kafka パイプのスケーリングに使用。 |
### レスポンス
#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークな ClickPipe ID。 |
| serviceId | uuid | この ClickPipe が属するサービスのID。 |
| name | string | ClickPipe の名前。 |
| description | string | ClickPipe の説明。 |
| state | string | ClickPipe の現在の状態。 |
| scaling.replicas | integer | 希望するレプリカの数。スケーラブルなパイプのみに適用。 |
| scaling.concurrency | integer | 希望する同時実行数。S3 パイプのみに適用。0 に設定すると、クラスタメモリに基づいて自動でスケールされる。 |
| source.kafka |  |  |
| source.objectStorage |  |  |
| source.kinesis |  |  |
| source.postgres |  |  |
| destination.database | string | 宛先データベース。 |
| destination.table | string | 宛先テーブル。Postgres 以外のすべてのパイプタイプで必須。 |
| destination.managedTable | boolean | テーブルは ClickPipes によって管理されていますか？Postgres 以外のすべてのパイプタイプで必須。 |
| destination.tableDefinition.engine.type | string | 宛先テーブルのエンジンタイプ。現在、MergeTree のみがサポートされている。 |
| destination.tableDefinition.sortingKey | array | 宛先テーブルのソートキー。カラムのリスト。 |
| destination.tableDefinition.partitionBy | string | パーティションキーの SQL 式。 |
| destination.tableDefinition.primaryKey | string | SQL 式の主キー。 |
| destination.columns | array | 宛先テーブルのカラム。Postgres 以外のすべてのパイプタイプで必須。 |
| fieldMappings | array | ClickPipe のフィールドマッピング。 |
| createdAt | string | ClickPipe の作成日。 |
| updatedAt | string | ClickPipe の最終更新日。 |
#### サンプルレスポンス

```
{
  "id": "uuid",
  "serviceId": "uuid",
  "name": "string",
  "description": "string",
  "state": "string",
  "scaling": {},
  "source": {},
  "destination": {
    "database": "string",
    "table": "string",
    "managedTable": "boolean",
    "tableDefinition": {
      "engine": {
        "type": "string"
      },
      "sortingKey": "Array",
      "partitionBy": "string",
      "primaryKey": "string"
    },
    "columns": "Array"
  },
  "fieldMappings": "Array",
  "createdAt": "string",
  "updatedAt": "string"
}
```
## ClickPipe の状態を更新

**このエンドポイントはアルファ版であり、変更される可能性があります。** 詳細については ClickHouse サポートにお問い合わせください。<br /><br /> ClickPipe を開始または停止します。ClickPipe を停止すると、任意の状態からの取り込みプロセスが停止します。「停止」状態または「失敗」状態の ClickPipe での開始が許可されます。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/state` |
### リクエスト
#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
| serviceId | uuid | ClickPipe を所有するサービスのID。 |
| clickPipeId | uuid | 状態を更新する ClickPipe のID。 |
### ボディパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| command | string | 状態を変更するコマンド: 'start', 'stop'。 |
### レスポンス
#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークな ClickPipe ID。 |
| serviceId | uuid | この ClickPipe が属するサービスのID。 |
| name | string | ClickPipe の名前。 |
| description | string | ClickPipe の説明。 |
| state | string | ClickPipe の現在の状態。 |
| scaling.replicas | integer | 希望するレプリカの数。スケーラブルなパイプのみに適用。 |
| scaling.concurrency | integer | 希望する同時実行数。S3 パイプのみに適用。0 に設定すると、クラスタメモリに基づいて自動でスケールされる。 |
| source.kafka |  |  |
| source.objectStorage |  |  |
| source.kinesis |  |  |
| source.postgres |  |  |
| destination.database | string | 宛先データベース。 |
| destination.table | string | 宛先テーブル。Postgres 以外のすべてのパイプタイプで必須。 |
| destination.managedTable | boolean | テーブルは ClickPipes によって管理されていますか？Postgres 以外のすべてのパイプタイプで必須。 |
| destination.tableDefinition.engine.type | string | 宛先テーブルのエンジンタイプ。現在、MergeTree のみがサポートされている。 |
| destination.tableDefinition.sortingKey | array | 宛先テーブルのソートキー。カラムのリスト。 |
| destination.tableDefinition.partitionBy | string | パーティションキーの SQL 式。 |
| destination.tableDefinition.primaryKey | string | SQL 式の主キー。 |
| destination.columns | array | 宛先テーブルのカラム。Postgres 以外のすべてのパイプタイプで必須。 |
| fieldMappings | array | ClickPipe のフィールドマッピング。 |
| createdAt | string | ClickPipe の作成日。 |
| updatedAt | string | ClickPipe の最終更新日。 |

#### サンプルレスポンス

```
{
  "id": "uuid",
  "serviceId": "uuid",
  "name": "string",
  "description": "string",
  "state": "string",
  "scaling": {},
  "source": {},
  "destination": {
    "database": "string",
    "table": "string",
    "managedTable": "boolean",
    "tableDefinition": {
      "engine": {
        "type": "string"
      },
      "sortingKey": "Array",
      "partitionBy": "string",
      "primaryKey": "string"
    },
    "columns": "Array"
  },
  "fieldMappings": "Array",
  "createdAt": "string",
  "updatedAt": "string"
}
```
