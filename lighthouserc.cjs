module.exports = {
  ci: {
    collect: { staticDistDir: './dist', numberOfRuns: 3, settings: { formFactor: 'mobile', throttling: { cpuSlowdownMultiplier: 4 } } },
    assert: { assertions: {
      'categories:performance': ['error', { minScore: 0.9 }],
      'categories:accessibility': ['error', { minScore: 0.95 }],
      'categories:best-practices': ['error', { minScore: 0.95 }],
      'categories:seo': ['error', { minScore: 0.95 }],
      'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
      'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      'total-blocking-time': ['error', { maxNumericValue: 200 }],
      'resource-summary:total:size': ['error', { maxNumericValue: 800000 }],
      'resource-summary:script:size': ['error', { maxNumericValue: 60000 }],
      'resource-summary:stylesheet:size': ['error', { maxNumericValue: 40000 }],
    } },
    upload: { target: 'filesystem', outputDir: '.lighthouseci/report' },
  },
};
