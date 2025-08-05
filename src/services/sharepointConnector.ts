import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import Redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Redis client for caching
const redisClient = Redis.createClient({ url: process.env.REDIS_URL });
(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
})();

// Initialize Microsoft Graph client with token from env
const graphClient = Client.init({
  authProvider: (done) => {
    done(null, process.env.SHAREPOINT_ACCESS_TOKEN);
  }
});

/**
 * Fetches only new or changed files via Graph delta API,
 * retrieves content & metadata, and caches each embedding.
 */
export async function fetchSharePointDocuments(siteId: string, listId: string) {
  try {
    let deltaUrl = `/sites/${siteId}/lists/${listId}/drive/root/delta`;
    const docs: Array<{ id: string; name: string; content: string; metadata: any }> = [];

    do {
      const response: any = await graphClient.api(deltaUrl).get();
      for (const item of response.value) {
        if (!item.id || !item.name) continue; // Skip items without required fields
        
        const cacheKey = `${item.id}:${item.etag || ''}`;
        
        // Check if we've already processed this version of the file
        const existingCache = await redisClient.exists(cacheKey);
        if (existingCache) {
          console.log(`Using cached version of ${item.name}`);
          continue;
        }

        try {
          // Download file content
          const fileContent = await graphClient
            .api(`/sites/${siteId}/lists/${listId}/drive/items/${item.id}/content`)
            .get();

          docs.push({
            id: item.id,
            name: item.name,
            content: fileContent as string,
            metadata: {
              author: item.createdBy?.user?.displayName || 'Unknown',
              modifiedDate: item.lastModifiedDateTime,
              fileType: item.file?.mimeType || 'unknown',
              createdDate: item.createdDateTime,
              size: item.size || 0
            }
          });

          // Cache embedding placeholder
          await redisClient.set(cacheKey, JSON.stringify({
            id: item.id,
            name: item.name,
            etag: item.etag || '',
            lastProcessed: new Date().toISOString()
          }));
          
          console.log(`Processed ${item.name}`);
        } catch (fileError) {
          console.error(`Error processing file ${item.name}:`, fileError);
        }
      }
      
      // Get the next page URL if available
      deltaUrl = response['@odata.nextLink'];
    } while (deltaUrl);

    return docs;
  } catch (error) {
    console.error('Error fetching SharePoint documents:', error);
    throw new Error('Failed to fetch SharePoint documents');
  }
}

/**
 * Searches for documents in SharePoint based on query and metadata filters.
 */
export async function searchSharePoint(query: string, options: {
  team?: string,
  author?: string,
  fileType?: string,
  modifiedAfter?: Date,
  limit?: number
} = {}) {
  try {
    const limit = options.limit || 10;
    
    // Construct filter string for MS Graph API
    let filterParts: string[] = [];
    if (options.team) filterParts.push(`contains(fields/Team, '${options.team}')`);
    if (options.author) filterParts.push(`contains(createdBy/user/displayName, '${options.author}')`);
    if (options.fileType) filterParts.push(`contains(file/mimeType, '${options.fileType}')`);
    if (options.modifiedAfter) {
      const dateStr = options.modifiedAfter.toISOString();
      filterParts.push(`lastModifiedDateTime ge ${dateStr}`);
    }
    
    const filterString = filterParts.length > 0 ? `$filter=${filterParts.join(' and ')}` : '';
    
    // Execute search
    const searchResults = await graphClient
      .api(`/search/query`)
      .post({
        requests: [{
          entityTypes: ["driveItem"],
          query: {
            queryString: query
          },
          from: 0,
          size: limit,
          fields: [
            "name",
            "webUrl",
            "lastModifiedDateTime",
            "createdBy",
            "fileType"
          ]
        }]
      });
    
    // Format results
    const results = searchResults.value[0].hitsContainers[0].hits.map((hit: any) => ({
      title: hit.resource.name,
      link: hit.resource.webUrl,
      snippet: hit.summary || 'No summary available',
      lastModified: hit.resource.lastModifiedDateTime,
      author: hit.resource.createdBy?.user?.displayName || 'Unknown',
      fileType: hit.resource.fileType
    }));
    
    return results;
  } catch (error: any) {
    // Handle specific error types
    if (error.statusCode === 403) {
      throw new Error('Access denied to SharePoint. Check your permissions.');
    } else if (error.statusCode === 404) {
      throw new Error('SharePoint resource not found. Check site/list IDs.');
    } else {
      console.error('SharePoint search error:', error);
      throw new Error('Failed to search SharePoint documents');
    }
  }
}

export default {
  fetchSharePointDocuments,
  searchSharePoint
};
