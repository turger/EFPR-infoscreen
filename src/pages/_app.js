// _app.js is a special file that is used to wrap the entire application. This file is used to persist layout between pages.
import '../app/globals.css';

export default function App({Component, pageProps}) {
    return <Component {...pageProps} />;
}
