#!/bin/bash
protoc --descriptor_set_out=desc/gm.desc --include_imports gm.proto
