---
description: 'ClickHouse Cloud における JWT ベースの認証と一時的なユーザーに関するガイド'
sidebar_label: 'JWT'
sidebar_position: 55
slug: /operations/external-authenticators/jwt
title: 'JWT 認証'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

ClickHouse では、JSON Web Tokens (JWT) を使用してユーザーを認証できます。[LDAP](/operations/external-authenticators/ldap) や [Kerberos](/operations/external-authenticators/kerberos) などの他の外部認証方式とは異なり、JWT 認証では既存ユーザーの本人確認は行われません。代わりに、各トークンに埋め込まれたクレームから **一時ユーザー** が動的に作成されます。これらのユーザーはメモリ内にのみ存在し、トークンのクレームから導出されたアクセス権が付与され、トークンの有効期限が切れると自動的に削除されます。

このため、JWT 認証はパスワードベースや証明書ベースの方式とは本質的に異なります。`CREATE USER ... IDENTIFIED WITH jwt` ステートメントは存在せず、これを実行しようとすると例外が発生します。JWT ユーザーは、トークンのライフサイクルによって完全に管理されます。

## 概要 \{#overview\}

認証フローは次のとおりです。

1. クライアントは、サポートされているいずれかのトランスポートメカニズム (HTTP `Authorization: Bearer` ヘッダー、TCP ネイティブプロトコル、または gRPC の `jwt` フィールド) を介して、署名付き JWT を提示します。
2. ClickHouse がトークンの署名を検証します。
3. 必須クレーム (`exp`, `iat`, `iss`, `sub`, `aud`) が検証されます。
4. `clickhouse:grants` および `clickhouse:roles` のトークンクレームから導出され、権限上限との積集合を取ったアクセス権を持つ一時ユーザーがメモリ内に作成されます。
5. トークンの有効期限が切れると、バックグラウンドのガベージコレクションタスクによってそのユーザーが削除されます。

## トークンクレーム \{#token-claims\}

### 必須クレーム \{#required-claims\}

ClickHouse に提示されるすべての JWT には、次のクレームが含まれている必要があります。

| クレーム  | 説明                                                      |
| ----- | ------------------------------------------------------- |
| `alg` | 署名アルゴリズム (ヘッダークレーム) 。サポートされる値: `HS256`、`RS256`、`ES256`。 |
| `exp` | 有効期限。一時ユーザーの `valid_until` を設定します。                      |
| `iat` | 発行時刻。同一の ID に対する古いトークンのリプレイを防ぐために使用されます。                |
| `iss` | 発行者。プロバイダで想定される発行者と照合されます。                              |
| `sub` | サブジェクト。生成されるユーザー名の一部になります。                              |
| `aud` | オーディエンス。プロバイダで想定されるオーディエンスと照合されます。                      |

JWKS ベースの鍵解決を使用する場合は、`kid` (キー ID) ヘッダークレームも必須です。

:::note JWKS モードは RSA 鍵のみをサポートします
静的鍵プロバイダは `HS256`、`RS256`、`ES256` のいずれも受け入れますが、JWKS ベースのプロバイダが受け入れるのは `kty` が `RSA` の JWK のみです (つまり、`RS256` で署名されたトークンのみ) 。HMAC (`HS256`) または EC (`ES256`) 鍵で署名されたトークンは JWKS エンドポイントに対して検証できないため、拒否されます。
:::

### その他の認識済みクレーム \{#other-recognized-claims\}

| クレーム  | 説明                                                             |
| ----- | -------------------------------------------------------------- |
| `nbf` | Not-before 時刻。このクレームは必須ではありませんが、指定されている場合、この時刻より前のトークンは拒否されます。 |
| `jti` | 予約済み。トークン内で使用できますが、現時点では検証も使用もされません。                           |

### オプションのクレーム \{#optional-claims\}

| クレーム                                                                   | デフォルト名              | 説明                                                                                                              |
| ---------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| 権限                                                                     | `clickhouse:grants` | SQL `GRANT` フラグメントの JSON 配列です。例: `["SELECT ON db.*", "INSERT ON db.table1"]`。各要素は `GRANT` ステートメントの本体としてパースされます。 |
| ロール                                                                    | `clickhouse:roles`  | 割り当てるロール名の JSON 配列です。例: `["analyst", "reader"]`。                                                                |
| identity provider で別の命名規則を使用している場合は、デフォルトのクレーム名をカスタムのクレーム名に再マッピングできます。 |                     |                                                                                                                 |

### トークンのヘッダーとペイロードの例 \{#example-token-header-and-payload\}

```json
{
  "alg": "RS256",
  "kid": "my-key-id"
}
```

