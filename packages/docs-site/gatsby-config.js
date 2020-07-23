module.exports = {
  siteMetadata: {
    siteTitle: `Capacitor Community Electron Platform Docs`,
    defaultTitle: `Capacitor Community Electron Platform Docs`,
    siteTitleShort: `cap-community-electron-docs`,
    siteDescription: `Deploy your Capacitor apps to Linux, Mac, and Windows desktops, with the Electron platform! 🖥️`,
    siteUrl: `https://rocketdocs.netlify.com`,
    siteAuthor: `@IT-MikeS`,
    siteImage: `/banner.png`,
    siteLanguage: `en`,
    themeColor: `#53b9ff`,
    basePath: `/`,
    footer: `Theme by Rocketseat`,
  },
  plugins: [
    {
      resolve: `@rocketseat/gatsby-theme-docs`,
      options: {
        configPath: `src/config`,
        docsPath: `src/docs`,
        githubUrl: `https://github.com/rocketseat/gatsby-themes`,
        baseDir: `examples/gatsby-theme-docs`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Rocketseat Gatsby Themes`,
        short_name: `RS Gatsby Themes`,
        start_url: `/`,
        background_color: `#ffffff`,
        display: `standalone`,
        icon: `static/favicon.png`,
      },
    },
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        // trackingId: ``,
      },
    },
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: `https://rocketdocs.netlify.com`,
      },
    },
    `gatsby-plugin-offline`,
  ],
};
