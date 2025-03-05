
---
sidebar_label: サービス
title: サービス
---
## 組織のサービス一覧

組織内のすべてのサービスのリストを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services` |
### リクエスト
#### パス パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 |
### レスポンス
#### レスポンススキーマ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなサービスID。 | 
| name | string | サービス名。ホワイトスペースを含む最大50文字の英数字。 | 
| provider | string | クラウドプロバイダー | 
| region | string | サービスリージョン。 | 
| state | string | サービスの現在の状態。 | 
| endpoints | array | すべてのサービスエンドポイントのリスト。 | 
| tier | string | BASIC、SCALE、およびENTERPRISE組織ティアについては廃止されました。サービスの層：'development'、'production'、'dedicated_high_mem'、'dedicated_high_cpu'、'dedicated_standard'、'dedicated_standard_n2d_standard_4'、'dedicated_standard_n2d_standard_8'、'dedicated_standard_n2d_standard_32'、'dedicated_standard_n2d_standard_128'、'dedicated_standard_n2d_standard_32_16SSD'、'dedicated_standard_n2d_standard_64_24SSD'。プロダクションサービスはスケーリングされ、開発は固定サイズです。Azureサービスは開発層をサポートしていません。 | 
| minTotalMemoryGb | number | 廃止されました - デフォルトでないレプリカ数を持つサービスには不正確です。自動スケーリング中の3つのワーカーの最小メモリ（Gb）。'production'サービスのみ入手可能。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 廃止されました - デフォルトでないレプリカ数を持つサービスには不正確です。自動スケーリング中の3つのワーカーの最大メモリ（Gb）。'production'サービスのみ入手可能。12の倍数であり、非有料サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 | 
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小総メモリ（Gb）。4の倍数であり、8以上でなければなりません。 | 
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大総メモリ（Gb）。4の倍数であり、非有料サービスの場合は120以下、有料サービスの場合は236以下でなければなりません。* - 最大レプリカサイズは、選択したリージョンにおけるクラウドプロバイダーのハードウェアの可用性に依存します。 | 
| numReplicas | number | サービスのレプリカ数。最初のサービスは、倉庫内で2から20の範囲でなければなりません。既存の倉庫に作成されたサービスは、最低1のレプリカ数を持つことができます。組織の層に基づいてさらに制限が適用される場合があります。BASIC層の場合は1、SCALEおよびENTERPRISE層の場合は3がデフォルトです。 | 
| idleScaling | boolean | trueに設定すると、アイドル時にサービスがゼロまでスケールダウンすることが許可されます。デフォルトはtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定（分単位）。5分以上でなければなりません。 | 
| ipAccessList | array | サービスにアクセスを許可されたIPアドレスのリスト | 
| createdAt | date-time | サービス作成のタイムスタンプ。ISO-8601形式。 | 
| encryptionKey | string | オプションの顧客提供ディスク暗号化キー | 
| encryptionAssumedRoleIdentifier | string | オプションのディスク暗号化に使用するロール | 
| iamRole | string | s3のオブジェクトへのアクセスに使用されるIAMロール | 
| privateEndpointIds | array | プライベートエンドポイントのリスト | 
| availablePrivateEndpointIds | array | サービスに添付できるプライベートエンドポイントのIDのリスト | 
| dataWarehouseId | string | このサービスを含むデータウェアハウス | 
| isPrimary | boolean | このサービスがデータウェアハウス内のプライマリサービスである場合はtrue | 
| isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供されている場合にのみ読み取り専用になります。 | 
| releaseChannel | string | 新しいClickHouseリリースを可能な限り早く取得したい場合はfastを選択してください。新機能を早く入手できますが、バグのリスクが高まります。この機能は、プロダクションサービスにのみ利用可能です。 | 
| byocId | string | Bring Your Own Cloud (BYOC)のリージョンを設定した後に返されるIDです。byocIdパラメータが指定されている場合、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要であり、以下のサイズのいずれかに含まれなければなりません：28、60、124、188、252、380。 |
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

組織内に新しいサービスを作成し、現在のサービスの状態とサービスにアクセスするためのパスワードを返します。サービスは非同期で開始されます。

| メソッド | パス |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services` |
### リクエスト
#### パス パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 |
### ボディ パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| name | string | サービス名。ホワイトスペースを含む最大50文字の英数字。 | 
| provider | string | クラウドプロバイダー | 
| region | string | サービスリージョン。 | 
| tier | string | BASIC、SCALE、およびENTERPRISE組織ティアについては廃止されました。サービスの層：'development'、'production'、'dedicated_high_mem'、'dedicated_high_cpu'、'dedicated_standard'、'dedicated_standard_n2d_standard_4'、'dedicated_standard_n2d_standard_8'、'dedicated_standard_n2d_standard_32'、'dedicated_standard_n2d_standard_128'、'dedicated_standard_n2d_standard_32_16SSD'、'dedicated_standard_n2d_standard_64_24SSD'。プロダクションサービスはスケーリングされ、開発は固定サイズです。Azureサービスは開発層をサポートしていません。 | 
| ipAccessList | array | サービスにアクセスを許可されたIPアドレスのリスト | 
| minTotalMemoryGb | number | 廃止されました - デフォルトでないレプリカ数を持つサービスには不正確です。自動スケーリング中の3つのワーカーの最小メモリ（Gb）。'production'サービスのみ入手可能。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 廃止されました - デフォルトでないレプリカ数を持つサービスには不正確です。自動スケーリング中の3つのワーカーの最大メモリ（Gb）。'production'サービスのみ入手可能。12の倍数であり、非有料サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 | 
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小総メモリ（Gb）。4の倍数であり、8以上でなければなりません。 | 
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大総メモリ（Gb）。4の倍数であり、非有料サービスの場合は120以下、有料サービスの場合は236以下でなければなりません。* - 最大レプリカサイズは、選択したリージョンにおけるクラウドプロバイダーのハードウェアの可用性に依存します。 | 
| numReplicas | number | サービスのレプリカ数。最初のサービスは、倉庫内で2から20の範囲でなければなりません。既存の倉庫に作成されたサービスは、最低1のレプリカ数を持つことができます。組織の層に基づいてさらに制限が適用される場合があります。BASIC層の場合は1、SCALEおよびENTERPRISE層の場合は3がデフォルトです。 | 
| idleScaling | boolean | trueに設定すると、アイドル時にサービスがゼロまでスケールダウンすることが許可されます。デフォルトはtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定（分単位）。5分以上でなければなりません。 | 
| isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供されている場合にのみ読み取り専用になります。 | 
| dataWarehouseId | string | このサービスを含むデータウェアハウス | 
| backupId | string | 新しいサービスの初期状態として使用されるオプションのバックアップID。使用されると、リージョンと新しいインスタンスの層は元のインスタンスの値と同じでなければなりません。 | 
| encryptionKey | string | オプションの顧客提供ディスク暗号化キー | 
| encryptionAssumedRoleIdentifier | string | オプションのディスク暗号化に使用するロール | 
| privateEndpointIds | array | プライベートエンドポイントのリスト | 
| privatePreviewTermsChecked | boolean | プライベートプレビューの利用規約に同意します。プライベートプレビューの場合、組織内の最初のサービスを作成する際にのみ必要です。 | 
| releaseChannel | string | 新しいClickHouseリリースを可能な限り早く取得したい場合はfastを選択してください。新機能を早く入手できますが、バグのリスクが高まります。この機能は、プロダクションサービスにのみ利用可能です。 | 
| byocId | string | Bring Your Own Cloud (BYOC)のリージョンを設定した後に返されるIDです。byocIdパラメータが指定されている場合、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要であり、以下のサイズのいずれかに含まれなければなりません：28、60、124、188、252、380。 | 
| endpoints | array | 有効または無効にするサービスエンドポイントのリスト |
### レスポンス
#### レスポンススキーマ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| service.id | uuid | ユニークなサービスID。 | 
| service.name | string | サービス名。ホワイトスペースを含む最大50文字の英数字。 | 
| service.provider | string | クラウドプロバイダー | 
| service.region | string | サービスリージョン。 | 
| service.state | string | サービスの現在の状態。 | 
| service.endpoints | array | すべてのサービスエンドポイントのリスト。 | 
| service.tier | string | BASIC、SCALE、およびENTERPRISE組織ティアについては廃止されました。サービスの層：'development'、'production'、'dedicated_high_mem'、'dedicated_high_cpu'、'dedicated_standard'、'dedicated_standard_n2d_standard_4'、'dedicated_standard_n2d_standard_8'、'dedicated_standard_n2d_standard_32'、'dedicated_standard_n2d_standard_128'、'dedicated_standard_n2d_standard_32_16SSD'、'dedicated_standard_n2d_standard_64_24SSD'。プロダクションサービスはスケーリングされ、開発は固定サイズです。Azureサービスは開発層をサポートしていません。 | 
| service.minTotalMemoryGb | number | 廃止されました - デフォルトでないレプリカ数を持つサービスには不正確です。自動スケーリング中の3つのワーカーの最小メモリ（Gb）。'production'サービスのみ入手可能。12の倍数であり、24以上でなければなりません。 | 
| service.maxTotalMemoryGb | number | 廃止されました - デフォルトでないレプリカ数を持つサービスには不正確です。自動スケーリング中の3つのワーカーの最大メモリ（Gb）。'production'サービスのみ入手可能。12の倍数であり、非有料サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 | 
| service.minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小総メモリ（Gb）。4の倍数であり、8以上でなければなりません。 | 
| service.maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大総メモリ（Gb）。4の倍数であり、非有料サービスの場合は120以下、有料サービスの場合は236以下でなければなりません。* - 最大レプリカサイズは、選択したリージョンにおけるクラウドプロバイダーのハードウェアの可用性に依存します。 | 
| service.numReplicas | number | サービスのレプリカ数。最初のサービスは、倉庫内で2から20の範囲でなければなりません。既存の倉庫に作成されたサービスは、最低1のレプリカ数を持つことができます。組織の層に基づいてさらに制限が適用される場合があります。BASIC層の場合は1、SCALEおよびENTERPRISE層の場合は3がデフォルトです。 | 
| service.idleScaling | boolean | trueに設定すると、アイドル時にサービスがゼロまでスケールダウンすることが許可されます。デフォルトはtrueです。 | 
| service.idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定（分単位）。5分以上でなければなりません。 | 
| service.ipAccessList | array | サービスにアクセスを許可されたIPアドレスのリスト | 
| service.createdAt | date-time | サービス作成のタイムスタンプ。ISO-8601形式。 | 
| service.encryptionKey | string | オプションの顧客提供ディスク暗号化キー | 
| service.encryptionAssumedRoleIdentifier | string | オプションのディスク暗号化に使用するロール | 
| service.iamRole | string | s3のオブジェクトへのアクセスに使用されるIAMロール | 
| service.privateEndpointIds | array | プライベートエンドポイントのリスト | 
| service.availablePrivateEndpointIds | array | サービスに添付できるプライベートエンドポイントのIDのリスト | 
| service.dataWarehouseId | string | このサービスを含むデータウェアハウス | 
| service.isPrimary | boolean | このサービスがデータウェアハウス内のプライマリサービスである場合はtrue | 
| service.isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供されている場合にのみ読み取り専用になります。 | 
| service.releaseChannel | string | 新しいClickHouseリリースを可能な限り早く取得したい場合はfastを選択してください。新機能を早く入手できますが、バグのリスクが高まります。この機能は、プロダクションサービスにのみ利用可能です。 | 
| service.byocId | string | Bring Your Own Cloud (BYOC)のリージョンを設定した後に返されるIDです。byocIdパラメータが指定されている場合、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要であり、以下のサイズのいずれかに含まれなければなりません：28、60、124、188、252、380。 | 
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
#### パス パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | リクエストされたサービスのID。 |
### レスポンス
#### レスポンススキーマ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなサービスID。 | 
| name | string | サービス名。ホワイトスペースを含む最大50文字の英数字。 | 
| provider | string | クラウドプロバイダー | 
| region | string | サービスリージョン。 | 
| state | string | サービスの現在の状態。 | 
| endpoints | array | すべてのサービスエンドポイントのリスト。 | 
| tier | string | BASIC、SCALE、およびENTERPRISE組織ティアについては廃止されました。サービスの層：'development'、'production'、'dedicated_high_mem'、'dedicated_high_cpu'、'dedicated_standard'、'dedicated_standard_n2d_standard_4'、'dedicated_standard_n2d_standard_8'、'dedicated_standard_n2d_standard_32'、'dedicated_standard_n2d_standard_128'、'dedicated_standard_n2d_standard_32_16SSD'、'dedicated_standard_n2d_standard_64_24SSD'。プロダクションサービスはスケーリングされ、開発は固定サイズです。Azureサービスは開発層をサポートしていません。 | 
| minTotalMemoryGb | number | 廃止されました - デフォルトでないレプリカ数を持つサービスには不正確です。自動スケーリング中の3つのワーカーの最小メモリ（Gb）。'production'サービスのみ入手可能。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 廃止されました - デフォルトでないレプリカ数を持つサービスには不正確です。自動スケーリング中の3つのワーカーの最大メモリ（Gb）。'production'サービスのみ入手可能。12の倍数であり、非有料サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 | 
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小総メモリ（Gb）。4の倍数であり、8以上でなければなりません。 | 
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大総メモリ（Gb）。4の倍数であり、非有料サービスの場合は120以下、有料サービスの場合は236以下でなければなりません。* - 最大レプリカサイズは、選択したリージョンにおけるクラウドプロバイダーのハードウェアの可用性に依存します。 | 
| numReplicas | number | サービスのレプリカ数。最初のサービスは、倉庫内で2から20の範囲でなければなりません。既存の倉庫に作成されたサービスは、最低1のレプリカ数を持つことができます。組織の層に基づいてさらに制限が適用される場合があります。BASIC層の場合は1、SCALEおよびENTERPRISE層の場合は3がデフォルトです。 | 
| idleScaling | boolean | trueに設定すると、アイドル時にサービスがゼロまでスケールダウンすることが許可されます。デフォルトはtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定（分単位）。5分以上でなければなりません。 | 
| ipAccessList | array | サービスにアクセスを許可されたIPアドレスのリスト | 
| createdAt | date-time | サービス作成のタイムスタンプ。ISO-8601形式。 | 
| encryptionKey | string | オプションの顧客提供ディスク暗号化キー | 
| encryptionAssumedRoleIdentifier | string | オプションのディスク暗号化に使用するロール | 
| iamRole | string | s3のオブジェクトへのアクセスに使用されるIAMロール | 
| privateEndpointIds | array | プライベートエンドポイントのリスト | 
| availablePrivateEndpointIds | array | サービスに添付できるプライベートエンドポイントのIDのリスト | 
| dataWarehouseId | string | このサービスを含むデータウェアハウス | 
| isPrimary | boolean | このサービスがデータウェアハウス内のプライマリサービスである場合はtrue | 
| isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供されている場合にのみ読み取り専用になります。 | 
| releaseChannel | string | 新しいClickHouseリリースを可能な限り早く取得したい場合はfastを選択してください。新機能を早く入手できますが、バグのリスクが高まります。この機能は、プロダクションサービスにのみ利用可能です。 | 
| byocId | string | Bring Your Own Cloud (BYOC)のリージョンを設定した後に返されるIDです。byocIdパラメータが指定されている場合、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要であり、以下のサイズのいずれかに含まれなければなりません：28、60、124、188、252、380。 |
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
## サービスの基本情報を更新

