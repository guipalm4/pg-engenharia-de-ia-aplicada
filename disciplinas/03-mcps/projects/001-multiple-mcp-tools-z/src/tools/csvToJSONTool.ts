import { tool } from "@langchain/core/tools";

import csvtojson from 'csvtojson'
import { z } from 'zod/v3'

export function getCSVTOJSONTool() {
    return tool(
        async ({ csvText }) => {
            const result = await csvtojson().fromString(csvText)
            console.log('[getCSVToJSONTool] conversion result finished', result.length, 'records');

            return JSON.stringify(result)
        },
        {
            name: 'csv_to_json',
            description: 'Convert CSV to JSON formart',
            schema: z.object({
                csvText: z.string().describe(
                    'CSV data to be converted to JSON formart'
                )
            })
        }
    )

}