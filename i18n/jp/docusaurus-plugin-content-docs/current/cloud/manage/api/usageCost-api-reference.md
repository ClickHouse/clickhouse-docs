---
sidebar_label: UsageCost
title: UsageCost
---

## 組織の使用コストを取得する

クエリされた期間（最大31日間）における組織の使用コスト記録の総額および日毎のエンティティ別使用コスト記録のリストを返します。リクエストおよびレスポンス内のすべての日付はUTCタイムゾーンに基づいて評価されます。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/usageCost` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 | 
| from_date | date-time | レポートの開始日。例: 2024-12-19。 | 
| to_date | date-time | レポートの終了日（含む）。例: 2024-12-20。 この日付は、from_dateの30日後を超えてはいけません（最大クエリ期間31日）。 | 

### レスポンス

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| grandTotalCHC | number | ClickHouseクレジット（CHC）における使用の総コスト。 | 
| costs.dataWarehouseId | uuid | このエンティティが属しているデータウェアハウスのID。 | 
| costs.serviceId | uuid | このエンティティが属しているサービスのID。データウェアハウスエンティティにはnullに設定されます。 | 
| costs.date | date | 使用の日付。UTCタイムゾーンに基づくISO-8601形式の日付。 | 
| costs.entityType | string | エンティティのタイプ。 | 
| costs.entityId | uuid | エンティティのユニークID。 | 
| costs.entityName | string | エンティティの名前。 | 
| costs.metrics.storageCHC | number | ClickHouseクレジット（CHC）におけるストレージコスト。データウェアハウスエンティティに適用されます。 | 
| costs.metrics.backupCHC | number | ClickHouseクレジット（CHC）におけるバックアップコスト。データウェアハウスエンティティに適用されます。 | 
| costs.metrics.computeCHC | number | ClickHouseクレジット（CHC）におけるコンピュートコスト。サービスおよびClickPipeエンティティに適用されます。 | 
| costs.metrics.dataTransferCHC | number | ClickHouseクレジット（CHC）におけるデータ転送コスト。ClickPipeエンティティに適用されます。 | 
| costs.metrics.publicDataTransferCHC | number | ClickHouseクレジット（CHC）におけるデータ転送コスト。サービスエンティティに適用されます。 | 
| costs.metrics.interRegionTier1DataTransferCHC | number | ClickHouseクレジット（CHC）におけるテナント1の地域間データ転送コスト。サービスエンティティに適用されます。 | 
| costs.metrics.interRegionTier2DataTransferCHC | number | ClickHouseクレジット（CHC）におけるテナント2の地域間データ転送コスト。サービスエンティティに適用されます。 | 
| costs.metrics.interRegionTier3DataTransferCHC | number | ClickHouseクレジット（CHC）におけるテナント3の地域間データ転送コスト。サービスエンティティに適用されます。 | 
| costs.metrics.interRegionTier4DataTransferCHC | number | ClickHouseクレジット（CHC）におけるテナント4の地域間データ転送コスト。サービスエンティティに適用されます。 | 
| costs.totalCHC | number | このエンティティに対するClickHouseクレジット（CHC）における使用の総コスト。 | 
| costs.locked | boolean | trueの場合、レコードは不変です。ロックされていないレコードはロックされるまで変更の対象となります。 |

#### サンプルレスポンス

```
{
  "grandTotalCHC": 0,
  "costs": {
    "dataWarehouseId": "uuid",
    "serviceId": "uuid",
    "date": "date",
    "entityType": "string",
    "entityId": "uuid",
    "entityName": "string",
    "metrics": {
      "storageCHC": 0,
      "backupCHC": 0,
      "computeCHC": 0,
      "dataTransferCHC": 0,
      "publicDataTransferCHC": 0,
      "interRegionTier1DataTransferCHC": 0,
      "interRegionTier2DataTransferCHC": 0,
      "interRegionTier3DataTransferCHC": 0,
      "interRegionTier4DataTransferCHC": 0
    },
    "totalCHC": 0,
    "locked": "boolean"
  }
}
```