サービス名やIPアクセスリストなどの基本的なサービス情報を更新します。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}` |
### リクエスト
#### パス パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | 更新するサービスのID。 |
### ボディ パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| name | string | サービス名。ホワイトスペースを含む最大50文字の英数字。 | 
| ipAccessList |  |  | 
| privateEndpointIds |  |  | 
| releaseChannel | string | 新しいClickHouseリリースを可能な限り早く取得したい場合はfastを選択してください。新機能を早く入手できますが、バグのリスクが高まります。この機能は、プロダクションサービスにのみ利用可能です。 | 
| endpoints | array | 変更するサービスエンドポイントのリスト |
### レスポンス
#### レスポンススキーマ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなサービスID。 | 
| name | string | サービス名。ホワイトスペースを含む最大50文字の英数字。 | 
| provider | string | クラウドプロバイダー | 
| region | string | サービスリージョン。 | 
| state | string | サービスの現在の状態。 | 
| endpoints | array | すべてのサービスエンドポイントのリスト。 | 
| tier | string | BASIC、SCALE、およびENTERPRISE組織ティアについては廃止されました。サービスの層：'development'、'production'、'dedicated_high_mem'、'dedicated_high_cpu'、'dedicated_standard'、'dedicated_standard_n2d_standard_4'、'dedicated_standard_n2d_standard_8'、'dedicated_standard_n2d_standard_32'、'dedicated_standard_n2d_standard_128'、'dedicated_standard_n2d_standard_32_16SSD'、'dedicated_standard_n2d_standard_64_24SSD'。プロダクションサービスはスケーリングされ、開発は固定サイズです。Azureサービスは開発層をサポートしていません。 | 
| minTotalMemoryGb | number | 廃止されました - デフォルトでないレプリカ数を持つサービスには不正確です。自動スケーリング中の3つのワーカーの最小メモリ（Gb）。'production'サービスのみ入手可能。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 廃止されました - デフォルトでないレプリカ数を持つサービスには不正確です。自動スケーリング中の3つのワーカーの最大メモリ（Gb）。'production'サービスのみ入手可能。12の倍数であり、非有料サービスの場合は360以下、有料サービスの場合は708以下でなければなりません。 | 
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小総メモリ（Gb）。4の倍数であり、8以上でなければなりません。 | 
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大総メモリ（Gb）。4の倍数であり、非有料サービスの場合は120以下、有料サービスの場合は236以下でなければなりません。* - 最大レプリカサイズは、選択したリージョンにおけるクラウドプロバイダーのハードウェアの可用性に依存します。 | 
| numReplicas | number | サービスのレプリカ数。最初のサービスは、倉庫内で2から20の範囲でなければなりません。既存の倉庫に作成されたサービスは、最低1のレプリカ数を持つことができます。組織の層に基づいてさらに制限が適用される場合があります。BASIC層の場合は1、SCALEおよびENTERPRISE層の場合は3がデフォルトです。 | 
| idleScaling | boolean | trueに設定すると、アイドル時にサービスがゼロまでスケールダウンすることが許可されます。デフォルトはtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウトを設定（分単位）。5分以上でなければなりません。 | 
| ipAccessList | array | サービスにアクセスを許可されたIPアドレスのリスト | 
| createdAt | date-time | サービス作成のタイムスタンプ。ISO-8601形式。 | 
| encryptionKey | string | オプションの顧客提供ディスク暗号化キー | 
| encryptionAssumedRoleIdentifier | string | オプションのディスク暗号化に使用するロール | 
| iamRole | string | s3のオブジェクトへのアクセスに使用されるIAMロール | 
| privateEndpointIds | array | プライベートエンドポイントのリスト | 
| availablePrivateEndpointIds | array | サービスに添付できるプライベートエンドポイントのIDのリスト | 
| dataWarehouseId | string | このサービスを含むデータウェアハウス | 
| isPrimary | boolean | このサービスがデータウェアハウス内のプライマリサービスである場合はtrue | 
| isReadonly | boolean | このサービスが読み取り専用である場合はtrue。dataWarehouseIdが提供されている場合にのみ読み取り専用になります。 | 
| releaseChannel | string | 新しいClickHouseリリースを可能な限り早く取得したい場合はfastを選択してください。新機能を早く入手できますが、バグのリスクが高まります。この機能は、プロダクションサービスにのみ利用可能です。 | 
| byocId | string | Bring Your Own Cloud (BYOC)のリージョンを設定した後に返されるIDです。byocIdパラメータが指定されている場合、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要であり、以下のサイズのいずれかに含まれなければなりません：28、60、124、188、252、380。 |
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
#### パス パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | 削除するサービスのID。 |
## プライベートエンドポイント構成を取得

プライベートエンドポイントを設定するために必要な情報

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/privateEndpointConfig` |
### リクエスト
#### パス パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 | 
| serviceId | uuid | リクエストされたサービスのID。 |
### レスポンス
#### レスポンススキーマ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| endpointServiceId | string | AWS（サービス名）、GCP（ターゲットサービス）またはAZURE（プライベートリンクサービス）リソースのVPC内で作成したインターフェイスエンドポイントのユニークな識別子 | 
| privateDnsHostname | string | 作成したVPCのプライベートDNSホスト名 |
#### サンプルレスポンス

