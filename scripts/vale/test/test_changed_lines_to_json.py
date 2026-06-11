#!/usr/bin/env python3
"""
Unit tests for changed_lines_to_json.get_changed_lines().

Run from the repo root:
    python3 scripts/vale/test/test_changed_lines_to_json.py
"""
import os
import sys
import unittest
from unittest.mock import patch

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import changed_lines_to_json
from changed_lines_to_json import get_changed_lines


class GetChangedLinesTest(unittest.TestCase):
    def _run(self, diff_output):
        with patch.object(changed_lines_to_json.subprocess, "check_output", return_value=diff_output):
            return get_changed_lines("dummy.md", "BASE", "HEAD")

    def test_single_line_addition_no_count(self):
        # `+26` (count omitted) means exactly one added line
        self.assertEqual(self._run("@@ -25,0 +26 @@"), [26])

    def test_multi_line_addition(self):
        # `+43,26` means 26 lines starting at 43 — this is the case PR #6183 hit
        self.assertEqual(self._run("@@ -41,0 +43,26 @@"), list(range(43, 69)))

    def test_pure_deletion_yields_no_lines(self):
        # `+9,0` is a pure deletion — no lines exist in the new file to lint
        self.assertEqual(self._run("@@ -10,5 +9,0 @@"), [])

    def test_modified_hunk(self):
        self.assertEqual(self._run("@@ -10,3 +10,5 @@"), [10, 11, 12, 13, 14])

    def test_multiple_hunks_concatenated(self):
        diff = "\n".join([
            "@@ -25,0 +26 @@",
            "@@ -41,0 +43,3 @@",
        ])
        self.assertEqual(self._run(diff), [26, 43, 44, 45])

    def test_hunk_header_with_trailing_context(self):
        # Real git output often appends a context line after the second @@
        self.assertEqual(
            self._run("@@ -41,0 +43,2 @@ Some context line"),
            [43, 44],
        )


if __name__ == "__main__":
    unittest.main()
