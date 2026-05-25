// https://github.com/mongodb-js/mongodb-mcp-server
export const getMongoDBTool = () => {
    return {
        "MongoDB": {
            transport: 'stdio' as const,

            "command": "npx",
            "args": ["-y", "mongodb-mcp-server@latest"],
            "env": {
                "MDB_MCP_CONNECTION_STRING": "mongodb://localhost:27017/dataprocessing"
            }
        }
    }
}