```
{
  "endpointServiceId": "string",
  "privateDnsHostname": "string"
}
```
## 指定されたインスタンスのサービスクエリエンドポイントを取得

これは実験的な機能です。これを有効にするにはサポートに連絡してください。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |
### リクエスト
#### パス パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 | 
| serviceId | uuid | リクエストされたサービスのID。 |
### レスポンス
#### レスポンススキーマ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | string | サービスクエリエンドポイントのID | 
| openApiKeys | array | サービスクエリエンドポイントにアクセスできるOpenAPIキーのリスト | 
| roles | array | サービスクエリエンドポイントにアクセスできるロールのリスト | 
| allowedOrigins | string | 許可されたオリジンのリスト（カンマ区切りのドメイン） |
#### サンプルレスポンス

```
{
  "id": "string",
  "openApiKeys": "Array",
  "roles": "Array",
  "allowedOrigins": "string"
}
```
## 権限付きインスタンスのサービスクエリエンドポイントを削除

これは実験的な機能です。これを有効にするにはサポートに連絡してください。

| メソッド | パス |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |
### リクエスト
#### パス パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 | 
| serviceId | uuid | リクエストされたサービスのID。 |
## 指定されたインスタンスのサービスクエリエンドポイントをアップサート

これは実験的な機能です。これを有効にするにはサポートに連絡してください。

