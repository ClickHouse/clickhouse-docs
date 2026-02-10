---
sidebar_label: 'バックアップ'
slug: /cloud/features/backups
title: 'バックアップ'
keywords: ['バックアップ', 'クラウドバックアップ', 'リストア']
description: 'ClickHouse Cloud におけるバックアップ機能の概要を示します'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';

データベースのバックアップは、予期せぬ事態などでデータが失われた場合でも、最後に成功したバックアップ時点の状態にサービスを復元できるようにすることで、安全網として機能します。
これによりダウンタイムを最小限に抑え、ビジネスにとって重要なデータが永久に失われることを防ぎます。


## バックアップ \{#backups\}

### ClickHouse Cloud におけるバックアップの仕組み \{#how-backups-work-in-clickhouse-cloud\}

ClickHouse Cloud のバックアップは、「フル」バックアップと「増分」バックアップを組み合わせたバックアップチェーンで構成されます。チェーンはフルバックアップから始まり、その後の複数のスケジュールされたタイミングで増分バックアップが取得され、バックアップのシーケンスが作成されます。バックアップチェーンが一定の長さに達すると、新しいチェーンが開始されます。このバックアップチェーン全体を利用して、必要に応じてデータを新しいサービスに復元できます。特定のチェーンに含まれるすべてのバックアップが、そのサービスに設定された保持期間（保持については後述）を過ぎると、そのチェーンは破棄されます。

以下のスクリーンショットでは、実線の四角形がフルバックアップ、点線の四角形が増分バックアップを表しています。四角形を囲む実線の長方形は、保持期間およびエンドユーザーから参照できるバックアップ（リストアに利用できるバックアップ）を示しています。以下の例では、バックアップは 24 時間ごとに取得され、2 日間保持されます。

1 日目に、バックアップチェーンを開始するためのフルバックアップが取得されます。2 日目に増分バックアップが取得され、これでフルバックアップと増分バックアップの両方から復元できるようになります。7 日目までに、チェーン内には 1 つのフルバックアップと 6 つの増分バックアップが存在し、そのうち最新の 2 つの増分バックアップがユーザーに表示されます。8 日目には新しいフルバックアップが取得され、9 日目には新しいチェーン内に 2 つのバックアップが揃った時点で、以前のチェーンは破棄されます。

<Image img={backup_chain} size="lg" alt="ClickHouse Cloud におけるバックアップチェーンの例" />

### デフォルトのバックアップポリシー \{#default-backup-policy\}

Basic、Scale、Enterprise の各ティアでは、バックアップはストレージとは別に計測および課金されます。
すべてのサービスでは、デフォルトで 1 日 1 回のバックアップが設定されており、Scale ティア以上では Cloud コンソールの Settings タブから追加のバックアップを構成できます。
各バックアップは少なくとも 24 時間保持されます。

詳細については「[バックアップの確認とリストア](/cloud/manage/backups/overview)」を参照してください。

## 設定可能なバックアップ \{#configurable-backups\}

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True"/>

ClickHouse Cloud では、**Scale** および **Enterprise** ティアのサービスに対してバックアップのスケジュールを設定できます。バックアップは、ビジネス要件に応じて次の項目について設定できます。

- **保持期間 (Retention)**: 各バックアップを保持する日数です。保持期間は最短 1 日から最長 30 日まで指定でき、その間にも複数の選択肢があります。
- **頻度 (Frequency)**: 連続するバックアップ間の時間間隔を指定します。たとえば、「12 時間ごと」という頻度は、バックアップが 12 時間おきに実行されることを意味します。頻度は「6 時間ごと」から「48 時間ごと」まで、次の時間単位で指定できます: `6`, `8`, `12`, `16`, `20`, `24`, `36`, `48`。
- **開始時刻 (Start Time)**: 毎日バックアップを実行したい開始時刻です。開始時刻を指定すると、バックアップの「頻度 (Frequency)」はデフォルトで 24 時間ごと（1 日 1 回）になります。ClickHouse Cloud は、指定された開始時刻から 1 時間以内にバックアップを開始します。

