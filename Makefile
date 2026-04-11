.PHONY: help create install start dev prod reset nuke \
	clean clean-logs update update-composer update-npm up npm-install kill-vite \
	pull-db export-db import-db reindex-search \
	launch tableplus mailpit keys format share funnel \
	l tp mp fmt kv

# `make` with no args shows help
.DEFAULT_GOAL := help

NPM_INSTALL_FLAGS ?= --include=optional --legacy-peer-deps

# -----------------------------------------------------------------------------
# Help — parses `## description` comments on each target line. Targets with a
# short alias use `## @<alias> description`, which the parser renders inline
# as `command (alias)`. Section headers use `##@ Section Name`.
# -----------------------------------------------------------------------------
help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} \
		/^##@ / { printf "\n\033[1m%s\033[0m\n", substr($$0, 5); next } \
		/^[a-zA-Z_-]+:.*?## / { \
			cmd = $$1; desc = $$2; alias = ""; \
			if (substr(desc, 1, 1) == "@") { \
				sp = index(desc, " "); \
				alias = substr(desc, 2, sp - 2); \
				desc = substr(desc, sp + 1); \
			} \
			if (alias != "") { \
				visible = sprintf("%s (%s)", cmd, alias); \
				label = sprintf("\033[36m%s\033[0m \033[2m(%s)\033[0m", cmd, alias); \
			} else { \
				visible = cmd; \
				label = sprintf("\033[36m%s\033[0m", cmd); \
			} \
			pad = 26 - length(visible); \
			if (pad < 0) pad = 0; \
			printf "  %s%*s %s\n", label, pad, "", desc; \
		}' \
		$(MAKEFILE_LIST)
	@echo ""

##@ Setup & install

create: ## Interactive setup (prompts → install Craft + plugins end-to-end)
	@cd cli && npm install --silent 2>/dev/null && cd ..
	@node cli/setup.mjs

install: ## Install or re-sync the project (idempotent — safe to run anytime)
	@if [ ! -f .env ]; then \
		echo "No .env file found. Run 'make create' for interactive setup."; \
		exit 1; \
	fi
	ddev start
	ddev composer install
	ddev exec -- npm install $(NPM_INSTALL_FLAGS)
	@# Only run `craft install` if Craft isn't installed yet. We detect this
	@# by asking project-config for the stored system.schemaVersion, which
	@# returns a `5.x.x.x` string on installed Craft and nothing on fresh.
	@# Avoids the "Craft is already installed" error on re-runs.
	@if ddev exec php craft project-config/get system.schemaVersion 2>/dev/null | grep -qE '^[0-9]+\.'; then \
		echo "Craft already installed — skipping first-run install"; \
	else \
		echo "Installing Craft CMS..."; \
		ddev exec php craft install --interactive=0; \
	fi
	ddev exec php craft up --interactive=0
	@echo "Install/sync complete"

start: ## ddev start + Vite dev server
	ddev start
	ddev exec npm run serve

keys: ## Generate Craft security key + app ID into .env
	ddev exec php craft setup/keys

npm-install: ## Run `npm install` inside DDEV
	ddev start
	ddev exec -- npm install $(NPM_INSTALL_FLAGS)

##@ Development

dev: ## Start Vite dev server (HMR)
	ddev exec npm run dev

prod: ## Production build
	ddev exec npm run build

format: ## @fmt Format everything with Prettier
	ddev exec npx prettier -w .

kill-vite: ## @kv Kill stuck Vite processes
	@ddev exec bash -c "pkill -9 -f 'node.*vite'" 2>/dev/null || true
	@echo "Vite processes killed"

launch: ## @l Launch the site in your browser
	ddev launch

tableplus: ## @tp Launch TablePlus
	ddev tableplus

mailpit: ## @mp Launch Mailpit
	ddev mailpit

# Short aliases — parsed into the alias column of `make help` via the
# `## @<alias>` annotation on each canonical target above. Keep them here
# as plain prerequisite-only targets so `make l` runs `launch`, etc.
l: launch
tp: tableplus
mp: mailpit
fmt: format
kv: kill-vite

##@ Device testing (Tailscale)

share: ## Share over your Tailnet (test device needs Tailscale)
	ddev tailscale-share