| メソッド | パス |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |
### リクエスト
#### パス パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 | 
| serviceId | uuid | リクエストされたサービスのID。 |
### ボディ パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| roles | array | ロール | 
| openApiKeys | array | サービスクエリエンドポイントのバージョン | 
| allowedOrigins | string | 許可されたオリジンのリスト（カンマ区切りのドメイン） |
### レスポンス
#### レスポンススキーマ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| id | string | サービスクエリエンドポイントのID | 
| openApiKeys | array | サービスクエリエンドポイントにアクセスできるOpenAPIキーのリスト | 
| roles | array | サービスクエリエンドポイントにアクセスできるロールのリスト | 
| allowedOrigins | string | 許可されたオリジンのリスト（カンマ区切りのドメイン） |
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
#### パス パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | 状態を更新するサービスのID。 |
### ボディ パラメータ

| 名称 | 型 | 説明 |
| :--- | :--- | :---------- |
| command | string | 状態を変更するためのコマンド：'start'、'stop'。 |
### レスポンス
```
#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなサービスID。 | 
| name | string | サービスの名前。最大50文字の空白を含む英数字の文字列。 | 
| provider | string | クラウドプロバイダー | 
| region | string | サービスのリージョン。 | 
| state | string | サービスの現在の状態。 | 
| endpoints | array | すべてのサービスエンドポイントのリスト。 | 
| tier | string | BASIC、SCALE、ENTERPRISE組織ティアでは非推奨。サービスのティア：'development'、'production'、'dedicated_high_mem'、'dedicated_high_cpu'、'dedicated_standard'、'dedicated_standard_n2d_standard_4'、'dedicated_standard_n2d_standard_8'、'dedicated_standard_n2d_standard_32'、'dedicated_standard_n2d_standard_128'、'dedicated_standard_n2d_standard_32_16SSD'、'dedicated_standard_n2d_standard_64_24SSD'。生産サービスはスケールし、開発用は固定サイズです。Azureサービスは開発ティアをサポートしていません。 | 
| minTotalMemoryGb | number | 非推奨 - 非デフォルトのレプリカ数を持つサービスには不正確。自動スケーリング中の3つのワーカーの最小メモリ（Gb）。'production'サービスにのみ使用可能。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 非推奨 - 非デフォルトのレプリカ数を持つサービスには不正確。自動スケーリング中の3つのワーカーの最大メモリ（Gb）。'production'サービスにのみ使用可能。12の倍数であり、非課金サービスは360以下、課金サービスは708以下でなければなりません。 | 
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小合計メモリ（Gb）。4の倍数であり、8以上でなければなりません。 | 
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大合計メモリ（Gb）。4の倍数であり、非課金サービスは120以下、課金サービスは236以下でなければなりません。* - 最大レプリカサイズは、選択したリージョンのクラウドプロバイダーのハードウェアの可用性に従います。 | 
| numReplicas | number | サービスのレプリカ数。最初のサービスのレプリカ数は、倉庫では2から20の間でなければなりません。既存の倉庫で作成されたサービスは、1のレプリカ数を持つことができます。さらに、組織のティアに基づいて制限が適用される場合があります。BASICティアの場合はデフォルトで1、SCALEおよびENTERPRISEティアの場合は3です。 | 
| idleScaling | boolean | trueに設定すると、サービスはアイドル時にゼロにスケールダウンできます。デフォルトはtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウト（分）を設定します。5分以上でなければなりません。 | 
| ipAccessList | array | サービスへのアクセスを許可されたIPアドレスのリスト | 
| createdAt | date-time | サービス作成タイムスタンプ。ISO-8601。 | 
| encryptionKey | string | オプションの顧客提供ディスク暗号化キー | 
| encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロール | 
| iamRole | string | S3のオブジェクトにアクセスするために使用されるIAMロール | 
| privateEndpointIds | array | プライベートエンドポイントのリスト | 
| availablePrivateEndpointIds | array | サービスに添付可能な利用可能なプライベートエンドポイントIDのリスト | 
| dataWarehouseId | string | このサービスを含むデータウェアハウス | 
| isPrimary | boolean | このサービスがデータウェアハウスのプライマリサービスである場合はtrue | 
| isReadonly | boolean | このサービスが読み取り専用の場合はtrue。dataWarehouseIdが提供されている場合のみ読み取り専用にできます。 | 
| releaseChannel | string | 新しいClickHouseリリースをできるだけ早く受け取るにはfastを選択します。新機能が早く得られますが、バグのリスクが高くなります。この機能は生産サービスにのみ利用可能です。 | 
| byocId | string | Bring Your Own Cloud (BYOC) のためにリージョンを設定した後に返されるIDです。byocIdパラメータが指定されている場合は、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要で、以下のサイズのいずれかに含まれた値でなければなりません：28、60、124、188、252、380。 |
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
## サービスの自動スケーリング設定を更新

サービスの最小および最大メモリ制限およびアイドルモードのスケーリング動作を更新します。メモリ設定は「生産」サービスにのみ使用可能で、24GBから始まり12の倍数でなければなりません。numReplicasの調整を有効にするにはサポートにお問い合わせください。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/scaling` |
### リクエスト
#### パスパラメーター

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | スケーリングパラメーターを更新するサービスのID。 |
### ボディパラメーター

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| minTotalMemoryGb | number | 非推奨 - 非デフォルトのレプリカ数を持つサービスには不正確。自動スケーリング中の3つのワーカーの最小メモリ（Gb）。'production'サービスにのみ使用可能。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 非推奨 - 非デフォルトのレプリカ数を持つサービスには不正確。自動スケーリング中の3つのワーカーの最大メモリ（Gb）。'production'サービスにのみ使用可能。12の倍数であり、非課金サービスは360以下、課金サービスは708以下でなければなりません。 | 
| numReplicas | number | サービスのレプリカ数。最初のサービスのレプリカ数は、倉庫では2から20の間でなければなりません。既存の倉庫で作成されたサービスは、1のレプリカ数を持つことができます。さらに、組織のティアに基づいて制限が適用される場合があります。BASICティアの場合はデフォルトで1、SCALEおよびENTERPRISEティアの場合は3です。 | 
| idleScaling | boolean | trueに設定すると、サービスはアイドル時にゼロにスケールダウンできます。デフォルトはtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウト（分）を設定します。5分以上でなければなりません。 |
### レスポンス
#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなサービスID。 | 
| name | string | サービスの名前。最大50文字の空白を含む英数字の文字列。 | 
| provider | string | クラウドプロバイダー | 
| region | string | サービスのリージョン。 | 
| state | string | サービスの現在の状態。 | 
| endpoints | array | すべてのサービスエンドポイントのリスト。 | 
| tier | string | BASIC、SCALE、ENTERPRISE組織ティアでは非推奨。サービスのティア：'development'、'production'、'dedicated_high_mem'、'dedicated_high_cpu'、'dedicated_standard'、'dedicated_standard_n2d_standard_4'、'dedicated_standard_n2d_standard_8'、'dedicated_standard_n2d_standard_32'、'dedicated_standard_n2d_standard_128'、'dedicated_standard_n2d_standard_32_16SSD'、'dedicated_standard_n2d_standard_64_24SSD'。生産サービスはスケールし、開発用は固定サイズです。Azureサービスは開発ティアをサポートしていません。 | 
| minTotalMemoryGb | number | 非推奨 - 非デフォルトのレプリカ数を持つサービスには不正確。自動スケーリング中の3つのワーカーの最小メモリ（Gb）。'production'サービスにのみ使用可能。12の倍数であり、24以上でなければなりません。 | 
| maxTotalMemoryGb | number | 非推奨 - 非デフォルトのレプリカ数を持つサービスには不正確。自動スケーリング中の3つのワーカーの最大メモリ（Gb）。'production'サービスにのみ使用可能。12の倍数であり、非課金サービスは360以下、課金サービスは708以下でなければなりません。 | 
| minReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最小合計メモリ（Gb）。4の倍数であり、8以上でなければなりません。 | 
| maxReplicaMemoryGb | number | 自動スケーリング中の各レプリカの最大合計メモリ（Gb）。4の倍数であり、非課金サービスは120以下、課金サービスは236以下でなければなりません。 | 
| numReplicas | number | サービスのレプリカ数。最初のサービスのレプリカ数は、倉庫では2から20の間でなければなりません。既存の倉庫で作成されたサービスは、1のレプリカ数を持つことができます。さらに、組織のティアに基づいて制限が適用される場合があります。BASICティアの場合はデフォルトで1、SCALEおよびENTERPRISEティアの場合は3です。 | 
| idleScaling | boolean | trueに設定すると、サービスはアイドル時にゼロにスケールダウンできます。デフォルトはtrueです。 | 
| idleTimeoutMinutes | number | 最小アイドルタイムアウト（分）を設定します。5分以上でなければなりません。 | 
| ipAccessList | array | サービスへのアクセスを許可されたIPアドレスのリスト | 
| createdAt | date-time | サービス作成タイムスタンプ。ISO-8601。 | 
| encryptionKey | string | オプションの顧客提供ディスク暗号化キー | 
| encryptionAssumedRoleIdentifier | string | ディスク暗号化に使用するオプションのロール | 
| iamRole | string | S3のオブジェクトにアクセスするために使用されるIAMロール | 
| privateEndpointIds | array | プライベートエンドポイントのリスト | 
| availablePrivateEndpointIds | array | サービスに添付可能な利用可能なプライベートエンドポイントIDのリスト | 
| dataWarehouseId | string | このサービスを含むデータウェアハウス | 
| isPrimary | boolean | このサービスがデータウェアハウスのプライマリサービスである場合はtrue | 
| isReadonly | boolean | このサービスが読み取り専用の場合はtrue。dataWarehouseIdが提供されている場合のみ読み取り専用にできます。 | 
| releaseChannel | string | 新しいClickHouseリリースをできるだけ早く受け取るにはfastを選択します。新機能が早く得られますが、バグのリスクが高くなります。この機能は生産サービスにのみ利用可能です。 | 
| byocId | string | Bring Your Own Cloud (BYOC) のためにリージョンを設定した後に返されるIDです。byocIdパラメータが指定されている場合は、minReplicaMemoryGbおよびmaxReplicaGbパラメータも必要で、以下のサイズのいずれかに含まれた値でなければなりません：28、60、124、188、252、380。 |
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
## サービスのパスワードを更新

