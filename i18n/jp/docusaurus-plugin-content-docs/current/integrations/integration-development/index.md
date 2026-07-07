---
slug: /integrations/integration-development
title: 'インテグレーション開発'
sidebar_label: '概要'
sidebar_position: 1
description: 'ClickHouse インテグレーションを構築、テストし、ドキュメント化するためのガイドです。'
keywords: ['インテグレーション開発', 'インテグレーションの構築', 'パートナー', 'インテグレーションパートナー']
doc_type: 'landing-page'
---

# インテグレーション開発 \{#integration-development\}

これらのガイドは、ClickHouse に接続する製品を開発する際の参考情報です。連携に関わる機能範囲、コネクタの検証方法、このサイトでドキュメントを公開する方法を説明します。

:::note[パートナーポータル]
インテグレーションの登録とパートナー向けリソースへのアクセスには、[パートナーポータル](https://clickhouse.com/partners) を使用してください。以下のガイドでは、コネクタの構築、テスト、ドキュメント化の方法を説明します。
:::

## ガイド \{#guides\}

次の順でお読みください。

| ガイド                                                                                     | 内容                                         |
| --------------------------------------------------------------------------------------- | ------------------------------------------ |
| [インテグレーションの構築](/integrations/integration-development/building-integrations)             | インジェストと利用の経路、ワイヤプロトコル、クライアント、ユーザーエージェントの規約 |
| [インテグレーションのテスト](/integrations/integration-development/testing-your-integration)         | デプロイメントのモード、データセット、型のカバー範囲、レビュー前に報告すべき内容   |
| [インテグレーションのドキュメント化](/integrations/integration-development/documenting-your-integration) | 必須のドキュメントセクション、スタイルルール、製品ページ用のプルリクエストひな型   |

プロトタイプの作成とテストが完了したら、[`/docs/integrations/<category>/<your-integration>/`](/integrations/integration-development/documenting-your-integration) 配下にインテグレーションのページを追加し、[`clickhouse-docs`](https://github.com/ClickHouse/clickhouse-docs) に対してプルリクエストを作成してください。