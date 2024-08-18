module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/test/infra'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