サービスの新しいパスワードを設定します。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/password` |
### リクエスト
#### パスパラメーター

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | パスワードを更新するサービスのID。 |
### ボディパラメーター

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| newPasswordHash | string | オプションのパスワードハッシュ。ネットワーク経由のパスワード送信を回避するために使用されます。提供されない場合は、新しいパスワードが生成され、レスポンスで提供されます。さもなければ、このハッシュが使用されます。アルゴリズム: echo -n "yourpassword" | sha256sum | tr -d '-' | xxd -r -p | base64 | 
| newDoubleSha1Hash | string | MySQLプロトコル用のオプションのダブルSHA1パスワードハッシュ。newPasswordHashが提供されていない場合、このキーは無視され、生成されたパスワードが使用されます。アルゴリズム: echo -n "yourpassword" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-' |
### レスポンス
#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| password | string | 新しいサービスパスワード。リクエストに'newPasswordHash'が無かった場合のみ提供されます。 |
#### サンプルレスポンス

```
{
  "password": "string"
}
```
## Prometheusメトリクスを取得

サービスのPrometheusメトリクスを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/prometheus` |
### リクエスト
#### パスパラメーター

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | 取得したいサービスのID。 | 
| filtered_metrics | boolean | フィルタされたPrometheusメトリクスのリストを返します。 |
## サービスのバックアップリスト

