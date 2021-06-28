module.exports = {
  packagerConfig: {
    asar: true,
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {}
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        format: "ULFO"
      },
      platforms: [
        "darwin"
      ]
    },
    {
      name: "@electron-forge/maker-deb",
      config: {}
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {}
    }
  ]
}