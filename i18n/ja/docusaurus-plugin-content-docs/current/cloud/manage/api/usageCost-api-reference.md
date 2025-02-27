---
sidebar_label: 使用コスト
title: 使用コスト
---

## 組織の使用コストを取得する {#get-organization-usage-costs}

これは実験的な機能です。これを有効にするにはサポートにお問い合わせください。

指定された期間（最大31日）の組織における使用コスト記録の合計と、日毎のエンティティ別のリストを返します。リクエストとレスポンスのすべての日は、UTCタイムゾーンに基づいて評価されます。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/usageCost` |

### リクエスト {#request}

#### パスパラメータ {#path-params}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要求された組織のID。 | 
| from_date | date-time | レポートの開始日、例：2024-12-19。 | 
| to_date | date-time | レポートの終了日（含む）、例：2024-12-20。この日付はfrom_dateから30日を超えてはなりません（最大31日のクエリ期間）。 | 

### レスポンス {#response}

#### レスポンススキーマ {#response-schema}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| grandTotalCHC | number | ClickHouseクレジット（CHC）の使用合計コスト。 | 
| costs |  |  | 

#### サンプルレスポンス {#sample-response}

```
{
  "grandTotalCHC": 0
}
```
