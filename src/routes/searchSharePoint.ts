import { Router } from 'express';
import { searchSharePoint } from '../services/sharepointConnector';

const router = Router();

/**
 * Endpoint to search SharePoint with metadata filters.
 */
router.post('/', async (req, res) => {
  try {
    const { query, team, author, fileType, modifiedAfter, limit } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Convert date string to Date object if provided
    const modifiedDate = modifiedAfter ? new Date(modifiedAfter) : undefined;
    
    const results = await searchSharePoint(query, {
      team,
      author,
      fileType,
      modifiedAfter: modifiedDate,
      limit: limit || 10
    });
    
    res.json({ results });
  } catch (error: any) {
    console.error('Search route error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to search SharePoint' 
    });
  }
});

export default router;
