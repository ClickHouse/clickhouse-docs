---
slug: /troubleshooting/error-codes/046_UNKNOWN_FUNCTION
sidebar_label: '046 UNKNOWN_FUNCTION'
doc_type: 'reference'
keywords: ['error codes', 'UNKNOWN_FUNCTION', '046']
title: '046 UNKNOWN_FUNCTION'
description: 'ClickHouse error code - 046 UNKNOWN_FUNCTION'
---

# Error 46: UNKNOWN_FUNCTION

:::tip
This error occurs when ClickHouse encounters a function name that it does not recognize or that is not available in the current context.
It typically indicates a typo in the function name, a missing user-defined function (UDF), or use of a function that doesn't exist in your ClickHouse version.
:::

## Most common causes {#most-common-causes}

1. **Typo in function name**
    - Misspelled function name
    - Incorrect capitalization (though ClickHouse is usually case-insensitive for function names)
    - Extra or missing characters in function name

2. **User-defined function not properly configured**
    - Python or executable UDF not uploaded or registered correctly
    - UDF configuration XML not loaded properly
    - UDF script execution permissions issues
    - UDF dependencies or libraries not available

3. **Function not available in current ClickHouse version**
    - Functions introduced in later versions than the one you are using
    - [Experimental functions](/beta-and-experimental-features) not enabled

4. **Function exists but identifier is confused**
    - Column name confused with function name
    - Similar-named function exists (error may suggest alternatives)
    - Identifier scope issues