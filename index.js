/**
 * NSTT Audit – Grade Zero Hallucination Governance Package
 * Main entry point for the governance package
 */

module.exports = {
  // Core modules
  agent: require('./agent.js'),
  validator: require('./validator.js'),
  harness: require('./harness.js'),
  schema: require('./schema.js'),
  canonical: require('./canonical.js'),
  chain: require('./chain.js'),
  
  // Version info
  version: require('./package.json').version,
  
  // Export test utilities
  runTests: function() {
    console.log('NSTT GZHG - Running compliance tests...');
    return require('./grade-zero.test.js');
  }
};