:::note
カスタムスケジュールは、対象サービスに対する ClickHouse Cloud のデフォルトのバックアップポリシーを上書きします。

まれなケースとして、バックアップスケジューラが指定された **開始時刻 (Start Time)** に従わない場合があります。具体的には、現在スケジュールされているバックアップ時刻から 24 時間未満のタイミングで、すでにバックアップが正常に実行されている場合です。これは、バックアップに対して実装されているリトライメカニズムが原因で発生することがあります。このような場合、スケジューラは当日のバックアップをスキップし、翌日のスケジュールされた時刻に再度バックアップを実行します。
:::

バックアップの設定手順については、["バックアップスケジュールの構成"](/cloud/manage/backups/configurable-backups) を参照してください。

## Bring Your Own Bucket (BYOB) バックアップ \{#byob\}

<EnterprisePlanFeatureBadge/>

ClickHouse Cloud では、バックアップをお客様自身のクラウドサービスプロバイダー (CSP) アカウントストレージ (AWS S3、Google Cloud Storage、Azure Blob Storage) にエクスポートできます。
バックアップ先としてお客様自身のバケットを構成している場合でも、ClickHouse Cloud は引き続き ClickHouse Cloud 管理のバケットに対して日次バックアップを取得します。
これは、お客様のバケット内のバックアップが破損した場合に備えて、復元に使用できるデータのコピーを少なくとも 1 つ確保するためです。
ClickHouse Cloud のバックアップの仕組みの詳細については、[backups](/cloud/manage/backups/overview) ドキュメントを参照してください。

このガイドでは、AWS、GCP、Azure のオブジェクトストレージにバックアップをエクスポートする方法と、それらのバックアップをお客様のアカウントから新しい ClickHouse Cloud サービスへ復元する方法を順を追って説明します。
また、バックアップをお客様のバケットにエクスポートし、それらを復元するためのバックアップ／リストアコマンドも紹介します。

:::note リージョン間バックアップ
バックアップを同一クラウドプロバイダー内の別リージョンへエクスポートするいずれの利用形態でも、[データ転送](/cloud/manage/network-data-transfer)
料金が発生することに注意してください。

現在、クロスクラウド (クラウド間) バックアップや、[Transparent Data Encryption (TDE)](/cloud/security/cmek#transparent-data-encryption-tde) を利用しているサービス、あるいは規制対象サービス向けのバックアップ／リストアはサポートしていません。
:::

AWS、GCP、Azure のオブジェクトストレージに対してフルバックアップおよび増分バックアップを取得する方法と、それらのバックアップから復元する方法の例については、「[自分の Cloud アカウントにバックアップをエクスポートする](/cloud/manage/backups/export-backups-to-own-cloud-account)」を参照してください。

### バックアップオプション \{#backup-options\}

お客様自身のクラウドアカウントにバックアップをエクスポートするには、次の 2 つのオプションがあります。

<VerticalStepper headerLevel="h5">

##### Cloud Console の UI 経由 \{#via-ui\}

外部バックアップは [UI で設定](/cloud/manage/backups/backup-restore-via-ui) できます。
デフォルトでは、バックアップは [デフォルトのバックアップポリシー](/cloud/features/backups#default-backup-policy) で指定されているとおり、日次で取得されます。
ただし、お客様のクラウドアカウントに対して[設定可能な](/cloud/manage/backups/configurable-backups)バックアップもサポートしており、カスタムスケジュールを設定できます。
お客様のバケットに対するすべてのバックアップは、過去および将来のほかのバックアップとの関連を持たないフルバックアップである点に注意することが重要です。

##### SQL コマンドの使用 \{#using-commands\}

[SQL コマンド](/cloud/manage/backups/backup-restore-via-commands) を使用して、バックアップをお客様のバケットにエクスポートできます。

</VerticalStepper>

:::warning
ClickHouse Cloud は、お客様のバケット内のバックアップのライフサイクルを管理しません。
お客様は、自身のバケット内のバックアップについて、コンプライアンス基準を満たし、かつコストを適切に管理できるようにバックアップを管理する責任を負います。
バックアップが破損している場合、それらを復元することはできません。
:::