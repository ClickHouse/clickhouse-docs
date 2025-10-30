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