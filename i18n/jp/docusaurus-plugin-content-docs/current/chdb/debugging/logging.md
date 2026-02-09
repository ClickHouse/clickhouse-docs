---
title: 'DataStore のログ記録'
sidebar_label: 'ログ記録'
slug: /chdb/debugging/logging
description: 'デバッグと監視のために DataStore のログ記録を設定する'
keywords: ['chdb', 'datastore', 'logging', 'debug', 'log', 'level']
doc_type: 'reference'
---

# DataStore ロギング \{#datastore-logging\}

DataStore は Python 標準ライブラリの logging モジュールを使用します。本ガイドでは、デバッグ目的でのロギング設定方法について説明します。

## クイックスタート \{#quick-start\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config

# Enable debug logging
config.enable_debug()

# Now all operations will log details
ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25).to_df()
```


## ログレベル \{#levels\}

| レベル | 値 | 説明 |
|-------|-------|-------------|
| `DEBUG` | 10 | デバッグのための詳細情報 |
| `INFO` | 20 | 一般的な運用状況に関する情報 |
| `WARNING` | 30 | 警告メッセージ（デフォルト） |
| `ERROR` | 40 | エラーメッセージ |
| `CRITICAL` | 50 | 致命的な障害 |

## ログレベルの設定 \{#setting-level\}

```python
import logging
from chdb.datastore.config import config

# Using standard logging levels
config.set_log_level(logging.DEBUG)
config.set_log_level(logging.INFO)
config.set_log_level(logging.WARNING)  # Default
config.set_log_level(logging.ERROR)

# Using quick preset
config.enable_debug()  # Sets DEBUG level + verbose format
```


## ログフォーマット \{#format\}

### 簡易形式（デフォルト） \{#simple\}

```python
config.set_log_format("simple")
```

出力結果:

```text
DEBUG - Executing SQL query
DEBUG - Cache miss for key abc123
```


### 詳細フォーマット \{#verbose\}

```python
config.set_log_format("verbose")
```

出力:

```text
2024-01-15 10:30:45.123 DEBUG datastore.core - Executing SQL query
2024-01-15 10:30:45.456 DEBUG datastore.cache - Cache miss for key abc123
```

***


## ログ対象 \{#what-logged\}

### DEBUG レベル \{#debug-logged\}

* 生成された SQL クエリ
* 実行エンジンの選択状況
* キャッシュ操作（ヒット/ミス）
* 各処理のタイミング
* データソース情報

```text
DEBUG - Creating DataStore from file 'data.csv'
DEBUG - SQL: SELECT * FROM file('data.csv', 'CSVWithNames') WHERE age > 25
DEBUG - Using engine: chdb
DEBUG - Execution time: 0.089s
DEBUG - Cache: Storing result (key: abc123)
```


### INFO レベル \{#info-logged\}

* 主要な処理の完了
* 設定の変更
* データソースへの接続

```text
INFO - Loaded 1,000,000 rows from data.csv
INFO - Execution engine set to: chdb
INFO - Connected to MySQL: localhost:3306/mydb
```


### WARNING レベル \{#warning-logged\}

* 非推奨機能の利用
* パフォーマンスに関する警告
* 重大度が低い問題

```text
WARNING - Large result set (>1M rows) may cause memory issues
WARNING - Cache TTL exceeded, re-executing query
WARNING - Column 'date' has mixed types, using string
```


### ERROR レベル \{#error-logged\}

* クエリ実行エラー
* 接続エラー
* データ変換エラー

```text
ERROR - Failed to execute SQL: syntax error near 'FORM'
ERROR - Connection to MySQL failed: timeout
ERROR - Cannot convert column 'price' to float
```

***


## カスタムログ設定 \{#custom\}

### Python の logging を使用する \{#python-logging\}

```python
import logging

# Configure root logger
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('datastore.log'),
        logging.StreamHandler()
    ]
)

# Get DataStore logger
ds_logger = logging.getLogger('chdb.datastore')
ds_logger.setLevel(logging.DEBUG)
```


### ファイルへのログ出力 \{#log-file\}

```python
import logging

