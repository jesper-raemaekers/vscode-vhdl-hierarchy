# vhdl-hierarchy README

This extension analyzes the workspace for VHDL, Qsys and _hw.tcl files to generate an architecture outline for easy navigation.

## Features

Creates an outline.
Can create hierarchy image using graphviz. requires dot command to be in path.

## Extension Settings

This extension contributes the following settings:

* `VHDL-hierarchy.TopLevelFile`: Relative path (from workspace root) to the top level file

## Known Issues

No error reporting and fragile parsing of VHDL, Qsys and _hw.tcl files. No support for libraries. stil outputting debug information.

## Release Notes

### 0.0.2

Added hierarchy image generator using graphviz dot.

### 0.0.1

Initial release.