---
sidebar_label: Prometheus
title: Prometheus
---

## 組織メトリクスの取得 {#get-organization-metrics}

特定の組織内のすべてのサービスに対する Prometheus メトリクスを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/prometheus` |

### リクエスト {#request}

#### パスパラメータ {#path-params}

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織の ID。 | 
| filtered_metrics | boolean | フィルタリングされた Prometheus メトリクスのリストを返します。 | 