# Create file handler
file_handler = logging.FileHandler('datastore_debug.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))

# Add to DataStore logger
ds_logger = logging.getLogger('chdb.datastore')
ds_logger.addHandler(file_handler)
```


### ログ出力の抑制 \{#suppress\}

```python
import logging

# Suppress all DataStore logs
logging.getLogger('chdb.datastore').setLevel(logging.CRITICAL)

# Or using config
config.set_log_level(logging.CRITICAL)
```

***


## デバッグシナリオ \{#scenarios\}

### SQL 生成のデバッグ \{#debug-sql\}

```python
config.enable_debug()

ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25).groupby('city').sum()
```

ログ出力：

```text
DEBUG - Creating DataStore from file 'data.csv'
DEBUG - Building filter: age > 25
DEBUG - Building groupby: city
DEBUG - Building aggregation: sum
DEBUG - Generated SQL:
        SELECT city, SUM(*) 
        FROM file('data.csv', 'CSVWithNames')
        WHERE age > 25
        GROUP BY city
```


### エンジン選択のデバッグ \{#debug-engine\}

```python
config.enable_debug()

result = ds.filter(ds['x'] > 10).apply(custom_func)
```

ログ出力：

```text
DEBUG - filter: selecting engine (eligible: chdb, pandas)
DEBUG - filter: using chdb (SQL-compatible)
DEBUG - apply: selecting engine (eligible: pandas)
DEBUG - apply: using pandas (custom function)
```


### キャッシュ操作のデバッグ \{#debug-cache\}

```python
config.enable_debug()

# First execution
result1 = ds.filter(ds['age'] > 25).to_df()
# DEBUG - Cache miss for query hash abc123
# DEBUG - Executing query...
# DEBUG - Caching result (key: abc123, size: 1.2MB)

# Second execution (same query)
result2 = ds.filter(ds['age'] > 25).to_df()
# DEBUG - Cache hit for query hash abc123
# DEBUG - Returning cached result
```


### パフォーマンス問題のデバッグ \{#debug-performance\}

```python
config.enable_debug()
config.enable_profiling()

# Logs will show timing for each operation
result = (ds
    .filter(ds['amount'] > 100)
    .groupby('region')
    .agg({'amount': 'sum'})
    .to_df()
)
```

ログ出力:

```text
DEBUG - filter: 0.002ms
DEBUG - groupby: 0.001ms
DEBUG - agg: 0.003ms
DEBUG - SQL generation: 0.012ms
DEBUG - SQL execution: 89.456ms  <- Main time spent here
DEBUG - Result conversion: 2.345ms
```

***


## 本番環境構成 \{#production\}

### 推奨設定 \{#recommended\}

```python
import logging
from chdb.datastore.config import config

# Production: minimal logging
config.set_log_level(logging.WARNING)
config.set_log_format("simple")
config.set_profiling_enabled(False)
```


### ログローテーション \{#rotation\}

```python
import logging
from logging.handlers import RotatingFileHandler

# Create rotating file handler
handler = RotatingFileHandler(
    'datastore.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5
)
handler.setLevel(logging.WARNING)

# Add to DataStore logger
logging.getLogger('chdb.datastore').addHandler(handler)
```

***


## 環境変数 \{#env-vars\}

環境変数を使用してログ出力を設定することもできます。

```bash
# Set log level
export CHDB_LOG_LEVEL=DEBUG

# Set log format
export CHDB_LOG_FORMAT=verbose
```

```python
import os
import logging

# Read from environment
log_level = os.environ.get('CHDB_LOG_LEVEL', 'WARNING')
config.set_log_level(getattr(logging, log_level))
```

***


## 概要 \{#summary\}

| タスク | コマンド |
|------|---------|
| デバッグを有効化 | `config.enable_debug()` |
| ログレベルを設定 | `config.set_log_level(logging.DEBUG)` |
| ログ形式を設定 | `config.set_log_format("verbose")` |
| ファイルにログ出力 | Python の logging ハンドラーを使用する |
| ログを抑制 | `config.set_log_level(logging.CRITICAL)` |