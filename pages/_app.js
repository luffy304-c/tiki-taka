import {CatalogProvider} from '../lib/catalog';
// pages/_app.js
import Layout from '../components/Layout';
import '../styles/globals.css';
import {LocalizedMetadata} from '../lib/i18n';

export default function App({ Component, pageProps }) {
  return (
    <><LocalizedMetadata/><CatalogProvider><Layout>
      <Component {...pageProps} />
    </Layout></CatalogProvider></>
  );
}
