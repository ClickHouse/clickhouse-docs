---
description: 'このエンジンは、Amazon S3 に既に存在する Apache Hudi テーブルとの読み取り専用の統合を提供します。'
sidebar_label: 'Hudi'
sidebar_position: 86
slug: /engines/table-engines/integrations/hudi
title: 'Hudi テーブルエンジン'
doc_type: 'reference'
---

# Hudi テーブルエンジン \{#hudi-table-engine\}

このエンジンは、Amazon S3 上の既存の Apache [Hudi](https://hudi.apache.org/) テーブルと読み取り専用で統合する機能を提供します。

## テーブルを作成 \{#create-table\}

Hudi テーブルはあらかじめ S3 上に存在している必要がある点に注意してください。このコマンドでは、新しいテーブルを作成するための DDL パラメータを指定することはできません。

```sql
CREATE TABLE hudi_table
    ENGINE = Hudi(url, [aws_access_key_id, aws_secret_access_key,])
```

**エンジンパラメータ**

* `url` — 既存の Hudi テーブルへのパスを含むバケットの URL。
* `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) アカウントユーザーの長期利用可能な認証情報。リクエストの認証に使用できます。パラメータは任意です。認証情報が指定されていない場合は、設定ファイルに記載されたものが使用されます。

エンジンパラメータは、[Named Collections](/operations/named-collections.md) を使用して指定できます。

**例**

```sql
CREATE TABLE hudi_table ENGINE=Hudi('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

名前付きコレクションの使用：

```xml
<clickhouse>
    <named_collections>
        <hudi_conf>
            <url>http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/</url>
            <access_key_id>ABC123<access_key_id>
            <secret_access_key>Abc+123</secret_access_key>
        </hudi_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE hudi_table ENGINE=Hudi(hudi_conf, filename = 'test_table')
```

## 関連項目 \{#see-also\}

- [hudi テーブル関数](/sql-reference/table-functions/hudi.md)
