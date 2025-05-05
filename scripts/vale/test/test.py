#!/usr/bin/env python3
"""
Test script to run vale_annotations.py with sample data
"""
import os
import sys
import subprocess
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def main():
    """Run the vale_annotations.py script with sample data"""
    # Get paths to files
    changed_lines_path = 'changed_lines.json'
    vale_output_path = 'vale_output.log'

    # Find script path
    script_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                               "vale_annotations.py")

    # Make sure the script exists
    if not os.path.exists(script_path):
        print(f"Error: Script not found at {script_path}")
        return

    # Check if the input files exist
    if not os.path.exists(changed_lines_path):
        print(f"Error: Changed lines file not found at {changed_lines_path}")
        return
    if not os.path.exists(vale_output_path):
        print(f"Error: Vale output file not found at {vale_output_path}")
        return

    print(f"Running: {script_path} --git-log-file={changed_lines_path} --vale-log-file={vale_output_path}")
    result = subprocess.run(
        [sys.executable, script_path, f"--git-log-file={changed_lines_path}",
         f"--vale-log-file={vale_output_path}"],
        capture_output=True,
        text=True
    )

    # Print the output
    print("STDOUT:")
    print(result.stdout)

    print("STDERR:")
    print(result.stderr)

    print(f"Return code: {result.returncode}")

if __name__ == "__main__":
    main()
