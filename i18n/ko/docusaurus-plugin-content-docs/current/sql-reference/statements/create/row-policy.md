---
'description': 'Row Policy에 대한 문서'
'sidebar_label': 'ROW POLICY'
'sidebar_position': 41
'slug': '/sql-reference/statements/create/row-policy'
'title': 'CREATE ROW POLICY'
'doc_type': 'reference'
---

Creates a [row policy](../../../guides/sre/user-management/index.md#row-policy-management), 즉 사용자가 테이블에서 읽을 수 있는 행을 결정하는 필터입니다.

:::tip
행 정책은 읽기 전용 액세스 권한이 있는 사용자에게만 의미가 있습니다. 사용자가 테이블을 수정하거나 테이블 간에 파티션을 복사할 수 있다면, 행 정책의 제한을 무의미하게 만듭니다.
:::

구문:

```sql
CREATE [ROW] POLICY [IF NOT EXISTS | OR REPLACE] policy_name1 [ON CLUSTER cluster_name1] ON [db1.]table1|db1.*
        [, policy_name2 [ON CLUSTER cluster_name2] ON [db2.]table2|db2.* ...]
    [IN access_storage_type]
    [FOR SELECT] USING condition
    [AS {PERMISSIVE | RESTRICTIVE}]
    [TO {role1 [, role2 ...] | ALL | ALL EXCEPT role1 [, role2 ...]}]
```

## USING 절 {#using-clause}

행을 필터링할 조건을 지정할 수 있습니다. 특정 조건이 행에 대해 0이 아닌 값으로 계산되면 사용자는 해당 행을 볼 수 있습니다.

## TO 절 {#to-clause}

`TO` 섹션에서 이 정책이 작동해야 하는 사용자 및 역할의 목록을 제공할 수 있습니다. 예를 들어, `CREATE ROW POLICY ... TO accountant, john@localhost`.

키워드 `ALL`은 현재 사용자를 포함한 모든 ClickHouse 사용자들을 의미합니다. 키워드 `ALL EXCEPT`는 모든 사용자 목록에서 일부 사용자를 제외할 수 있게 해줍니다. 예를 들어, `CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`

:::note
테이블에 대해 정의된 행 정책이 없으면 모든 사용자는 테이블에서 모든 행을 `SELECT` 할 수 있습니다. 테이블에 대해 하나 이상의 행 정책을 정의하면 해당 행 정책이 현재 사용자와 관계없이 테이블에 대한 액세스를 결정하게 됩니다. 예를 들어, 다음 정책:

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

는 사용자 `mira`와 `peter`가 `b != 1`인 행을 볼 수 없게 하며, 언급되지 않은 사용자인 `paul`은 `mydb.table1`에서 어떤 행도 볼 수 없습니다.

이것이 바람직하지 않다면, 다음과 같이 행 정책을 하나 더 추가하여 수정할 수 있습니다:

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::

## AS 절 {#as-clause}

동일 테이블에서 동일 사용자에 대해 한 번에 여러 정책을 활성화하는 것이 허용됩니다. 따라서 여러 정책에서 조건을 결합할 수 있는 방법이 필요합니다.

기본적으로 정책은 불리언 `OR` 연산자를 사용하여 결합됩니다. 예를 들어, 다음 정책들:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

는 사용자 `peter`가 `b=1` 또는 `c=2`인 행을 볼 수 있게 합니다.

`AS` 절은 정책이 다른 정책들과 어떻게 결합될지를 지정합니다. 정책은 허용적이거나 제한적일 수 있습니다. 기본적으로 정책은 허용적으로 설정되어 있으며, 이는 불리언 `OR` 연산자를 사용하여 결합된다는 것을 의미합니다.

정책은 제한적으로 정의할 수도 있습니다. 제한적 정책은 불리언 `AND` 연산자를 사용하여 결합됩니다.

일반적인 공식은 다음과 같습니다:

```text
row_is_visible = (one or more of the permissive policies' conditions are non-zero) AND
                 (all of the restrictive policies's conditions are non-zero)
```

예를 들어, 다음 정책들:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

은 사용자 `peter`가 `b=1` AND `c=2`인 경우에만 행을 볼 수 있게 합니다.

데이터베이스 정책은 테이블 정책과 결합됩니다.

예를 들어, 다음 정책들:

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

은 사용자 `peter`가 `b=1` AND `c=2`인 경우에만 table1의 행을 볼 수 있도록 하며, mydb의 다른 테이블에서는 사용자에게 `b=1` 정책만 적용됩니다.

## ON CLUSTER 절 {#on-cluster-clause}

클러스터에서 행 정책을 생성할 수 있습니다. [Distributed DDL](../../../sql-reference/distributed-ddl.md)를 참조하세요.

## 예제 {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
