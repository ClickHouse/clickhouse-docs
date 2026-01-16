---
description: 'ClickHouse Keeper HTTP API および組み込みダッシュボードに関するドキュメント'
sidebar_label: 'Keeper HTTP API'
sidebar_position: 70
slug: /operations/utilities/clickhouse-keeper-http-api
title: 'Keeper HTTP API およびダッシュボード'
doc_type: 'reference'
---

# Keeper HTTP API とダッシュボード \{#keeper-http-api-and-dashboard\}

ClickHouse Keeper は、監視・ヘルスチェック・ストレージ管理のための HTTP API と組み込み Web ダッシュボードを提供します。
このインターフェースを使用すると、運用者は Web ブラウザや HTTP クライアントを通じて、クラスタの状態を確認し、コマンドを実行し、Keeper ストレージを管理できます。

## 設定 \{#configuration\}

HTTP API を有効にするには、`keeper_server` の設定に `http_control` セクションを追加します。

```xml
<keeper_server>
    <!-- Other keeper_server configuration -->

    <http_control>
        <port>9182</port>
        <!-- <secure_port>9443</secure_port> -->
    </http_control>
</keeper_server>
```


### 設定オプション \{#configuration-options\}

| 設定項目                                   | デフォルト | 説明                                            |
|--------------------------------------------|-----------|-------------------------------------------------|
| `http_control.port`                        | -         | ダッシュボードおよび API 用の HTTP ポート      |
| `http_control.secure_port`                 | -         | HTTPS ポート（SSL 設定が必要）                 |
| `http_control.readiness.endpoint`          | `/ready`  | readiness プローブ用のカスタムパス             |
| `http_control.storage.session_timeout_ms`  | `30000`   | ストレージ API 操作のセッションタイムアウト時間 |

## エンドポイント \{#endpoints\}

### ダッシュボード \{#dashboard\}

- **Path**: `/dashboard`
- **Method**: GET
- **Description**: Keeper の監視と管理のための埋め込み Web ダッシュボードを返します

このダッシュボードでは、次の機能を提供します。

- クラスタ状態のリアルタイムな可視化
- ノード監視（ロール、レイテンシ、接続状況）
- ストレージブラウザー
- コマンド実行用インターフェース

### Readiness Probe \{#readiness-probe\}

* **パス**: `/ready`（設定可能）
* **メソッド**: GET
* **説明**: ヘルスチェック用のエンドポイント

成功時のレスポンス（HTTP 200）:

```json
{
  "status": "ok",
  "details": {
    "role": "leader",
    "hasLeader": true
  }
}
```


### Commands API \{#commands-api\}

* **Path**: `/api/v1/commands/{command}`
* **Methods**: GET, POST
* **Description**: Four-Letter Word コマンドまたは ClickHouse Keeper Client CLI コマンドを実行します

Query parameters:

* `command` - 実行するコマンド
* `cwd` - パスベースのコマンドで使用する作業ディレクトリ (デフォルト: `/`)

Examples:

```bash
# Four-Letter Word command
curl http://localhost:9182/api/v1/commands/stat

# ZooKeeper CLI command
curl "http://localhost:9182/api/v1/commands/ls?command=ls%20'/'&cwd=/"
```


### Storage API \{#storage-api\}

- **Base Path**: `/api/v1/storage`
- **Description**: Keeper のストレージ操作用 REST API

Storage API は REST の慣習に従い、HTTP メソッドで操作種別を表現します:

| Operation | Path                                       | Method | Status Code | Description                |
|-----------|--------------------------------------------|--------|-------------|----------------------------|
| Get       | `/api/v1/storage/{path}`                   | GET    | 200         | ノードデータを取得        |
| List      | `/api/v1/storage/{path}?children=true`     | GET    | 200         | 子ノードを一覧表示        |
| Exists    | `/api/v1/storage/{path}`                   | HEAD   | 200         | ノードの存在を確認        |
| Create    | `/api/v1/storage/{path}`                   | POST   | 201         | 新規ノードを作成          |
| Update    | `/api/v1/storage/{path}?version={v}`       | PUT    | 200         | ノードデータを更新        |
| Delete    | `/api/v1/storage/{path}?version={v}`       | DELETE | 204         | ノードを削除              |