FROM ubuntu:24.04

RUN apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        curl wget ca-certificates git python3 python3-pip python3-pytest bash ripgrep && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    pip3 install --break-system-packages pytest-json-ctrf && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/user && chmod 0755 /home/user

RUN mkdir -p /home/user/myproject && \
    cd /home/user/myproject && \
    cat >package.json <<'EOF'
{
  "name": "myproject",
  "version": "1.0.0",
  "description": "Sequelize Transaction Rollback Task",
  "main": "index.js",
  "dependencies": {
    "sequelize": "^6.37.0",
    "sqlite3": "^5.1.7"
  }
}
EOF

LABEL Author="generate-harbor-tasks"
LABEL Description="Node.js environment with Sequelize and SQLite dependencies for testing transaction rollback on hook failure."

CMD ["/bin/bash", "-c", "trap : TERM INT; sleep infinity & wait"]

# Container contents:
#   - always required apt packages: curl wget ca-certificates git python3 python3-pip python3-pytest bash ripgrep
#   - always required pip3 packages: pytest-json-ctrf
#   - Node.js v24 for running the Sequelize script
#   - /home/user/myproject: Project directory
#   - /home/user/myproject/package.json: Pre-configured package.json with sequelize and sqlite3 dependencies