```json
{
  "iss": "https://idp.example.com",
  "sub": "jane.doe",
  "aud": "my-clickhouse-cluster",
  "exp": 1719504000,
  "iat": 1719500400,
  "clickhouse:grants": ["SELECT ON analytics.*", "INSERT ON analytics.events"],
  "clickhouse:roles": ["analyst"]
}
```

## 一時ユーザーの挙動 \{#ephemeral-user-behavior\}

JWT ユーザーは、通常の ClickHouse ユーザーとはいくつかの重要な点で異なります。

### 識別子と命名 \{#identity-and-naming\}

各 JWT ユーザーには、`iss`、`sub`、`aud` クレームから算出された決定論的な UUID が割り当てられます。この UUID はログインをまたいでも**不変**です。異なるトークンを使って複数回ログインしても、issuer、subject、audience が同じであれば、常に同じ UUID が割り当てられます。

一方で、ユーザー名は**変動**します。次のように構成されます。

```text
JWT::<issuer>::<audience>::<subject>::<claims_hash>
```

`<claims_hash>` の部分は、`clickhouse:roles` または `clickhouse:grants` のクレームが変更されるたびに変わります。つまり、同一のアイデンティティであっても、ロールまたは権限の組み合わせが異なるトークンでは、生成されるユーザー名も異なります。

### アクセス権 \{#access-rights\}

有効なアクセス権は次のように計算されます。

```text
effective_rights = permission_limit ∩ (token_grants ∪ token_roles)
```

ここで、`permission_limit` は、上限として設定された参照ロールまたはユーザーが保持するアクセス権の範囲を指します。トークンが要求する権限のうち、この上限を超えるものは通知されることなく除外されます。

### トークンの鮮度 \{#token-freshness\}

ClickHouse は、各安定IDについて、直近で認証に使用されたトークンの `iat` (発行時刻) クレームを追跡します。保存されている値と同じか、それより古い `iat` を持つトークンが提示された場合、サーバーはクレームを再評価せずに既存の一時ユーザーを再利用します。これにより、古いトークンによってユーザーの権限が引き下げられるのを防ぎます。

### 有効期間とガベージコレクション \{#lifetime-and-garbage-collection\}

一時ユーザーは、トークンが初めて認証されたときに作成され、`exp` から導出される `valid_until` を過ぎると、バックグラウンドのガベージコレクション タスクによって削除されます。GC の間隔は `gc_interval` パラメータ (デフォルト: 5 分) で制御されます。

GC の実行と実行の間は、期限切れのユーザーが `system.users` に表示されたままの場合がありますが、認証はできなくなります。

### 永続的なアクセス権の割り当て \{#persistent-access-assignments\}

UUID は不変であるため、SQL文を使用して、設定プロファイル、クォータ、行ポリシー、カラムのマスキングポリシーを JWT ユーザーに割り当てることができます。これらの割り当てはアクセス制御ストレージ (ディスク上または ZooKeeper 上) に永続化され、トークンの有効期限切れや再認証後も保持されます。

ユーザーは現在のユーザー名で参照します:

```sql
ALTER SETTINGS PROFILE my_profile ADD TO 'JWT::ClickHouse::my-service-id::jane.doe::<claims-hash>';
```

:::note
特定のアイデンティティのユーザー名と UUID は、ユーザーがアクティブな間、`system.users` の `name` カラムと `id` カラムで確認できます。
:::

JWT ユーザーは読み取り専用のため、`ALTER USER` を直接使用することはできません。設定プロファイル、クォータ、またはポリシーを割り当てるには、上記のとおり `ALTER SETTINGS PROFILE`、`ALTER QUOTA`、または `ALTER ROW POLICY` ステートメントを使用してください。

## 一般ユーザーとの違い \{#differences-from-regular-users\}

| 機能                                    | JWT ユーザー                    | 一般ユーザー                   |
| ------------------------------------- | --------------------------- | ------------------------ |
| 作成                                    | トークンクレームから自動的に作成            | `CREATE USER` ステートメント    |
| 保存場所                                  | メモリ内のみ (揮発的)                | ディスク、ZooKeeper、または設定ファイル |
| `CREATE USER ... IDENTIFIED WITH jwt` | サポートされない (例外を返す)            | その他のすべての認証タイプをサポート       |
| `ALTER USER` / `DROP USER`            | サポートされない                    | サポートされる                  |
| バックアップと復元                             | 対象外                         | 対象                       |
| ユーザー名                                 | 自動生成され、固定されない               | 管理者が指定し、固定される            |
| UUID                                  | `iss`+`sub`+`aud` から決定論的に生成 | 作成時にランダムに生成              |
| 有効期間                                  | トークンの `exp` で制限される          | 明示的に削除されるまで              |
| アクセス権                                 | トークンクレームから導出され、権限上限で制限される   | `GRANT` で明示的に付与          |
| ホスト制限                                 | プロバイダーごとのネットワーク設定           | ユーザーごとの `HOST` 句         |
| 設定プロファイル                              | UUID で割り当て可能 (永続的)          | 直接設定可能                   |
| クォータと行ポリシー                            | UUID で割り当て可能 (永続的)          | 直接設定可能                   |
| デフォルトロール                              | 設定不可                        | 設定可能                     |

