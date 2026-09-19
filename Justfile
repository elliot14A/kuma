set shell := ["bash", "-c"]

default:
    @just --list

dev:
    bun --filter "*" dev

db-up:
    docker compose up -d postgres

db-down:
    docker compose down

lint:
    bun x @biomejs/biome check .

lint-fix:
    bun x @biomejs/biome check . --write

check:
    bun --filter "*" typecheck
