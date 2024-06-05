---
title: Installing chDB for Python
sidebar_label: Python
slug: /en/chdb/install/python
description: How to install chDB for Python
keywords: [chdb, embedded, clickhouse-lite, python, install]
---

# Installing chDB for Python

## Requirements

Python 3.8+ on macOS and Linux (x86_64 and ARM64)

## Install

```bash
pip install chdb
```

## Usage

CLI example:

```python
python3 -m chdb [SQL] [OutputFormat]
```

```python
python3 -m chdb "SELECT 1, 'abc'" Pretty
```

Python file example:

```python
import chdb

res = chdb.query("SELECT 1, 'abc'", "CSV")
print(res, end="")
```

<!-- <codapi-snippet sandbox="python" editor="basic" init-delay="500">
</codapi-snippet> -->

<!-- <br /><br /> -->

Queries can return data using any [supported format](/docs/en/interfaces/formats) as well as `Dataframe` and `Debug`.
