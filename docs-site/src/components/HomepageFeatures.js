import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Capacitor Plugins',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Use your favorite Capacitor plugins with the desktop!
      </>
    ),
  },
  {
    title: 'Easy Configuration',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Simple object configuration, where the platform takes care of the heavy lifting.
      </>
    ),
  },
  {
    title: 'Typescript',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Leverage Typescript in an electron project!
      </>
    ),
  },
  {
    title: 'Electron',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        At the end of it, the app is still Electron and the platform wont get in the way of the development flow Electron apps have.
      </>
    ),
  },
  {
    title: 'Build Defaults',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Enjoy preset build defaults and runner scripts via Electron-Builder.
      </>
    ),
  },
  {
    title: 'Much More',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        So much more on top of everything else! 
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
