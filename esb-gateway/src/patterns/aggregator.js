import fetch from 'node-fetch'; // Requires node-fetch (or native fetch in Node 18+)

export async function dashboardAggregator(req, res) {
  // Aggregator pattern fan-out to Academic, Finance, and Library
  const nim = req.user?.nim || 'dummy_nim'; // Extracted from auth header ideally

  try {
    // Fire requests concurrently with a timeout constraint
    const [academicResponse, financeResponse, libraryResponse] = await Promise.allSettled([
      fetch(\`http://localhost:8002/health\`, { signal: AbortSignal.timeout(800) }),
      fetch(\`http://localhost:8003/health\`, { signal: AbortSignal.timeout(800) }),
      fetch(\`http://localhost:8004/health\`, { signal: AbortSignal.timeout(800) })
    ]);

    const dashboardData = {
      academic: academicResponse.status === 'fulfilled' ? 'Academic Data OK' : 'Academic Data Unavailable',
      finance: financeResponse.status === 'fulfilled' ? 'Finance Data OK' : 'Finance Data Unavailable',
      library: libraryResponse.status === 'fulfilled' ? 'Library Data OK' : 'Library Data Unavailable'
    };

    res.json({
      status: 'success',
      data: dashboardData,
      meta: { timestamp: new Date().toISOString() },
      errors: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      meta: { timestamp: new Date().toISOString() },
      errors: [{ code: 'AGGREGATION_FAILED', detail: error.message }]
    });
  }
}