サービスのすべてのバックアップのリストを返します。最新のバックアップがリストの最初に来ます。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backups` |
### リクエスト
#### パスパラメーター

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | バックアップを所有する組織のID。 | 
| serviceId | uuid | バックアップが作成されたサービスのID。 |
### レスポンス
#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなバックアップID。 | 
| status | string | バックアップのステータス：'done'、'error'、'in_progress'。 | 
| serviceId | string | 名前  | 
| startedAt | date-time | バックアップ開始タイムスタンプ。ISO-8601。 | 
| finishedAt | date-time | バックアップ終了タイムスタンプ。ISO-8601。完了したバックアップにのみ使用可能 | 
| sizeInBytes | number | バックアップのサイズ（バイト）。 | 
| durationInSeconds | number | バックアップを実行するのにかかった時間（秒）。ステータスがまだ進行中の場合、これはバックアップが開始されてからの経過秒数です。 | 
| type | string | バックアップのタイプ（"full"または"incremental"）。 |
#### サンプルレスポンス

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
## バックアップの詳細を取得

単一バックアップ情報を返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backups/{backupId}` |
### リクエスト
#### パスパラメーター

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | バックアップを所有する組織のID。 | 
| serviceId | uuid | バックアップが作成されたサービスのID。 | 
| backupId | uuid | 取得したバックアップのID。 |
### レスポンス
#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| id | uuid | ユニークなバックアップID。 | 
| status | string | バックアップのステータス：'done'、'error'、'in_progress'。 | 
| serviceId | string | 名前  | 
| startedAt | date-time | バックアップ開始タイムスタンプ。ISO-8601。 | 
| finishedAt | date-time | バックアップ終了タイムスタンプ。ISO-8601。完了したバックアップにのみ使用可能 | 
| sizeInBytes | number | バックアップのサイズ（バイト）。 | 
| durationInSeconds | number | バックアップを実行するのにかかった時間（秒）。ステータスがまだ進行中の場合、これはバックアップが開始されてからの経過秒数です。 | 
| type | string | バックアップのタイプ（"full"または"incremental"）。 |
#### サンプルレスポンス

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
## サービスのバックアップ設定を取得

