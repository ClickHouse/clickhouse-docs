---
sidebar_label: 'Fortran'
keywords: ['Fortran', 'driver', 'language client']
slug: /integrations/language-client/fortran
description: 'The official Fortran client for connecting to ClickHouse.'
title: 'ClickHouse Fortran driver'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/fortran'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ClickHouse Fortran driver

Key Features:

- Native TCP protocol support for optimal performance
- Column-oriented data transfer compatible with Fortran arrays
- Support for modern Fortran standards (Fortran 90/95/2003/2008)
- Efficient handling of [numerical data types](/sql-reference/data-types/int-int) commonly used in scientific computing
- TLS/SSL connection support
- Parameterized query execution
- Batch insert operations optimized for large datasets

## Installation

```bash
fpm install clickhouse-fortran
```

## Fortran-facts

<Tabs>

  <TabItem value="Fact 1" label="Fact 1" default>
From its creation in 1954 and its commercial release in 1957 as the progenitor of software, Fortran (short for formula translation) became the first computer language standard.
<br/>
  </TabItem>

  <TabItem value="Fact 2" label="Fact 2" default>
Originally developed for performing high computation mathematical calculations, NASA is currently deploying Fortran in climate model, aerodynamics applications and orbital mechanism projects.
<br/>
  </TabItem>

</Tabs>

<details>
<summary>Did you know?</summary>

People use Fortran for many important tasks.
These include predicting the weather, designing airplanes, and understanding how liquids flow.
It's also used in computational physics and chemistry.
Fortran is a top choice for high-performance computing.
This means it runs programs on the world's fastest supercomputers.
</details>

## Usage

<VerticalStepper headerLevel="h3">

### Ordinary codeblock

Create a connection using a connection string with the imaginary code below:

```fortran
use clickhouse_driver
type(ClickHouseClient) :: client
call client%connect('localhost', 9000)
call client%execute('SELECT * FROM measurements')
```

### Codeblock from a file in docs repo

Here is some basic connect and query code from a file in this repository:

```fortran file=code_snippets/integrations/language_clients/example.f90
program clickhouse_example
    use clickhouse_driver
    implicit none

    type(ClickHouseClient) :: client
    type(QueryResult) :: result
    integer :: status, i

    ! Initialize and connect to ClickHouse
    call client%init('localhost', port=9000, database='default', &
                     user='default', password='')

    status = client%connect()
    if (status /= CH_SUCCESS) then
        print *, 'Connection failed!'
        stop
    end if

    print *, 'Connected to ClickHouse successfully'

    ! Execute a simple query
    call client%execute('SELECT version()', result)
    call result%print()

    ! Cleanup
    call result%free()
    call client%disconnect()

end program clickhouse_example
```

### Code block from an external URL

Here is some code from a file in GitHub:

```fortran url=https://raw.githubusercontent.com/scivision/fortran2018-examples/refs/heads/main/src/system/play_sound.f90
program play_sound
!! recommend using all lower case filenames and no spaces.
!! plays sound in Fortran 2003+

implicit none

! configure ffplay -- could make if/else to allow other players
character(*),parameter :: playexe='ffplay'
! -autoexit clips off the end of the sound slightly, but otherwise thread hangs open even after Fortran program ends.
character(*),parameter :: cmdopts='-autoexit -loglevel warning -nodisp'

character(:), allocatable :: pcmd, buf
logical :: fexist
integer :: ierr, istat, L

valgrind : block

call get_command_argument(1, length=L, status=ierr)
if (ierr /= 0) error stop "please specify sound file"
allocate(character(L) :: buf)
call get_command_argument(1, value=buf)

inquire(file=buf, exist=fexist)

if (.not. fexist) error stop 'did not find FILE ' // buf

pcmd = playexe//' '//cmdopts//' '//trim(buf)

call execute_command_line(pcmd, cmdstat=ierr, exitstat=istat)
if(ierr /= 0) error stop 'could not open player'
if(istat /= 0) error stop 'problem playing file'

end block valgrind

end program

```

</VerticalStepper>