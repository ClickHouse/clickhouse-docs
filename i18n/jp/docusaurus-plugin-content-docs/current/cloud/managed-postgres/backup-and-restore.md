---
slug: /cloud/managed-postgres/backup-and-restore
sidebar_label: 'バックアップとリストア'
title: 'バックアップとリストア'
description: 'ClickHouse Managed Postgres のバックアップ戦略とポイントインタイムリカバリについて説明します'
keywords: ['バックアップ', 'リストア', 'ポイントインタイムリカバリ', 'PITR', 'ディザスタリカバリ', 'Postgres バックアップ']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import backupAndRestore from '@site/static/images/managed-postgres/backup-and-restore.png';

<PrivatePreviewBadge />

Managed Postgres は、自動バックアップとポイントインタイム リカバリによって、データの安全性と可用性を確保します。インスタンスの **Backups** ビューから、バックアップ履歴の確認やリストアの開始ができます。

<Image img={backupAndRestore} alt="バックアップ履歴とポイントインタイム リカバリのオプションを表示している Backups ビュー" size="lg" border />


## バックアップ \{#backups\}

### バックアップ頻度 \{#backup-frequency\}

Managed Postgres は、データベースのフルバックアップを毎日取得します。フルバックアップに加えて、Write-Ahead Log (WAL) ファイルは 60 秒ごと、または WAL データが 16 MB 蓄積された時点のうち早いほうのタイミングでアーカイブされます。フルバックアップと継続的な WAL アーカイブを組み合わせることで、保持期間内であれば任意の時点へのポイントインタイム リカバリが可能になります。

### 保持期間 \{#retention-period\}

バックアップは 7 日間保持され、データ損失や破損が発生した場合の復旧には十分な期間です。より長いバックアップ保持期間が必要な場合は、[サポート](https://clickhouse.com/support/program)までお問い合わせください。

### ストレージと耐久性 \{#storage-and-durability\}

バックアップはイレイジャーコーディングを用いて複数のサーバー間で複製されるため、一部のストレージサーバーが利用不能になった場合でもアクセス可能な状態が維持されます。バックアップストレージはバケット単位で分離されており、各 Managed Postgres インスタンスは専用のストレージバケットを持ち、そのインスタンスのバックアップにのみアクセスできるように認証情報のスコープが制限されています。

## 時点復元 \{#point-in-time-recovery\}

時点復元を使用すると、バックアップ保持期間内の任意の時点にデータベースを復元できます。これは、誤ってデータを削除してしまった場合や、破損などの問題が発生し、既知の正常な状態にロールバックする必要がある場合に有用です。

時点復元を実行するには:

1. Managed Postgres インスタンスの **Backups** ビューに移動します。
2. **Point in time recovery** セクションで、復元先とする日時 (UTC) を選択します。
3. **Restore to point in time** をクリックします。

復元処理により、選択した時点におけるデータベースの状態を持つ新しい Managed Postgres インスタンスが作成されます。元のインスタンスは変更されずに残るため、どのインスタンスを残すか判断する前に、復元されたデータを検証できます。