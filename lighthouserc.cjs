module.exports = {
  ci: {
    collect: {
      staticDistDir: './out',
      url: [
        'http://localhost/',
        'http://localhost/calculator/',
        'http://localhost/apply/',
        'http://localhost/faq/',
        'http://localhost/about/',
        'http://localhost/double-charge/',
        'http://localhost/check/netflix/',
        'http://localhost/check/canva/',
      ],
      numberOfRuns: 3,
      settings: {
        formFactor: 'mobile',
        chromeFlags: '--no-sandbox --headless',
        onlyCategories: ['performance', 'accessibility', 'seo'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 1 }],
      },
    },
    upload: { target: 'filesystem', outputDir: './.lighthouseci/reports' },
  },
};
