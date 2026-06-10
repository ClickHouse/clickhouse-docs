---
slug: /cloud/managed-postgres/migrations/faq
sidebar_label: 'よくある質問'
title: 'Managed Postgres の移行に関するよくある質問'
description: 'ClickHouse Managed Postgres へのデータ移行に関するよくある質問。'
keywords: ['postgres', '移行', 'よくある質問', 'Managed Postgres', 'logical replication', 'enum', '一意制約']
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migrations-faq" />

# Managed Postgres 移行 よくある質問 \{#managed-postgres-migrations-faq\}

Postgresのレプリケーションの仕組みに関するよくある質問 (`TOAST` カラム、レプリケーションスロット、パブリケーション、スキーマ変更、データ型マッピングなど) は、[ClickPipes for Postgres よくある質問](/integrations/clickpipes/postgres/faq)で取り上げています。そこで説明している内容は、Managed Postgres の移行にも当てはまります。

### レプリケーション中に「enum の入力値が無効です」というエラーが表示される \{#invalid-enum-value\}

このエラーは、移行元の Postgres に存在する enum 値が、移行先の Managed Postgres には存在しない場合に発生します。論理レプリケーション では `ALTER TYPE ... ADD VALUE` コマンドは自動的に反映されないため、初回のスキーマ設定後に移行元で追加された新しい enum 値があると、移行先で insert が失敗します。

これを修正するには、移行先の Postgres で enum 型に不足している値を追加してください:

```sql
ALTER TYPE your_enum_type ADD VALUE 'new_value';
```

`your_enum_type` は使用している enum 型の名前に、`'new_value'` はエラーメッセージに表示されている不足している値に置き換えてください。

### レプリケーション中に一意制約違反エラーが発生する \{#unique-constraint-violation\}

一意制約違反は、論理レプリケーション中に、レプリケーションの順序によってターゲット側の既存の一意制約と競合が発生した場合に起こることがあります。これは、後続の更新で解消される前に一時的に一意性に違反する操作を再適用する CDC ワークロードで発生することがあります。

レプリケーションを再開できるようにするには、ターゲットの Postgres で一意制約を削除します:

```sql
ALTER TABLE your_table DROP CONSTRAINT your_constraint_name;
```

以下を実行すると、制約名を確認できます:

```sql
SELECT conname, conrelid::regclass
FROM pg_constraint
WHERE contype = 'u';
```

レプリケーションが完了し、移行元がアクティブでなくなったら、切り替え時に制約を追加し直します:

```sql
ALTER TABLE your_table ADD CONSTRAINT your_constraint_name UNIQUE (column1, column2);
```