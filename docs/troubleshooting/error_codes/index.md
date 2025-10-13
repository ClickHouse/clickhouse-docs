---
slug: /troubleshooting/error_codes
sidebar_label: 'List of error codes'
doc_type: 'reference'
keywords: ['error codes']
title: 'List of error codes'
description: 'A list of error codes with descriptions'
---

| code   | name                                                  | Description                                                            |
|--------|-------------------------------------------------------|------------------------------------------------------------------------|
| 0      | OK                                                    | Operation completed successfully                                       |
| 1      | UNSUPPORTED_METHOD                                    | The requested method or operation is not supported                     |
| 2      | UNSUPPORTED_PARAMETER                                 | A parameter provided is not supported                                  |
| 3      | UNEXPECTED_END_OF_FILE                                | File ended earlier than expected during reading                        |
| 4      | EXPECTED_END_OF_FILE                                  | Expected file to end but found additional data                         |
| 6      | CANNOT_PARSE_TEXT                                     | Failed to parse text data correctly                                    |
| 7      | INCORRECT_NUMBER_OF_COLUMNS                           | Column count does not match expected value                             |
| 8      | THERE_IS_NO_COLUMN                                    | Referenced column does not exist                                       |
| 9      | SIZES_OF_COLUMNS_DOESNT_MATCH                         | Column sizes are inconsistent                                          |
| 10     | NOT_FOUND_COLUMN_IN_BLOCK                             | Column was not found in the data block                                 |
| 11     | POSITION_OUT_OF_BOUND                                 | Attempted to access position beyond valid range                        |
| 12     | PARAMETER_OUT_OF_BOUND                                | Parameter value is outside acceptable bounds                           |
| 13     | SIZES_OF_COLUMNS_IN_TUPLE_DOESNT_MATCH                | Tuple column sizes are inconsistent                                    |
| 15     | DUPLICATE_COLUMN                                      | Column name appears more than once in the query or table definition    |
| 16     | NO_SUCH_COLUMN_IN_TABLE                               | Specified column does not exist in the table                           |
| 19     | SIZE_OF_FIXED_STRING_DOESNT_MATCH                     | Fixed string size does not match expected length                       |
| 20     | NUMBER_OF_COLUMNS_DOESNT_MATCH                        | Column count mismatch in operation                                     |
| 23     | CANNOT_READ_FROM_ISTREAM                              | Failed to read data from input stream                                  |
| 24     | CANNOT_WRITE_TO_OSTREAM                               | Failed to write data to output stream                                  |
| 25     | CANNOT_PARSE_ESCAPE_SEQUENCE                          | Unable to parse escape sequence in string                              |
| 26     | CANNOT_PARSE_QUOTED_STRING                            | Failed to parse quoted string value                                    |
| 27     | CANNOT_PARSE_INPUT_ASSERTION_FAILED                   | Input parsing assertion check failed                                   |
| 28     | CANNOT_PRINT_FLOAT_OR_DOUBLE_NUMBER                   | Unable to format floating point number                                 |
| 32     | ATTEMPT_TO_READ_AFTER_EOF                             | Tried to read beyond end of file                                       |
| 33     | CANNOT_READ_ALL_DATA                                  | Unable to read complete data set during import, processing or transfer |
| 34     | TOO_MANY_ARGUMENTS_FOR_FUNCTION                       | Function received more arguments than expected                         |
| 35     | TOO_FEW_ARGUMENTS_FOR_FUNCTION                        | Function received fewer arguments than required                        |
| 36     | BAD_ARGUMENTS                                         | Function arguments are invalid or incorrect                            |
| 37     | UNKNOWN_ELEMENT_IN_AST                                | Unrecognized element in abstract syntax tree                           |
| 38     | CANNOT_PARSE_DATE                                     | Date string format is invalid or unrecognized                          |
| 39     | TOO_LARGE_SIZE_COMPRESSED                             | Compressed data size exceeds limits                                    |
| 40     | CHECKSUM_DOESNT_MATCH                                 | Data checksum verification failed                                      |
| 41     | CANNOT_PARSE_DATETIME                                 | DateTime string format is invalid or unrecognized                      |
| 42     | NUMBER_OF_ARGUMENTS_DOESNT_MATCH                      | Incorrect argument count for function                                  |
| 43     | ILLEGAL_TYPE_OF_ARGUMENT                              | Argument type is not valid for this function                           |
| 44     | ILLEGAL_COLUMN                                        | Column usage is not permitted in this context                          |
| 46     | UNKNOWN_FUNCTION                                      | Function name is not recognized                                        |
| 47     | UNKNOWN_IDENTIFIER                                    | Table or column identifier is undefined                                |
| 48     | NOT_IMPLEMENTED                                       | Feature or operation is not yet implemented                            |
| 49     | LOGICAL_ERROR                                         | Internal logic error detected                                          |
| 50     | UNKNOWN_TYPE                                          | Data type is not recognized                                            |
| 51     | EMPTY_LIST_OF_COLUMNS_QUERIED                         | Query contains no columns to select                                    |
| 52     | COLUMN_QUERIED_MORE_THAN_ONCE                         | Column appears multiple times in query                                 |
| 53     | TYPE_MISMATCH                                         | Data types are incompatible for this operation                         |
| 55     | STORAGE_REQUIRES_PARAMETER                            | Storage engine requires additional parameters                          |
| 56     | UNKNOWN_STORAGE                                       | Storage engine is not recognized                                       |
| 57     | TABLE_ALREADY_EXISTS                                  | A table with this name already exists                                  |
| 58     | TABLE_METADATA_ALREADY_EXISTS                         | Table metadata file already exists                                     |
| 59     | ILLEGAL_TYPE_OF_COLUMN_FOR_FILTER                     | Column type cannot be used in filter expressions                       |
| 60     | UNKNOWN_TABLE                                         | Table name is not recognized                                           |
| 62     | SYNTAX_ERROR                                          | SQL statement contains syntax errors                                   |
| 63     | UNKNOWN_AGGREGATE_FUNCTION                            | Aggregate function name is not recognized                              |
| 68     | CANNOT_GET_SIZE_OF_FIELD                              | Unable to determine field size                                         |
| 69     | ARGUMENT_OUT_OF_BOUND                                 | Argument value is outside valid range                                  |
| 70     | CANNOT_CONVERT_TYPE                                   | Type conversion is not possible                                        |
| 71     | CANNOT_WRITE_AFTER_END_OF_BUFFER                      | Attempted write beyond buffer end                                      |
| 72     | CANNOT_PARSE_NUMBER                                   | Number format is invalid or unrecognized                               |
| 73     | UNKNOWN_FORMAT                                        | Data format is not recognized                                          |
| 74     | CANNOT_READ_FROM_FILE_DESCRIPTOR                      | Failed to read from file descriptor                                    |
| 75     | CANNOT_WRITE_TO_FILE_DESCRIPTOR                       | Failed to write to file descriptor                                     |
| 76     | CANNOT_OPEN_FILE                                      | Unable to open specified file                                          |
| 77     | CANNOT_CLOSE_FILE                                     | Unable to close file properly                                          |
| 78     | UNKNOWN_TYPE_OF_QUERY                                 | Query type is not recognized                                           |
| 79     | INCORRECT_FILE_NAME                                   | File name format is invalid                                            |
| 80     | INCORRECT_QUERY                                       | Query structure or content is invalid                                  |
| 81     | UNKNOWN_DATABASE                                      | Database name is not recognized                                        |
| 82     | DATABASE_ALREADY_EXISTS                               | A database with this name already exists                               |
| 83     | DIRECTORY_DOESNT_EXIST                                | Specified directory does not exist                                     |
| 84     | DIRECTORY_ALREADY_EXISTS                              | Directory with this name already exists                                |
| 85     | FORMAT_IS_NOT_SUITABLE_FOR_INPUT                      | Data format cannot be used for input                                   |
| 86     | RECEIVED_ERROR_FROM_REMOTE_IO_SERVER                  | Remote I/O server returned an error                                    |
| 87     | CANNOT_SEEK_THROUGH_FILE                              | File seek operation failed                                             |
| 88     | CANNOT_TRUNCATE_FILE                                  | Unable to truncate file                                                |
| 89     | UNKNOWN_COMPRESSION_METHOD                            | Compression method is not recognized                                   |
| 90     | EMPTY_LIST_OF_COLUMNS_PASSED                          | No columns were provided                                               |
| 91     | SIZES_OF_MARKS_FILES_ARE_INCONSISTENT                 | Mark file sizes do not match                                           |
| 92     | EMPTY_DATA_PASSED                                     | No data was provided                                                   |
| 93     | UNKNOWN_AGGREGATED_DATA_VARIANT                       | Aggregated data variant is not recognized                              |
| 94     | CANNOT_MERGE_DIFFERENT_AGGREGATED_DATA_VARIANTS       | Cannot merge incompatible aggregated data variants                     |
| 95     | CANNOT_READ_FROM_SOCKET                               | Failed to read from network socket                                     |
| 96     | CANNOT_WRITE_TO_SOCKET                                | Failed to write to network socket                                      |
| 99     | UNKNOWN_PACKET_FROM_CLIENT                            | Received unrecognized packet from client                               |
| 100    | UNKNOWN_PACKET_FROM_SERVER                            | Received unrecognized packet from server                               |
| 101    | UNEXPECTED_PACKET_FROM_CLIENT                         | Received unexpected packet type from client                            |
| 102    | UNEXPECTED_PACKET_FROM_SERVER                         | Received unexpected packet type from server                            |
| 104    | TOO_SMALL_BUFFER_SIZE                                 | Buffer size is insufficient                                            |
| 107    | FILE_DOESNT_EXIST                                     | Specified file does not exist                                          |
| 108    | NO_DATA_TO_INSERT                                     | No data available to insert                                            |
| 109    | CANNOT_BLOCK_SIGNAL                                   | Unable to block system signal                                          |
| 110    | CANNOT_UNBLOCK_SIGNAL                                 | Unable to unblock system signal                                        |
| 111    | CANNOT_MANIPULATE_SIGSET                              | Signal set manipulation failed                                         |
| 112    | CANNOT_WAIT_FOR_SIGNAL                                | Signal wait operation failed                                           |
| 113    | THERE_IS_NO_SESSION                                   | Session does not exist                                                 |
| 114    | CANNOT_CLOCK_GETTIME                                  | Failed to get system time                                              |
| 115    | UNKNOWN_SETTING                                       | Setting name is not recognized                                         |
| 116    | THERE_IS_NO_DEFAULT_VALUE                             | No default value is defined                                            |
| 117    | INCORRECT_DATA                                        | Data format or content is incorrect                                    |
| 119    | ENGINE_REQUIRED                                       | Table engine must be specified                                         |
| 120    | CANNOT_INSERT_VALUE_OF_DIFFERENT_SIZE_INTO_TUPLE      | Tuple value size mismatch                                              |
| 121    | UNSUPPORTED_JOIN_KEYS                                 | JOIN key types are not supported                                       |
| 122    | INCOMPATIBLE_COLUMNS                                  | Columns are not compatible for this operation                          |
| 123    | UNKNOWN_TYPE_OF_AST_NODE                              | AST node type is not recognized                                        |
| 124    | INCORRECT_ELEMENT_OF_SET                              | Set element is invalid                                                 |
| 125    | INCORRECT_RESULT_OF_SCALAR_SUBQUERY                   | Scalar subquery returned invalid result                                |
| 127    | ILLEGAL_INDEX                                         | Index usage is not permitted                                           |
| 128    | TOO_LARGE_ARRAY_SIZE                                  | Array size exceeds maximum allowed                                     |
| 129    | FUNCTION_IS_SPECIAL                                   | Function requires special handling                                     |
| 130    | CANNOT_READ_ARRAY_FROM_TEXT                           | Failed to parse array from text                                        |
| 131    | TOO_LARGE_STRING_SIZE                                 | String size exceeds maximum allowed                                    |
| 133    | AGGREGATE_FUNCTION_DOESNT_ALLOW_PARAMETERS            | Aggregate function does not accept parameters                          |
| 134    | PARAMETERS_TO_AGGREGATE_FUNCTIONS_MUST_BE_LITERALS    | Aggregate function parameters must be literal values                   |
| 135    | ZERO_ARRAY_OR_TUPLE_INDEX                             | Array or tuple index cannot be zero                                    |
| 137    | UNKNOWN_ELEMENT_IN_CONFIG                             | Configuration contains unrecognized element                            |
| 138    | EXCESSIVE_ELEMENT_IN_CONFIG                           | Configuration contains unnecessary element                             |
| 139    | NO_ELEMENTS_IN_CONFIG                                 | Required configuration elements are missing                            |
| 141    | SAMPLING_NOT_SUPPORTED                                | Sampling is not supported for this table                               |
| 142    | NOT_FOUND_NODE                                        | Node was not found                                                     |
| 145    | UNKNOWN_OVERFLOW_MODE                                 | Overflow handling mode is not recognized                               |
| 152    | UNKNOWN_DIRECTION_OF_SORTING                          | Sort direction is not recognized                                       |
| 153    | ILLEGAL_DIVISION                                      | Division operation is not permitted                                    |
| 156    | DICTIONARIES_WAS_NOT_LOADED                           | Dictionaries failed to load                                            |
| 158    | TOO_MANY_ROWS                                         | Row count exceeds limit                                                |
| 159    | TIMEOUT_EXCEEDED                                      | Operation exceeded time limit                                          |
| 160    | TOO_SLOW                                              | Query execution is too slow                                            |
| 161    | TOO_MANY_COLUMNS                                      | Column count exceeds limit                                             |
| 162    | TOO_DEEP_SUBQUERIES                                   | Subquery nesting level too deep                                        |
| 164    | READONLY                                              | Database or table is in read-only mode                                 |
| 165    | TOO_MANY_TEMPORARY_COLUMNS                            | Temporary column count exceeds limit                                   |
| 166    | TOO_MANY_TEMPORARY_NON_CONST_COLUMNS                  | Too many temporary non-constant columns                                |
| 167    | TOO_DEEP_AST                                          | Abstract syntax tree is too deeply nested                              |
| 168    | TOO_BIG_AST                                           | Abstract syntax tree is too large                                      |
| 169    | BAD_TYPE_OF_FIELD                                     | Field type is invalid                                                  |
| 170    | BAD_GET                                               | Get operation failed                                                   |
| 172    | CANNOT_CREATE_DIRECTORY                               | Unable to create directory                                             |
| 173    | CANNOT_ALLOCATE_MEMORY                                | Memory allocation failed                                               |
| 174    | CYCLIC_ALIASES                                        | Alias definitions form a cycle                                         |
| 179    | MULTIPLE_EXPRESSIONS_FOR_ALIAS                        | Alias has conflicting definitions                                      |
| 180    | THERE_IS_NO_PROFILE                                   | Profile does not exist                                                 |
| 181    | ILLEGAL_FINAL                                         | FINAL keyword usage is not allowed                                     |
| 182    | ILLEGAL_PREWHERE                                      | PREWHERE clause is not permitted                                       |
| 183    | UNEXPECTED_EXPRESSION                                 | Expression was not expected in this context                            |
| 184    | ILLEGAL_AGGREGATION                                   | Aggregation is not permitted in this context                           |
| 186    | UNSUPPORTED_COLLATION_LOCALE                          | Collation locale is not supported                                      |
| 187    | COLLATION_COMPARISON_FAILED                           | String comparison with collation failed                                |
| 190    | SIZES_OF_ARRAYS_DONT_MATCH                            | Array sizes are inconsistent                                           |
| 191    | SET_SIZE_LIMIT_EXCEEDED                               | Set size exceeds configured limit                                      |
| 192    | UNKNOWN_USER                                          | User name is not recognized                                            |
| 193    | WRONG_PASSWORD                                        | Password is incorrect                                                  |
| 194    | REQUIRED_PASSWORD                                     | Password is required                                                   |
| 195    | IP_ADDRESS_NOT_ALLOWED                                | IP address is not permitted                                            |
| 196    | UNKNOWN_ADDRESS_PATTERN_TYPE                          | Address pattern type is not recognized                                 |
| 198    | DNS_ERROR                                             | DNS lookup failed                                                      |
| 199    | UNKNOWN_QUOTA                                         | Quota name is not recognized                                           |
| 201    | QUOTA_EXCEEDED                                        | Resource quota has been exceeded                                       |
| 202    | TOO_MANY_SIMULTANEOUS_QUERIES                         | Concurrent query limit exceeded                                        |
| 203    | NO_FREE_CONNECTION                                    | No available connections in pool                                       |
| 204    | CANNOT_FSYNC                                          | File sync operation failed                                             |
| 206    | ALIAS_REQUIRED                                        | Alias must be specified                                                |
| 207    | AMBIGUOUS_IDENTIFIER                                  | Identifier is ambiguous and needs qualification                        |
| 208    | EMPTY_NESTED_TABLE                                    | Nested table has no data                                               |
| 209    | SOCKET_TIMEOUT                                        | Network socket operation timed out                                     |
| 210    | NETWORK_ERROR                                         | Network communication error occurred                                   |
| 211    | EMPTY_QUERY                                           | Query string is empty                                                  |
| 212    | UNKNOWN_LOAD_BALANCING                                | Load balancing mode is not recognized                                  |
| 213    | UNKNOWN_TOTALS_MODE                                   | Totals mode is not recognized                                          |
| 214    | CANNOT_STATVFS                                        | File system statistics retrieval failed                                |
| 215    | NOT_AN_AGGREGATE                                      | Function is not an aggregate function                                  |
| 216    | QUERY_WITH_SAME_ID_IS_ALREADY_RUNNING                 | Query with this ID is currently executing                              |
| 217    | CLIENT_HAS_CONNECTED_TO_WRONG_PORT                    | Client connected to incorrect port                                     |
| 218    | TABLE_IS_DROPPED                                      | Table has been dropped                                                 |
| 219    | DATABASE_NOT_EMPTY                                    | Database contains tables and cannot be dropped                         |
| 220    | DUPLICATE_INTERSERVER_IO_ENDPOINT                     | Interserver I/O endpoint already exists                                |
| 221    | NO_SUCH_INTERSERVER_IO_ENDPOINT                       | Interserver I/O endpoint does not exist                                |
| 223    | UNEXPECTED_AST_STRUCTURE                              | Abstract syntax tree structure is unexpected                           |
| 224    | REPLICA_IS_ALREADY_ACTIVE                             | Replica is already in active state                                     |
| 225    | NO_ZOOKEEPER                                          | ZooKeeper connection is not available                                  |
| 226    | NO_FILE_IN_DATA_PART                                  | Expected file is missing from data part                                |
| 227    | UNEXPECTED_FILE_IN_DATA_PART                          | Unexpected file found in data part                                     |
| 228    | BAD_SIZE_OF_FILE_IN_DATA_PART                         | File size in data part is incorrect                                    |
| 229    | QUERY_IS_TOO_LARGE                                    | Query size exceeds maximum allowed                                     |
| 230    | NOT_FOUND_EXPECTED_DATA_PART                          | Expected data part was not found                                       |
| 231    | TOO_MANY_UNEXPECTED_DATA_PARTS                        | Found too many unexpected data parts                                   |
| 232    | NO_SUCH_DATA_PART                                     | Data part does not exist                                               |
| 233    | BAD_DATA_PART_NAME                                    | Data part name format is invalid                                       |
| 234    | NO_REPLICA_HAS_PART                                   | No replica contains the required part                                  |
| 235    | DUPLICATE_DATA_PART                                   | Data part already exists                                               |
| 236    | ABORTED                                               | Operation was aborted                                                  |
| 237    | NO_REPLICA_NAME_GIVEN                                 | Replica name was not provided                                          |
| 238    | FORMAT_VERSION_TOO_OLD                                | Data format version is too old                                         |
| 239    | CANNOT_MUNMAP                                         | Memory unmap operation failed                                          |
| 240    | CANNOT_MREMAP                                         | Memory remap operation failed                                          |
| 241    | MEMORY_LIMIT_EXCEEDED                                 | Memory usage limit exceeded                                            |
| 242    | TABLE_IS_READ_ONLY                                    | Table is in read-only mode                                             |
| 243    | NOT_ENOUGH_SPACE                                      | Insufficient disk space                                                |
| 244    | UNEXPECTED_ZOOKEEPER_ERROR                            | ZooKeeper returned unexpected error                                    |
| 246    | CORRUPTED_DATA                                        | Data is corrupted or invalid                                           |
| 248    | INVALID_PARTITION_VALUE                               | Partition value is invalid                                             |
| 251    | NO_SUCH_REPLICA                                       | Replica does not exist                                                 |
| 252    | TOO_MANY_PARTS                                        | Number of data parts exceeds limit                                     |
| 253    | REPLICA_ALREADY_EXISTS                                | Replica already exists                                                 |
| 254    | NO_ACTIVE_REPLICAS                                    | No active replicas available                                           |
| 255    | TOO_MANY_RETRIES_TO_FETCH_PARTS                       | Exceeded retry limit for fetching parts                                |
| 256    | PARTITION_ALREADY_EXISTS                              | Partition already exists                                               |
| 257    | PARTITION_DOESNT_EXIST                                | Partition does not exist                                               |
| 258    | UNION_ALL_RESULT_STRUCTURES_MISMATCH                  | UNION result structures are incompatible                               |
| 260    | CLIENT_OUTPUT_FORMAT_SPECIFIED                        | Output format already specified by client                              |
| 261    | UNKNOWN_BLOCK_INFO_FIELD                              | Block info field is not recognized                                     |
| 262    | BAD_COLLATION                                         | Collation is invalid or unsupported                                    |
| 263    | CANNOT_COMPILE_CODE                                   | Code compilation failed                                                |
| 264    | INCOMPATIBLE_TYPE_OF_JOIN                             | JOIN types are incompatible                                            |
| 265    | NO_AVAILABLE_REPLICA                                  | No replica is available                                                |
| 266    | MISMATCH_REPLICAS_DATA_SOURCES                        | Replica data sources do not match                                      |
| 269    | INFINITE_LOOP                                         | Infinite loop detected                                                 |
| 270    | CANNOT_COMPRESS                                       | Data compression failed                                                |
| 271    | CANNOT_DECOMPRESS                                     | Data decompression failed                                              |
| 272    | CANNOT_IO_SUBMIT                                      | Asynchronous I/O submission failed                                     |
| 273    | CANNOT_IO_GETEVENTS                                   | Failed to get I/O events                                               |
| 274    | AIO_READ_ERROR                                        | Asynchronous read operation failed                                     |
| 275    | AIO_WRITE_ERROR                                       | Asynchronous write operation failed                                    |
| 277    | INDEX_NOT_USED                                        | Index was not used in query execution                                  |
| 279    | ALL_CONNECTION_TRIES_FAILED                           | All connection attempts failed                                         |
| 280    | NO_AVAILABLE_DATA                                     | No data is available                                                   |
| 281    | DICTIONARY_IS_EMPTY                                   | Dictionary contains no data                                            |
| 282    | INCORRECT_INDEX                                       | Index is invalid or incorrect                                          |
| 283    | UNKNOWN_DISTRIBUTED_PRODUCT_MODE                      | Distributed product mode is not recognized                             |
| 284    | WRONG_GLOBAL_SUBQUERY                                 | Global subquery is invalid                                             |
| 285    | TOO_FEW_LIVE_REPLICAS                                 | Insufficient number of live replicas                                   |
| 286    | UNSATISFIED_QUORUM_FOR_PREVIOUS_WRITE                 | Previous write did not achieve quorum                                  |
| 287    | UNKNOWN_FORMAT_VERSION                                | Format version is not recognized                                       |
| 288    | DISTRIBUTED_IN_JOIN_SUBQUERY_DENIED                   | Distributed table in JOIN subquery not allowed                         |
| 289    | REPLICA_IS_NOT_IN_QUORUM                              | Replica is not part of quorum                                          |
| 290    | LIMIT_EXCEEDED                                        | Generic limit has been exceeded                                        |
| 291    | DATABASE_ACCESS_DENIED                                | Access to database is denied                                           |
| 293    | MONGODB_CANNOT_AUTHENTICATE                           | MongoDB authentication failed                                          |
| 294    | CANNOT_WRITE_TO_FILE                                  | Failed to write to file                                                |
| 295    | RECEIVED_EMPTY_DATA                                   | Received empty data when data was expected                             |
| 297    | SHARD_HAS_NO_CONNECTIONS                              | Shard has no available connections                                     |
| 298    | CANNOT_PIPE                                           | Pipe creation failed                                                   |
| 299    | CANNOT_FORK                                           | Process fork failed                                                    |
| 300    | CANNOT_DLSYM                                          | Dynamic library symbol lookup failed                                   |
| 301    | CANNOT_CREATE_CHILD_PROCESS                           | Child process creation failed                                          |
| 302    | CHILD_WAS_NOT_EXITED_NORMALLY                         | Child process did not exit normally                                    |
| 303    | CANNOT_SELECT                                         | Select system call failed                                              |
| 304    | CANNOT_WAITPID                                        | Wait for process failed                                                |
| 305    | TABLE_WAS_NOT_DROPPED                                 | Table drop operation failed                                            |
| 306    | TOO_DEEP_RECURSION                                    | Recursion depth exceeds limit                                          |
| 307    | TOO_MANY_BYTES                                        | Byte count exceeds limit                                               |
| 308    | UNEXPECTED_NODE_IN_ZOOKEEPER                          | Unexpected node found in ZooKeeper                                     |
| 309    | FUNCTION_CANNOT_HAVE_PARAMETERS                       | Function does not accept parameters                                    |
| 318    | INVALID_CONFIG_PARAMETER                              | Configuration parameter is invalid                                     |
| 319    | UNKNOWN_STATUS_OF_INSERT                              | Insert operation status is unknown                                     |
| 321    | VALUE_IS_OUT_OF_RANGE_OF_DATA_TYPE                    | Value exceeds data type range                                          |
| 336    | UNKNOWN_DATABASE_ENGINE                               | Database engine is not recognized                                      |
| 341    | UNFINISHED                                            | Operation is incomplete                                                |
| 342    | METADATA_MISMATCH                                     | Metadata does not match                                                |
| 344    | SUPPORT_IS_DISABLED                                   | Feature support is disabled                                            |
| 345    | TABLE_DIFFERS_TOO_MUCH                                | Tables differ too much for operation                                   |
| 346    | CANNOT_CONVERT_CHARSET                                | Character set conversion failed                                        |
| 347    | CANNOT_LOAD_CONFIG                                    | Configuration file load failed                                         |
| 349    | CANNOT_INSERT_NULL_IN_ORDINARY_COLUMN                 | NULL values not allowed in non-nullable column                         |
| 352    | AMBIGUOUS_COLUMN_NAME                                 | Column name is ambiguous                                               |
| 353    | INDEX_OF_POSITIONAL_ARGUMENT_IS_OUT_OF_RANGE          | Positional argument index out of range                                 |
| 354    | ZLIB_INFLATE_FAILED                                   | Zlib decompression failed                                              |
| 355    | ZLIB_DEFLATE_FAILED                                   | Zlib compression failed                                                |
| 358    | INTO_OUTFILE_NOT_ALLOWED                              | INTO OUTFILE clause is not permitted                                   |
| 359    | TABLE_SIZE_EXCEEDS_MAX_DROP_SIZE_LIMIT                | Table too large to drop without force                                  |
| 360    | CANNOT_CREATE_CHARSET_CONVERTER                       | Character set converter creation failed                                |
| 361    | SEEK_POSITION_OUT_OF_BOUND                            | Seek position is beyond file bounds                                    |
| 362    | CURRENT_WRITE_BUFFER_IS_EXHAUSTED                     | Write buffer is full                                                   |
| 363    | CANNOT_CREATE_IO_BUFFER                               | I/O buffer creation failed                                             |
| 364    | RECEIVED_ERROR_TOO_MANY_REQUESTS                      | Too many requests error received                                       |
| 366    | SIZES_OF_NESTED_COLUMNS_ARE_INCONSISTENT              | Nested column sizes do not match                                       |
| 369    | ALL_REPLICAS_ARE_STALE                                | All replicas have stale data                                           |
| 370    | DATA_TYPE_CANNOT_BE_USED_IN_TABLES                    | Data type not supported for table columns                              |
| 371    | INCONSISTENT_CLUSTER_DEFINITION                       | Cluster definition is inconsistent                                     |
| 372    | SESSION_NOT_FOUND                                     | Session does not exist                                                 |
| 373    | SESSION_IS_LOCKED                                     | Session is currently locked                                            |
| 374    | INVALID_SESSION_TIMEOUT                               | Session timeout value is invalid                                       |
| 375    | CANNOT_DLOPEN                                         | Dynamic library load failed                                            |
| 376    | CANNOT_PARSE_UUID                                     | UUID string format is invalid                                          |
| 377    | ILLEGAL_SYNTAX_FOR_DATA_TYPE                          | Data type syntax is invalid                                            |
| 378    | DATA_TYPE_CANNOT_HAVE_ARGUMENTS                       | Data type does not accept arguments                                    |
| 380    | CANNOT_KILL                                           | Process termination failed                                             |
| 381    | HTTP_LENGTH_REQUIRED                                  | HTTP Content-Length header is required                                 |
| 382    | CANNOT_LOAD_CATBOOST_MODEL                            | CatBoost model load failed                                             |
| 383    | CANNOT_APPLY_CATBOOST_MODEL                           | CatBoost model application failed                                      |
| 384    | PART_IS_TEMPORARILY_LOCKED                            | Data part is temporarily locked                                        |
| 385    | MULTIPLE_STREAMS_REQUIRED                             | Operation requires multiple streams                                    |
| 386    | NO_COMMON_TYPE                                        | Cannot determine common type for values                                |
| 387    | DICTIONARY_ALREADY_EXISTS                             | Dictionary with this name already exists                               |
| 388    | CANNOT_ASSIGN_OPTIMIZE                                | Cannot assign optimization                                             |
| 389    | INSERT_WAS_DEDUPLICATED                               | Insert was skipped due to deduplication                                |
| 390    | CANNOT_GET_CREATE_TABLE_QUERY                         | Unable to retrieve CREATE TABLE query                                  |
| 391    | EXTERNAL_LIBRARY_ERROR                                | External library error occurred                                        |
| 392    | QUERY_IS_PROHIBITED                                   | Query execution is not allowed                                         |
| 393    | THERE_IS_NO_QUERY                                     | No query was provided                                                  |
| 394    | QUERY_WAS_CANCELLED                                   | Query execution was cancelled                                          |
| 395    | FUNCTION_THROW_IF_VALUE_IS_NON_ZERO                   | Function threw exception for non-zero value                            |
| 396    | TOO_MANY_ROWS_OR_BYTES                                | Result exceeds row or byte limit                                       |
| 397    | QUERY_IS_NOT_SUPPORTED_IN_MATERIALIZED_VIEW           | Query type not supported in materialized view                          |
| 398    | UNKNOWN_MUTATION_COMMAND                              | Mutation command is not recognized                                     |
| 399    | FORMAT_IS_NOT_SUITABLE_FOR_OUTPUT                     | Data format cannot be used for output                                  |
| 400    | CANNOT_STAT                                           | File status retrieval failed                                           |
| 401    | FEATURE_IS_NOT_ENABLED_AT_BUILD_TIME                  | Feature was not enabled during build                                   |
| 402    | CANNOT_IOSETUP                                        | I/O context setup failed                                               |
| 403    | INVALID_JOIN_ON_EXPRESSION                            | JOIN ON condition is invalid                                           |
| 404    | BAD_ODBC_CONNECTION_STRING                            | ODBC connection string is malformed                                    |
| 406    | TOP_AND_LIMIT_TOGETHER                                | Cannot use TOP and LIMIT together                                      |
| 407    | DECIMAL_OVERFLOW                                      | Decimal arithmetic overflow occurred                                   |
| 408    | BAD_REQUEST_PARAMETER                                 | Request parameter is invalid                                           |
| 410    | EXTERNAL_SERVER_IS_NOT_RESPONDING                     | External server is not responding                                      |
| 411    | PTHREAD_ERROR                                         | POSIX thread operation failed                                          |
| 412    | NETLINK_ERROR                                         | Netlink operation failed                                               |
| 413    | CANNOT_SET_SIGNAL_HANDLER                             | Signal handler setup failed                                            |
| 415    | ALL_REPLICAS_LOST                                     | All replicas are lost                                                  |
| 416    | REPLICA_STATUS_CHANGED                                | Replica status has changed                                             |
| 417    | EXPECTED_ALL_OR_ANY                                   | Expected ALL or ANY keyword                                            |
| 418    | UNKNOWN_JOIN                                          | JOIN type is not recognized                                            |
| 419    | MULTIPLE_ASSIGNMENTS_TO_COLUMN                        | Column assigned multiple times                                         |
| 420    | CANNOT_UPDATE_COLUMN                                  | Column cannot be updated                                               |
| 421    | CANNOT_ADD_DIFFERENT_AGGREGATE_STATES                 | Cannot combine different aggregate states                              |
| 422    | UNSUPPORTED_URI_SCHEME                                | URI scheme is not supported                                            |
| 423    | CANNOT_GETTIMEOFDAY                                   | System time retrieval failed                                           |
| 424    | CANNOT_LINK                                           | File link creation failed                                              |
| 425    | SYSTEM_ERROR                                          | System-level error occurred                                            |
| 427    | CANNOT_COMPILE_REGEXP                                 | Regular expression compilation failed                                  |
| 429    | FAILED_TO_GETPWUID                                    | User information retrieval failed                                      |
| 430    | MISMATCHING_USERS_FOR_PROCESS_AND_DATA                | Process and data users do not match                                    |
| 431    | ILLEGAL_SYNTAX_FOR_CODEC_TYPE                         | Codec syntax is invalid                                                |
| 432    | UNKNOWN_CODEC                                         | Codec is not recognized                                                |
| 433    | ILLEGAL_CODEC_PARAMETER                               | Codec parameter is invalid                                             |
| 434    | CANNOT_PARSE_PROTOBUF_SCHEMA                          | Protobuf schema parsing failed                                         |
| 435    | NO_COLUMN_SERIALIZED_TO_REQUIRED_PROTOBUF_FIELD       | Required Protobuf field has no column mapping                          |
| 436    | PROTOBUF_BAD_CAST                                     | Protobuf type conversion failed                                        |
| 437    | PROTOBUF_FIELD_NOT_REPEATED                           | Protobuf field is not repeated                                         |
| 438    | DATA_TYPE_CANNOT_BE_PROMOTED                          | Data type promotion is not possible                                    |
| 439    | CANNOT_SCHEDULE_TASK                                  | Task scheduling failed                                                 |
| 440    | INVALID_LIMIT_EXPRESSION                              | LIMIT expression is invalid                                            |
| 441    | CANNOT_PARSE_DOMAIN_VALUE_FROM_STRING                 | Domain value parsing from string failed                                |
| 442    | BAD_DATABASE_FOR_TEMPORARY_TABLE                      | Invalid database for temporary table                                   |
| 443    | NO_COLUMNS_SERIALIZED_TO_PROTOBUF_FIELDS              | No columns map to Protobuf fields                                      |
| 444    | UNKNOWN_PROTOBUF_FORMAT                               | Protobuf format is not recognized                                      |
| 445    | CANNOT_MPROTECT                                       | Memory protection operation failed                                     |
| 446    | FUNCTION_NOT_ALLOWED                                  | Function usage is not permitted                                        |
| 447    | HYPERSCAN_CANNOT_SCAN_TEXT                            | Hyperscan pattern matching failed                                      |
| 448    | BROTLI_READ_FAILED                                    | Brotli decompression read failed                                       |
| 449    | BROTLI_WRITE_FAILED                                   | Brotli compression write failed                                        |
| 450    | BAD_TTL_EXPRESSION                                    | TTL expression is invalid                                              |
| 451    | BAD_TTL_FILE                                          | TTL configuration file is invalid                                      |
| 452    | SETTING_CONSTRAINT_VIOLATION                          | Setting constraint was violated                                        |
| 453    | MYSQL_CLIENT_INSUFFICIENT_CAPABILITIES                | MySQL client lacks required capabilities                               |
| 454    | OPENSSL_ERROR                                         | OpenSSL operation failed                                               |
| 455    | SUSPICIOUS_TYPE_FOR_LOW_CARDINALITY                   | Type may not be suitable for LowCardinality                            |
| 456    | UNKNOWN_QUERY_PARAMETER                               | Query parameter is not recognized                                      |
| 457    | BAD_QUERY_PARAMETER                                   | Query parameter value is invalid                                       |
| 458    | CANNOT_UNLINK                                         | File deletion failed                                                   |
| 459    | CANNOT_SET_THREAD_PRIORITY                            | Thread priority setting failed                                         |
| 460    | CANNOT_CREATE_TIMER                                   | Timer creation failed                                                  |
| 461    | CANNOT_SET_TIMER_PERIOD                               | Timer period setting failed                                            |
| 463    | CANNOT_FCNTL                                          | File control operation failed                                          |
| 464    | CANNOT_PARSE_ELF                                      | ELF file parsing failed                                                |
| 465    | CANNOT_PARSE_DWARF                                    | DWARF debug info parsing failed                                        |
| 466    | INSECURE_PATH                                         | File path is not secure                                                |
| 467    | CANNOT_PARSE_BOOL                                     | Boolean value parsing failed                                           |
| 468    | CANNOT_PTHREAD_ATTR                                   | Thread attribute operation failed                                      |
| 469    | VIOLATED_CONSTRAINT                                   | Constraint was violated                                                |
| 471    | INVALID_SETTING_VALUE                                 | Setting value is invalid                                               |
| 472    | READONLY_SETTING                                      | Setting is read-only                                                   |
| 473    | DEADLOCK_AVOIDED                                      | Potential deadlock was avoided                                         |
| 474    | INVALID_TEMPLATE_FORMAT                               | Template format is invalid                                             |
| 475    | INVALID_WITH_FILL_EXPRESSION                          | WITH FILL expression is invalid                                        |
| 476    | WITH_TIES_WITHOUT_ORDER_BY                            | WITH TIES requires ORDER BY clause                                     |
| 477    | INVALID_USAGE_OF_INPUT                                | INPUT function usage is invalid                                        |
| 478    | UNKNOWN_POLICY                                        | Policy name is not recognized                                          |
| 479    | UNKNOWN_DISK                                          | Disk name is not recognized                                            |
| 480    | UNKNOWN_PROTOCOL                                      | Protocol is not recognized                                             |
| 481    | PATH_ACCESS_DENIED                                    | Access to path is denied                                               |
| 482    | DICTIONARY_ACCESS_DENIED                              | Access to dictionary is denied                                         |
| 483    | TOO_MANY_REDIRECTS                                    | Too many HTTP redirects                                                |
| 484    | INTERNAL_REDIS_ERROR                                  | Redis internal error occurred                                          |
| 487    | CANNOT_GET_CREATE_DICTIONARY_QUERY                    | Unable to retrieve CREATE DICTIONARY query                             |
| 489    | INCORRECT_DICTIONARY_DEFINITION                       | Dictionary definition is invalid                                       |
| 490    | CANNOT_FORMAT_DATETIME                                | DateTime formatting failed                                             |
| 491    | UNACCEPTABLE_URL                                      | URL is not acceptable                                                  |
| 492    | ACCESS_ENTITY_NOT_FOUND                               | Access control entity not found                                        |
| 493    | ACCESS_ENTITY_ALREADY_EXISTS                          | Access control entity already exists                                   |
| 495    | ACCESS_STORAGE_READONLY                               | Access storage is read-only                                            |
| 496    | QUOTA_REQUIRES_CLIENT_KEY                             | Quota requires client key                                              |
| 497    | ACCESS_DENIED                                         | Access is denied                                                       |
| 498    | LIMIT_BY_WITH_TIES_IS_NOT_SUPPORTED                   | LIMIT BY does not support WITH TIES                                    |
| 499    | S3_ERROR                                              | Amazon S3 operation failed                                             |
| 500    | AZURE_BLOB_STORAGE_ERROR                              | Azure Blob Storage operation failed                                    |
| 501    | CANNOT_CREATE_DATABASE                                | Database creation failed                                               |
| 502    | CANNOT_SIGQUEUE                                       | Signal queue operation failed                                          |
| 503    | AGGREGATE_FUNCTION_THROW                              | Aggregate function threw exception                                     |
| 504    | FILE_ALREADY_EXISTS                                   | File with this name already exists                                     |
| 507    | UNABLE_TO_SKIP_UNUSED_SHARDS                          | Cannot skip unused shards                                              |
| 508    | UNKNOWN_ACCESS_TYPE                                   | Access type is not recognized                                          |
| 509    | INVALID_GRANT                                         | GRANT statement is invalid                                             |
| 510    | CACHE_DICTIONARY_UPDATE_FAIL                          | Cache dictionary update failed                                         |
| 511    | UNKNOWN_ROLE                                          | Role name is not recognized                                            |
| 512    | SET_NON_GRANTED_ROLE                                  | Cannot set role that was not granted                                   |
| 513    | UNKNOWN_PART_TYPE                                     | Data part type is not recognized                                       |
| 514    | ACCESS_STORAGE_FOR_INSERTION_NOT_FOUND                | Access storage for insertion not found                                 |
| 515    | INCORRECT_ACCESS_ENTITY_DEFINITION                    | Access entity definition is incorrect                                  |
| 516    | AUTHENTICATION_FAILED                                 | User authentication failed                                             |
| 517    | CANNOT_ASSIGN_ALTER                                   | Cannot assign ALTER privilege                                          |
| 518    | CANNOT_COMMIT_OFFSET                                  | Kafka offset commit failed                                             |
| 519    | NO_REMOTE_SHARD_AVAILABLE                             | No remote shard is available                                           |
| 520    | CANNOT_DETACH_DICTIONARY_AS_TABLE                     | Cannot detach dictionary as table                                      |
| 521    | ATOMIC_RENAME_FAIL                                    | Atomic rename operation failed                                         |
| 523    | UNKNOWN_ROW_POLICY                                    | Row policy is not recognized                                           |
| 524    | ALTER_OF_COLUMN_IS_FORBIDDEN                          | Column alteration is not allowed                                       |
| 525    | INCORRECT_DISK_INDEX                                  | Disk index is incorrect                                                |
| 527    | NO_SUITABLE_FUNCTION_IMPLEMENTATION                   | No suitable function implementation found                              |
| 528    | CASSANDRA_INTERNAL_ERROR                              | Cassandra internal error occurred                                      |
| 529    | NOT_A_LEADER                                          | Node is not the leader                                                 |
| 530    | CANNOT_CONNECT_RABBITMQ                               | RabbitMQ connection failed                                             |
| 531    | CANNOT_FSTAT                                          | File stat operation failed                                             |
| 532    | LDAP_ERROR                                            | LDAP operation failed                                                  |
| 535    | UNKNOWN_RAID_TYPE                                     | RAID type is not recognized                                            |
| 536    | CANNOT_RESTORE_FROM_FIELD_DUMP                        | Field dump restoration failed                                          |
| 537    | ILLEGAL_MYSQL_VARIABLE                                | MySQL variable is invalid                                              |
| 538    | MYSQL_SYNTAX_ERROR                                    | MySQL syntax error occurred                                            |
| 539    | CANNOT_BIND_RABBITMQ_EXCHANGE                         | RabbitMQ exchange binding failed                                       |
| 540    | CANNOT_DECLARE_RABBITMQ_EXCHANGE                      | RabbitMQ exchange declaration failed                                   |
| 541    | CANNOT_CREATE_RABBITMQ_QUEUE_BINDING                  | RabbitMQ queue binding creation failed                                 |
| 542    | CANNOT_REMOVE_RABBITMQ_EXCHANGE                       | RabbitMQ exchange removal failed                                       |
| 543    | UNKNOWN_MYSQL_DATATYPES_SUPPORT_LEVEL                 | MySQL datatypes support level unknown                                  |
| 544    | ROW_AND_ROWS_TOGETHER                                 | Cannot use ROW and ROWS together                                       |
| 545    | FIRST_AND_NEXT_TOGETHER                               | Cannot use FIRST and NEXT together                                     |
| 546    | NO_ROW_DELIMITER                                      | Row delimiter not specified                                            |
| 547    | INVALID_RAID_TYPE                                     | RAID type is invalid                                                   |
| 548    | UNKNOWN_VOLUME                                        | Volume name is not recognized                                          |
| 549    | DATA_TYPE_CANNOT_BE_USED_IN_KEY                       | Data type not supported for key columns                                |
| 552    | UNRECOGNIZED_ARGUMENTS                                | Arguments are not recognized                                           |
| 553    | LZMA_STREAM_ENCODER_FAILED                            | LZMA compression initialization failed                                 |
| 554    | LZMA_STREAM_DECODER_FAILED                            | LZMA decompression initialization failed                               |
| 555    | ROCKSDB_ERROR                                         | RocksDB operation failed                                               |
| 556    | SYNC_MYSQL_USER_ACCESS_ERROR                          | MySQL user access sync failed                                          |
| 557    | UNKNOWN_UNION                                         | UNION mode is not recognized                                           |
| 558    | EXPECTED_ALL_OR_DISTINCT                              | Expected ALL or DISTINCT keyword                                       |
| 559    | INVALID_GRPC_QUERY_INFO                               | gRPC query information is invalid                                      |
| 560    | ZSTD_ENCODER_FAILED                                   | Zstandard compression failed                                           |
| 561    | ZSTD_DECODER_FAILED                                   | Zstandard decompression failed                                         |
| 562    | TLD_LIST_NOT_FOUND                                    | Top-level domain list not found                                        |
| 563    | CANNOT_READ_MAP_FROM_TEXT                             | Map parsing from text failed                                           |
| 564    | INTERSERVER_SCHEME_DOESNT_MATCH                       | Interserver communication schemes don't match                          |
| 565    | TOO_MANY_PARTITIONS                                   | Partition count exceeds limit                                          |
| 566    | CANNOT_RMDIR                                          | Directory removal failed                                               |
| 567    | DUPLICATED_PART_UUIDS                                 | Data part UUIDs are duplicated                                         |
| 568    | RAFT_ERROR                                            | Raft consensus error occurred                                          |
| 569    | MULTIPLE_COLUMNS_SERIALIZED_TO_SAME_PROTOBUF_FIELD    | Multiple columns map to same Protobuf field                            |
| 570    | DATA_TYPE_INCOMPATIBLE_WITH_PROTOBUF_FIELD            | Data type incompatible with Protobuf field                             |
| 571    | DATABASE_REPLICATION_FAILED                           | Database replication failed                                            |
| 572    | TOO_MANY_QUERY_PLAN_OPTIMIZATIONS                     | Query plan optimization passes exceed limit                            |
| 573    | EPOLL_ERROR                                           | Epoll operation failed                                                 |
| 574    | DISTRIBUTED_TOO_MANY_PENDING_BYTES                    | Too many pending bytes for distributed insert                          |
| 575    | UNKNOWN_SNAPSHOT                                      | Snapshot is not recognized                                             |
| 576    | KERBEROS_ERROR                                        | Kerberos authentication failed                                         |
| 577    | INVALID_SHARD_ID                                      | Shard identifier is invalid                                            |
| 578    | INVALID_FORMAT_INSERT_QUERY_WITH_DATA                 | INSERT query format with data is invalid                               |
| 579    | INCORRECT_PART_TYPE                                   | Data part type is incorrect                                            |
| 580    | CANNOT_SET_ROUNDING_MODE                              | Floating-point rounding mode setting failed                            |
| 581    | TOO_LARGE_DISTRIBUTED_DEPTH                           | Distributed query depth exceeds limit                                  |
| 582    | NO_SUCH_PROJECTION_IN_TABLE                           | Projection does not exist in table                                     |
| 583    | ILLEGAL_PROJECTION                                    | Projection usage is not permitted                                      |
| 584    | PROJECTION_NOT_USED                                   | Projection was not used in query                                       |
| 585    | CANNOT_PARSE_YAML                                     | YAML parsing failed                                                    |
| 586    | CANNOT_CREATE_FILE                                    | File creation failed                                                   |
| 587    | CONCURRENT_ACCESS_NOT_SUPPORTED                       | Concurrent access is not supported                                     |
| 588    | DISTRIBUTED_BROKEN_BATCH_INFO                         | Distributed batch information is broken                                |
| 589    | DISTRIBUTED_BROKEN_BATCH_FILES                        | Distributed batch files are broken                                     |
| 590    | CANNOT_SYSCONF                                        | System configuration retrieval failed                                  |
| 591    | SQLITE_ENGINE_ERROR                                   | SQLite engine error occurred                                           |
| 592    | DATA_ENCRYPTION_ERROR                                 | Data encryption or decryption failed                                   |
| 593    | ZERO_COPY_REPLICATION_ERROR                           | Zero-copy replication error occurred                                   |
| 594    | BZIP2_STREAM_DECODER_FAILED                           | Bzip2 decompression failed                                             |
| 595    | BZIP2_STREAM_ENCODER_FAILED                           | Bzip2 compression failed                                               |
| 596    | INTERSECT_OR_EXCEPT_RESULT_STRUCTURES_MISMATCH        | INTERSECT/EXCEPT result structures mismatch                            |
| 597    | NO_SUCH_ERROR_CODE                                    | Error code does not exist                                              |
| 598    | BACKUP_ALREADY_EXISTS                                 | Backup already exists                                                  |
| 599    | BACKUP_NOT_FOUND                                      | Backup was not found                                                   |
| 600    | BACKUP_VERSION_NOT_SUPPORTED                          | Backup version is not supported                                        |
| 601    | BACKUP_DAMAGED                                        | Backup is corrupted or damaged                                         |
| 602    | NO_BASE_BACKUP                                        | Base backup does not exist                                             |
| 603    | WRONG_BASE_BACKUP                                     | Base backup is incorrect                                               |
| 604    | BACKUP_ENTRY_ALREADY_EXISTS                           | Backup entry already exists                                            |
| 605    | BACKUP_ENTRY_NOT_FOUND                                | Backup entry was not found                                             |
| 606    | BACKUP_IS_EMPTY                                       | Backup contains no data                                                |
| 607    | CANNOT_RESTORE_DATABASE                               | Database restoration failed                                            |
| 608    | CANNOT_RESTORE_TABLE                                  | Table restoration failed                                               |
| 609    | FUNCTION_ALREADY_EXISTS                               | Function already exists                                                |
| 610    | CANNOT_DROP_FUNCTION                                  | Function drop failed                                                   |
| 611    | CANNOT_CREATE_RECURSIVE_FUNCTION                      | Recursive function creation not allowed                                |
| 614    | POSTGRESQL_CONNECTION_FAILURE                         | PostgreSQL connection failed                                           |
| 615    | CANNOT_ADVISE                                         | File advise operation failed                                           |
| 616    | UNKNOWN_READ_METHOD                                   | Read method is not recognized                                          |
| 617    | LZ4_ENCODER_FAILED                                    | LZ4 compression failed                                                 |
| 618    | LZ4_DECODER_FAILED                                    | LZ4 decompression failed                                               |
| 619    | POSTGRESQL_REPLICATION_INTERNAL_ERROR                 | PostgreSQL replication internal error                                  |
| 620    | QUERY_NOT_ALLOWED                                     | Query execution is not allowed                                         |
| 621    | CANNOT_NORMALIZE_STRING                               | String normalization failed                                            |
| 622    | CANNOT_PARSE_CAPN_PROTO_SCHEMA                        | Cap'n Proto schema parsing failed                                      |
| 623    | CAPN_PROTO_BAD_CAST                                   | Cap'n Proto type conversion failed                                     |
| 624    | BAD_FILE_TYPE                                         | File type is invalid or unsupported                                    |
| 625    | IO_SETUP_ERROR                                        | I/O setup operation failed                                             |
| 626    | CANNOT_SKIP_UNKNOWN_FIELD                             | Cannot skip unknown field in data                                      |
| 627    | BACKUP_ENGINE_NOT_FOUND                               | Backup engine was not found                                            |
| 628    | OFFSET_FETCH_WITHOUT_ORDER_BY                         | OFFSET/FETCH requires ORDER BY clause                                  |
| 629    | HTTP_RANGE_NOT_SATISFIABLE                            | HTTP range request cannot be satisfied                                 |
| 630    | HAVE_DEPENDENT_OBJECTS                                | Object has dependent objects                                           |
| 631    | UNKNOWN_FILE_SIZE                                     | File size cannot be determined                                         |
| 632    | UNEXPECTED_DATA_AFTER_PARSED_VALUE                    | Unexpected data found after parsed value                               |
| 633    | QUERY_IS_NOT_SUPPORTED_IN_WINDOW_VIEW                 | Query type not supported in window view                                |
| 634    | MONGODB_ERROR                                         | MongoDB operation error occurred                                       |
| 635    | CANNOT_POLL                                           | Poll operation failed                                                  |
| 636    | CANNOT_EXTRACT_TABLE_STRUCTURE                        | Table structure extraction failed                                      |
| 637    | INVALID_TABLE_OVERRIDE                                | Table override is invalid                                              |
| 638    | SNAPPY_UNCOMPRESS_FAILED                              | Snappy decompression failed                                            |
| 639    | SNAPPY_COMPRESS_FAILED                                | Snappy compression failed                                              |
| 640    | NO_HIVEMETASTORE                                      | Hive Metastore connection not available                                |
| 641    | CANNOT_APPEND_TO_FILE                                 | File append operation failed                                           |
| 642    | CANNOT_PACK_ARCHIVE                                   | Archive packing failed                                                 |
| 643    | CANNOT_UNPACK_ARCHIVE                                 | Archive unpacking failed                                               |
| 645    | NUMBER_OF_DIMENSIONS_MISMATCHED                       | Array dimension count does not match                                   |
| 647    | CANNOT_BACKUP_TABLE                                   | Table backup failed                                                    |
| 648    | WRONG_DDL_RENAMING_SETTINGS                           | DDL renaming settings are incorrect                                    |
| 649    | INVALID_TRANSACTION                                   | Transaction is invalid                                                 |
| 650    | SERIALIZATION_ERROR                                   | Transaction serialization error occurred                               |
| 651    | CAPN_PROTO_BAD_TYPE                                   | Cap'n Proto type is invalid                                            |
| 652    | ONLY_NULLS_WHILE_READING_SCHEMA                       | Only NULL values found while inferring schema                          |
| 653    | CANNOT_PARSE_BACKUP_SETTINGS                          | Backup settings parsing failed                                         |
| 654    | WRONG_BACKUP_SETTINGS                                 | Backup settings are incorrect                                          |
| 655    | FAILED_TO_SYNC_BACKUP_OR_RESTORE                      | Backup or restore synchronization failed                               |
| 659    | UNKNOWN_STATUS_OF_TRANSACTION                         | Transaction status is unknown                                          |
| 660    | HDFS_ERROR                                            | HDFS operation failed                                                  |
| 661    | CANNOT_SEND_SIGNAL                                    | Signal send operation failed                                           |
| 662    | FS_METADATA_ERROR                                     | Filesystem metadata error occurred                                     |
| 663    | INCONSISTENT_METADATA_FOR_BACKUP                      | Backup metadata is inconsistent                                        |
| 664    | ACCESS_STORAGE_DOESNT_ALLOW_BACKUP                    | Access storage does not allow backup                                   |
| 665    | CANNOT_CONNECT_NATS                                   | NATS connection failed                                                 |
| 667    | NOT_INITIALIZED                                       | Component is not initialized                                           |
| 668    | INVALID_STATE                                         | Object is in invalid state                                             |
| 669    | NAMED_COLLECTION_DOESNT_EXIST                         | Named collection does not exist                                        |
| 670    | NAMED_COLLECTION_ALREADY_EXISTS                       | Named collection already exists                                        |
| 671    | NAMED_COLLECTION_IS_IMMUTABLE                         | Named collection is immutable                                          |
| 672    | INVALID_SCHEDULER_NODE                                | Scheduler node is invalid                                              |
| 673    | RESOURCE_ACCESS_DENIED                                | Access to resource is denied                                           |
| 674    | RESOURCE_NOT_FOUND                                    | Resource was not found                                                 |
| 675    | CANNOT_PARSE_IPV4                                     | IPv4 address parsing failed                                            |
| 676    | CANNOT_PARSE_IPV6                                     | IPv6 address parsing failed                                            |
| 677    | THREAD_WAS_CANCELED                                   | Thread was cancelled                                                   |
| 678    | IO_URING_INIT_FAILED                                  | io_uring initialization failed                                         |
| 679    | IO_URING_SUBMIT_ERROR                                 | io_uring submission error occurred                                     |
| 690    | MIXED_ACCESS_PARAMETER_TYPES                          | Access parameter types are mixed                                       |
| 691    | UNKNOWN_ELEMENT_OF_ENUM                               | Enum element is not recognized                                         |
| 692    | TOO_MANY_MUTATIONS                                    | Mutation count exceeds limit                                           |
| 693    | AWS_ERROR                                             | AWS operation failed                                                   |
| 694    | ASYNC_LOAD_CYCLE                                      | Circular dependency in async loading                                   |
| 695    | ASYNC_LOAD_FAILED                                     | Asynchronous load operation failed                                     |
| 696    | ASYNC_LOAD_CANCELED                                   | Asynchronous load was cancelled                                        |
| 697    | CANNOT_RESTORE_TO_NONENCRYPTED_DISK                   | Cannot restore encrypted backup to non-encrypted disk                  |
| 698    | INVALID_REDIS_STORAGE_TYPE                            | Redis storage type is invalid                                          |
| 699    | INVALID_REDIS_TABLE_STRUCTURE                         | Redis table structure is invalid                                       |
| 700    | USER_SESSION_LIMIT_EXCEEDED                           | User session limit exceeded                                            |
| 701    | CLUSTER_DOESNT_EXIST                                  | Cluster does not exist                                                 |
| 702    | CLIENT_INFO_DOES_NOT_MATCH                            | Client information does not match                                      |
| 703    | INVALID_IDENTIFIER                                    | Identifier is invalid                                                  |
| 704    | QUERY_CACHE_USED_WITH_NONDETERMINISTIC_FUNCTIONS      | Query cache used with non-deterministic functions                      |
| 705    | TABLE_NOT_EMPTY                                       | Table contains data and is not empty                                   |
| 706    | LIBSSH_ERROR                                          | libSSH operation failed                                                |
| 707    | GCP_ERROR                                             | Google Cloud Platform operation failed                                 |
| 708    | ILLEGAL_STATISTICS                                    | Statistics usage is not permitted                                      |
| 709    | CANNOT_GET_REPLICATED_DATABASE_SNAPSHOT               | Cannot get replicated database snapshot                                |
| 710    | FAULT_INJECTED                                        | Fault was intentionally injected for testing                           |
| 711    | FILECACHE_ACCESS_DENIED                               | File cache access is denied                                            |
| 712    | TOO_MANY_MATERIALIZED_VIEWS                           | Materialized view count exceeds limit                                  |
| 713    | BROKEN_PROJECTION                                     | Projection is broken or corrupted                                      |
| 714    | UNEXPECTED_CLUSTER                                    | Cluster specification was unexpected                                   |
| 715    | CANNOT_DETECT_FORMAT                                  | Data format auto-detection failed                                      |
| 716    | CANNOT_FORGET_PARTITION                               | Partition forget operation failed                                      |
| 717    | EXPERIMENTAL_FEATURE_ERROR                            | Experimental feature encountered an error                              |
| 718    | TOO_SLOW_PARSING                                      | Data parsing is too slow                                               |
| 719    | QUERY_CACHE_USED_WITH_SYSTEM_TABLE                    | Query cache used with system table                                     |
| 720    | USER_EXPIRED                                          | User account has expired                                               |
| 721    | DEPRECATED_FUNCTION                                   | Function is deprecated                                                 |
| 722    | ASYNC_LOAD_WAIT_FAILED                                | Async load wait operation failed                                       |
| 723    | PARQUET_EXCEPTION                                     | Apache Parquet processing error occurred                               |
| 724    | TOO_MANY_TABLES                                       | Table count exceeds limit                                              |
| 725    | TOO_MANY_DATABASES                                    | Database count exceeds limit                                           |
| 726    | UNEXPECTED_HTTP_HEADERS                               | HTTP headers were unexpected                                           |
| 727    | UNEXPECTED_TABLE_ENGINE                               | Table engine was unexpected                                            |
| 728    | UNEXPECTED_DATA_TYPE                                  | Data type was unexpected                                               |
| 729    | ILLEGAL_TIME_SERIES_TAGS                              | Time series tags are invalid                                           |
| 730    | REFRESH_FAILED                                        | Refresh operation failed                                               |
| 731    | QUERY_CACHE_USED_WITH_NON_THROW_OVERFLOW_MODE         | Query cache incompatible with overflow mode                            |
| 733    | TABLE_IS_BEING_RESTARTED                              | Table is currently restarting                                          |
| 734    | CANNOT_WRITE_AFTER_BUFFER_CANCELED                    | Cannot write after buffer was cancelled                                |
| 735    | QUERY_WAS_CANCELLED_BY_CLIENT                         | Client cancelled query execution                                       |
| 736    | DATALAKE_DATABASE_ERROR                               | Data lake database error occurred                                      |
| 737    | GOOGLE_CLOUD_ERROR                                    | Google Cloud operation error occurred                                  |
| 738    | PART_IS_LOCKED                                        | Data part is locked                                                    |
| 739    | BUZZHOUSE                                             | Buzzhouse error occurred                                               |
| 740    | POTENTIALLY_BROKEN_DATA_PART                          | Data part may be broken                                                |
| 741    | TABLE_UUID_MISMATCH                                   | Table UUID does not match                                              |
| 742    | DELTA_KERNEL_ERROR                                    | Delta Kernel error occurred                                            |
| 743    | ICEBERG_SPECIFICATION_VIOLATION                       | Apache Iceberg specification violated                                  |
| 744    | SESSION_ID_EMPTY                                      | Session ID is empty                                                    |
| 745    | SERVER_OVERLOADED                                     | Server is overloaded                                                   |
| 746    | DEPENDENCIES_NOT_FOUND                                | Required dependencies not found                                        |
| 900    | DISTRIBUTED_CACHE_ERROR                               | Distributed cache error occurred                                       |
| 901    | CANNOT_USE_DISTRIBUTED_CACHE                          | Cannot use distributed cache                                           |
| 902    | PROTOCOL_VERSION_MISMATCH                             | Protocol versions do not match                                         |
| 903    | LICENSE_EXPIRED                                       | License has expired                                                    |
| 999    | KEEPER_EXCEPTION                                      | Keeper service exception occurred                                      |
| 1000   | POCO_EXCEPTION                                        | POCO library exception occurred                                        |
| 1001   | STD_EXCEPTION                                         | Standard C++ exception occurred                                        |
| 1002   | UNKNOWN_EXCEPTION                                     | Unknown exception occurred                                             |