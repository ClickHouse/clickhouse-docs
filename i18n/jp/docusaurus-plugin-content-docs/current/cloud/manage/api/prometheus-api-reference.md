---
sidebar_label: Prometheus
title: Prometheus
---

## 組織のメトリクスを取得する

組織内のすべてのサービスに対するPrometheusメトリクスを返します。

| メソッド | パス |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/prometheus` |

### リクエスト

#### パスパラメータ

| 名前 | タイプ | 説明 |
| :--- | :--- | :---------- |
| organizationId | uuid | リクエストされた組織のID。 |
| filtered_metrics | boolean | フィルタリングされたPrometheusメトリクスのリストを返します。 |
