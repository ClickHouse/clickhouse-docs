---
sidebar_label: PrivateEndpointConfig
title: PrivateEndpointConfig
---

## クラウドプロバイダー内のリージョンに対する組織のプライベートエンドポイント構成を取得 {#get-private-endpoint-configuration-for-region-within-cloud-provider-for-an-organization}

プライベートエンドポイントを設定するために必要な情報

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/privateEndpointConfig` |

### リクエスト {#request}

#### パスパラメータ {#path-params}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 | 
| Cloud provider identifier | string | クラウドプロバイダーの識別子。aws、gcp、またはazureのいずれか。 | 
| Cloud provider region | string | 特定のクラウドプロバイダー内のリージョン識別子。 | 

### レスポンス {#response}

#### レスポンススキーマ {#response-schema}

| 名前 | 型 | 説明 |
| :--- | :--- | :---------- |
| endpointServiceId | string | AWS（サービス名）またはGCP（ターゲットサービス）リソースでVPC内に作成したインターフェースエンドポイントの一意の識別子 | 

#### サンプルレスポンス {#sample-response}

```
{
  "endpointServiceId": "string"
}
```