funnel: ## Share publicly via Tailscale Funnel (no Tailscale on test device)
	ddev tailscale-funnel

##@ Maintenance

up: ## Apply project config + run pending migrations
	ddev exec php craft up --interactive=0

update: ## Run `craft update all` (updates Craft + plugins via Craft's updater)
	ddev exec php craft update all

update-composer: ## Update Composer packages to latest matching versions
	ddev composer update

update-npm: ## Update NPM packages (interactive — shows what's available)
	ddev exec npm-check --update

clean: ## Remove vendor & node_modules then reinstall
	rm -rf vendor/
	rm -rf node_modules/
	ddev composer clear-cache
	ddev exec npm cache clean --force
	ddev composer install
	ddev exec -- npm install $(NPM_INSTALL_FLAGS)

clean-logs: ## Remove storage/logs/*.log
	rm -rf storage/logs/*.log

pull-db: ## Pull database from Servd (Servd hosting only)
	ddev exec php craft servd-asset-storage/local/pull-database --emptyDatabase

export-db: ## Export the local database (default: db.sql.gz, or file=path)
	@target="$${file:-db.sql.gz}"; \
	echo "Exporting database to $$target..."; \
	ddev export-db --file="$$target"; \
	echo "Done."

import-db: ## Import a SQL dump (default: db.sql.gz, or file=path)
	@target="$${file:-db.sql.gz}"; \
	if [ ! -f "$$target" ]; then \
		echo "File not found: $$target"; \
		echo "Usage: make import-db                    (imports ./db.sql.gz)"; \
		echo "       make import-db file=path/to/dump.sql.gz"; \
		exit 1; \
	fi; \
	echo "Importing database from $$target..."; \
	ddev import-db --file="$$target"; \
	echo "Done."

reindex-search: ## Rebuild the search index
	ddev exec php craft resave/entries --update-search-index

##@ Destructive (asks for confirmation)

reset: ## Wipe the database + .env (keeps vendor/node_modules)
	@printf "This will wipe the database and .env. Continue? [y/N] " && read ans && [ "$$ans" = "y" ] || [ "$$ans" = "Y" ] || (echo "Cancelled." && exit 1)
	@echo "Resetting database..."
	ddev delete -Oy 2>/dev/null || true
	@rm -f .env
	@rm -rf config/project
	@echo "Reset complete — run 'make create' to reinstall"

nuke: ## Destroy DDEV + vendor + node_modules + dist + config/project + .env
	@printf "This will destroy EVERYTHING (DDEV, vendor, node_modules, .env, dist). Continue? [y/N] " && read ans && [ "$$ans" = "y" ] || [ "$$ans" = "Y" ] || (echo "Cancelled." && exit 1)
	@echo "Nuking everything and starting from scratch..."
	@# Kill any running dev processes that might be holding files open
	@pkill -9 -f 'node.*vite' 2>/dev/null || true
	ddev delete -Oy 2>/dev/null || true
	@# Purge .DS_Store files first so macOS Finder can't block directory removal mid-rm
	@find vendor node_modules web/dist config/project -name '.DS_Store' -delete 2>/dev/null || true
	@# First-pass removal
	@rm -rf vendor node_modules web/dist config/project 2>/dev/null || true
	@rm -f .env composer.lock package-lock.json 2>/dev/null || true
	@# Second-pass retry — catches race conditions with Finder/Spotlight/Mutagen
	@if [ -e vendor ] || [ -e node_modules ] || [ -e web/dist ] || [ -e config/project ]; then \
		sleep 1; \
		find vendor node_modules web/dist config/project -name '.DS_Store' -delete 2>/dev/null || true; \
		rm -rf vendor node_modules web/dist config/project 2>/dev/null || true; \
	fi
	@# Final safety check — fail loudly if anything survived
	@if [ -e vendor ] || [ -e node_modules ] || [ -e web/dist ] || [ -e config/project ] || [ -e .env ]; then \
		echo ""; \
		echo "Some files could not be removed. They may be locked by a running process."; \
		echo "Try:  pkill -9 node && make nuke"; \
		echo "Or manually:  rm -rf vendor node_modules web/dist config/project .env"; \
		exit 1; \
	fi
	@echo "Nuke complete — run 'make create' or 'make install' to rebuild"
