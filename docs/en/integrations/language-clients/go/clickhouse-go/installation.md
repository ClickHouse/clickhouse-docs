---
sidebar_label: Installation
sidebar_position: 2
keywords: [clickhouse, go, client, high-level, installation, versioning]
slug: /en/integrations/go/clickhouse-go/installation
description: Installing the high level client
---

# Installation

v1 of the driver is deprecated and will not reach feature updates or support for new ClickHouse types. Users should migrate to v2, which offers superior performance.

To install the 2.x version of the client, add the package to your go.mod file:

`require github.com/ClickHouse/clickhouse-go/v2 main`

Or, clone the repository:

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

To install another version, modify the path or the branch name accordingly. 

```bash
mkdir my-clickhouse-app && cd my-clickhouse-app

cat > go.mod <<-END
  module my-clickhouse-app
 
  go 1.18
  
  require github.com/ClickHouse/clickhouse-go/v2 main
END

cat > main.go <<-END
  package main

  import (
    "fmt"
    "github.com/ClickHouse/clickhouse-go/v2"
  )

  func main() {
   conn, _ := clickhouse.Open(&clickhouse.Options{Addr: []string{"127.0.0.1:9000"}})
    v, _ := conn.ServerVersion()
    fmt.Println(v.String())
  }
END

go mod tidy
go run main.go

```

## Versioning & compatibility

The client is released independently of ClickHouse. 2.x represents the current major under development. All versions of 2.x should be compatibile with each other.

### ClickHouse compatibility

The client supports:

- All currently supported versions of ClickHouse as recorded [here](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md). As ClickHouse versions are no longer supported they are also no longer actively tested against client releases.
- All versions of ClickHouse 2 years from the release date of the client. Note only LTS versions are actively tested.

### Golang compatibility

| Client Version | Golang Versions |
|:--------------:|:---------------:|
|  => 2.0 <= 2.2 |    1.17, 1.18   |
|     >= 2.3     |       1.18      |