サービスのバックアップ設定を返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backupConfiguration` |
### リクエスト
#### パスパラメーター

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | サービスのID。 |
### レスポンス
#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | 各バックアップの間の時間間隔（時間）。 | 
| backupRetentionPeriodInHours | number | バックアップが利用可能な最小期間（時間）。 | 
| backupStartTime | string | バックアップが実行される時間（HH:MM形式）。 UTCタイムゾーンで評価されます。定義されると、バックアップ期間は24時間ごとにリセットされます。 |
#### サンプルレスポンス

```
{
  "backupPeriodInHours": 0,
  "backupRetentionPeriodInHours": 0,
  "backupStartTime": "string"
}
```
## サービスのバックアップ設定を更新

サービスのバックアップ設定を更新します。ADMIN認証キーのロールが必要です。null値のプロパティを設定すると、それらのプロパティはデフォルト値にリセットされます。

| メソッド | パス |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/backupConfiguration` |
### リクエスト
#### パスパラメーター

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | サービスを所有する組織のID。 | 
| serviceId | uuid | サービスのID。 |
### ボディパラメーター

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | 各バックアップの間の時間間隔（時間）。 | 
| backupRetentionPeriodInHours | number | バックアップが利用可能な最小期間（時間）。 | 
| backupStartTime | string | バックアップが実行される時間（HH:MM形式）。 UTCタイムゾーンで評価されます。定義されると、バックアップ期間は24時間ごとにリセットされます。 |
### レスポンス
#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | 各バックアップの間の時間間隔（時間）。 | 
| backupRetentionPeriodInHours | number | バックアップが利用可能な最小期間（時間）。 | 
| backupStartTime | string | バックアップが実行される時間（HH:MM形式）。 UTCタイムゾーンで評価されます。定義されると、バックアップ期間は24時間ごとにリセットされます。 |
#### サンプルレスポンス

```
{
  "backupPeriodInHours": 0,
  "backupRetentionPeriodInHours": 0,
  "backupStartTime": "string"
}
```
