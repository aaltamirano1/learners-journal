'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://aaltamirano1:crashfest2@ds119930.mlab.com:19930/learners-journal';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/learners-journal-test';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';