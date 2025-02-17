export default {
  transform: {
    "^.+\\.js$": "babel-jest", // Use babel-jest to handle JavaScript files
  },
  testEnvironment: "jest-environment-jsdom", // Reference the newly installed jsdom environment
  moduleFileExtensions: ["js", "json"],
};
