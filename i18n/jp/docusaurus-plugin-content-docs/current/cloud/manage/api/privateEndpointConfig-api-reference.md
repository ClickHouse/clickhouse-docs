---
sidebar_label: PrivateEndpointConfig
title: PrivateEndpointConfig
---

## クラウドプロバイダー内の地域に対するプライベートエンドポイント設定を取得する

プライベートエンドポイントを設定するために必要な情報

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/privateEndpointConfig` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 | 
| Cloud provider identifier | string | クラウドプロバイダーの識別子。aws、gcp、またはazureのいずれか。 | 
| Cloud provider region | string | 特定のクラウドプロバイダー内の地域識別子。 | 

### レスポンス

#### レスポンススキーマ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| endpointServiceId | string | AWS（サービス名）またはGCP（ターゲットサービス）リソースでVPCに作成したインターフェースエンドポイントのユニークな識別子。 | 

#### サンプルレスポンス

```
{
  "endpointServiceId": "string"
}
```
