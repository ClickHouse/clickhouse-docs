---
description: 'OS のページキャッシュに依存せず、プロセス内メモリ上にデータをキャッシュするユーザースペースのページキャッシュ機構。'
sidebar_label: 'ユーザースペースページキャッシュ'
sidebar_position: 65
slug: /operations/userspace-page-cache
title: 'ユーザースペースページキャッシュ'
doc_type: 'reference'
---



# ユーザー空間ページキャッシュ {#userspace-page-cache}



## 概要 {#overview}

> ユーザースペースページキャッシュは、新しいキャッシュ機構であり、OS のページキャッシュに依存するのではなく、プロセス内メモリ上にデータをキャッシュできるようにします。

ClickHouse にはすでに、Amazon S3、Google Cloud Storage (GCS)、Azure Blob Storage などのリモートオブジェクトストレージ上にキャッシュ層を設ける方法として、[Filesystem cache](/docs/operations/storing-data) が用意されています。ユーザースペースページキャッシュは、通常の OS キャッシュが十分に機能しない場合に、リモートデータへのアクセスを高速化することを目的として設計されています。

これは、ファイルシステムキャッシュと次の点で異なります。

| Filesystem Cache                                        | ユーザースペースページキャッシュ         |
|---------------------------------------------------------|---------------------------------------|
| データをローカルファイルシステムに書き込む              | メモリ上にのみ存在する                  |
| ディスク容量を消費する（tmpfs 上でも構成可能）         | ファイルシステムに依存しない            |
| サーバーの再起動をまたいで保持される                   | サーバー再起動後は保持されない          |
| サーバーのメモリ使用量としては表示されない             | サーバーのメモリ使用量として表示される  |
| ディスク上のデータおよびインメモリ（OS ページキャッシュ）の両方に適している | **ディスクレスサーバーに適している**   |



## 設定と使用方法 {#configuration-settings-and-usage}

### 利用方法 {#usage}

ユーザースペースページキャッシュを有効にするには、まずサーバー側で設定を行います。

```bash
cat config.d/page_cache.yaml
page_cache_max_size: 100G
```

:::note
ユーザー空間ページキャッシュは、指定された量までメモリを使用しますが、
このメモリが予約されるわけではありません。サーバーの他の用途で
必要になった場合には、メモリは追い出されます。
:::

次に、クエリレベルでの利用を有効にします。

```sql
SET use_page_cache_for_disks_without_file_cache=1;
```

### 設定 {#settings}

| Setting                                                 | Description                                                                                                                                                                                            | Default     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `use_page_cache_for_disks_without_file_cache`           | ファイルシステムキャッシュが有効になっていないリモートディスクに対して、ユーザー空間ページキャッシュを使用します。                                                                                                                                              | `0`         |
| `use_page_cache_with_distributed_cache`                 | 分散キャッシュが使用されている場合に、ユーザー空間ページキャッシュを使用します。                                                                                                                                                               | `0`         |
| `read_from_page_cache_if_exists_otherwise_bypass_cache` | パッシブモードでユーザー空間ページキャッシュを使用します。[`read_from_filesystem_cache_if_exists_otherwise_bypass_cache`](/docs/operations/settings/settings#read_from_filesystem_cache_if_exists_otherwise_bypass_cache) と同様の動作です。 | `0`         |
| `page_cache_inject_eviction`                            | ユーザー空間ページキャッシュが、ランダムにいくつかのページを無効化することがあります。テスト用途を想定しています。                                                                                                                                              | `0`         |
| `page_cache_block_size`                                 | ユーザー空間ページキャッシュ内に保存するファイルチャンクのサイズ（バイト単位）です。キャッシュ経由で行われるすべての読み取りは、このサイズの倍数に切り上げられます。                                                                                                                     | `1048576`   |
| `page_cache_history_window_ms`                          | 解放されたメモリがユーザー空間ページキャッシュで再利用可能になるまでの遅延時間です。                                                                                                                                                             | `1000`      |
| `page_cache_policy`                                     | ユーザー空間ページキャッシュのポリシー名です。                                                                                                                                                                                | `SLRU`      |
| `page_cache_size_ratio`                                 | ユーザー空間ページキャッシュにおける、保護キューのサイズがキャッシュ全体のサイズに対して占める比率です。                                                                                                                                                   | `0.5`       |
| `page_cache_min_size`                                   | ユーザー空間ページキャッシュの最小サイズです。                                                                                                                                                                                | `104857600` |
| `page_cache_max_size`                                   | ユーザー空間ページキャッシュの最大サイズです。0 に設定するとキャッシュを無効化します。`page_cache_min_size` より大きい場合、利用可能なメモリの大部分を使用しつつ、合計メモリ使用量が制限値（`max_server_memory_usage`[`_to_ram_ratio`]) を下回るよう、この範囲内でキャッシュサイズが継続的に調整されます。                | `0`         |
| `page_cache_free_memory_ratio`                          | ユーザー空間ページキャッシュで確保せずに残しておくメモリ制限値の割合です。Linux の `min_free_kbytes` 設定に相当します。                                                                                                                               | `0.15`      |
| `page_cache_lookahead_blocks`                           | ユーザー空間ページキャッシュでキャッシュミスが発生し、かつそれらがキャッシュ内に存在しない場合に、基盤ストレージから一度にまとめて読み取る連続ブロック数の上限です。各ブロックのサイズは `page_cache_block_size` バイトです。                                                                            | `16`        |
| `page_cache_shards`                                     | ミューテックス競合を減らすために、ユーザー空間ページキャッシュを指定した数のシャードにストライプ化します。実験的な機能であり、性能向上はあまり期待できません。                                                                                                                        | `4`         |


## 関連コンテンツ {#related-content}
- [ファイルシステムキャッシュ](/docs/operations/storing-data)
- [ClickHouse v25.3 リリースウェビナー](https://www.youtube.com/live/iCKEzp0_Z2Q?feature=shared&t=1320)
