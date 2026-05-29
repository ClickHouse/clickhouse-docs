---
slug: /integrations/integration-development/documenting-your-integration
sidebar_label: '連携のドキュメント作成'
sidebar_position: 4
title: 'ClickHouse 連携のドキュメント作成'
description: '必須セクションやコピー＆ペーストできるひな形を含め、clickhouse-docs に連携ページを追加する方法を説明します。'
keywords: ['パートナー', '連携', 'ドキュメント', 'コントリビューション', 'プルリクエスト', '連携ドキュメント']
doc_type: 'guide'
---

# ClickHouse 連携のドキュメント化 \{#documenting-your-clickhouse-integration\}

このサイトの連携ドキュメントでは、エンドユーザーがセットアップ内容を把握し、問題を一か所で切り分けられるようにします。このページでは、記載すべき内容、ファイルの配置場所、プルリクエストの作成方法について説明します。

まだ確認していない場合は、まず [Building integrations](/integrations/integration-development/building-integrations) と [Testing your integration](/integrations/integration-development/testing-your-integration) を参照してください。

## ドキュメントの配置場所 \{#where-docs-live\}

* **リポジトリ:** [`ClickHouse/clickhouse-docs`](https://github.com/ClickHouse/clickhouse-docs)
* **フォーマット:** Markdown、Docusaurus でビルド
* **場所:** `/docs/integrations/<category>/<your-integration>/`。`<category>` には、製品の機能を表す値 (`data-visualization`、`data-ingestion`、`language-clients` など) を指定します
* **プロセス:** `main` に対してプルリクエストを作成します。ClickHouse の Integrations チームがレビューします。初回のコントリビューターは、PR 上でボットの案内に従って Contributor License Agreement に署名します

このリポジトリ内の連携ページは、エンドユーザー向けの主要なリファレンスです。製品固有の詳細については、連携ページから自社サイト上の補足ドキュメントへリンクできます。

参考になる優れた例: [Tableau](/integrations/tableau) と [Metabase](/integrations/metabase)。

## カテゴリを選択する \{#choosing-a-category\}

製品の機能に最も合ったカテゴリを選択してください。PR を作成する前に、[Integrations](/integrations) にある既存のカテゴリを確認してください。判断に迷う場合は、PR の説明欄に想定しているカテゴリを記載してください。Integrations チームが適切なページ配置をサポートします。

## 必須セクション \{#required-sections\}

すべての連携ページでは、できれば次の内容をこの順序で扱ってください。

1. **目的。** その連携で解決できる問題を、2～3文で説明します。宣伝的な表現は避けてください。読者の多くは、導入構成を検討しているエンジニアです
2. **前提条件とサポート対象バージョンの一覧。** ユーザーが事前にインストールしておくべきものと、**ClickHouse Cloud とセルフホスト (オープンソース) の両方**でサポートするバージョンを示します。小さな表にまとめると効果的です
3. **セットアップ手順。** 動作する接続を確立するまでの手順を段階的に説明します。差異がある箇所 (ホスト、ポート、TLS) については、**Cloud とセルフホストを並べて**記載してください
4. **認証。** サポートする認証方式を示します (少なくとも TLS 上でのユーザー名とパスワード認証に対応し、該当する場合は mTLS、SSL クライアント証明書、IP 許可リストに関する注記も含めます)
5. **エンドツーエンドの例。** 接続から意味のある結果が得られるまでの、現実的な例を少なくとも 1 つ含めてください。読者が再現できるように、[ClickHouse example dataset](/getting-started/example-datasets) を使用してください
6. **既知の制限事項とパフォーマンス特性。** 型システム上の制約、結果セットのしきい値、スループットに関する注意点、未対応の機能を記載します。ここを率直に書いておくことで、サポート工数の削減につながります
7. **トラブルシューティング。** よくあるエラーとその対処方法を記載します。初版であれば、頻出するケースを 2～3 件挙げれば十分です

## スタイルに関する注意事項 \{#style-notes\}

* **Cloud と セルフホスト の両方を記載してください。** Cloud では通常、ポート `8443` で HTTPS、`9440` でネイティブ TCP を使用します。セルフホスト のデフォルトは `8123` と `9000` です
* **Docusaurus の admonition** (`:::note`、`:::warning`、`:::tip`) を使用し、太字の段落ではなくコールアウトとして記述してください
* **詳細はリンク先に委ねてください。** データ型、フォーマット、JDBC、ClickPipes などは既存のドキュメントにリンクし、ここで重ねて説明しないでください
* **マーケティング色は出さないでください。** ここでの連携ページは技術リファレンスです。プロモーション用の内容は自社サイトに掲載し、こちらからはパートナーディレクトリ経由でリンクできます

## コピー＆ペースト用テンプレート \{#copy-paste-skeleton\}

角括弧で囲まれた部分を埋め、`/docs/integrations/<category>/<your-integration>/index.md` として保存し、PR を作成します。

```markdown
# [Your product] and ClickHouse

[One to three sentences: what the integration does and why a
ClickHouse user would want it.]

## Prerequisites

- [Your product, version X.Y or later]
- ClickHouse Cloud, or self-hosted ClickHouse version [X.Y] or later
- [Anything else: driver, plugin, network access requirements]

### Version matrix

| [Your product] | ClickHouse Cloud | ClickHouse open source | Notes    |
| -------------- | ---------------- | ---------------------- | -------- |
| X.Y            | ✅               | ✅ 24.x+               | [if any] |

## Setup

### Connect to ClickHouse Cloud

1. In the ClickHouse Cloud console, select your service and click **Connect**.
2. Choose **HTTPS**. Copy the host, port (8443), username, and password.
3. In [your product], [steps to configure the connection].

### Connect to self-hosted ClickHouse

1. [How to point at a self-hosted instance — host, port 8123 or 9000, TLS notes.]
2. In [your product], [steps to configure the connection].

## Authentication

[List supported auth modes — username/password over TLS, mTLS, etc. — and how
to configure each.]

## Example: querying the [dataset] dataset

[Walkthrough using one of the ClickHouse example datasets, end-to-end.]

## Known limits

- [Types not yet supported, e.g., deeply nested JSON]
- [Result-set size thresholds or other performance notes]
- [Feature gaps]

## Troubleshooting

### [Common error message]

[Cause and resolution.]

### [Another common error]

[Cause and resolution.]
```

## レビュー \{#review\}

ClickHouse 連携チームは、PR について、技術的な正確性、Cloud とセルフホストの両方をカバーしていること、そしてドキュメントのスタイルを確認します。レビュー担当者の承認が得られるまで、PR 上で修正を重ねてください。その承認がマージの条件です。