## `SQL SECURITY DEFINER` ビュー \{#sql-security-definer-views\}

一時的な JWT ユーザーが `SQL SECURITY DEFINER` を指定してビューを作成すると、サーバーはそのビューの定義者として機能する永続的なシャドウコピーを自動的に作成します。このシャドウユーザーは、次の特性を持ちます。

* 名前は `<original_jwt_username>:definer`
* `NO_AUTHENTICATION` を持つ (ログインには使用できない)
* ビューの作成時点で、元の JWT ユーザーと同じアクセス権を保持する

これにより、一時ユーザーのトークンが期限切れになり、元のユーザーがガベージコレクションされた後も、ビューは引き続き機能します。

## クライアントの使用方法 \{#client-usage\}

### トークンを直接渡す \{#passing-token-directly\}

`clickhouse-client` の `--jwt` フラグを使用して、事前に取得したトークンで認証します:

```bash
clickhouse-client --host your-instance.clickhouse.cloud --secure --jwt '<your_jwt_token>'
```

:::note
`--jwt` フラグは `--user` と同時には使用できません。`--jwt` を指定した場合、ユーザー名はトークンから取得されます。
:::

### HTTPインターフェイス \{#http-interface\}

トークンは、`Authorization` ヘッダーで Bearer トークンとして送信します。

```bash
curl -H 'Authorization: Bearer <your_jwt_token>' \
    'https://your-instance.clickhouse.cloud:8443/?query=SELECT+currentUser()'
```

:::warning
JWT は必ず HTTPS 経由で送信してください。平文の HTTP で送信された Bearer トークンは、ネットワーク経路上の第三者に見られる可能性があり、認証情報を漏えいしたのと同じです。
:::

### OAuth2 デバイスコードログイン \{#oauth2-device-code-login\}

`clickhouse-client` は、`--login` フラグを使用した対話型の OAuth2 デバイスコードフローをサポートしています。ClickHouse Cloud のエンドポイントでは、クライアントが自動的にトークン交換を行い、ClickHouse 固有の JWT を取得します。トークンはセッション中に透過的に更新されます。新しいトークンが取得されると、クライアントは自動的に再接続します。

```bash
clickhouse-client --host your-instance.clickhouse.cloud --login
```

## ClickHouse Cloud 組み込み JWT 認証器 \{#clickhouse-cloud-built-in\}

すべての ClickHouse Cloud サービスには、SQL Console と `clickhouse-client` の `--login` フローで使用される、事前定義済みの JWT 認証器が含まれています。この認証器は、次のように設定されています。

| パラメータ            | 値                                      |
| ---------------- | -------------------------------------- |
| `iss` (issuer)   | `ClickHouse`                           |
| `aud` (audience) | サービス UUID (Cloud Console の URL で確認可能)  |
| `sub` (subject)  | ClickHouse Cloud アカウントのメールアドレス         |

この組み込み認証器には、`default_role` ロールおよび `default` ユーザーを上限とする権限上限が設定されています。つまり、すべての JWT ユーザーの実効権限は、これら 2 つのエンティティに付与されている grants との積集合になるため、トークンによって `default_role` と `default` に許可された範囲を超えて権限を昇格させることはできません。

この認証器を使用するために追加の設定は不要です。サービスの作成時に自動的にプロビジョニングされます。

## サーバー間通信 \{#interserver-communication\}

クエリが別の分片またはレプリカに転送されると、JWTトークンはサーバー間プロトコルに含まれます。リモートノードはそのトークンを個別に再検証し、そのノード自身の一時ユーザーを作成します。

## トラブルシューティング \{#troubleshooting\}

* **アクセス権が付与されていない:** 参照先のロールまたはユーザーに、必要な権限が付与されていない可能性があります。`clickhouse:roles` で参照しているロールが存在し、適切な権限が含まれていることを確認してください。
* **トークンが拒否される:** トークン内の `iss`、`aud`、および署名アルゴリズムが、JWT プロバイダーの想定と一致していることを確認してください。JWKS を使用している場合は、トークンの `kid` がプロバイダーの鍵セット内の鍵と一致していることを確認してください。
* **クエリの間でユーザーが消える:** 一時ユーザーは、トークンの有効期限が切れると削除されます。長時間のセッションには、トークンの更新をサポートするクライアント (例: `--login` モード) を使用してください。
* **`CREATE USER ... IDENTIFIED WITH jwt` が失敗する:** これは想定どおりの動作です。JWT ユーザーは DDL で作成できません。完全にトークンのライフサイクルによって管理されます。