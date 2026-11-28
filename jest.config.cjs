/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    modulePathIgnorePatterns: ['<rootDir>/archive/', '<rootDir>/dist/'],
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        html: '<!DOCTYPE html><html lang="en"></html>',
    },
};
