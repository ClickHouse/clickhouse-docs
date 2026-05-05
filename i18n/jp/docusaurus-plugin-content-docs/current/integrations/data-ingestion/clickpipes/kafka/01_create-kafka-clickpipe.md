---
sidebar_label: 'はじめての Kafka ClickPipe の作成'
description: 'はじめての Kafka ClickPipe を作成するための手順ガイド。'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: 'はじめての Kafka ClickPipe の作成'
doc_type: 'guide'
keywords: ['kafka clickpipe の作成', 'kafka', 'ClickPipes', 'データソース', 'セットアップガイド']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import cp_table_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_table_settings.png';
import cp_ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/cp_ssh_tunnel.png';
import Image from '@theme/IdealImage';

# はじめての Kafka ClickPipe の作成 \{#creating-your-first-kafka-clickpipe\}

> このガイドでは、はじめての Kafka ClickPipe の作成手順を説明します。

Kafka ClickPipes は、ClickPipes UI を使用して手動でデプロイおよび管理できるほか、[OpenAPI](/integrations/clickpipes/programmatic-access/openapi) や [Terraform](/integrations/clickpipes/programmatic-access/terraform) を使用してプログラムからデプロイおよび管理することもできます。

<VerticalStepper type="numbered" headerLevel="h2">
  ## データソースに移動する \{#1-load-sql-console\}

  左側のメニューで `Data Sources` ボタンを選択し、&quot;Set up a ClickPipe&quot; をクリックします。

  <Image img={cp_step0} alt="インポートを選択" size="md" />

  ## データソースを選択する \{#2-select-data-source\}

  一覧から Kafka データソースを選択します。

  <Image img={cp_step1} alt="データソースの種類を選択" size="md" />

  ## データソースを設定する \{#3-configure-data-source\}

  ClickPipe の名前、説明 (任意) 、認証情報、その他の接続情報を入力します。

  <Image img={cp_step2} alt="接続情報を入力" size="md" />

  ## スキーマレジストリを設定する (任意) \{#4-configure-your-schema-registry\}

  Avro ストリームでは有効な スキーマ が必要です。スキーマレジストリの設定方法の詳細については、[スキーマレジストリ](./02_schema-registries.md) を参照してください。

  ## Reverse Private Endpoint を設定する (任意) \{#5-configure-reverse-private-endpoint\}

  Reverse Private Endpoint を設定すると、ClickPipes が AWS PrivateLink を使って Kafka クラスタに接続できるようになります。
  詳細については、[AWS PrivateLink documentation](../aws-privatelink.md) を参照してください。

  ## SSH トンネリングを設定する (任意) \{#6-configure-ssh-tunneling\}

  Kafka broker が公開されていない場合は、SSH トンネリングを使えます。ClickPipes は直接接続する代わりに bastion host (ネットワーク内にあり、外部からアクセス可能なサーバー) への SSH 接続を確立し、その経由でプライベートネットワーク上の Kafka broker にトラフィックを転送します。

  1. &quot;SSH Tunnel&quot; トグルを有効にします。
  2. SSH 接続の詳細を入力します。
     * **SSH Host**: bastion host のホスト名または IP アドレス。公開アクセス可能で、プライベートネットワークへのゲートウェイとして機能するサーバーです。
     * **SSH Port**: bastion host 上の SSH ポート (デフォルトは `22`) 。
     * **SSH User**: bastion host で認証に使用するユーザー名。

  <Image img={cp_ssh_tunnel} alt="SSH トンネルの設定" size="md" />

  3. 鍵ベース認証を使うには、&quot;Revoke and regenerate key pair&quot; をクリックして新しい鍵ペアを生成し、生成された公開鍵を SSH サーバーの `~/.ssh/authorized_keys` にコピーします。
  4. &quot;Verify Connection&quot; をクリックして接続を確認します。

  :::note
  ClickPipes が SSH トンネルを確立できるように、SSH bastion host のファイアウォールルールで [ClickPipes IP addresses](../index.md#list-of-static-ips) を必ず許可してください。
  :::

  ## topic を選択する \{#7-select-your-topic\}

  topic を選択すると、UI にその topic のサンプルドキュメントが表示されます。

  <Image img={cp_step3} alt="topic を設定" size="md" />

  ## 宛先テーブルを設定する \{#8-configure-your-destination-table\}

  次の手順では、新しい ClickHouse テーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、設定を変更してください。上部のサンプルテーブルで、変更内容をリアルタイムでプレビューできます。

  <Image img={cp_step4a} alt="テーブル、スキーマ、設定を指定" size="md" />

  用意されているコントロールを使って、詳細設定をカスタマイズすることもできます。

  <Image img={cp_table_settings} alt="詳細コントロールを設定" size="md" />

  ## 権限を設定する \{#9-configure-permissions\}

  ClickPipes は、宛先テーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーには、カスタムロールまたは事前定義されたロールのいずれかを選択できます。

  * `Full access`: クラスタに対するフルアクセス権限を付与します。宛先テーブルで materialized view や Dictionary を使う場合に役立つことがあります。
  * `Only destination table`: 宛先テーブルに対する `INSERT` 権限のみを付与します。

  <Image img={cp_step5} alt="権限" size="md" />

  ## セットアップを完了する \{#10-complete-setup\}

  &quot;Create ClickPipe&quot; をクリックすると、ClickPipe が作成されて実行されます。作成後は データソース セクションに表示されます。

  <Image img={cp_overview} alt="概要を表示" size="md" />
</VerticalStepper>