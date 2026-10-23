module.exports = {
  ci: {
    collect: {
      staticDistDir: './out',
      url: [
        'http://localhost/',
        'http://localhost/calculator/',
        'http://localhost/apply/',
        'http://localhost/faq/',
      ],
      numberOfRuns: 3,
      settings: { formFactor: 'mobile', chromeFlags: '--no-sandbox --headless' },
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
